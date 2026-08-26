import { Meteor } from "meteor/meteor";
import { Rides } from "../ride/Rides";
import { RideSessions } from "../rideSession/RideSession";
import { Chats } from "../chat/Chat";
import { ErrorReports } from "../errorReport/ErrorReport";
import { Schools } from "../schools/Schools";
import { Places } from "../places/Places";
import { requireAdminScope } from "./adminScope";

/* The stat cards each show 12 sparkline bars, per the design. */
const BUCKETS = 12;

/* Ceiling on the id list used to scope the chat aggregation to one school.
 * Chats carry no schoolId, so they can only be reached through their ride.
 * A school past this cap would under-report chat volume rather than stall the
 * method queue; see the note in the module docblock of AdminDashboardMethods. */
const SCHOOL_RIDE_ID_CAP = 5000;

/* Guard on the number of ride/session/user documents pulled for a series. */
const SERIES_DOC_CAP = 20000;

const HOUR_MS = 60 * 60 * 1000;

/** Drop `count` values into evenly spaced buckets starting at `from`. */
const bucket = (dates, fromMs, bucketMs) => {
  const out = new Array(BUCKETS).fill(0);
  dates.forEach((value) => {
    if (!value) return;
    const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
    if (!Number.isFinite(time)) return;
    const index = Math.floor((time - fromMs) / bucketMs);
    if (index >= 0 && index < BUCKETS) out[index] += 1;
  });
  return out;
};

/** Difference between the two most recent buckets. */
const bucketDelta = series => series[BUCKETS - 1] - series[BUCKETS - 2];

/** Percent change, or null when the baseline is zero (a percentage of nothing). */
const percentDelta = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Ride ids belonging to the admin's school, for collections that lack schoolId. */
const schoolRideIds = async (scope) => {
  if (scope.isSystem) return null;
  const rides = await Rides.find(
    scope.rideFilter,
    { fields: { _id: 1 }, sort: { date: -1 }, limit: SCHOOL_RIDE_ID_CAP },
  ).fetchAsync();
  return rides.map(r => r._id);
};

/** Message timestamps across the window, one aggregation over the Chats array. */
const chatTimestamps = async (scope, from) => {
  const rideIds = await schoolRideIds(scope);
  const pipeline = [];
  if (rideIds) pipeline.push({ $match: { rideId: { $in: rideIds } } });
  pipeline.push(
    { $unwind: "$Messages" },
    { $match: { "Messages.Timestamp": { $gte: from } } },
    { $project: { _id: 0, t: "$Messages.Timestamp" } },
  );
  const rows = await Chats.rawCollection().aggregate(pipeline).toArray();
  return rows.map(r => r.t);
};

/**
 * Every figure behind the five stat cards plus the sidebar badge counts.
 *
 * `rangeHours` is the window the operator picked (24 or 168). It drives the
 * sparkline buckets and the bucket-over-bucket deltas, so the "LAST 24 HOURS"
 * eyebrow always describes the data actually shown.
 */
