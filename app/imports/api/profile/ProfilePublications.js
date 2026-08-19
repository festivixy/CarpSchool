import { Meteor } from "meteor/meteor";
import { Profiles } from "./Profile";

/**
 * Read-only profile publication for normal users
 * Users can only read their own profile
 */
Meteor.publish("userProfile", function publish() {
  if (!this.userId) {
    return this.ready();
  }

  // Return only the user's own profile (read-only)
  return Profiles.find({ Owner: this.userId });
});

/**
 * Legacy publication - kept for backward compatibility but made read-only
 * @deprecated Use userProfile instead
 */
Meteor.publish("Profiles", function publish() {
  if (!this.userId) {
    return this.ready();
  }

  // Only return the user's own profile for backward compatibility (read-only)
  return Profiles.find({ Owner: this.userId });
});

/**
 * Admin publication - allows admins to see all profiles or school-specific profiles
 * Normal users get no access to other profiles
 */
Meteor.publish("ProfilesAdmin", async function publish() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser) {
    return this.ready();
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");

  if (await isSystemAdmin(this.userId)) {
    // System admins can see all profiles
    return Profiles.find();
  } if (await isSchoolAdmin(this.userId)) {
    // School admins can only see profiles from users in their school
    const schoolUsers = await Meteor.users.find(
      { schoolId: currentUser.schoolId },
      { fields: { _id: 1 } },
    ).fetchAsync();
    const userIds = schoolUsers.map(user => user._id);

    return Profiles.find({ Owner: { $in: userIds } });
  }

  // Non-admin users get no access to other profiles
  return this.ready();
});

/**
 * Publication for basic profile display info (Name only)
 * Used for displaying user names in chats, rides, etc.
 * @param {string[]} userIds - Array of user IDs to fetch profiles for
 */
Meteor.publish("profiles.displayNames", function publish(userIds) {
  if (!this.userId) {
    return this.ready();
  }

  // Validate input
  if (!Array.isArray(userIds)) {
    return this.ready();
  }

  // Limit the number of profiles that can be fetched at once
  const limitedUserIds = userIds.slice(0, 50);

  // Return only the fields the discovery cards render: the driver's display
  // name plus the year/major sub-line. Deliberately no contact details.
  return Profiles.find(
    { Owner: { $in: limitedUserIds } },
    { fields: { Name: 1, Owner: 1, year: 1, major: 1 } }
  );
});

/**
 * Publication for all profiles the current user interacts with
 * Returns basic display info for chat participants and ride members
 */
Meteor.publish("profiles.interacted", async function publish() {
  if (!this.userId) {
    return this.ready();
  }

  // Import collections dynamically to avoid circular dependencies
  const { Chats } = require("../chat/Chat");
  const { Rides } = require("../ride/Rides");

  // Meteor 3: server-side reads are async. Calling fetch() here returned a
  // Promise, so the forEach below threw. This body never ran until Meteor
  // sessions started being established, which is why it went unnoticed.
  const userChats = await Chats.find(
    { Participants: this.userId },
    { fields: { Participants: 1 } }
  ).fetchAsync();

  const userRides = await Rides.find(
    { $or: [{ driver: this.userId }, { riders: this.userId }] },
    { fields: { driver: 1, riders: 1 } }
  ).fetchAsync();

  // Collect all unique user IDs
  const userIdSet = new Set();

  userChats.forEach(chat => {
    chat.Participants?.forEach(id => userIdSet.add(id));
  });

  userRides.forEach(ride => {
    if (ride.driver) userIdSet.add(ride.driver);
    ride.riders?.forEach(id => userIdSet.add(id));
  });

  // Always include the current user
  userIdSet.add(this.userId);

  const userIds = Array.from(userIdSet);

  // Return basic profile info for all interacted users
  return Profiles.find(
    { Owner: { $in: userIds } },
    { fields: { Name: 1, Owner: 1 } }
  );
});
