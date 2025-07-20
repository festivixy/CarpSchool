import { Meteor } from "meteor/meteor";
import { Rides } from "./Rides";

/** This subscription publishes all rides regardless of user. */
Meteor.publish("Rides", function publish() {
  if (this.userId) {
    return Rides.find();
  }
  return this.ready();
});