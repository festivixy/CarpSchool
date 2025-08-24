import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { RateLimit } from "./RateLimit";
import { isSystemAdmin, isSchoolAdmin } from "../accounts/RoleUtils";

Meteor.methods({
  /**
   * Check if a user can make an API call based on rate limiting
   * @param {String} name - The name/identifier of the API endpoint or action
   * @param {Number} limitMs - The rate limit in milliseconds between calls
   * @returns {Boolean} - True if the call is allowed, false if rate limited
   */
  async "rateLimit.checkCall"(name, limitMs) {
    check(name, String);
    check(limitMs, Number);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to check rate limits");
    }

    const now = new Date();
    const userId = this.userId;

    // Find existing rate limit record for this user and API endpoint
    const existingRecord = await RateLimit.findOneAsync({
      name,
      userId,
    });

    if (!existingRecord) {
      // No previous record, create one and allow the call
      await RateLimit.insertAsync({
        name,
        userId,
        limit: limitMs,
        lastCalled: now,
        createdAt: now,
        updatedAt: now,
      });
      return true;
    }

    // Check if enough time has passed since the last call
    const timeSinceLastCall = now.getTime() - existingRecord.lastCalled.getTime();

    if (timeSinceLastCall >= limitMs) {
      // Enough time has passed, update the record and allow the call
      await RateLimit.updateAsync(existingRecord._id, {
        $set: {
          lastCalled: now,
          updatedAt: now,
          limit: limitMs, // Update limit in case it changed
        },
      });
      return true;
    }

    // Rate limit exceeded, return false
    return false;
  },

  /**
   * Record an API call for rate limiting purposes
   * @param {String} name - The name/identifier of the API endpoint or action
   * @param {Number} limitMs - The rate limit in milliseconds between calls
   */
  async "rateLimit.recordCall"(name, limitMs) {
    check(name, String);
    check(limitMs, Number);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to record API calls");
    }

    const now = new Date();
    const userId = this.userId;

    // Find existing rate limit record
    const existingRecord = await RateLimit.findOneAsync({
      name,
      userId,
    });

    if (existingRecord) {
      // Update existing record
      await RateLimit.updateAsync(existingRecord._id, {
        $set: {
          lastCalled: now,
          updatedAt: now,
          limit: limitMs,
        },
      });
    } else {
      // Create new record
      await RateLimit.insertAsync({
        name,
        userId,
        limit: limitMs,
        lastCalled: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },

  /**
   * Get rate limit status for a specific API endpoint
   * @param {String} name - The name/identifier of the API endpoint or action
   * @returns {Object|null} - Rate limit record or null if none exists
   */
  async "rateLimit.getStatus"(name) {
    check(name, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to check rate limit status");
    }

    const record = await RateLimit.findOneAsync({
      name,
      userId: this.userId,
    });

    if (!record) {
      return null;
    }

    const now = new Date();
    const timeSinceLastCall = now.getTime() - record.lastCalled.getTime();
    const timeUntilNextAllowed = Math.max(0, record.limit - timeSinceLastCall);

    return {
      name: record.name,
      limit: record.limit,
      lastCalled: record.lastCalled,
      timeSinceLastCall,
      timeUntilNextAllowed,
      canMakeCall: timeUntilNextAllowed === 0,
    };
  },

  /**
   * Clean up old rate limit records (for maintenance)
   * @param {Number} olderThanDays - Remove records older than this many days
   */
  async "rateLimit.cleanup"(olderThanDays = 30) {
    check(olderThanDays, Number);

    // Only allow system or school admins to run cleanup
    if (!this.userId || (!await isSystemAdmin(this.userId) && !await isSchoolAdmin(this.userId))) {
      throw new Meteor.Error("not-authorized", "Only admins can run rate limit cleanup");
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await RateLimit.removeAsync({
      updatedAt: { $lt: cutoffDate },
    });

    return { removedCount: result };
  },
});
