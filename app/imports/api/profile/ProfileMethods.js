import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import Joi from "joi";
import { Profiles, ProfileSchema } from "./Profile";

/* What a member may change about their own profile. Everything else
 * (approval flags, Owner, identity verification) is server-owned. */
const SELF_EDITABLE_KEYS = ["Name", "Location", "Phone", "Other", "major", "year", "Image", "Ride"];

/**
 * Validate a partial set of self-editable fields against ProfileSchema, so
 * every path that writes a profile string applies the same length and
 * character limits. Returns the validated (trimmed) values.
 */
const validateProfileFields = (fields) => {
  const keys = Object.keys(fields).filter(key => SELF_EDITABLE_KEYS.includes(key) && fields[key] !== undefined);
  if (keys.length === 0) {
    return {};
  }

  const trimmed = Object.fromEntries(keys.map(key => [
    key,
    typeof fields[key] === "string" ? fields[key].trim() : fields[key],
  ]));

  const partial = Joi.object(
    Object.fromEntries(keys.map(key => [key, ProfileSchema.extract(key)])),
  ).fork(keys, schema => schema.optional());

  const { error, value } = partial.validate(trimmed);
  if (error) {
    throw new Meteor.Error("validation-error", error.details[0].message);
  }
  return value;
};

const requireOwnProfile = async (userId) => {
  if (!userId) {
    throw new Meteor.Error("not-authorized", "You must be logged in to update your profile.");
  }
  const profile = await Profiles.findOneAsync({ Owner: userId }, { fields: { _id: 1 } });
  if (!profile) {
    throw new Meteor.Error("no-profile", "Profile not found. Please complete your profile first.");
  }
  return profile;
};

Meteor.methods({
  /**
   * Create a new user profile
   */
  async "profiles.create"(profileData) {
    check(profileData, {
      Name: String,
      Location: String,
      Image: String,
      Ride: String,
      Phone: String,
      Other: String,
      UserType: String,
      // Accepted for compatibility with older clients, never honoured.
      verified: Match.Optional(Boolean),
      requested: Match.Optional(Boolean),
      rejected: Match.Optional(Boolean),
      Owner: String,
    });

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to create a profile.");
    }

    // Ensure the owner is the current user
    if (profileData.Owner !== this.userId) {
      throw new Meteor.Error("access-denied", "You cannot create a profile for someone else.");
    }

    /* Approval state is the server's: a new profile always starts pending,
     * whatever flags the client sent. */
    const { error, value } = ProfileSchema.validate({
      Name: profileData.Name.trim(),
      Location: profileData.Location.trim(),
      Image: profileData.Image,
      Ride: profileData.Ride.trim(),
      Phone: profileData.Phone.trim(),
      Other: profileData.Other.trim(),
      UserType: profileData.UserType,
      Owner: this.userId,
      verified: false,
      requested: true,
      rejected: false,
      createdAt: new Date(),
    });
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Check if profile already exists
    const existingProfile = await Profiles.findOneAsync({ Owner: this.userId });
    if (existingProfile) {
      throw new Meteor.Error("already-exists", "You already have a profile.");
    }

    try {
      return await Profiles.insertAsync(value);
    } catch (insertError) {
      // 11000: the unique Owner index caught a concurrent double-submit.
      if (insertError?.code === 11000) {
        throw new Meteor.Error("already-exists", "You already have a profile.");
      }
      throw insertError;
    }
  },

  /**
   * Change user role and unverify them
   * Requires re-verification after role change
   */
  async "profile.changeRole"(newRole) {
    check(newRole, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to change your role.");
    }

    if (!["Driver", "Rider", "Both"].includes(newRole)) {
      throw new Meteor.Error("invalid-role", "Role must be either 'Driver', 'Rider', or 'Both'.");
    }

    const userId = this.userId;
    const existingProfile = await Profiles.findOneAsync({ Owner: userId });

    if (!existingProfile) {
      throw new Meteor.Error("no-profile", "Profile not found. Please complete your profile first.");
    }

    // If role is the same, no need to change
    if (existingProfile.UserType === newRole) {
      throw new Meteor.Error("same-role", `You are already set as ${newRole}.`);
    }

    // A role change restarts approval from scratch, which also clears any
    // earlier rejection: the new role is judged on its own.
    await Profiles.updateAsync(
      { Owner: userId },
      {
        $set: {
          UserType: newRole,
          verified: false, // Unverify user when role changes
          requested: false, // Reset admin approval request when role changes
          rejected: false,
        },
        $unset: {
          rejectedAt: "",
          rejectedBy: "",
          rejectionReason: "",
        },
      },
    );

    return {
      success: true,
      message: `Role changed to ${newRole}. Please complete verification again.`,
      newRole,
      verified: false,
    };
  },

  /**
   * Update any of the member-editable profile fields in one write.
   */
  async "profile.update"(fields) {
    check(fields, {
      Name: Match.Optional(String),
      Location: Match.Optional(String),
      Phone: Match.Optional(String),
      Other: Match.Optional(String),
      major: Match.Optional(String),
      year: Match.Optional(String),
      Image: Match.Optional(String),
      Ride: Match.Optional(String),
    });

    await requireOwnProfile(this.userId);

    // year is an enum; an empty string means "clear it", not a value.
    const { year, ...rest } = fields;
    const clearYear = year === "";
    const $set = validateProfileFields(clearYear ? rest : fields);

    await Profiles.updateAsync(
      { Owner: this.userId },
      { $set, ...(clearYear ? { $unset: { year: "" } } : {}) },
    );

    return { success: true, message: "Profile updated successfully." };
  },

  /**
   * Update basic profile information (Name, Location)
   */
  async "profile.updateBasicInfo"(profileData) {
    check(profileData, {
      Name: String,
      Location: String,
    });

    await requireOwnProfile(this.userId);

    // Validate data
    if (!profileData.Name.trim()) {
      throw new Meteor.Error("invalid-data", "Name is required.");
    }

    if (!profileData.Location.trim()) {
      throw new Meteor.Error("invalid-data", "Location is required.");
    }

    const $set = validateProfileFields({ Name: profileData.Name, Location: profileData.Location });

    await Profiles.updateAsync({ Owner: this.userId }, { $set });

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

    await requireOwnProfile(this.userId);
    const $set = validateProfileFields({ Phone: contactData.Phone, Other: contactData.Other });

    await Profiles.updateAsync({ Owner: this.userId }, { $set });

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

    await requireOwnProfile(this.userId);
    const $set = validateProfileFields({ Image: imageData.Image, Ride: imageData.Ride });

    await Profiles.updateAsync({ Owner: this.userId }, { $set });

    return {
      success: true,
      message: "Images updated successfully.",
    };
  },

  async "users.removeProfilePicture"(userId) {
    check(userId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to remove profile pictures.");
    }

    // Check if user is system admin. Use this.userId rather than
    // Meteor.userAsync(), which resolves to null for an unauthenticated
    // caller and made the admin check throw a TypeError instead of denying.
    const { isSystemAdmin } = await import("../accounts/RoleUtils");
    if (!await isSystemAdmin(this.userId)) {
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
