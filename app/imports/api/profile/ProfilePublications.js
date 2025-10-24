import { Meteor } from "meteor/meteor";
import { Profiles } from "./Profile";

/**
 * Read-only profile publication for normal users
 * Users can only read their own profile
 */
Meteor.publish("userProfile", function publish() {
  if (!this.userId) {
    return this.ready();
  }

  // Return only the user's own profile (read-only)
  return Profiles.find({ Owner: this.userId });
});

/**
 * Legacy publication - kept for backward compatibility but made read-only
 * @deprecated Use userProfile instead
 */
Meteor.publish("Profiles", function publish() {
  if (!this.userId) {
    return this.ready();
  }

  // Only return the user's own profile for backward compatibility (read-only)
  return Profiles.find({ Owner: this.userId });
});

/**
 * Admin publication - allows admins to see all profiles or school-specific profiles
 * Normal users get no access to other profiles
 */
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
  } if (await isSchoolAdmin(this.userId)) {
    // School admins can only see profiles from users in their school
    const schoolUsers = await Meteor.users.find(
      { schoolId: currentUser.schoolId },
      { fields: { _id: 1 } },
    ).fetchAsync();
    const userIds = schoolUsers.map(user => user._id);

    return Profiles.find({ Owner: { $in: userIds } });
  }

  // Non-admin users get no access to other profiles
  return this.ready();
});
