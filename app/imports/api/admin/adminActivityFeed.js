import { Meteor } from "meteor/meteor";
import { Rides } from "../ride/Rides";
import { RideSessions } from "../rideSession/RideSession";
import { Chats } from "../chat/Chat";
import { Places } from "../places/Places";
import { Profiles } from "../profile/Profile";
import { Notifications, NOTIFICATION_TYPES } from "../notifications/Notifications";
import { ErrorReports } from "../errorReport/ErrorReport";
import { requireAdminScope } from "./adminScope";

/* The feed only ever shows the recent past; anything older belongs in the
 * per-collection admin screens. */
const WINDOW_MS = 24 * 60 * 60 * 1000;

/* Per-source ceiling before the merged stream is trimmed to `limit`. */
const SOURCE_CAP = 40;

const MAX_LIMIT = 40;

const REPORT_TEXT_MAX = 64;

const rideCode = ride => ride.shareCode || ride._id.slice(-6).toUpperCase();

const truncate = (text, max) => (
  text.length > max ? `${text.slice(0, max - 1)}…` : text
);

/** Local part of an email, or the username, for the SIGNUP line. */
const accountLabel = (user) => {
  const email = user.emails?.[0]?.address;
  if (user.username) return user.username;
  if (email) return email.split("@")[0];
  return user._id.slice(-6);
};

const emailDomain = (user) => {
  const email = user.emails?.[0]?.address;
  return email && email.includes("@") ? `@${email.split("@")[1]}` : null;
};

/**
 * Merged, timestamped event stream behind the "Live feed" terminal card.
 *
 * Six real sources, each already carrying its own timestamp — nothing here is
 * synthesised. School admins get the same stream narrowed to their school;
 * error reports are system-admin only, matching the ErrorReports gate.
 */
