import { Mongo } from "meteor/mongo";
import Joi from "joi";
import { MINUTES_IN_DAY } from "./availabilityTime";

/**
 * When a driver is willing to carry someone.
 *
 * Two kinds share one collection because riders browse them in a single list:
 *
 *   weekly  a recurring window in the school's local time, e.g. Mon 08:00-09:00
 *   now     an instant "I'm available" that expires on its own
 *
 * Both carry a route, because a time on its own does not tell a rider whether
 * the driver is going their way.
 */
const Availabilities = new Mongo.Collection("Availabilities");

const AvailabilitySchema = Joi.object({
  _id: Joi.string().optional(),

  driver: Joi.string().required(),
  schoolId: Joi.string().required(),

  kind: Joi.string().valid("weekly", "now").required(),

  // Weekly slots. Sunday-first, matching Date.getDay().
  dayOfWeek: Joi.number().integer().min(0).max(6)
    .when("kind", { is: "weekly", then: Joi.required(), otherwise: Joi.forbidden() }),
  startMinutes: Joi.number().integer().min(0).max(MINUTES_IN_DAY - 1)
    .when("kind", { is: "weekly", then: Joi.required(), otherwise: Joi.forbidden() }),
  endMinutes: Joi.number().integer().min(1).max(MINUTES_IN_DAY)
    .when("kind", { is: "weekly", then: Joi.required(), otherwise: Joi.forbidden() }),

  // Instant availability. Expiry is absolute so a forgotten toggle lapses on
  // its own rather than leaving a driver listed indefinitely.
  expiresAt: Joi.date()
    .when("kind", { is: "now", then: Joi.required(), otherwise: Joi.forbidden() }),

  // Places ids, exactly as a ride stores them.
  origin: Joi.string().required(),
  destination: Joi.string().required(),

  seats: Joi.number().integer().min(1).max(7)
    .default(1),

  note: Joi.string().allow("").max(140).default(""),

  createdAt: Joi.date().required(),
  updatedAt: Joi.date().optional(),
})
  .custom((value, helpers) => {
    if (value.kind === "weekly" && value.endMinutes <= value.startMinutes) {
      return helpers.error("any.invalid", { message: "endMinutes must be after startMinutes" });
    }
    if (value.origin === value.destination) {
      return helpers.error("any.invalid", { message: "origin and destination must differ" });
    }
    return value;
  });

export { Availabilities, AvailabilitySchema };
