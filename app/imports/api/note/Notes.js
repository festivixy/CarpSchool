import { Mongo } from 'meteor/mongo';
import Joi from 'joi';

/** Define a Mongo collection to hold the data. */
const Notes = new Mongo.Collection('Notes');

/** Define a Joi schema to specify the structure of each document in the collection. */
const NotesSchema = Joi.object({
  _id: Joi.string().optional(),
  note: Joi.string().required(),
  owner: Joi.string().required(),
  profileId: Joi.string().required(),
  createdAt: Joi.date().required(),
});

/** Make the collection and schema available to other code. */
export { Notes, NotesSchema };
