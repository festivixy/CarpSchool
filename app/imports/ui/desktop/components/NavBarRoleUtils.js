/**
 * Utility functions for NavBar role checking with school-aware admin system
 */

/**
 * Check if user has system role (global admin)
 */
export function isSystemRole(user) {
  return user?.roles?.includes("system") || false;
}

/**
 * Check if user has any admin role (system or school-specific)
 */
export function isAdminRole(user) {
  if (!user?.roles) return false;

  // Check for system role
  if (user.roles.includes("system")) return true;

  // Check for any school admin role
  return user.roles.some(role => role.startsWith("admin."));
}

/**
 * Check if user is admin of their own school
 */
export function isSchoolAdminRole(user) {
  if (!user?.roles || !user?.schoolId) return false;

  return user.roles.includes(`admin.${user.schoolId}`);
}

/**
 * Get admin role display text for UI
 */
export function getAdminRoleDisplay(user) {
  if (!user?.roles) return null;

  if (user.roles.includes("system")) {
    return "System Administrator";
  }

  const schoolAdminRoles = user.roles.filter(role => role.startsWith("admin."));
  if (schoolAdminRoles.length > 0) {
    return "School Administrator";
  }

  return null;
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(user) {
  return isAdminRole(user);
}

/**
 * Check if user can access system features
 */
export function canAccessSystem(user) {
  return isSystemRole(user);
}
