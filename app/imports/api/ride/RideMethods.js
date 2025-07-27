import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Rides } from "./Rides";

Meteor.methods({
  async "rides.remove"(rideId) {
    check(rideId, String);

    // Check if user is admin
    const user = await Meteor.userAsync();
    if (!user || !user.roles || !user.roles.includes("admin")) {
      throw new Meteor.Error(
        "access-denied",
        "You must be an admin to delete rides",
      );
    }

    await Rides.removeAsync(rideId);
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

    // Check if user is admin
    const user = await Meteor.userAsync();
    if (!user || !user.roles || !user.roles.includes("admin")) {
      throw new Meteor.Error(
        "access-denied",
        "You must be an admin to edit rides",
      );
    }

    // Only update fields that exist in the schema
    const allowedFields = {
      driver: updateData.driver,
      riders: updateData.riders,
      origin: updateData.origin,
      destination: updateData.destination,
      date: new Date(updateData.date),
      seats: parseInt(updateData.seats),
      notes: updateData.notes,
    };

    await Rides.updateAsync(rideId, { $set: allowedFields });
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

    if (ride.driver !== user.username) {
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

    // Check if ride is full
    if (ride.riders.length >= ride.seats) {
      throw new Meteor.Error("ride-full", "This ride is full");
    }

    // Check if user is already a rider
    if (ride.riders.includes(user.username)) {
      throw new Meteor.Error(
        "already-joined",
        "You are already a rider on this trip",
      );
    }

    // Check if user is trying to join their own ride
    if (ride.driver === user.username) {
      throw new Meteor.Error(
        "invalid-operation",
        "You cannot join your own ride",
      );
    }

    // Add user to riders array
    await Rides.updateAsync(ride._id, {
      $push: { riders: user.username },
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
    if (!user) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to join a ride",
      );
    }

    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found");
    }

    // Check if ride is full
    if (ride.riders.length >= ride.seats) {
      throw new Meteor.Error("ride-full", "This ride is full");
    }

    // Check if user is already a rider
    if (ride.riders.includes(user.username)) {
      throw new Meteor.Error(
        "already-joined",
        "You are already a rider on this trip",
      );
    }

    // Check if user is trying to join their own ride
    if (ride.driver === user.username) {
      throw new Meteor.Error(
        "invalid-operation",
        "You cannot join your own ride",
      );
    }

    // Add user to riders array
    await Rides.updateAsync(rideId, {
      $push: { riders: user.username },
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
    if (!ride.riders.includes(user.username)) {
      throw new Meteor.Error("not-a-rider", "You are not a rider on this trip");
    }

    // Remove user from riders array
    await Rides.updateAsync(rideId, {
      $pull: { riders: user.username },
    });

    return { message: "Successfully left ride!" };
  },

  async "rides.removeRider"(rideId, riderUsername) {
    check(rideId, String);
    check(riderUsername, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to remove riders",
      );
    }

    const ride = await Rides.findOneAsync(rideId);
    if (!ride) {
      throw new Meteor.Error("not-found", "Ride not found");
    }

    const isAdmin = user.roles && user.roles.includes("admin");
    const isDriver = ride.driver === user.username;

    // Only driver or admin can remove riders
    if (!isDriver && !isAdmin) {
      throw new Meteor.Error(
        "access-denied",
        "You can only remove riders from your own rides",
      );
    }

    // Check if the user to remove is actually a rider
    if (!ride.riders.includes(riderUsername)) {
      throw new Meteor.Error("not-a-rider", "User is not a rider on this trip");
    }

    // Remove rider from the ride
    await Rides.updateAsync(rideId, {
      $pull: { riders: riderUsername },
    });

    return { message: "Rider removed successfully!" };
  },
});
