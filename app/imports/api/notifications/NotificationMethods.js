import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { check, Match } from "meteor/check";
import {
  Notifications,
  PushTokens,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_STATUS,
  NotificationHelpers,
} from "./Notifications";
import { Rides } from "../ride/Rides";
import { Chats } from "../chat/Chat";

// Push notification services
import { PushNotificationService } from "../../startup/server/PushNotificationService";
import { WebPushService } from "../../startup/server/WebPushService";

/**
 * Core notification fan-out.
 *
 * `actorUserId` is the user who triggered the send, or null for server-originated
 * sends. Server-originated callers (collection observers, triggers, cron) run with
 * no enclosing DDP invocation, so `this.userId` there is always null - they must
 * call this function directly instead of going back through Meteor.callAsync.
 */
export async function sendNotifications(actorUserId, recipients, title, body, options = {}) {
  const notificationIds = [];
  const batchId = Random.id();

  for (const userId of recipients) { // eslint-disable-line no-restricted-syntax
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
      // createdBy is Joi.string().optional() with no .allow(null), so it has to be
      // omitted entirely - not set to null - for server-originated sends.
      ...(actorUserId ? { createdBy: actorUserId } : {}),
      platform: options.platform,
    });

    const notificationId = await Notifications.insertAsync(notificationData);
    notificationIds.push(notificationId);

    // Send push notification immediately if not scheduled
    if (!options.scheduledAt) {
      Meteor.defer(() => {
        PushNotificationService.sendToUser(userId, {
          title,
          body,
          data: options.data || {},
          priority: options.priority,
          notificationId,
        });
      });
    }
  }

  return { batchId, notificationIds };
}

/**
 * Send a notification to every participant of a ride.
 *
 * A null `actorUserId` means server-originated: there is no sender to
 * permission-check, and nobody to filter out of the recipient list.
 */
export async function sendToRideParticipants(actorUserId, rideId, title, body, options = {}) {
  const ride = await Rides.findOneAsync(rideId);
  if (!ride) {
    throw new Meteor.Error("ride-not-found", "Ride not found");
  }

  if (actorUserId) {
    // Verify user has permission to send notifications for this ride
    const isDriver = ride.driver === actorUserId;
    const isRider = ride.riders.includes(actorUserId);
    const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
    const isAdmin = await isSystemAdmin(actorUserId) || await isSchoolAdmin(actorUserId);

    if (!isDriver && !isRider && !isAdmin) {
      throw new Meteor.Error("not-authorized", "Not authorized to send notifications for this ride");
    }
  }

  // Get all participants except the sender (unless explicitly included)
  const recipients = [ride.driver, ...ride.riders];
  const filteredRecipients = (!actorUserId || options.includeSender)
    ? recipients
    : recipients.filter(userId => userId !== actorUserId);

  // Set ride-specific options
  const rideOptions = {
    ...options,
    type: options.type || NOTIFICATION_TYPES.RIDE_UPDATE,
    data: {
      rideId,
      action: options.action || "view_ride",
      ...options.data,
    },
    groupKey: NotificationHelpers.generateGroupKey(options.type || NOTIFICATION_TYPES.RIDE_UPDATE, rideId),
  };

  return sendNotifications(actorUserId, filteredRecipients, title, body, rideOptions);
}

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
        { multi: true },
      );

      // Create new token record
      const pushTokenData = NotificationHelpers.createPushToken({
        userId: this.userId,
        token,
        platform,
        deviceInfo,
        isActive: true,
        lastUsedAt: new Date(),
        createdAt: new Date(),
      });

      // Upsert keyed on the token rather than insert: re-registering the same
      // device used to add another row with the same token, and those duplicates
      // are what make the unique { token: 1 } index fail to build.
      const { createdAt, ...tokenFields } = pushTokenData;
      const result = await PushTokens.upsertAsync(
        { token },
        { $set: tokenFields, $setOnInsert: { createdAt } },
      );

      // console.log(`[Push] Registered token for user ${this.userId} on ${platform}`);
      if (result.insertedId) {
        return result.insertedId;
      }

      const existingToken = await PushTokens.findOneAsync({ token }, { fields: { _id: 1 } });
      return existingToken?._id;

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
        { $set: { isActive: false } },
      );

      // console.log(`[Push] Unregistered token for user ${this.userId}`);
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
      return await sendNotifications(this.userId, recipients, title, body, options);

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
      return await sendToRideParticipants(this.userId, rideId, title, body, options);

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
          status: { $ne: NOTIFICATION_STATUS.READ },
        },
        {
          $set: {
            status: NOTIFICATION_STATUS.READ,
            readAt: new Date(),
          },
        },
      );

      if (result) {
        // console.log(`[Notifications] Marked notification ${notificationId} as read`);
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
          status: { $ne: NOTIFICATION_STATUS.READ },
        },
        {
          $set: {
            status: NOTIFICATION_STATUS.READ,
            readAt: new Date(),
          },
        },
        { multi: true },
      );

      // console.log(`[Notifications] Marked ${result} notifications as read for user ${this.userId}`);
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
    const { isSystemAdmin } = await import("../accounts/RoleUtils");
    if (!await isSystemAdmin(this.userId)) {
      throw new Meteor.Error("not-authorized", "System admin access required");
    }

    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const result = await Notifications.removeAsync({
        $or: [
          { createdAt: { $lt: cutoffDate } },
          { expiresAt: { $lt: new Date() } },
        ],
      });

      // console.log(`[Notifications] Cleaned up ${result} old notifications`);
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
    const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
    if (!await isSystemAdmin(this.userId) && !await isSchoolAdmin(this.userId)) {
      throw new Meteor.Error("not-authorized", "Admin access required");
    }

    try {
      // Build school filter query
      const query = {};
      const tokenQuery = { isActive: true };

      if (await isSchoolAdmin(this.userId) && !await isSystemAdmin(this.userId)) {
        // School admins can only see stats from their school
        query.schoolId = currentUser.schoolId;
        tokenQuery.schoolId = currentUser.schoolId;
      }

      const stats = {
        total: await Notifications.find(query).countAsync(),
        byStatus: {},
        byType: {},
        last24Hours: await Notifications.find({
          ...query,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }).countAsync(),
        activeTokens: await PushTokens.find(tokenQuery).countAsync(),
      };

      // Get counts by status
      for (const status of Object.values(NOTIFICATION_STATUS)) { // eslint-disable-line no-restricted-syntax
        stats.byStatus[status] = await Notifications.find({ ...query, status }).countAsync();
      }

      // Get counts by type
      for (const type of Object.values(NOTIFICATION_TYPES)) { // eslint-disable-line no-restricted-syntax
        stats.byType[type] = await Notifications.find({ ...query, type }).countAsync();
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
          limit: safeLimit,
        },
      ).fetchAsync();

      return notifications;

    } catch (error) {
      console.error("[Notifications] Get user notifications failed:", error);
      throw new Meteor.Error("get-notifications-failed", "Failed to get user notifications");
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
          isActive: true,
        },
        {
          $set: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivationReason: "user_logout",
          },
        },
        { multi: true },
      );

      // console.log(`[Logout] Deactivated ${result} push tokens for user ${this.userId}`);

      return {
        success: true,
        deactivatedTokens: result,
        userId: this.userId,
      };

    } catch (error) {
      console.error("[Logout] Failed to deactivate user tokens:", error);
      throw new Meteor.Error("token-deactivation-failed", error.reason || "Failed to deactivate tokens");
    }
  },

  /**
   * Get VAPID public key for web push subscription
   */
  async "notifications.getVapidPublicKey"() {
    try {
      // Get from WebPushService
      const webPushKey = WebPushService.getVapidPublicKey();
      if (webPushKey) {
        return { publicKey: webPushKey, source: "webpush" };
      }

      // Fallback to Meteor settings
      const settingsKey = Meteor.settings.public?.vapid?.publicKey;
      if (settingsKey) {
        return { publicKey: settingsKey, source: "settings" };
      }

      // Fallback to environment variable
      const envKey = process.env.VAPID_PUBLIC_KEY;
      if (envKey) {
        return { publicKey: envKey, source: "env" };
      }

      throw new Meteor.Error("vapid-not-configured", "VAPID public key not configured");

    } catch (error) {
      console.error("[VAPID] Failed to get public key:", error);
      throw new Meteor.Error("vapid-failed", error.reason || "Failed to get VAPID public key");
    }
  },
});

