import { Meteor } from "meteor/meteor";
import { SchoolEmailVerifications } from "./SchoolEmailVerification";

/**
 * Publication for user's own school email verification status
 */
Meteor.publish("userSchoolEmailVerification", function () {
  if (!this.userId) {
    return this.ready();
  }

  // Only the user's own pending record, and never the code itself: the
  // whole point of emailing it is that only the mailbox owner has it.
  return SchoolEmailVerifications.find(
    { userId: this.userId, verified: false },
    { fields: { email: 1, attempts: 1, maxAttempts: 1, expiresAt: 1, createdAt: 1 } },
  );
});
