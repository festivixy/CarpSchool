import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Schools } from "./Schools";

/**
 * Publish schools accessible to current user
 */
Meteor.publish("schools.active", async function publishActiveSchools() {
  if (!this.userId) {
    return this.ready();
  }

  const user = await Meteor.users.findOneAsync(this.userId);
  if (!user) {
    return this.ready();
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");

  let query = { isActive: true };

  if (await isSystemAdmin(this.userId)) {
    // System admins can see all schools
    query = { isActive: true };
  } else if (await isSchoolAdmin(this.userId)) {
    // School admins can only see their own school
    query = { _id: user.schoolId, isActive: true };
  } else {
    // Regular users can only see their own school
    if (!user.schoolId) {
      return this.ready(); // User has no school assigned
    }
    query = { _id: user.schoolId, isActive: true };
  }

  return Schools.find(
    query,
    {
      fields: {
        name: 1,
        shortName: 1,
        code: 1,
        location: 1,
        settings: 1,
      },
      sort: { name: 1 },
    },
  );
});

/**
 * Publish all schools (system admins only)
 */
Meteor.publish("schools.all", async function publishAllSchools() {
  const user = await Meteor.users.findOneAsync(this.userId);
  if (!user || !user.roles?.includes("system")) {
    return this.ready();
  }

  return Schools.find({}, { sort: { name: 1 } });
});

/**
 * Publish schools for onboarding (all active schools for school selection)
 */
Meteor.publish("schools.onboarding", function publishSchoolsForOnboarding() {
  if (!this.userId) {
    return this.ready();
  }

  // During onboarding, users need to see all active schools to choose from
  return Schools.find(
    { isActive: true },
    {
      fields: {
        name: 1,
        shortName: 1,
        code: 1,
        domain: 1,
        location: 1,
        settings: 1,
      },
      sort: { name: 1 },
    },
  );
});

/**
 * Publish single school by ID
 */
Meteor.publish("schools.byId", function publishSchoolById(schoolId) {
  check(schoolId, String);

  return Schools.find(
    { _id: schoolId, isActive: true },
    {
      fields: {
        name: 1,
        shortName: 1,
        code: 1,
        location: 1,
        settings: 1,
      },
    },
  );
});

/**
 * Publish school admin's own school data for management
 */
Meteor.publish("schools.mySchool", async function publishMySchool() {
  if (!this.userId) {
    return this.ready();
  }

  const user = await Meteor.users.findOneAsync(this.userId);
  if (!user || !user.schoolId) {
    return this.ready();
  }

  // Check if user is school admin
  const { isSchoolAdmin } = await import("../accounts/RoleUtils");
  const isSchoolAdminUser = await isSchoolAdmin(this.userId);

  if (!isSchoolAdminUser) {
    return this.ready();
  }

  return Schools.find(
    { _id: user.schoolId },
    {
      fields: {
        name: 1,
        shortName: 1,
        code: 1,
        domain: 1,
        location: 1,
        settings: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  );
});
