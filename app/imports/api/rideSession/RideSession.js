import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold the ride session data. */
const RideSessions = new Mongo.Collection("RideSessions");

const RideSessionSchema = Joi.object({
  _id: Joi.string().optional(),
  rideId: Joi.string().required().label("Ride ID"),
  schoolId: Joi.string().required().label("School ID"),
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
      code: Joi.string().length(4).optional(), // 4-digit pickup verification code
      codeAttempts: Joi.number().integer().min(0).max(5)
.default(0), // Failed verification attempts
      codeError: Joi.boolean().default(false), // Marked as error after 5 failed attempts
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
  liveLocations: Joi.object().pattern(
    Joi.string(), // User ID (driver or rider)
    Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      accuracy: Joi.number().optional(),
      timestamp: Joi.date().required(),
    }),
  ).default({}),
  createdBy: Joi.string().required().label("Created By User ID"),
  status: Joi.string().valid("created", "active", "completed", "cancelled").default("created"),
});

// Create indexes for better performance
if (Meteor.isServer) {
  // createIndex returns a promise in Meteor 3. Awaiting inside an async startup hook
  // makes a failure a logged boot error instead of an unhandled rejection, and
  // guarantees the indexes exist before the publications start querying.
  //
  // rideId is unique: canCreateRideSession refuses a second session per ride,
  // but only after a read, so the index is what actually closes the race. If
  // duplicates already exist the unique index fails; that is logged rather
  // than allowed to abort boot.
  Meteor.startup(async () => {
    // Existing databases carry a non-unique {rideId:1} under the auto-generated
    // name the unique one would also get, and Mongo refuses the conflict. Drop
    // the old one first; the unique index below replaces it.
    try {
      await RideSessions.rawCollection().dropIndex("rideId_1");
    } catch (error) {
      // Not present, or already unique: nothing to do.
    }

    const indexes = [
      [{ rideId: 1 }, { unique: true }],
      [{ schoolId: 1 }],
      [{ driverId: 1 }],
      [{ driverId: 1, finished: 1 }],
      [{ status: 1, finished: 1 }],
      [{ riders: 1 }],
      [{ status: 1, "timeline.created": -1 }],
      [{ activeRiders: 1 }],
      [{ "timeline.created": -1 }],
    ];
    for (const [keys, options] of indexes) { // eslint-disable-line no-restricted-syntax
      try {
        await RideSessions.createIndexAsync(keys, options); // eslint-disable-line no-await-in-loop
      } catch (error) {
        console.error("[RideSessions] Could not create index", keys, error?.message || error);
      }
    }
  });
}

/** Make the collection and schema available to other code. */
export { RideSessions, RideSessionSchema };
