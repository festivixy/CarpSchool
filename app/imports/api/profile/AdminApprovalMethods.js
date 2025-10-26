import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Profiles } from "./Profile";

Meteor.methods({
  /**
   * Approve a user's verification (admin only)
   * Sets requested: false so user can access the app
   */
  async "admin.approveUser"(userId) {
    check(userId, String);

    // Check if current user is admin
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser) {
      throw new Meteor.Error("not-authorized", "You must be logged in.");
    }

    // Check if user is system admin or school admin
    const isSystemAdmin = currentUser.roles && currentUser.roles.includes("admin");
    const isSchoolAdmin = currentUser.roles && currentUser.roles.includes("school-admin");

    if (!isSystemAdmin && !isSchoolAdmin) {
      throw new Meteor.Error("not-authorized", "Only administrators can approve users.");
    }

    // Get the profile to approve
    const profileToApprove = await Profiles.findOneAsync({ Owner: userId });
    if (!profileToApprove) {
      throw new Meteor.Error("profile-not-found", "User profile not found.");
    }

    // Check if profile is in the correct state for approval
    if (!profileToApprove.verified) {
      throw new Meteor.Error("not-verified", "User must be verified before they can be approved.");
    }

    if (!profileToApprove.requested) {
      throw new Meteor.Error("not-requested", "User is not pending approval.");
    }

    // For school admins, ensure they can only approve users from their school
    if (isSchoolAdmin && !isSystemAdmin) {
      const targetUser = await Meteor.users.findOneAsync(userId);
      if (!targetUser || targetUser.schoolId !== currentUser.schoolId) {
        throw new Meteor.Error("not-authorized", "School administrators can only approve users from their own school.");
      }
    }

    // Approve the user by setting requested: false
    await Profiles.updateAsync(
      { Owner: userId },
      { 
        $set: { 
          requested: false,
          approvedAt: new Date(),
          approvedBy: this.userId,
        } 
      }
    );

    return {
      success: true,
      message: `User ${profileToApprove.Name} has been approved successfully.`,
      userId: userId,
      userName: profileToApprove.Name,
      userType: profileToApprove.UserType,
    };
  },

  /**
   * Reject a user's verification (admin only)
   * Sets verified: false and requested: false so user must re-verify
   */
  async "admin.rejectUser"(userId, reason) {
    check(userId, String);
    check(reason, Match.Optional(String));

    // Check if current user is admin
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser) {
      throw new Meteor.Error("not-authorized", "You must be logged in.");
    }

    // Check if user is system admin or school admin
    const isSystemAdmin = currentUser.roles && currentUser.roles.includes("admin");
    const isSchoolAdmin = currentUser.roles && currentUser.roles.includes("school-admin");

    if (!isSystemAdmin && !isSchoolAdmin) {
      throw new Meteor.Error("not-authorized", "Only administrators can reject users.");
    }

    // Get the profile to reject
    const profileToReject = await Profiles.findOneAsync({ Owner: userId });
    if (!profileToReject) {
      throw new Meteor.Error("profile-not-found", "User profile not found.");
    }

    // Check if profile is in the correct state for rejection
    if (!profileToReject.verified || !profileToReject.requested) {
      throw new Meteor.Error("invalid-state", "User is not pending approval.");
    }

    // For school admins, ensure they can only reject users from their school
    if (isSchoolAdmin && !isSystemAdmin) {
      const targetUser = await Meteor.users.findOneAsync(userId);
      if (!targetUser || targetUser.schoolId !== currentUser.schoolId) {
        throw new Meteor.Error("not-authorized", "School administrators can only reject users from their own school.");
      }
    }

    // Reject the user by setting both verified: false and requested: false
    const updateData = { 
      verified: false,
      requested: false,
      rejectedAt: new Date(),
      rejectedBy: this.userId,
    };

    // Add rejection reason if provided
    if (reason && reason.trim()) {
      updateData.rejectionReason = reason.trim();
    }

    await Profiles.updateAsync(
      { Owner: userId },
      { $set: updateData }
    );

    return {
      success: true,
      message: `User ${profileToReject.Name} has been rejected and must re-verify.`,
      userId: userId,
      userName: profileToReject.Name,
      userType: profileToReject.UserType,
      reason: reason || "No reason provided",
    };
  },

  /**
   * Get list of users pending approval (admin only)
   */
  async "admin.getPendingUsers"() {
    // Check if current user is admin
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser) {
      throw new Meteor.Error("not-authorized", "You must be logged in.");
    }

    // Check if user is system admin or school admin
    const isSystemAdmin = currentUser.roles && currentUser.roles.includes("admin");
    const isSchoolAdmin = currentUser.roles && currentUser.roles.includes("school-admin");

    if (!isSystemAdmin && !isSchoolAdmin) {
      throw new Meteor.Error("not-authorized", "Only administrators can view pending users.");
    }

    let query = { verified: true, requested: true };

    // For school admins, only show users from their school
    if (isSchoolAdmin && !isSystemAdmin) {
      query.SchoolId = currentUser.schoolId;
    }

    const pendingProfiles = await Profiles.find(query, {
      sort: { createdAt: -1 },
      fields: {
        Name: 1,
        UserType: 1,
        School: 1,
        SchoolId: 1,
        Owner: 1,
        Image: 1,
        Phone: 1,
        schoolemail: 1,
        createdAt: 1,
      }
    }).fetchAsync();

    // Get user account info for each profile
    const usersWithDetails = await Promise.all(
      pendingProfiles.map(async (profile) => {
        const user = await Meteor.users.findOneAsync(profile.Owner, {
          fields: { 
            emails: 1, 
            createdAt: 1,
            schoolId: 1,
          }
        });

        return {
          ...profile,
          userEmail: user?.emails?.[0]?.address || "No email",
          userCreatedAt: user?.createdAt || profile.createdAt,
        };
      })
    );

    return {
      success: true,
      pendingUsers: usersWithDetails,
      count: usersWithDetails.length,
    };
  },
});
