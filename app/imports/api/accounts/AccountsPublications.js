import { Meteor } from "meteor/meteor";

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
    if (user && user.roles && user.roles.includes("admin")) {
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
