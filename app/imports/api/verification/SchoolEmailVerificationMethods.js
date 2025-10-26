import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { SchoolEmailVerifications } from "./SchoolEmailVerification";
import { Profiles } from "../profile/Profile";
import { Schools } from "../schools/Schools";
import { Random } from "meteor/random";
import { Email } from "meteor/email";

Meteor.methods({
  /**
   * Send verification code to school email
   */
  async "schoolEmail.sendVerificationCode"(email, captchaInput, captchaSessionId) {
    check(email, String);
    check(captchaInput, String);
    check(captchaSessionId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to verify school email.");
    }

    // Validate CAPTCHA first
    const { validateCaptcha } = await import("../captcha/CaptchaMethods");
    const isCaptchaValid = await validateCaptcha(captchaInput, captchaSessionId);
    if (!isCaptchaValid) {
      throw new Meteor.Error("invalid-captcha", "Invalid security code. Please try again.");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Meteor.Error("invalid-email", "Please enter a valid email address.");
    }

    const userId = this.userId;

    // Get user's profile
    const userProfile = await Profiles.findOneAsync({ Owner: userId });
    if (!userProfile) {
      throw new Meteor.Error("no-profile", "User profile not found. Please complete your profile first.");
    }

    // Only riders can verify school email
    if (userProfile.UserType !== "Rider") {
      throw new Meteor.Error("invalid-user-type", "Only riders can verify school email addresses.");
    }

    // Get user's school
    const user = await Meteor.users.findOneAsync(userId);
    if (!user || !user.schoolId) {
      throw new Meteor.Error("no-school", "User is not associated with a school.");
    }

    const school = await Schools.findOneAsync(user.schoolId);
    if (!school) {
      throw new Meteor.Error("school-not-found", "School not found.");
    }

    // Check if school has SMTP settings configured
    if (!school.smtpSettings || !school.smtpSettings.enabled) {
      throw new Meteor.Error("smtp-not-configured", "School email verification is not available. Contact your school administrator.");
    }

    // Check if email is already used by another user
    const existingUser = await Meteor.users.findOneAsync({
      "emails.address": email.toLowerCase(),
      _id: { $ne: userId }
    });

    if (existingUser) {
      throw new Meteor.Error("email-exists", "This email address is already registered to another account.");
    }

    // Check if email is already verified by another user
    const existingProfile = await Profiles.findOneAsync({
      schoolemail: email.toLowerCase(),
      Owner: { $ne: userId }
    });

    if (existingProfile) {
      throw new Meteor.Error("email-exists", "This school email is already verified by another user.");
    }

    // Generate 6-digit verification code
    const verificationCode = Random.choice("0123456789".split("")).repeat(6).split("").map(() => Random.choice("0123456789".split(""))).join("");

    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Remove any existing verification attempts for this user
    await SchoolEmailVerifications.removeAsync({ userId });

    // Create new verification record
    await SchoolEmailVerifications.insertAsync({
      userId,
      email: email.toLowerCase(),
      schoolId: user.schoolId,
      verificationCode,
      attempts: 0,
      maxAttempts: 5,
      verified: false,
      expiresAt,
      createdAt: new Date(),
    });

    // Send verification email using school's SMTP settings
    try {
      await sendSchoolVerificationEmail(school, email, verificationCode, userProfile.Name);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Remove the verification record if email fails
      await SchoolEmailVerifications.removeAsync({ userId });
      throw new Meteor.Error("email-send-failed", "Failed to send verification email. Please try again later.");
    }

    return {
      success: true,
      message: "Verification code sent to your school email address.",
      expiresAt,
    };
  },

  /**
   * Verify the 6-digit code and complete school email verification
   */
  async "schoolEmail.verifyCode"(verificationCode) {
    check(verificationCode, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to verify the code.");
    }

    const userId = this.userId;

    // Find verification record
    const verification = await SchoolEmailVerifications.findOneAsync({
      userId,
      verified: false
    });

    if (!verification) {
      throw new Meteor.Error("no-verification", "No pending verification found. Please request a new code.");
    }

    // Check if code has expired
    if (new Date() > verification.expiresAt) {
      await SchoolEmailVerifications.removeAsync({ userId });
      throw new Meteor.Error("code-expired", "Verification code has expired. Please request a new code.");
    }

    // Check attempts
    if (verification.attempts >= verification.maxAttempts) {
      await SchoolEmailVerifications.removeAsync({ userId });
      throw new Meteor.Error("max-attempts", "Maximum verification attempts exceeded. Please request a new code.");
    }

    // Increment attempts
    await SchoolEmailVerifications.updateAsync(verification._id, {
      $inc: { attempts: 1 }
    });

    // Check if code matches
    if (verification.verificationCode !== verificationCode.trim()) {
      const attemptsLeft = verification.maxAttempts - (verification.attempts + 1);
      if (attemptsLeft <= 0) {
        await SchoolEmailVerifications.removeAsync({ userId });
        throw new Meteor.Error("invalid-code", "Invalid verification code. Maximum attempts exceeded.");
      }
      throw new Meteor.Error("invalid-code", `Invalid verification code. ${attemptsLeft} attempts remaining.`);
    }

    // Code is correct - update profile
    await Profiles.updateAsync(
      { Owner: userId },
      {
        $set: {
          verified: true,
          requested: true,
          schoolemail: verification.email
        }
      }
    );

    // Mark verification as completed
    await SchoolEmailVerifications.updateAsync(verification._id, {
      $set: {
        verified: true,
        verifiedAt: new Date()
      }
    });

    return {
      success: true,
      message: "School email verified successfully! You now have access to all rider features.",
      email: verification.email,
    };
  },

  /**
   * Get verification status for current user
   */
  async "schoolEmail.getVerificationStatus"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in.");
    }

    const verification = await SchoolEmailVerifications.findOneAsync({
      userId: this.userId,
      verified: false
    });

    if (!verification) {
      return { hasPending: false };
    }

    const isExpired = new Date() > verification.expiresAt;
    if (isExpired) {
      await SchoolEmailVerifications.removeAsync({ userId: this.userId });
      return { hasPending: false };
    }

    return {
      hasPending: true,
      email: verification.email,
      attempts: verification.attempts,
      maxAttempts: verification.maxAttempts,
      expiresAt: verification.expiresAt,
    };
  },
});

