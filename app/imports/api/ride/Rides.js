import { Mongo } from "meteor/mongo";
import Joi from "joi";
import { places } from "../places/Places.mjs";

/** Define a Mongo collection to hold the data. */
const Rides = new Mongo.Collection("Rides");

const RidesSchema = Joi.object({
  _id: Joi.string().optional(),
  driver: Joi.string().required(),
  rider: Joi.string().required(),
  origin: Joi.string().valid(...places).required(),
  destination: Joi.string().valid(...places).required(),
  date: Joi.date().required(),
  shareCode: Joi.string().optional(),
});

/** Make the collection available to other code. */
export { Rides, RidesSchema };
