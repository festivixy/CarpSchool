import { Meteor } from "meteor/meteor";
import Joi, { object } from "joi";
import { check } from "meteor/check";
import { Chats } from "./Chat";
import { Rides } from "../ride/Rides";
import { isEmailVerified } from "../accounts/Accounts";

// Generate a random 8-character code
function generateChatCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result.slice(0, 4)}-${result.slice(4)}`;
}

Meteor.methods({
  /**
   * Create or get a ride-specific chat
   */
  async "chats.createForRide"(rideId) {
    check(rideId, String);

    // Check if user is logged in
    if (!await isEmailVerified(this.userId)) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to create a chat.",
      );
    }

    // Get current user
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.username) {
      throw new Meteor.Error("user-error", "Unable to find current user.");
    }

    // Get the ride to verify it exists and user has access
    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("ride-not-found", "Ride not found.");
    }

    // Check if user is part of this ride (driver or rider)
    const isDriver = ride.driver === currentUser.username;
    const isRider = ride.riders && ride.riders.includes(currentUser.username);

    if (!isDriver && !isRider) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be part of this ride to access its chat.",
      );
    }

    // Check if chat already exists for this ride
    const existingChat = await Chats.findOneAsync({ rideId: rideId });
    if (existingChat) {
      return existingChat._id;
    }

    // Create participants array (driver + riders)
    const participants = [ride.driver];
    if (ride.riders && ride.riders.length > 0) {
      participants.push(...ride.riders);
    }

    // Generate unique share code
    let shareCode;
    let isUnique = false;
    while (!isUnique) {
      shareCode = generateChatCode();
      const existingCode = await Chats.findOneAsync({ shareCode: shareCode });
      if (!existingCode) {
        isUnique = true;
      }
    }

    // Create new ride-specific chat
    const chatData = {
      rideId: rideId,
      Participants: participants,
      Messages: [
        {
          Sender: "System",
          Content: `Ride chat created. Members: ${participants.join(", ")}`,
          Timestamp: new Date(),
        }
      ],
      shareCode: shareCode,
    };

    const chatId = await Chats.insertAsync(chatData);
    return chatId;
  },

  /**
   * Create a new general chat with share code (for non-ride chats)
   */
  async "chats.createWithCode"() {
    // Check if user is logged in
    if (!await isEmailVerified(this.userId)) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to create a chat.",
      );
    }

    // Get current user
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.username) {
      throw new Meteor.Error("user-error", "Unable to find current user.");
    }

    // Generate unique share code
    let shareCode;
    let isUnique = false;
    while (!isUnique) {
      shareCode = generateChatCode();
      const existingCode = await Chats.findOneAsync({ shareCode: shareCode });
      if (!existingCode) {
        isUnique = true;
      }
    }

    // Create new general chat (no rideId)
    const chatData = {
      rideId: null, // General chat, not tied to a ride
      Participants: [currentUser.username],
      Messages: [],
      shareCode: shareCode,
    };

    const chatId = await Chats.insertAsync(chatData);
    return { chatId, shareCode };
  },

  /**
   * Generate share code for existing chat
   */
  async "chats.generateShareCode"(chatId) {
    check(chatId, String);
    // Check if user is logged in
    if (!await isEmailVerified(this.userId)) {
      throw new Meteor.Error("not-authorized", "You must be logged in.");
    }

    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.username) {
      throw new Meteor.Error("user-error", "Unable to find current user.");
    }

    const chat = await Chats.findOneAsync(chatId);
    if (!chat) {
      throw new Meteor.Error("chat-not-found", "Chat not found.");
    }

    // Check if user is a participant
    if (!chat.Participants.includes(currentUser.username)) {
      throw new Meteor.Error(
        "not-authorized",
        "You are not a participant in this chat.",
      );
    }

    // Return existing code if available
    if (chat.shareCode) {
      return chat.shareCode;
    }

    // Generate new unique share code
    let shareCode;
    let isUnique = false;
    while (!isUnique) {
      shareCode = generateChatCode();
      const existingCode = await Chats.findOneAsync({ shareCode: shareCode });
      if (!existingCode) {
        isUnique = true;
      }
    }

    // Update chat with share code
    await Chats.updateAsync(chatId, {
      $set: { shareCode: shareCode },
    });

    return shareCode;
  },

  /**
   * Join a chat using share code
   */
  async "chats.joinChat"(shareCode) {
    check(shareCode, String);

    // Check if user is logged in
    if (!await isEmailVerified(this.userId)) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to join a chat.",
      );
    }

    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.username) {
      throw new Meteor.Error("user-error", "Unable to find current user.");
    }

    // Find chat by share code
    const chat = await Chats.findOneAsync({ shareCode: shareCode });
    if (!chat) {
      throw new Meteor.Error("chat-not-found", "Invalid chat code.");
    }

    // Check if user is already a participant
    if (chat.Participants.includes(currentUser.username)) {
      throw new Meteor.Error(
        "already-participant",
        "You are already in this chat.",
      );
    }

    // If this is a ride-specific chat, check if user is part of the ride
    if (chat.rideId) {
      const ride = await Rides.findOneAsync(chat.rideId);
      if (!ride) {
        throw new Meteor.Error("ride-not-found", "Associated ride not found.");
      }

      const isDriver = ride.driver === currentUser.username;
      const isRider = ride.riders && ride.riders.includes(currentUser.username);

      if (!isDriver && !isRider) {
        throw new Meteor.Error(
          "not-authorized",
          "You must be part of the ride to join its chat.",
        );
      }
    } else {
      // For general chats, limit to 2 people (DM style)
      if (chat.Participants.length >= 2) {
        throw new Meteor.Error("chat-full", "This chat is full (DM only).");
      }
    }

    // Add user to chat
    await Chats.updateAsync(chat._id, {
      $push: { Participants: currentUser.username },
    });

    // For general chats, remove share code when full
    if (!chat.rideId && chat.Participants.length + 1 >= 2) {
      await Chats.updateAsync(chat._id, {
        $unset: { shareCode: "" },
      });
    }

    // Add system message
    const systemMessage = {
      Sender: "System",
      Content: `${currentUser.username} joined the chat`,
      Timestamp: new Date(),
    };

    await Chats.updateAsync(chat._id, {
      $push: { Messages: systemMessage },
    });

    return chat._id;
  },

  /**
   * Send a message to a chat
   */
  async "chats.sendMessage"(chatId, content) {
    check(chatId, String);
    check(content, String);
    // Validate input
    const schema = Joi.object({
      chatId: Joi.string().required(),
      content: Joi.string().min(1).required(),
    });

    const { error } = schema.validate({ chatId, content });
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Check if user is logged in
    if (!await isEmailVerified(this.userId)) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to send messages.",
      );
    }

    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.username) {
      throw new Meteor.Error("user-error", "Unable to find current user.");
    }

    const chat = await Chats.findOneAsync(chatId);
    if (!chat) {
      throw new Meteor.Error("chat-not-found", "Chat not found.");
    }

    // Check if user is a participant
    if (!chat.Participants.includes(currentUser.username)) {
      throw new Meteor.Error(
        "not-authorized",
        "You are not a participant in this chat.",
      );
    }

    // Add message to chat
    const message = {
      Sender: currentUser.username,
      Content: content,
      Timestamp: new Date(),
    };

    await Chats.updateAsync(chatId, {
      $push: { Messages: message },
    });

    return message;
  },
});
