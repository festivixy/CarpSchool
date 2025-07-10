import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import svgCaptcha from 'svg-captcha';

// Store CAPTCHA sessions in memory (in production, you might want to use Redis or MongoDB)
const captchaSessions = new Map();

Meteor.methods({
  'captcha.generate'() {
    // Generate CAPTCHA
    const captcha = svgCaptcha.create({
      size: 5, // 5 characters
      noise: 2, // noise level
      color: true, // use colors
      background: '#f0f0f0', // background color
      width: 150,
      height: 50,
      fontSize: 40,
    });

    // Generate a unique session ID
    const sessionId = Random.id();

    // Store the CAPTCHA text with session ID (expires after 10 minutes)
    captchaSessions.set(sessionId, {
      text: captcha.text.toLowerCase(),
      timestamp: Date.now(),
    });

    // Clean up old sessions (older than 10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    for (const [id, session] of captchaSessions.entries()) {
      if (session.timestamp < tenMinutesAgo) {
        captchaSessions.delete(id);
      }
    }

    return {
      sessionId: sessionId,
      svg: captcha.data,
    };
  },

  'captcha.verify'(sessionId, userInput) {
    check(sessionId, String);
    check(userInput, String);

    const session = captchaSessions.get(sessionId);

    if (!session) {
      throw new Meteor.Error('invalid-captcha', 'CAPTCHA session not found or expired');
    }

    // Check if session is expired (10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    if (session.timestamp < tenMinutesAgo) {
      captchaSessions.delete(sessionId);
      throw new Meteor.Error('expired-captcha', 'CAPTCHA has expired');
    }

    // Verify the CAPTCHA
    const isValid = session.text === userInput.toLowerCase().trim();

    // Remove the session after verification attempt
    captchaSessions.delete(sessionId);

    return isValid;
  },
});
