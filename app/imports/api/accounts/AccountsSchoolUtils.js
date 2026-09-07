import { Meteor } from "meteor/meteor";
import { Schools } from "../schools/Schools";

/*
 * Indexes on Meteor.users. clerkUserId is the lookup key for every Clerk
 * login and must be unique; sparse so password-only accounts (no profile
 * key) do not collide on null. Failures are logged rather than thrown so a
 * pre-existing duplicate cannot stop the server booting.
 */
if (Meteor.isServer) {
  Meteor.startup(async () => {
    const indexes = [
      [{ "profile.clerkUserId": 1 }, { unique: true, sparse: true }],
      [{ schoolId: 1 }],
      [{ schoolId: 1, createdAt: -1 }],
    ];
    for (const [keys, options] of indexes) { // eslint-disable-line no-restricted-syntax
      try {
        await Meteor.users.createIndexAsync(keys, options); // eslint-disable-line no-await-in-loop
      } catch (error) {
        console.error("[users] Could not create index", keys, error?.message || error);
      }
    }
  });
}

/**
 * Get user's school
 */
export async function getUserSchool(userId) {
  if (!userId) return null;

  const user = await Meteor.users.findOneAsync(userId);
  if (!user || !user.schoolId) return null;

  return Schools.findOneAsync(user.schoolId);
}

/**
 * Get current user's school
 */
export async function getCurrentUserSchool() {
  const userId = Meteor.userId();
  return getUserSchool(userId);
}

/**
 * Check if user belongs to a specific school
 */
export async function userBelongsToSchool(userId, schoolId) {
  if (!userId || !schoolId) return false;

  const user = await Meteor.users.findOneAsync(userId);
  return user?.schoolId === schoolId;
}

/**
 * Validate user can access school-specific data
 */
export async function validateSchoolAccess(userId, schoolId) {
  const user = await Meteor.users.findOneAsync(userId);

  // System admins can access any school, school admins only their own
  const { isSystemAdmin, isSchoolAdmin } = await import("./RoleUtils");
  if (await isSystemAdmin(userId)) {
    return true;
  } if (await isSchoolAdmin(userId)) {
    // School admins can only access their own school
    if (user?.schoolId === schoolId) {
      return true;
    }
    throw new Meteor.Error("access-denied", "School admins can only access data from their own school");
  }

  // Users can only access their own school
  if (user?.schoolId === schoolId) {
    return true;
  }

  throw new Meteor.Error("access-denied", "You can only access data from your school");
}

/**
 * Get school filter for current user
 */
export async function getSchoolFilter(userId = null) {
  const currentUserId = userId || Meteor.userId();
  if (!currentUserId) {
    throw new Meteor.Error("not-logged-in", "Please log in first");
  }

  const user = await Meteor.users.findOneAsync(currentUserId);

  // System admins can see all schools, school admins only their own
  const { isSystemAdmin, isSchoolAdmin } = await import("./RoleUtils");
  if (await isSystemAdmin(currentUserId)) {
    return {}; // No filter for system admins
  } if (await isSchoolAdmin(currentUserId)) {
    // School admins can only see their own school. This is a filter on
    // school-scoped documents (rides etc.), so the key is schoolId, not _id.
    return { schoolId: user.schoolId };
  }

  // Regular users can only see their school
  if (!user?.schoolId) {
    throw new Meteor.Error("no-school", "User has no school assigned");
  }

  return { schoolId: user.schoolId };
}

/**
 * Auto-detect school from email domain
 */
export async function detectSchoolFromEmail(email) {
  if (!email || !email.includes("@")) return null;

  const domain = email.split("@")[1].toLowerCase();

  const school = await Schools.findOneAsync({
    domain: domain,
    isActive: true,
  });

  return school;
}
