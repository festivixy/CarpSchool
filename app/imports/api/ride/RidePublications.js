import { Meteor } from "meteor/meteor";
import { Rides } from "./Rides";

/* Upper bound on any single rides subscription. Ride history is read from
 * this publication, so it is bounded by count rather than by date: the most
 * recent 200 rides is plenty of history and still a fixed cost. */
const MAX_RIDES = 200;

/** This subscription publishes only rides where user is participant (driver or rider). */
Meteor.publish("Rides", async function publish() {
  if (this.userId) {
    // Only return rides where user is either driver or rider (using user ID)
    return Rides.find(
      {
        $or: [
          { driver: this.userId },
          { riders: this.userId },
        ],
      },
      { sort: { date: -1 }, limit: MAX_RIDES },
    );
  }
  return this.ready();
});

/**
 * Admin view. System admins see every ride; school admins only their own
 * school's. Nobody else gets anything.
 */
Meteor.publish("rides.admin", async function publish() {
  if (!this.userId) {
    return this.ready();
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
  const options = { sort: { date: -1 }, limit: MAX_RIDES };

  if (await isSystemAdmin(this.userId)) {
    return Rides.find({}, options);
  }

  const user = await Meteor.users.findOneAsync(this.userId, { fields: { schoolId: 1 } });
  if (user?.schoolId && await isSchoolAdmin(this.userId, user.schoolId)) {
    return Rides.find({ schoolId: user.schoolId }, options);
  }

  return this.ready();
});
