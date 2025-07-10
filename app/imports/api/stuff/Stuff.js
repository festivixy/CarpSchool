import { Mongo } from 'meteor/mongo';
import Joi from 'joi';

/** Define a Mongo collection to hold the data. */
const Stuffs = new Mongo.Collection('Stuffs');

/** Define a Joi schema to specify the structure of each document in the collection. */
const StuffSchema = Joi.object({
  _id: Joi.string().optional(),
  name: Joi.string().required(),
  quantity: Joi.number().required(),
  owner: Joi.string().required(),
  condition: Joi.string().valid('excellent', 'good', 'fair', 'poor').default('good'),
});

/** Make the collection and schema available to other code. */
export { Stuffs, StuffSchema };
