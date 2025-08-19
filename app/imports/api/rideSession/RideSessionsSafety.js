import { Meteor } from "meteor/meteor";
import { RideSessions } from "./RideSession";
import { Rides } from "../ride/Rides";

/**
 * Safety validation functions for RideSession operations
 * Each function returns { allowed: boolean, reason?: string, warnings?: string[] }
 */

// Session Creation & Management
export const canCreateRideSession = async (userId, rideId, driverId, riders = []) => {
  if (!userId) return { allowed: false, reason: "User not authenticated" };

  // Check if ride exists
  const ride = await Rides.findOneAsync(rideId);
  if (!ride) return { allowed: false, reason: "Ride not found" };

  // Check if user is the driver or an admin
  const user = await Meteor.users.findOneAsync(userId);
  const isAdmin = user?.roles?.includes("admin");
  const isDriver = ride.driver === user?.username || driverId === userId;

  if (!isDriver && !isAdmin) {
    return { allowed: false, reason: "Only the driver or admin can create a ride session" };
  }

  // Check if session already exists for this ride
  const existingSession = await RideSessions.findOneAsync({ rideId });
  if (existingSession) {
    return { allowed: false, reason: "A session already exists for this ride" };
  }

  // Validate riders are part of the original ride
  const invalidRiders = riders.filter(riderId => !ride.riders.includes(riderId));
  if (invalidRiders.length > 0) {
    return { allowed: false, reason: "Some riders are not part of the original ride" };
  }

  return { allowed: true };
};

export const canStartRideSession = async (userId, sessionId) => {
  if (!userId) return { allowed: false, reason: "User not authenticated" };

  const session = await RideSessions.findOneAsync(sessionId);
  if (!session) return { allowed: false, reason: "Session not found" };

  const user = await Meteor.users.findOneAsync(userId);
  const isAdmin = user?.roles?.includes("admin");
  const isDriver = session.driverId === userId;

  if (!isDriver && !isAdmin) {
    return { allowed: false, reason: "Only the driver or admin can start the session" };
  }

  if (session.status !== "created") {
    return { allowed: false, reason: `Cannot start session with status: ${session.status}` };
  }

  if (session.timeline.started) {
    return { allowed: false, reason: "Session has already been started" };
  }

  return { allowed: true };
};

export const canFinishRideSession = async (userId, sessionId) => {
  if (!userId) return { allowed: false, reason: "User not authenticated" };

  const session = await RideSessions.findOneAsync(sessionId);
  if (!session) return { allowed: false, reason: "Session not found" };

  const user = await Meteor.users.findOneAsync(userId);
  const isAdmin = user?.roles?.includes("admin");
  const isDriver = session.driverId === userId;

  if (!isDriver && !isAdmin) {
    return { allowed: false, reason: "Only the driver or admin can finish the session" };
  }

  if (session.finished) {
    return { allowed: false, reason: "Session is already finished" };
  }

  // Check if all riders have been dropped off
  const activeRiders = session.activeRiders || [];
  if (activeRiders.length > 0) {
    return {
      allowed: false,
      reason: "Cannot finish session while riders are still active",
      warnings: [`${activeRiders.length} riders still need to be dropped off`],
    };
  }

  return { allowed: true };
};

export const canCancelRideSession = async (userId, sessionId, reason) => {
  if (!userId) return { allowed: false, reason: "User not authenticated" };

  const session = await RideSessions.findOneAsync(sessionId);
  if (!session) return { allowed: false, reason: "Session not found" };

  const user = await Meteor.users.findOneAsync(userId);
  const isAdmin = user?.roles?.includes("admin");
  const isDriver = session.driverId === userId;

  if (!isDriver && !isAdmin) {
    return { allowed: false, reason: "Only the driver or admin can cancel the session" };
  }

  if (session.status === "completed" || session.status === "cancelled") {
    return { allowed: false, reason: `Cannot cancel session with status: ${session.status}` };
  }

  if (!reason || reason.trim().length === 0) {
    return { allowed: false, reason: "Cancellation reason is required" };
  }

  return { allowed: true };
};

// Rider Management
export const canPickupRider = async (userId, sessionId, riderId, location) => {
  if (!userId) return { allowed: false, reason: "User not authenticated" };

  const session = await RideSessions.findOneAsync(sessionId);
  if (!session) return { allowed: false, reason: "Session not found" };

  const user = await Meteor.users.findOneAsync(userId);
  const isAdmin = user?.roles?.includes("admin");
  const isDriver = session.driverId === userId;

  if (!isDriver && !isAdmin) {
    return { allowed: false, reason: "Only the driver or admin can pickup riders" };
  }

  if (!session.riders.includes(riderId)) {
    return { allowed: false, reason: "Rider is not part of this session" };
  }

  const riderProgress = session.progress[riderId];
  if (riderProgress?.pickedUp) {
    return { allowed: false, reason: "Rider has already been picked up" };
  }

  if (session.status !== "active") {
    return { allowed: false, reason: "Session must be active to pickup riders" };
  }

  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    return { allowed: false, reason: "Valid location coordinates are required" };
  }

  return { allowed: true };
};

