import { Mongo } from "meteor/mongo";
import Joi from "joi";

export const Verifications = new Mongo.Collection("verifications");

// Verification Schema
const VerificationSchema = Joi.object({
  userId: Joi.string().required(),
  userType: Joi.string().valid("Driver", "Rider").required(),
  verificationStatus: Joi.string().valid("pending", "verified", "rejected").default("pending"),
  verifiedAt: Joi.date().optional(),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(() => new Date()),
});

export { VerificationSchema };
