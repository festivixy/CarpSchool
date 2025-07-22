import { Meteor } from "meteor/meteor";
import { Places } from "./Places";

/**
 * Publish places that the current user created
 */
Meteor.publish("places.mine", function publishMyPlaces() {
  if (!this.userId) {
    return this.ready();
  }

  return Places.find(
    { createdBy: this.userId },
    {
      fields: {
        _id: 1,
        text: 1,
        value: 1,
        createdAt: 1,
        updatedAt: 1,
        createdBy: 1,
      },
    },
  );
});

/**
 * Publish all places for admin users with creator information
 */
Meteor.publish("places.admin", async function publishAllPlaces() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (
    !currentUser ||
    !currentUser.roles ||
    !currentUser.roles.includes("admin")
  ) {
    throw new Meteor.Error("access-denied", "Admin access required");
  }

  return Places.find(
    {},
    {
      fields: {
        _id: 1,
        text: 1,
        value: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  );
});

/**
 * Publish places for dropdown options - only returns id, text, value
 * Users see their own places only, admins see all
 */
Meteor.publish("places.options", async function publishPlaceOptions() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  const isAdmin =
    currentUser && currentUser.roles && currentUser.roles.includes("admin");

  const query = isAdmin ? {} : { createdBy: this.userId };

  return Places.find(query, {
    fields: {
      _id: 1,
      text: 1,
      value: 1,
    },
    sort: { text: 1 },
  });
});