/**
 * Send verification email using school's SMTP settings
 */
async function sendSchoolVerificationEmail(school, email, verificationCode, userName) {
  const smtpSettings = school.smtpSettings;

  // Configure SMTP for this email
  process.env.MAIL_URL = `smtp://${encodeURIComponent(smtpSettings.email)}:${encodeURIComponent(smtpSettings.password)}@${smtpSettings.host}:${smtpSettings.port}`;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0; font-size: 28px;">🚗 ${school.schoolName}</h1>
          <h2 style="color: #666; margin: 10px 0 0 0; font-size: 18px;">School Email Verification</h2>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">
            Hi ${userName},
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">
            You have requested to verify your school email address for rider access on Carp School.
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 25px 0;">
            Please enter the following verification code in the app:
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f0f8ff; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; display: inline-block;">
            <div style="font-size: 32px; font-weight: bold; color: #2E7D32; letter-spacing: 8px; font-family: monospace;">
              ${verificationCode}
            </div>
          </div>
        </div>

        <div style="margin: 30px 0; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <p style="color: #856404; font-size: 14px; margin: 0; text-align: center;">
            ⏰ This code will expire in 15 minutes
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px; line-height: 1.4; margin: 0;">
            If you didn't request this verification, please ignore this email. This verification code will expire automatically.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Carp School - Rideshare Platform
          </p>
        </div>
      </div>
    </div>
  `;

  await Email.sendAsync({
    to: email,
    from: `${school.schoolName} <${smtpSettings.email}>`,
    subject: `${school.schoolName} - Email Verification Code: ${verificationCode}`,
    html: emailTemplate,
  });
}
