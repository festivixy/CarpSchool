import { Meteor } from "meteor/meteor";
import { Rides } from "../../api/ride/Rides";
import { Chats } from "../../api/chat/Chat";
import { NotificationUtils } from "../../api/notifications/NotificationMethods";

/**
 * Integration hooks for existing systems to send notifications
 * This file sets up observers and hooks to automatically send notifications
 * when relevant events occur in the ride and chat systems
 */

if (Meteor.isServer) {
  console.log('[Notifications] Setting up integration hooks...');

  // Hook into ride collection changes
  const rideObserver = Rides.find({}).observe({
    changed: async (newRide, oldRide) => {
      try {
        // Rider joined
        if (oldRide.riders.length < newRide.riders.length) {
          const newRiders = newRide.riders.filter(rider => !oldRide.riders.includes(rider));
          for (const riderName of newRiders) {
            await NotificationUtils.sendRiderJoined(newRide._id, riderName);
          }
        }

        // Rider left
        if (oldRide.riders.length > newRide.riders.length) {
          const leftRiders = oldRide.riders.filter(rider => !newRide.riders.includes(rider));
          for (const riderName of leftRiders) {
            await Meteor.callAsync(
              "notifications.sendToRideParticipants",
              newRide._id,
              "Rider Left",
              `${riderName} has left the ride`,
              {
                type: "rider_left",
                priority: "normal",
                action: "view_ride",
                includeSender: false
              }
            );
          }
        }

        // Ride details updated (but not riders)
        if (oldRide.riders.length === newRide.riders.length &&
            (oldRide.date.getTime() !== newRide.date.getTime() ||
             oldRide.origin !== newRide.origin ||
             oldRide.destination !== newRide.destination)) {

          await Meteor.callAsync(
            "notifications.sendToRideParticipants",
            newRide._id,
            "Ride Updated",
            "Your ride details have been updated by the driver",
            {
              type: "ride_update",
              priority: "normal",
              action: "view_ride",
              includeSender: false
            }
          );
        }

      } catch (error) {
        console.error('[Notifications] Error in ride observer:', error);
      }
    },

    removed: async (removedRide) => {
      try {
        // Ride cancelled/deleted
        if (removedRide.riders && removedRide.riders.length > 0) {
          await NotificationUtils.sendRideCancellation(
            removedRide._id,
            "This ride has been cancelled"
          );
        }
      } catch (error) {
        console.error('[Notifications] Error in ride removal observer:', error);
      }
    }
  });

  // Hook into chat collection changes for new messages
  const chatObserver = Chats.find({}).observe({
    changed: async (newChat, oldChat) => {
      try {
        // New message added
        if (newChat.Messages.length > oldChat.Messages.length) {
          const newMessages = newChat.Messages.slice(oldChat.Messages.length);

          for (const message of newMessages) {
            // Skip system messages
            if (message.Sender === "System") continue;

            // Send notification to offline participants
            await NotificationUtils.sendChatMessage(
              newChat._id,
              message.Sender,
              message.Content,
              newChat.rideId
            );
          }
        }
      } catch (error) {
        console.error('[Notifications] Error in chat observer:', error);
      }
    }
  });

  // Cleanup observers on server shutdown
  process.on('SIGTERM', () => {
    rideObserver.stop();
    chatObserver.stop();
  });

  process.on('SIGINT', () => {
    rideObserver.stop();
    chatObserver.stop();
  });
}

// Utility functions for manual notification triggers
export const NotificationTriggers = {
  /**
   * Send ride starting notification manually
   */
  async sendRideStarting(rideId, estimatedTime) {
    try {
      await NotificationUtils.sendRideStarting(rideId, estimatedTime);
    } catch (error) {
      console.error(`[Notifications] Failed to send ride starting notification:`, error);
      throw error;
    }
  },

  /**
   * Send ride completed notification
   */
  async sendRideCompleted(rideId) {
    try {
      await Meteor.callAsync(
        "notifications.sendToRideParticipants",
        rideId,
        "Ride Completed",
        "Your ride has been completed successfully",
        {
          type: "ride_completed",
          priority: "normal",
          action: "view_ride"
        }
      );
    } catch (error) {
      console.error(`[Notifications] Failed to send ride completed notification:`, error);
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
      console.error(`[Notifications] Failed to send emergency notification:`, error);
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
          { 'status.online': true },
          { fields: { _id: 1 } }
        ).fetchAsync();
        recipients = activeUsers.map(user => user._id);
      }

      if (recipients.length === 0) {
        return;
      }

      await Meteor.callAsync(
        "notifications.send",
        recipients,
        title,
        message,
        {
          type: "system",
          priority: "normal"
        }
      );
    } catch (error) {
      console.error(`[Notifications] Failed to send system notification:`, error);
      throw error;
    }
  }
};
