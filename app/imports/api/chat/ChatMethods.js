import { Meteor } from 'meteor/meteor';
import Joi from 'joi';
import { Chats } from './Chat';
import { isLoggedInAndEmailVerified } from '../accounts/Accounts';

// Generate a random 8-character code
function generateChatCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result.slice(0, 4)}-${result.slice(4)}`;
}

Meteor.methods({
  /**
   * Create a new empty chat with share code
   */
  async 'chats.createWithCode'() {
    // Check if user is logged in
    if (!await isLoggedInAndEmailVerified(this.userId)) {
      throw new Meteor.Error(
        'not-authorized',
        'You must be logged in to create a chat.',
      );
    }

    // Get current user
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.username) {
      throw new Meteor.Error('user-error', 'Unable to find current user.');
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

    // Create new chat with just current user
    const chatData = {
      Participants: [currentUser.username],
      Messages: [],
      shareCode: shareCode,
    };

    const chatId = await Chats.insertAsync(chatData);
    return { chatId, shareCode };
  },

  /**
   * Create a new DM chat with another user
   */
  async 'chats.create'(participants) {
    // Validate input - only allow 1 other participant for DM
    const schema = Joi.object({
      participants: Joi.array().items(Joi.string()).max(1).required(),
    });

    const { error } = schema.validate({ participants });
    if (error) {
      throw new Meteor.Error(
        'validation-error',
        'Only one other participant allowed for DM.',
      );
    }

    // Check if user is logged in
    if (!await isLoggedInAndEmailVerified(this.userId)) {
      throw new Meteor.Error(
        'not-authorized',
        'You must be logged in to create a chat.',
      );
    }

    // Get current user
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.username) {
      throw new Meteor.Error('user-error', 'Unable to find current user.');
    }

    // Create final participants array (current user + other user)
    const otherUsername = participants[0];
    const finalParticipants = [currentUser.username, otherUsername].sort();

    // Validate other user exists
    const otherUser = await Meteor.users.findOneAsync({
      username: otherUsername,
    });
    if (!otherUser) {
      throw new Meteor.Error(
        'user-not-found',
        `User "${otherUsername}" not found.`,
      );
    }

    // Check if DM already exists between these 2 users
    const existingChat = await Chats.findOneAsync({
      Participants: { $size: 2, $all: finalParticipants },
    });

    if (existingChat) {
      return existingChat._id;
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

    // Create new DM chat
    const chatData = {
      Participants: finalParticipants,
      Messages: [],
      shareCode: shareCode,
    };

    return await Chats.insertAsync(chatData);
  },

  /**
   * Generate share code for existing chat
   */
  async 'chats.generateShareCode'(chatId) {
    // Check if user is logged in
    if (!await isLoggedInAndEmailVerified(this.userId)) {
      throw new Meteor.Error('not-authorized', 'You must be logged in.');
    }

    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.username) {
      throw new Meteor.Error('user-error', 'Unable to find current user.');
    }

    const chat = await Chats.findOneAsync(chatId);
    if (!chat) {
      throw new Meteor.Error('chat-not-found', 'Chat not found.');
    }

    // Check if user is a participant
    if (!chat.Participants.includes(currentUser.username)) {
      throw new Meteor.Error(
        'not-authorized',
        'You are not a participant in this chat.',
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
  async 'chats.joinChat'(shareCode) {
    // Validate input
    const schema = Joi.object({
      shareCode: Joi.string().required(),
    });

    const { error } = schema.validate({ shareCode });
    if (error) {
      throw new Meteor.Error('validation-error', error.details[0].message);
    }

    // Check if user is logged in
    if (!await isLoggedInAndEmailVerified(this.userId)) {
      throw new Meteor.Error(
        'not-authorized',
        'You must be logged in to join a chat.',
      );
    }

    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.username) {
      throw new Meteor.Error('user-error', 'Unable to find current user.');
    }

    // Find chat by share code
    const chat = await Chats.findOneAsync({ shareCode: shareCode });
    if (!chat) {
      throw new Meteor.Error('chat-not-found', 'Invalid chat code.');
    }

    // Check if user is already a participant
    if (chat.Participants.includes(currentUser.username)) {
      throw new Meteor.Error(
        'already-participant',
        'You are already in this chat.',
      );
    }

    // Check if chat is full (DM only allows 2 people)
    if (chat.Participants.length >= 2) {
      throw new Meteor.Error('chat-full', 'This chat is full (DM only).');
    }

    // Add user to chat
    await Chats.updateAsync(chat._id, {
      $push: { Participants: currentUser.username },
    });

    // Remove share code since DM is now complete
    await Chats.updateAsync(chat._id, {
      $unset: { shareCode: '' },
    });

    // Add system message
    const systemMessage = {
      Sender: 'System',
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
  async 'chats.sendMessage'(chatId, content) {
    // Validate input
    const schema = Joi.object({
      chatId: Joi.string().required(),
      content: Joi.string().min(1).required(),
    });

    const { error } = schema.validate({ chatId, content });
    if (error) {
      throw new Meteor.Error('validation-error', error.details[0].message);
    }

    // Check if user is logged in
    if (!await isLoggedInAndEmailVerified(this.userId)) {
      throw new Meteor.Error(
        'not-authorized',
        'You must be logged in to send messages.',
      );
    }

    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.username) {
      throw new Meteor.Error('user-error', 'Unable to find current user.');
    }

    const chat = await Chats.findOneAsync(chatId);
    if (!chat) {
      throw new Meteor.Error('chat-not-found', 'Chat not found.');
    }

    // Check if user is a participant
    if (!chat.Participants.includes(currentUser.username)) {
      throw new Meteor.Error(
        'not-authorized',
        'You are not a participant in this chat.',
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
