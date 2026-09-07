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

  const { isSystemAdmin } = await import("../accounts/RoleUtils");
  if (!await isSystemAdmin(this.userId)) {
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

  const { isSystemAdmin } = await import("../accounts/RoleUtils");
  if (!await isSystemAdmin(this.userId)) {
    return this.ready();
  }

  const safeLimit = Math.min(limit, 50);

  return ErrorReports.find(
    { resolved: false },
    {
      sort: { severity: -1, timestamp: -1 }, // Critical first, then by time
      limit: safeLimit,
    },
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

  const { isSystemAdmin } = await import("../accounts/RoleUtils");
  if (!await isSystemAdmin(this.userId)) {
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
    },
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

  const { isSystemAdmin } = await import("../accounts/RoleUtils");
  if (!await isSystemAdmin(this.userId)) {
    return this.ready();
  }

  return ErrorReports.find(
    { username: username },
    {
      sort: { timestamp: -1 },
      limit: 30,
    },
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

  const { isSystemAdmin } = await import("../accounts/RoleUtils");
  if (!await isSystemAdmin(this.userId)) {
    return this.ready();
  }

  const safeHours = Math.min(hours, 168); // Max 1 week
  const cutoffTime = new Date(Date.now() - safeHours * 60 * 60 * 1000);

  return ErrorReports.find(
    { timestamp: { $gte: cutoffTime } },
    {
      sort: { timestamp: -1 },
      limit: 100,
    },
  );
});

/**
 * Error report counts for the admin dashboard.
 *
 * Used to be a reactive publication with three live observeChangesAsync
 * scans over the whole (collection-wide, unbounded by school) ErrorReports
 * collection -- one full table observer each for the total, unresolved and
 * critical counts, held open for as long as any admin had the dashboard
 * tab open. A polled method that just counts on demand is far cheaper for a
 * number the dashboard only needs refreshed every so often; see
 * AdminOverview.jsx, which now calls this every 30s instead of subscribing.
 */
Meteor.methods({
  async "errorReports.counts"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in");
    }

    const { isSystemAdmin } = await import("../accounts/RoleUtils");
    if (!await isSystemAdmin(this.userId)) {
      throw new Meteor.Error("not-authorized", "Admin access required");
    }

    const [total, unresolved, critical] = await Promise.all([
      ErrorReports.find({}).countAsync(),
      ErrorReports.find({ resolved: false }).countAsync(),
      ErrorReports.find({ severity: "critical", resolved: false }).countAsync(),
    ]);

    return { total, unresolved, critical };
  },
});
