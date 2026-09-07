/**
 * Client-side helpers for a place's "lat,lng" `value`.
 *
 * The parser and formatter live in api/places/placeCoords so the server
 * schema can use them too; they are re-exported here so existing UI imports
 * keep working.
 */
import {
  parsePlaceValue as parsePlaceValueShared,
  formatPlaceValue as formatPlaceValueShared,
} from "../../api/places/placeCoords";

/* Thin wrappers rather than a bare re-export: the repo's reference checker
 * does not follow `export ... from`, and callers all import from this path. */
export const parsePlaceValue = value => parsePlaceValueShared(value);
export const formatPlaceValue = (lat, lng) => formatPlaceValueShared(lat, lng);

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
