import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { check, Match } from "meteor/check";
import {
  Notifications,
  PushTokens,
  NotificationsSchema,
  PushTokenSchema,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_STATUS,
  NotificationHelpers
} from "./Notifications";
import { Rides } from "../ride/Rides";
import { Chats } from "../chat/Chat";

// Push notification service (to be implemented with Firebase/APNs)
import { PushNotificationService } from "../../startup/server/PushNotificationService";

Meteor.methods({
  /**
   * Register a push token for the current user
   */
  async "notifications.registerPushToken"(token, platform, deviceInfo = {}) {
    check(token, String);
    check(platform, Match.OneOf("ios", "android", "web"));
    check(deviceInfo, Object);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in to register push token");
    }

    try {
      // Deactivate existing tokens for this user/platform
      await PushTokens.updateAsync(
        { userId: this.userId, platform, isActive: true },
        { $set: { isActive: false } },
        { multi: true }
      );

      // Create new token record
      const pushTokenData = NotificationHelpers.createPushToken({
        userId: this.userId,
        token,
        platform,
        deviceInfo,
        isActive: true,
        lastUsedAt: new Date(),
        createdAt: new Date()
      });

      const tokenId = await PushTokens.insertAsync(pushTokenData);

      console.log(`[Push] Registered token for user ${this.userId} on ${platform}`);
      return tokenId;

    } catch (error) {
      console.error("[Push] Token registration failed:", error);
      throw new Meteor.Error("registration-failed", "Failed to register push token");
    }
  },

  /**
   * Unregister a push token
   */
  async "notifications.unregisterPushToken"(token) {
    check(token, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in");
    }

    try {
      const result = await PushTokens.updateAsync(
        { userId: this.userId, token },
        { $set: { isActive: false } }
      );

      console.log(`[Push] Unregistered token for user ${this.userId}`);
      return result;

    } catch (error) {
      console.error("[Push] Token unregistration failed:", error);
      throw new Meteor.Error("unregistration-failed", "Failed to unregister push token");
    }
  },

  /**
   * Send a notification to specific users
   */
  async "notifications.send"(recipients, title, body, options = {}) {
    check(recipients, [String]); // Array of user IDs
    check(title, String);
    check(body, String);
    check(options, Object);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in to send notifications");
    }

    try {
      const notifications = [];
      const batchId = Random.id();

      for (const userId of recipients) {
        const notificationData = NotificationHelpers.createNotification({
          userId,
          title,
          body,
          type: options.type || NOTIFICATION_TYPES.SYSTEM,
          priority: options.priority || NOTIFICATION_PRIORITY.NORMAL,
          data: options.data || {},
          pushPayload: options.pushPayload || {},
          scheduledAt: options.scheduledAt,
          expiresAt: options.expiresAt || NotificationHelpers.getDefaultExpiry(options.type),
          groupKey: options.groupKey || NotificationHelpers.generateGroupKey(options.type, options.data?.rideId),
          batchId,
          createdBy: this.userId,
          platform: options.platform
        });

        const notificationId = await Notifications.insertAsync(notificationData);
        notifications.push(notificationId);

        // Send push notification immediately if not scheduled
        if (!options.scheduledAt) {
          Meteor.defer(() => {
            PushNotificationService.sendToUser(userId, {
              title,
              body,
              data: options.data || {},
              priority: options.priority,
              notificationId
            });
          });
        }
      }

      console.log(`[Notifications] Sent ${notifications.length} notifications in batch ${batchId}`);
      return { batchId, notificationIds: notifications };

    } catch (error) {
      console.error("[Notifications] Send failed:", error);
      throw new Meteor.Error("send-failed", "Failed to send notification");
    }
  },

  /**
   * Send notification to all participants of a ride
   */
  async "notifications.sendToRideParticipants"(rideId, title, body, options = {}) {
    check(rideId, String);
    check(title, String);
    check(body, String);
    check(options, Object);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in");
    }

    try {
      const ride = await Rides.findOneAsync(rideId);
      if (!ride) {
        throw new Meteor.Error("ride-not-found", "Ride not found");
      }

      // Verify user has permission to send notifications for this ride
      const isDriver = ride.driver === this.userId;
      const isRider = ride.riders.includes(this.userId);
      const currentUser = await Meteor.users.findOneAsync(this.userId);
      const isAdmin = currentUser?.roles?.includes("admin");

      if (!isDriver && !isRider && !isAdmin) {
        throw new Meteor.Error("not-authorized", "Not authorized to send notifications for this ride");
      }

      // Get all participants except the sender (unless explicitly included)
      const recipients = [ride.driver, ...ride.riders];
      const filteredRecipients = options.includeSender
        ? recipients
        : recipients.filter(userId => userId !== this.userId);

      // Set ride-specific options
      const rideOptions = {
        ...options,
        type: options.type || NOTIFICATION_TYPES.RIDE_UPDATE,
        data: {
          rideId,
          action: options.action || "view_ride",
          ...options.data
        },
        groupKey: NotificationHelpers.generateGroupKey(options.type || NOTIFICATION_TYPES.RIDE_UPDATE, rideId)
      };

      return await Meteor.callAsync("notifications.send", filteredRecipients, title, body, rideOptions);

    } catch (error) {
      console.error("[Notifications] Ride notification failed:", error);
      throw new Meteor.Error("ride-notification-failed", error.reason || "Failed to send ride notification");
    }
  },

  /**
   * Mark notification as read
   */
  async "notifications.markAsRead"(notificationId) {
    check(notificationId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in");
    }

    try {
      const result = await Notifications.updateAsync(
        {
          _id: notificationId,
          userId: this.userId,
          status: { $ne: NOTIFICATION_STATUS.READ }
        },
        {
          $set: {
            status: NOTIFICATION_STATUS.READ,
            readAt: new Date()
          }
        }
      );

      if (result) {
        console.log(`[Notifications] Marked notification ${notificationId} as read`);
      }

      return result;

    } catch (error) {
      console.error("[Notifications] Mark as read failed:", error);
      throw new Meteor.Error("mark-read-failed", "Failed to mark notification as read");
    }
  },

  /**
   * Mark all notifications as read for current user
   */
  async "notifications.markAllAsRead"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in");
    }

    try {
      const result = await Notifications.updateAsync(
        {
          userId: this.userId,
          status: { $ne: NOTIFICATION_STATUS.READ }
        },
        {
          $set: {
            status: NOTIFICATION_STATUS.READ,
            readAt: new Date()
          }
        },
        { multi: true }
      );

      console.log(`[Notifications] Marked ${result} notifications as read for user ${this.userId}`);
      return result;

    } catch (error) {
      console.error("[Notifications] Mark all as read failed:", error);
      throw new Meteor.Error("mark-all-read-failed", "Failed to mark all notifications as read");
    }
  },

  /**
   * Delete old notifications (cleanup)
   */
  async "notifications.cleanup"(daysOld = 30) {
    check(daysOld, Number);

    // Only admins can run cleanup
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser?.roles?.includes("admin")) {
      throw new Meteor.Error("not-authorized", "Admin access required");
    }

    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const result = await Notifications.removeAsync({
        $or: [
          { createdAt: { $lt: cutoffDate } },
          { expiresAt: { $lt: new Date() } }
        ]
      });

      console.log(`[Notifications] Cleaned up ${result} old notifications`);
      return result;

    } catch (error) {
      console.error("[Notifications] Cleanup failed:", error);
      throw new Meteor.Error("cleanup-failed", "Failed to cleanup notifications");
    }
  },

  /**
   * Get notification statistics for admin
   */
  async "notifications.getStats"() {
    // Only admins can get stats
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser?.roles?.includes("admin")) {
      throw new Meteor.Error("not-authorized", "Admin access required");
    }

    try {
      const stats = {
        total: await Notifications.find({}).countAsync(),
        byStatus: {},
        byType: {},
        last24Hours: await Notifications.find({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).countAsync(),
        activeTokens: await PushTokens.find({ isActive: true }).countAsync()
      };

      // Get counts by status
      for (const status of Object.values(NOTIFICATION_STATUS)) {
        stats.byStatus[status] = await Notifications.find({ status }).countAsync();
      }

      // Get counts by type
      for (const type of Object.values(NOTIFICATION_TYPES)) {
        stats.byType[type] = await Notifications.find({ type }).countAsync();
      }

      return stats;

    } catch (error) {
      console.error("[Notifications] Get stats failed:", error);
      throw new Meteor.Error("stats-failed", "Failed to get notification statistics");
    }
  },

  /**
   * Get notifications for current user
   */
  async "notifications.getUserNotifications"(limit = 50) {
    check(limit, Number);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in");
    }

    try {
      const safeLimit = Math.min(limit, 100); // Max 100 notifications

      const notifications = await Notifications.find(
        { userId: this.userId },
        {
          sort: { createdAt: -1 },
          limit: safeLimit
        }
      ).fetchAsync();

      return notifications;

    } catch (error) {
      console.error("[Notifications] Get user notifications failed:", error);
      throw new Meteor.Error("get-notifications-failed", "Failed to get user notifications");
    }
  }
});

