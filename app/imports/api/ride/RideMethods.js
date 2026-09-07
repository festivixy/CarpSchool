import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Rides, RidesSchema } from "./Rides";
import { validateUserCanJoinRide, validateUserCanRemoveRider, validateUserCanCreateRide } from "./RideValidation";
import { Profiles } from "../profile/Profile";
import { assertProfileApproved } from "../profile/approvalGuard";
import { Places } from "../places/Places";
import { Chats } from "../chat/Chat";
import { RideSessions } from "../rideSession/RideSession";
import { estimateRoute, estimateRouteVia } from "./routeEstimate";
import { syncChatParticipants } from "../chat/ChatParticipants";
import { sendNotifications, sendToRideParticipants } from "../notifications/NotificationMethods";
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from "../notifications/Notifications";

/* NotificationsSchema only accepts the values in NOTIFICATION_TYPES. Until
 * "ride_updated" / "rider_removed" are added there, fall back to the nearest
 * existing type so the send does not fail validation. */
const TYPE_RIDE_UPDATED = Object.values(NOTIFICATION_TYPES).includes("ride_updated")
  ? "ride_updated" : NOTIFICATION_TYPES.RIDE_UPDATE;
const TYPE_RIDER_REMOVED = Object.values(NOTIFICATION_TYPES).includes("rider_removed")
  ? "rider_removed" : NOTIFICATION_TYPES.RIDER_LEFT;

/* Joining is refused this long after the ride's departure time; mirrors the
 * buffer validateUserCanJoinRide uses for its friendly message. */
const JOIN_GRACE_MS = 30 * 60 * 1000;

const EDITABLE_KEYS = ["origin", "destination", "waypoints", "date", "seats", "fare", "notes"];

const formatRideDate = date => new Date(date).toLocaleString("en-US", {
  weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
});

const displayName = async (userId, fallback) => {
  const profile = await Profiles.findOneAsync({ Owner: userId }, { fields: { Name: 1 } });
  return profile?.Name || fallback;
};

/**
 * Notification failures must never fail the ride mutation they follow, so
 * every send goes through here and logs instead of throwing.
 */
const notifyQuietly = async (label, send) => {
  try {
    await send();
  } catch (error) {
    console.warn(`[rides] Could not send ${label} notification:`, error?.message || error);
  }
};

/**
 * Tell the driver that a seat has been taken.
 *
 * Joining is immediate - there is no request/approve step - so without this
 * the driver learns about a new rider only by re-opening the ride.
 */
const notifyDriverOfJoin = async (ride, rider) => {
  if (!ride?.driver || ride.driver === rider?._id) return;
  await notifyQuietly("rider joined", async () => {
    const name = await displayName(rider._id, rider.username || "A rider");
    await sendNotifications(
      rider._id,
      [ride.driver],
      "New rider",
      `${name} joined your ride`,
      {
        type: NOTIFICATION_TYPES.RIDER_JOINED,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        action: "view_ride",
        data: { rideId: ride._id },
      },
    );
  });
};

/**
 * Read gate shared by the single-ride methods. Participants always pass;
 * anyone else must be at the ride's school, or be a system admin. Fails
 * closed: a missing schoolId on either side denies rather than skips the
 * check (rides created through the REST route carry no schoolId).
 */
const assertRideVisible = async (userId, ride) => {
  const isParticipant = ride.driver === userId
    || (Array.isArray(ride.riders) && ride.riders.includes(userId));
  if (isParticipant) return;

  const user = await Meteor.users.findOneAsync(userId);
  const sameSchool = Boolean(user?.schoolId)
    && Boolean(ride.schoolId)
    && user.schoolId === ride.schoolId;
  const { isSystemAdmin } = await import("../accounts/RoleUtils");

  if (!sameSchool && !await isSystemAdmin(userId)) {
    throw new Meteor.Error("access-denied", "This ride is not at your school.");
  }
};

