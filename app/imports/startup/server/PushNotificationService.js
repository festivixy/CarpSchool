import { Meteor } from "meteor/meteor";
import { PushTokens, Notifications, NOTIFICATION_STATUS } from "../../api/notifications/Notifications";
import { OneSignalService } from "./OneSignalService";

/**
 * Push Notification Service
 *
 * Routes each of a user's device tokens to the backend that issued it:
 * - "onesignal" rows (OneSignal player / subscription ids) -> OneSignalService
 * - "ios" / "android" rows (FCM registration tokens) -> Firebase, when configured
 * - "web" rows were VAPID Web Push subscriptions; that backend is gone, so they
 *   are deactivated the first time they are seen
 *
 * A token is only ever deactivated by the backend that owns it, so a
 * misconfigured or missing backend never destroys a valid token.
 *
 * Firebase Setup:
 * 1. Install firebase-admin: meteor npm install firebase-admin
 * 2. Set environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

const FCM_PLATFORMS = new Set(["ios", "android"]);
const FCM_INVALID_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

function isOneSignalToken(tokenDoc) {
  return tokenDoc.platform === "onesignal" || !!tokenDoc.deviceInfo?.oneSignalPlayerId;
}

class PushNotificationServiceClass {
  constructor() {
    this.isInitialized = false;
    this.admin = null;
    this.initializeService();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  async initializeService() {
    try {
      const requiredEnvVars = [
        "FIREBASE_PROJECT_ID",
        "FIREBASE_CLIENT_EMAIL",
        "FIREBASE_PRIVATE_KEY",
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        console.warn(`[Push] Firebase not configured (missing ${missingVars.join(", ")}); FCM tokens will be skipped`);
        return;
      }

      try {
        // eslint-disable-next-line global-require
        this.admin = require("firebase-admin");
      } catch (error) {
        console.warn("[Push] firebase-admin package not installed. Run: meteor npm install firebase-admin");
        return;
      }

      if (!this.admin.apps.length) {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        };

        this.admin.initializeApp({
          credential: this.admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      }

      this.isInitialized = true;

    } catch (error) {
      console.error("[Push] Failed to initialize push notification service:", error);
      this.isInitialized = false;
    }
  }

  /**
   * Send push notification to a specific user, fanning out per token platform.
   */
  async sendToUser(userId, notification) {
    try {
      const tokens = await PushTokens.find({ userId, isActive: true }).fetchAsync();

      if (tokens.length === 0) {
        return { success: false, error: "No active tokens" };
      }

      const oneSignalTokens = tokens.filter(isOneSignalToken);
      const fcmTokens = tokens.filter(t => !isOneSignalToken(t) && FCM_PLATFORMS.has(t.platform));
      const webTokens = tokens.filter(t => !isOneSignalToken(t) && t.platform === "web");

      const results = [];

      if (webTokens.length > 0) {
        // Web Push (VAPID) was removed; these subscriptions can no longer be
        // used by anything, so retire them.
        await PushTokens.updateAsync(
          { _id: { $in: webTokens.map(t => t._id) } },
          { $set: { isActive: false, deactivatedAt: new Date(), deactivationReason: "webpush_removed" } },
          { multi: true },
        );
      }

      if (oneSignalTokens.length > 0) {
        const result = await OneSignalService.sendToUser(userId, notification);
        results.push({ platform: "onesignal", success: !!result.success, error: result.error });
      }

      for (const tokenDoc of fcmTokens) { // eslint-disable-line no-restricted-syntax
        results.push(await this.sendToFcmToken(tokenDoc, notification));
      }

      // OneSignalService updates the status itself; only do it here when FCM
      // was the sole path, so a OneSignal "sent" is not overwritten.
      if (notification.notificationId && oneSignalTokens.length === 0) {
        const hasSuccess = results.some(r => r.success);
        await Notifications.updateAsync(notification.notificationId, {
          $set: {
            status: hasSuccess ? NOTIFICATION_STATUS.SENT : NOTIFICATION_STATUS.FAILED,
            sentAt: hasSuccess ? new Date() : undefined,
            errorMessage: hasSuccess ? undefined : results.map(r => r.error).filter(Boolean).join(", "),
          },
          $inc: { attempts: 1 },
        });
      }

      return { success: results.some(r => r.success), results };

    } catch (error) {
      console.error(`[Push] Failed to send notification to user ${userId}:`, error);

      if (notification.notificationId) {
        await Notifications.updateAsync(notification.notificationId, {
          $set: {
            status: NOTIFICATION_STATUS.FAILED,
            errorMessage: error.message,
          },
          $inc: { attempts: 1 },
        });
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send one FCM token through Firebase. Skipped (token untouched) when
   * Firebase is not configured.
   */
  async sendToFcmToken(tokenDoc, notification) {
    if (!this.isInitialized) {
      return { platform: tokenDoc.platform, success: false, error: "Firebase not configured" };
    }

    try {
      const message = this.buildMessage(tokenDoc, notification);
      const response = await this.admin.messaging().send(message);

      await PushTokens.updateAsync(tokenDoc._id, { $set: { lastUsedAt: new Date() } });

      return { platform: tokenDoc.platform, success: true, response };

    } catch (error) {
      console.error(`[Push] Failed to send to ${tokenDoc.platform} token:`, error);

      // Only Firebase's own verdict on a Firebase token retires it.
      if (FCM_INVALID_TOKEN_CODES.has(error.code)) {
        await PushTokens.updateAsync(tokenDoc._id, {
          $set: { isActive: false, deactivatedAt: new Date(), deactivationReason: "fcm_invalid" },
        });
      }

      return { platform: tokenDoc.platform, success: false, error: error.message };
    }
  }

  /**
   * Build platform-specific FCM message
   */
  buildMessage(tokenDoc, notification) {
    const baseMessage = {
      token: tokenDoc.token,
      data: {
        // All data must be strings for FCM
        notificationId: notification.notificationId || "",
        type: notification.type || "",
        ...Object.fromEntries(
          Object.entries(notification.data || {}).map(([k, v]) => [k, String(v)]),
        ),
      },
    };

    if (tokenDoc.platform === "ios") {
      baseMessage.apns = {
        headers: {
          "apns-priority": notification.priority === "urgent" ? "10" : "5",
        },
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body,
            },
            badge: notification.badge || 1,
            sound: notification.sound || "default",
            category: notification.category,
            "thread-id": notification.threadId,
          },
        },
      };
    } else if (tokenDoc.platform === "android") {
      baseMessage.android = {
        priority: notification.priority === "urgent" ? "high" : "normal",
        notification: {
          title: notification.title,
          body: notification.body,
          icon: "ic_notification",
          color: "#000000",
          sound: notification.sound || "default",
          tag: notification.tag,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
      };
    }

    return baseMessage;
  }

  /**
   * Send notification to multiple users in batch
   */
  async sendToUsers(userIds, notification) {
    const results = [];
    const batchSize = 10;

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map(userId => this.sendToUser(userId, notification)),
      );

      batchResults.forEach((result, index) => {
        results.push({
          userId: batch[index],
          success: result.status === "fulfilled" && result.value.success,
          error: result.status === "rejected" ? result.reason : result.value?.error,
        });
      });

      if (i + batchSize < userIds.length) {
        await new Promise(resolve => { setTimeout(resolve, 100); });
      }
    }

    return results;
  }

  /**
   * Send test notification (for debugging)
   */
  async sendTestNotification(userId) {
    return this.sendToUser(userId, {
      title: "Test Notification",
      body: "This is a test notification from Carp School",
      data: { test: true },
      priority: "normal",
    });
  }

  /**
   * Clean up inactive tokens
   */
  async cleanupInactiveTokens() {
    try {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

      return await PushTokens.removeAsync({
        isActive: false,
        lastUsedAt: { $lt: cutoffDate },
      });

    } catch (error) {
      console.error("[Push] Token cleanup failed:", error);
      return 0;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      firebase: {
        initialized: this.isInitialized,
        hasFirebase: !!this.admin,
        environment: {
          hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
          hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
          hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        },
      },
      oneSignal: OneSignalService.getStatus(),
    };
  }
}

// Export singleton instance
export const PushNotificationService = new PushNotificationServiceClass();

// Setup periodic cleanup (run every 6 hours)
if (Meteor.isServer) {
  const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

  Meteor.setInterval(() => {
    PushNotificationService.cleanupInactiveTokens();
  }, CLEANUP_INTERVAL);
}

// Export for testing
export { PushNotificationServiceClass };
