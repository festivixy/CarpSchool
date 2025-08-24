import { Mongo } from "meteor/mongo";
import Joi from "joi";
import { createSafeStringSchema, VALIDATION_PATTERNS } from "../../ui/utils/validation";

/** Define a Mongo collection to hold the places data. */
const Places = new Mongo.Collection("Places");

const PlacesSchema = Joi.object({
  _id: Joi.string().optional(),
  schoolId: Joi.string().required().label("School ID"), // School this place belongs to
  text: createSafeStringSchema({
    pattern: "location",
    min: 1,
    max: 100,
    label: "Location Name",
  }),
  value: Joi.string()
    .required()
    .pattern(VALIDATION_PATTERNS.coordinates)
    .label("Coordinates (lat,lng)"),
  createdBy: Joi.string().required().label("Created By User ID"),
  createdAt: Joi.date().required().label("Created Date"),
  updatedAt: Joi.date().optional().label("Updated Date"),
});

/** Make the collection and schema available to other code. */
export { Places, PlacesSchema };
