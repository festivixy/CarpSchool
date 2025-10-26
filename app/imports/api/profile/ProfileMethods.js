import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Profiles } from "./Profile";

Meteor.methods({
  /**
   * Change user role and unverify them
   * Requires re-verification after role change
   */
  async "profile.changeRole"(newRole) {
    check(newRole, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to change your role.");
    }

    if (!["Driver", "Rider"].includes(newRole)) {
      throw new Meteor.Error("invalid-role", "Role must be either 'Driver' or 'Rider'.");
    }

    const userId = this.userId;
    const existingProfile = await Profiles.findOneAsync({ Owner: userId });

    if (!existingProfile) {
      throw new Meteor.Error("no-profile", "Profile not found. Please complete your profile first.");
    }

    // If role is the same, no need to change
    if (existingProfile.UserType === newRole) {
      throw new Meteor.Error("same-role", "You are already set as " + newRole + ".");
    }

    // Update role and unverify user
    await Profiles.updateAsync(
      { Owner: userId },
      {
        $set: {
          UserType: newRole,
          verified: false,  // Unverify user when role changes
          requested: false  // Reset admin approval request when role changes
        }
      }
    );

    return {
      success: true,
      message: `Role changed to ${newRole}. Please complete verification again.`,
      newRole: newRole,
      verified: false,
    };
  },

  /**
   * Update basic profile information (Name, Location)
   */
  async "profile.updateBasicInfo"(profileData) {
    check(profileData, {
      Name: String,
      Location: String,
    });

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to update your profile.");
    }

    const userId = this.userId;
    const existingProfile = await Profiles.findOneAsync({ Owner: userId });

    if (!existingProfile) {
      throw new Meteor.Error("no-profile", "Profile not found. Please complete your profile first.");
    }

    // Validate data
    if (!profileData.Name.trim()) {
      throw new Meteor.Error("invalid-data", "Name is required.");
    }

    if (!profileData.Location.trim()) {
      throw new Meteor.Error("invalid-data", "Location is required.");
    }

    // Update basic info only
    await Profiles.updateAsync(
      { Owner: userId },
      {
        $set: {
          Name: profileData.Name.trim(),
          Location: profileData.Location.trim(),
        }
      }
    );

    return {
      success: true,
      message: "Basic information updated successfully.",
    };
  },

  /**
   * Update contact information (Phone, Other)
   */
  async "profile.updateContactInfo"(contactData) {
    check(contactData, {
      Phone: String,
      Other: String,
    });

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to update your contact info.");
    }

    const userId = this.userId;
    const existingProfile = await Profiles.findOneAsync({ Owner: userId });

    if (!existingProfile) {
      throw new Meteor.Error("no-profile", "Profile not found. Please complete your profile first.");
    }

    // Update contact info only
    await Profiles.updateAsync(
      { Owner: userId },
      {
        $set: {
          Phone: contactData.Phone.trim(),
          Other: contactData.Other.trim(),
        }
      }
    );

    return {
      success: true,
      message: "Contact information updated successfully.",
    };
  },

  /**
   * Update profile images (Profile image, Vehicle image)
   */
  async "profile.updateImages"(imageData) {
    check(imageData, {
      Image: Match.Optional(String),
      Ride: Match.Optional(String),
    });

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to update your images.");
    }

    const userId = this.userId;
    const existingProfile = await Profiles.findOneAsync({ Owner: userId });

    if (!existingProfile) {
      throw new Meteor.Error("no-profile", "Profile not found. Please complete your profile first.");
    }

    const updateFields = {};
    if (imageData.Image !== undefined) {
      updateFields.Image = imageData.Image;
    }
    if (imageData.Ride !== undefined) {
      updateFields.Ride = imageData.Ride;
    }

    // Update images only
    await Profiles.updateAsync(
      { Owner: userId },
      { $set: updateFields }
    );

    return {
      success: true,
      message: "Images updated successfully.",
    };
  },
    async "users.removeProfilePicture"(userId) {
        check(userId, String);

        // Check if user is system admin
        const user = await Meteor.userAsync();
        const { isSystemAdmin } = await import("../accounts/RoleUtils");
        if (!await isSystemAdmin(user._id)) {
            throw new Meteor.Error(
                "access-denied",
                "You must be a system admin to remove profile pictures",
            );
        }

        // Find and update the user's profile to remove the image
        const userProfile = await Profiles.findOneAsync({ Owner: userId });

        if (userProfile && userProfile.Image) {
            await Profiles.updateAsync(userProfile._id, {
                $set: { Image: "" },
            });
        }
    },
});
