import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { NotificationUtils } from "../notifications/NotificationMethods";

/* eslint-disable no-console */

// Meteor account validation handlers for Clerk integration
// Clerk handles login/signup, these handlers are minimal since
// we only use Meteor for data storage, not authentication

// Validate new user - this will be called when creating Meteor user linked to Clerk
Accounts.validateNewUser(async (user) => {
  // For Clerk users, we allow bypassing validation
  // Clerk already handles all validation
  const isClerkUser = user.profile?.clerkUserId;
  if (isClerkUser) {
    return true;
  }

  // For API/programmatic users, allow
  if (user.captchaSessionId === "API_BYPASS") {
    console.log("API: Bypassing validation for API registration");
    delete user.captchaSessionId;
    return true;
  }

  return true;
});

// Note: onCreateUser is now handled in ClerkMethods.js for Clerk users
// Standard Meteor users can still use AccountsSchoolHandlers.js if needed

// Handle user logout - deactivate push tokens for privacy
// This runs when Meteor.logout() is called
// Note: Clerk's signOut() doesn't trigger this, so we handle it separately in Signout component
Accounts.onLogout((loginHandle) => {
  if (loginHandle.userId) {
    NotificationUtils.deactivateUserTokens(loginHandle.userId)
      .then((_result) => {
        // Successfully deactivated tokens
      })
      .catch((error) => {
        console.error(`[Logout] Failed to deactivate tokens for user ${loginHandle.userId}:`, error);
      });
  }
});
