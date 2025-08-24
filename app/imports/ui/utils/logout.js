import { Meteor } from "meteor/meteor";
import { unsubscribeOnLogout } from "./unsubscribeNotifications";

/**
 * Centralized logout utility that handles notification unsubscription
 * Use this instead of calling Meteor.logout() directly
 */
export const logoutWithUnsubscription = async (callback) => {
  try {
    console.log("[Logout] Starting secure logout process...");

    // Step 1: Unsubscribe from notifications
    const unsubscribeSuccess = await unsubscribeOnLogout();

    if (unsubscribeSuccess) {
      console.log("[Logout] Notification unsubscription completed");
    } else {
      console.warn("[Logout] Notification unsubscription had issues, but continuing logout");
    }

    // Step 2: Meteor logout
    Meteor.logout((error) => {
      if (error) {
        console.error("[Logout] Meteor logout failed:", error);
      } else {
        console.log("[Logout] Meteor logout successful");
      }

      // Call the provided callback regardless of unsubscription success
      if (callback && typeof callback === "function") {
        callback(error);
      }
    });

  } catch (error) {
    console.error("[Logout] Logout process failed:", error);

    // Fallback: still attempt Meteor logout
    Meteor.logout((logoutError) => {
      console.error("[Logout] Fallback logout:", logoutError);
      if (callback && typeof callback === "function") {
        callback(logoutError || error);
      }
    });
  }
};

/**
 * Synchronous logout (for backwards compatibility)
 * Still includes unsubscription but doesn't wait for it
 */
export const logoutSync = (callback) => {
  // Start unsubscription process but don't wait
  unsubscribeOnLogout()
    .then(() => console.log("[Logout] Background unsubscription completed"))
    .catch((error) => console.warn("[Logout] Background unsubscription failed:", error));

  // Immediate logout
  Meteor.logout(callback);
};

/**
 * For use in components that need to handle logout programmatically
 */
export const createLogoutHandler = (navigate) => async () => {
    await logoutWithUnsubscription(() => {
      // Navigate to signout page or home
      if (navigate) {
        navigate("/signout");
      } else if (window.location) {
        window.location.href = "/signout";
      }
    });
  };
