import { Rides } from "../ride/Rides";
import { RideSessions } from "../rideSession/RideSession";
import { Places } from "../places/Places";
import { Profiles } from "../profile/Profile";
import { Schools } from "../schools/Schools";
import { estimateRoute } from "../ride/routeEstimate";
import { requireAdminScope } from "./adminScope";

/* Derived status and flags cannot be expressed as a Mongo selector — they
 * depend on the ride's session and on its school's distance ceiling — so the
 * queue works over a bounded candidate set and filters in memory. A school
 * with more than this many rides in the window would see the flag counts read
 * as a lower bound rather than time the method out. */
const CANDIDATE_CAP = 500;

/* Rides that departed within the last day stay in the queue so "cancelled
 * today" and just-completed trips remain visible, as the design's sub-line
 * implies. */
const LOOKBACK_MS = 24 * 60 * 60 * 1000;

const MI_PER_KM = 0.621371;

/* The app tells drivers "A fair gas split is roughly $0.33 / mile"
 * (imports/ui/mobile/pages/CreateRide.jsx). A fare of more than twice that
 * rate is what the design's "price" chip flags. Keep the two in step. */
const FAIR_SPLIT_PER_MILE = 0.33;
const PRICE_FLAG_MULTIPLIER = 2;

const STATUS_KEYS = ["live", "pending", "flagged", "cancelled", "completed"];

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Short, human-usable identifier: the real invite code when the ride has one. */
const rideCode = ride => ride.shareCode || ride._id.slice(-6).toUpperCase();

const hasFailedPickup = (session) => {
  if (!session?.progress) return false;
  return Object.values(session.progress).some(entry => entry?.codeError === true);
};

/**
 * Distance/price/pickup flags, all derived from fields the app already stores.
 * A ride with no distance figure and no usable coordinates simply carries no
 * distance or price flag rather than a guessed one.
 */
const flagsFor = (ride, session, maxDistanceKm, coordsById) => {
  const flags = [];

  const fallback = ride.distanceMi === undefined
    ? estimateRoute(coordsById[ride.origin], coordsById[ride.destination])
    : null;
  const distanceMi = ride.distanceMi ?? fallback?.distanceMi ?? null;

  if (distanceMi !== null && maxDistanceKm) {
    if (distanceMi > maxDistanceKm * MI_PER_KM) flags.push("long");
  }

  if (distanceMi !== null && distanceMi > 0 && ride.fare > 0) {
    if (ride.fare / distanceMi > FAIR_SPLIT_PER_MILE * PRICE_FLAG_MULTIPLIER) {
      flags.push("price");
    }
  }

  if (hasFailedPickup(session)) flags.push("nopickup");

  return { flags, distanceMi };
};

/**
 * Fixed precedence, so a ride can only ever land in one bucket:
 * cancelled › live › flagged › completed › pending.
 */
const statusFor = (session, flags) => {
  if (session?.status === "cancelled") return "cancelled";
  if (session?.status === "active") return "live";
  if (flags.length > 0) return "flagged";
  if (session?.status === "completed") return "completed";
  return "pending";
};

const matchesQuery = (row, needle) => {
  if (!needle) return true;
  const haystack = [
    row.code,
    row.originText,
    row.destinationText,
    row.driverName,
  ].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(needle);
};

/**
 * Paginated moderation queue for the "Live rides" table.
 *
 * Every lookup is batched with a single `$in` over the candidate set — place
 * names, driver names, school settings and ride sessions each cost one query
 * regardless of how many rows are shown.
 */
export async function rideQueue(userId, options = {}) {
  const scope = await requireAdminScope(userId);

  const status = STATUS_KEYS.includes(options.status) ? options.status : "all";
  const needle = (options.query || "").trim().toLowerCase();
  const pageSize = Math.min(Math.max(options.pageSize || 7, 1), 50);
  const requestedPage = Math.max(options.page || 1, 1);

  const rides = await Rides.find(
    { ...scope.rideFilter, date: { $gte: new Date(Date.now() - LOOKBACK_MS) } },
    { sort: { date: 1 }, limit: CANDIDATE_CAP },
  ).fetchAsync();

  const rideIds = rides.map(r => r._id);
  const placeIds = [...new Set(rides.flatMap(r => [r.origin, r.destination]).filter(Boolean))];
  const driverIds = [...new Set(rides.map(r => r.driver).filter(Boolean))];
  const schoolIds = [...new Set(rides.map(r => r.schoolId).filter(Boolean))];

  const [places, profiles, schools, sessions] = await Promise.all([
    Places.find({ _id: { $in: placeIds } }, { fields: { text: 1, value: 1 } }).fetchAsync(),
    Profiles.find({ Owner: { $in: driverIds } }, { fields: { Name: 1, Owner: 1 } }).fetchAsync(),
    Schools.find({ _id: { $in: schoolIds } }, { fields: { settings: 1 } }).fetchAsync(),
    RideSessions.find(
      { rideId: { $in: rideIds } },
      { fields: { rideId: 1, status: 1, progress: 1, timeline: 1 } },
    ).fetchAsync(),
  ]);

  const nameById = {};
  const coordsById = {};
  places.forEach((place) => {
    nameById[place._id] = place.text;
    coordsById[place._id] = place.value;
  });

  const driverNameById = {};
  profiles.forEach((profile) => {
    driverNameById[profile.Owner] = profile.Name;
  });

  const maxDistanceBySchool = {};
  schools.forEach((school) => {
    maxDistanceBySchool[school._id] = school.settings?.maxRideDistance ?? null;
  });

  const sessionByRide = {};
  sessions.forEach((session) => {
    sessionByRide[session.rideId] = session;
  });

  const todayStart = startOfToday().getTime();

  const allRows = rides.map((ride) => {
    const session = sessionByRide[ride._id];
    const { flags, distanceMi } = flagsFor(
      ride,
      session,
      maxDistanceBySchool[ride.schoolId],
      coordsById,
    );
    const statusKey = statusFor(session, flags);
    const endedAt = session?.timeline?.ended
      ? new Date(session.timeline.ended).getTime()
      : null;

    return {
      _id: ride._id,
      code: rideCode(ride),
      originText: nameById[ride.origin] || ride.origin,
      destinationText: nameById[ride.destination] || ride.destination,
      driverId: ride.driver,
      driverName: driverNameById[ride.driver] || null,
      status: statusKey,
      flags,
      riders: Array.isArray(ride.riders) ? ride.riders.length : 0,
      seats: ride.seats,
      date: ride.date,
      distanceMi,
      cancelledToday: statusKey === "cancelled" && endedAt !== null && endedAt >= todayStart,
    };
  });

  const matched = allRows.filter(row => matchesQuery(row, needle));

  const counts = {
    all: matched.length,
    live: matched.filter(r => r.status === "live").length,
    pending: matched.filter(r => r.status === "pending").length,
    flagged: matched.filter(r => r.status === "flagged").length,
    cancelledToday: matched.filter(r => r.cancelledToday).length,
    capped: rides.length === CANDIDATE_CAP,
  };

  const filtered = status === "all" ? matched : matched.filter(r => r.status === status);
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { rows, total, page, pageCount, pageSize, counts };
}

export default rideQueue;
