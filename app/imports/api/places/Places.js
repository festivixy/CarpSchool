import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold the places data. */
const Places = new Mongo.Collection("Places");

const PlacesSchema = Joi.object({
  _id: Joi.string().optional(),
  text: Joi.string().required().min(1).max(100)
.label("Location Name"),
  value: Joi.string().required().pattern(/^-?\d+\.?\d*,-?\d+\.?\d*$/).label("Coordinates (lat,lng)"),
  createdBy: Joi.string().required().label("Created By User ID"),
  createdAt: Joi.date().required().label("Created Date"),
  updatedAt: Joi.date().optional().label("Updated Date"),
});

/** Make the collection and schema available to other code. */
export { Places, PlacesSchema };
