import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import Joi from "joi";
import { createSafeStringSchema } from "../../ui/utils/validation";

/** Define a Mongo collection to hold the data. */
const Rides = new Mongo.Collection("Rides");

const RidesSchema = Joi.object({
  _id: Joi.string().optional(),
  schoolId: Joi.string().required(), // School this ride belongs to
  driver: Joi.string().required(), // User ID of the driver
  riders: Joi.array().items(Joi.string()).default([]), // Array of rider user IDs
  origin: Joi.string().required(), // Now validated against dynamic places collection
  destination: Joi.string().required(), // Now validated against dynamic places collection
  /* Ordered intermediate stops, as Places ids like origin and destination.
   * Capped because every extra stop is another leg to route and another
   * detour the riders already on board have to accept. */
  waypoints: Joi.array().items(Joi.string()).max(5).default([]),
  date: Joi.date().required(),
  seats: Joi.number().integer().min(1).max(7)
.required(), // Number of available seats
  // Cost share per seat: a split of fuel/parking, not a fare (Terms s.10).
  fare: Joi.number().min(0).max(100).default(0),
  shareCode: Joi.string().optional(),
  // Denormalised route figures. Populated at creation from OSRM when it is
  // reachable, otherwise from a great-circle estimate; routeEstimated marks
  // which is which so estimates can be backfilled later.
  distanceMi: Joi.number().min(0).max(10000).optional(),
  durationMin: Joi.number().integer().min(0).max(100000)
    .optional(),
  routeEstimated: Joi.boolean().optional(),
  notes: createSafeStringSchema({
    pattern: "generalText",
    min: 0,
    max: 500,
    required: false,
    allowEmpty: true,
    label: "Ride Notes",
  }),
  createdAt: Joi.date().optional(),
}).custom((obj, helpers) => {
  // Data Logic Validation

  // 1. Ensure rider count doesn't exceed available seats
  if (obj.riders && obj.seats && obj.riders.length > obj.seats) {
    return helpers.error("ride.capacity", {
      riderCount: obj.riders.length,
      seatCount: obj.seats,
    });
  }

  // 2. Ensure driver is not in riders array
  if (obj.driver && obj.riders && obj.riders.includes(obj.driver)) {
    return helpers.error("ride.driverAsRider", {
      driver: obj.driver,
    });
  }

  // 3. Ensure no duplicate riders
  if (obj.riders && obj.riders.length > 0) {
    const uniqueRiders = [...new Set(obj.riders)];
    if (uniqueRiders.length !== obj.riders.length) {
      return helpers.error("ride.duplicateRiders", {
        originalCount: obj.riders.length,
        uniqueCount: uniqueRiders.length,
      });
    }
  }

  // 4. Ensure origin and destination are different
  if (obj.origin && obj.destination && obj.origin === obj.destination) {
    return helpers.error("ride.sameLocation", {
      location: obj.origin,
    });
  }

  // 5. Stops must be real detours: no repeats, and none at either end
  if (obj.waypoints && obj.waypoints.length > 0) {
    const unique = [...new Set(obj.waypoints)];
    if (unique.length !== obj.waypoints.length) {
      return helpers.error("ride.duplicateWaypoints");
    }

    const ends = [obj.origin, obj.destination].filter(Boolean);
    const atEnd = obj.waypoints.find(stop => ends.includes(stop));
    if (atEnd) {
      return helpers.error("ride.waypointAtEnd", { location: atEnd });
    }
  }

  // 6. Ensure ride date is not in the past (only for new rides)
  if (obj.date && !obj._id) { // Only validate for new rides (no _id)
    const now = new Date();
    const rideDate = new Date(obj.date);
    // Allow some buffer (5 minutes) for clock differences and processing time
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (rideDate.getTime() < (now.getTime() - bufferTime)) {
      return helpers.error("ride.pastDate", {
        rideDate: rideDate.toISOString(),
        currentDate: now.toISOString(),
      });
    }
  }

  return obj;
}, "Ride data logic validation").messages({
  "ride.capacity": "Ride has {{#riderCount}} riders but only {{#seatCount}} seats available",
  "ride.driverAsRider": "Driver {{#driver}} cannot also be a rider",
  "ride.duplicateRiders": "Ride contains duplicate riders ({{#originalCount}} riders, {{#uniqueCount}} unique)",
  "ride.sameLocation": "Origin and destination cannot be the same location: {{#location}}",
  "ride.pastDate": "Ride date cannot be in the past ({{#rideDate}} is before {{#currentDate}})",
  "ride.duplicateWaypoints": "A ride cannot stop at the same place twice",
  "ride.waypointAtEnd": "A stop cannot also be the ride's start or end: {{#location}}",
});

/*
 * Indexes. The collection had none, so every ride query was a full scan whose
 * cost grew with total ride volume across all schools, not just the caller's.
 *
 * shareCode is unique+sparse so two rides can never hold the same invite code:
 * rides.generateShareCode relies on the duplicate-key error to retry rather
 * than on a read-then-write check, which could race.
 */
if (Meteor.isServer) {
  Meteor.startup(async () => {
    const indexes = [
      [{ shareCode: 1 }, { unique: true, sparse: true }],
      [{ schoolId: 1, date: 1 }],
      [{ driver: 1 }],
      [{ driver: 1, date: 1 }],
      [{ riders: 1 }],
      [{ date: 1 }],
    ];
    for (const [keys, options] of indexes) { // eslint-disable-line no-restricted-syntax
      try {
        await Rides.createIndexAsync(keys, options); // eslint-disable-line no-await-in-loop
      } catch (error) {
        console.error("[Rides] Could not create index", keys, error?.message || error);
      }
    }
  });
}

/** Make the collection available to other code. */
export { Rides, RidesSchema };
