/**
 * Places store their position as a single "lat,lng" string in `value`.
 *
 * This module is the one parser/formatter for that string, kept free of
 * Meteor and UI imports so both the Joi schema on the server and the map
 * components on the client can share it.
 */

/** Six decimals is ~11cm, well past anything a map click can express. */
const COORD_DECIMALS = 6;

/**
 * Parse a place's `value` into { lat, lng }, or null when it cannot be read
 * or is out of range (lat -90..90, lng -180..180).
 *
 * Returns null rather than throwing: legacy places predate the current schema
 * and a single unreadable one should drop off the map, not break the screen
 * rendering it.
 */
export const parsePlaceValue = (value) => {
  if (typeof value !== "string") return null;

  const parts = value.split(",");
  if (parts.length !== 2) return null;

  const lat = Number(parts[0].trim());
  const lng = Number(parts[1].trim());
  if (parts[0].trim() === "" || parts[1].trim() === "") return null;
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
 * Joi custom validator for a place `value`. Parses and range-checks instead
 * of pattern-matching, so "999,999" is refused as firmly as "abc".
 */
export const validateCoordinates = (value, helpers) => {
  if (parsePlaceValue(value) === null) {
    return helpers.error("string.coordinates");
  }
  return value;
};
