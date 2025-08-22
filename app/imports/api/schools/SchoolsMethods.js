import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Schools, SchoolsSchema } from "./Schools";

Meteor.methods({
  /**
   * Create a new school (Admin only)
   */
  async "schools.create"(schoolData) {
    const currentUser = await Meteor.userAsync();
    if (!currentUser || !currentUser.roles?.includes("admin")) {
      throw new Meteor.Error("access-denied", "Only administrators can create schools");
    }

    // Validate school data
    const { error, value } = SchoolsSchema.validate({
      ...schoolData,
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

    const school = await Schools.findOneAsync({
      code: schoolCode.toUpperCase(),
      isActive: true
    });

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

    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      throw new Meteor.Error("invalid-email", "Invalid email format");
    }

    const school = await Schools.findOneAsync({
      domain: domain,
      isActive: true
    });

    return school; // May be null if no school found
  },

  /**
   * List all active schools
   */
  async "schools.list"() {
    const schools = await Schools.find(
      { isActive: true },
      {
        sort: { name: 1 },
        fields: { name: 1, shortName: 1, code: 1, location: 1 }
      }
    ).fetchAsync();

    return schools;
  },

  /**
   * Update school (Admin only)
   */
  async "schools.update"(schoolId, updateData) {
    check(schoolId, String);

    const currentUser = await Meteor.userAsync();
    if (!currentUser || !currentUser.roles?.includes("admin")) {
      throw new Meteor.Error("access-denied", "Only administrators can update schools");
    }

    const school = await Schools.findOneAsync(schoolId);
    if (!school) {
      throw new Meteor.Error("school-not-found", "School not found");
    }

    // Validate update data
    const { error, value } = SchoolsSchema.validate({
      ...school,
      ...updateData,
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
    if (!currentUser || !currentUser.roles?.includes("admin")) {
      throw new Meteor.Error("access-denied", "Only administrators can deactivate schools");
    }

    const result = await Schools.updateAsync(schoolId, {
      $set: { isActive: false }
    });

    if (result === 0) {
      throw new Meteor.Error("school-not-found", "School not found");
    }

    return true;
  },
});
