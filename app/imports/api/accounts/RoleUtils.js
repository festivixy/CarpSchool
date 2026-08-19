import { Meteor } from "meteor/meteor";
import { Schools } from "../schools/Schools";

/**
 * School-aware role management utilities
 */

/**
 * Check if user has system role (global access)
 */
export async function isSystemAdmin(userId = null) {
  const user = await Meteor.users.findOneAsync(userId || Meteor.userId());
  return user?.roles?.includes("system") || false;
}

/**
 * Check if user is admin of a specific school
 */
export async function isSchoolAdmin(userId = null, schoolId = null) {
  const user = await Meteor.users.findOneAsync(userId || Meteor.userId());
  if (!user?.roles) return false;

  // If no schoolId provided, check if user is admin of their own school
  const targetSchoolId = schoolId || user.schoolId;
  if (!targetSchoolId) return false;

  return user.roles.includes(`admin.${targetSchoolId}`);
}

/**
 * Check if user has any admin role (system or school-specific)
 */
export async function isAnyAdmin(userId = null) {
  const user = await Meteor.users.findOneAsync(userId || Meteor.userId());
  if (!user?.roles) return false;

  // Check for system role
  if (user.roles.includes("system")) return true;

  // Check for any school admin role
  return user.roles.some(role => role.startsWith("admin."));
}

/**
 * Get user's admin schools (returns array of schoolIds user can admin)
 */
export async function getUserAdminSchools(userId = null) {
  const user = await Meteor.users.findOneAsync(userId || Meteor.userId());
  if (!user?.roles) return [];

  // System admins can admin all schools
  if (user.roles.includes("system")) {
    const allSchools = await Schools.find({ isActive: true }).fetchAsync();
    return allSchools.map(school => school._id);
  }

  // Extract school IDs from admin roles
  return user.roles
    .filter(role => role.startsWith("admin."))
    .map(role => role.replace("admin.", ""));
}

/**
 * Check if user can manage another user (based on school and role hierarchy)
 */
export async function canManageUser(managerId, targetUserId) {
  const manager = await Meteor.users.findOneAsync(managerId);
  const target = await Meteor.users.findOneAsync(targetUserId);

  if (!manager || !target) return false;

  // System admins can manage anyone
  if (manager.roles?.includes("system")) return true;

  // School admins can only manage users from their school
  if (manager.schoolId !== target.schoolId) return false;

  // Check if manager is admin of the target's school
  return isSchoolAdmin(managerId, target.schoolId);
}

/**
 * Validate admin action permissions
 */
export async function validateAdminAction(
  userId,
  targetSchoolId = null,
  action = "manage",
) { // eslint-disable-line no-unused-vars
  const user = await Meteor.users.findOneAsync(userId);

  if (!user) {
    throw new Meteor.Error("user-not-found", "User not found");
  }

  // System admins can do anything
  if (user.roles?.includes("system")) {
    return true;
  }

  // For school-specific actions
  if (targetSchoolId) {
    if (await isSchoolAdmin(userId, targetSchoolId)) {
      return true;
    }
    throw new Meteor.Error("access-denied", "You don't have admin access to this school");
  }

  // For general admin actions, check if user has any admin role
  if (await isAnyAdmin(userId)) {
    return true;
  }

  throw new Meteor.Error("access-denied", "You don't have admin permissions for this action");
}

/**
 * Get role display name for UI
 */
export function getRoleDisplayName(role) {
  if (role === "system") return "System Administrator";
  if (role.startsWith("admin.")) {
    return "School Administrator";
  }
  return role;
}

/**
 * Add school admin role to user
 */
export async function addSchoolAdminRole(userId, schoolId) {
  const role = `admin.${schoolId}`;

  await Meteor.users.updateAsync(userId, {
    $addToSet: { roles: role },
  });

  return role;
}

/**
 * Remove school admin role from user
 */
export async function removeSchoolAdminRole(userId, schoolId) {
  const role = `admin.${schoolId}`;

  await Meteor.users.updateAsync(userId, {
    $pull: { roles: role },
  });

  return true;
}

/**
 * Add system role to user (system admin only)
 */
export async function addSystemRole(managerId, targetUserId) {
  // Only system admins can create other system admins
  if (!await isSystemAdmin(managerId)) {
    throw new Meteor.Error("access-denied", "Only system administrators can assign system role");
  }

  await Meteor.users.updateAsync(targetUserId, {
    $addToSet: { roles: "system" },
  });

  return true;
}

/*
 * The former "*Sync" helpers (isSystemAdminSync, isSchoolAdminSync,
 * isAnyAdminSync, getUserAdminSchoolsSync) were removed.
 *
 * They were declared `async` despite the name and the "publications cannot use
 * async/await" comment above them, so each returned a Promise. Callers used
 * them un-awaited inside boolean guards — `if (!isAnyAdminSync(this.userId))`
 * — and `!Promise` is always false, so the admin check never fired. Every
 * authenticated user was served the full allVerifications set and the
 * rateLimit.admin / rateLimit.stats records.
 *
 * The guards went unnoticed because the publications early-return when
 * this.userId is null, and Meteor sessions were never established until the
 * Clerk login handler landed.
 *
 * Publications can be async in Meteor 3. Use the awaited isSystemAdmin,
 * isSchoolAdmin, isAnyAdmin and getUserAdminSchools above instead.
 */
