import { Meteor } from "meteor/meteor";
import { Verifications } from "./Verification";
import { isAnyAdmin } from "../accounts/RoleUtils";

Meteor.publish("userVerification", function () {
  if (!this.userId) {
    return this.ready();
  }

  return Verifications.find({ userId: this.userId });
});

// Admin publication to see all verifications
Meteor.publish("allVerifications", async function () {
  if (!this.userId) {
    return this.ready();
  }

  // Check if user has admin privileges using proper role checking.
  // Must be awaited: the previous un-awaited guard was always falsy, so every
  // signed-in user received the full verification set.
  if (!(await isAnyAdmin(this.userId))) {
    return this.ready();
  }

  // Admin users can see all verifications
  return Verifications.find({});
});
