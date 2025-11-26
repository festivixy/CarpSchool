import { Meteor } from "meteor/meteor";
import { RideSessions } from "../../api/rideSession/RideSession";

/**
 * Cron job to clean up stale live locations.
 * Runs every 5 minutes.
 */
Meteor.startup(() => {
  // Only run on the server
  if (!Meteor.isServer) return;

  // Run interval every 5 minutes
  Meteor.setInterval(async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      // Find sessions with active live locations
      const activeSessions = await RideSessions.find({
        status: "active",
        finished: false,
        liveLocations: { $exists: true, $ne: {} },
      }).fetchAsync();

      for (const session of activeSessions) {
        if (!session.liveLocations) continue;

        const updates = {};
        let hasUpdates = false;

        // Check each user's location timestamp
        Object.entries(session.liveLocations).forEach(([userId, location]) => {
          if (location && location.timestamp && location.timestamp < fiveMinutesAgo) {
            // Mark for deletion
            updates[`liveLocations.${userId}`] = ""; 
            hasUpdates = true;
          }
        });

        // Apply updates if any stale locations were found
        if (hasUpdates) {
          await RideSessions.updateAsync(session._id, { $unset: updates });
          console.log(`[Cleanup] Removed stale location data for session ${session._id}`);
        }
      }
    } catch (error) {
      console.error("Error in location cleanup job:", error);
    }
  }, 5 * 60 * 1000); // 5 minutes
});

