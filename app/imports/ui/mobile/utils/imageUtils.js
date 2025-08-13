/**
 * Mobile image utilities for handling server URLs in Cordova environment
 */

/**
 * Get the correct image URL for mobile apps
 * In Cordova apps, relative URLs resolve to the local server, so we need absolute URLs
 * @param {string} uuid - Image UUID
 * @returns {string} - Complete image URL pointing to main Meteor server
 */
export const getImageUrl = (uuid) => {
  if (!uuid) return "";
  
  // In Cordova environment, we need to use the main Meteor server URL
  // The mobile-server configuration tells us where the main server is
  const meteorServerUrl = Meteor.absoluteUrl().replace(/\/$/, ''); // Remove trailing slash
  return `${meteorServerUrl}/image/${uuid}`;
};

/**
 * Get the base Meteor server URL for mobile apps
 * @returns {string} - Base server URL
 */
export const getMeteorServerUrl = () => {
  return Meteor.absoluteUrl().replace(/\/$/, '');
};
