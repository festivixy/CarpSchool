import { Mongo } from "meteor/mongo";
import Joi from "joi";

export const SchoolEmailVerifications = new Mongo.Collection("schoolEmailVerifications");

// School Email Verification Schema
const SchoolEmailVerificationSchema = Joi.object({
  userId: Joi.string().required(),
  email: Joi.string().email().required(),
  schoolId: Joi.string().required(),
  verificationCode: Joi.string().length(6).required(),
  attempts: Joi.number().integer().min(0).default(0),
  maxAttempts: Joi.number().integer().min(1).default(5),
  verified: Joi.boolean().default(false),
  expiresAt: Joi.date().required(),
  createdAt: Joi.date().default(() => new Date()),
  verifiedAt: Joi.date().optional(),
});

export { SchoolEmailVerificationSchema };
