import { Meteor } from "meteor/meteor";
import { Verifications } from "./Verification";

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

  // Check if user is admin (you may want to implement proper role checking)
  const user = Meteor.users.findOne(this.userId);
  if (!user) {
    return this.ready();
  }

  // For now, return all verifications for admin users
  // You should implement proper admin role checking here
  return Verifications.find({});
});
