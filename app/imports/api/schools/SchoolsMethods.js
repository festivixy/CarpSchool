import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import Joi from "joi";
import { Schools, SchoolsSchema, normaliseDomain } from "./Schools";
import { isSystemAdmin, isSchoolAdmin } from "../accounts/RoleUtils";

/* What an unauthenticated caller may learn about a school. Anything beyond
 * this -- settings, SMTP credentials, timestamps -- needs a role. */
const PUBLIC_SCHOOL_FIELDS = {
  name: 1, shortName: 1, code: 1, domain: 1, location: 1, isActive: 1,
};

Meteor.methods({
  /**
   * Create a new school (Admin only)
   */
  async "schools.create"(schoolData) {
    const currentUser = await Meteor.userAsync();
    if (!currentUser || !currentUser.roles?.includes("system")) {
      throw new Meteor.Error("access-denied", "Only system administrators can create schools");
    }

    /* Accept an email domain written the way people write one -- "@host", a
     * whole address, a pasted URL -- rather than rejecting it against a
     * regular expression the typist never saw. */
    const { error, value } = SchoolsSchema.validate({
      ...schoolData,
      ...(schoolData.domain === undefined
        ? {}
        : { domain: normaliseDomain(schoolData.domain) || undefined }),
      createdBy: currentUser._id,
      createdAt: new Date(),
    });

    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Check if school code already exists
    const existingSchool = await Schools.findOneAsync({ code: value.code });
    if (existingSchool) {
      throw new Meteor.Error("duplicate-code", `School with code '${value.code}' already exists`);
    }

    // Check if domain already exists (if provided)
    if (value.domain) {
      const existingDomain = await Schools.findOneAsync({ domain: value.domain });
      if (existingDomain) {
        throw new Meteor.Error("duplicate-domain", `School with domain '${value.domain}' already exists`);
      }
    }

    const schoolId = await Schools.insertAsync(value);
    return schoolId;
  },

  /**
   * Get school by code
   */
  async "schools.getByCode"(schoolCode) {
    check(schoolCode, String);

    const school = await Schools.findOneAsync(
      { code: schoolCode.toUpperCase(), isActive: true },
      { fields: PUBLIC_SCHOOL_FIELDS },
    );

    if (!school) {
      throw new Meteor.Error("school-not-found", `School with code '${schoolCode}' not found`);
    }

    return school;
  },

  /**
   * Get school by email domain
   */
  async "schools.getByDomain"(email) {
    check(email, String);

    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) {
      throw new Meteor.Error("invalid-email", "Invalid email format");
    }

    const school = await Schools.findOneAsync(
      { domain: domain, isActive: true },
      { fields: PUBLIC_SCHOOL_FIELDS },
    );

    return school; // May be null if no school found
  },

  /**
   * List schools accessible to current user
   */
  async "schools.list"() {
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");

    let query = { isActive: true };

    if (await isSystemAdmin(this.userId)) {
      // System admins can see all schools
      query = { isActive: true };
    } else if (await isSchoolAdmin(this.userId)) {
      // School admins can only see their own school
      query = { _id: currentUser.schoolId, isActive: true };
    } else {
      // Regular users can only see their own school
      if (!currentUser.schoolId) {
        return []; // User has no school assigned
      }
      query = { _id: currentUser.schoolId, isActive: true };
    }

    const schools = await Schools.find(
      query,
      {
        sort: { name: 1 },
        fields: { name: 1, shortName: 1, code: 1, location: 1 },
      },
    ).fetchAsync();

    return schools;
  },

  /**
   * Update school (Admin only)
   */
  async "schools.update"(schoolId, updateData) {
    check(schoolId, String);

    const currentUser = await Meteor.userAsync();
    if (!currentUser || !currentUser.roles?.includes("system")) {
      throw new Meteor.Error("access-denied", "Only system administrators can update schools");
    }

    const school = await Schools.findOneAsync(schoolId);
    if (!school) {
      throw new Meteor.Error("school-not-found", "School not found");
    }

    // Validate update data
    const { error, value } = SchoolsSchema.validate({
      ...school,
      ...updateData,
      ...(updateData.domain === undefined
        ? {}
        : { domain: normaliseDomain(updateData.domain) || undefined }),
    });

    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Remove fields that shouldn't be updated
    delete value._id;
    delete value.createdAt;
    delete value.createdBy;

    await Schools.updateAsync(schoolId, { $set: value });
    return true;
  },

  /**
   * Deactivate school (Admin only)
   */
  async "schools.deactivate"(schoolId) {
    check(schoolId, String);

    const currentUser = await Meteor.userAsync();
    if (!currentUser || !currentUser.roles?.includes("system")) {
      throw new Meteor.Error("access-denied", "Only system administrators can deactivate schools");
    }

    const result = await Schools.updateAsync(schoolId, {
      $set: { isActive: false },
    });

    if (result === 0) {
      throw new Meteor.Error("school-not-found", "School not found");
    }

    return true;
  },

  /**
   * Get school admin's own school data
   */
  async "schools.getMySchool"() {
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const isSchoolAdminUser = await isSchoolAdmin(this.userId);
    if (!isSchoolAdminUser) {
      throw new Meteor.Error("access-denied", "Only school administrators can access school data");
    }

    if (!currentUser.schoolId) {
      throw new Meteor.Error("no-school", "No school assigned to your account");
    }

    // SMTP credentials are reachable only through schools.getSmtpSettings,
    // which masks the password.
    const school = await Schools.findOneAsync(currentUser.schoolId, { fields: { smtpSettings: 0 } });
    if (!school) {
      throw new Meteor.Error("school-not-found", "School not found");
    }

    return school;
  },

  /**
   * Update school admin's own school basic information
   */
  async "schools.updateMySchool"(updateData) {
    // code and domain are identity: only a system admin may change them,
    // through schools.update. They are accepted here and ignored so an older
    // client's form does not fail the check.
    check(updateData, {
      name: String,
      shortName: String,
      code: Match.Optional(String),
      domain: Match.Optional(Match.OneOf(String, null)),
      location: Object,
      settings: Object,
    });

    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const isSchoolAdminUser = await isSchoolAdmin(this.userId);
    if (!isSchoolAdminUser) {
      throw new Meteor.Error("access-denied", "Only school administrators can update school data");
    }

    if (!currentUser.schoolId) {
      throw new Meteor.Error("no-school", "No school assigned to your account");
    }

    // Create a simplified validation schema for updates
    const updateSchema = Joi.object({
      name: Joi.string().required().min(2).max(100),
      shortName: Joi.string().required().min(2).max(20),
      code: Joi.any().strip(),
      domain: Joi.any().strip(),
      location: Joi.object({
        city: Joi.string().allow("").optional(),
        province: Joi.string().allow("").optional(),
        country: Joi.string().default("Canada"),
        address: Joi.string().allow("").optional(),
        coordinates: Joi.object({
          lat: Joi.number().required(),
          lng: Joi.number().required(),
        }).required(),
      }).optional(),
      settings: Joi.object({
        allowPublicRegistration: Joi.boolean().default(true),
        requireEmailVerification: Joi.boolean().default(true),
        requireDomainMatch: Joi.boolean().default(false),
        maxRideDistance: Joi.number().default(50),
      }).default({}),
    });

    const { error, value } = updateSchema.validate(updateData);

    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Update the school
    await Schools.updateAsync(currentUser.schoolId, {
      $set: {
        name: value.name,
        shortName: value.shortName,
        location: value.location,
        settings: value.settings,
        updatedAt: new Date(),
        updatedBy: this.userId,
      }
    });

    return {
      success: true,
      message: "School information updated successfully",
    };
  },
});
