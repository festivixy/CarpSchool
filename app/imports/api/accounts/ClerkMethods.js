import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Accounts } from "meteor/accounts-base";
import { Profiles } from "../profile/Profile";

Meteor.methods({

  /**
   * Get or create Meteor user from Clerk user ID
   * This links Clerk auth to your existing Meteor user structure
   */
  "clerk.getMeteorUser": function(clerkUserId) {
    check(clerkUserId, String);

    if (!clerkUserId) {
      throw new Meteor.Error("invalid-clerk-id", "Invalid Clerk user ID");
    }

    // Check if user already exists with this Clerk ID
    const existingUser = Meteor.users.findOne({
      "profile.clerkUserId": clerkUserId
    });

    if (existingUser) {
      return existingUser;
    }

    // Create new Meteor user linked to Clerk
    // Note: Clerk handles password/auth, we just create the Meteor record
    const userId = Accounts.createUser({
      profile: {
        clerkUserId,
        name: "",
      },
    });

    return Meteor.users.findOne(userId);
  },

  /**
   * Complete onboarding for Clerk users
   */
  "clerk.completeOnboarding": function(profileData) {
    check(profileData, Object);

    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    const user = Meteor.users.findOne(this.userId);
    if (!user) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    const profileDoc = {
      Owner: this.userId,
      Name: profileData.name || "",
      schoolemail: user.emails?.[0]?.address || "",
      UserType: profileData.userType || "Driver",
      major: profileData.major || "",
      year: profileData.year || "",
      campus: profileData.campus || "",
      Phone: profileData.phone || "",
      Other: profileData.other || "",
      verified: false,
      requested: true,
      rejected: false,
      createdAt: new Date(),
    };

    Profiles.insert(profileDoc);

    return { success: true };
  },

  /**
   * Assign school to Clerk-linked user
   */
  "clerk.assignSchool": function(schoolId) {
    check(schoolId, String);

    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    Meteor.users.update(this.userId, {
      $set: { schoolId }
    });

    return { success: true };
  },

  /**
   * Update user profile from Clerk user data
   */
  "clerk.syncUserProfile": function(clerkData) {
    check(clerkData, Object);

    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    const updateData = {};

    if (clerkData.firstName) {
      updateData["profile.firstName"] = clerkData.firstName;
    }
    if (clerkData.lastName) {
      updateData["profile.lastName"] = clerkData.lastName;
    }
    if (clerkData.imageUrl) {
      updateData["profile.imageUrl"] = clerkData.imageUrl;
    }

    if (Object.keys(updateData).length > 0) {
      Meteor.users.update(this.userId, {
        $set: updateData
      });
    }

    return { success: true };
  },
});
