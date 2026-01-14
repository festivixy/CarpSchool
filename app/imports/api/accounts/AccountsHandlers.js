import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { isCaptchaSolved, useCaptcha } from "../captcha/Captcha";
import { NotificationUtils } from "../notifications/NotificationMethods";

/* eslint-disable no-console */

Accounts.validateLoginAttempt(async (attempt) => {
  if (!attempt.allowed) {
    return false;
  }
  if (attempt.type === "password") {
    if (attempt.meathodName !== "verifyEmail") {
      return attempt.allowed;
    }
    const captchaSessionId =
      attempt.methodArguments[0].password.captchaSessionId;
    if (captchaSessionId === undefined) {
      throw new Meteor.Error(400, "Match failed");
    }
    check(captchaSessionId, String);
    const captchaSolved = await isCaptchaSolved(captchaSessionId);
    if (!captchaSolved) {
      throw new Meteor.Error("invalid-captcha", "CAPTCHA not solved");
    }
    await useCaptcha(captchaSessionId);
    return true;
  }
  return true;
});

Accounts.validateNewUser(async (user) => {
  // Validate captcha for new user registration
  const captchaSessionId = user.captchaSessionId || user.profile?.captchaSessionId;

  // Allow API bypass for programmatic registration
  if (captchaSessionId === "API_BYPASS") {
    console.log("API: Bypassing CAPTCHA validation for API registration");
    delete user.captchaSessionId;  // eslint-disable-line
    return true;
  }

  if (captchaSessionId === undefined) {
    throw new Meteor.Error(
      "captcha-required",
      "CAPTCHA session ID required for registration",
    );
  }
  check(captchaSessionId, String);
  const captchaSolved = await isCaptchaSolved(captchaSessionId);
  if (!captchaSolved) {
    throw new Meteor.Error("invalid-captcha", "CAPTCHA not solved");
  }
  await useCaptcha(captchaSessionId);

  // Remove captchaSessionId from user object before storing
  delete user.captchaSessionId;  // eslint-disable-line
  return true;
});

// NOTE: onCreateUser moved to AccountsSchoolHandlers.js to include school assignment
// This avoids "Can only call onCreateUser once" error

// Handle user logout - deactivate push tokens for privacy
Accounts.onLogout((loginHandle) => {
  if (loginHandle.userId) {
    // console.log(`[Logout] User ${loginHandle.userId} logged out, deactivating push tokens...`);

    // Call the NotificationUtils method to deactivate tokens
    NotificationUtils.deactivateUserTokens(loginHandle.userId)
      .then((_result) => {
        // console.log(
        //   `[Logout] Successfully deactivated ${result.deactivatedTokens} tokens for user ${loginHandle.userId}`
        // );
      })
      .catch((error) => {
        console.error(`[Logout] Failed to deactivate tokens for user ${loginHandle.userId}:`, error);
      });
  }
});
