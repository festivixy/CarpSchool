import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold the ride session data. */
const RideSessions = new Mongo.Collection("RideSessions");

const RideSessionSchema = Joi.object({
  _id: Joi.string().optional(),
  rideId: Joi.string().required().label("Ride ID"),
  driverId: Joi.string().required().label("Driver ID"),
  riders: Joi.array().items(Joi.string()).default([]).label("Rider IDs"),
  activeRiders: Joi.array().items(Joi.string()).default([]).label("Active Rider IDs"),
  progress: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      droppedOff: Joi.boolean().default(false),
      pickedUp: Joi.boolean().default(false),
      dropoffTime: Joi.date().optional().allow(null),
      pickupTime: Joi.date().optional().allow(null),
    }),
  ).default({}),
  finished: Joi.boolean().default(false).label("Ride Finished"),
  timeline: Joi.object({
    created: Joi.date().default(() => new Date()),
    started: Joi.date().optional().allow(null),
    arrived: Joi.date().optional().allow(null),
    ended: Joi.date().optional().allow(null),
  }).default({}),
  events: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      location: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      }).required(),
      time: Joi.date().required(),
      by: Joi.string().required(),
      riderId: Joi.string().optional(),
      reason: Joi.string().optional(),
    }),
  ).default({}),
  createdBy: Joi.string().required().label("Created By User ID"),
  status: Joi.string().valid("created", "active", "completed", "cancelled").default("created"),
});

// Create indexes for better performance
if (Meteor.isServer) {
  RideSessions.createIndex({ rideId: 1 });
  RideSessions.createIndex({ driverId: 1 });
  RideSessions.createIndex({ riders: 1 });
  RideSessions.createIndex({ status: 1, "timeline.created": -1 });
  RideSessions.createIndex({ activeRiders: 1 });
  RideSessions.createIndex({ "timeline.created": -1 });
}

/** Make the collection and schema available to other code. */
export { RideSessions, RideSessionSchema };