export async function dashboardStats(userId, rangeHours) {
  const scope = await requireAdminScope(userId);

  const nowMs = Date.now();
  const now = new Date(nowMs);
  const windowMs = rangeHours * HOUR_MS;
  const bucketMs = windowMs / BUCKETS;
  const fromMs = nowMs - windowMs;
  const from = new Date(fromMs);
  const seriesOpts = { fields: { date: 1 }, limit: SERIES_DOC_CAP };

  // ── Card 1 · active rides ────────────────────────────────────────────
  const activeRides = await Rides.find(
    { ...scope.rideFilter, date: { $gte: now } },
  ).countAsync();
  const rideDocs = await Rides.find(
    { ...scope.rideFilter, date: { $gte: from, $lt: now } },
    seriesOpts,
  ).fetchAsync();
  const rideSeries = bucket(rideDocs.map(r => r.date), fromMs, bucketMs);

  // ── Card 2 · in-flight now ───────────────────────────────────────────
  const inFlight = await RideSessions.find(
    { ...scope.rideFilter, status: "active" },
  ).countAsync();
  const startedDocs = await RideSessions.find(
    { ...scope.rideFilter, "timeline.started": { $gte: from } },
    { fields: { "timeline.started": 1 }, limit: SERIES_DOC_CAP },
  ).fetchAsync();
  const inFlightSeries = bucket(
    startedDocs.map(s => s.timeline?.started),
    fromMs,
    bucketMs,
  );

  // ── Card 3 · sign-ups today ──────────────────────────────────────────
  const todayStart = startOfToday();
  const elapsedToday = nowMs - todayStart.getTime();
  const yesterdayStart = new Date(todayStart.getTime() - 24 * HOUR_MS);
  const signupsToday = await Meteor.users.find({
    ...scope.userFilter,
    createdAt: { $gte: todayStart },
  }).countAsync();
  const signupsYesterday = await Meteor.users.find({
    ...scope.userFilter,
    createdAt: {
      $gte: yesterdayStart,
      $lt: new Date(yesterdayStart.getTime() + elapsedToday),
    },
  }).countAsync();
  const signupDocs = await Meteor.users.find(
    { ...scope.userFilter, createdAt: { $gte: from } },
    { fields: { createdAt: 1 }, limit: SERIES_DOC_CAP },
  ).fetchAsync();
  const signupSeries = bucket(signupDocs.map(u => u.createdAt), fromMs, bucketMs);

  // ── Card 4 · chat messages per hour ──────────────────────────────────
  const messageTimes = await chatTimestamps(scope, from);
  const chatSeries = bucket(messageTimes, fromMs, bucketMs);
  const lastHour = messageTimes.filter(t => new Date(t).getTime() >= nowMs - HOUR_MS).length;
  const priorHour = messageTimes.filter((t) => {
    const time = new Date(t).getTime();
    return time >= nowMs - 2 * HOUR_MS && time < nowMs - HOUR_MS;
  }).length;

  // ── Card 5 · open error reports (system admins only) ─────────────────
  // ErrorReports has no school dimension and its methods gate on isSystemAdmin,
  // so school admins get a four-card row rather than a number they cannot act on.
  let reports = null;
  if (scope.isSystem) {
    const open = await ErrorReports.find({ resolved: false }).countAsync();
    const reportDocs = await ErrorReports.find(
      { timestamp: { $gte: from } },
      { fields: { timestamp: 1 }, limit: SERIES_DOC_CAP },
    ).fetchAsync();
    const last24h = await ErrorReports.find({
      timestamp: { $gte: new Date(nowMs - 24 * HOUR_MS) },
    }).countAsync();
    reports = {
      value: open,
      delta: last24h > 0 ? last24h : null,
      series: bucket(reportDocs.map(r => r.timestamp), fromMs, bucketMs),
    };
  }

  // ── Sidebar badges ───────────────────────────────────────────────────
  const navCounts = {
    rides: await Rides.find(scope.rideFilter).countAsync(),
    users: await Meteor.users.find(scope.userFilter).countAsync(),
    places: await Places.find(scope.schoolId ? { schoolId: scope.schoolId } : {}).countAsync(),
    reports: scope.isSystem ? await ErrorReports.find({ resolved: false }).countAsync() : null,
    schools: scope.isSystem ? await Schools.find({}).countAsync() : null,
  };

  return {
    rangeHours,
    scope: {
      isSystem: scope.isSystem,
      schoolName: scope.schoolName,
      schoolShortName: scope.schoolShortName,
    },
    navCounts,
    stats: {
      activeRides: {
        value: activeRides,
        delta: bucketDelta(rideSeries),
        series: rideSeries,
      },
      inFlight: {
        value: inFlight,
        series: inFlightSeries,
      },
      signups: {
        value: signupsToday,
        deltaPct: percentDelta(signupsToday, signupsYesterday),
        series: signupSeries,
      },
      chats: {
        value: lastHour,
        deltaPct: percentDelta(lastHour, priorHour),
        series: chatSeries,
      },
      reports,
    },
  };
}

export default dashboardStats;
