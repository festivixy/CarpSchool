import { Mongo } from "meteor/mongo";
import Joi from "joi";
import { createSafeStringSchema, createSafeUriSchema } from "../../ui/utils/validation";

/** Define a Mongo collection to hold the data. */
const Profiles = new Mongo.Collection("Profiles");

/** Define a Joi schema to specify the structure of each document in the collection. */
const ProfileSchema = Joi.object({
  _id: Joi.string().optional(),
  Name: createSafeStringSchema({
    pattern: "name",
    min: 1,
    max: 100,
    label: "Name",
  }),
  Location: createSafeStringSchema({
    pattern: "location",
    min: 1,
    max: 200,
    label: "Location",
  }),
  Image: createSafeUriSchema({
    schemes: ["http", "https", "data"],
    required: false,
    allowEmpty: true,
    max: 500,
    label: "Profile Image",
  }),
  Ride: createSafeStringSchema({
    pattern: "generalText",
    min: 0,
    max: 200,
    required: false,
    allowEmpty: true,
    label: "Ride Information",
  }),
  Phone: createSafeStringSchema({
    pattern: "phone",
    min: 0,
    max: 20,
    required: false,
    allowEmpty: true,
    label: "Phone Number",
  }),
  Other: createSafeStringSchema({
    pattern: "generalText",
    min: 0,
    max: 500,
    required: false,
    allowEmpty: true,
    label: "Additional Information",
  }),
  UserType: Joi.string().valid("Driver", "Rider", "Both").default("Driver"),
  major: createSafeStringSchema({
    pattern: "generalText",
    min: 0,
    max: 100,
    required: false,
    allowEmpty: true,
    label: "Major",
  }),
  year: Joi.string().valid("Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Faculty/Staff").optional(),
  campus: createSafeStringSchema({
    pattern: "generalText",
    min: 0,
    max: 100,
    required: false,
    allowEmpty: true,
    label: "Campus Location",
  }),
  verified: Joi.boolean().default(false),
  requested: Joi.boolean().default(false),
  rejected: Joi.boolean().default(false),
  schoolemail: createSafeStringSchema({
    pattern: "email",
    min: 0,
    max: 255,
    required: false,
    allowEmpty: true,
    label: "School Email",
  }),
  approvedAt: Joi.date().optional(),
  approvedBy: Joi.string().optional(),
  rejectedAt: Joi.date().optional(),
  rejectedBy: Joi.string().optional(),
  rejectionReason: createSafeStringSchema({
    pattern: "generalText",
    min: 0,
    max: 500,
    required: false,
    allowEmpty: true,
    label: "Rejection Reason",
  }),
  // Persona Identity Verification
  identityVerified: Joi.boolean().default(false),
  personaInquiryId: Joi.string().optional(),
  verifiedAt: Joi.date().optional(),
  Owner: Joi.string().required(),
});

/** Make the collection and schema available to other code. */
export { Profiles, ProfileSchema };
