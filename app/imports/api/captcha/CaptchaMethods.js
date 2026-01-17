import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import svgCaptcha from "svg-captcha";
import { Captcha } from "./Captcha";

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
    });

    // Clean up old sessions (older than 10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    await Captcha.removeAsync({ timestamp: { $lt: tenMinutesAgo } });

    return {
      sessionId: sessionId,
      svg: captcha.data,
    };
  },

  async "captcha.verify"(sessionId, userInput) {
    check(sessionId, String);
    check(userInput, String);
    const session = await Captcha.findOneAsync({ _id: sessionId });

    if (!session) {
      throw new Meteor.Error("invalid-captcha", "CAPTCHA session not found or expired");
    }

    // Check if session is expired (10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    if (session.timestamp < tenMinutesAgo) {
      throw new Meteor.Error("expired-captcha", "CAPTCHA has expired");
    }

    // Verify the CAPTCHA (case-insensitive for better UX)
    const isValid = session.text.toLowerCase() === userInput.trim().toLowerCase();

    if (isValid) {
      // Mark as solved on correct answer
      await Captcha.updateAsync(
        { _id: sessionId },
        { $set: { solved: true } }
      );
    } else {
      // Mark as used on incorrect answer to prevent brute force attacks
      await Captcha.updateAsync(
        { _id: sessionId },
        { $set: { used: true } }
      );
    }

    // Clean up old sessions (older than 10 minutes)
    await Captcha.removeAsync({ timestamp: { $lt: tenMinutesAgo } });

    return isValid;
  },
});
