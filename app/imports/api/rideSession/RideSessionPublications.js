import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { RideSessions } from "./RideSession";
import { canViewRideSession } from "./RideSessionsSafety";

/** Publish ride sessions where user is participant (driver or rider) */
Meteor.publish("rideSessions", async function publish() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser) {
    return this.ready();
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
  const isAdmin = await isSystemAdmin(this.userId) || await isSchoolAdmin(this.userId);

  // Admin users can see sessions based on their role
  if (isAdmin) {
    if (await isSystemAdmin(this.userId)) {
      // System admins can see all sessions
      return RideSessions.find({});
    } else {
      // School admins can only see sessions from their school
      return RideSessions.find({
        schoolId: currentUser.schoolId
      });
    }
  }

  // Regular users can only see sessions where they are driver or rider
  return RideSessions.find({
    $or: [
      { driverId: this.userId },
      { riders: this.userId },
    ],
  });
});

/** Publish a specific ride session by ID with permission checking */
Meteor.publish("rideSession", async function publish(sessionId) {
  check(sessionId, String);

  if (!this.userId) {
    return this.ready();
  }

  // Use safety validation to check access permissions
  const validation = await canViewRideSession(this.userId, sessionId);
  if (!validation.allowed) {
    return this.ready();
  }

  return RideSessions.find({ _id: sessionId });
});

/** Publish active ride sessions for a specific ride */
Meteor.publish("rideSessionsByRide", async function publish(rideId) {
  check(rideId, String);

  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser) {
    return this.ready();
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
  const isAdmin = await isSystemAdmin(this.userId) || await isSchoolAdmin(this.userId);

  // Find sessions for this ride where user has access
  const query = { rideId };

  if (!isAdmin) {
    // Non-admin users can only see sessions where they participate
    query.$or = [
      { driverId: this.userId },
      { riders: this.userId },
    ];
  } else if (await isSchoolAdmin(this.userId) && !await isSystemAdmin(this.userId)) {
    // School admins can only see sessions from their school
    query.schoolId = currentUser.schoolId;
  }

  return RideSessions.find(query);
});

/** Publish active ride sessions for real-time tracking */
Meteor.publish("activeRideSessions", async function publish() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser) {
    return this.ready();
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
  const isAdmin = await isSystemAdmin(this.userId) || await isSchoolAdmin(this.userId);

  // Query for active sessions
  const query = {
    status: { $in: ["active"] },
    finished: false,
  };

  if (!isAdmin) {
    // Non-admin users can only see their own active sessions
    query.$or = [
      { driverId: this.userId },
      { riders: this.userId },
    ];
  } else if (await isSchoolAdmin(this.userId) && !await isSystemAdmin(this.userId)) {
    // School admins can only see sessions from their school
    query.schoolId = currentUser.schoolId;
  }

  return RideSessions.find(query, {
    sort: { "timeline.started": -1 },
  });
});

/** Publish ride sessions for admin management */
Meteor.publish("adminRideSessions", async function publish(options = {}) {
  check(options, {
    status: Match.Optional(String),
    limit: Match.Optional(Number),
    skip: Match.Optional(Number),
    sortBy: Match.Optional(String),
    sortOrder: Match.Optional(Number),
  });

  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
  
  if (!await isSystemAdmin(this.userId) && !await isSchoolAdmin(this.userId)) {
    return this.ready();
  }

  const {
    status,
    limit = 50,
    skip = 0,
    sortBy = "timeline.created",
    sortOrder = -1,
  } = options;

  const query = {};

  if (status) {
    query.status = status;
  }

  // School admins can only see sessions from their school
  if (await isSchoolAdmin(this.userId) && !await isSystemAdmin(this.userId)) {
    query.schoolId = currentUser.schoolId;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  return RideSessions.find(query, {
    sort: sortOptions,
    limit,
    skip,
  });
});

/** Publish session events for real-time updates */
Meteor.publish("rideSessionEvents", async function publish(sessionId) {
  check(sessionId, String);

  if (!this.userId) {
    return this.ready();
  }

  // Use safety validation to check access permissions
  const validation = await canViewRideSession(this.userId, sessionId);
  if (!validation.allowed) {
    return this.ready();
  }

  // Return only the events field for the specific session
  return RideSessions.find(
    { _id: sessionId },
    {
      fields: {
        events: 1,
        timeline: 1,
        status: 1,
        progress: 1,
      },
    },
  );
});
