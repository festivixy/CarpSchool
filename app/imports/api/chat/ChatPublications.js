import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Chats } from "./Chat";
import { Rides } from "../ride/Rides";

/** Publish chats for the current user */
Meteor.publish("chats", async function publishChats() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser || !currentUser.username) {
    return this.ready();
  }

  // Return chats where user is a participant
  return Chats.find({ Participants: currentUser.username });
});


/** Publish ride-specific chat */
Meteor.publish("chats.forRide", async function publishRideChat(rideId) {
  check(rideId, String);

  if (!this.userId || !rideId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser || !currentUser.username) {
    return this.ready();
  }

  // Verify user has access to this ride
  const ride = await Rides.findOneAsync(rideId);
  if (!ride) {
    return this.ready();
  }

  const isDriver = ride.driver === currentUser.username;
  const isRider = ride.riders && ride.riders.includes(currentUser.username);

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
  if (
    !currentUser ||
    !currentUser.roles ||
    !currentUser.roles.includes("admin")
  ) {
    return this.ready();
  }

  return Chats.find({});
});
