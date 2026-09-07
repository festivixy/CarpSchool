import React from "react";
import L from "leaflet";

/**
 * Shared Leaflet setup: a bundled-asset-free default marker icon, and a tile
 * failure tracker every map component wires into its tile layer.
 *
 * Meteor's bundler does not turn a `import icon from "*.png"` into a URL the
 * way webpack does, so the default marker is drawn as an inline SVG divIcon
 * instead of pointing at leaflet's own image assets (or a CDN, which is what
 * the per-component code used to do -- and which fails the same way the
 * tileserver does when the CDN is unreachable).
 */
const DEFAULT_ICON_HTML = `<svg width="25" height="41" viewBox="0 0 25 41" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12.5 40C12.5 40 24 27.5 24 15.5A11.5 11.5 0 1 0 1 15.5C1 27.5 12.5 40 12.5 40z"
          fill="#2f6fed" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12.5" cy="15" r="4.5" fill="#fff"/>
  </svg>`;

export const DEFAULT_MARKER_ICON = L.divIcon({
  className: "leaflet-default-pin",
  html: DEFAULT_ICON_HTML,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

let defaultIconInstalled = false;

/** Sets L.Icon.Default (and therefore every marker without an explicit icon)
 * to the bundled divIcon above. Safe to call from every map component --
 * only does the work once. */
export const installDefaultIcon = () => {
  if (defaultIconInstalled) return;
  defaultIconInstalled = true;
  L.Marker.prototype.options.icon = DEFAULT_MARKER_ICON;
};

/** 1x1 transparent PNG so a failed tile request paints as blank, not a
 * broken-image glyph. */
export const TRANSPARENT_TILE_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const ERROR_WINDOW_MS = 10000;
const ERROR_THRESHOLD = 6;

/**
 * Wires a Leaflet tile layer's `tileerror` events to a failure callback:
 * more than ERROR_THRESHOLD errors within ERROR_WINDOW_MS calls `onFailure`
 * once, and stops counting after that (the layer keeps retrying tiles on its
 * own -- this just stops nagging the caller about it). Also sets
 * `errorTileUrl` so failed tiles render blank instead of broken.
 *
 * @param {L.TileLayer} tileLayer
 * @param {Function} onFailure
 * @returns {Function} teardown -- removes the listener
 */
export const attachTileErrorTracking = (tileLayer, onFailure) => {
  if (!tileLayer) return () => {};

  if (tileLayer.options) {
    tileLayer.options.errorTileUrl = TRANSPARENT_TILE_URL;
  }

  const timestamps = [];
  let failed = false;

  const handleTileError = () => {
    if (failed) return;
    const now = Date.now();
    timestamps.push(now);
    while (timestamps.length && now - timestamps[0] > ERROR_WINDOW_MS) {
      timestamps.shift();
    }
    if (timestamps.length > ERROR_THRESHOLD) {
      failed = true;
      if (onFailure) onFailure();
    }
  };

  tileLayer.on("tileerror", handleTileError);
  return () => tileLayer.off("tileerror", handleTileError);
};

const TILE_NOTICE_STYLE = {
  position: "absolute",
  left: "50%",
  top: "12px",
  transform: "translateX(-50%)",
  zIndex: 500,
  padding: "8px 14px",
  borderRadius: "999px",
  background: "var(--ink-1, #1a1815)",
  color: "var(--cream-0, #faf7f0)",
  fontSize: "12.5px",
  fontWeight: 500,
  whiteSpace: "nowrap",
  pointerEvents: "none",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};

/** Shared inline notice every map component shows over its canvas once tile
 * loading has been failing persistently -- see attachTileErrorTracking. */
export const TileFailureNotice = () => (
  <div style={TILE_NOTICE_STYLE}>Map tiles unavailable — showing pins only</div>
);
