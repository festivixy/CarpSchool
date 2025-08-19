import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
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
  validateSessionState,
  validateTimeConstraints,
} from "./RideSessionsSafety";

Meteor.methods({
  async "rideSessions.create"(rideId, driverId, riders = []) {
    check(rideId, String);
    check(driverId, String);
    check(riders, [String]);

    const userId = this.userId;

    // Safety validation
    const validation = await canCreateRideSession(userId, rideId, driverId, riders);
    if (!validation.allowed) {
      throw new Meteor.Error("access-denied", validation.reason);
    }

    // Initialize progress for all riders
    const progress = {};
    riders.forEach(riderId => {
      progress[riderId] = {
        droppedOff: false,
        pickedUp: false,
        dropoffTime: null,
        pickupTime: null,
      };
    });

    const sessionData = {
      rideId,
      driverId,
      riders,
      activeRiders: [...riders], // Copy riders array
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

    // Log creation event
    await Meteor.callAsync("rideSessions.logEvent", sessionId, "rideCreated", {
      location: { lat: 0, lng: 0 }, // TODO: Get actual location
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
      [`progress.${riderId}.droppedOff`]: true,
      [`progress.${riderId}.dropoffTime`]: new Date(),
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

    const user = await Meteor.users.findOneAsync(userId);
    const isAdmin = user?.roles?.includes("admin");
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

    // Check if user is admin
    const user = await Meteor.users.findOneAsync(userId);
    if (!user || !user.roles || !user.roles.includes("admin")) {
      throw new Meteor.Error("access-denied", "You must be an admin to delete ride sessions");
    }

    await RideSessions.removeAsync(sessionId);
    return true;
  },
});
