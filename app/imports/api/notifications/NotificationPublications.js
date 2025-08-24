import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Notifications, PushTokens, NOTIFICATION_STATUS } from "./Notifications";

// Server-side publications
if (Meteor.isServer) {
  /**
   * Publication for user's notifications
   */
  Meteor.publish("notifications", function(limit = 50, offset = 0) {
  check(limit, Number);
  check(offset, Number);

  if (!this.userId) {
    this.ready();
    return;
  }

  // Validate limits to prevent abuse
  const maxLimit = 100;
  const safeLimit = Math.min(limit, maxLimit);

  // console.log(`[Pub] Publishing notifications for user ${this.userId}, limit: ${safeLimit}, offset: ${offset}`);

  return Notifications.find(
    { userId: this.userId },
    {
      sort: { createdAt: -1 },
      limit: safeLimit,
      skip: offset,
      fields: {
        userId: 1,
        title: 1,
        body: 1,
        type: 1,
        priority: 1,
        status: 1,
        data: 1,
        createdAt: 1,
        readAt: 1,
        expiresAt: 1,
        groupKey: 1,
        actionTaken: 1
      }
    }
  );
});

/**
 * Publication for unread notification count
 */
Meteor.publish("notifications.unreadCount", function() {
  if (!this.userId) {
    this.ready();
    return;
  }

  // Use a reactive computation to publish count
  let initializing = true;
  const self = this;

  const handle = Notifications.find(
    {
      userId: this.userId,
      status: { $ne: NOTIFICATION_STATUS.READ }
    }
  ).observeChanges({
    added: function() {
      if (!initializing) {
        self.changed("notificationCounts", self.userId, {
          unreadCount: Notifications.find({
            userId: self.userId,
            status: { $ne: NOTIFICATION_STATUS.READ }
          }).count()
        });
      }
    },
    removed: function() {
      self.changed("notificationCounts", self.userId, {
        unreadCount: Notifications.find({
          userId: self.userId,
          status: { $ne: NOTIFICATION_STATUS.READ }
        }).count()
      });
    },
    changed: function() {
      self.changed("notificationCounts", self.userId, {
        unreadCount: Notifications.find({
          userId: self.userId,
          status: { $ne: NOTIFICATION_STATUS.READ }
        }).count()
      });
    }
  });

  initializing = false;

  // Send initial count
  self.added("notificationCounts", self.userId, {
    unreadCount: Notifications.find({
      userId: self.userId,
      status: { $ne: NOTIFICATION_STATUS.READ }
    }).count()
  });

  self.ready();

  // Clean up observer on stop
  self.onStop(function() {
    handle.stop();
  });
});

/**
 * Publication for recent notifications (last 24 hours)
 */
Meteor.publish("notifications.recent", function() {
  if (!this.userId) {
    this.ready();
    return;
  }

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // console.log(`[Pub] Publishing recent notifications for user ${this.userId}`);

  return Notifications.find(
    {
      userId: this.userId,
      createdAt: { $gte: yesterday }
    },
    {
      sort: { createdAt: -1 },
      limit: 20,
      fields: {
        userId: 1,
        title: 1,
        body: 1,
        type: 1,
        priority: 1,
        status: 1,
        data: 1,
        createdAt: 1,
        readAt: 1
      }
    }
  );
});

/**
 * Publication for ride-specific notifications
 */
Meteor.publish("notifications.forRide", function(rideId) {
  check(rideId, String);

  if (!this.userId) {
    this.ready();
    return;
  }

  // console.log(`[Pub] Publishing ride notifications for user ${this.userId}, ride: ${rideId}`);

  return Notifications.find(
    {
      userId: this.userId,
      "data.rideId": rideId
    },
    {
      sort: { createdAt: -1 },
      limit: 50,
      fields: {
        userId: 1,
        title: 1,
        body: 1,
        type: 1,
        priority: 1,
        status: 1,
        data: 1,
        createdAt: 1,
        readAt: 1
      }
    }
  );
});

/**
 * Publication for user's push tokens (for managing devices)
 */
Meteor.publish("notifications.pushTokens", function() {
  if (!this.userId) {
    this.ready();
    return;
  }

  // console.log(`[Pub] Publishing push tokens for user ${this.userId}`);

  return PushTokens.find(
    {
      userId: this.userId,
      isActive: true
    },
    {
      sort: { lastUsedAt: -1 },
      fields: {
        userId: 1,
        platform: 1,
        deviceInfo: 1,
        isActive: 1,
        lastUsedAt: 1,
        createdAt: 1
      }
    }
  );
});

/**
 * Admin publication for notification management
 */
Meteor.publish("notifications.admin", async function(filters = {}, options = {}) {
  check(filters, Object);
  check(options, Object);

  // Verify admin permissions
  if (!this.userId) {
    this.ready();
    return;
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
  if (!await isSystemAdmin(this.userId) && !await isSchoolAdmin(this.userId)) {
    this.ready();
    return;
  }

  // Default options
  const limit = Math.min(options.limit || 100, 500); // Max 500 for admins
  const skip = options.skip || 0;
  const sort = options.sort || { createdAt: -1 };

  // Build query from filters
  const query = {};

  if (filters.userId) {
    query.userId = filters.userId;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      query.createdAt.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      query.createdAt.$lte = new Date(filters.dateTo);
    }
  }

  // School admins should only see notifications for users in their school
  if (await isSchoolAdmin(this.userId) && !await isSystemAdmin(this.userId)) {
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (currentUser?.schoolId) {
      // Find users in the same school
      const schoolUsers = await Meteor.users.find(
        { schoolId: currentUser.schoolId },
        { fields: { _id: 1 } }
      ).fetchAsync();
      const userIds = schoolUsers.map(user => user._id);
      
      if (query.userId) {
        // If filtering by specific user, make sure that user is in the same school
        if (!userIds.includes(query.userId)) {
          this.ready();
          return;
        }
      } else {
        // Filter to only users in the same school
        query.userId = { $in: userIds };
      }
    }
  }

  // console.log(`[Pub] Admin notifications query:`, query, { limit, skip, sort });

  return Notifications.find(query, {
    sort,
    limit,
    skip
  });
});

/**
 * Admin publication for push tokens management
 */
Meteor.publish("notifications.adminTokens", async function(filters = {}) {
  check(filters, Object);

  // Verify admin permissions
  if (!this.userId) {
    this.ready();
    return;
  }

  const { isSystemAdmin, isSchoolAdmin } = await import("../accounts/RoleUtils");
  if (!await isSystemAdmin(this.userId) && !await isSchoolAdmin(this.userId)) {
    this.ready();
    return;
  }

  // Build query from filters
  const query = {};

  if (filters.userId) {
    query.userId = filters.userId;
  }

  if (filters.platform) {
    query.platform = filters.platform;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  // School admins should only see tokens for users in their school
  if (await isSchoolAdmin(this.userId) && !await isSystemAdmin(this.userId)) {
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (currentUser?.schoolId) {
      // Find users in the same school
      const schoolUsers = await Meteor.users.find(
        { schoolId: currentUser.schoolId },
        { fields: { _id: 1 } }
      ).fetchAsync();
      const userIds = schoolUsers.map(user => user._id);
      
      if (query.userId) {
        // If filtering by specific user, make sure that user is in the same school
        if (!userIds.includes(query.userId)) {
          this.ready();
          return;
        }
      } else {
        // Filter to only users in the same school
        query.userId = { $in: userIds };
      }
    }
  }

  // console.log(`[Pub] Admin push tokens query:`, query);

  return PushTokens.find(query, {
    sort: { lastUsedAt: -1 },
    limit: 1000
  });
});

} // End server-only block

// Collection for reactive notification counts (client-side only)
if (Meteor.isClient) {
  export const NotificationCounts = new Mongo.Collection("notificationCounts");
}
