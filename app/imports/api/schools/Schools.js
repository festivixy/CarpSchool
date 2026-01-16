import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold school data. */
const Schools = new Mongo.Collection("Schools");

const SchoolsSchema = Joi.object({
  _id: Joi.string().optional(),
  name: Joi.string().required().min(2).max(100), // e.g., "Simon Fraser School"
  shortName: Joi.string().required().min(2).max(20), // e.g., "SFU"
  domain: Joi.string().pattern(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).optional(), // e.g., "sfu.ca" for email verification
  code: Joi.string().required().min(2).max(10)
.uppercase(), // e.g., "SFU", "UBC"
  location: Joi.object({
    city: Joi.string().optional(),
    province: Joi.string().optional(),
    country: Joi.string().default("Canada"),
    address: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }).required(),
  }).optional(),
  settings: Joi.object({
    allowPublicRegistration: Joi.boolean().default(true),
    requireEmailVerification: Joi.boolean().default(true),
    requireDomainMatch: Joi.boolean().default(false), // Require email domain to match school domain
    maxRideDistance: Joi.number().default(50), // Max km for rides
  }).default({}),
  isActive: Joi.boolean().default(true),
  smtpSettings: Joi.object({
    email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).optional(),
    password: Joi.string().min(1).max(255).optional(),
    host: Joi.string().hostname().optional(),
    port: Joi.number().integer().min(1).max(65535).default(587),
    secure: Joi.boolean().default(false),
    enabled: Joi.boolean().default(false),
  }).optional(),
  createdAt: Joi.date().default(() => new Date()),
  createdBy: Joi.string().required(), // Admin who created the school
});

// Create indexes for performance (server-side only)
if (Meteor.isServer) {
  Meteor.startup(() => {
    Schools.createIndex({ code: 1 }, { unique: true });
    Schools.createIndex({ domain: 1 }, { sparse: true });
    Schools.createIndex({ isActive: 1 });
  });
}

/** Make the collection and schema available to other code. */
export { Schools, SchoolsSchema };
