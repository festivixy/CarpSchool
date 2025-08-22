import { Mongo } from "meteor/mongo";
import Joi from "joi";
import { createSafeStringSchema } from "../../ui/utils/validation";

/** Define a Mongo collection to hold the data. */
const Chats = new Mongo.Collection("Chat");

/** Define a Joi schema to specify the structure of each document in the collection. */
const ChatSchema = Joi.object({
  _id: Joi.string().optional(),
  rideId: Joi.string().required(), // Reference to the ride this chat belongs to
  Participants: Joi.array().items(Joi.string()).required(), // Array of participant user IDs (driver + riders)
  Messages: Joi.array()
    .items(
      Joi.object({
        Sender: Joi.string().required(), // User ID of the message sender
        Content: createSafeStringSchema({
          pattern: 'chatMessage',
          min: 1,
          max: 1000,
          label: 'Message Content',
          patternMessage: 'Message contains invalid characters',
        }),
        Timestamp: Joi.date().required(),
      }),
    )
    .required(),
});

/** Make the collection and schema available to other code. */
export { Chats, ChatSchema };
