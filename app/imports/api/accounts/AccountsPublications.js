import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

/** Publish user roles for the current user */
Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.users.find(this.userId, { fields: { roles: 1, schoolId: 1 } });
  }
  return this.ready();
});

/** Publish all users for admin management */
Meteor.publish("AllUsers", async function () {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser) {
    return this.ready();
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("./RoleUtils");

  if (await isSystemAdmin(this.userId)) {
    // System admins can see all users
    return Meteor.users.find(
      {},
      {
        fields: {
          username: 1,
          emails: 1,
          profile: 1,
          roles: 1,
          schoolId: 1,
          createdAt: 1,
        },
      },
    );
  } if (await isSchoolAdmin(this.userId)) {
    // School admins can only see users from their school
    return Meteor.users.find(
      { schoolId: currentUser.schoolId },
      {
        fields: {
          username: 1,
          emails: 1,
          profile: 1,
          roles: 1,
          schoolId: 1,
          createdAt: 1,
        },
      },
    );
  }

  return this.ready();
});

/** Publish specific users by their IDs (for ride session participants) */
Meteor.publish("users.byIds", function (userIds) {
  check(userIds, [String]);

  if (!this.userId) {
    return this.ready();
  }

  // Only the display fields. `profile` as a whole is not publishable: it
  // carries clerkUserId, and the user document captchaSessionId.
  return Meteor.users.find(
    { _id: { $in: userIds.slice(0, 50) } },
    {
      fields: {
        username: 1,
        "profile.firstName": 1,
        "profile.lastName": 1,
        "profile.name": 1,
        "profile.imageUrl": 1,
      },
    },
  );
});
