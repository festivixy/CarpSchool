import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import SimpleSchema from "simpl-schema";
import { isCaptchaSolved, useCaptcha } from "../captcha/Captcha";
import { isEmailVerified } from "./Accounts";
import { Profiles } from "../profile/Profile";

Meteor.methods({
  async "accounts.email.send.verification"(captchaSessionId) {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-logged-in", "Please login first");
    }

    if (await isEmailVerified(userId)) {
      throw new Meteor.Error(
        "email-already-verified",
        "Your email is already verified",
      );
    }

    // Verify captcha
    check(captchaSessionId, String);
    if (!(await isCaptchaSolved(captchaSessionId))) {
      throw new Meteor.Error(
        "captcha-not-solved",
        "Please complete the security verification",
      );
    }

    // Use the captcha (invalidate it)
    await useCaptcha(captchaSessionId);

    const result = await Accounts.sendVerificationEmail(userId);
    return result;
  },

  async "users.remove"(userId) {
    check(userId, String);

    // Check if user is system admin
    const user = await Meteor.userAsync();
    const { isSystemAdmin } = await import("./RoleUtils");
    if (!await isSystemAdmin(user._id)) {
      throw new Meteor.Error(
        "access-denied",
        "You must be a system admin to delete users",
      );
    }

    // Prevent self-deletion
    if (userId === Meteor.userId()) {
      throw new Meteor.Error(
        "invalid-operation",
        "You cannot delete your own account",
      );
    }

    await Meteor.users.removeAsync(userId);
  },

  async "users.update"(userId, updateData) {
    check(userId, String);
    check(updateData, {
      username: String,
      profileName: String,
      email: String,
      emailVerified: Boolean,
    });

    // Check if user is system admin
    const user = await Meteor.userAsync();
    const { isSystemAdmin } = await import("./RoleUtils");
    if (!await isSystemAdmin(user._id)) {
      throw new Meteor.Error(
        "access-denied",
        "You must be a system admin to edit users",
      );
    }

    // Validate email format using Meteor's built-in email regex
    if (!SimpleSchema.RegEx.Email.test(updateData.email)) {
      throw new Meteor.Error("invalid-email", "Invalid email format");
    }

    // Check if email is already used by another user
    const existingEmailUser = await Meteor.users.findOneAsync({
      "emails.address": updateData.email.toLowerCase(),
      _id: { $ne: userId },
    });
    if (existingEmailUser) {
      throw new Meteor.Error("email-taken", "Email already exists");
    }

    // Get current user data to check if email is changing
    const targetUser = await Meteor.users.findOneAsync(userId);
    if (!targetUser) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    const currentEmail = targetUser.emails?.[0]?.address;
    const emailChanged = currentEmail !== updateData.email.toLowerCase();

    // If email is changing, reset verification status for security
    const emailVerified = emailChanged ? false : updateData.emailVerified;

    // Update user data with proper security measures
    await Meteor.users.updateAsync(userId, {
      $set: {
        username: updateData.username,
        "emails.0.address": updateData.email.toLowerCase(),
        "emails.0.verified": emailVerified,
      },
    });

    // Update or create profile with the new name
    if (updateData.profileName.trim()) {
      const existingProfile = await Profiles.findOneAsync({ Owner: userId });

      if (existingProfile) {
        // Update existing profile
        await Profiles.updateAsync(existingProfile._id, {
          $set: { Name: updateData.profileName.trim() },
        });
      } else {
        // Create new profile if it doesn't exist
        await Profiles.insertAsync({
          Name: updateData.profileName.trim(),
          Location: "",
          Image: "",
          Ride: "",
          Phone: "",
          Other: "",
          UserType: "Driver",
          verified: false,        // New profiles need admin approval
          requested: true,        // Request admin approval
          rejected: false,        // Not rejected yet
          Owner: userId,
        });
      }
    }
  },

  async "users.toggleAdmin"(userId, action) {
    check(userId, String);
    check(action, String);

    // Check if user is system admin
    const user = await Meteor.userAsync();
    const { isSystemAdmin } = await import("./RoleUtils");
    if (!await isSystemAdmin(user._id)) {
      throw new Meteor.Error(
        "access-denied",
        "You must be a system admin to modify system admin roles",
      );
    }

    // Prevent removing system admin role from self
    if (userId === Meteor.userId() && action === "remove") {
      throw new Meteor.Error(
        "invalid-operation",
        "You cannot remove system admin role from yourself",
      );
    }

    if (action === "add") {
      await Meteor.users.updateAsync(userId, { $addToSet: { roles: "system" } });
    } else if (action === "remove") {
      await Meteor.users.updateAsync(userId, { $pull: { roles: "system" } });
    }
  },

  async "users.getUsername"(userId) {
    check(userId, String);

    // Only logged-in users can fetch usernames
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-logged-in", "Please login first");
    }

    // Handle special cases
    if (userId === "system" || userId === "System") {
      return "System";
    }
    if (userId === "deleted_user") {
      return "[deleted user]";
    }

    // Try to get profile name first
    const { Profiles } = await import("../profile/Profile");
    const profile = await Profiles.findOneAsync({ Owner: userId });
    if (profile?.Name) {
      return profile.Name;
    }

    // Fall back to user account
    const user = await Meteor.users.findOneAsync(userId, {
      fields: { username: 1, emails: 1 },
    });

    // If user doesn't exist, they were deleted
    if (!user) {
      return "[deleted user]";
    }

    // Return username if available
    if (user.username) {
      return user.username;
    }

    // Return email username as fallback
    if (user.emails?.[0]?.address) {
      return user.emails[0].address.split("@")[0];
    }

    return null;
  },

  /**
   * Get display names for multiple users at once
   * More efficient than calling users.getUsername multiple times
   */
  async "users.getDisplayNames"(userIds) {
    check(userIds, [String]);

    // Only logged-in users can fetch usernames
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-logged-in", "Please login first");
    }

    // Limit to prevent abuse
    if (userIds.length > 100) {
      throw new Meteor.Error("too-many-users", "Maximum 100 users per request");
    }

    const result = {};
    const { Profiles } = await import("../profile/Profile");

    // Get all profiles for these users
    const profiles = await Profiles.find({
      Owner: { $in: userIds }
    }).fetchAsync();

    const profileMap = {};
    profiles.forEach(profile => {
      if (profile.Name) {
        profileMap[profile.Owner] = profile.Name;
      }
    });

    // Get all users
    const users = await Meteor.users.find(
      { _id: { $in: userIds } },
      { fields: { username: 1, emails: 1 } }
    ).fetchAsync();

    const userMap = {};
    users.forEach(user => {
      userMap[user._id] = user;
    });

    // Build result
    for (const userId of userIds) {
      // Handle special cases
      if (userId === "system" || userId === "System") {
        result[userId] = "System";
        continue;
      }
      if (userId === "deleted_user") {
        result[userId] = "[deleted user]";
        continue;
      }

      // Try profile name first
      if (profileMap[userId]) {
        result[userId] = profileMap[userId];
        continue;
      }

      // Try user account
      const user = userMap[userId];
      if (!user) {
        result[userId] = "[deleted user]";
        continue;
      }

      if (user.username) {
        result[userId] = user.username;
      } else if (user.emails?.[0]?.address) {
        result[userId] = user.emails[0].address.split("@")[0];
      } else {
        result[userId] = `User ${userId.substring(0, 6)}...`;
      }
    }

    return result;
  },
});
