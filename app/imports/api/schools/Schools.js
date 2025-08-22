import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold school data. */
const Schools = new Mongo.Collection("Schools");

const SchoolsSchema = Joi.object({
  _id: Joi.string().optional(),
  name: Joi.string().required().min(2).max(100), // e.g., "Simon Fraser University"
  shortName: Joi.string().required().min(2).max(20), // e.g., "SFU"
  domain: Joi.string().email().optional(), // e.g., "sfu.ca" for email verification
  code: Joi.string().required().min(2).max(10).uppercase(), // e.g., "SFU", "UBC"
  location: Joi.object({
    city: Joi.string().required(),
    province: Joi.string().required(),
    country: Joi.string().default("Canada"),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }).optional(),
  }).required(),
  settings: Joi.object({
    allowPublicRegistration: Joi.boolean().default(true),
    requireEmailVerification: Joi.boolean().default(true),
    requireDomainMatch: Joi.boolean().default(false), // Require email domain to match school domain
    maxRideDistance: Joi.number().default(50), // Max km for rides
  }).default({}),
  isActive: Joi.boolean().default(true),
  createdAt: Joi.date().default(() => new Date()),
  createdBy: Joi.string().required(), // Admin who created the school
});

Schools.attachSchema(SchoolsSchema);

// Create indexes for performance
if (Meteor.isServer) {
  Schools.createIndex({ code: 1 }, { unique: true });
  Schools.createIndex({ domain: 1 }, { sparse: true });
  Schools.createIndex({ isActive: 1 });
}

export { Schools, SchoolsSchema };