// Utility methods for integration with existing systems
export const NotificationUtils = {
  /**
   * Send ride cancellation notification
   */
  async sendRideCancellation(rideId, reason = "The ride has been cancelled") {
    return await Meteor.callAsync(
      "notifications.sendToRideParticipants",
      rideId,
      "Ride Cancelled",
      reason,
      {
        type: NOTIFICATION_TYPES.RIDE_CANCELLED,
        priority: NOTIFICATION_PRIORITY.HIGH,
        action: "view_ride"
      }
    );
  },

  /**
   * Send rider joined notification
   */
  async sendRiderJoined(rideId, riderName) {
    return await Meteor.callAsync(
      "notifications.sendToRideParticipants",
      rideId,
      "New Rider",
      `${riderName} joined your ride`,
      {
        type: NOTIFICATION_TYPES.RIDER_JOINED,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        action: "view_ride",
        includeSender: false // Don't notify the rider who just joined
      }
    );
  },

  /**
   * Send ride starting notification
   */
  async sendRideStarting(rideId, estimatedTime) {
    const title = "Ride Starting Soon";
    const body = estimatedTime
      ? `Your ride is starting in ${estimatedTime}`
      : "Your ride is starting soon";

    return await Meteor.callAsync(
      "notifications.sendToRideParticipants",
      rideId,
      title,
      body,
      {
        type: NOTIFICATION_TYPES.RIDE_STARTING,
        priority: NOTIFICATION_PRIORITY.HIGH,
        action: "view_ride"
      }
    );
  },

  /**
   * Send chat message notification (for offline users)
   */
  async sendChatMessage(chatId, senderName, messageContent, rideId = null) {
    const chat = await Chats.findOneAsync(chatId);
    if (!chat) return;

    // Only send to offline users
    const offlineParticipants = []; // TODO: Implement offline user detection

    if (offlineParticipants.length > 0) {
      return await Meteor.callAsync(
        "notifications.send",
        offlineParticipants,
        `Message from ${senderName}`,
        messageContent.length > 50 ? messageContent.substring(0, 47) + "..." : messageContent,
        {
          type: NOTIFICATION_TYPES.CHAT_MESSAGE,
          priority: NOTIFICATION_PRIORITY.NORMAL,
          data: { chatId, rideId, action: "open_chat" }
        }
      );
    }
  },

  /**
   * Debug ride notification setup - helps troubleshoot ride notification issues
   */
  async "notifications.debugRideNotification"(rideId) {
    check(rideId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in");
    }

    try {
      const currentUser = await Meteor.users.findOneAsync(this.userId);
      const ride = await Rides.findOneAsync(rideId);

      const debugInfo = {
        user: {
          id: this.userId,
          username: currentUser?.username,
          roles: currentUser?.roles || []
        },
        ride: ride ? {
          id: ride._id,
          driver: ride.driver,
          riders: ride.riders || [],
          participants: [ride.driver, ...ride.riders],
        } : null,
        permissions: {
          rideExists: !!ride,
          isDriver: ride ? ride.driver === this.userId : false,
          isRider: ride ? ride.riders.includes(this.userId) : false,
          isAdmin: currentUser?.roles?.includes("admin") || false
        },
        timestamp: new Date().toISOString()
      };

      if (ride) {
        debugInfo.notifications = {
          wouldSendTo: [ride.driver, ...ride.riders].filter(userId => userId !== this.userId),
          allParticipants: [ride.driver, ...ride.riders]
        };
      }

      return debugInfo;

    } catch (error) {
      console.error("[Notifications] Debug failed:", error);
      throw new Meteor.Error("debug-failed", error.reason || "Debug failed");
    }
  },

  /**
   * Deactivate all push tokens for current user (called on logout)
   */
  async "notifications.deactivateUserTokens"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in");
    }

    try {
      // Deactivate all active push tokens for this user
      const result = await PushTokens.updateAsync(
        {
          userId: this.userId,
          isActive: true
        },
        {
          $set: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivationReason: 'user_logout'
          }
        },
        { multi: true }
      );

      console.log(`[Logout] Deactivated ${result} push tokens for user ${this.userId}`);

      return {
        success: true,
        deactivatedTokens: result,
        userId: this.userId
      };

    } catch (error) {
      console.error("[Logout] Failed to deactivate user tokens:", error);
      throw new Meteor.Error("token-deactivation-failed", error.reason || "Failed to deactivate tokens");
    }
  },

  /**
   * Send emergency notification
   */
  async sendEmergency(rideId, message, priority = NOTIFICATION_PRIORITY.URGENT) {
    return await Meteor.callAsync(
      "notifications.sendToRideParticipants",
      rideId,
      "⚠️ Emergency Alert",
      message,
      {
        type: NOTIFICATION_TYPES.EMERGENCY,
        priority,
        action: "emergency_action",
        pushPayload: {
          sound: "emergency.caf",
          badge: 1,
          category: "EMERGENCY"
        }
      }
    );
  }
};
