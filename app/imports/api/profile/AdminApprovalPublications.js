import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Profiles } from "./Profile";

/**
 * Publish pending users for admin approval
 * Only accessible to system admins and school admins
 */
Meteor.publish("admin.pendingUsers", async function() {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser) {
    return this.ready();
  }

  // Check if user is system admin or school admin
  const isSystemAdmin = currentUser.roles && currentUser.roles.includes("admin");
  const isSchoolAdmin = currentUser.roles && currentUser.roles.includes("school-admin");

  if (!isSystemAdmin && !isSchoolAdmin) {
    return this.ready();
  }

  let query = { verified: true, requested: true };

  // For school admins, only show users from their school
  if (isSchoolAdmin && !isSystemAdmin) {
    query.SchoolId = currentUser.schoolId;
  }

  return Profiles.find(query, {
    fields: {
      Name: 1,
      UserType: 1,
      School: 1,
      SchoolId: 1,
      Owner: 1,
      Image: 1,
      Phone: 1,
      schoolemail: 1,
      verified: 1,
      requested: 1,
      createdAt: 1,
    }
  });
});

/**
 * Publish user's own profile with all approval status fields
 */
Meteor.publish("profiles.mineWithApprovalStatus", function() {
  if (!this.userId) {
    return this.ready();
  }

  return Profiles.find(
    { Owner: this.userId },
    {
      fields: {
        Name: 1,
        Location: 1,
        Image: 1,
        Ride: 1,
        Phone: 1,
        Other: 1,
        UserType: 1,
        verified: 1,
        requested: 1,
        schoolemail: 1,
        approvedAt: 1,
        approvedBy: 1,
        rejectedAt: 1,
        rejectedBy: 1,
        rejectionReason: 1,
        Owner: 1,
        School: 1,
        SchoolId: 1,
      }
    }
  );
});
