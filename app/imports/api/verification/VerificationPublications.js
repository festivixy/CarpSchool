import { Meteor } from "meteor/meteor";
import { Verifications } from "./Verification";
import { isAnyAdminSync } from "../accounts/RoleUtils";

Meteor.publish("userVerification", function () {
  if (!this.userId) {
    return this.ready();
  }

  return Verifications.find({ userId: this.userId });
});

// Admin publication to see all verifications
Meteor.publish("allVerifications", function () {
  if (!this.userId) {
    return this.ready();
  }

  // Check if user has admin privileges using proper role checking
  if (!isAnyAdminSync(this.userId)) {
    return this.ready();
  }

  // Admin users can see all verifications
  return Verifications.find({});
});
