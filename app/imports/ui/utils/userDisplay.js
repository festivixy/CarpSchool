import { Meteor } from "meteor/meteor";
import { Profiles } from "../../api/profile/Profile";

/**
 * User display utilities
 * Resolves user IDs to human-readable display names
 */

/**
 * Get display name for a user ID
 * Looks up profile Name, falls back to email, then to shortened ID
 * @param {string} userId - The user ID to look up
 * @param {Object} options - Options for display
 * @param {boolean} options.showEmail - If true, show email when name not available
 * @param {boolean} options.shortId - If true, show shortened ID as last fallback
 * @returns {string} Display name for the user
 */
export function getUserDisplayName(userId, options = {}) {
  const { showEmail = true, shortId = true } = options;

  if (!userId) return "Unknown";

  // Check if it's a system user
  if (userId === "System") return "System";

  // Try to get the profile
  const profile = Profiles.findOne({ Owner: userId });
  if (profile?.Name) {
    return profile.Name;
  }

  // Try to get the user's email
  if (showEmail) {
    const user = Meteor.users.findOne(userId);
    if (user?.emails?.[0]?.address) {
      // Return just the username part of email
      const email = user.emails[0].address;
      return email.split("@")[0];
    }
    if (user?.username) {
      return user.username;
    }
  }

  // Fallback to shortened ID
  if (shortId && userId.length > 8) {
    return `User ${userId.substring(0, 6)}...`;
  }

  return userId;
}

/**
 * Get display names for an array of user IDs
 * @param {string[]} userIds - Array of user IDs
 * @param {Object} options - Options for display
 * @returns {string[]} Array of display names
 */
export function getUserDisplayNames(userIds, options = {}) {
  if (!Array.isArray(userIds)) return [];
  return userIds.map(id => getUserDisplayName(id, options));
}

/**
 * Get a formatted string of display names for a list of user IDs
 * @param {string[]} userIds - Array of user IDs
 * @param {Object} options - Options for display
 * @param {string} options.separator - Separator between names (default: ", ")
 * @param {number} options.maxShow - Maximum number of names to show before "+ X more"
 * @returns {string} Formatted string of names
 */
export function formatUserList(userIds, options = {}) {
  const { separator = ", ", maxShow = 3, ...displayOptions } = options;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return "No users";
  }

  const names = getUserDisplayNames(userIds, displayOptions);

  if (names.length <= maxShow) {
    return names.join(separator);
  }

  const shown = names.slice(0, maxShow);
  const remaining = names.length - maxShow;
  return `${shown.join(separator)} + ${remaining} more`;
}

/**
 * Create a map of user IDs to display names for efficient lookup
 * @param {string[]} userIds - Array of user IDs
 * @returns {Object} Map of userId -> displayName
 */
export function createUserDisplayMap(userIds) {
  const map = {};
  if (!Array.isArray(userIds)) return map;

  userIds.forEach(id => {
    map[id] = getUserDisplayName(id);
  });

  return map;
}

export default {
  getUserDisplayName,
  getUserDisplayNames,
  formatUserList,
  createUserDisplayMap,
};
