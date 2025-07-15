import { Meteor } from "meteor/meteor";
import { Chats } from "./Chat";
import Joi from "joi";

Meteor.methods({
  /**
   * Create a new chat between participants
   */
  async "chats.create"(participants) {
    // Validate input
    const schema = Joi.object({
      participants: Joi.array().items(Joi.string()).min(1).required(),
    });

    const { error } = schema.validate({ participants });
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Check if user is logged in
    if (!this.userId) {
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

    // Create a clean participants array without duplicates and ensure current user is included
    const participantsSet = new Set([...participants, currentUser.username]);
    const finalParticipants = Array.from(participantsSet).sort(); // Sort for consistent ordering

    // Check if chat already exists with these exact participants
    const existingChat = await Chats.findOneAsync({
      Participants: {
        $size: finalParticipants.length,
        $all: finalParticipants,
      },
    });

    if (existingChat) {
      return existingChat._id;
    }

    // Validate that all participants exist
    for (const username of finalParticipants) {
      if (username !== currentUser.username) {
        const participantUser = await Meteor.users.findOneAsync({
          username: username,
        });
        if (!participantUser) {
          throw new Meteor.Error(
            "user-not-found",
            `User "${username}" not found.`,
          );
        }
      }
    }

    // Create new chat
    const chatData = {
      Participants: finalParticipants,
      Messages: [],
    };

    return await Chats.insertAsync(chatData);
  },

  /**
   * Send a message to a chat
   */
  async "chats.sendMessage"(chatId, content) {
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
    if (!this.userId) {
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

  /**
   * Add a participant to a chat
   */
  async "chats.addParticipant"(chatId, username) {
    // Validate input
    const schema = Joi.object({
      chatId: Joi.string().required(),
      username: Joi.string().required(),
    });

    const { error } = schema.validate({ chatId, username });
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to add participants.",
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

    // Check if current user is a participant
    if (!chat.Participants.includes(currentUser.username)) {
      throw new Meteor.Error(
        "not-authorized",
        "You are not a participant in this chat.",
      );
    }

    // Check if user to add exists
    const userToAdd = await Meteor.users.findOneAsync({ username: username });
    if (!userToAdd) {
      throw new Meteor.Error("user-not-found", "User not found.");
    }

    // Check if user is already a participant
    if (chat.Participants.includes(username)) {
      throw new Meteor.Error(
        "already-participant",
        "User is already a participant.",
      );
    }

    // Add participant
    await Chats.updateAsync(chatId, {
      $push: { Participants: username },
    });

    // Add system message
    const systemMessage = {
      Sender: "System",
      Content: `${username} was added to the chat by ${currentUser.username}`,
      Timestamp: new Date(),
    };

    await Chats.updateAsync(chatId, {
      $push: { Messages: systemMessage },
    });

    return true;
  },
});
