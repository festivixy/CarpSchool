import { Meteor } from "meteor/meteor";

/**
 * Map service endpoints.
 *
 * The app's own tile, geocoding and routing services live on carp.school
 * subdomains. When that domain is unreachable (it is currently expired, so
 * tileserver/nominatim/osrm all redirect to a parking page) every map renders
 * blank. These helpers let the endpoints be overridden from settings so a
 * local or self-hosted stack can be pointed at instead, without changing
 * component code.
 *
 * Defaults preserve the production endpoints, so omitting the settings block
 * leaves behaviour exactly as before.
 *
 * settings.json:
 *   "public": {
 *     "map": {
 *       "tileServerUrl": "https://tile.openstreetmap.org",
 *       "tileStylePath": "",
 *       "nominatimUrl": "https://nominatim.openstreetmap.org",
 *       "osrmUrl": "https://router.project-osrm.org"
 *     }
 *   }
 */

const DEFAULTS = {
  tileServerUrl: "https://tileserver.carp.school",
  // carp.school's tileserver serves styled tiles under this path; a plain OSM
  // tile server serves them from the root, so this is configurable too.
  tileStylePath: "/styles/OSM%20OpenMapTiles",
  nominatimUrl: "https://nominatim.carp.school",
  osrmUrl: "https://osrm.carp.school",
};

const cfg = () => (Meteor.settings?.public?.map) || {};

const pick = (key) => {
  const value = cfg()[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : DEFAULTS[key];
};

/** Base URL of the tile server, no trailing slash. */
export const getTileServerUrl = () => pick("tileServerUrl").replace(/\/$/, "");

/**
 * Full Leaflet tile template. `override` wins when a component was given an
 * explicit tileServerUrl prop.
 */
export const getTileUrlTemplate = (override) => {
  const base = (override && override.trim() !== "")
    ? override.trim().replace(/\/$/, "")
    : getTileServerUrl();
  const style = cfg().tileStylePath !== undefined
    ? cfg().tileStylePath
    : DEFAULTS.tileStylePath;
  const stylePart = style ? `${style}`.replace(/\/$/, "") : "";
  return `${base}${stylePart}/{z}/{x}/{y}.png`;
};

export const getNominatimUrl = () => pick("nominatimUrl").replace(/\/$/, "");

export const getOsrmUrl = () => pick("osrmUrl").replace(/\/$/, "");
