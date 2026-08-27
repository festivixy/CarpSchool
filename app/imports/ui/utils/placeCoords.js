/**
 * Places store their position as a single "lat,lng" string in `value`.
 *
 * The schema validates that string with VALIDATION_PATTERNS.coordinates,
 * /^-?\d+\.?\d*,-?\d+\.?\d*$/, which allows no space after the comma. Anything
 * writing a place must therefore format it exactly, which is what
 * `formatPlaceValue` is for -- hand-built template strings have no such
 * guarantee.
 */

/** Six decimals is ~11cm, well past anything a map click can express. */
const COORD_DECIMALS = 6;

/**
 * Parse a place's `value` into { lat, lng }, or null when it cannot be read.
 *
 * Returns null rather than throwing: legacy places predate the current schema
 * and a single unreadable one should drop off the map, not break the screen
 * rendering it.
 */
export const parsePlaceValue = (value) => {
  if (typeof value !== "string") return null;

  const parts = value.split(",");
  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lng < -180 || lng > 180) return null;

  return { lat, lng };
};

/** Format coordinates into the exact shape the schema accepts. */
export const formatPlaceValue = (lat, lng) => {
  const safeLat = Number(lat).toFixed(COORD_DECIMALS);
  const safeLng = Number(lng).toFixed(COORD_DECIMALS);
  return `${safeLat},${safeLng}`;
};

/**
 * Whether `userId` may edit `place`.
 *
 * Mirrors the rule places.update and places.remove enforce on the server:
 * the creator, or an admin of the place's school. Kept in step deliberately --
 * offering a control that the server will refuse is worse than not offering it.
 */
export const canEditPlace = (place, userId, isAdmin = false) => {
  if (!place || !userId) return false;
  if (place.createdBy === userId) return true;
  return Boolean(isAdmin);
};
