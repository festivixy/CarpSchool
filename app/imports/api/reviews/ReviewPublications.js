import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reviews } from "./Reviews";

const MAX_LIMIT = 50;

/**
 * Reviews written about one user, newest first.
 *
 * `rideId` is withheld so a reader cannot map a piece of feedback back to the
 * specific trip (and therefore to the specific co-rider) it came from.
 */
Meteor.publish("reviews.forUser", function publishReviewsForUser(userId, limit = MAX_LIMIT) {
  check(userId, String);
  check(limit, Match.Integer);

  if (!this.userId) {
    return this.ready();
  }

  return Reviews.find(
    { subject: userId },
    {
      sort: { createdAt: -1 },
      limit: Math.min(Math.max(limit, 1), MAX_LIMIT),
      fields: { rideId: 0 },
    },
  );
});
