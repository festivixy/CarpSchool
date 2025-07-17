import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { isCaptchaSolved, useCaptcha } from "../captcha/Captcha";

Meteor.methods({
  async "accounts.email.send.verification"(captchaSessionId) {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-logged-in", "Please login first");
    }

    // Verify captcha
    check(captchaSessionId, String);
    if (!(await isCaptchaSolved(captchaSessionId))) {
      throw new Meteor.Error(
        "captcha-not-solved",
        "Please complete the security verification",
      );
    }

    // Use the captcha (invalidate it)
    await useCaptcha(captchaSessionId);

    const result = await Accounts.sendVerificationEmail(userId);
    return result;
  },
});
