import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold system content. */
const SystemContent = new Mongo.Collection("SystemContent");

/** Define a Joi schema to specify the structure of system content documents. */
const SystemContentSchema = Joi.object({
  _id: Joi.string().optional(),
  type: Joi.string().valid("tos", "privacy", "credits").required(), // Content type
  content: Joi.string().required(), // Markdown content
  lastUpdated: Joi.date().required(),
  updatedBy: Joi.string().required(), // User ID of admin who updated
});

/** Make the collection and schema available to other code. */
export { SystemContent, SystemContentSchema };
