import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Verifications } from "./Verification";
import { Profiles } from "../profile/Profile";

Meteor.methods({
  /**
   * Finish verification process for the current user
   * Updates user's verification status to verified
   */
  async "verify.finish"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to verify.");
    }

    const userId = this.userId;

    // Get user's profile to determine their role
    const userProfile = await Profiles.findOneAsync({ Owner: userId });
    if (!userProfile) {
      throw new Meteor.Error("no-profile", "User profile not found. Please complete your profile first.");
    }

    const userType = userProfile.UserType;
    if (!userType || !["Driver", "Rider"].includes(userType)) {
      throw new Meteor.Error("invalid-role", "Invalid user type. Must be Driver or Rider.");
    }

    // Check if verification already exists
    const existingVerification = await Verifications.findOneAsync({ userId });

    if (existingVerification) {
      // Update existing verification
      await Verifications.updateAsync(existingVerification._id, {
        $set: {
          verificationStatus: "verified",
          verifiedAt: new Date(),
          updatedAt: new Date(),
          userType: userType,
        }
      });
    } else {
      // Create new verification record
      await Verifications.insertAsync({
        userId: userId,
        userType: userType,
        verificationStatus: "verified",
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Update user profile to set verified: true
    await Profiles.updateAsync(
      { Owner: userId },
      { $set: { verified: true } }
    );

    return {
      success: true,
      message: `${userType} verification completed successfully!`,
      userType: userType,
      verifiedAt: new Date(),
    };
  },

  /**
   * Get verification status for the current user
   */
  async "verify.getStatus"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in.");
    }

    const verification = await Verifications.findOneAsync({ userId: this.userId });
    const userProfile = await Profiles.findOneAsync({ Owner: this.userId });

    return {
      verification: verification || null,
      userType: userProfile?.UserType || null,
      isVerified: verification?.verificationStatus === "verified" || false,
    };
  },
});
