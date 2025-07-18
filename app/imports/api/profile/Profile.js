import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold the data. */
const Profiles = new Mongo.Collection("Profiles");

/** Define a Joi schema to specify the structure of each document in the collection. */
const ProfileSchema = Joi.object({
  _id: Joi.string().optional(),
  Name: Joi.string().required(),
  Location: Joi.string().required(),
  Image: Joi.string().optional().allow(""),
  Ride: Joi.string().optional().allow(""),
  Phone: Joi.string().optional().allow(""),
  Other: Joi.string().optional().allow(""),
  UserType: Joi.string().valid("Driver", "Rider", "Both").default("Both"),
  Owner: Joi.string().required(),
});

/** Make the collection and schema available to other code. */
export { Profiles, ProfileSchema };
