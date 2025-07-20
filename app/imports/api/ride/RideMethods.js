import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Rides } from "../../api/ride/Rides";


Meteor.methods({
    async "rides.remove"(rideId) {
        check(rideId, String);

        // Check if user is admin
        const user = await Meteor.userAsync();
        if (!user || !user.roles || !user.roles.includes("admin")) {
            throw new Meteor.Error(
                "access-denied",
                "You must be an admin to delete rides"
            );
        }

        await Rides.removeAsync(rideId);
    },

    async "rides.update"(rideId, updateData) {
        check(rideId, String);
        check(updateData, {
            driver: String,
            rider: String,
            origin: String,
            destination: String,
            date: String,
        });

        // Check if user is admin
        const user = await Meteor.userAsync();
        if (!user || !user.roles || !user.roles.includes("admin")) {
            throw new Meteor.Error(
                "access-denied",
                "You must be an admin to edit rides"
            );
        }

        // Only update fields that exist in the schema
        const allowedFields = {
            driver: updateData.driver,
            rider: updateData.rider,
            origin: updateData.origin,
            destination: updateData.destination,
            date: new Date(updateData.date),
        };

        await Rides.updateAsync(rideId, { $set: allowedFields });
    },
    async "rides.generateShareCode"(rideId) {
        check(rideId, String);

        const user = await Meteor.userAsync();
        if (!user) {
            throw new Meteor.Error(
                "not-authorized",
                "You must be logged in to generate a share code"
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
                "You can only generate share codes for rides you are driving"
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
                "Failed to generate unique share code"
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
                "You must be logged in to join a ride"
            );
        }

        // Normalize the share code format (remove spaces, convert to uppercase, ensure proper dash placement)
        let normalizedCode = shareCode.toUpperCase().replace(/\s+/g, "");

        // If code doesn't have a dash and is 8 characters, add the dash
        if (normalizedCode.length === 8 && !normalizedCode.includes("-")) {
            normalizedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(
                4
            )}`;
        }

        // Find ride with this share code
        const ride = await Rides.findOneAsync({ shareCode: normalizedCode });
        if (!ride) {
            throw new Meteor.Error("invalid-code", "Invalid share code");
        }

        // Check if ride already has a rider (not TBD)
        if (ride.rider !== "TBD") {
            throw new Meteor.Error("ride-full", "This ride already has a rider");
        }

        // Check if user is trying to join their own ride
        if (ride.driver === user.username) {
            throw new Meteor.Error(
                "invalid-operation",
                "You cannot join your own ride"
            );
        }

        // Assign user as rider and clear share code
        await Rides.updateAsync(ride._id, {
            $set: { rider: user.username },
            $unset: { shareCode: "" },
        });

        return { rideId: ride._id, message: "Successfully joined ride!" };
    },
});