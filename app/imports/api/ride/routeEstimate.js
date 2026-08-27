/**
 * Route distance / duration estimation.
 *
 * The real figures come from OSRM (osrm.carp.school). While that service is
 * unreachable we fall back to a great-circle estimate so the discovery cards
 * show real numbers instead of blanks. Anything produced here is marked
 * `routeEstimated: true` on the ride so true routed values can replace it
 * later without guessing which rows were estimates.
 */

const EARTH_RADIUS_MI = 3958.8;

/* Straight-line distance under-reads road distance; this is the usual
 * circuity factor for short urban trips. */
const ROAD_CIRCUITY = 1.25;

/* Door-to-door average including stops and lights, in mph. */
const AVG_SPEED_MPH = 32;

const toRad = deg => (deg * Math.PI) / 180;

/**
 * Parse a Places `value` field, which is stored as a "lat,lng" string.
 * Returns null when the value is missing or malformed.
 */
export const parseCoords = (value) => {
  if (typeof value !== "string") return null;
  const parts = value.split(",");
  if (parts.length !== 2) return null;
  const lat = Number(parts[0].trim());
  const lng = Number(parts[1].trim());
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
};

/** Great-circle distance in miles between two {lat, lng} points. */
export const haversineMiles = (a, b) => {
  if (!a || !b) return null;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)));
};

/**
 * Estimate {distanceMi, durationMin} from two "lat,lng" strings.
 * Returns null when either coordinate is unusable.
 */
export const estimateRoute = (originValue, destinationValue) => {
  const from = parseCoords(originValue);
  const to = parseCoords(destinationValue);
  const straight = haversineMiles(from, to);
  if (straight === null) return null;
  const distanceMi = Math.round(straight * ROAD_CIRCUITY * 10) / 10;
  const durationMin = Math.max(1, Math.round((distanceMi / AVG_SPEED_MPH) * 60));
  return { distanceMi, durationMin };
};

/** "52 min" / "1h 50" in the design's format. */
/**
 * Estimate a route that calls at each point in order.
 *
 * Takes place `value` strings (origin, any stops, destination) and sums the
 * legs. Returns null if any leg is unreadable, so a ride with one broken stop
 * reports no estimate rather than a distance that quietly omits part of the
 * journey.
 *
 * Time spent stopped is not modelled: this is drive time only, the same
 * measure a direct ride reports.
 */
export const estimateRouteVia = (values) => {
  if (!Array.isArray(values) || values.length < 2) return null;

  let distanceMi = 0;
  let durationMin = 0;

  for (let i = 0; i < values.length - 1; i += 1) {
    const leg = estimateRoute(values[i], values[i + 1]);
    if (!leg) return null;
    distanceMi += leg.distanceMi;
    durationMin += leg.durationMin;
  }

  return {
    distanceMi: Math.round(distanceMi * 10) / 10,
    durationMin,
  };
};

export const formatDuration = (minutes) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}`;
};

/** "24.1 mi" */
export const formatDistance = (miles) => {
  if (!Number.isFinite(miles) || miles <= 0) return null;
  return `${miles.toFixed(1)} mi`;
};
