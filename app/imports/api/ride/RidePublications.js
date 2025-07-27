import { Meteor } from "meteor/meteor";
import { Rides } from "./Rides";

/** This subscription publishes only rides where user is participant (driver or rider). */
Meteor.publish("Rides", function publish() {
  if (this.userId) {
    const currentUser = Meteor.users.findOne(this.userId);
    if (!currentUser || !currentUser.username) {
      return this.ready();
    }

    // Only return rides where user is either driver or rider
    return Rides.find({
      $or: [
        { driver: currentUser.username },
        { riders: currentUser.username }
      ]
    });
  }
  return this.ready();
});
