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

/** Publish chats with email search functionality */
Meteor.publish("chats.withEmail", async function publishChatsWithEmail(searchEmail) {
  check(searchEmail, Match.Maybe(String));

  if (!this.userId) {
    return this.ready();
  }

  // Rate limit email fetches to 500ms (every 0.5 seconds)
  const canProceed = await Meteor.callAsync("rateLimit.checkCall", "chats.withEmail", 500);
  if (!canProceed) {
    throw new Meteor.Error('rate-limited', 'Too many requests. Please wait before trying again.');
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser || !currentUser.username) {
    return this.ready();
  }

  // If search email is provided, find user by email
  if (searchEmail) {
    const targetUser = await Meteor.users.findOneAsync({
      "emails.address": searchEmail.toLowerCase().trim(),
    });

    if (targetUser && targetUser.username) {
      // Return chats that include both current user and target user
      return Chats.find({
        Participants: { $all: [currentUser.username, targetUser.username] },
      });
    }
  }

  // If no email or user not found, return regular chats
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
