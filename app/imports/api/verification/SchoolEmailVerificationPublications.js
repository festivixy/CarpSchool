import { Meteor } from "meteor/meteor";
import { SchoolEmailVerifications } from "./SchoolEmailVerification";

/**
 * Publication for user's own school email verification status
 */
Meteor.publish("userSchoolEmailVerification", function () {
  if (!this.userId) {
    return this.ready();
  }

  // Only return the user's own verification records
  return SchoolEmailVerifications.find({ 
    userId: this.userId,
    verified: false 
  });
});
