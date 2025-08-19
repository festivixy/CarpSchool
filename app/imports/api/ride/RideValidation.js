/**
 * Ride-specific validation utilities for runtime operations
 * 
 * These functions provide reusable validation logic for ride operations
 * that need to be performed at runtime (beyond schema validation).
 */

/**
 * Validates if a user can join a specific ride
 * @param {Object} ride - The ride document
 * @param {Object} user - The user attempting to join
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateUserCanJoinRide = (ride, user) => {
  // Check if ride exists
  if (!ride) {
    return { isValid: false, error: "Ride not found" };
  }

  // Check if user is logged in
  if (!user) {
    return { isValid: false, error: "You must be logged in to join a ride" };
  }

  // Check if ride is full
  if (ride.riders.length >= ride.seats) {
    return { 
      isValid: false, 
      error: `This ride is full (${ride.riders.length}/${ride.seats} seats taken)` 
    };
  }

  // Check if user is already a rider
  if (ride.riders.includes(user.username)) {
    return { isValid: false, error: "You are already a rider on this trip" };
  }

  // Check if user is trying to join their own ride
  if (ride.driver === user.username) {
    return { isValid: false, error: "You cannot join your own ride as a rider" };
  }

  // Check if ride date is in the future (with buffer)
  const now = new Date();
  const rideDate = new Date(ride.date);
  const bufferTime = 30 * 60 * 1000; // 30 minutes buffer
  
  if (rideDate.getTime() < (now.getTime() - bufferTime)) {
    return { 
      isValid: false, 
      error: "You cannot join rides that have already started or passed" 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates if a user can be removed from a ride
 * @param {Object} ride - The ride document
 * @param {Object} currentUser - The user performing the removal
 * @param {string} riderToRemove - Username of rider to remove
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateUserCanRemoveRider = (ride, currentUser, riderToRemove) => {
  // Check if ride exists
  if (!ride) {
    return { isValid: false, error: "Ride not found" };
  }

  // Check if current user is logged in
  if (!currentUser) {
    return { isValid: false, error: "You must be logged in to remove riders" };
  }

  // Check if the user to remove is actually a rider
  if (!ride.riders.includes(riderToRemove)) {
    return { isValid: false, error: "User is not a rider on this trip" };
  }

  // Check permissions - only driver or admin can remove riders
  const isAdmin = currentUser.roles && currentUser.roles.includes("admin");
  const isDriver = ride.driver === currentUser.username;

  if (!isDriver && !isAdmin) {
    return { 
      isValid: false, 
      error: "You can only remove riders from your own rides" 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates ride capacity constraints
 * @param {Object} ride - The ride document
 * @returns {Object} - { isValid: boolean, error: string|null, warnings: string[] }
 */
export const validateRideCapacity = (ride) => {
  const warnings = [];
  
  // Check if ride exists
  if (!ride) {
    return { isValid: false, error: "Ride data is missing", warnings: [] };
  }

  // Check basic capacity constraint
  if (ride.riders.length > ride.seats) {
    return { 
      isValid: false, 
      error: `Ride is overbooked: ${ride.riders.length} riders for ${ride.seats} seats`,
      warnings: []
    };
  }

  // Add warnings for capacity concerns
  if (ride.riders.length === ride.seats) {
    warnings.push("Ride is at full capacity");
  } else if (ride.riders.length >= ride.seats * 0.8) {
    warnings.push("Ride is nearly full");
  }

  // Check for duplicate riders
  const uniqueRiders = [...new Set(ride.riders)];
  if (uniqueRiders.length !== ride.riders.length) {
    return {
      isValid: false,
      error: `Ride contains duplicate riders: ${ride.riders.length} total, ${uniqueRiders.length} unique`,
      warnings: []
    };
  }

  // Check if driver is in riders list
  if (ride.riders.includes(ride.driver)) {
    return {
      isValid: false,
      error: `Driver ${ride.driver} cannot also be listed as a rider`,
      warnings: []
    };
  }

  return { isValid: true, error: null, warnings };
};

/**
 * Validates ride timing constraints
 * @param {Object} ride - The ride document
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - { isValid: boolean, error: string|null, warnings: string[] }
 */
export const validateRideTiming = (ride, isUpdate = false) => {
  const warnings = [];
  
  if (!ride || !ride.date) {
    return { isValid: false, error: "Ride date is required", warnings: [] };
  }

  const now = new Date();
  const rideDate = new Date(ride.date);
  
  // For new rides, don't allow past dates (with 5-minute buffer)
  if (!isUpdate) {
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    if (rideDate.getTime() < (now.getTime() - bufferTime)) {
      return {
        isValid: false,
        error: "Ride date cannot be in the past",
        warnings: []
      };
    }
  }
  
  // Add warnings for timing concerns
  const hoursDiff = (rideDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff < 2) {
    warnings.push("Ride is scheduled within 2 hours");
  } else if (hoursDiff > 24 * 30) { // 30 days
    warnings.push("Ride is scheduled more than 30 days in advance");
  }

  return { isValid: true, error: null, warnings };
};
