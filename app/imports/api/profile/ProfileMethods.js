import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

Meteor.methods({
    async "users.removeProfilePicture"(userId) {
        check(userId, String);

        // Check if user is admin
        const user = await Meteor.userAsync();
        if (!user || !user.roles || !user.roles.includes("admin")) {
            throw new Meteor.Error(
                "access-denied",
                "You must be an admin to remove profile pictures",
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