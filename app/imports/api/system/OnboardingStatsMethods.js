import { Meteor } from "meteor/meteor";
import { Schools } from "../schools/Schools";
import { Rides } from "../ride/Rides";

Meteor.methods({
  /**
   * Aggregate counts for the onboarding wizard's social-proof panel.
   *
   * Returns totals only — no document contents — so nothing about another
   * student is exposed to an account that has not been approved yet.
   */
  async "onboarding.stats"() {
    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    const [schoolCount, rideCount] = await Promise.all([
      Schools.find({ isActive: true }).countAsync(),
      Rides.find({}).countAsync(),
    ]);

    return { schoolCount, rideCount };
  },
});
