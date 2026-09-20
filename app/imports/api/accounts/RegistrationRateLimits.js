import { Meteor } from "meteor/meteor";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";

const MINUTE = 60 * 1000;

/*
 * Per-connection limits for methods that are open to anonymous callers. A rule
 * matches on the keys it lists, so `userId: null` / `clientAddress: null` must
 * NOT appear here: a literal null only matched callers whose value was
 * exactly null, which made the old registration rules match nothing.
 */
const PER_CONNECTION = [
  ["accounts.registerStudent", 5, 60 * MINUTE],
  ["schools.checkDomain", 20, MINUTE],
  ["captcha.generate", 20, MINUTE],
  ["report.client.error", 10, MINUTE],
];

/* Per-user limits for the authenticated write paths. */
const PER_USER = [
  ["rides.create", 10, MINUTE],
  ["rides.join", 20, MINUTE],
  ["rides.joinWithCode", 20, MINUTE],
  ["rides.forMySchool", 60, MINUTE],
  ["places.insert", 20, MINUTE],
  ["images.upload", 10, MINUTE],
  ["schoolEmail.sendVerificationCode", 3, 10 * MINUTE],
  ["rideSessions.updateLiveLocation", 30, MINUTE],
  ["rideSessions.verifyPickupCode", 10, MINUTE],
  ["notifications.send", 5, MINUTE],
  ["chats.sendMessage", 60, MINUTE],
  ["chats.createForRide", 10, MINUTE],
];

// Only run on server
if (Meteor.isServer) {
  PER_CONNECTION.forEach(([name, limit, interval]) => {
    DDPRateLimiter.addRule({ type: "method", name, connectionId: () => true }, limit, interval);
  });

  PER_USER.forEach(([name, limit, interval]) => {
    DDPRateLimiter.addRule({ type: "method", name, userId: id => Boolean(id) }, limit, interval);
  });
}
