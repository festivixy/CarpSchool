import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { RateLimit } from "./RateLimit";

/**
 * Publication rate limiting cache
 * Stores last publication times per user and publication name
 */
const publicationRateCache = new Map();

/**
 * Helper function to check publication rate limiting
 * @param {String} userId - The user ID
 * @param {String} publicationName - Name of the publication
 * @param {Number} limitMs - Rate limit in milliseconds
 * @returns {Boolean} - True if publication is allowed
 */
function checkPublicationRateLimit(userId, publicationName, limitMs) {
  const key = `${userId}:${publicationName}`;
  const now = Date.now();
  const lastCall = publicationRateCache.get(key);

  if (!lastCall || (now - lastCall) >= limitMs) {
    publicationRateCache.set(key, now);
    return true;
  }

  return false;
}

/**
 * Publish user's own rate limit records
 * Rate limited to prevent abuse
 */
Meteor.publish("rateLimit.own", function rateLimitOwn() {
  // Rate limit this publication to 1 call per 5 seconds
  if (!checkPublicationRateLimit(this.userId, "rateLimit.own", 5000)) {
    this.ready();
    return;
  }

  if (!this.userId) {
    this.ready();
    return;
  }

  return RateLimit.find(
    { userId: this.userId },
    {
      fields: {
        name: 1,
        userId: 1,
        limit: 1,
        lastCalled: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    }
  );
});

/**
 * Publish rate limit records for a specific API endpoint (user's own only)
 * Rate limited to prevent abuse
 */
Meteor.publish("rateLimit.byName", function rateLimitByName(name) {
  check(name, String);

  // Rate limit this publication to 1 call per 2 seconds
  if (!checkPublicationRateLimit(this.userId, `rateLimit.byName:${name}`, 2000)) {
    this.ready();
    return;
  }

  if (!this.userId) {
    this.ready();
    return;
  }

  return RateLimit.find(
    { 
      userId: this.userId,
      name: name,
    },
    {
      fields: {
        name: 1,
        userId: 1,
        limit: 1,
        lastCalled: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    }
  );
});

/**
 * Admin publication: all rate limit records
 * Rate limited to prevent abuse, admin only
 */
Meteor.publish("rateLimit.admin", function rateLimitAdmin() {
  // Rate limit this publication to 1 call per 10 seconds
  if (!checkPublicationRateLimit(this.userId, "rateLimit.admin", 10000)) {
    this.ready();
    return;
  }

  if (!this.userId) {
    this.ready();
    return;
  }

  const user = Meteor.users.findOne(this.userId);
  if (!user || !user.isAdmin) {
    this.ready();
    return;
  }

  return RateLimit.find({}, {
    fields: {
      name: 1,
      userId: 1,
      limit: 1,
      lastCalled: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });
});

/**
 * Admin publication: rate limit statistics
 * Rate limited to prevent abuse, admin only
 */
Meteor.publish("rateLimit.stats", function rateLimitStats() {
  // Rate limit this publication to 1 call per 30 seconds
  if (!checkPublicationRateLimit(this.userId, "rateLimit.stats", 30000)) {
    this.ready();
    return;
  }

  if (!this.userId) {
    this.ready();
    return;
  }

  const user = Meteor.users.findOne(this.userId);
  if (!user || !user.isAdmin) {
    this.ready();
    return;
  }

  // Aggregate statistics (this is a simplified version)
  // In a real implementation, you might want to use MongoDB aggregation
  const self = this;
  
  // Count total records
  const totalRecords = RateLimit.find().count();
  
  // Count unique users
  const uniqueUsers = new Set();
  const uniqueEndpoints = new Set();
  
  RateLimit.find({}, { fields: { userId: 1, name: 1 } }).forEach(doc => {
    uniqueUsers.add(doc.userId);
    uniqueEndpoints.add(doc.name);
  });

  // Publish aggregated data as a pseudo-document
  self.added("rateLimitStats", "summary", {
    totalRecords,
    uniqueUsers: uniqueUsers.size,
    uniqueEndpoints: uniqueEndpoints.size,
    lastUpdated: new Date(),
  });

  self.ready();
});

/**
 * Clean up publication rate limiting cache periodically
 */
Meteor.setInterval(() => {
  const cutoff = Date.now() - (60 * 60 * 1000); // 1 hour ago
  for (const [key, timestamp] of publicationRateCache.entries()) {
    if (timestamp < cutoff) {
      publicationRateCache.delete(key);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes
