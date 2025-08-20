import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { OneSignalService } from "../../startup/server/OneSignalService";

/**
 * OneSignal-specific Meteor methods
 * Additional methods for OneSignal features not available in Firebase
 */

Meteor.methods({
  /**
   * Register OneSignal player ID for the current user
   */
  async "notifications.registerOneSignalPlayer"(playerId, deviceInfo = {}) {
    check(playerId, String);
    check(deviceInfo, Object);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in to register OneSignal player");
    }

    try {
      const tokenId = await OneSignalService.registerPlayerForUser(this.userId, playerId, deviceInfo);
      
      // Also set external user ID in OneSignal
      try {
        await OneSignalService.setUserTags(playerId, {
          userId: this.userId,
          userType: 'app_user'
        });
      } catch (tagError) {
        console.warn('Failed to set OneSignal tags:', tagError);
        // Don't fail registration if tagging fails
      }

      console.log(`[OneSignal] Registered player ${playerId} for user ${this.userId}`);
      return tokenId;

    } catch (error) {
      console.error("[OneSignal] Player registration failed:", error);
      throw new Meteor.Error("registration-failed", "Failed to register OneSignal player");
    }
  },

  /**
   * Set tags for user segmentation in OneSignal
   */
  async "notifications.setUserTags"(tags) {
    check(tags, Object);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in to set tags");
    }

    try {
      // Get user's OneSignal player IDs
      const { PushTokens } = await import("./Notifications");
      const tokens = await PushTokens.find({
        userId: this.userId,
        platform: 'onesignal',
        isActive: true
      }).fetchAsync();

      if (tokens.length === 0) {
        throw new Meteor.Error("no-devices", "No OneSignal devices found for user");
      }

      // Set tags for all user devices
      const results = [];
      for (const token of tokens) {
        try {
          await OneSignalService.setUserTags(token.token, tags);
          results.push({ playerId: token.token, success: true });
        } catch (error) {
          results.push({ playerId: token.token, success: false, error: error.message });
        }
      }

      console.log(`[OneSignal] Set tags for user ${this.userId}:`, tags);
      return results;

    } catch (error) {
      console.error("[OneSignal] Set tags failed:", error);
      throw new Meteor.Error("set-tags-failed", error.reason || "Failed to set user tags");
    }
  },

  /**
   * Send notification to users with specific tags (OneSignal segmentation)
   */
  async "notifications.sendToSegment"(filters, title, body, options = {}) {
    check(filters, Array);
    check(title, String);
    check(body, String);
    check(options, Object);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in to send notifications");
    }

    // Only admins can send segment notifications
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser?.roles?.includes("admin")) {
      throw new Meteor.Error("not-authorized", "Admin access required for segment notifications");
    }

    try {
      const notification = {
        title,
        body,
        type: options.type || 'system',
        priority: options.priority || 'normal',
        data: options.data || {},
        imageUrl: options.imageUrl
      };

      const result = await OneSignalService.sendToSegment(filters, notification);

      console.log(`[OneSignal] Segment notification sent by admin ${this.userId}`);
      return result;

    } catch (error) {
      console.error("[OneSignal] Segment notification failed:", error);
      throw new Meteor.Error("segment-send-failed", error.reason || "Failed to send segment notification");
    }
  },

  /**
   * Get OneSignal notification delivery statistics
   */
  async "notifications.getOneSignalStats"(notificationId) {
    check(notificationId, String);

    // Only admins can get detailed stats
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser?.roles?.includes("admin")) {
      throw new Meteor.Error("not-authorized", "Admin access required for notification statistics");
    }

    try {
      const stats = await OneSignalService.getNotificationStats(notificationId);
      return stats;

    } catch (error) {
      console.error("[OneSignal] Get stats failed:", error);
      throw new Meteor.Error("stats-failed", error.reason || "Failed to get notification statistics");
    }
  },

  /**
   * Send test OneSignal notification
   */
  async "notifications.testOneSignal"(userId = null) {
    if (userId) {
      check(userId, String);
    }

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Must be logged in to send test notifications");
    }

    // Allow testing for self or admin testing for others
    const targetUserId = userId || this.userId;
    
    if (userId && userId !== this.userId) {
      const currentUser = await Meteor.users.findOneAsync(this.userId);
      if (!currentUser?.roles?.includes("admin")) {
        throw new Meteor.Error("not-authorized", "Can only test notifications for yourself unless admin");
      }
    }

    try {
      const result = await OneSignalService.sendTestNotification(targetUserId);
      
      console.log(`[OneSignal] Test notification sent to user ${targetUserId}`);
      return result;

    } catch (error) {
      console.error("[OneSignal] Test notification failed:", error);
      throw new Meteor.Error("test-failed", error.reason || "Failed to send test notification");
    }
  }
});

/**
 * Utility functions for OneSignal integration
 */
export const OneSignalUtils = {
  /**
   * Set ride-specific tags for user
   */
  async setRideTags(userId, rideId) {
    try {
      await Meteor.callAsync('notifications.setUserTags', {
        currentRide: rideId,
        hasActiveRide: 'true',
        lastRideUpdate: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to set ride tags:', error);
    }
  },

  /**
   * Clear ride tags when ride ends
   */
  async clearRideTags(userId) {
    try {
      await Meteor.callAsync('notifications.setUserTags', {
        currentRide: '',
        hasActiveRide: 'false'
      });
    } catch (error) {
      console.warn('Failed to clear ride tags:', error);
    }
  },

  /**
   * Send to all users in a specific city
   */
  async sendToCityUsers(city, title, message) {
    const filters = [
      { field: 'tag', key: 'city', relation: '=', value: city }
    ];
    
    return await Meteor.callAsync('notifications.sendToSegment', filters, title, message);
  },

  /**
   * Send to all active riders
   */
  async sendToActiveRiders(title, message) {
    const filters = [
      { field: 'tag', key: 'hasActiveRide', relation: '=', value: 'true' }
    ];
    
    return await Meteor.callAsync('notifications.sendToSegment', filters, title, message);
  }
};
