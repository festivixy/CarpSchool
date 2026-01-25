/**
 * Role utility functions to check user permissions based on their profile UserType
 */

/**
 * Check if user can create/manage rides (has Driver or Both role)
 * @param {Object} profile - User's profile document
 * @returns {boolean}
 */
export const canDrive = (profile) => {
  if (!profile || !profile.UserType) return false;
  return profile.UserType === "Driver" || profile.UserType === "Both";
};

/**
 * Check if user can join rides as a passenger (has Rider or Both role)
 * @param {Object} profile - User's profile document
 * @returns {boolean}
 */
export const canRide = (profile) => {
  if (!profile || !profile.UserType) return false;
  return profile.UserType === "Rider" || profile.UserType === "Both";
};

/**
 * Check if user has both driver and rider permissions
 * @param {Object} profile - User's profile document
 * @returns {boolean}
 */
export const hasBothRoles = (profile) => {
  if (!profile || !profile.UserType) return false;
  return profile.UserType === "Both";
};

/**
 * Check if user is driver-only (cannot join rides as passenger)
 * @param {Object} profile - User's profile document
 * @returns {boolean}
 */
export const isDriverOnly = (profile) => {
  if (!profile || !profile.UserType) return false;
  return profile.UserType === "Driver";
};

/**
 * Check if user is rider-only (cannot create rides)
 * @param {Object} profile - User's profile document
 * @returns {boolean}
 */
export const isRiderOnly = (profile) => {
  if (!profile || !profile.UserType) return false;
  return profile.UserType === "Rider";
};

/**
 * Get user role display text
 * @param {Object} profile - User's profile document
 * @returns {string}
 */
export const getRoleDisplayText = (profile) => {
  if (!profile || !profile.UserType) return "Unknown";
  
  switch (profile.UserType) {
    case "Driver":
      return "Driver Only";
    case "Rider":
      return "Rider Only";
    case "Both":
      return "Driver & Rider";
    default:
      return profile.UserType;
  }
};
