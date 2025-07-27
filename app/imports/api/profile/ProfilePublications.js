import { Meteor } from "meteor/meteor";
import { Profiles } from "./Profile";

Meteor.publish("Profiles", async function publish() {
  if (this.userId) {
    const user = await Meteor.users.findOneAsync(this.userId);
    const username = user._id;
    return Profiles.find({ Owner: username });
  }
  return this.ready();
});

/** This subscription publishes all documents regardless of user, but only if the logged in user is the Admin. */
Meteor.publish("ProfilesAdmin", async function publish() {
  if (this.userId) {
    // Check role assignments directly from the database
    const user = await Meteor.users.findOneAsync(this.userId);
    if (user && user.roles && user.roles.includes("admin")) {
      return Profiles.find();
    }
  }
  return this.ready();
});
