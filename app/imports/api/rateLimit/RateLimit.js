import { Mongo } from "meteor/mongo";
import Joi from "joi";

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
  limit: Joi.number().integer().min(0).required().description("Rate limit in milliseconds between calls (0 for publications)"),
  lastCalled: Joi.date().required().description("Timestamp of the last API call"),
  callCount: Joi.number().integer().min(0).default(0).description("Total number of calls made"),
  firstCall: Joi.date().optional().description("Timestamp of the first call (for analytics)"),
  createdAt: Joi.date().default(new Date()).description("When this rate limit record was created"),
  updatedAt: Joi.date().default(new Date()).description("When this rate limit record was last updated"),
}).meta({ className: "RateLimit" });

/**
 * Deny all client-side updates for security
 */
RateLimit.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
