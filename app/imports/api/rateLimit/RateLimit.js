import { Mongo } from "meteor/mongo";
import Joi from "joi";
import JoiBridge from "../../ui/forms/JoiBridge";

/**
 * The RateLimit collection for tracking API call rate limiting
 */
export const RateLimit = new Mongo.Collection("rateLimit");

/**
 * Schema for RateLimit collection
 * Tracks rate limiting data for API calls per user
 */
export const RateLimitSchema = Joi.object({
  _id: Joi.string().optional(),
  name: Joi.string().required().description("Name/identifier for the API endpoint or action"),
  userId: Joi.string().required().description("User ID making the API calls"),
  limit: Joi.number().integer().positive().required().description("Rate limit in milliseconds between calls"),
  lastCalled: Joi.date().required().description("Timestamp of the last API call"),
  createdAt: Joi.date().default(new Date()).description("When this rate limit record was created"),
  updatedAt: Joi.date().default(new Date()).description("When this rate limit record was last updated"),
}).meta({ className: "RateLimit" });

/**
 * Attach the schema to the collection
 */
RateLimit.attachSchema(new JoiBridge(RateLimitSchema));

/**
 * Deny all client-side updates for security
 */
RateLimit.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
