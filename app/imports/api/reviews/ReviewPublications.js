import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reviews } from "./Reviews";
import { Rides } from "../ride/Rides";

const MAX_LIMIT = 50;

/**
 * Reviews written about one user, newest first.
 *
 * `rideId` is withheld so a reader cannot map a piece of feedback back to the
 * specific trip (and therefore to the specific co-rider) it came from.
 *
 * Only someone who shares a ride with the subject may read them: reviews are
 * for deciding whether to travel with a person, not a public rating board.
 */
Meteor.publish("reviews.forUser", async function publishReviewsForUser(userId, limit = MAX_LIMIT) {
  check(userId, String);
  check(limit, Match.Integer);

  if (!this.userId) {
    return this.ready();
  }

  if (userId !== this.userId) {
    const shared = await Rides.findOneAsync(
      {
        $and: [
          { $or: [{ driver: this.userId }, { riders: this.userId }] },
          { $or: [{ driver: userId }, { riders: userId }] },
        ],
      },
      { fields: { _id: 1 } },
    );
    if (!shared) {
      return this.ready();
    }
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
