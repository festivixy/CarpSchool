import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Notifications, PushTokens, NOTIFICATION_STATUS } from "./Notifications";

// Fields a notification's recipient (or an admin listing) may see. Delivery
// internals - device tokens, push payloads, backend error strings - stay
// server-side.
const DISPLAY_FIELDS = {
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
  actionTaken: 1,
};

const ADMIN_SORT_KEYS = new Set(["createdAt", "status", "type", "priority", "userId", "sentAt", "readAt"]);

/**
 * Turn a client-supplied sort object into one that only touches known,
 * indexed fields. Falls back to newest-first.
 */
function safeSort(requested) {
  const sort = {};
  Object.entries(requested || {}).forEach(([key, direction]) => {
    if (ADMIN_SORT_KEYS.has(key)) {
      sort[key] = (direction === 1 || direction === "asc") ? 1 : -1;
    }
  });
  return Object.keys(sort).length > 0 ? sort : { createdAt: -1 };
}

/**
 * Ids of every user in the schools the caller administers, or null for a
 * system admin (no scoping). Returns [] for non-admins.
 */
async function adminScopedUserIds(callerId) {
  const { isSystemAdmin, getUserAdminSchools } = await import("../accounts/RoleUtils");
  if (await isSystemAdmin(callerId)) {
    return null;
  }
  const schoolIds = await getUserAdminSchools(callerId);
  if (schoolIds.length === 0) {
    return [];
  }
  const users = await Meteor.users.find(
    { schoolId: { $in: schoolIds } },
    { fields: { _id: 1 } },
  ).fetchAsync();
  return users.map(user => user._id);
}

/**
 * Publication for user's notifications
 */
Meteor.publish("notifications", function (limit = 50, offset = 0) {
  check(limit, Number);
  check(offset, Number);

  if (!this.userId) {
    this.ready();
    return;
  }

  // Validate limits to prevent abuse
  const maxLimit = 100;
  const safeLimit = Math.min(limit, maxLimit);

  return Notifications.find(
    { userId: this.userId },
    {
      sort: { createdAt: -1 },
      limit: safeLimit,
      skip: offset,
      fields: DISPLAY_FIELDS,
    },
  );
});

/**
 * Publication for unread notification count
 */
/*
 * Meteor 3 notes for this handler:
 * - a server cursor's count() does not return a promise, it throws outright
 *   ("count() is not available on the server"), so every count() here aborted
 *   the publication
 * - observeChanges() resolves to a promise on the server, so the old `handle`
 *   was a Promise and handle.stop() in onStop threw
 */
Meteor.publish("notifications.unreadCount", async function () {
  if (!this.userId) {
    this.ready();
    return;
  }

  const self = this;
  const selector = {
    userId: self.userId,
    status: { $ne: NOTIFICATION_STATUS.READ },
  };

  // Suppress observe callbacks until the initial `added` has been sent, so we
  // never emit `changed` for a document the client does not have yet.
  let started = false;

  const publishCount = async () => {
    if (!started) return;
    self.changed("notificationCounts", self.userId, {
      unreadCount: await Notifications.find(selector).countAsync(),
    });
  };

  // observeChanges callbacks are synchronous, so publishCount() is fired and
  // forgotten - it needs an explicit catch or a failed recount (or a changed()
  // on an already-torn-down session) surfaces as an unhandled rejection.
  const onChange = () => {
    publishCount().catch(error => {
      console.error("[Pub] notifications.unreadCount update failed:", error);
    });
  };

  const handle = await Notifications.find(selector).observeChanges({
    added: onChange,
    removed: onChange,
    changed: onChange,
  });

  // Send initial count
  self.added("notificationCounts", self.userId, {
    unreadCount: await Notifications.find(selector).countAsync(),
  });

  started = true;
  self.ready();

  // Clean up observer on stop
  self.onStop(() => {
    handle.stop();
  });
});

/**
 * Publication for recent notifications (last 24 hours)
 */
Meteor.publish("notifications.recent", function () {
  if (!this.userId) {
    this.ready();
    return;
  }

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return Notifications.find(
    {
      userId: this.userId,
      createdAt: { $gte: yesterday },
    },
    {
      sort: { createdAt: -1 },
      limit: 20,
      fields: DISPLAY_FIELDS,
    },
  );
});

/**
 * Publication for ride-specific notifications
 */
Meteor.publish("notifications.forRide", function (rideId) {
  check(rideId, String);

  if (!this.userId) {
    this.ready();
    return;
  }

  return Notifications.find(
    {
      userId: this.userId,
      "data.rideId": rideId,
    },
    {
      sort: { createdAt: -1 },
      limit: 50,
      fields: DISPLAY_FIELDS,
    },
  );
});

/**
 * Publication for user's push tokens (for managing devices)
 */
Meteor.publish("notifications.pushTokens", function () {
  if (!this.userId) {
    this.ready();
    return;
  }

  return PushTokens.find(
    {
      userId: this.userId,
      isActive: true,
    },
    {
      sort: { lastUsedAt: -1 },
      fields: {
        userId: 1,
        platform: 1,
        deviceInfo: 1,
        isActive: 1,
        lastUsedAt: 1,
        createdAt: 1,
      },
    },
  );
});

/**
 * Admin publication for notification management. School admins only see
 * notifications addressed to users of the schools they administer.
 */
Meteor.publish("notifications.admin", async function (filters = {}, options = {}) {
  check(filters, Object);
  check(options, Object);

  if (!this.userId) {
    this.ready();
    return;
  }

  const scopedUserIds = await adminScopedUserIds(this.userId);
  if (scopedUserIds && scopedUserIds.length === 0) {
    this.ready();
    return;
  }

  // Default options
  const limit = Math.min(options.limit || 100, 500); // Max 500 for admins
  const skip = Math.max(0, options.skip || 0);
  const sort = safeSort(options.sort);

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

  if (scopedUserIds) {
    if (query.userId) {
      // If filtering by specific user, make sure that user is in scope
      if (!scopedUserIds.includes(query.userId)) {
        this.ready();
        return;
      }
    } else {
      query.userId = { $in: scopedUserIds };
    }
  }

  return Notifications.find(query, {
    sort,
    limit,
    skip,
    fields: DISPLAY_FIELDS,
  });
});

/**
 * Admin publication for push tokens management. System admins only; the raw
 * token/player id is never published.
 */
Meteor.publish("notifications.adminTokens", async function (filters = {}) {
  check(filters, Object);

  if (!this.userId) {
    this.ready();
    return;
  }

  const { isSystemAdmin } = await import("../accounts/RoleUtils");
  if (!await isSystemAdmin(this.userId)) {
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

  return PushTokens.find(query, {
    sort: { lastUsedAt: -1 },
    limit: 1000,
    fields: {
      userId: 1,
      platform: 1,
      deviceInfo: 1,
      isActive: 1,
      lastUsedAt: 1,
      createdAt: 1,
      deactivatedAt: 1,
      deactivationReason: 1,
    },
  });
});
