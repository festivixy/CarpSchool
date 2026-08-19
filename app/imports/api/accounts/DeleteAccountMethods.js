import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Profiles } from "../profile/Profile";
import { Rides } from "../ride/Rides";
import { Places } from "../places/Places";
import { RideSessions } from "../rideSession/RideSession";
import { Chats } from "../chat/Chat";
import { Images } from "../images/Images";

/**
 * Delete Account Methods
 * Handles user account deletion with proper cleanup
 */

Meteor.methods({
  /**
   * Delete current user's account
   * This is a user-initiated action
   */
  "accounts.deleteMyAccount": async function() {
    if (!this.userId) {
      throw new Meteor.Error("auth-required", "You must be logged in to delete your account");
    }

    const userId = this.userId;

    try {
      console.log(`🗑️  Starting account deletion for user: ${userId}`);

      // 1. Delete user profile
      await Profiles.removeAsync({ Owner: userId });
      console.log(`  ✅ Deleted profile for user: ${userId}`);

      // 2. Remove user from all rides they're a rider on
      await Rides.updateAsync(
        { riders: userId },
        { $pull: { riders: userId } },
        { multi: true }
      );
      console.log(`  ✅ Removed user from rides as rider`);

      // 3. Delete rides where user is the driver
      const deletedRidesCount = await Rides.removeAsync({ driver: userId });
      console.log(`  ✅ Deleted ${deletedRidesCount} rides where user was driver`);

      // 4. Mark places created by user as "system" owned
      // (Don't delete places as other users may be using them)
      await Places.updateAsync(
        { createdBy: userId },
        { $set: { createdBy: "deleted_user" } },
        { multi: true }
      );
      console.log(`  ✅ Transferred place ownership to deleted_user`);

      // 5. Remove user from ride sessions
      // RideSessions has no `userId` field; the user appears as driverId/riders/activeRiders
      // and as a key inside the liveLocations and progress maps.
      const deletedSessionsCount = await RideSessions.removeAsync({ driverId: userId });
      await RideSessions.updateAsync(
        { $or: [{ riders: userId }, { activeRiders: userId }] },
        {
          $pull: { riders: userId, activeRiders: userId },
          // $pull cannot remove object keys, so the per-user GPS history and pickup
          // verification entries have to be unset by path.
          $unset: {
            [`liveLocations.${userId}`]: "",
            [`progress.${userId}`]: "",
          },
        },
        { multi: true },
      );
      console.log(`  ✅ Deleted ${deletedSessionsCount} driver ride sessions, scrubbed rider data`);

      // 6. Mark chats as from deleted user
      // (Keep chat history but anonymize sender)
      // Sender only exists inside the Messages[] subdocuments, never at the top
      // level, so this needs a filtered positional update rather than a plain $set.
      await Chats.updateAsync(
        { "Messages.Sender": userId },
        { $set: { "Messages.$[m].Sender": "deleted_user" } },
        { multi: true, arrayFilters: [{ "m.Sender": userId }] },
      );
      console.log(`  ✅ Anonymized chat messages`);

      // 7. Delete user images
      // Images stores ownership as `user`/`uploadedBy`; there is no `UserId` field.
      const deletedImagesCount = await Images.removeAsync({
        $or: [{ user: userId }, { uploadedBy: userId }],
      });
      console.log(`  ✅ Deleted ${deletedImagesCount} user images`);

      // 8. Finally, delete the user account
      await Meteor.users.removeAsync(userId);
      console.log(`  ✅ Deleted user account: ${userId}`);

      console.log(`✅ Account deletion completed for user: ${userId}`);

      // Logout will happen automatically since user is deleted
      return { success: true };
    } catch (error) {
      console.error(`❌ Error deleting account for user ${userId}:`, error);
      throw new Meteor.Error(
        "deletion-failed",
        "Failed to delete account. Please contact support.",
        error.message
      );
    }
  },
});
