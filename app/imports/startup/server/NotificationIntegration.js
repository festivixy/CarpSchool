import { Meteor } from "meteor/meteor";
import {
  NotificationUtils,
  sendNotifications,
  sendToRideParticipants,
} from "../../api/notifications/NotificationMethods";

/**
 * Server-originated notification triggers.
 *
 * The Rides/Chats collection observers that used to live here are gone: they
 * kept every ride and every chat's full message array in memory for the life
 * of the process, called DDP methods with no session (so nothing they sent
 * ever passed the auth check), and on Meteor 3 `observe()` returns a Promise
 * so they were never stopped. Ride mutations now notify from the ride methods
 * themselves and chat messages from chats.sendMessage, both calling the
 * exported senders directly with a null actor.
 */
export const NotificationTriggers = {
  /**
   * Send ride starting notification manually
   */
  async sendRideStarting(rideId, estimatedTime) {
    try {
      await NotificationUtils.sendRideStarting(rideId, estimatedTime);
    } catch (error) {
      console.error("[Notifications] Failed to send ride starting notification:", error);
      throw error;
    }
  },

  /**
   * Send ride completed notification
   */
  async sendRideCompleted(rideOrId) {
    try {
      await sendToRideParticipants(
        null,
        rideOrId,
        "Ride Completed",
        "Your ride has been completed successfully",
        {
          type: "ride_completed",
          priority: "normal",
          action: "view_ride",
        },
      );
    } catch (error) {
      console.error("[Notifications] Failed to send ride completed notification:", error);
      throw error;
    }
  },

  /**
   * Send emergency notification
   */
  async sendEmergency(rideId, message, priority = "urgent") {
    try {
      await NotificationUtils.sendEmergency(rideId, message, priority);
    } catch (error) {
      console.error("[Notifications] Failed to send emergency notification:", error);
      throw error;
    }
  },

  /**
   * Send system-wide notification
   */
  async sendSystemNotification(title, message, targetUsers = null) {
    try {
      let recipients;

      if (targetUsers) {
        recipients = targetUsers;
      } else {
        // Send to all active users
        const activeUsers = await Meteor.users.find(
          { "status.online": true },
          { fields: { _id: 1 } },
        ).fetchAsync();
        recipients = activeUsers.map(user => user._id);
      }

      if (recipients.length === 0) {
        return;
      }

      await sendNotifications(
        null,
        recipients,
        title,
        message,
        {
          type: "system",
          priority: "normal",
        },
      );
    } catch (error) {
      console.error("[Notifications] Failed to send system notification:", error);
      throw error;
    }
  },
};
