import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { RideSessions } from "./RideSession";
import { canViewRideSession } from "./RideSessionsSafety";

const COLLECTION = "RideSessions";

/**
 * Drop each rider's pickup code from a session's `progress` map.
 *
 * `progress` is keyed by rider id, so a Mongo projection cannot exclude
 * `progress.<anyone>.code`; it has to be stripped in the publication. Codes
 * are handed out only by rideSessions.getPickupCodeHint, which checks who is
 * asking.
 */
const stripPickupCodes = (fields) => {
  if (!fields.progress || typeof fields.progress !== "object") return fields;
  const progress = Object.fromEntries(
    Object.entries(fields.progress).map(([riderId, entry]) => {
      if (!entry || typeof entry !== "object") return [riderId, entry];
      const { code, ...rest } = entry;
      return [riderId, rest];
    }),
  );
  return { ...fields, progress };
};

/**
 * Publish a RideSessions cursor with every document passed through
 * stripPickupCodes on the way out. observeChanges reports `progress` as one
 * top-level field, so a change to any rider's entry re-runs the strip.
 */
const publishSanitized = async (sub, cursor) => {
  const handle = await cursor.observeChangesAsync({
    added: (id, fields) => sub.added(COLLECTION, id, stripPickupCodes(fields)),
    changed: (id, fields) => sub.changed(COLLECTION, id, stripPickupCodes(fields)),
    removed: id => sub.removed(COLLECTION, id),
  });
  sub.onStop(() => handle.stop());
  sub.ready();
};

/* Admin views are for oversight; nobody's live position belongs there. */
const ADMIN_FIELDS = { fields: { liveLocations: 0 } };

/**
 * Which admin scope, if any, the caller has: "system", the caller's schoolId
 * for a school admin, or null.
 */
const adminScope = async (userId) => {
  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
  if (await isSystemAdmin(userId)) return "system";
  const user = await Meteor.users.findOneAsync(userId, { fields: { schoolId: 1 } });
  if (user?.schoolId && await isSchoolAdmin(userId, user.schoolId)) return user.schoolId;
  return null;
};

const participantSelector = userId => ({
  $or: [
    { driverId: userId },
    { riders: userId },
  ],
});

/** Publish ride sessions where user is participant (driver or rider) */
Meteor.publish("rideSessions", async function publish() {
  if (!this.userId) {
    return this.ready();
  }

  const scope = await adminScope(this.userId);

  if (scope === "system") {
    return publishSanitized(this, RideSessions.find({}, ADMIN_FIELDS));
  }
  if (scope) {
    return publishSanitized(this, RideSessions.find({ schoolId: scope }, ADMIN_FIELDS));
  }

  // Regular users can only see sessions where they are driver or rider
  return publishSanitized(this, RideSessions.find(participantSelector(this.userId)));
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

  return publishSanitized(this, RideSessions.find({ _id: sessionId }));
});

/** Publish active ride sessions for a specific ride */
Meteor.publish("rideSessionsByRide", async function publish(rideId) {
  check(rideId, String);

  if (!this.userId) {
    return this.ready();
  }

  const scope = await adminScope(this.userId);

  if (scope === "system") {
    return publishSanitized(this, RideSessions.find({ rideId }, ADMIN_FIELDS));
  }
  if (scope) {
    return publishSanitized(this, RideSessions.find({ rideId, schoolId: scope }, ADMIN_FIELDS));
  }

  // Non-admin users can only see sessions where they participate
  return publishSanitized(this, RideSessions.find({ rideId, ...participantSelector(this.userId) }));
});

/** Publish active ride sessions for real-time tracking */
Meteor.publish("activeRideSessions", async function publish() {
  if (!this.userId) {
    return this.ready();
  }

  const scope = await adminScope(this.userId);
  const active = { status: "active", finished: false };
  const sort = { sort: { "timeline.started": -1 } };

  if (scope === "system") {
    return publishSanitized(this, RideSessions.find(active, { ...sort, ...ADMIN_FIELDS }));
  }
  if (scope) {
    return publishSanitized(this, RideSessions.find({ ...active, schoolId: scope }, { ...sort, ...ADMIN_FIELDS }));
  }

  // Non-admin users can only see their own active sessions
  return publishSanitized(this, RideSessions.find({ ...active, ...participantSelector(this.userId) }, sort));
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

  const scope = await adminScope(this.userId);
  if (!scope) {
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
  if (scope !== "system") {
    query.schoolId = scope;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  return publishSanitized(this, RideSessions.find(query, {
    sort: sortOptions,
    limit,
    skip,
    ...ADMIN_FIELDS,
  }));
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
  return publishSanitized(this, RideSessions.find(
    { _id: sessionId },
    {
      fields: {
        events: 1,
        timeline: 1,
        status: 1,
        progress: 1,
      },
    },
  ));
});
