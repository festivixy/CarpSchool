import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import svgCaptcha from "svg-captcha";
import { Captcha, CAPTCHA_TTL_MS } from "./Captcha";

const MAX_ATTEMPTS = 5;

Meteor.methods({
  async "captcha.generate"() {
    // Generate CAPTCHA
    const captcha = svgCaptcha.create({
      size: 5, // 5 characters
      noise: 2, // noise level
      color: true, // use colors
      background: "#f0f0f0", // background color
      width: 150,
      height: 50,
      fontSize: 40,
    });

    // Generate a unique session ID

    // Store the CAPTCHA text with session ID (expires after 10 minutes) in MongoDB
    const sessionId = await Captcha.insertAsync({
      text: captcha.text,
      timestamp: Date.now(),
      solved: false,
      used: false,
      attempts: 0,
    });

    return {
      sessionId: sessionId,
      svg: captcha.data,
    };
  },

  async "captcha.verify"(sessionId, userInput) {
    check(sessionId, String);
    check(userInput, String);

    // A session that has been spent cannot be re-verified: `used: false` in
    // the selector, so a consumed captcha reads as missing.
    const session = await Captcha.findOneAsync({ _id: sessionId, used: false });

    if (!session) {
      throw new Meteor.Error("invalid-captcha", "CAPTCHA session not found or expired");
    }

    // Check if session is expired
    if (session.timestamp < Date.now() - CAPTCHA_TTL_MS) {
      throw new Meteor.Error("expired-captcha", "CAPTCHA has expired");
    }

    if ((session.attempts || 0) >= MAX_ATTEMPTS) {
      throw new Meteor.Error("too-many-attempts", "Too many attempts. Please request a new CAPTCHA");
    }

    // Verify the CAPTCHA (case-insensitive for better UX)
    const isValid = session.text.toLowerCase() === userInput.trim().toLowerCase();

    if (isValid) {
      // Mark as solved on correct answer
      await Captcha.updateAsync(
        { _id: sessionId, used: false },
        { $set: { solved: true } },
      );
    } else {
      // Count the miss; after MAX_ATTEMPTS the session is spent.
      const attempts = (session.attempts || 0) + 1;
      await Captcha.updateAsync(
        { _id: sessionId },
        { $inc: { attempts: 1 }, ...(attempts >= MAX_ATTEMPTS ? { $set: { used: true } } : {}) },
      );
    }

    return isValid;
  },
});
