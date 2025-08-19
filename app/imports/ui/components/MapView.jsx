import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Map, Marker, Popup } from "react-leaflet";
import { MapContainer } from "../styles/MapView";
import { AsyncTileLayer } from "../utils/AsyncTileLayer";

/**
 * MapView component that displays an interactive Leaflet map with coordinate points
 * Uses AsyncTileLayer for non-blocking tile loading to improve performance
 * Takes coordinates array as input to display multiple points on the map
 * Optional tileServerUrl prop for self-hosted OpenMapTiles server
 */
export default function MapView({ coordinates, tileServerUrl }) {
  const mapRef = useRef(null);

  // Calculate map center based on coordinates
  const getMapCenter = () => {
    if (!coordinates || coordinates.length === 0) {
      return [49.345196, -123.149805]; // Default to Vancouver
    }

    try {
      // Filter out invalid coordinates
      const validCoords = coordinates.filter(coord => coord && !Number.isNaN(coord.lat) && !Number.isNaN(coord.lng) &&
        coord.lat >= -90 && coord.lat <= 90 &&
        coord.lng >= -180 && coord.lng <= 180);

      if (validCoords.length === 0) {
        return [49.345196, -123.149805]; // Default to Vancouver
      }

      if (validCoords.length === 1) {
        return [validCoords[0].lat, validCoords[0].lng];
      }

      // Calculate center of all valid coordinates
      const latSum = validCoords.reduce((sum, coord) => sum + coord.lat, 0);
      const lngSum = validCoords.reduce((sum, coord) => sum + coord.lng, 0);
      const centerLat = latSum / validCoords.length;
      const centerLng = lngSum / validCoords.length;

      if (Number.isNaN(centerLat) || Number.isNaN(centerLng)) {
        return [49.345196, -123.149805]; // Default to Vancouver
      }

      return [centerLat, centerLng];
    } catch (error) {
      console.warn("Error calculating map center:", error);
      return [49.345196, -123.149805]; // Default to Vancouver
    }
  };

  // Calculate appropriate zoom level based on coordinate spread
  const getZoomLevel = () => {
    if (!coordinates || coordinates.length <= 1) {
      return 13;
    }

    try {
      const lats = coordinates.map((coord) => coord.lat).filter(lat => !Number.isNaN(lat));
      const lngs = coordinates.map((coord) => coord.lng).filter(lng => !Number.isNaN(lng));

      if (lats.length === 0 || lngs.length === 0) {
        return 13;
      }

      const latSpread = Math.max(...lats) - Math.min(...lats);
      const lngSpread = Math.max(...lngs) - Math.min(...lngs);
      const maxSpread = Math.max(latSpread, lngSpread);

      if (Number.isNaN(maxSpread)) return 13;
      if (maxSpread > 0.1) return 10;
      if (maxSpread > 0.05) return 11;
      if (maxSpread > 0.01) return 12;
      return 13;
    } catch (error) {
      console.warn("Error calculating zoom level:", error);
      return 13;
    }
  };

  // Get tile server URL
  const getTileUrl = () => {
    const effectiveTileServerUrl =
      tileServerUrl && tileServerUrl.trim() !== ""
        ? tileServerUrl
        : "https://tileserver.carp.school";

    return `${effectiveTileServerUrl}/styles/OSM%20OpenMapTiles/{z}/{x}/{y}.png`;
  };

  // Add async tile layer to map and fit bounds
  useEffect(() => {
    if (mapRef.current) {
      try {
        const map = mapRef.current.leafletElement;

        // Create and add async tile layer
        const asyncTileLayer = new AsyncTileLayer(getTileUrl(), {
          attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
          maxZoom: 18,
          tileSize: 256,
        });

        asyncTileLayer.addTo(map);

        // Fit bounds to show all coordinates
        if (coordinates && coordinates.length > 1) {
          // Filter out invalid coordinates
          const validCoords = coordinates.filter((coord) => {
            const hasValidCoord = coord && !Number.isNaN(coord.lat) && !Number.isNaN(coord.lng);
            const withinLatBounds = coord.lat >= -90 && coord.lat <= 90;
            const withinLngBounds = coord.lng >= -180 && coord.lng <= 180;
            return hasValidCoord && withinLatBounds && withinLngBounds;
          });

          if (validCoords.length > 1) {
            const bounds = validCoords.map((coord) => [coord.lat, coord.lng]);
            try {
              map.fitBounds(bounds, { padding: [20, 20] });
            } catch (boundsError) {
              console.warn("Error fitting bounds:", boundsError);
            }
          }
        }

        // Cleanup on unmount
        return () => {
          try {
            if (map && map.hasLayer && map.hasLayer(asyncTileLayer)) {
              map.removeLayer(asyncTileLayer);
            }
          } catch (cleanupError) {
            console.warn("Error during map cleanup:", cleanupError);
          }
        };
      } catch (error) {
        console.warn("Error in map useEffect:", error);
        // Return empty cleanup function even if there was an error
        return () => {};
      }
    }

    // Return empty cleanup function if mapRef.current is null
    return () => {};
  }, [coordinates, tileServerUrl]);

  return (
    <MapContainer>
      <Map
        ref={mapRef}
        center={getMapCenter()}
        zoom={getZoomLevel()}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* AsyncTileLayer is added programmatically in useEffect */}

        {coordinates &&
          coordinates.map((coord, index) => (
            <Marker key={index} position={[coord.lat, coord.lng]}>
              {coord.label && <Popup>{coord.label}</Popup>}
            </Marker>
          ))}
      </Map>
    </MapContainer>
  );
}

MapView.propTypes = {
  coordinates: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      label: PropTypes.string, // Optional label for popup
    }),
  ),
  tileServerUrl: PropTypes.string, // Optional: URL to self-hosted OpenMapTiles server
};
