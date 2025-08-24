import { Meteor } from "meteor/meteor";
import { Profiles } from "./Profile";

Meteor.publish("Profiles", function publish() {
  if (this.userId) {
    return Profiles.find({ Owner: this.userId });
  }
  return this.ready();
});

/** This subscription publishes all documents regardless of user, but only if the logged in user is the Admin. */
Meteor.publish("ProfilesAdmin", async function publish() {
  if (this.userId) {
    // Check role assignments directly from the database
    const user = await Meteor.users.findOneAsync(this.userId);
    const { isSystemAdmin } = await import("../accounts/RoleUtils");
    if (await isSystemAdmin(this.userId)) {
      return Profiles.find();
    }
  }
  return this.ready();
});
