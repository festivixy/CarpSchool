import { Meteor } from "meteor/meteor";
import { Profiles } from "../profile/Profile";
import { Rides } from "../ride/Rides";
import { Places } from "../places/Places";
import { RideSessions } from "../rideSession/RideSession";
import { Chats } from "../chat/Chat";
import { Images } from "../images/Images";
import { Reviews } from "../reviews/Reviews";
import { PushTokens, Notifications } from "../notifications/Notifications";
import { ApiKeys } from "../api-keys/ApiKeys";

const DELETED_USER = "deleted_user";

/**
 * Remove or anonymise everything a user owns, short of the user document
 * itself. Shared by the self-service accounts.deleteMyAccount and the admin
 * users.remove so the two paths cannot drift.
 */
export async function purgeUserData(userId) {
  // 1. Delete user profile
  await Profiles.removeAsync({ Owner: userId });

  // 2. Remove user from all rides they're a rider on
  await Rides.updateAsync(
    { riders: userId },
    { $pull: { riders: userId } },
    { multi: true },
  );

  // 3. Delete rides where user is the driver
  await Rides.removeAsync({ driver: userId });

  // 4. Mark places created by user as "system" owned
  // (Don't delete places as other users may be using them)
  await Places.updateAsync(
    { createdBy: userId },
    { $set: { createdBy: DELETED_USER } },
    { multi: true },
  );

  // 5. Remove user from ride sessions
  // RideSessions has no `userId` field; the user appears as driverId/riders/activeRiders
  // and as a key inside the liveLocations and progress maps.
  await RideSessions.removeAsync({ driverId: userId });
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

  // 6. Chats: leave every chat, and anonymise the sender of messages kept.
  // Sender only exists inside the Messages[] subdocuments, never at the top
  // level, so this needs a filtered positional update rather than a plain $set.
  await Chats.updateAsync(
    { Participants: userId },
    { $pull: { Participants: userId } },
    { multi: true },
  );
  await Chats.updateAsync(
    { "Messages.Sender": userId },
    { $set: { "Messages.$[m].Sender": DELETED_USER } },
    { multi: true, arrayFilters: [{ "m.Sender": userId }] },
  );

  // 7. Delete user images
  // Images stores ownership as `user`/`uploadedBy`; there is no `UserId` field.
  await Images.removeAsync({
    $or: [{ user: userId }, { uploadedBy: userId }],
  });

  // 8. Reviews: keep the ratings, drop the identity on both sides
  await Reviews.updateAsync({ author: userId }, { $set: { author: DELETED_USER } }, { multi: true });
  await Reviews.updateAsync({ subject: userId }, { $set: { subject: DELETED_USER } }, { multi: true });

  // 9. Push tokens, notification history and API keys are the user's alone
  await PushTokens.removeAsync({ userId });
  await Notifications.removeAsync({ userId });
  await ApiKeys.removeAsync({ userId });
}

/**
 * Delete Account Methods
 * Handles user account deletion with proper cleanup
 */

Meteor.methods({
  /**
   * Delete current user's account
   * This is a user-initiated action
   */
  "accounts.deleteMyAccount": async function () {
    if (!this.userId) {
      throw new Meteor.Error("auth-required", "You must be logged in to delete your account");
    }

    const userId = this.userId;

    try {
      await purgeUserData(userId);

      // Finally, delete the user account
      await Meteor.users.removeAsync(userId);

      // Logout will happen automatically since user is deleted
      return { success: true };
    } catch (error) {
      console.error(`Error deleting account for user ${userId}:`, error);
      throw new Meteor.Error(
        "deletion-failed",
        "Failed to delete account. Please contact support.",
        error.message,
      );
    }
  },
});
