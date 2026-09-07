import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold the data. */
const Chats = new Mongo.Collection("Chat");

/** Longest message a user may send, in characters. */
const CHAT_MESSAGE_MAX = 1000;

/** Define a Joi schema to specify the structure of each document in the collection. */
const ChatSchema = Joi.object({
  _id: Joi.string().optional(),
  rideId: Joi.string().required(), // Reference to the ride this chat belongs to
  Participants: Joi.array().items(Joi.string()).required(), // Array of participant user IDs (driver + riders)
  Messages: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().optional(), // Client-generated id, used to reject duplicate sends
        Sender: Joi.string().required(), // User ID of the message sender
        Content: Joi.string().min(1).max(CHAT_MESSAGE_MAX).required(),
        Timestamp: Joi.date().required(),
      }),
    )
    .required(),
});

if (Meteor.isServer) {
  Meteor.startup(async () => {
    try {
      // One chat per ride, enforced in the database so two concurrent
      // chats.createForRide calls cannot both insert.
      await Chats.createIndexAsync({ rideId: 1 }, { unique: true });
      await Chats.createIndexAsync({ Participants: 1 });
    } catch (error) {
      console.error("[Chat] Index creation failed:", error);
    }
  });
}

/** Make the collection and schema available to other code. */
export { Chats, ChatSchema, CHAT_MESSAGE_MAX };