export async function activityFeed(userId, limit = 12) {
  const scope = await requireAdminScope(userId);

  const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const cutoff = new Date(Date.now() - WINDOW_MS);

  const [started, ended, joins, chatRows, verifications, signups, reports] = await Promise.all([
    RideSessions.find(
      { ...scope.rideFilter, "timeline.started": { $gte: cutoff } },
      { fields: { rideId: 1, timeline: 1, status: 1 }, limit: SOURCE_CAP },
    ).fetchAsync(),
    RideSessions.find(
      { ...scope.rideFilter, "timeline.ended": { $gte: cutoff } },
      { fields: { rideId: 1, timeline: 1, status: 1 }, limit: SOURCE_CAP },
    ).fetchAsync(),
    Notifications.find(
      { type: NOTIFICATION_TYPES.RIDER_JOINED, createdAt: { $gte: cutoff } },
      { fields: { createdAt: 1, body: 1, data: 1 }, sort: { createdAt: -1 }, limit: SOURCE_CAP },
    ).fetchAsync(),
    Chats.rawCollection().aggregate([
      { $unwind: "$Messages" },
      { $match: { "Messages.Timestamp": { $gte: cutoff } } },
      { $group: { _id: "$rideId", count: { $sum: 1 }, last: { $max: "$Messages.Timestamp" } } },
      { $sort: { last: -1 } },
      { $limit: SOURCE_CAP },
    ]).toArray(),
    Profiles.find(
      { $or: [{ approvedAt: { $gte: cutoff } }, { rejectedAt: { $gte: cutoff } }] },
      { fields: { Name: 1, Owner: 1, approvedAt: 1, rejectedAt: 1 }, limit: SOURCE_CAP },
    ).fetchAsync(),
    Meteor.users.find(
      { ...scope.userFilter, createdAt: { $gte: cutoff } },
      { fields: { createdAt: 1, username: 1, emails: 1 }, sort: { createdAt: -1 }, limit: SOURCE_CAP },
    ).fetchAsync(),
    scope.isSystem
      ? ErrorReports.find(
        { timestamp: { $gte: cutoff } },
        { fields: { timestamp: 1, message: 1, component: 1 }, sort: { timestamp: -1 }, limit: SOURCE_CAP },
      ).fetchAsync()
      : Promise.resolve([]),
  ]);

  // One batched lookup resolves every referenced ride, and doubles as the
  // school filter for the sources that carry no schoolId of their own.
  const rideIds = [...new Set([
    ...started.map(s => s.rideId),
    ...ended.map(s => s.rideId),
    ...joins.map(n => n.data?.rideId),
    ...chatRows.map(c => c._id),
  ].filter(Boolean))];

  const rides = await Rides.find(
    { _id: { $in: rideIds }, ...scope.rideFilter },
    { fields: { origin: 1, destination: 1, shareCode: 1 } },
  ).fetchAsync();

  const placeIds = [...new Set(rides.flatMap(r => [r.origin, r.destination]).filter(Boolean))];
  const places = await Places.find(
    { _id: { $in: placeIds } },
    { fields: { text: 1 } },
  ).fetchAsync();
  const placeName = {};
  places.forEach((place) => { placeName[place._id] = place.text; });

  const rideLabel = {};
  rides.forEach((ride) => {
    const from = placeName[ride.origin];
    const to = placeName[ride.destination];
    rideLabel[ride._id] = from && to
      ? `${rideCode(ride)} · ${from} → ${to}`
      : rideCode(ride);
  });

  // Verification events live on Profiles, which carry no school dimension —
  // scope them through the profile owner's account.
  const owners = [...new Set(verifications.map(v => v.Owner).filter(Boolean))];
  const allowedOwners = new Set(
    (await Meteor.users.find(
      { _id: { $in: owners }, ...scope.userFilter },
      { fields: { _id: 1 } },
    ).fetchAsync()).map(u => u._id),
  );

  const events = [];
  const push = (at, kind, tone, text) => {
    if (at && text) events.push({ at: new Date(at), kind, tone, text });
  };

  started.forEach((s) => {
    if (rideLabel[s.rideId]) push(s.timeline?.started, "RIDE-START", "accent", rideLabel[s.rideId]);
  });

  ended.forEach((s) => {
    if (!rideLabel[s.rideId]) return;
    const cancelled = s.status === "cancelled";
    push(
      s.timeline?.ended,
      cancelled ? "RIDE-CANCEL" : "RIDE-END",
      cancelled ? "danger" : "accent",
      rideLabel[s.rideId],
    );
  });

  joins.forEach((n) => {
    const label = rideLabel[n.data?.rideId];
    if (!label) return;
    push(n.createdAt, "JOIN", "accent", `${n.body} · ${label.split(" · ")[0]}`);
  });

  chatRows.forEach((row) => {
    const label = rideLabel[row._id];
    if (!label) return;
    push(row.last, "CHAT", "accent", `${row.count} messages on ${label.split(" · ")[0]}`);
  });

  verifications.forEach((profile) => {
    if (!allowedOwners.has(profile.Owner)) return;
    const name = profile.Name || "A student";
    if (profile.approvedAt && profile.approvedAt >= cutoff) {
      push(profile.approvedAt, "VERIFY", "good", `${name} approved`);
    }
    if (profile.rejectedAt && profile.rejectedAt >= cutoff) {
      push(profile.rejectedAt, "VERIFY", "danger", `${name} rejected`);
    }
  });

  signups.forEach((user) => {
    const domain = emailDomain(user);
    push(
      user.createdAt,
      "SIGNUP",
      "accent",
      domain ? `${accountLabel(user)} · ${domain}` : accountLabel(user),
    );
  });

  reports.forEach((report) => {
    push(
      report.timestamp,
      "REPORT",
      "danger",
      `${report.component || "client"} · ${truncate(report.message || "error", REPORT_TEXT_MAX)}`,
    );
  });

  events.sort((a, b) => b.at - a.at);
  return events.slice(0, safeLimit);
}

export default activityFeed;
