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

// Configure user creation with proper profile structure
Accounts.onCreateUser((options, user) => {
  // Create user with default profile structure
  const newUser = {
    ...user,
    profile: {
      firstName: options.profile?.firstName || "",
      lastName: options.profile?.lastName || "",
      ...options.profile,
    },
    roles: options.roles || [],
  };

  // Send verification email after user is saved to database
  const userEmail = newUser.emails[0].address;
  Meteor.setTimeout(async () => {
    try {
      // Find the newly created user by email to get the proper _id
      const savedUser = await Meteor.users.findOneAsync({ "emails.address": userEmail });
      if (savedUser && process.env.MAIL_URL) {
        Accounts.sendVerificationEmail(savedUser._id);
        console.log(`📧 Verification email sent to ${userEmail}`);
      } else if (!process.env.MAIL_URL) {
        console.warn(`⚠️  MAIL_URL not configured - skipping verification email for ${userEmail}`);
      }
    } catch (error) {
      console.error(`❌ Failed to send verification email to ${userEmail}:`, error.message || error);
    }
  }, 2000); // 2 second delay to ensure user is fully saved to database

  return newUser;
});

// Handle user logout - deactivate push tokens for privacy
Accounts.onLogout((loginHandle) => {
  if (loginHandle.userId) {
    // console.log(`[Logout] User ${loginHandle.userId} logged out, deactivating push tokens...`);

    // Call the NotificationUtils method to deactivate tokens
    NotificationUtils.deactivateUserTokens(loginHandle.userId)
      .then((result) => {
        // console.log(`[Logout] Successfully deactivated ${result.deactivatedTokens} tokens for user ${loginHandle.userId}`);
      })
      .catch((error) => {
        console.error(`[Logout] Failed to deactivate tokens for user ${loginHandle.userId}:`, error);
      });
  }
});
