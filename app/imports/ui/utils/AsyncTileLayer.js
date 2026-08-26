/**
 * AsyncTileLayer - Custom Leaflet TileLayer with async tile loading
 *
 * This custom tile layer integrates with the AsyncTileLoader to provide
 * non-blocking tile loading for better performance.
 */

import L from "leaflet";
import asyncTileLoader from "./AsyncTileLoader";

// Custom TileLayer that uses async loading
export const AsyncTileLayer = L.TileLayer.extend({
  initialize: function (urlTemplate, options) {
    L.TileLayer.prototype.initialize.call(this, urlTemplate, options);
    this.asyncLoader = options.asyncLoader || asyncTileLoader;
  },

  createTile: function (coords, done) {
    const tile = document.createElement("img");

    // Set up tile properties
    tile.setAttribute("role", "presentation");
    tile.style.opacity = "0";
    tile.style.transition = "opacity 0.3s ease";

    // Add loading class for placeholder styling
    L.DomUtil.addClass(tile, "async-tile-loading");

    // Load tile asynchronously
    this._loadTileAsync(coords, tile, done);

    return tile;
  },

  _loadTileAsync: async function (coords, tile, done) {
    const { x, y, z } = coords;

    try {
      // Load tile using async loader
      const imageUrl = await this.asyncLoader.loadTile(z, x, y);

      if (imageUrl) {
        // Declare handler functions
        let onLoad;

        // Define error handler
        const onError = () => {
          tile.removeEventListener("load", onLoad);
          tile.removeEventListener("error", onError);

          L.DomUtil.removeClass(tile, "async-tile-loading");
          L.DomUtil.addClass(tile, "async-tile-error");

          done(new Error("Tile failed to load"), tile);
        };

        // Define load handler
        onLoad = () => {
          tile.removeEventListener("load", onLoad);
          tile.removeEventListener("error", onError);

          // Remove loading state and fade in
          L.DomUtil.removeClass(tile, "async-tile-loading");
          L.DomUtil.addClass(tile, "async-tile-loaded");
          tile.style.opacity = "1"; // eslint-disable-line no-param-reassign

          done(null, tile);
        };

        tile.addEventListener("load", onLoad);
        tile.addEventListener("error", onError);
        tile.src = imageUrl; // eslint-disable-line no-param-reassign
      } else {
        // Fallback to original URL
        this._loadTileFallback(coords, tile, done);
      }
    } catch (error) {
      console.warn("Async tile loading failed:", error);
      this._loadTileFallback(coords, tile, done);
    }
  },

  _loadTileFallback: function (coords, tile, done) {
    // Fall back to standard tile loading
    const url = this.getTileUrl(coords);

    // Declare handler functions
    let onLoad;

    // Define error handler
    const onError = () => {
      tile.removeEventListener("load", onLoad);
      tile.removeEventListener("error", onError);

      L.DomUtil.removeClass(tile, "async-tile-loading");
      L.DomUtil.addClass(tile, "async-tile-error");

      done(new Error("Tile failed to load"), tile);
    };

    // Define load handler
    onLoad = () => {
      tile.removeEventListener("load", onLoad);
      tile.removeEventListener("error", onError);

      L.DomUtil.removeClass(tile, "async-tile-loading");
      L.DomUtil.addClass(tile, "async-tile-loaded");
      tile.style.opacity = "1"; // eslint-disable-line no-param-reassign

      done(null, tile);
    };

    tile.addEventListener("load", onLoad);
    tile.addEventListener("error", onError);
    tile.src = url; // eslint-disable-line no-param-reassign
  },

  onAdd: function (map) {
    L.TileLayer.prototype.onAdd.call(this, map);

    // Add CSS for tile loading states
    if (!document.getElementById("async-tile-styles")) {
      const style = document.createElement("style");
      style.id = "async-tile-styles";
      style.textContent = `
        .async-tile-loading {
          background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                      linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                      linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          animation: async-tile-loading 1s linear infinite;
        }

        @keyframes async-tile-loading {
          0% { background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }
          100% { background-position: 20px 20px, 20px 30px, 30px 10px, 10px 20px; }
        }

        .async-tile-error {
          background: #ffebee;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .async-tile-error::after {
          content: '⚠️';
          font-size: 24px;
          opacity: 0.5;
        }
      `;
      document.head.appendChild(style);
    }

    // Deliberately no prefetching here. Leaflet already requests every tile
    // in view, so preloading only duplicated those requests as an unthrottled
    // parallel burst on each moveend/zoomend -- which reads as bulk
    // downloading and gets the client blocked (HTTP 403) under the
    // OpenStreetMap tile usage policy.
  },

  onRemove: function (map) {
    L.TileLayer.prototype.onRemove.call(this, map);
  },

});

// Factory function
export const asyncTileLayer = function (urlTemplate, options) {
  return new AsyncTileLayer(urlTemplate, options);
};

export default AsyncTileLayer;
