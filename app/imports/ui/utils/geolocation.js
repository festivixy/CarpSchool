/**
 * Geolocation utility functions
 */

/**
 * Get current location coordinates
 * @returns {Promise<{lat: number, lng: number}>} Location coordinates
 */
export const getCurrentLocation = async () =>
  // Return dummy coordinates for now
   ({ lat: 0, lng: 0 })
;

/**
 * Watch position changes
 * @param {Function} onSuccess - Callback for location updates
 * @param {Function} onError - Callback for errors
 * @returns {number} Watch ID for clearing the watch
 */
export const watchLocation = (onSuccess, _onError) => {
  // Return dummy data for now
  const watchId = setInterval(() => {
    onSuccess({ lat: 0, lng: 0 });
  }, 5000);

  return watchId;
};

/**
 * Clear location watch
 * @param {number} watchId - Watch ID to clear
 */
export const clearLocationWatch = (watchId) => {
  clearInterval(watchId);
};
