import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Accounts } from "meteor/accounts-base";
import { Profiles } from "../profile/Profile";

Meteor.methods({
  /**
   * Link Clerk user ID to existing Meteor user or create new one
   */
  "clerk.linkUser": function(clerkUserId) {
    check(clerkUserId, String);

    if (!clerkUserId) {
      throw new Meteor.Error("invalid-clerk-id", "Invalid Clerk user ID");
    }

    // Check if user already exists with this Clerk ID
    const existingUser = Meteor.users.findOne({
      "profile.clerkUserId": clerkUserId
    });

    if (existingUser) {
      // User already linked, return existing user ID
      return { success: true, userId: existingUser._id, isNew: false };
    }

    // Get Clerk user info from client-side (passed via method or fetched separately)
    // For now, we'll create a placeholder - in production, use Clerk API on server
    const email = this.connection?.httpHeaders?.["x-clerk-user-email"] ||
                  this.connection?.httpHeaders?.["x-clerk-auth-message"];

    // Check if user exists by email (Meteor account)
    const userByEmail = Meteor.users.findOne({
      "emails.address": { $exists: true }
    });

    if (userByEmail) {
      // Link existing Meteor user to Clerk
      Meteor.users.update(userByEmail._id, {
        $set: {
          "profile.clerkUserId": clerkUserId,
          "services.clerk": { userId: clerkUserId }
        }
      });
      return { success: true, userId: userByEmail._id, isNew: false };
    }

    // Create new Meteor user linked to Clerk
    // Note: Clerk handles password/auth, we just create the Meteor record
    const userId = Accounts.createUser({
      profile: {
        clerkUserId: clerkUserId,
        name: "",
      },
    });

    return { success: true, userId, isNew: true };
  },

  /**
   * Get current user by Clerk session
   * Called from client to sync Clerk auth with Meteor
   */
  "clerk.getMeteorUserId": function() {
    if (!this.userId) {
      throw new Meteor.Error("not-logged-in", "Not logged in");
    }
    return this.userId;
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
});
