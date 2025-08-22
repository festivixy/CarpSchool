import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";
import { check } from "meteor/check";

Meteor.methods({
  /**
   * Test email sending (admin only)
   */
  async "email.test"(to) {
    check(to, String);

    // Check admin permissions
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser || !currentUser.roles || !currentUser.roles.includes("admin")) {
      throw new Meteor.Error("access-denied", "Only administrators can test email sending.");
    }

    try {
      await Email.sendAsync({
        to: to,
        from: "CarpSchool Test <no-reply@carp.school>",
        subject: "🚗 CarpSchool Email Test - SUCCESS!",
        html: `
          <h2>🚗 CarpSchool Email Test</h2>
          <p>This is a test email from your CarpSchool application!</p>
          <p><strong>Configuration:</strong> iCloud+ Custom Domain (carp.school)</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Powered by Kangshifu beef ramen 🍜 and coffee ☕
          </p>
        `
      });

      return { success: true, message: `Test email sent to ${to}` };
    } catch (error) {
      console.error("[Email Test] Failed:", error);
      throw new Meteor.Error("email-failed", `Failed to send test email: ${error.message}`);
    }
  },
});
