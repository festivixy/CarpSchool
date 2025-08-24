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
  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");

  if (await isSystemAdmin(this.userId)) {
    // System admins can see all chats
    return Chats.find({});
  } if (await isSchoolAdmin(this.userId)) {
    // School admins can only see chats from their school
    // Find rides from the school to get their chats
    const schoolRides = await Rides.find(
      { schoolId: currentUser.schoolId },
      { fields: { _id: 1 } },
    ).fetchAsync();
    const rideIds = schoolRides.map(ride => ride._id);

    return Chats.find({ rideId: { $in: rideIds } });
  }

  return this.ready();
});
