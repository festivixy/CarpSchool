import { Meteor } from "meteor/meteor";
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
    min: 0,
    max: 200,
    required: false,
    allowEmpty: true,
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

  /* Who the account belongs to, which is a different axis from UserType:
   * a parent may still drive. A parent reaches the school through a student
   * who claims them rather than through an email domain, so until that
   * happens they have no schoolId and cannot be approved. */
  accountType: Joi.string().valid("student", "parent").default("student"),

  /* Set on a parent's profile: the students who have claimed them. A parent
   * with an empty list is unclaimed and stays out of the approval queue. */
  guardianOf: Joi.array().items(Joi.string()).default([]),
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
  /* Suspension is the administrator's control once a verified school address
   * is enough to get in on its own. Reversible, and it keeps the account's
   * rides and messages -- delete is the permanent one and stays for the cases
   * that warrant it. `verified` is cleared alongside, so every existing route
   * gate keeps working without knowing about this. */
  suspended: Joi.boolean().default(false),
  suspendedAt: Joi.date().optional(),
  suspendedBy: Joi.string().optional(),
  suspensionReason: createSafeStringSchema({
    pattern: "generalText",
    min: 0,
    max: 500,
    required: false,
    allowEmpty: true,
    label: "Suspension Reason",
  }),

  identityVerified: Joi.boolean().default(false),
  personaInquiryId: Joi.string().optional(),
  verifiedAt: Joi.date().optional(),
  // Recorded acceptance of the Terms of Use and Privacy Policy at onboarding.
  termsAcceptedAt: Joi.date().optional(),
  termsVersion: Joi.string().max(40).optional(),
  createdAt: Joi.date().optional(),
  Owner: Joi.string().required(),
});

/*
 * One profile per user. Every read is `{ Owner }` + findOne, so a second
 * document for the same Owner is invisible and can silently carry a different
 * approval state. Duplicates are collapsed to the newest before the unique
 * index is created; if that still fails it is logged, never thrown.
 */
if (Meteor.isServer) {
  Meteor.startup(async () => {
    try {
      const duplicates = await Profiles.rawCollection().aggregate([
        { $group: { _id: "$Owner", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
      ]).toArray();

      for (const { _id: owner } of duplicates) { // eslint-disable-line no-restricted-syntax
        const docs = await Profiles.find( // eslint-disable-line no-await-in-loop
          { Owner: owner },
          { fields: { _id: 1, createdAt: 1 }, sort: { createdAt: -1, _id: -1 } },
        ).fetchAsync();
        const stale = docs.slice(1).map(doc => doc._id);
        await Profiles.removeAsync({ _id: { $in: stale } }); // eslint-disable-line no-await-in-loop
        console.warn(`[Profiles] Removed ${stale.length} duplicate profile(s) for ${owner}`);
      }

      await Profiles.createIndexAsync({ Owner: 1 }, { unique: true });
    } catch (error) {
      console.error("[Profiles] Could not create Owner index", error?.message || error);
    }
  });
}

/** Make the collection and schema available to other code. */
export { Profiles, ProfileSchema };
