import { Meteor } from "meteor/meteor";
import { PushTokens, Notifications, NOTIFICATION_STATUS } from "../../api/notifications/Notifications";

/**
 * Web Push Service using VAPID
 * Handles browser-based push notifications using the Web Push Protocol
 *
 * Setup Instructions:
 * 1. Generate VAPID keys: npm install -g web-push && web-push generate-vapid-keys
 * 2. Install web-push: meteor npm install web-push
 * 3. Set environment variables:
 *    - VAPID_PUBLIC_KEY
 *    - VAPID_PRIVATE_KEY
 *    - VAPID_SUBJECT (mailto:your-email@domain.com)
 * 4. Add public key to Meteor settings.json
 */

class WebPushServiceClass {
  constructor() {
    this.isInitialized = false;
    this.webpush = null;
    this.initializeService();
  }

  /**
   * Initialize Web Push with VAPID keys
   */
  async initializeService() {
    try {
      // Check if required environment variables are set
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
      const vapidSubject = process.env.VAPID_SUBJECT;

      if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
        console.warn("[WebPush] Missing VAPID configuration variables");
        console.warn("[WebPush] Required: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT");
        console.warn("[WebPush] Generate keys with: npx web-push generate-vapid-keys");
        return;
      }

      // Dynamic import of web-push (install with: meteor npm install web-push)
      try {
        // eslint-disable-next-line global-require
        this.webpush = require("web-push");
      } catch (error) {
        console.warn("[WebPush] web-push package not installed. Run: meteor npm install web-push");
        return;
      }

      // Set VAPID details
      this.webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey,
      );

      this.isInitialized = true;
      console.log("[WebPush] Service initialized with VAPID keys");

    } catch (error) {
      console.error("[WebPush] Failed to initialize service:", error);
      this.isInitialized = false;
    }
  }

  /**
   * Send web push notification to a specific user
   */
  async sendToUser(userId, notification) {
    if (!this.isInitialized) {
      console.warn("[WebPush] Service not initialized, skipping notification");
      return { success: false, error: "Service not initialized" };
    }

    try {
      // Get user's web push subscriptions
      const subscriptions = await PushTokens.find({
        userId,
        platform: "web",
        isActive: true,
      }).fetchAsync();

      if (subscriptions.length === 0) {
        console.log(`[WebPush] No web push subscriptions found for user ${userId}`);
        return { success: false, error: "No subscriptions" };
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon || "/icon-192x192.png",
        badge: notification.badge || "/icon-72x72.png",
        data: notification.data || {},
        tag: notification.tag,
        requireInteraction: notification.priority === "high",
        actions: notification.actions || [],
      });

      const options = {
        TTL: notification.ttl || 24 * 60 * 60, // 24 hours default
        priority: notification.priority === "high" ? "high" : "normal",
        topic: notification.topic,
        urgency: notification.priority === "high" ? "high" : "normal",
      };

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      // Send to all user's subscriptions
      for (const sub of subscriptions) { // eslint-disable-line no-restricted-syntax
        try {
          const pushSubscription = JSON.parse(sub.token);

          const result = await this.webpush.sendNotification(
            pushSubscription,
            payload,
            options,
          );

          results.push({
            subscriptionId: sub._id,
            success: true,
            status: result.statusCode,
          });

          successCount++;

        } catch (error) {
          console.error(`[WebPush] Failed to send to subscription ${sub._id}:`, error);

          // Handle expired subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`[WebPush] Subscription ${sub._id} is invalid, deactivating...`);
            await PushTokens.updateAsync(
              { _id: sub._id },
              { $set: { isActive: false, deactivatedAt: new Date() } },
            );
          }

          results.push({
            subscriptionId: sub._id,
            success: false,
            error: error.message,
            statusCode: error.statusCode,
          });

          failureCount++;
        }
      }

      // Update notification status
      if (notification.notificationId) {
        const hasSuccess = successCount > 0;
        await this.updateNotificationStatus(
          notification.notificationId,
          { results, successCount, failureCount },
          hasSuccess,
        );
      }

      console.log(`[WebPush] Sent to user ${userId}: ${successCount} success, ${failureCount} failed`);

      return {
        success: successCount > 0,
        results,
        successCount,
        failureCount,
      };

    } catch (error) {
      console.error(`[WebPush] Failed to send notification to user ${userId}:`, error);

      // Update notification status on error
      if (notification.notificationId) {
        await this.updateNotificationStatus(notification.notificationId, null, false, error.message);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds, notification) {
    if (!this.isInitialized) {
      console.warn("[WebPush] Service not initialized, skipping notification");
      return { success: false, error: "Service not initialized" };
    }

    const results = [];
    let totalSuccess = 0;
    let totalFailure = 0;

    for (const userId of userIds) { // eslint-disable-line no-restricted-syntax
      const result = await this.sendToUser(userId, notification);
      results.push({ userId, ...result });

      if (result.success) {
        totalSuccess += result.successCount || 1;
      } else {
        totalFailure += result.failureCount || 1;
      }
    }

    return {
      success: totalSuccess > 0,
      results,
      totalSuccess,
      totalFailure,
      userCount: userIds.length,
    };
  }

  /**
   * Update notification status in database
   */
  async updateNotificationStatus(notificationId, response, success, errorMessage = null) {
    try {
      const setFields = {
        status: success ? NOTIFICATION_STATUS.SENT : NOTIFICATION_STATUS.FAILED,
        sentAt: success ? new Date() : undefined,
        response: response ? JSON.stringify(response) : undefined,
        error: errorMessage || undefined,
      };

      const incFields = {};
      if (response?.successCount) {
        incFields.successCount = response.successCount;
      }
      if (response?.failureCount) {
        incFields.failureCount = response.failureCount;
      }

      const updateDoc = { $set: setFields };
      if (Object.keys(incFields).length > 0) {
        updateDoc.$inc = incFields;
      }

      await Notifications.updateAsync({ _id: notificationId }, updateDoc);

    } catch (error) {
      console.error("[WebPush] Failed to update notification status:", error);
    }
  }

  /**
   * Get VAPID public key for client configuration
   */
  getVapidPublicKey() {
    return process.env.VAPID_PUBLIC_KEY;
  }

  /**
   * Clean up expired subscriptions
   */
  async cleanupExpiredSubscriptions() {
    try {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

      const result = await PushTokens.removeAsync({
        platform: "web",
        isActive: false,
        deactivatedAt: { $lt: cutoffDate },
      });

      console.log(`[WebPush] Cleaned up ${result} expired subscriptions`);
      return result;

    } catch (error) {
      console.error("[WebPush] Cleanup failed:", error);
      return 0;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      hasWebPush: !!this.webpush,
      environment: {
        hasVapidPublicKey: !!process.env.VAPID_PUBLIC_KEY,
        hasVapidPrivateKey: !!process.env.VAPID_PRIVATE_KEY,
        hasVapidSubject: !!process.env.VAPID_SUBJECT,
      },
    };
  }
}

// Export singleton instance
export const WebPushService = new WebPushServiceClass();

// Setup periodic cleanup (run every 24 hours)
if (Meteor.isServer) {
  const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  Meteor.setInterval(() => {
    WebPushService.cleanupExpiredSubscriptions();
  }, CLEANUP_INTERVAL);
}

// Export for testing
export { WebPushServiceClass };
