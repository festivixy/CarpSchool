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
  date: Joi.date().required(),
  seats: Joi.number().integer().min(1).max(7)
.required(), // Number of available seats
  shareCode: Joi.string().optional(),
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

  // 5. Ensure ride date is not in the past (only for new rides)
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
});

/** Make the collection available to other code. */
export { Rides, RidesSchema };
