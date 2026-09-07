import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Chats, CHAT_MESSAGE_MAX } from "./Chat";
import { Rides } from "../ride/Rides";
import { syncChatParticipants } from "./ChatParticipants";
import { assertProfileApproved } from "../profile/approvalGuard";

/** Messages kept per chat; older ones fall off the front of the array. */
const CHAT_HISTORY_LIMIT = 500;

const MONGO_DUPLICATE_KEY = 11000;

/**
 * Validate and normalise a chat message.
 *
 * Markup is rejected outright (`<` and `>` are the only characters that can
 * open a tag, and React escapes everything on render anyway), so there is
 * nothing to sanitise beyond trimming. The old DOMPurify pass turned `&` into
 * `&amp;` in storage, which then rendered literally.
 */
function normalizeChatContent(content) {
  if (typeof content !== "string") {
    throw new Meteor.Error("validation-error", "Message must be text.");
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw new Meteor.Error("empty-message", "Message content cannot be empty.");
  }
  if (trimmed.length > CHAT_MESSAGE_MAX) {
    throw new Meteor.Error("validation-error", `Message must be at most ${CHAT_MESSAGE_MAX} characters.`);
  }
  if (/[<>]/.test(trimmed)) {
    throw new Meteor.Error("validation-error", "Message cannot contain < or >.");
  }
  return trimmed;
}

Meteor.methods({
  /**
   * Create or get a ride-specific chat
   */
  async "chats.createForRide"(rideId) {
    check(rideId, String);

    // Clerk owns email verification; what this method needs is a session.
    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to create a chat.",
      );
    }

    // Get the ride to verify it exists and user has access
    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("ride-not-found", "Ride not found.");
    }

    // Check if user is part of this ride (driver or rider)
    const isDriver = ride.driver === this.userId;
    const isRider = ride.riders && ride.riders.includes(this.userId);

    if (!isDriver && !isRider) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be part of this ride to access its chat.",
      );
    }

    // Check if chat already exists for this ride
    const existingChat = await Chats.findOneAsync({ rideId }, { fields: { _id: 1 } });
    if (existingChat) {
      // Participants was snapshotted at creation and the ride join/leave paths
      // never update it, so resync before handing the chat back. Without this a
      // rider who joined after the chat existed is rejected by sendMessage.
      await syncChatParticipants(ride);
      return existingChat._id;
    }

    // Create participants array (driver + riders)
    const participants = [...new Set([ride.driver, ...(ride.riders || [])].filter(Boolean))];

    const chatData = {
      rideId,
      Participants: participants,
      Messages: [
        {
          Sender: "System",
          Content: `Ride chat created. Members: ${participants.length}`,
          Timestamp: new Date(),
        },
      ],
    };

    try {
      return await Chats.insertAsync(chatData);
    } catch (error) {
      // Two participants opened the chat at the same moment; the unique
      // { rideId } index let exactly one insert through - hand back that one.
      if (error.code === MONGO_DUPLICATE_KEY) {
        const winner = await Chats.findOneAsync({ rideId }, { fields: { _id: 1 } });
        if (winner) {
          return winner._id;
        }
      }
      throw error;
    }
  },

  /**
   * Send a message to a chat.
   *
   * `messageId` is generated on the client (Random.id()) so a retried send
   * after a dropped connection cannot store the same message twice.
   */
  async "chats.sendMessage"(chatId, content, messageId = undefined) {
    check(chatId, String);
    check(content, String);
    check(messageId, Match.Maybe(String));

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to send messages.",
      );
    }
    // This file is also loaded on the client for the latency-compensation
    // stub; the approval check and the push fan-out are server-only.
    if (Meteor.isServer) {
      await assertProfileApproved(this.userId);
    }

    const sanitizedContent = normalizeChatContent(content);

    const chat = await Chats.findOneAsync(chatId, { fields: { Participants: 1 } });
    if (!chat) {
      throw new Meteor.Error("chat-not-found", "Chat not found.");
    }

    // Check if user is a participant
    if (!chat.Participants.includes(this.userId)) {
      throw new Meteor.Error(
        "not-authorized",
        "You are not a participant in this chat.",
      );
    }

    const message = {
      ...(messageId ? { id: messageId } : {}),
      Sender: this.userId,
      Content: sanitizedContent,
      Timestamp: new Date(),
    };

    // The selector re-checks membership (a rider removed between the read
    // and the write must not get a message in) and refuses a duplicate id.
    const selector = { _id: chatId, Participants: this.userId };
    if (messageId) {
      selector["Messages.id"] = { $ne: messageId };
    }

    const updated = await Chats.updateAsync(selector, {
      $push: { Messages: { $each: [message], $slice: -CHAT_HISTORY_LIMIT } },
    });

    if (updated === 0) {
      if (messageId) {
        // Already stored by an earlier attempt of the same send - idempotent.
        return message;
      }
      throw new Meteor.Error("not-authorized", "You are not a participant in this chat.");
    }

    if (Meteor.isServer) {
      try {
        const { notifyChatMessage } = await import("../notifications/NotificationMethods");
        await notifyChatMessage(chatId, this.userId, sanitizedContent);
      } catch (error) {
        // The message is stored; a push failure must not surface as a send error.
        console.error("[Chat] Message notification failed:", error);
      }
    }

    return message;
  },
});
