import { Meteor } from "meteor/meteor";
import { isSystemAdmin, isSchoolAdmin } from "../accounts/RoleUtils";
import { Schools } from "../schools/Schools";

/**
 * Resolve the calling admin's data scope once, so every dashboard method
 * applies the same rule instead of re-deriving it.
 *
 * System admins see every school (empty filters). School admins are pinned to
 * their own `schoolId`. Anyone else is rejected outright.
 *
 * Returns:
 *   isSystem            — true for the global "system" role
 *   schoolId            — null for system admins
 *   schoolName          — display name of the admin's school (null for system)
 *   schoolShortName     — e.g. "MIT", used in the sidebar account block
 *   maxRideDistanceKm   — the school's ride-distance ceiling, for the "long" flag
 *   rideFilter          — Mongo selector fragment for Rides / RideSessions
 *   userFilter          — Mongo selector fragment for Meteor.users
 */
export async function requireAdminScope(userId) {
  if (!userId) {
    throw new Meteor.Error("not-authorized", "You must be signed in.");
  }

  const user = await Meteor.users.findOneAsync(userId, {
    fields: { schoolId: 1, roles: 1 },
  });
  if (!user) {
    throw new Meteor.Error("not-authorized", "You must be signed in.");
  }

  const isSystem = await isSystemAdmin(userId);
  const isSchool = isSystem ? false : await isSchoolAdmin(userId);

  if (!isSystem && !isSchool) {
    throw new Meteor.Error("access-denied", "Administrator access required.");
  }

  const schoolId = isSystem ? null : (user.schoolId || null);

  let schoolName = null;
  let schoolShortName = null;
  let maxRideDistanceKm = null;

  if (schoolId) {
    const school = await Schools.findOneAsync(schoolId, {
      fields: { name: 1, shortName: 1, settings: 1 },
    });
    schoolName = school?.name || null;
    schoolShortName = school?.shortName || null;
    maxRideDistanceKm = school?.settings?.maxRideDistance ?? null;
  }

  return {
    isSystem,
    schoolId,
    schoolName,
    schoolShortName,
    maxRideDistanceKm,
    rideFilter: schoolId ? { schoolId } : {},
    userFilter: schoolId ? { schoolId } : {},
  };
}

export default requireAdminScope;
