import { Meteor } from "meteor/meteor";
import Joi from "joi";
import { check } from "meteor/check";
import DOMPurify from "dompurify";
import { Chats } from "./Chat";
import { Rides } from "../ride/Rides";
import { isEmailVerified } from "../accounts/Accounts";

// Set up DOMPurify for server-side use
let createDOMPurify;
if (Meteor.isServer) {
  // eslint-disable-next-line global-require
  const { JSDOM } = require("jsdom");
  const window = new JSDOM("").window;
  createDOMPurify = DOMPurify(window);
} else {
  // For client-side, use the default DOMPurify which works with the browser window
  createDOMPurify = DOMPurify;
}

// Sanitize chat message content to prevent XSS
function sanitizeChatContent(content) {
  if (typeof content !== "string") {
    return "";
  }

  // Sanitize content, allowing only safe text (no HTML tags)
  const sanitized = createDOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  // Additional validation: limit length and remove excessive whitespace
  return sanitized.trim().substring(0, 1000); // Max 1000 characters
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

    // Create new ride-specific chat
    const chatData = {
      rideId: rideId,
      Participants: participants,
      Messages: [
        {
          Sender: "System",
          Content: `Ride chat created. Members: ${participants.join(", ")}`,
          Timestamp: new Date(),
        },
      ],
    };

    const chatId = await Chats.insertAsync(chatData);
    return chatId;
  },

  /**
   * Send a message to a chat
   */
  async "chats.sendMessage"(chatId, content) {
    check(chatId, String);
    check(content, String);
    // Validate input with XSS prevention
    const { createSafeStringSchema } = require("../../ui/utils/validation");
    const schema = Joi.object({
      chatId: Joi.string().required(),
      content: createSafeStringSchema({
        pattern: 'chatMessage',
        min: 1,
        max: 1000,
        label: 'Message Content',
        patternMessage: 'Message contains invalid characters',
      }),
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

    // Sanitize message content to prevent XSS attacks
    const sanitizedContent = sanitizeChatContent(content);

    // Validate sanitized content is not empty
    if (!sanitizedContent) {
      throw new Meteor.Error("empty-message", "Message content cannot be empty.");
    }

    // Add message to chat
    const message = {
      Sender: currentUser.username,
      Content: sanitizedContent,
      Timestamp: new Date(),
    };

    await Chats.updateAsync(chatId, {
      $push: { Messages: message },
    });

    return message;
  },
});
