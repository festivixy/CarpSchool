import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { dashboardStats } from "./adminStats";
import { rideQueue } from "./adminRideQueue";
import { serviceHealth } from "./adminServiceHealth";
import { activityFeed } from "./adminActivityFeed";

/**
 * Read-only methods behind the admin operations dashboard.
 *
 * Every one resolves the caller's scope through requireAdminScope first, so a
 * school admin can only ever read their own school and a signed-in non-admin
 * gets access-denied. None of them writes.
 *
 * Server-only: imported from server/main.js.
 */

const QUERY_MAX = 120;
const RANGE_CHOICES = [24, 168];

Meteor.methods({
  async "admin.dashboardStats"(rangeHours) {
    check(rangeHours, Match.Optional(Number));
    const hours = RANGE_CHOICES.includes(rangeHours) ? rangeHours : RANGE_CHOICES[0];
    return dashboardStats(this.userId, hours);
  },

  async "admin.rideQueue"(options) {
    check(options, Match.Optional({
      status: Match.Optional(String),
      query: Match.Optional(String),
      page: Match.Optional(Number),
      pageSize: Match.Optional(Number),
    }));
    const opts = options || {};
    return rideQueue(this.userId, {
      ...opts,
      query: (opts.query || "").slice(0, QUERY_MAX),
    });
  },

  async "admin.serviceHealth"() {
    return serviceHealth(this.userId);
  },

  async "admin.activityFeed"(limit) {
    check(limit, Match.Optional(Number));
    return activityFeed(this.userId, limit || 12);
  },
});
