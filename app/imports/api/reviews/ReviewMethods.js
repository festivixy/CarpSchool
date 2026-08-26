import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reviews, ReviewSchema } from "./Reviews";
import { Rides } from "../ride/Rides";

Meteor.methods({
  /**
   * Leave a star rating (and optional note) for someone you shared a ride with.
   * Only a past ride can be reviewed, only by a participant, and only once per
   * (ride, author, subject) triple.
   */
  async "reviews.leave"(rideId, subject, stars, text) {
    check(rideId, String);
    check(subject, String);
    check(stars, Match.Integer);
    check(text, Match.Maybe(String));

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to leave a review");
    }

    if (subject === this.userId) {
      throw new Meteor.Error("invalid-subject", "You cannot review yourself");
    }

    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found");
    }

    if (new Date(ride.date) > new Date()) {
      throw new Meteor.Error(
        "ride-not-finished",
        "You can only review a ride that has already happened",
      );
    }

    const participants = [ride.driver, ...(ride.riders || [])];
    if (!participants.includes(this.userId) || !participants.includes(subject)) {
      throw new Meteor.Error(
        "not-authorized",
        "You can only review someone you shared this ride with",
      );
    }

    const { error, value } = ReviewSchema.validate({
      rideId,
      subject,
      author: this.userId,
      stars,
      text: text || "",
      createdAt: new Date(),
    });

    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    const existing = await Reviews.findOneAsync({ rideId, author: this.userId, subject });
    if (existing) {
      throw new Meteor.Error(
        "duplicate-review",
        "You have already reviewed this person for this ride",
      );
    }

    return Reviews.insertAsync(value);
  },
});
