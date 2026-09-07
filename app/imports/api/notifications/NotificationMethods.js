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
import { Profiles } from "../profile/Profile";

// Push notification services
import { PushNotificationService } from "../../startup/server/PushNotificationService";

// A chat participant gets at most one unread push per chat in this window.
const CHAT_NOTIFY_DEDUPE_MS = 2 * 60 * 1000;
const CHAT_PREVIEW_MAX = 100;

const NO_SEND = Object.freeze({ batchId: null, notificationIds: [] });

/**
 * Core notification fan-out.
 *
 * `actorUserId` is the user who triggered the send, or null for server-originated
 * sends. Server-originated callers (triggers, cron, ride methods reacting to a
 * mutation) run with no enclosing DDP invocation, so `this.userId` there is
 * always null - they must call this function directly instead of going back
 * through Meteor.callAsync.
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
 * `rideOrId` is either a ride id or a ride document. Callers that have already
 * removed the ride (cancellation) pass the document they removed; when given an
 * id that no longer resolves this returns without sending rather than throwing,
 * because a vanished ride is an expected race for server-originated sends.
 *
 * A null `actorUserId` means server-originated: there is no sender to
 * permission-check, and nobody to filter out of the recipient list.
 */
export async function sendToRideParticipants(actorUserId, rideOrId, title, body, options = {}) {
  const ride = typeof rideOrId === "string" ? await Rides.findOneAsync(rideOrId) : rideOrId;
  if (!ride) {
    return NO_SEND;
  }
  const rideId = ride._id;
  const riders = ride.riders || [];

  if (actorUserId) {
    // Verify user has permission to send notifications for this ride
    const isDriver = ride.driver === actorUserId;
    const isRider = riders.includes(actorUserId);
    const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
    const isAdmin = await isSystemAdmin(actorUserId) || await isSchoolAdmin(actorUserId, ride.schoolId);

    if (!isDriver && !isRider && !isAdmin) {
      throw new Meteor.Error("not-authorized", "Not authorized to send notifications for this ride");
    }
  }

  // Get all participants except the sender (unless explicitly included)
  const recipients = [ride.driver, ...riders].filter(Boolean);
  const filteredRecipients = (!actorUserId || options.includeSender)
    ? recipients
    : recipients.filter(userId => userId !== actorUserId);

  if (filteredRecipients.length === 0) {
    return NO_SEND;
  }

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

/**
 * Notify a chat's other participants about a new message.
 *
 * Called by chats.sendMessage after the push succeeds. Each recipient gets at
 * most one unread notification per chat every CHAT_NOTIFY_DEDUPE_MS, so a burst
 * of messages does not become a burst of pushes.
 */
export async function notifyChatMessage(chatId, senderId, preview) {
  const chat = await Chats.findOneAsync(chatId, { fields: { Participants: 1, rideId: 1 } });
  if (!chat) {
    return NO_SEND;
  }

  const candidates = (chat.Participants || []).filter(id => id && id !== senderId);
  if (candidates.length === 0) {
    return NO_SEND;
  }

  const groupKey = `chat:${chatId}`;
  const recentlyNotified = await Notifications.find(
    {
      groupKey,
      userId: { $in: candidates },
      status: { $ne: NOTIFICATION_STATUS.READ },
      createdAt: { $gte: new Date(Date.now() - CHAT_NOTIFY_DEDUPE_MS) },
    },
    { fields: { userId: 1 } },
  ).fetchAsync();
  const skip = new Set(recentlyNotified.map(n => n.userId));
  const recipients = candidates.filter(id => !skip.has(id));
  if (recipients.length === 0) {
    return NO_SEND;
  }

  const senderProfile = await Profiles.findOneAsync({ Owner: senderId }, { fields: { Name: 1 } });
  const title = senderProfile?.Name ? `Message from ${senderProfile.Name}` : "New message";
  const text = typeof preview === "string" ? preview.trim() : "";
  const body = text.length > CHAT_PREVIEW_MAX ? `${text.slice(0, CHAT_PREVIEW_MAX - 1)}…` : (text || "New message");

  return sendNotifications(senderId, recipients, title, body, {
    type: NOTIFICATION_TYPES.CHAT_MESSAGE,
    priority: NOTIFICATION_PRIORITY.NORMAL,
    groupKey,
    data: { chatId, rideId: chat.rideId, action: "open_chat" },
  });
}

/**
 * Deactivate every active push token (FCM and OneSignal rows alike - they live
 * in the same collection) for a user. Used on logout.
 */
async function deactivateTokensForUser(userId, reason = "user_logout") {
  const result = await PushTokens.updateAsync(
    { userId, isActive: true },
    {
      $set: {
        isActive: false,
        deactivatedAt: new Date(),
        deactivationReason: reason,
      },
    },
    { multi: true },
  );

  return { success: true, deactivatedTokens: result, userId };
}

/**
 * Ids of every user in the schools the caller administers. System admins get
 * null (no scoping). Throws for non-admins.
 */
async function adminScopedUserIds(callerId) {
  const { isSystemAdmin, getUserAdminSchools } = await import("../accounts/RoleUtils");
  if (await isSystemAdmin(callerId)) {
    return null;
  }
  const schoolIds = await getUserAdminSchools(callerId);
  if (schoolIds.length === 0) {
    throw new Meteor.Error("not-authorized", "Admin access required");
  }
  const users = await Meteor.users.find(
    { schoolId: { $in: schoolIds } },
    { fields: { _id: 1 } },
  ).fetchAsync();
  return users.map(user => user._id);
}

Meteor.methods({
  /**
   * Register a push token for the current user.
   *
   * A device belongs to whoever is logged in on it right now: any row for this
   * token owned by another user is removed before the upsert, so a shared
   * device never keeps delivering the previous user's notifications.
   */
  async "notifications.registerPushToken"(token, platform, deviceInfo = {}) {
    check(token, String);
    check(platform, Match.OneOf("ios", "android", "web"));
    check(deviceInfo, Object);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in to register push token");
    }

    try {
      await PushTokens.removeAsync({ token, userId: { $ne: this.userId } });

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

    // Free-form pushes to arbitrary user ids are an administrative action.
    // Server code calls sendNotifications() directly and never needs this.
    const { isSystemAdmin } = await import("../accounts/RoleUtils");
    if (!(await isSystemAdmin(this.userId))) {
      throw new Meteor.Error("not-authorized", "Only system administrators can send direct notifications");
    }
    if (recipients.length > 500) {
      throw new Meteor.Error("too-many-recipients", "At most 500 recipients per call");
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

    // Only the driver (or an admin of the ride's school) may broadcast to a
    // ride; a rider could otherwise send every co-rider a spoofed
    // "Ride Cancelled".
    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("ride-not-found", "Ride not found");
    }
    if (ride.driver !== this.userId) {
      const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
      const allowed = (await isSystemAdmin(this.userId))
        || (await isSchoolAdmin(this.userId, ride.schoolId));
      if (!allowed) {
        throw new Meteor.Error("not-authorized", "Only the driver can notify this ride's participants");
      }
    }

    try {
      return await sendToRideParticipants(this.userId, ride, title, body, options);

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
      return await Notifications.updateAsync(
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
      return await Notifications.updateAsync(
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
    // daysOld <= 0 would wipe every notification that exists.
    if (!(daysOld >= 1)) {
      throw new Meteor.Error("invalid-argument", "daysOld must be at least 1");
    }

    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      return await Notifications.removeAsync({
        $or: [
          { createdAt: { $lt: cutoffDate } },
          { expiresAt: { $lt: new Date() } },
        ],
      });

    } catch (error) {
      console.error("[Notifications] Cleanup failed:", error);
      throw new Meteor.Error("cleanup-failed", "Failed to cleanup notifications");
    }
  },

  /**
   * Get notification statistics for admin. School admins are scoped to the
   * users of the schools they administer (notifications carry no schoolId of
   * their own).
   */
  async "notifications.getStats"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Admin access required");
    }
    const scopedUserIds = await adminScopedUserIds(this.userId);

    try {
      const query = {};
      const tokenQuery = { isActive: true };
      if (scopedUserIds) {
        query.userId = { $in: scopedUserIds };
        tokenQuery.userId = { $in: scopedUserIds };
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

      for (const status of Object.values(NOTIFICATION_STATUS)) { // eslint-disable-line no-restricted-syntax
        stats.byStatus[status] = await Notifications.find({ ...query, status }).countAsync();
      }

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

      return await Notifications.find(
        { userId: this.userId },
        {
          sort: { createdAt: -1 },
          limit: safeLimit,
        },
      ).fetchAsync();

    } catch (error) {
      console.error("[Notifications] Get user notifications failed:", error);
      throw new Meteor.Error("get-notifications-failed", "Failed to get user notifications");
    }
  },

  /**
   * Deactivate all push tokens for current user (called on logout). Covers
   * FCM tokens and OneSignal player rows alike.
   */
  async "notifications.deactivateUserTokens"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in");
    }

    try {
      return await deactivateTokensForUser(this.userId);

    } catch (error) {
      console.error("[Logout] Failed to deactivate user tokens:", error);
      throw new Meteor.Error("token-deactivation-failed", error.reason || "Failed to deactivate tokens");
    }
  },
});

// Utility methods for integration with existing systems
export const NotificationUtils = {
  /**
   * Send ride cancellation notification. Accepts the removed ride document so
   * it can be called after the ride is gone.
   */
  async sendRideCancellation(rideOrId, reason = "The ride has been cancelled") {
    return sendToRideParticipants(
      null,
      rideOrId,
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
   * Deactivate push tokens for a specific user (server-side utility)
   */
  async deactivateUserTokens(userId) {
    try {
      return await deactivateTokensForUser(userId);
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
