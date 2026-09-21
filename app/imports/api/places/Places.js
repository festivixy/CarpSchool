import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import Joi from "joi";
import { createSafeStringSchema, createCoordinatesSchema } from "../../ui/utils/validation";

/** Define a Mongo collection to hold the places data. */
const Places = new Mongo.Collection("Places");

const PlacesSchema = Joi.object({
  _id: Joi.string().optional(),
  schoolId: Joi.string().optional().label("School ID"), // School this place belongs to
  text: createSafeStringSchema({
    pattern: "location",
    min: 1,
    max: 100,
    label: "Location Name",
  }),
  value: createCoordinatesSchema(),

  /* What the coordinates resolve to, kept so a place reads as a street
   * address rather than a pair of numbers. Written when the place is made and
   * not refreshed: an address that moves under a fixed point is worse than a
   * slightly stale one. */
  address: createSafeStringSchema({
    pattern: "generalText",
    min: 0,
    max: 300,
    required: false,
    allowEmpty: true,
    label: "Address",
  }),

  /* A place every member of the school can use -- the school gates, the main
   * car park. Only an administrator may set it, and it is published to the
   * whole school rather than to its creator alone. */
  isShared: Joi.boolean().default(false).label("Shared with the school"),
  createdBy: Joi.string().required().label("Created By User ID"),
  createdAt: Joi.date().required().label("Created Date"),
  updatedAt: Joi.date().optional().label("Updated Date"),
});

/*
 * A user may not hold two places with the same name (places.insert already
 * refuses it, but only after a read). The school+text index backs the admin
 * lists and the per-school lookups. Failures are logged, not thrown, so a
 * legacy duplicate cannot stop the server from booting.
 */
if (Meteor.isServer) {
  Meteor.startup(async () => {
    const indexes = [
      [{ createdBy: 1, text: 1 }, { unique: true }],
      [{ schoolId: 1, text: 1 }],
    ];
    for (const [keys, options] of indexes) { // eslint-disable-line no-restricted-syntax
      try {
        await Places.createIndexAsync(keys, options); // eslint-disable-line no-await-in-loop
      } catch (error) {
        console.error("[Places] Could not create index", keys, error?.message || error);
      }
    }
  });
}

/** Make the collection and schema available to other code. */
export { Places, PlacesSchema };
