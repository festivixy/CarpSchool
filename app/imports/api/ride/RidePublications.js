import { Meteor } from "meteor/meteor";
import { Rides } from "./Rides";

/** This subscription publishes only rides where user is participant (driver or rider). */
Meteor.publish("Rides", async function publish() {
  if (this.userId) {
    // Only return rides where user is either driver or rider (using user ID)
    return Rides.find({
      $or: [
        { driver: this.userId },
        { riders: this.userId },
      ],
    });
  }
  return this.ready();
});
