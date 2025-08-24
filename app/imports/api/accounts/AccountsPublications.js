import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

/** Publish user roles for the current user */
Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.users.find(this.userId, { fields: { roles: 1 } });
  }
  return this.ready();
});

/** Publish all users for admin management */
Meteor.publish("AllUsers", async function () {
  if (this.userId) {
    const user = await Meteor.users.findOneAsync(this.userId);
    const { isSystemAdmin } = await import("./RoleUtils");
    if (await isSystemAdmin(this.userId)) {
      return Meteor.users.find(
        {},
        {
          fields: {
            username: 1,
            emails: 1,
            profile: 1,
            roles: 1,
            createdAt: 1,
          },
        },
      );
    }
  }
  return this.ready();
});

/** Publish specific users by their IDs (for ride session participants) */
Meteor.publish("users.byIds", function (userIds) {
  check(userIds, [String]);

  if (!this.userId) {
    return this.ready();
  }

  // Only return basic user info (username and profile) for security
  return Meteor.users.find(
    { _id: { $in: userIds } },
    {
      fields: {
        username: 1,
        profile: 1,
      },
    },
  );
});
