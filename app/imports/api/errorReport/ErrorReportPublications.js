import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { ErrorReports } from "./ErrorReport";

/**
 * Publish error reports for admin users only
 */
Meteor.publish("errorReports", async function publishErrorReports(limit = 50, skip = 0) {
  check(limit, Number);
  check(skip, Number);

  // Check if user is admin
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser || !currentUser.roles || !currentUser.roles.includes("admin")) {
    return this.ready();
  }

  // Limit the number of results to prevent performance issues
  const safeLimit = Math.min(limit, 100);
  const safeSkip = Math.max(skip, 0);

  return ErrorReports.find({}, {
    sort: { timestamp: -1 }, // Most recent first
    limit: safeLimit,
    skip: safeSkip,
  });
});

/**
 * Publish unresolved error reports for admin dashboard
 */
Meteor.publish("errorReports.unresolved", async function publishUnresolvedErrors(limit = 20) {
  check(limit, Number);

  // Check if user is admin
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser || !currentUser.roles || !currentUser.roles.includes("admin")) {
    return this.ready();
  }

  const safeLimit = Math.min(limit, 50);

  return ErrorReports.find(
    { resolved: false },
    {
      sort: { severity: -1, timestamp: -1 }, // Critical first, then by time
      limit: safeLimit,
    }
  );
});

/**
 * Publish critical error reports for immediate attention
 */
Meteor.publish("errorReports.critical", async function publishCriticalErrors() {
  // Check if user is admin
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser || !currentUser.roles || !currentUser.roles.includes("admin")) {
    return this.ready();
  }

  return ErrorReports.find(
    {
      severity: "critical",
      resolved: false,
    },
    {
      sort: { timestamp: -1 },
      limit: 10,
    }
  );
});

/**
 * Publish error reports by user (admin only)
 */
Meteor.publish("errorReports.byUser", async function publishErrorsByUser(username) {
  check(username, String);

  // Check if user is admin
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser || !currentUser.roles || !currentUser.roles.includes("admin")) {
    return this.ready();
  }

  return ErrorReports.find(
    { username: username },
    {
      sort: { timestamp: -1 },
      limit: 30,
    }
  );
});

/**
 * Publish recent error reports for admin dashboard
 */
Meteor.publish("errorReports.recent", async function publishRecentErrors(hours = 24) {
  check(hours, Number);

  // Check if user is admin
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser || !currentUser.roles || !currentUser.roles.includes("admin")) {
    return this.ready();
  }

  const safeHours = Math.min(hours, 168); // Max 1 week
  const cutoffTime = new Date(Date.now() - safeHours * 60 * 60 * 1000);

  return ErrorReports.find(
    { timestamp: { $gte: cutoffTime } },
    {
      sort: { timestamp: -1 },
      limit: 100,
    }
  );
});

/**
 * Publish error report count for admin statistics
 */
Meteor.publish("errorReports.count", async function publishErrorCount() {
  // Check if user is admin
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(this.userId);
  if (!currentUser || !currentUser.roles || !currentUser.roles.includes("admin")) {
    return this.ready();
  }

  // This is a reactive publication that publishes counts
  const self = this;

  // Initialize counters
  let totalCount = 0;
  let unresolvedCount = 0;
  let criticalCount = 0;

  // Set up observers
  const totalHandle = ErrorReports.find({}).observeChanges({
    added: () => {
      totalCount++;
      self.changed("errorReportCounts", "total", { count: totalCount });
    },
    removed: () => {
      totalCount--;
      self.changed("errorReportCounts", "total", { count: totalCount });
    },
  });

  const unresolvedHandle = ErrorReports.find({ resolved: false }).observeChanges({
    added: () => {
      unresolvedCount++;
      self.changed("errorReportCounts", "unresolved", { count: unresolvedCount });
    },
    removed: () => {
      unresolvedCount--;
      self.changed("errorReportCounts", "unresolved", { count: unresolvedCount });
    },
    changed: (id, fields) => {
      if (fields.resolved === true) {
        unresolvedCount--;
      } else if (fields.resolved === false) {
        unresolvedCount++;
      }
      self.changed("errorReportCounts", "unresolved", { count: unresolvedCount });
    },
  });

  const criticalHandle = ErrorReports.find({
    severity: "critical",
    resolved: false
  }).observeChanges({
    added: () => {
      criticalCount++;
      self.changed("errorReportCounts", "critical", { count: criticalCount });
    },
    removed: () => {
      criticalCount--;
      self.changed("errorReportCounts", "critical", { count: criticalCount });
    },
    changed: (id, fields) => {
      if (fields.resolved === true || fields.severity !== "critical") {
        criticalCount--;
      } else if (fields.resolved === false && fields.severity === "critical") {
        criticalCount++;
      }
      self.changed("errorReportCounts", "critical", { count: criticalCount });
    },
  });

  // Send initial counts
  self.added("errorReportCounts", "total", { count: totalCount });
  self.added("errorReportCounts", "unresolved", { count: unresolvedCount });
  self.added("errorReportCounts", "critical", { count: criticalCount });

  self.ready();

  // Clean up observers when subscription stops
  self.onStop(() => {
    if (totalHandle && typeof totalHandle.stop === 'function') {
      totalHandle.stop();
    }
    if (unresolvedHandle && typeof unresolvedHandle.stop === 'function') {
      unresolvedHandle.stop();
    }
    if (criticalHandle && typeof criticalHandle.stop === 'function') {
      criticalHandle.stop();
    }
  });
});