// Utility methods for integration with existing systems
export const NotificationUtils = {
  /**
   * Send ride cancellation notification
   */
  async sendRideCancellation(rideId, reason = "The ride has been cancelled") {
    return sendToRideParticipants(
      null,
      rideId,
      "Ride Cancelled",
      reason,
      {
        type: NOTIFICATION_TYPES.RIDE_CANCELLED,
        priority: NOTIFICATION_PRIORITY.HIGH,
        action: "view_ride",
      },
    );
  },

  /**
   * Send rider joined notification
   */
  async sendRiderJoined(rideId, riderName) {
    return sendToRideParticipants(
      null,
      rideId,
      "New Rider",
      `${riderName} joined your ride`,
      {
        type: NOTIFICATION_TYPES.RIDER_JOINED,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        action: "view_ride",
      },
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

    return sendToRideParticipants(
      null,
      rideId,
      title,
      body,
      {
        type: NOTIFICATION_TYPES.RIDE_STARTING,
        priority: NOTIFICATION_PRIORITY.HIGH,
        action: "view_ride",
      },
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
      return sendNotifications(
        null,
        offlineParticipants,
        `Message from ${senderName}`,
        messageContent.length > 50 ? `${messageContent.substring(0, 47)}...` : messageContent,
        {
          type: NOTIFICATION_TYPES.CHAT_MESSAGE,
          priority: NOTIFICATION_PRIORITY.NORMAL,
          data: { chatId, rideId, action: "open_chat" },
        },
      );
    }
  },

  /**
   * Deactivate push tokens for a specific user (server-side utility)
   */
  async deactivateUserTokens(userId) {
    try {
      // Deactivate all active push tokens for this user
      const result = await PushTokens.updateAsync(
        {
          userId: userId,
          isActive: true,
        },
        {
          $set: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivationReason: "user_logout",
          },
        },
        { multi: true },
      );

      // console.log(`[Logout] Deactivated ${result} push tokens for user ${userId}`);

      return {
        success: true,
        deactivatedTokens: result,
        userId: userId,
      };

    } catch (error) {
      console.error("[Logout] Failed to deactivate user tokens:", error);
      throw error;
    }
  },

  /**
   * Send emergency notification
   */
  async sendEmergency(rideId, message, priority = NOTIFICATION_PRIORITY.URGENT) {
    return sendToRideParticipants(
      null,
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
          category: "EMERGENCY",
        },
      },
    );
  },
};
