import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Schools } from "./Schools";
import { isSchoolAdmin, isSystemAdmin } from "../accounts/RoleUtils";

Meteor.methods({
  /**
   * Update school SMTP settings (school admins only)
   */
  async "schools.updateSmtpSettings"(schoolId, smtpSettings) {
    check(schoolId, String);
    check(smtpSettings, {
      email: Match.Optional(String),
      password: Match.Optional(String),
      host: Match.Optional(String),
      port: Match.Optional(Number),
      secure: Match.Optional(Boolean),
      enabled: Match.Optional(Boolean),
    });

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to update school settings.");
    }

    // Check if user is admin of this school or system admin
    const isSchoolAdminUser = await isSchoolAdmin(this.userId, schoolId);
    const isSystemAdminUser = await isSystemAdmin(this.userId);

    if (!isSchoolAdminUser && !isSystemAdminUser) {
      throw new Meteor.Error("access-denied", "You don't have permission to update this school's settings.");
    }

    // Validate school exists
    const school = await Schools.findOneAsync(schoolId);
    if (!school) {
      throw new Meteor.Error("school-not-found", "School not found.");
    }

    // Validate SMTP settings if being enabled
    if (smtpSettings.enabled) {
      if (!smtpSettings.email || !smtpSettings.password || !smtpSettings.host) {
        throw new Meteor.Error("invalid-smtp", "Email, password, and SMTP host are required when enabling email verification.");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(smtpSettings.email)) {
        throw new Meteor.Error("invalid-email", "Please enter a valid email address.");
      }

      // Validate port
      if (smtpSettings.port && (smtpSettings.port < 1 || smtpSettings.port > 65535)) {
        throw new Meteor.Error("invalid-port", "Port must be between 1 and 65535.");
      }
    }

    // Prepare update object
    const updateObject = {};
    if (smtpSettings.email !== undefined) updateObject["smtpSettings.email"] = smtpSettings.email;
    if (smtpSettings.password !== undefined) updateObject["smtpSettings.password"] = smtpSettings.password;
    if (smtpSettings.host !== undefined) updateObject["smtpSettings.host"] = smtpSettings.host;
    if (smtpSettings.port !== undefined) updateObject["smtpSettings.port"] = smtpSettings.port;
    if (smtpSettings.secure !== undefined) updateObject["smtpSettings.secure"] = smtpSettings.secure;
    if (smtpSettings.enabled !== undefined) updateObject["smtpSettings.enabled"] = smtpSettings.enabled;

    // Update school
    await Schools.updateAsync(schoolId, {
      $set: updateObject
    });

    return {
      success: true,
      message: "SMTP settings updated successfully.",
    };
  },

  /**
   * Get school SMTP settings (admins only)
   */
  async "schools.getSmtpSettings"(schoolId) {
    check(schoolId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to view school settings.");
    }

    // Check if user is admin of this school or system admin
    const isSchoolAdminUser = await isSchoolAdmin(this.userId, schoolId);
    const isSystemAdminUser = await isSystemAdmin(this.userId);

    if (!isSchoolAdminUser && !isSystemAdminUser) {
      throw new Meteor.Error("access-denied", "You don't have permission to view this school's settings.");
    }

    const school = await Schools.findOneAsync(schoolId);
    if (!school) {
      throw new Meteor.Error("school-not-found", "School not found.");
    }

    // Return SMTP settings but mask the password
    const smtpSettings = school.smtpSettings || {};
    return {
      ...smtpSettings,
      password: smtpSettings.password ? "••••••••" : "",
    };
  },

  /**
   * Test SMTP connection (admins only)
   */
  async "schools.testSmtpConnection"(schoolId) {
    check(schoolId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to test SMTP connection.");
    }

    // Check if user is admin of this school or system admin
    const isSchoolAdminUser = await isSchoolAdmin(this.userId, schoolId);
    const isSystemAdminUser = await isSystemAdmin(this.userId);

    if (!isSchoolAdminUser && !isSystemAdminUser) {
      throw new Meteor.Error("access-denied", "You don't have permission to test this school's SMTP settings.");
    }

    const school = await Schools.findOneAsync(schoolId);
    if (!school || !school.smtpSettings) {
      throw new Meteor.Error("smtp-not-configured", "SMTP settings not configured for this school.");
    }

    try {
      const { Email } = await import("meteor/email");
      const smtpSettings = school.smtpSettings;

      // Configure SMTP for this test
      const oldMailUrl = process.env.MAIL_URL;
      process.env.MAIL_URL = `smtp://${encodeURIComponent(smtpSettings.email)}:${encodeURIComponent(smtpSettings.password)}@${smtpSettings.host}:${smtpSettings.port}`;

      // Send test email
      await Email.sendAsync({
        to: smtpSettings.email,
        from: `${school.schoolName} <${smtpSettings.email}>`,
        subject: "SMTP Test - Carp School",
        text: `This is a test email to verify SMTP configuration for ${school.schoolName}.\n\nIf you receive this email, your SMTP settings are working correctly.`,
      });

      // Restore original MAIL_URL
      if (oldMailUrl) {
        process.env.MAIL_URL = oldMailUrl;
      }

      return {
        success: true,
        message: "Test email sent successfully! Check your inbox.",
      };

    } catch (error) {
      console.error("SMTP test failed:", error);
      throw new Meteor.Error("smtp-test-failed", `SMTP test failed: ${error.message}`);
    }
  },
});
