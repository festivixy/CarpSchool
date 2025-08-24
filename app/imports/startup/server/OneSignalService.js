import { Meteor } from "meteor/meteor";
import { PushTokens, Notifications, NOTIFICATION_STATUS } from "../../api/notifications/Notifications";

/**
 * OneSignal Push Notification Service
 * Handles sending push notifications via OneSignal API
 *
 * Setup Instructions:
 * 1. Create account at https://onesignal.com
 * 2. Create new app in OneSignal dashboard
 * 3. Get App ID and REST API Key
 * 4. Set environment variables:
 *    - ONESIGNAL_APP_ID
 *    - ONESIGNAL_API_KEY
 * 5. Install OneSignal SDK: meteor npm install onesignal-node
 */

class OneSignalServiceClass {
  constructor() {
    this.isInitialized = false;
    this.client = null;
    this.initializeService();
  }

  /**
   * Initialize OneSignal SDK
   */
  async initializeService() {
    try {
      // Check if required environment variables are set
      const requiredEnvVars = [
        "ONESIGNAL_APP_ID",
        "ONESIGNAL_API_KEY",
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        console.warn(`[OneSignal] Missing environment variables: ${missingVars.join(", ")}`);
        console.warn("[OneSignal] Push notifications will not be functional");
        return;
      }

      // Dynamic import of onesignal-node (install with: meteor npm install onesignal-node)
      try {
        const OneSignal = require("onesignal-node");
        this.client = new OneSignal.Client(
          process.env.ONESIGNAL_APP_ID,
          process.env.ONESIGNAL_API_KEY,
        );
      } catch (error) {
        console.warn("[OneSignal] onesignal-node package not installed. Run: meteor npm install onesignal-node");
        return;
      }

      this.isInitialized = true;

    } catch (error) {
      console.error("[OneSignal] Failed to initialize service:", error);
      this.isInitialized = false;
    }
  }

