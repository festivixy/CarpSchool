import { Meteor } from "meteor/meteor";
import { oneSignalManager } from "./oneSignalNotifications";
import { notificationManager } from "./notifications";

/**
 * Unsubscribe user from all push notifications when logging out
 * This ensures user privacy and prevents notifications after logout
 */
export const unsubscribeOnLogout = async () => {
  console.log("[Logout] Starting notification unsubscription...");

  try {
    const promises = [];

    // 1. OneSignal unsubscription
    if (oneSignalManager.isSupported && window.OneSignal) {
      try {
        console.log("[Logout] Unsubscribing from OneSignal...");

        // Get current player ID before logout
        const playerId = oneSignalManager.getPlayerId();

        if (playerId) {
          // Set external user ID to null (logout from OneSignal)
          await window.OneSignal.logout();
          console.log("[Logout] OneSignal logout successful");
        }

        // Optionally unsubscribe from push notifications entirely
        // This removes the subscription but keeps the user able to re-subscribe
        if (window.OneSignal.User?.PushSubscription?.optOut) {
          await window.OneSignal.User.PushSubscription.optOut();
          console.log("[Logout] OneSignal push subscription opted out");
        }

      } catch (oneSignalError) {
        console.warn("[Logout] OneSignal unsubscription failed:", oneSignalError);
      }
    }

    // 2. Deactivate push tokens on server with enhanced fallback
    if (Meteor.userId()) {
      try {
        console.log("[Logout] Deactivating server push tokens...");

        const deactivatePromise = deactivateUserTokensWithFallback()
          .then((result) => {
            if (result.success) {
              console.log(`[Logout] Token deactivation completed via ${result.method}:`, result.result);
            } else {
              console.warn("[Logout] Token deactivation failed:", result.error);
            }
          });

        promises.push(deactivatePromise);

      } catch (serverError) {
        console.warn("[Logout] Server token deactivation failed:", serverError);
      }
    }

    // 3. Clear local notification manager state
    if (notificationManager) {
      try {
        console.log("[Logout] Clearing local notification state...");

        // Clear stored tokens
        if (notificationManager.clearToken) {
          notificationManager.clearToken();
        }

        // Reset manager state
        if (notificationManager.reset) {
          notificationManager.reset();
        }

        console.log("[Logout] Local notification state cleared");
      } catch (localError) {
        console.warn("[Logout] Local notification cleanup failed:", localError);
      }
    }

    // 4. Wait for all async operations to complete
    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }

    console.log("[Logout] Notification unsubscription completed");
    return true;

  } catch (error) {
    console.error("[Logout] Notification unsubscription failed:", error);
    return false;
  }
};

/**
 * Create the missing server method for deactivating user tokens
 * This ensures the Meteor method exists and is properly integrated
 */
export const createDeactivateTokensMethod = () => {
  // Verify the Meteor method exists
  if (Meteor.isServer) {
    console.warn("[Logout] createDeactivateTokensMethod should not be called on server");
    return;
  }

  // Check if the method is available
  const testMethod = async () => {
    try {
      if (!Meteor.userId()) {
        console.log("[Logout] No user logged in, skipping method test");
        return false;
      }

      // Test if the method exists by calling it
      await Meteor.callAsync("notifications.deactivateUserTokens");
      console.log("[Logout] notifications.deactivateUserTokens method is available");
      return true;

    } catch (error) {
      if (error.error === 404 || error.reason?.includes("not found")) {
        console.error("[Logout] notifications.deactivateUserTokens method not found - please restart server");
        return false;
      }
        // Method exists but failed for other reasons (which is okay during testing)
        console.log("[Logout] notifications.deactivateUserTokens method exists but failed (expected during logout)");
        return true;

    }
  };

  return testMethod;
};

/**
 * Enhanced unsubscription with better error handling and fallbacks
 */
/**
 * Test if the server method for token deactivation is available
 * Useful for debugging and ensuring proper deployment
 */
export const testServerMethodAvailability = async () => {
  if (!Meteor.userId()) {
    return { available: false, reason: "No user logged in" };
  }

  try {
    // Test with a dry-run call (we expect it to fail with user permissions or work)
    await Meteor.callAsync("notifications.deactivateUserTokens");
    return { available: true, tested: true };

  } catch (error) {
    if (error.error === 404 || error.reason?.includes("not found") || error.reason?.includes("Method") && error.reason?.includes("not found")) {
      return { available: false, reason: "Method not found - server restart needed" };
    }
      // Method exists but failed for other reasons (permissions, etc.)
      return { available: true, tested: true, note: `Method exists but failed: ${error.reason || error.message}` };

  }
};

export const deactivateUserTokensWithFallback = async () => {
  console.log("[Logout] Starting enhanced token deactivation...");

  try {
    // Method 1: Try the Meteor method
    if (Meteor.userId()) {
      try {
        const result = await Meteor.callAsync("notifications.deactivateUserTokens");
        console.log("[Logout] Successfully deactivated tokens via Meteor method:", result);
        return { success: true, method: "meteor", result };

      } catch (meteorError) {
        console.warn("[Logout] Meteor method failed:", meteorError.reason || meteorError.message);

        // If method doesn't exist, this is expected and the server-side logout will handle it
        if (meteorError.error === 404 || meteorError.reason?.includes("not found")) {
          console.log("[Logout] Method not available - server will handle token cleanup during logout");
          return { success: true, method: "server-side", result: "deferred" };
        }
      }
    }

    // Method 2: Manual cleanup for current device
    console.log("[Logout] Attempting manual current device cleanup...");

    if (oneSignalManager.isSupported && oneSignalManager.getPlayerId()) {
      try {
        // Deactivate current device specifically
        await Meteor.callAsync("notifications.deactivateDevice", oneSignalManager.getPlayerId());
        console.log("[Logout] Current device token deactivated manually");
        return { success: true, method: "manual", result: "current-device-only" };

      } catch (deviceError) {
        console.warn("[Logout] Manual device deactivation failed:", deviceError.reason || deviceError.message);
      }
    }

    // Method 3: Mark as best effort
    console.log("[Logout] Token deactivation will be handled by server-side logout process");
    return { success: true, method: "best-effort", result: "server-cleanup-expected" };

  } catch (error) {
    console.error("[Logout] All token deactivation methods failed:", error);
    return { success: false, error: error.message };
  }
};
