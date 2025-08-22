import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Rides } from "./Rides";
import { getSchoolFilter, validateSchoolAccess, getCurrentUserSchool } from "../accounts/AccountsSchoolUtils";

/**
 * Example of school-aware ride methods
 * These should replace or extend your existing ride methods
 */

Meteor.methods({
  /**
   * Create a ride (school-aware)
   */
  async "rides.create.school"(rideData) {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const user = await Meteor.users.findOneAsync(userId);
    if (!user.schoolId) {
      throw new Meteor.Error("no-school", "User must be assigned to a school");
    }

    // Validate ride data with school
    const { error, value } = Rides.attachedSchema().validate({
      ...rideData,
      schoolId: user.schoolId, // Automatically set to user's school
      driver: userId,
      createdAt: new Date(),
    });

    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Validate that origin and destination belong to the same school
    const { Places } = await import("../places/Places");
    const origin = await Places.findOneAsync({ 
      _id: value.origin, 
      schoolId: user.schoolId 
    });
    const destination = await Places.findOneAsync({ 
      _id: value.destination, 
      schoolId: user.schoolId 
    });

    if (!origin) {
      throw new Meteor.Error("invalid-origin", "Origin location not found in your school");
    }
    if (!destination) {
      throw new Meteor.Error("invalid-destination", "Destination location not found in your school");
    }

    const rideId = await Rides.insertAsync(value);
    return rideId;
  },

  /**
   * Join a ride (school-aware)
   */
  async "rides.join.school"(rideId) {
    check(rideId, String);
    
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const user = await Meteor.users.findOneAsync(userId);
    const ride = await Rides.findOneAsync(rideId);

    if (!ride) {
      throw new Meteor.Error("ride-not-found", "Ride not found");
    }

    // Ensure user and ride are from the same school
    if (user.schoolId !== ride.schoolId) {
      throw new Meteor.Error("school-mismatch", "You can only join rides from your school");
    }

    // Check if ride has available seats
    if (ride.riders.length >= ride.seats) {
      throw new Meteor.Error("ride-full", "This ride is already full");
    }

    // Check if user is already in the ride
    if (ride.riders.includes(userId) || ride.driver === userId) {
      throw new Meteor.Error("already-in-ride", "You are already part of this ride");
    }

    // Add user to ride
    await Rides.updateAsync(rideId, {
      $push: { riders: userId }
    });

    return true;
  },

  /**
   * Get rides for current user's school
   */
  async "rides.forMySchool"(filters = {}) {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const schoolFilter = await getSchoolFilter(userId);
    
    const query = {
      ...schoolFilter,
      ...filters,
      date: { $gte: new Date() }, // Only future rides
    };

    const rides = await Rides.find(query, {
      sort: { date: 1 },
      limit: 50
    }).fetchAsync();

    return rides;
  },
});
