import { Meteor } from "meteor/meteor";
import { PushTokens, Notifications, NOTIFICATION_STATUS } from "../../api/notifications/Notifications";
import { OneSignalService } from "./OneSignalService";

/**
 * Push Notification Service
 * Unified service that supports multiple backends: Firebase FCM and OneSignal
 *
 * Backend Selection:
 * Set NOTIFICATION_BACKEND environment variable to:
 * - 'firebase' (default) - Uses Firebase Cloud Messaging
 * - 'onesignal' - Uses OneSignal service
 *
 * Firebase Setup:
 * 1. Install firebase-admin: meteor npm install firebase-admin
 * 2. Set environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *
 * OneSignal Setup:
 * 1. Install onesignal-node: meteor npm install onesignal-node
 * 2. Set environment variables: ONESIGNAL_APP_ID, ONESIGNAL_API_KEY
 */

class PushNotificationServiceClass {
  constructor() {
    this.isInitialized = false;
    this.admin = null;
    this.backend = process.env.NOTIFICATION_BACKEND || "firebase";
    this.initializeService();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  async initializeService() {
    try {
      // Check if required environment variables are set
      const requiredEnvVars = [
        "FIREBASE_PROJECT_ID",
        "FIREBASE_CLIENT_EMAIL",
        "FIREBASE_PRIVATE_KEY",
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        console.warn(`[Push] Missing environment variables: ${missingVars.join(", ")}`);
        console.warn("[Push] Push notifications will not be functional");
        return;
      }

      // Dynamic import of firebase-admin (install with: meteor npm install firebase-admin)
      try {
        // eslint-disable-next-line global-require
        this.admin = require("firebase-admin");
      } catch (error) {
        console.warn("[Push] firebase-admin package not installed. Run: meteor npm install firebase-admin");
        return;
      }

      // Initialize Firebase Admin if not already done
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
   * Send push notification to a specific user
   */
  async sendToUser(userId, notification) {
    // Route to appropriate backend
    if (this.backend === "onesignal") {
      return OneSignalService.sendToUser(userId, notification);
    }

    // Firebase implementation
    if (!this.isInitialized) {
      console.warn("[Push] Firebase service not initialized, skipping notification");
      return { success: false, error: "Service not initialized" };
    }

    try {
      // Get user's active push tokens
      const tokens = await PushTokens.find({
        userId,
        isActive: true,
      }).fetchAsync();

      if (tokens.length === 0) {
        return { success: false, error: "No active tokens" };
      }

      const results = [];

      // Send to each platform
      for (const tokenDoc of tokens) { // eslint-disable-line no-restricted-syntax
        try {
          const result = await this.sendToToken(tokenDoc, notification);
          results.push({
            platform: tokenDoc.platform,
            success: result.success,
            error: result.error,
          });

          // Update token last used time on successful send
          if (result.success) {
            await PushTokens.updateAsync(tokenDoc._id, {
              $set: { lastUsedAt: new Date() },
            });
          }

        } catch (error) {
          console.error(`[Push] Failed to send to token ${tokenDoc._id}:`, error);
          results.push({
            platform: tokenDoc.platform,
            success: false,
            error: error.message,
          });
        }
      }

      // Update notification status
      if (notification.notificationId) {
        const hasSuccess = results.some(r => r.success);
        await Notifications.updateAsync(notification.notificationId, {
          $set: {
            status: hasSuccess ? NOTIFICATION_STATUS.SENT : NOTIFICATION_STATUS.FAILED,
            sentAt: hasSuccess ? new Date() : undefined,
            errorMessage: hasSuccess ? undefined : results.map(r => r.error).join(", "),
            deviceTokens: tokens.map(t => t.token),
          },
          $inc: { attempts: 1 },
        });
      }

      return { success: results.some(r => r.success), results };

    } catch (error) {
      console.error(`[Push] Failed to send notification to user ${userId}:`, error);

      // Update notification status on error
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
   * Send notification to a specific device token
   */
  async sendToToken(tokenDoc, notification) {
    try {
      const message = this.buildMessage(tokenDoc, notification);

      const response = await this.admin.messaging().send(message);

      return { success: true, response };

    } catch (error) {
      console.error(`[Push] Failed to send to ${tokenDoc.platform} token:`, error);

      // Handle invalid token errors
      if (error.code === "messaging/registration-token-not-registered" ||
          error.code === "messaging/invalid-registration-token") {

        await PushTokens.updateAsync(tokenDoc._id, {
          $set: { isActive: false },
        });
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Build platform-specific message
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

    // Platform-specific configuration
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
    } else if (tokenDoc.platform === "web") {
      baseMessage.webpush = {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: "/icon-192x192.png",
          badge: "/badge-72x72.png",
          requireInteraction: notification.priority === "urgent",
          actions: notification.actions || [],
        },
      };
    }

    return baseMessage;
  }

  /**
   * Send notification to multiple users in batch
   */
  async sendToUsers(userIds, notification) {
    // Route to appropriate backend
    if (this.backend === "onesignal") {
      return OneSignalService.sendToUsers(userIds, notification);
    }

    // Firebase implementation
    const results = [];

    // Send in batches to avoid overwhelming the service
    const batchSize = 10;

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);

      const batchPromises = batch.map(userId => this.sendToUser(userId, notification));

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        results.push({
          userId: batch[index],
          success: result.status === "fulfilled" && result.value.success,
          error: result.status === "rejected" ? result.reason : result.value?.error,
        });
      });

      // Small delay between batches
      if (i + batchSize < userIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
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

      const result = await PushTokens.removeAsync({
        isActive: false,
        lastUsedAt: { $lt: cutoffDate },
      });

      return result;

    } catch (error) {
      console.error("[Push] Token cleanup failed:", error);
      return 0;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    const baseStatus = {
      backend: this.backend,
      initialized: this.isInitialized,
    };

    if (this.backend === "onesignal") {
      return {
        ...baseStatus,
        ...OneSignalService.getStatus(),
      };
    }

    // Firebase status
    return {
      ...baseStatus,
      hasFirebase: !!this.admin,
      environment: {
        hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      },
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
