import { Meteor } from "meteor/meteor";
import { Profiles } from "./Profile";

Meteor.publish("Profiles", function publish() {
  if (this.userId) {
    return Profiles.find({ Owner: this.userId });
  }
  return this.ready();
});

/** This subscription publishes all documents regardless of user, but only if the logged in user is the Admin. */
Meteor.publish("ProfilesAdmin", async function publish() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser) {
    return this.ready();
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");

  if (await isSystemAdmin(this.userId)) {
    // System admins can see all profiles
    return Profiles.find();
  } else if (await isSchoolAdmin(this.userId)) {
    // School admins can only see profiles from users in their school
    const schoolUsers = await Meteor.users.find(
      { schoolId: currentUser.schoolId },
      { fields: { _id: 1 } }
    ).fetchAsync();
    const userIds = schoolUsers.map(user => user._id);
    
    return Profiles.find({ Owner: { $in: userIds } });
  }

  return this.ready();
});
