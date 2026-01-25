import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Rides, RidesSchema } from "./Rides";
import { validateUserCanJoinRide, validateUserCanRemoveRider, validateUserCanCreateRide } from "./RideValidation";
import { Profiles } from "../profile/Profile";

Meteor.methods({
  async "rides.remove"(rideId) {
    check(rideId, String);

    // Check if user is admin
    const user = await Meteor.userAsync();
    const { isSystemAdmin } = await import("../accounts/RoleUtils");

    if (!await isSystemAdmin(user._id)) {
      throw new Meteor.Error(
        "access-denied",
        "You must be a system admin to delete rides",
      );
    }

    await Rides.removeAsync(rideId);
  },

  async "rides.create"(rideData) {
    check(rideData, {
      driver: String,
      riders: Array,
      origin: String,
      destination: String,
      date: Date,
      seats: Number,
      notes: String,
      createdAt: Date,
    });

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to create a ride.");
    }

    // Ensure the driver is the current user
    if (rideData.driver !== this.userId) {
      throw new Meteor.Error("access-denied", "You cannot create a ride for someone else.");
    }

    // Check if user has driver permissions
    const userProfile = await Profiles.findOneAsync({ Owner: this.userId });
    const roleValidation = validateUserCanCreateRide(userProfile);
    if (!roleValidation.isValid) {
      throw new Meteor.Error("role-error", roleValidation.error);
    }

    // Validate data using schema via simple check or reusing schema logic if needed
    // For now, basic checks are sufficient as schema validation happens on insert generally,
    // but explicit validation is better.
    if (!rideData.origin || !rideData.destination || !rideData.date) {
        throw new Meteor.Error("invalid-data", "Missing required fields.");
    }

    // Get user's school ID (required by schema)
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user || !user.schoolId) {
      throw new Meteor.Error("no-school", "You must be associated with a school to create rides.");
    }

    // Add schoolId to ride data
    const rideWithSchool = {
      ...rideData,
      schoolId: user.schoolId,
    };

    const rideId = await Rides.insertAsync(rideWithSchool);
    return rideId;
  },

  async "rides.update"(rideId, updateData) {
    check(rideId, String);
    check(updateData, {
      driver: String,
      riders: [String],
      origin: String,
      destination: String,
      date: String,
      seats: Number,
      notes: String,
    });

    // Check if user is system admin
    const user = await Meteor.userAsync();
    const { isSystemAdmin } = await import("../accounts/RoleUtils");

    if (!await isSystemAdmin(user._id)) {
      throw new Meteor.Error(
        "access-denied",
        "You must be a system admin to edit rides",
      );
    }

    // Prepare update data with proper types
    const fieldsToUpdate = {
      driver: updateData.driver,
      riders: updateData.riders,
      origin: updateData.origin,
      destination: updateData.destination,
      date: new Date(updateData.date),
      seats: parseInt(updateData.seats, 10),
      notes: updateData.notes,
      _id: rideId, // Include _id for schema validation context
    };

    // Import and validate with schema for data logic validation
    const { error } = RidesSchema.validate(fieldsToUpdate);

    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    // Remove _id from fields before updating (not needed for update)
    delete fieldsToUpdate._id;

    await Rides.updateAsync(rideId, { $set: fieldsToUpdate });
  },
  async "rides.generateShareCode"(rideId) {
    check(rideId, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to generate a share code",
      );
    }

    // Check if user is the driver of this ride
    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found");
    }

    if (ride.driver !== user._id) {
      throw new Meteor.Error(
        "access-denied",
        "You can only generate share codes for rides you are driving",
      );
    }

    // If ride already has a share code, return it instead of generating a new one
    if (ride.shareCode) {
      return ride.shareCode;
    }

    // Generate 8-character code: XXXX-XXXX format with uppercase letters and numbers
    const generateCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 3) code += "-";
      }
      return code;
    };

    let shareCode;
    let attempts = 0;
    let existingRide;
    do {
      shareCode = generateCode();
      attempts++;
      // Check if code already exists
      // eslint-disable-next-line no-await-in-loop
      existingRide = await Rides.findOneAsync({ shareCode });
      if (!existingRide) break;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new Meteor.Error(
        "code-generation-failed",
        "Failed to generate unique share code",
      );
    }

    // Update ride with share code
    await Rides.updateAsync(rideId, { $set: { shareCode } });

    return shareCode;
  },

  async "rides.joinWithCode"(shareCode) {
    check(shareCode, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to join a ride",
      );
    }

    // Comprehensive input sanitization for share codes
    if (typeof shareCode !== "string") {
      throw new Meteor.Error("invalid-input", "Share code must be a string");
    }

    // Remove all non-alphanumeric characters except hyphens, convert to uppercase
    let normalizedCode = shareCode.toUpperCase().replace(/[^A-Z0-9-]/g, "");

    // Additional validation: reject if code contains suspicious patterns
    if (normalizedCode.length === 0 || normalizedCode.length > 10) {
      throw new Meteor.Error("invalid-format", "Invalid share code format");
    }

    // Reject codes with multiple consecutive hyphens or invalid patterns
    if (normalizedCode.includes("--") || normalizedCode.startsWith("-") || normalizedCode.endsWith("-")) {
      throw new Meteor.Error("invalid-format", "Invalid share code format");
    }

    // If code doesn't have a dash and is 8 characters, add the dash
    if (normalizedCode.length === 8 && !normalizedCode.includes("-")) {
      normalizedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4)}`;
    }

    // Final validation: ensure code matches expected format (4-4 alphanumeric)
    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalizedCode)) {
      throw new Meteor.Error("invalid-format", "Share code must be in format XXXX-XXXX");
    }

    // Find ride with this share code
    const ride = await Rides.findOneAsync({ shareCode: normalizedCode });
    if (!ride) {
      throw new Meteor.Error("invalid-code", "Invalid share code");
    }

    // Get user profile for role validation
    const userProfile = await Profiles.findOneAsync({ Owner: user._id });

    // Use centralized validation with profile
    const validation = validateUserCanJoinRide(ride, user, userProfile);

    if (!validation.isValid) {
      throw new Meteor.Error("validation-error", validation.error);
    }

    // Add user to riders array
    await Rides.updateAsync(ride._id, {
      $push: { riders: user._id },
    });

    // If ride is now full, remove the share code
    if (ride.riders.length + 1 >= ride.seats) {
      await Rides.updateAsync(ride._id, {
        $unset: { shareCode: "" },
      });
    }

    return { rideId: ride._id, message: "Successfully joined ride!" };
  },

  async "rides.join"(rideId) {
    check(rideId, String);

    const user = await Meteor.userAsync();
    const ride = await Rides.findOneAsync(rideId);
    
    // Get user profile for role validation
    const userProfile = await Profiles.findOneAsync({ Owner: user._id });

    // Use centralized validation with profile
    const validation = validateUserCanJoinRide(ride, user, userProfile);

    if (!validation.isValid) {
      throw new Meteor.Error("validation-error", validation.error);
    }

    // Add user to riders array
    await Rides.updateAsync(rideId, {
      $push: { riders: user._id },
    });

    return { message: "Successfully joined ride!" };
  },

  async "rides.leave"(rideId) {
    check(rideId, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to leave a ride",
      );
    }

    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found");
    }

    // Check if user is a rider on this trip
    if (!ride.riders.includes(user._id)) {
      throw new Meteor.Error("not-a-rider", "You are not a rider on this trip");
    }

    // Remove user from riders array
    await Rides.updateAsync(rideId, {
      $pull: { riders: user._id },
    });

    return { message: "Successfully left ride!" };
  },

  async "rides.removeRider"(rideId, riderUserId) {
    check(rideId, String);
    check(riderUserId, String);

    const user = await Meteor.userAsync();
    const ride = await Rides.findOneAsync(rideId);

    // Use centralized validation
    const validation = validateUserCanRemoveRider(ride, user, riderUserId);

    if (!validation.isValid) {
      throw new Meteor.Error("validation-error", validation.error);
    }

    // Remove rider from the ride
    await Rides.updateAsync(rideId, {
      $pull: { riders: riderUserId },
    });

    return { message: "Rider removed successfully!" };
  },

  /**
   * Get rides for current user (as driver or rider)
   */
  async "rides.getUserRides"() {
    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error("not-authorized", "You must be logged in to get your rides");
    }

    // Find rides where user is driver or rider
    const rides = await Rides.find({
      $or: [
        { driver: user._id },
        { riders: user._id },
      ],
    }, {
      sort: { date: -1 },
      limit: 50,
    }).fetchAsync();

    return rides;
  },
});
