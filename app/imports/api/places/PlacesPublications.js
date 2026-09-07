/* eslint-disable consistent-return */
import { Meteor } from "meteor/meteor";
import { Places } from "./Places";
import { Rides } from "../ride/Rides";

/* Admin lists are bounded; the UI has search, not paging, past this. */
const ADMIN_LIMIT = 500;

/** Ids of every place a user's rides start at, end at or stop by. */
const placeIdsFromRides = async (userId) => {
  const userRides = await Rides.find(
    { $or: [{ driver: userId }, { riders: userId }] },
    { fields: { origin: 1, destination: 1, waypoints: 1 } },
  ).fetchAsync();

  const placeIds = new Set();
  userRides.forEach((ride) => {
    if (ride.origin) placeIds.add(ride.origin);
    if (ride.destination) placeIds.add(ride.destination);
    (Array.isArray(ride.waypoints) ? ride.waypoints : []).forEach(id => placeIds.add(id));
  });
  return Array.from(placeIds);
};

/**
 * Publish places that the current user created or places used in their rides
 */
Meteor.publish("places.mine", async function publishMyPlaces() {
  if (!this.userId) {
    this.ready();
    return;
  }

  // Query for places created by user OR used in their rides
  const query = {
    $or: [{ createdBy: this.userId }, { _id: { $in: await placeIdsFromRides(this.userId) } }],
  };

  return Places.find(query, {
    fields: {
      _id: 1,
      text: 1,
      value: 1,
      createdBy: 1,
      createdAt: 1,
      updatedAt: 1,
      schoolId: 1,
    },
  });
});

/**
 * Publish all places for admin users with creator information
 */
Meteor.publish("places.admin", async function publishAllPlaces() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser) {
    return this.ready();
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");

  const isSystem = await isSystemAdmin(this.userId);
  const isSchool = await isSchoolAdmin(this.userId);

  if (!isSystem && !isSchool) {
    throw new Meteor.Error("access-denied", "Admin access required");
  }

  // System admins see all places, school admins only see their school's places
  const filter = isSystem ? {} : { schoolId: currentUser.schoolId };

  return Places.find(
    filter,
    {
      limit: ADMIN_LIMIT,
      fields: {
        _id: 1,
        text: 1,
        value: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
        schoolId: 1,
      },
    },
  );
});

/**
 * Publish places for dropdown options - only returns id, text, value
 * Users see their own places plus places used in rides they're involved in, admins see all
 */
Meteor.publish("places.options", async function publishPlaceOptions() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser) {
    return this.ready();
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");

  let query;
  let limit;

  if (await isSystemAdmin(this.userId)) {
    // System admins see all places
    query = {};
    limit = ADMIN_LIMIT;
  } else if (await isSchoolAdmin(this.userId)) {
    // School admins see places from their school
    query = { schoolId: currentUser.schoolId };
    limit = ADMIN_LIMIT;
  } else {
    // Query for places created by user OR used in their rides
    query = {
      $or: [{ createdBy: this.userId }, { _id: { $in: await placeIdsFromRides(this.userId) } }],
    };
  }

  return Places.find(query, {
    fields: {
      _id: 1,
      text: 1,
      value: 1,
      createdBy: 1,
      createdAt: 1,
      updatedAt: 1,
      schoolId: 1,
    },
    sort: { text: 1 },
    ...(limit ? { limit } : {}),
  });
});
