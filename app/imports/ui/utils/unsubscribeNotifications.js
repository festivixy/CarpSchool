import { Meteor } from "meteor/meteor";
import { oneSignalManager } from "./oneSignalNotifications";
import { notificationManager } from "./notifications";

/**
 * Unsubscribe user from all push notifications when logging out
 * This ensures user privacy and prevents notifications after logout
 */
export const unsubscribeOnLogout = async () => {
  console.log('[Logout] Starting notification unsubscription...');
  
  try {
    const promises = [];

    // 1. OneSignal unsubscription
    if (oneSignalManager.isSupported && window.OneSignal) {
      try {
        console.log('[Logout] Unsubscribing from OneSignal...');
        
        // Get current player ID before logout
        const playerId = oneSignalManager.getPlayerId();
        
        if (playerId) {
          // Set external user ID to null (logout from OneSignal)
          await window.OneSignal.logout();
          console.log('[Logout] OneSignal logout successful');
        }
        
        // Optionally unsubscribe from push notifications entirely
        // This removes the subscription but keeps the user able to re-subscribe
        if (window.OneSignal.User?.PushSubscription?.optOut) {
          await window.OneSignal.User.PushSubscription.optOut();
          console.log('[Logout] OneSignal push subscription opted out');
        }
        
      } catch (oneSignalError) {
        console.warn('[Logout] OneSignal unsubscription failed:', oneSignalError);
      }
    }

    // 2. Deactivate push tokens on server
    if (Meteor.userId()) {
      try {
        console.log('[Logout] Deactivating server push tokens...');
        
        const deactivatePromise = Meteor.callAsync('notifications.deactivateUserTokens')
          .then(() => {
            console.log('[Logout] Server tokens deactivated');
          })
          .catch((error) => {
            console.warn('[Logout] Server token deactivation failed:', error);
          });
        
        promises.push(deactivatePromise);
        
      } catch (serverError) {
        console.warn('[Logout] Server token deactivation failed:', serverError);
      }
    }

    // 3. Clear local notification manager state
    if (notificationManager) {
      try {
        console.log('[Logout] Clearing local notification state...');
        
        // Clear stored tokens
        if (notificationManager.clearToken) {
          notificationManager.clearToken();
        }
        
        // Reset manager state
        if (notificationManager.reset) {
          notificationManager.reset();
        }
        
        console.log('[Logout] Local notification state cleared');
      } catch (localError) {
        console.warn('[Logout] Local notification cleanup failed:', localError);
      }
    }

    // 4. Wait for all async operations to complete
    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }

    console.log('[Logout] Notification unsubscription completed');
    return true;

  } catch (error) {
    console.error('[Logout] Notification unsubscription failed:', error);
    return false;
  }
};

/**
 * Create the missing server method for deactivating user tokens
 * This should be called from the server-side method
 */
export const createDeactivateTokensMethod = () => {
  // This is a placeholder - the actual method should be created in NotificationMethods.js
  console.log('[Logout] Server method for token deactivation should be implemented');
};
