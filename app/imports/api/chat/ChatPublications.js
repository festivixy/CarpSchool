import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Chats } from "./Chat";
import { Rides } from "../ride/Rides";

/** Publish chats for the current user */
Meteor.publish("chats", function publishChats() {
  if (!this.userId) {
    return this.ready();
  }

  // Return chats where user is a participant
  return Chats.find({ Participants: this.userId });
});

/** Publish ride-specific chat */
Meteor.publish("chats.forRide", async function publishRideChat(rideId) {
  check(rideId, String);

  if (!this.userId || !rideId) {
    return this.ready();
  }

  // Verify user has access to this ride
  const ride = await Rides.findOneAsync(rideId);
  if (!ride) {
    return this.ready();
  }

  const isDriver = ride.driver === this.userId;
  const isRider = ride.riders && ride.riders.includes(this.userId);

  if (!isDriver && !isRider) {
    return this.ready();
  }

  // Return the chat for this ride
  return Chats.find({ rideId: rideId });
});

/** Publish all chats for admin users */
Meteor.publish("chats.admin", async function publishAllChats() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  const { isSystemAdmin } = await import("../accounts/RoleUtils");

  if (!await isSystemAdmin(this.userId)) {
    return this.ready();
  }

  return Chats.find({});
});
