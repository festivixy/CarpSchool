import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold the data. */
const Rides = new Mongo.Collection("Rides");

const RidesSchema = Joi.object({
  _id: Joi.string().optional(),
  driver: Joi.string().required(),
  riders: Joi.array().items(Joi.string()).default([]), // Array of rider usernames
  origin: Joi.string().required(), // Now validated against dynamic places collection
  destination: Joi.string().required(), // Now validated against dynamic places collection
  date: Joi.date().required(),
  seats: Joi.number().integer().min(1).max(7)
.required(), // Number of available seats
  shareCode: Joi.string().optional(),
  notes: Joi.string().allow("").optional(), // Optional notes from driver
  createdAt: Joi.date().optional(),
});

/** Make the collection available to other code. */
export { Rides, RidesSchema };
