import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { RideSessions, RideSessionSchema } from "./RideSession";
import {
  canCreateRideSession,
  canStartRideSession,
  canFinishRideSession,
  canCancelRideSession,
  canPickupRider,
  canDropoffRider,
  canModifyRideSession,
  validateRiderSequence,
  validateTimeConstraints,
} from "./RideSessionsSafety";

// Helper function to generate 4-digit pickup codes
const generatePickupCode = () => Math.floor(1000 + Math.random() * 9000).toString();

Meteor.methods({
  async "rideSessions.create"(rideId, driverId, riderIds = [], location) {
    check(rideId, String);
    check(driverId, String);
    check(riderIds, [String]);
    check(location, { lat: Number, lng: Number });
    
    // GPS location is required for ride safety
    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      throw new Meteor.Error("validation-error", "GPS location is required for ride safety. Please enable location services.");
    }

    const userId = this.userId;

    // Safety validation
    const validation = await canCreateRideSession(userId, rideId, driverId, riderIds);
    if (!validation.allowed) {
      throw new Meteor.Error("access-denied", validation.reason);
    }

    // Initialize progress for all riders with pickup codes (using user IDs as keys)
    const progress = {};
    riderIds.forEach(riderId => {
      progress[riderId] = {
        droppedOff: false,
        pickedUp: false,
        dropoffTime: null,
        pickupTime: null,
        code: generatePickupCode(),
        codeAttempts: 0,
        codeError: false,
      };
    });

    const sessionData = {
      rideId,
      driverId,
      riders: riderIds,
      activeRiders: [...riderIds], // Copy rider IDs array
      progress,
      finished: false,
      timeline: {
        created: new Date(),
        started: null,
        arrived: null,
        ended: null,
      },
      events: {},
      createdBy: userId,
      status: "created",
    };

    // Validate against schema
    const { error, value } = RideSessionSchema.validate(sessionData);
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    const sessionId = await RideSessions.insertAsync(value);

    // Log creation event with actual location
    await Meteor.callAsync("rideSessions.logEvent", sessionId, "rideCreated", {
      location,
      time: new Date(),
      by: userId,
    });

    return sessionId;
  },

  async "rideSessions.start"(sessionId, location) {
    check(sessionId, String);
    check(location, { lat: Number, lng: Number });

    const userId = this.userId;

    // Safety validation
    const validation = await canStartRideSession(userId, sessionId);
    if (!validation.allowed) {
      throw new Meteor.Error("access-denied", validation.reason);
    }

    const updateData = {
      status: "active",
      "timeline.started": new Date(),
    };

    await RideSessions.updateAsync(sessionId, { $set: updateData });

    // Log start event
    await Meteor.callAsync("rideSessions.logEvent", sessionId, "rideStarted", {
      location,
      time: new Date(),
      by: userId,
    });

    return true;
  },

  async "rideSessions.finish"(sessionId, location) {
    check(sessionId, String);
    check(location, { lat: Number, lng: Number });

    const userId = this.userId;

    // Safety validation
    const validation = await canFinishRideSession(userId, sessionId);
    if (!validation.allowed) {
      throw new Meteor.Error("access-denied", validation.reason);
    }

    const updateData = {
      finished: true,
      status: "completed",
      "timeline.ended": new Date(),
    };

    await RideSessions.updateAsync(sessionId, { $set: updateData });

    // Log completion event
    await Meteor.callAsync("rideSessions.logEvent", sessionId, "rideCompleted", {
      location,
      time: new Date(),
      by: userId,
    });

    return true;
  },

  async "rideSessions.cancel"(sessionId, reason, location) {
    check(sessionId, String);
    check(reason, String);
    check(location, { lat: Number, lng: Number });

    const userId = this.userId;

    // Safety validation
    const validation = await canCancelRideSession(userId, sessionId, reason);
    if (!validation.allowed) {
      throw new Meteor.Error("access-denied", validation.reason);
    }

    const updateData = {
      finished: true,
      status: "cancelled",
      "timeline.ended": new Date(),
    };

    await RideSessions.updateAsync(sessionId, { $set: updateData });

    // Log cancellation event
    await Meteor.callAsync("rideSessions.logEvent", sessionId, "rideCancelled", {
      location,
      time: new Date(),
      by: userId,
      reason,
    });

    return true;
  },

  async "rideSessions.verifyPickupCode"(sessionId, riderId, lastTwoDigits, location) {
    check(sessionId, String);
    check(riderId, String);
    check(lastTwoDigits, String);
    check(location, { lat: Number, lng: Number });

    const userId = this.userId;

    // Get session and validate access
    const session = await RideSessions.findOneAsync(sessionId);
    if (!session) {
      throw new Meteor.Error("not-found", "Session not found");
    }

    // GPS location is required for verification
    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      throw new Meteor.Error("validation-error", "GPS location is required for pickup verification. Please enable location services.");
    }
    const canPickup = await canPickupRider(userId, sessionId, riderId, location);
    if (!canPickup.allowed) {
      throw new Meteor.Error("access-denied", canPickup.reason);
    }

    const riderProgress = session.progress[riderId];
    if (!riderProgress) {
      throw new Meteor.Error("not-found", "Rider not found in session");
    }

    if (riderProgress.codeError) {
      throw new Meteor.Error("verification-failed", "Code verification disabled after too many failed attempts");
    }

    if (riderProgress.pickedUp) {
      throw new Meteor.Error("already-picked-up", "Rider has already been picked up");
    }

    // Validate last two digits
    const fullCode = riderProgress.code;
    const expectedLastTwo = fullCode.slice(-2);

    if (lastTwoDigits !== expectedLastTwo) {
      // Increment attempt counter
      const newAttempts = (riderProgress.codeAttempts || 0) + 1;
      const updateData = {
        [`progress.${riderId}.codeAttempts`]: newAttempts,
      };

      // Mark as error if 5 attempts reached
      if (newAttempts >= 5) {
        updateData[`progress.${riderId}.codeError`] = true;
        await RideSessions.updateAsync(sessionId, { $set: updateData });
        throw new Meteor.Error(
          "verification-failed",
          "Too many failed attempts. Code verification disabled for this rider.",
        );
      }

      await RideSessions.updateAsync(sessionId, { $set: updateData });
      throw new Meteor.Error("verification-failed", `Invalid code. ${5 - newAttempts} attempts remaining.`);
    }

    // Code is correct - mark as picked up
    const updateData = {
      [`progress.${riderId}.pickedUp`]: true,
      [`progress.${riderId}.pickupTime`]: new Date(),
    };

    await RideSessions.updateAsync(sessionId, { $set: updateData });

    // Log pickup event with actual location
    await Meteor.callAsync("rideSessions.logEvent", sessionId, "riderPickedUp", {
      location,
      time: new Date(),
      by: userId,
      riderId,
    });

    return { success: true, message: "Rider pickup confirmed successfully!" };
  },

  async "rideSessions.pickupRider"(sessionId, riderId, location) {
    check(sessionId, String);
    check(riderId, String);
    check(location, { lat: Number, lng: Number });

    const userId = this.userId;

    // Safety validations
    const canPickup = await canPickupRider(userId, sessionId, riderId, location);
    if (!canPickup.allowed) {
      throw new Meteor.Error("access-denied", canPickup.reason);
    }

    const sequenceValidation = await validateRiderSequence(sessionId, riderId, "pickup");
    if (!sequenceValidation.allowed) {
      throw new Meteor.Error("validation-error", sequenceValidation.reason);
    }

    const timeValidation = await validateTimeConstraints(sessionId, "pickup");
    if (!timeValidation.allowed) {
      throw new Meteor.Error("validation-error", timeValidation.reason);
    }

    const updateData = {
      [`progress.${riderId}.pickedUp`]: true,
      [`progress.${riderId}.pickupTime`]: new Date(),
    };

    await RideSessions.updateAsync(sessionId, { $set: updateData });

    // Log pickup event
    await Meteor.callAsync("rideSessions.logEvent", sessionId, "riderPickedUp", {
      location,
      time: new Date(),
      by: userId,
      riderId,
    });

    return true;
  },

  async "rideSessions.getPickupCodeHint"(sessionId, riderId) {
    check(sessionId, String);
    check(riderId, String);

    const userId = this.userId;

    // Get session and validate access
    const session = await RideSessions.findOneAsync(sessionId);
    if (!session) {
      throw new Meteor.Error("not-found", "Session not found");
    }

    // Check if user is driver or the specific rider
    const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
    const isAdmin = await isSystemAdmin(userId) || await isSchoolAdmin(userId);
    const isDriver = session.driverId === userId;
    const isRider = session.riders.includes(userId) && riderId === userId;

    if (!isDriver && !isRider && !isAdmin) {
      throw new Meteor.Error("access-denied", "You don't have permission to access this code");
    }

    const riderProgress = session.progress[riderId];
    if (!riderProgress || !riderProgress.code) {
      throw new Meteor.Error("not-found", "Code not found for this rider");
    }

    // Return different information based on user type
    if (isDriver) {
      // Driver gets first two digits as hint
      const fullCode = riderProgress.code;
      return {
        hint: fullCode.slice(0, 2),
        attemptsRemaining: Math.max(0, 5 - (riderProgress.codeAttempts || 0)),
        codeError: riderProgress.codeError || false,
      };
    } if (isRider || isAdmin) {
      // Rider gets full code
      return {
        fullCode: riderProgress.code,
      };
    }
  },

  async "rideSessions.dropoffRider"(sessionId, riderId, location) {
    check(sessionId, String);
    check(riderId, String);
    check(location, { lat: Number, lng: Number });

    const userId = this.userId;

    // Safety validations
    const canDropoff = await canDropoffRider(userId, sessionId, riderId, location);
    if (!canDropoff.allowed) {
      throw new Meteor.Error("access-denied", canDropoff.reason);
    }

    const sequenceValidation = await validateRiderSequence(sessionId, riderId, "dropoff");
    if (!sequenceValidation.allowed) {
      throw new Meteor.Error("validation-error", sequenceValidation.reason);
    }

    const updateData = {
      $set: {
        [`progress.${riderId}.droppedOff`]: true,
        [`progress.${riderId}.dropoffTime`]: new Date(),
      },
      $pull: { activeRiders: riderId },
    };

    await RideSessions.updateAsync(sessionId, updateData);

    // Log dropoff event
    await Meteor.callAsync("rideSessions.logEvent", sessionId, "riderDroppedOff", {
      location,
      time: new Date(),
      by: userId,
      riderId,
    });

    return true;
  },

  async "rideSessions.logEvent"(sessionId, eventType, eventData) {
    check(sessionId, String);
    check(eventType, String);
    check(eventData, {
      location: { lat: Number, lng: Number },
      time: Date,
      by: String,
      riderId: Match.Optional(String),
      reason: Match.Optional(String),
    });

    const userId = this.userId;

    // Basic permission check - only participants can log events
    const session = await RideSessions.findOneAsync(sessionId);
    if (!session) {
      throw new Meteor.Error("not-found", "Session not found");
    }

    const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
    const isAdmin = await isSystemAdmin(userId) || await isSchoolAdmin(userId);
    const isDriver = session.driverId === userId;
    const isRider = session.riders.includes(userId);

    if (!isDriver && !isRider && !isAdmin) {
      throw new Meteor.Error("access-denied", "You don't have permission to log events for this session");
    }

    const eventKey = `${eventType}_${Date.now()}`;
    const updateData = {
      [`events.${eventKey}`]: eventData,
    };

    await RideSessions.updateAsync(sessionId, { $set: updateData });
    return true;
  },

  async "rideSessions.updateTimeline"(sessionId, timelineUpdate) {
    check(sessionId, String);
    check(timelineUpdate, {
      arrived: Match.Optional(Date),
    });

    const userId = this.userId;

    // Safety validation
    const validation = await canModifyRideSession(userId, sessionId);
    if (!validation.allowed) {
      throw new Meteor.Error("access-denied", validation.reason);
    }

    const updateData = {};
    if (timelineUpdate.arrived) {
      updateData["timeline.arrived"] = timelineUpdate.arrived;
    }

    await RideSessions.updateAsync(sessionId, { $set: updateData });
    return true;
  },

  async "rideSessions.remove"(sessionId) {
    check(sessionId, String);

    const userId = this.userId;

    // Check if user is system admin
    const { isSystemAdmin } = await import("../accounts/RoleUtils");
    if (!await isSystemAdmin(userId)) {
      throw new Meteor.Error("access-denied", "You must be a system admin to delete ride sessions");
    }

    await RideSessions.removeAsync(sessionId);
    return true;
  },

  async "rideSessions.updateLiveLocation"(sessionId, location) {
    check(sessionId, String);
    check(location, { lat: Number, lng: Number });

    const userId = this.userId;

    // GPS location is required for live location sharing
    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      throw new Meteor.Error("validation-error", "GPS location is required for live location sharing. Please enable location services.");
    }

    // Validate coordinates are within valid ranges
    if (Math.abs(location.lat) > 90 || Math.abs(location.lng) > 180) {
      throw new Meteor.Error("validation-error", "Invalid location coordinates");
    }

    // Get session and validate access
    const session = await RideSessions.findOneAsync(sessionId);
    if (!session) {
      throw new Meteor.Error("not-found", "Session not found");
    }

    // Check if user is driver or rider in this session
    const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
    const isAdmin = await isSystemAdmin(userId) || await isSchoolAdmin(userId);
    const isDriver = session.driverId === userId;
    const isRider = session.riders.includes(userId);

    if (!isDriver && !isRider && !isAdmin) {
      throw new Meteor.Error("access-denied", "You don't have permission to update location for this session");
    }

    // Only allow live location updates for active sessions
    if (session.status !== "active") {
      throw new Meteor.Error("validation-error", "Live location sharing is only available for active ride sessions");
    }

    // Update live location for this user
    const liveLocationData = {
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date(),
    };

    // Include accuracy if provided
    if (location.accuracy !== undefined && typeof location.accuracy === "number") {
      liveLocationData.accuracy = location.accuracy;
    }

    // Helper for calculating distance (Haversine formula)
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371000; // Earth's radius in meters
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Anti-spoofing validation: Check for impossible speeds ("teleportation")
    const lastLocation =
      session.liveLocations && session.liveLocations[userId];

    if (lastLocation && lastLocation.lat && lastLocation.lng && lastLocation.timestamp) {
      const distance = calculateDistance(
        lastLocation.lat,
        lastLocation.lng,
        location.lat,
        location.lng
      );
      
      const timeDiff = new Date().getTime() - new Date(lastLocation.timestamp).getTime();
      
      // If time difference is very small (avoid division by zero), assume it's a duplicate or rapid update
      if (timeDiff > 1000) { 
        const speed = distance / (timeDiff / 1000); // meters per second
        const maxSpeed = 300; // ~1000 km/h (faster than any car/train)

        if (speed > maxSpeed) {
          console.warn(
            `[Security] Rejected impossible location jump for user ${userId}. Speed: ${speed.toFixed(2)} m/s`
          );
          // Silently reject the update or throw an error depending on strictness
          // Here we choose to reject it to prevent jumping but not crash the client
          return false; 
        }
      }
    }

    const updateData = {
      [`liveLocations.${userId}`]: liveLocationData,
    };

    await RideSessions.updateAsync(sessionId, { $set: updateData });
    return true;
  },
});
