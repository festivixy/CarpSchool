import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import Joi from "joi";

export const Verifications = new Mongo.Collection("verifications");

// Verification Schema
const VerificationSchema = Joi.object({
  userId: Joi.string().required(),
  userType: Joi.string().valid("Driver", "Rider", "Both").required(),
  verificationStatus: Joi.string().valid("pending", "verified", "rejected").default("pending"),
  verifiedAt: Joi.date().optional(),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(() => new Date()),
});

/* One verification record per user; verify.finish upserts by userId. */
if (Meteor.isServer) {
  Meteor.startup(async () => {
    try {
      await Verifications.createIndexAsync({ userId: 1 }, { unique: true });
    } catch (error) {
      console.error("[Verifications] Could not create userId index", error?.message || error);
    }
  });
}

export { VerificationSchema };
