import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import {
  isSystemAdmin,
  isSchoolAdmin,
  addSchoolAdminRole,
  removeSchoolAdminRole,
  addSystemRole,
} from "./RoleUtils";

Meteor.methods({
  /**
   * Make user admin of their school (system admin only can create new school admins)
   * School admins can only promote users from their own school
   */
  async "admin.makeSchoolAdmin"(targetUserId) {
    check(targetUserId, String);

    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const currentUser = await Meteor.users.findOneAsync(currentUserId);
    const targetUser = await Meteor.users.findOneAsync(targetUserId);

    if (!targetUser) {
      throw new Meteor.Error("user-not-found", "Target user not found");
    }

    if (!targetUser.schoolId) {
      throw new Meteor.Error("no-school", "Target user must be assigned to a school");
    }

    // Check permissions
    const isSystem = await isSystemAdmin(currentUserId);
    const isSchoolAdminOfTarget = await isSchoolAdmin(currentUserId, targetUser.schoolId);

    if (!isSystem && !isSchoolAdminOfTarget) {
      throw new Meteor.Error("access-denied", "Only system admins or school admins can promote users");
    }

    // School admins can only promote users from their own school
    if (!isSystem && currentUser.schoolId !== targetUser.schoolId) {
      throw new Meteor.Error("access-denied", "You can only promote users from your own school");
    }

    // Add school admin role
    const role = await addSchoolAdminRole(targetUserId, targetUser.schoolId);

    console.log(`👑 User ${targetUser.emails[0].address} promoted to school admin (${role})`);
    return { success: true, role };
  },

  /**
   * Remove school admin role (system admin or same-school admin only)
   */
  async "admin.removeSchoolAdmin"(targetUserId) {
    check(targetUserId, String);

    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const currentUser = await Meteor.users.findOneAsync(currentUserId);
    const targetUser = await Meteor.users.findOneAsync(targetUserId);

    if (!targetUser || !targetUser.schoolId) {
      throw new Meteor.Error("user-not-found", "Target user not found or has no school");
    }

    // Check permissions
    const isSystem = await isSystemAdmin(currentUserId);
    const isSchoolAdminOfTarget = await isSchoolAdmin(currentUserId, targetUser.schoolId);

    if (!isSystem && !isSchoolAdminOfTarget) {
      throw new Meteor.Error("access-denied", "Only system admins or school admins can demote users");
    }

    // School admins can only demote users from their own school
    if (!isSystem && currentUser.schoolId !== targetUser.schoolId) {
      throw new Meteor.Error("access-denied", "You can only demote users from your own school");
    }

    await removeSchoolAdminRole(targetUserId, targetUser.schoolId);

    console.log(`👤 User ${targetUser.emails[0].address} removed from school admin`);
    return { success: true };
  },

  /**
   * Make user system admin (system admin only)
   */
  async "admin.makeSystemAdmin"(targetUserId) {
    check(targetUserId, String);

    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const targetUser = await Meteor.users.findOneAsync(targetUserId);
    if (!targetUser) {
      throw new Meteor.Error("user-not-found", "Target user not found");
    }

    // Only system admins can create other system admins
    await addSystemRole(currentUserId, targetUserId);

    console.log(`🌟 User ${targetUser.emails[0].address} promoted to system admin`);
    return { success: true };
  },

  /**
   * Remove system admin role (system admin only)
   */
  async "admin.removeSystemAdmin"(targetUserId) {
    check(targetUserId, String);

    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    // Only system admins can remove system role
    if (!await isSystemAdmin(currentUserId)) {
      throw new Meteor.Error("access-denied", "Only system administrators can remove system role");
    }

    const targetUser = await Meteor.users.findOneAsync(targetUserId);
    if (!targetUser) {
      throw new Meteor.Error("user-not-found", "Target user not found");
    }

    // Can't remove system role from yourself (prevent lockout)
    if (currentUserId === targetUserId) {
      throw new Meteor.Error("self-demotion", "You cannot remove system role from yourself");
    }

    await Meteor.users.updateAsync(targetUserId, {
      $pull: { roles: "system" },
    });

    console.log(`👤 User ${targetUser.emails[0].address} removed from system admin`);
    return { success: true };
  },

  /**
   * Get users that current admin can manage
   */
  async "admin.getManagedUsers"() {
    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const currentUser = await Meteor.users.findOneAsync(currentUserId);

    // System admins can see all users
    if (currentUser.roles?.includes("system")) {
      return Meteor.users.find({}, {
        fields: {
          emails: 1,
          profile: 1,
          roles: 1,
          schoolId: 1,
          createdAt: 1,
        },
        sort: { "emails.0.address": 1 },
      }).fetchAsync();
    }

    // School admins can only see users from their school
    const adminSchools = [];
    if (currentUser.roles) {
      currentUser.roles.forEach(role => {
        if (role.startsWith("admin.")) {
          adminSchools.push(role.replace("admin.", ""));
        }
      });
    }

    if (adminSchools.length === 0) {
      throw new Meteor.Error("not-admin", "You don't have admin permissions");
    }

    return Meteor.users.find(
      { schoolId: { $in: adminSchools } },
      {
        fields: {
          emails: 1,
          profile: 1,
          roles: 1,
          schoolId: 1,
          createdAt: 1,
        },
        sort: { "emails.0.address": 1 },
      },
    ).fetchAsync();
  },

  /**
   * Get admin info for current user
   */
  async "admin.getMyAdminInfo"() {
    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const user = await Meteor.users.findOneAsync(currentUserId);

    const adminInfo = {
      isSystem: user.roles?.includes("system") || false,
      schoolAdminRoles: user.roles?.filter(role => role.startsWith("admin.")) || [],
      canManageAllSchools: user.roles?.includes("system") || false,
      managedSchoolIds: [],
    };

    // Get managed school IDs
    if (adminInfo.isSystem) {
      const { Schools } = await import("../schools/Schools");
      const allSchools = await Schools.find({ isActive: true }).fetchAsync();
      adminInfo.managedSchoolIds = allSchools.map(school => school._id);
    } else {
      adminInfo.managedSchoolIds = adminInfo.schoolAdminRoles.map(role => role.replace("admin.", ""));
    }

    return adminInfo;
  },

  /**
   * Assign user to a school (system admin only)
   */
  async "accounts.assignUserToSchool"(userId, schoolId) {
    check(userId, String);
    check(schoolId, String);

    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const currentUser = await Meteor.users.findOneAsync(currentUserId);
    if (!currentUser?.roles?.includes("system")) {
      throw new Meteor.Error("access-denied", "Only system administrators can assign users to schools");
    }

    const targetUser = await Meteor.users.findOneAsync(userId);
    if (!targetUser) {
      throw new Meteor.Error("user-not-found", "Target user not found");
    }

    // Import Schools here to avoid circular dependency
    const { Schools } = await import("../schools/Schools");
    const school = await Schools.findOneAsync(schoolId);
    if (!school) {
      throw new Meteor.Error("school-not-found", "School not found");
    }

    await Meteor.users.updateAsync(userId, {
      $set: { schoolId: schoolId }
    });

    return { success: true };
  },

  /**
   * Assign current user to a school during onboarding
   */
  async "accounts.onboarding.assignSchool"(schoolId) {
    check(schoolId, String);

    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      throw new Meteor.Error("not-logged-in", "Please log in first");
    }

    const currentUser = await Meteor.users.findOneAsync(currentUserId);
    if (!currentUser) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    // Import Schools here to avoid circular dependency
    const { Schools } = await import("../schools/Schools");
    const school = await Schools.findOneAsync({ _id: schoolId, isActive: true });
    if (!school) {
      throw new Meteor.Error("school-not-found", "School not found or inactive");
    }

    // Check if school allows public registration
    if (!school.settings?.allowPublicRegistration) {
      throw new Meteor.Error("registration-not-allowed", "This school does not allow public registration");
    }

    // If user already has the same school assigned, just return success
    if (currentUser.schoolId === schoolId) {
      return {
        success: true,
        schoolName: school.name,
        message: `Already assigned to ${school.name}`
      };
    }

    // If user has a different school or no school, assign the selected one
    await Meteor.users.updateAsync(currentUserId, {
      $set: { schoolId: schoolId }
    });

    return {
      success: true,
      schoolName: school.name,
      message: `Successfully joined ${school.name}`
    };
  },
});
