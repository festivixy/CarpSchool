/* eslint-disable consistent-return */
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { RateLimit } from "./RateLimit";

/**
 * Publication rate limiting cache
 * Stores last publication times per user and publication name
 * Synced to MongoDB every minute for persistence
 */
const publicationRateCache = new Map();

/**
 * Track call counts for analytics
 * Format: "userId:publicationName" -> { count, firstCall }
 */
const publicationCallCounts = new Map();

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

    // Track call counts for analytics
    const countKey = key;
    const countData = publicationCallCounts.get(countKey) || { count: 0, firstCall: now };
    countData.count++;
    publicationCallCounts.set(countKey, countData);

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
    },
  );
});

/**
 * Publish rate limit records for a specific API endpoint (user's own only)
 * Rate limited to prevent abuse
 */
Meteor.publish("rateLimit.byName", function rateLimitByName(name) { // eslint-disable-line consistent-return
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
    },
  );
});

/**
 * Admin publication: all rate limit records
 * Rate limited to prevent abuse, admin only
 */
Meteor.publish("rateLimit.admin", function rateLimitAdmin() { // eslint-disable-line consistent-return
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
 * Sync publication rate cache to MongoDB
 * Runs every minute for persistence and analytics
 */
async function syncPublicationCacheToMongoDB() {
  try {
    const batch = [];
    const now = new Date();

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, timestamp] of publicationRateCache.entries()) {
      const [userId, publicationName] = key.split(":", 2);

      if (!userId || !publicationName) {
        continue; // eslint-disable-line no-continue
      }

      const countData = publicationCallCounts.get(key) || { count: 1, firstCall: timestamp };

      batch.push({
        updateOne: {
          filter: {
            userId,
            name: `publication:${publicationName}`,
          },
          update: {
            $set: {
              lastCalled: new Date(timestamp),
              updatedAt: now,
              limit: 0, // Publications don't have explicit limits like methods
            },
            $inc: {
              callCount: countData.count,
            },
            $setOnInsert: {
              createdAt: now,
              firstCall: new Date(countData.firstCall),
            },
          },
          upsert: true,
        },
      });
    }

    if (batch.length > 0) {
      await RateLimit.bulkWrite(batch);
      console.log(`Synced ${batch.length} publication rate limit records to MongoDB`);
    }

    // Clear call counts after sync
    publicationCallCounts.clear();

  } catch (error) {
    console.error("Error syncing publication cache to MongoDB:", error);
  }
}

/**
 * Load publication rate cache from MongoDB on startup
 * Restores recent publication data after server restart
 */
async function loadPublicationCacheFromMongoDB() {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentRecords = await RateLimit.find({
      name: { $regex: /^publication:/ },
      lastCalled: { $gte: oneHourAgo },
    }).fetchAsync();

    // eslint-disable-next-line no-restricted-syntax
    for (const record of recentRecords) {
      const publicationName = record.name.replace(/^publication:/, "");
      const key = `${record.userId}:${publicationName}`;
      publicationRateCache.set(key, record.lastCalled.getTime());
    }

  } catch (error) {
    console.error("Error loading publication cache from MongoDB:", error);
  }
}

/**
 * Clean up publication rate limiting cache periodically
 * Also handles MongoDB sync
 */
Meteor.setInterval(() => {
  const cutoff = Date.now() - (60 * 60 * 1000); // 1 hour ago

  // Clean up old cache entries
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, timestamp] of publicationRateCache.entries()) {
    if (timestamp < cutoff) {
      publicationRateCache.delete(key);
    }
  }

  // Clean up old call count entries
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, data] of publicationCallCounts.entries()) {
    if (data.firstCall < cutoff) {
      publicationCallCounts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

/**
 * Sync publication cache to MongoDB every minute
 */
Meteor.setInterval(async () => {
  await syncPublicationCacheToMongoDB();
}, 60 * 1000); // Run every minute

/**
 * Load publication cache from MongoDB on server startup
 */
Meteor.startup(async () => {
  await loadPublicationCacheFromMongoDB();
});