/** Driver of the ride, a system admin, or an admin of the ride's school. */
const canManageRide = async (userId, ride) => {
  if (ride.driver === userId) return true;
  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
  if (await isSystemAdmin(userId)) return true;
  if (!ride.schoolId) return false;
  return isSchoolAdmin(userId, ride.schoolId);
};

/**
 * Every point on a route must be a Place at the driver's school. One $in
 * query; returns the "lat,lng" value of each id so callers can estimate the
 * route without a second read.
 */
const resolveRoutePlaces = async (schoolId, ids) => {
  const unique = [...new Set(ids.filter(Boolean))];
  const places = await Places.find(
    { _id: { $in: unique }, schoolId },
    { fields: { value: 1 } },
  ).fetchAsync();
  if (places.length !== unique.length) {
    throw new Meteor.Error("invalid-place", "Every stop must be a place at your school.");
  }
  return Object.fromEntries(places.map(p => [p._id, p.value]));
};

/** Denormalised distance/duration for the route, or {} when unreadable. */
const routeFigures = (legIds, valueById) => {
  const estimate = estimateRouteVia(legIds.map(id => valueById[id]));
  if (!estimate) return {};
  return {
    distanceMi: estimate.distanceMi,
    durationMin: estimate.durationMin,
    routeEstimated: true,
  };
};

/**
 * Take a seat if, and only if, one is free right now. The selector carries
 * every eligibility rule so two concurrent joins cannot both pass a
 * read-then-write capacity check. Returns the number of documents matched.
 */
const claimSeat = (rideId, userId) => Rides.updateAsync(
  {
    _id: rideId,
    driver: { $ne: userId },
    riders: { $ne: userId },
    date: { $gte: new Date(Date.now() - JOIN_GRACE_MS) },
    $expr: { $lt: [{ $size: { $ifNull: ["$riders", []] } }, "$seats"] },
  },
  { $addToSet: { riders: userId } },
);

/** Pre-checks shared by rides.join and rides.joinWithCode. */
const assertCanJoin = async (ride, user) => {
  const profile = await assertProfileApproved(user._id);
  const validation = validateUserCanJoinRide(ride, user, profile);
  if (!validation.isValid) {
    throw new Meteor.Error("validation-error", validation.error);
  }
};

/**
 * Remove a ride and everything hanging off it. Riders are told first, while
 * the list is still in hand; the ride chat and any session go with it so a
 * cancelled ride cannot keep a live chat or a startable session behind.
 */
const cancelRide = async (actorId, ride) => {
  const riders = Array.isArray(ride.riders) ? ride.riders : [];
  if (riders.length > 0) {
    await notifyQuietly("ride cancelled", async () => {
      const name = await displayName(ride.driver, "Your driver");
      await sendNotifications(
        actorId,
        riders,
        "Ride cancelled",
        `${name} cancelled the ride on ${formatRideDate(ride.date)}`,
        {
          type: NOTIFICATION_TYPES.RIDE_CANCELLED,
          priority: NOTIFICATION_PRIORITY.HIGH,
          data: { rideId: ride._id },
        },
      );
    });
  }
  await Chats.removeAsync({ rideId: ride._id });
  await RideSessions.removeAsync({ rideId: ride._id });
  await Rides.removeAsync(ride._id);
};

Meteor.methods({
  async "rides.remove"(rideId) {
    check(rideId, String);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to delete rides",
      );
    }

    const { isSystemAdmin } = await import("../accounts/RoleUtils");

    if (!await isSystemAdmin(this.userId)) {
      throw new Meteor.Error(
        "access-denied",
        "You must be a system admin to delete rides",
      );
    }

    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found");
    }

    await cancelRide(this.userId, ride);
  },

  /**
   * Driver's own cancel. Also open to admins of the ride's school so they
   * can clean up after a driver who has gone quiet.
   */
  async "rides.cancel"(rideId) {
    check(rideId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to cancel a ride");
    }

    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found");
    }

    if (!await canManageRide(this.userId, ride)) {
      throw new Meteor.Error("access-denied", "Only the driver can cancel this ride");
    }

    await cancelRide(this.userId, ride);
    return { message: "Ride cancelled" };
  },

  async "rides.create"(rideData) {
    check(rideData, {
      driver: String,
      riders: Array,
      origin: String,
      destination: String,
      waypoints: Match.Optional([String]),
      date: Date,
      seats: Number,
      fare: Match.Optional(Number),
      notes: String,
      createdAt: Date,
    });

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to create a ride.");
    }

    // Ensure the driver is the current user
    if (rideData.driver !== this.userId) {
      throw new Meteor.Error("access-denied", "You cannot create a ride for someone else.");
    }

    const userProfile = await assertProfileApproved(this.userId);
    const roleValidation = validateUserCanCreateRide(userProfile);
    if (!roleValidation.isValid) {
      throw new Meteor.Error("role-error", roleValidation.error);
    }

    // Get user's school ID (required by schema)
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user || !user.schoolId) {
      throw new Meteor.Error("no-school", "You must be associated with a school to create rides.");
    }

    /* riders and createdAt are server-owned: a client may not seed a ride
     * with passengers or backdate it. */
    const { error, value } = RidesSchema.validate({
      driver: this.userId,
      schoolId: user.schoolId,
      origin: rideData.origin,
      destination: rideData.destination,
      waypoints: Array.isArray(rideData.waypoints) ? rideData.waypoints : [],
      date: rideData.date,
      seats: rideData.seats,
      fare: rideData.fare,
      notes: rideData.notes,
      riders: [],
      createdAt: new Date(),
    });
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Denormalise route figures so discovery cards do not have to compute
    // them per render. OSRM is the real source; until it is reachable this
    // is a great-circle estimate, flagged so it can be backfilled.
    const legIds = [value.origin, ...value.waypoints, value.destination];
    const valueById = await resolveRoutePlaces(user.schoolId, legIds);

    return Rides.insertAsync({ ...value, ...routeFigures(legIds, valueById) });
  },

  /**
   * Driver's own edit. Everything not listed in EDITABLE_KEYS is server-owned
   * (riders, schoolId, shareCode, route figures).
   */
  async "rides.edit"(rideId, patch) {
    check(rideId, String);
    check(patch, {
      origin: Match.Optional(String),
      destination: Match.Optional(String),
      waypoints: Match.Optional([String]),
      date: Match.Optional(Date),
      seats: Match.Optional(Number),
      fare: Match.Optional(Number),
      notes: Match.Optional(String),
    });

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to edit a ride");
    }

    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found");
    }
    if (ride.driver !== this.userId) {
      throw new Meteor.Error("access-denied", "Only the driver can edit this ride");
    }

    const changedKeys = EDITABLE_KEYS.filter(key => patch[key] !== undefined);
    if (changedKeys.length === 0) {
      throw new Meteor.Error("no-data", "Nothing to update");
    }

    const riders = Array.isArray(ride.riders) ? ride.riders : [];
    if (patch.seats !== undefined && patch.seats < riders.length) {
      throw new Meteor.Error(
        "seats-below-riders",
        `${riders.length} riders have already joined; seats cannot go below that`,
      );
    }

    // _id present, so the past-date rule is skipped for rides already on the books.
    const { error, value } = RidesSchema.validate({ ...ride, ...patch });
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    const $set = Object.fromEntries(changedKeys.map(key => [key, value[key]]));

    const routeChanged = ["origin", "destination", "waypoints"].some(key => patch[key] !== undefined);
    if (routeChanged) {
      const legIds = [value.origin, ...(value.waypoints || []), value.destination];
      const valueById = await resolveRoutePlaces(ride.schoolId, legIds);
      Object.assign($set, routeFigures(legIds, valueById));
    }

    await Rides.updateAsync(rideId, { $set });

    if (riders.length > 0) {
      await notifyQuietly("ride updated", async () => {
        const labels = {
          origin: "pickup", destination: "destination", waypoints: "stops",
          date: "time", seats: "seats", fare: "fare", notes: "notes",
        };
        const changedList = changedKeys.map(key => labels[key]).join(", ");
        const summary = `The ${changedList} changed on your ride on ${formatRideDate(value.date)}`;
        await sendToRideParticipants(this.userId, rideId, "Ride updated", summary, {
          type: TYPE_RIDE_UPDATED,
          data: { rideId },
        });
      });
    }

    return { message: "Ride updated" };
  },

  async "rides.update"(rideId, updateData) {
    check(rideId, String);
    check(updateData, {
      driver: String,
      riders: [String],
      origin: String,
      destination: String,
      date: String,
      seats: Number,
      notes: String,
    });

    // Check if user is system admin
    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to edit rides",
      );
    }

    const { isSystemAdmin } = await import("../accounts/RoleUtils");

    if (!await isSystemAdmin(user._id)) {
      throw new Meteor.Error(
        "access-denied",
        "You must be a system admin to edit rides",
      );
    }

    const existingRide = await Rides.findOneAsync(rideId);
    if (!existingRide) {
      throw new Meteor.Error("not-found", "Ride not found");
    }

    // Prepare update data with proper types
    const fieldsToUpdate = {
      // schoolId is required by RidesSchema but is not admin-editable. Carry the
      // stored value through so validation can pass; it is stripped before the
      // $set below. Without it every validate() call fails on "schoolId is required".
      schoolId: existingRide.schoolId,
      driver: updateData.driver,
      riders: updateData.riders,
      origin: updateData.origin,
      destination: updateData.destination,
      date: new Date(updateData.date),
      seats: parseInt(updateData.seats, 10),
      notes: updateData.notes,
      _id: rideId, // Include _id for schema validation context
    };

    // Import and validate with schema for data logic validation
    const { error } = RidesSchema.validate(fieldsToUpdate);

    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Remove validation-only fields before updating (not needed for update)
    delete fieldsToUpdate._id;
    delete fieldsToUpdate.schoolId;

    /* Endpoints may have moved: refresh the denormalised route figures. The
     * stored stops are kept, as this form does not edit them. */
    const stops = Array.isArray(existingRide.waypoints) ? existingRide.waypoints : [];
    const legIds = [fieldsToUpdate.origin, ...stops, fieldsToUpdate.destination];
    const routePlaces = await Places.find(
      { _id: { $in: legIds } },
      { fields: { value: 1 } },
    ).fetchAsync();
    const valueById = Object.fromEntries(routePlaces.map(p => [p._id, p.value]));
    Object.assign(fieldsToUpdate, routeFigures(legIds, valueById));

    await Rides.updateAsync(rideId, { $set: fieldsToUpdate });

    const before = [...(existingRide.riders || [])].sort().join(",");
    const after = [...updateData.riders].sort().join(",");
    if (before !== after || existingRide.driver !== updateData.driver) {
      await syncChatParticipants(await Rides.findOneAsync(rideId));
    }
  },
  async "rides.generateShareCode"(rideId) {
    check(rideId, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to generate a share code",
      );
    }

    // Check if user is the driver of this ride
    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found");
    }

    if (ride.driver !== user._id) {
      throw new Meteor.Error(
        "access-denied",
        "You can only generate share codes for rides you are driving",
      );
    }

    // If ride already has a share code, return it instead of generating a new one
    if (ride.shareCode) {
      return ride.shareCode;
    }

    // Generate 8-character code: XXXX-XXXX format with uppercase letters and numbers
    const generateCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 3) code += "-";
      }
      return code;
    };

    // Claim a code atomically. The previous read-then-write could hand the
    // same code to two concurrent callers, letting a rider join a stranger's
    // ride with a friend's code. A unique sparse index on shareCode (see
    // Rides.js) makes a collision fail loudly instead of silently
    // overwriting, and we retry on that error.
    let shareCode;
    let claimed = false;
    for (let attempts = 0; attempts < 10 && !claimed; attempts += 1) {
      shareCode = generateCode();
      try {
        // eslint-disable-next-line no-await-in-loop
        await Rides.updateAsync(rideId, { $set: { shareCode } });
        claimed = true;
      } catch (error) {
        // 11000 is Mongo's duplicate-key error: another ride took this code
        // between generating it and writing it. Try another.
        if (error?.code !== 11000) throw error;
      }
    }

    if (!claimed) {
      throw new Meteor.Error(
        "code-generation-failed",
        "Failed to generate unique share code",
      );
    }

    return shareCode;
  },

  async "rides.joinWithCode"(shareCode) {
    check(shareCode, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to join a ride",
      );
    }

    // Comprehensive input sanitization for share codes
    if (typeof shareCode !== "string") {
      throw new Meteor.Error("invalid-input", "Share code must be a string");
    }

    // Remove all non-alphanumeric characters except hyphens, convert to uppercase
    let normalizedCode = shareCode.toUpperCase().replace(/[^A-Z0-9-]/g, "");

    // Additional validation: reject if code contains suspicious patterns
    if (normalizedCode.length === 0 || normalizedCode.length > 10) {
      throw new Meteor.Error("invalid-format", "Invalid share code format");
    }

    // Reject codes with multiple consecutive hyphens or invalid patterns
    if (normalizedCode.includes("--") || normalizedCode.startsWith("-") || normalizedCode.endsWith("-")) {
      throw new Meteor.Error("invalid-format", "Invalid share code format");
    }

    // If code doesn't have a dash and is 8 characters, add the dash
    if (normalizedCode.length === 8 && !normalizedCode.includes("-")) {
      normalizedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4)}`;
    }

    // Final validation: ensure code matches expected format (4-4 alphanumeric)
    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalizedCode)) {
      throw new Meteor.Error("invalid-format", "Share code must be in format XXXX-XXXX");
    }

    // Find ride with this share code
    const ride = await Rides.findOneAsync({ shareCode: normalizedCode });
    if (!ride) {
      throw new Meteor.Error("invalid-code", "Invalid share code");
    }

    /* A share code is an invitation, so unlike rides.join it deliberately
     * crosses school boundaries. */
    await assertCanJoin(ride, user);

    if (await claimSeat(ride._id, user._id) === 0) {
      throw new Meteor.Error("ride-full", "This ride is full or no longer open to join");
    }

    // If ride is now full, remove the share code
    const joinedViaCode = await Rides.findOneAsync(ride._id);
    if (joinedViaCode.riders.length >= joinedViaCode.seats) {
      await Rides.updateAsync(ride._id, {
        $unset: { shareCode: "" },
      });
    }

    // Chats.Participants is a snapshot taken at chat creation; keep it in step
    // with the ride or this rider cannot post to the ride chat.
    await syncChatParticipants(joinedViaCode);
    await notifyDriverOfJoin(joinedViaCode, user);

    return { rideId: ride._id, message: "Successfully joined ride!" };
  },

  async "rides.join"(rideId) {
    check(rideId, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to join a ride",
      );
    }

    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found");
    }

    if (!user.schoolId || user.schoolId !== ride.schoolId) {
      throw new Meteor.Error("access-denied", "This ride is not at your school.");
    }

    await assertCanJoin(ride, user);

    if (await claimSeat(rideId, user._id) === 0) {
      throw new Meteor.Error("ride-full", "This ride is full or no longer open to join");
    }

    // Keep the ride chat's participant snapshot in step with the ride.
    const joinedRide = await Rides.findOneAsync(rideId);
    await syncChatParticipants(joinedRide);
    await notifyDriverOfJoin(joinedRide, user);

    return { message: "Successfully joined ride!" };
  },

  async "rides.leave"(rideId) {
    check(rideId, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to leave a ride",
      );
    }

    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found");
    }

    // Check if user is a rider on this trip
    if (!ride.riders.includes(user._id)) {
      throw new Meteor.Error("not-a-rider", "You are not a rider on this trip");
    }

    /* Once the driver has started the trip the session's rider list is fixed;
     * leaving the ride underneath it would orphan the pickup/dropoff state. */
    const active = await RideSessions.findOneAsync(
      { rideId, status: "active" },
      { fields: { _id: 1 } },
    );
    if (active) {
      throw new Meteor.Error("ride-in-progress", "You cannot leave a ride that is in progress");
    }

    // Remove user from riders array
    await Rides.updateAsync(rideId, {
      $pull: { riders: user._id },
    });

    // Drop them from the chat too, otherwise a departed rider keeps receiving
    // and can keep posting to the ride chat.
    await syncChatParticipants(await Rides.findOneAsync(rideId));

    await notifyQuietly("rider left", async () => {
      const name = await displayName(user._id, user.username || "A rider");
      await sendNotifications(
        user._id,
        [ride.driver],
        "Rider left",
        `${name} left your ride on ${formatRideDate(ride.date)}`,
        {
          type: NOTIFICATION_TYPES.RIDER_LEFT,
          data: { rideId },
        },
      );
    });

    return { message: "Successfully left ride!" };
  },

  async "rides.removeRider"(rideId, riderUserId) {
    check(rideId, String);
    check(riderUserId, String);

    const user = await Meteor.userAsync();
    const ride = await Rides.findOneAsync(rideId);

    // Use centralized validation. validateUserCanRemoveRider is async (it awaits
    // the RoleUtils admin checks), so without the await `validation` is a Promise
    // and `validation.isValid` is undefined, making the guard below always throw.
    const validation = await validateUserCanRemoveRider(ride, user, riderUserId);

    if (!validation.isValid) {
      throw new Meteor.Error("validation-error", validation.error);
    }

    // Remove rider from the ride
    await Rides.updateAsync(rideId, {
      $pull: { riders: riderUserId },
    });

    // Revoke their chat access along with the seat.
    await syncChatParticipants(await Rides.findOneAsync(rideId));

    await notifyQuietly("rider removed", async () => {
      await sendNotifications(
        user._id,
        [riderUserId],
        "Removed from ride",
        `You were removed from the ride on ${formatRideDate(ride.date)}`,
        {
          type: TYPE_RIDER_REMOVED,
          data: { rideId },
        },
      );
    });

    return { message: "Rider removed successfully!" };
  },

  /**
   * Get rides for current user (as driver or rider)
   */
  async "rides.getUserRides"() {
    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error("not-authorized", "You must be logged in to get your rides");
    }

    // Find rides where user is driver or rider
    const rides = await Rides.find({
      $or: [
        { driver: user._id },
        { riders: user._id },
      ],
    }, {
      sort: { date: -1 },
      limit: 50,
    }).fetchAsync();

    return rides;
  },

  /**
   * Discovery feed: future rides at the current user's school, with
   * origin/destination place names resolved server-side (the requester may
   * not have those places published to them).
   */
  async "rides.forMySchool"(filters = {}) {
    check(filters, Match.Optional({
      from: Match.Optional(Date),
      to: Match.Optional(Date),
    }));

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to browse rides.");
    }

    const { getSchoolFilter } = await import("../accounts/AccountsSchoolUtils");
    const schoolFilter = await getSchoolFilter(userId);

    /* Client input is translated field by field, never spread: a spread would
     * let a caller override the school scope or the date floor. */
    const now = new Date();
    const dateRange = { $gte: filters?.from && filters.from > now ? filters.from : now };
    if (filters?.to) {
      dateRange.$lte = filters.to;
    }

    const query = {
      date: dateRange,
      ...schoolFilter,
    };

    const rides = await Rides.find(query, {
      sort: { date: 1 },
      limit: 50,
      fields: { shareCode: 0 },
    }).fetchAsync();

    // Resolve place names so the discovery UI can show human-readable labels.
    const placeIds = [
      ...new Set(
        rides.flatMap(ride => [
          ride.origin,
          ride.destination,
          ...(Array.isArray(ride.waypoints) ? ride.waypoints : []),
        ]).filter(Boolean),
      ),
    ];
    const places = await Places.find(
      { _id: { $in: placeIds } },
      { fields: { text: 1, value: 1 } },
    ).fetchAsync();
    const nameById = {};
    const coordsById = {};
    places.forEach((place) => {
      nameById[place._id] = place.text;
      coordsById[place._id] = place.value;
    });

    return rides.map((ride) => {
      // Rides created before distanceMi/durationMin existed have no stored
      // figures; estimate them here so the card still shows the data line.
      const fallback = ride.distanceMi === undefined
        ? estimateRoute(coordsById[ride.origin], coordsById[ride.destination])
        : null;
      return {
        ...ride,
        originText: nameById[ride.origin] || null,
        destinationText: nameById[ride.destination] || null,
        // Raw "lat,lng" strings, so the discovery map can plot real markers
        // instead of decorative pins.
        originCoords: coordsById[ride.origin] || null,
        destinationCoords: coordsById[ride.destination] || null,
        /* Stops in the driver's order, so a card can say what a ride passes
         * and the discovery map can plot them. Stops whose place has since
         * been deleted are dropped rather than shown unnamed. */
        waypointStops: (Array.isArray(ride.waypoints) ? ride.waypoints : [])
          .filter(id => nameById[id])
          .map(id => ({ _id: id, text: nameById[id], value: coordsById[id] })),
        distanceMi: ride.distanceMi ?? fallback?.distanceMi,
        durationMin: ride.durationMin ?? fallback?.durationMin,
        routeEstimated: ride.routeEstimated ?? (fallback ? true : undefined),
      };
    });
  },

  /**
   * Fetch a single ride at the current user's school with place names and
   * coordinates resolved. Lets a member view a ride they have not joined yet
   * (the Rides publication only exposes rides you already participate in).
   */
  async "rides.getById"(rideId) {
    check(rideId, String);

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to view a ride.");
    }

    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found.");
    }

    await assertRideVisible(userId, ride);

    const stops = Array.isArray(ride.waypoints) ? ride.waypoints : [];
    const ids = [ride.origin, ...stops, ride.destination].filter(Boolean);
    const places = await Places.find(
      { _id: { $in: ids } },
      { fields: { text: 1, value: 1 } },
    ).fetchAsync();
    const byId = {};
    places.forEach((place) => {
      byId[place._id] = place;
    });

    // The invite code is the driver's to hand out; nobody else needs it.
    const { shareCode, ...visible } = ride;

    return {
      ...visible,
      ...(ride.driver === userId && shareCode ? { shareCode } : {}),
      originText: byId[ride.origin] ? byId[ride.origin].text : null,
      destinationText: byId[ride.destination] ? byId[ride.destination].text : null,
      originCoords: byId[ride.origin] ? byId[ride.origin].value : null,
      destinationCoords: byId[ride.destination] ? byId[ride.destination].value : null,
      /* Resolved in the driver's order, so the detail screen can list the
       * stops without a second round trip. A stop whose place has since been
       * deleted is dropped rather than shown as a blank line. */
      waypointStops: stops
        .filter(id => byId[id])
        .map(id => ({ _id: id, text: byId[id].text, value: byId[id].value })),
    };
  },

  /**
   * Driver credentials for the ride detail sidecard: the verification flags on
   * the driver's profile plus how many rides they have already driven.
   *
   * profiles.displayNames deliberately publishes only Name/year/major, and the
   * Rides publication only exposes rides you already participate in, so a
   * ride-scoped method is the narrowest way to surface these two facts.
   */
  async "rides.driverCredentials"(rideId) {
    check(rideId, String);

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to view a ride.");
    }

    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found.");
    }

    await assertRideVisible(userId, ride);

    const profile = await Profiles.findOneAsync(
      { Owner: ride.driver },
      { fields: { verified: 1, identityVerified: 1 } },
    );

    return {
      verified: Boolean(profile && profile.verified),
      identityVerified: Boolean(profile && profile.identityVerified),
      ridesDriven: await Rides.find({
        driver: ride.driver,
        date: { $lt: new Date() },
      }).countAsync(),
    };
  },
});
