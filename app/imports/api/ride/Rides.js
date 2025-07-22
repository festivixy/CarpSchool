import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold the data. */
const Rides = new Mongo.Collection("Rides");

const RidesSchema = Joi.object({
  _id: Joi.string().optional(),
  driver: Joi.string().required(),
  rider: Joi.string().required(),
  origin: Joi.string().required(), // Now validated against dynamic places collection
  destination: Joi.string().required(), // Now validated against dynamic places collection
  date: Joi.date().required(),
  shareCode: Joi.string().optional(),
});

/** Make the collection available to other code. */
export { Rides, RidesSchema };
