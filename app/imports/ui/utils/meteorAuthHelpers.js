import { Meteor } from "meteor/meteor";

/**
 * Helper functions for Clerk-Meteor integration
 * Replaces direct Meteor.user() and Meteor.userId() calls
 */

/**
 * Get current Meteor user ID
 * This will get the Meteor user ID associated with the Clerk session
 */
export const getMeteorUserId = () => {
  const user = Meteor.user();
  return user?._id || null;
};

/**
 * Get current Meteor user
 * Returns the Meteor user document linked to Clerk session
 */
export const getMeteorUser = () => {
  return Meteor.user();
};

/**
 * Check if user is logged in (has both Clerk and Meteor session)
 */
export const isLoggedIn = () => {
  const user = Meteor.user();
  return !!user;
};

/**
 * Check if user has a specific role
 */
export const hasRole = (role) => {
  const user = Meteor.user();
  if (!user?.roles || !Array.isArray(user.roles)) return false;
  return user.roles.includes(role);
};

/**
 * Check if user is an admin (any admin role: system or school-specific)
 */
export const isAdmin = () => {
  const user = Meteor.user();
  if (!user?.roles || !Array.isArray(user.roles)) return false;
  
  // Check for system role
  if (user.roles.includes("system")) return true;
  
  // Check for any school admin role
  return user.roles.some(r => r.startsWith("admin."));
};

/**
 * Check if user is a system admin
 */
export const isSystemAdmin = () => {
  const user = Meteor.user();
  if (!user?.roles || !Array.isArray(user.roles)) return false;
  return user.roles.includes("system");
};

/**
 * Check if user is a school admin
 */
export const isSchoolAdmin = (schoolId = null) => {
  const user = Meteor.user();
  if (!user?.roles || !Array.isArray(user.roles)) return false;
  
  const targetSchoolId = schoolId || user.schoolId;
  if (!targetSchoolId) return false;
  
  return user.roles.includes(`admin.${targetSchoolId}`);
};

/**
 * Get user's school ID
 */
export const getSchoolId = () => {
  const user = Meteor.user();
  return user?.schoolId || null;
};

/**
 * Check if user's email is verified
 */
export const isEmailVerified = () => {
  const user = Meteor.user();
  return user?.emails?.[0]?.verified || false;
};