export const canDropoffRider = async (userId, sessionId, riderId, location) => {
  if (!userId) return { allowed: false, reason: "User not authenticated" };

  const session = await RideSessions.findOneAsync(sessionId);
  if (!session) return { allowed: false, reason: "Session not found" };

  const user = await Meteor.users.findOneAsync(userId);
  const isAdmin = user?.roles?.includes("admin");
  const isDriver = session.driverId === userId;

  if (!isDriver && !isAdmin) {
    return { allowed: false, reason: "Only the driver or admin can dropoff riders" };
  }

  if (!session.riders.includes(riderId)) {
    return { allowed: false, reason: "Rider is not part of this session" };
  }

  const riderProgress = session.progress[riderId];
  if (!riderProgress?.pickedUp) {
    return { allowed: false, reason: "Rider must be picked up before being dropped off" };
  }

  if (riderProgress?.droppedOff) {
    return { allowed: false, reason: "Rider has already been dropped off" };
  }

  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    return { allowed: false, reason: "Valid location coordinates are required" };
  }

  return { allowed: true };
};

// Access Control
export const canViewRideSession = async (userId, sessionId) => {
  if (!userId) return { allowed: false, reason: "User not authenticated" };

  const session = await RideSessions.findOneAsync(sessionId);
  if (!session) return { allowed: false, reason: "Session not found" };

  const user = await Meteor.users.findOneAsync(userId);
  const isAdmin = user?.roles?.includes("admin");
  const isDriver = session.driverId === userId;
  const isRider = session.riders.includes(userId);

  if (!isDriver && !isRider && !isAdmin) {
    return { allowed: false, reason: "You don't have permission to view this session" };
  }

  return { allowed: true };
};

export const canModifyRideSession = async (userId, sessionId) => {
  if (!userId) return { allowed: false, reason: "User not authenticated" };

  const session = await RideSessions.findOneAsync(sessionId);
  if (!session) return { allowed: false, reason: "Session not found" };

  const user = await Meteor.users.findOneAsync(userId);
  const isAdmin = user?.roles?.includes("admin");
  const isDriver = session.driverId === userId;

  if (!isDriver && !isAdmin) {
    return { allowed: false, reason: "Only the driver or admin can modify the session" };
  }

  return { allowed: true };
};

// Safety Checks
export const validateRiderSequence = async (sessionId, riderId, action) => {
  const session = await RideSessions.findOneAsync(sessionId);
  if (!session) return { allowed: false, reason: "Session not found" };

  const riderProgress = session.progress[riderId];

  if (action === "pickup") {
    if (riderProgress?.pickedUp) {
      return { allowed: false, reason: "Rider is already picked up" };
    }
    if (riderProgress?.droppedOff) {
      return { allowed: false, reason: "Cannot pickup a rider who has been dropped off" };
    }
  }

  if (action === "dropoff") {
    if (!riderProgress?.pickedUp) {
      return { allowed: false, reason: "Rider must be picked up before dropoff" };
    }
    if (riderProgress?.droppedOff) {
      return { allowed: false, reason: "Rider is already dropped off" };
    }
  }

  return { allowed: true };
};

export const validateSessionState = async (sessionId, requiredState) => {
  const session = await RideSessions.findOneAsync(sessionId);
  if (!session) return { allowed: false, reason: "Session not found" };

  if (session.status !== requiredState) {
    return {
      allowed: false,
      reason: `Session must be in '${requiredState}' state, currently '${session.status}'`,
    };
  }

  return { allowed: true };
};

export const validateLocationProximity = async (driverId, riderId, location, maxDistance = 1000) => {
  // This would require integration with your location tracking system
  // For now, we'll just validate that location coordinates are provided
  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    return { allowed: false, reason: "Valid location coordinates are required" };
  }

  // TODO: Implement actual proximity validation using driver's current location
  // and expected pickup/dropoff points from the ride data

  return { allowed: true };
};

export const validateTimeConstraints = async (sessionId, action) => {
  const session = await RideSessions.findOneAsync(sessionId);
  if (!session) return { allowed: false, reason: "Session not found" };

  const now = new Date();
  const createdTime = new Date(session.timeline.created);
  const timeDiff = now - createdTime;

  // Prevent actions on sessions older than 24 hours
  const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  if (timeDiff > maxSessionAge) {
    return {
      allowed: false,
      reason: "Session is too old for this action. Sessions expire after 24 hours.",
    };
  }

  return { allowed: true };
};
