import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Accounts } from "meteor/accounts-base";
import { Profiles } from "../profile/Profile";

Meteor.methods({

  /**
   * Get or create Meteor user from Clerk user ID
   * This links Clerk auth to your existing Meteor user structure
   */
  "clerk.getMeteorUser": async function(clerkUserId) {
    check(clerkUserId, String);

    if (!clerkUserId) {
      throw new Meteor.Error("invalid-clerk-id", "Invalid Clerk user ID");
    }

    // Check if user already exists with this Clerk ID
    const existingUser = await Meteor.users.findOneAsync({
      "profile.clerkUserId": clerkUserId
    });

    if (existingUser) {
      return existingUser;
    }

    // Create new Meteor user linked to Clerk
    // Note: Clerk handles password/auth, we just create the Meteor record
    const userId = Accounts.createUser({
      username: `clerk_${clerkUserId}`, // Generate unique username from Clerk ID
      email: `clerk_${clerkUserId}@clerk.local`, // Dummy email for system compatibility
      profile: {
        clerkUserId,
        name: "",
      },
      roles: [], // Initialize empty roles array for role system compatibility
    });

    const newUser = await Meteor.users.findOneAsync(userId);
    console.log(`✅ Created Meteor user for Clerk ID ${clerkUserId}:`, userId);
    return newUser;
  },

  /**
   * Complete onboarding for Clerk users
   */
  "clerk.completeOnboarding": async function(profileData) {
    check(profileData, Object);

    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    const user = await Meteor.users.findOneAsync(this.userId);
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
  "clerk.assignSchool": async function(schoolId) {
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
  "clerk.syncUserProfile": async function(clerkData) {
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

    // Sync roles from Clerk metadata if provided
    if (clerkData.publicMetadata?.roles) {
      updateData.roles = clerkData.publicMetadata.roles;
    }

    if (Object.keys(updateData).length > 0) {
      Meteor.users.update(this.userId, {
        $set: updateData
      });
    }

    return { success: true };
  },

  /**
   * Initialize roles for existing Clerk users that don't have roles array
   * This is for migration purposes
   */
  "clerk.initializeRoles": async function() {
    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    // Only initialize if roles array doesn't exist
    if (!user.roles) {
      await Meteor.users.updateAsync(this.userId, {
        $set: { roles: [] }
      });
      console.log(`✅ Initialized roles array for Clerk user: ${this.userId}`);
    }

    return { success: true, hadRoles: !!user.roles };
  },

  /**
   * Get user's current roles (for Clerk users to check their permissions)
   */
  "clerk.getUserRoles": async function() {
    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    const user = await Meteor.users.findOneAsync(
      this.userId,
      { fields: { roles: 1, schoolId: 1, "profile.clerkUserId": 1 } }
    );

    if (!user) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    return {
      roles: user.roles || [],
      schoolId: user.schoolId || null,
      isClerkUser: !!user.profile?.clerkUserId,
    };
  },
});
