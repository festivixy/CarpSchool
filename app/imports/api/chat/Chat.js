import { Mongo } from 'meteor/mongo';
import Joi from 'joi';

/** Define a Mongo collection to hold the data. */
const Chats = new Mongo.Collection('Chat');

/** Define a Joi schema to specify the structure of each document in the collection. */
const ChatSchema = Joi.object({
    _id: Joi.string().optional(),
    Participants: Joi.array().items(Joi.string()).required(),
    Messages: Joi.array().items(
        Joi.object({
            Sender: Joi.string().required(),
            Content: Joi.string().required(),
            Timestamp: Joi.date().required()
        })
    ).required()
});

/** Make the collection and schema available to other code. */
export { Chats, ChatSchema };
