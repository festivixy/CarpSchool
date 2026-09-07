import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Map, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer } from "../styles/MapView";
import { getTileUrlTemplate } from "../utils/mapConfig";
import { installDefaultIcon, attachTileErrorTracking, TileFailureNotice } from "../utils/leafletIcons";

installDefaultIcon();

const isValidCoord = (coord) => Boolean(coord) &&
  Number.isFinite(coord.lat) && Number.isFinite(coord.lng) &&
  Math.abs(coord.lat) <= 90 && Math.abs(coord.lng) <= 180;

/**
 * MapView component that displays an interactive Leaflet map with coordinate points
 * Takes coordinates array as input to display multiple points on the map
 * Optional tileServerUrl prop for self-hosted OpenMapTiles server
 */
export default function MapView({ coordinates, tileServerUrl }) {
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const didFitRef = useRef(false);
  const [tilesFailed, setTilesFailed] = React.useState(false);

  const validCoords = (coordinates || []).filter(isValidCoord);

  // Calculate map center based on coordinates
  const getMapCenter = () => {
    if (validCoords.length === 0) {
      return [49.345196, -123.149805]; // Default to Vancouver
    }

    if (validCoords.length === 1) {
      return [validCoords[0].lat, validCoords[0].lng];
    }

    const latSum = validCoords.reduce((sum, coord) => sum + coord.lat, 0);
    const lngSum = validCoords.reduce((sum, coord) => sum + coord.lng, 0);
    return [latSum / validCoords.length, lngSum / validCoords.length];
  };

  // Calculate appropriate zoom level based on coordinate spread
  const getZoomLevel = () => {
    if (validCoords.length <= 1) {
      return 13;
    }

    const lats = validCoords.map((coord) => coord.lat);
    const lngs = validCoords.map((coord) => coord.lng);
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);

    if (maxSpread > 0.1) return 10;
    if (maxSpread > 0.05) return 11;
    if (maxSpread > 0.01) return 12;
    return 13;
  };

  // Get tile server URL (settings-overridable; see utils/mapConfig)
  const getTileUrl = () => getTileUrlTemplate(tileServerUrl);

  // Create the tile layer once. Recreating it on every coordinate change was
  // pointless churn -- the URL only ever changes with tileServerUrl.
  useEffect(() => {
    const map = mapRef.current?.leafletElement;
    if (!map) return undefined;

    const tileLayer = L.tileLayer(getTileUrl(), {
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
      maxZoom: 18,
      tileSize: 256,
    });
    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;
    const detachTileTracking = attachTileErrorTracking(tileLayer, () => setTilesFailed(true));

    return () => {
      detachTileTracking();
      try {
        if (map && map.hasLayer && map.hasLayer(tileLayer)) {
          map.removeLayer(tileLayer);
        }
      } catch (cleanupError) {
        console.warn("Error during map cleanup:", cleanupError);
      }
      tileLayerRef.current = null;
    };
  }, [tileServerUrl]);

  // Fit bounds once there is something to show. Keyed on a serialised
  // coordinate string (not the array reference) so this does not refit on
  // every render, and refits only the first time a set of points appears --
  // matching WaypointMap's fit-once behaviour so the view does not jump
  // around under a viewer who has since panned or zoomed.
  const coordKey = validCoords.map((c) => `${c.lat.toFixed(6)},${c.lng.toFixed(6)}`).join("|");
  useEffect(() => {
    const map = mapRef.current?.leafletElement;
    if (!map || didFitRef.current || validCoords.length === 0) return;

    didFitRef.current = true;
    try {
      if (validCoords.length === 1) {
        map.setView([validCoords[0].lat, validCoords[0].lng], getZoomLevel());
      } else {
        const bounds = validCoords.map((coord) => [coord.lat, coord.lng]);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (boundsError) {
      console.warn("Error fitting bounds:", boundsError);
    }
  }, [coordKey]);

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
        {/* Tile layer is added programmatically in useEffect */}

        {validCoords.map((coord, index) => (
          <Marker key={index} position={[coord.lat, coord.lng]}>
            {coord.label && <Popup>{coord.label}</Popup>}
          </Marker>
        ))}
      </Map>
      {tilesFailed && <TileFailureNotice />}
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