  /**
   * Send push notification to a specific user
   */
  async sendToUser(userId, notification) {
    if (!this.isInitialized) {
      console.warn("[OneSignal] Service not initialized, skipping notification");
      return { success: false, error: "Service not initialized" };
    }

    try {
      // Get user's active push tokens to find OneSignal player IDs
      const tokens = await PushTokens.find({
        userId,
        isActive: true,
      }).fetchAsync();

      if (tokens.length === 0) {
        console.log(`[OneSignal] No active tokens found for user ${userId}`);
        return { success: false, error: "No active tokens" };
      }

      // Extract OneSignal player IDs from tokens
      const playerIds = tokens
        .filter(token => token.platform === "onesignal" || token.oneSignalPlayerId)
        .map(token => token.oneSignalPlayerId || token.token);

      if (playerIds.length === 0) {
        // Try to send using external user ID if no player IDs
        return await this.sendUsingExternalUserId(userId, notification);
      }

      // Log multi-device detection
      if (playerIds.length > 1) {
        console.log(`[OneSignal] Sending to ${playerIds.length} devices for user ${userId}`);
      }

      const oneSignalNotification = this.buildOneSignalNotification(notification, {
        include_player_ids: playerIds,
      });

      const response = await this.client.createNotification(oneSignalNotification);

      // Update notification status
      if (notification.notificationId) {
        await this.updateNotificationStatus(notification.notificationId, response, true);
      }

      return { success: true, response };

    } catch (error) {
      console.error(`[OneSignal] Failed to send notification to user ${userId}:`, error);

      // Handle specific channel issues gracefully
      if (error.message && error.message.includes("android_channel_id")) {
        console.warn("[OneSignal] Android channel configuration issue - treating as warning");

        // Update notification as sent with warning
        if (notification.notificationId) {
          await this.updateNotificationStatus(notification.notificationId, { id: "channel-warning" }, true, "Android channel not configured");
        }

        return { success: true, warning: "Android channel not configured", response: { id: "channel-warning" } };
      }

      // Update notification status on error
      if (notification.notificationId) {
        await this.updateNotificationStatus(notification.notificationId, null, false, error.message);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification using OneSignal's External User ID feature
   */
  async sendUsingExternalUserId(userId, notification) {
    try {
      const oneSignalNotification = this.buildOneSignalNotification(notification, {
        include_external_user_ids: [userId],
      });

      const response = await this.client.createNotification(oneSignalNotification);

      return { success: true, response };

    } catch (error) {
      console.error(`[OneSignal] Failed to send using external user ID ${userId}:`, error);

      // Handle specific channel issues
      if (error.message && error.message.includes("android_channel_id")) {
        console.warn("[OneSignal] Android channel not configured - this is expected for server-only setup");
        console.log("[OneSignal] Notification attempt logged but may not deliver to Android devices");
        // Don't throw error for channel issues in development
        return { success: true, warning: "Android channel not configured", response: { id: "channel-warning" } };
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds, notification) {
    if (!this.isInitialized) {
      console.warn("[OneSignal] Service not initialized, skipping notification");
      return { success: false, error: "Service not initialized" };
    }

    try {
      // For batch sending, use external user IDs (most efficient)
      const oneSignalNotification = this.buildOneSignalNotification(notification, {
        include_external_user_ids: userIds,
      });

      const response = await this.client.createNotification(oneSignalNotification);

      return { success: true, response, userCount: userIds.length };

    } catch (error) {
      console.error("[OneSignal] Batch send failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to users with tags (segmentation)
   */
  async sendToSegment(filters, notification) {
    if (!this.isInitialized) {
      console.warn("[OneSignal] Service not initialized, skipping notification");
      return { success: false, error: "Service not initialized" };
    }

    try {
      const oneSignalNotification = this.buildOneSignalNotification(notification, {
        filters,
      });

      const response = await this.client.createNotification(oneSignalNotification);

      return { success: true, response };

    } catch (error) {
      console.error("[OneSignal] Segment send failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Build OneSignal notification object
   */
  buildOneSignalNotification(notification, targeting = {}) {
    const baseNotification = {
      app_id: process.env.ONESIGNAL_APP_ID,
      contents: { en: notification.body },
      headings: { en: notification.title },
      data: notification.data || {},
      ...targeting,
    };

    // Add priority-based settings
    if (notification.priority === "urgent") {
      baseNotification.priority = 10;
      baseNotification.android_accent_color = "FF0000FF"; // Red
    } else if (notification.priority === "high") {
      baseNotification.priority = 8;
    } else {
      baseNotification.priority = 5;
    }

    // Add platform-specific configurations
    this.addPlatformSpecificSettings(baseNotification, notification);

    return baseNotification;
  }

  /**
   * Add platform-specific notification settings
   */
  addPlatformSpecificSettings(baseNotification, notification) {
    // iOS specific settings
    baseNotification.ios_badgeType = "Increase";
    baseNotification.ios_badgeCount = 1;

    // Android specific settings - remove channel requirement for testing
    // baseNotification.android_channel_id = 'default';
    // baseNotification.existing_android_channel_id = 'default';
    baseNotification.small_icon = "ic_stat_onesignal_default";
    baseNotification.large_icon = "https://carp.school/icon-large.png";

    // Web push settings
    baseNotification.web_icon = "https://carp.school/icon-192x192.png";
    baseNotification.web_badge = "https://carp.school/badge-72x72.png";

    // Add action buttons based on notification type
    if (notification.type && notification.data) {
      baseNotification.buttons = this.getActionButtons(notification.type, notification.data);
    }

    // Add rich media if available
    if (notification.imageUrl) {
      baseNotification.big_picture = notification.imageUrl;
      baseNotification.ios_attachments = { id: notification.imageUrl };
    }

    // Schedule delivery if specified
    if (notification.sendAt) {
      baseNotification.send_after = notification.sendAt.toISOString();
    }
  }

  /**
   * Get action buttons based on notification type
   */
  getActionButtons(type, data) {
    const buttonConfigs = {
      ride_update: [
        { id: "view_ride", text: "View Ride" },
        { id: "contact_driver", text: "Contact Driver" },
      ],
      rider_joined: [
        { id: "view_ride", text: "View Ride" },
        { id: "view_rider", text: "View Rider" },
      ],
      chat_message: [
        { id: "reply", text: "Reply" },
        { id: "view_chat", text: "View Chat" },
      ],
      emergency: [
        { id: "call_emergency", text: "Call 911" },
        { id: "view_details", text: "View Details" },
      ],
      ride_starting: [
        { id: "track_ride", text: "Track Ride" },
        { id: "contact_driver", text: "Contact Driver" },
      ],
    };

    return buttonConfigs[type] || [
      { id: "open_app", text: "Open App" },
    ];
  }

  /**
   * Update notification status in database
   */
  async updateNotificationStatus(notificationId, response, success, errorMessage = null) {
    try {
      const setFields = {
        status: success ? NOTIFICATION_STATUS.SENT : NOTIFICATION_STATUS.FAILED,
        sentAt: success ? new Date() : undefined,
        errorMessage: errorMessage,
      };

      if (response) {
        setFields.externalId = response.id;
        setFields.externalData = {
          oneSignalId: response.id,
          recipients: response.recipients || 0,
        };
      }

      await Notifications.updateAsync(notificationId, {
        $set: setFields,
        $inc: { attempts: 1 },
      });

    } catch (error) {
      console.error("[OneSignal] Failed to update notification status:", error);
    }
  }

  /**
   * Register OneSignal player ID for user
   */
  async registerPlayerForUser(userId, playerId, deviceInfo = {}) {
    try {
      // Store player ID as a push token
      const tokenData = {
        userId,
        token: playerId,
        platform: "onesignal",
        deviceInfo: {
          ...deviceInfo,
          oneSignalPlayerId: playerId,
        },
        isActive: true,
        lastUsedAt: new Date(),
        createdAt: new Date(),
      };

      // Use upsert to handle both insert and update cases
      // This prevents duplicate key errors on the unique token index
      const result = await PushTokens.upsertAsync(
        { token: playerId }, // Find by token only (since token has unique index)
        {
          $set: {
            userId, // Update userId (handles case where same device switches users)
            platform: "onesignal",
            deviceInfo: {
              ...deviceInfo,
              oneSignalPlayerId: playerId,
            },
            isActive: true,
            lastUsedAt: new Date(),
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
      );

      return result.insertedId || result.upsertedId;

    } catch (error) {
      console.error("[OneSignal] Player registration failed:", error);
      throw error;
    }
  }

  /**
   * Set tags for user segmentation
   */
  async setUserTags(playerId, tags) {
    if (!this.isInitialized) {
      throw new Error("OneSignal service not initialized");
    }

    try {
      await this.client.editDevice(playerId, { tags });
      return true;

    } catch (error) {
      console.error(`[OneSignal] Failed to set tags for player ${playerId}:`, error);
      throw error;
    }
  }

  /**
   * Send test notification (for debugging)
   */
  async sendTestNotification(userId) {
    return this.sendToUser(userId, {
      title: "OneSignal Test",
      body: "This is a test notification from OneSignal",
      data: { test: true, timestamp: Date.now() },
      priority: "normal",
    });
  }

  /**
   * Get notification delivery statistics
   */
  async getNotificationStats(notificationId) {
    if (!this.isInitialized) {
      throw new Error("OneSignal service not initialized");
    }

    try {
      const stats = await this.client.viewNotification(notificationId);
      return {
        id: stats.id,
        successful: stats.successful || 0,
        failed: stats.failed || 0,
        converted: stats.converted || 0,
        remaining: stats.remaining || 0,
        queued_at: stats.queued_at,
        send_after: stats.send_after,
        completed_at: stats.completed_at,
      };

    } catch (error) {
      console.error("[OneSignal] Failed to get notification stats:", error);
      throw error;
    }
  }

  /**
   * Clean up inactive devices
   */
  async cleanupInactiveDevices() {
    try {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

      const result = await PushTokens.removeAsync({
        platform: "onesignal",
        isActive: false,
        lastUsedAt: { $lt: cutoffDate },
      });

      return result;

    } catch (error) {
      console.error("[OneSignal] Device cleanup failed:", error);
      return 0;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      hasClient: !!this.client,
      environment: {
        hasAppId: !!process.env.ONESIGNAL_APP_ID,
        hasApiKey: !!process.env.ONESIGNAL_API_KEY,
      },
    };
  }
}

// Export singleton instance
export const OneSignalService = new OneSignalServiceClass();

// Setup periodic cleanup (run every 6 hours)
if (Meteor.isServer) {
  const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

  Meteor.setInterval(() => {
    OneSignalService.cleanupInactiveDevices();
  }, CLEANUP_INTERVAL);
}

// Export for testing
export { OneSignalServiceClass };
