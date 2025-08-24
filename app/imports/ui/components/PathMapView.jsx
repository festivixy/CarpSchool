import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AsyncTileLayer } from "../utils/AsyncTileLayer";
import {
  MapContainer,
  MapWrapper,
  RouteInfo,
  RouteLabel,
  RouteValue,
  ControlsContainer,
  ControlButton,
  ErrorMessage,
  LoadingMessage,
  MapViewContainer,
} from "../mobile/styles/PathMapView";

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/**
 * PathMapView component that displays a route between two coordinate points
 * Uses Nominatim proxy server to find paths and displays them on the map
 * Takes two coordinate inputs and shows the route path between them
 */
const PathMapView = ({
  startCoord,
  endCoord,
  tileServerUrl,
  height = "400px",
  routingService = "osrm", // osrm, graphhopper, or straight-line
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [routeData, setRouteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate map center based on start and end coordinates
  const getMapCenter = () => {
    if (!startCoord || !endCoord) {
      return [49.345196, -123.149805]; // Default to Vancouver
    }

    const centerLat = (startCoord.lat + endCoord.lat) / 2;
    const centerLng = (startCoord.lng + endCoord.lng) / 2;
    return [centerLat, centerLng];
  };

  // Calculate appropriate zoom level based on coordinate spread
  const getZoomLevel = () => {
    if (!startCoord || !endCoord) {
      return 13;
    }

    const latSpread = Math.abs(startCoord.lat - endCoord.lat);
    const lngSpread = Math.abs(startCoord.lng - endCoord.lng);
    const maxSpread = Math.max(latSpread, lngSpread);

    if (maxSpread > 0.2) return 9;
    if (maxSpread > 0.1) return 10;
    if (maxSpread > 0.05) return 11;
    if (maxSpread > 0.01) return 12;
    return 13;
  };

  // Get tile server URL
  const getTileUrl = () => {
    const effectiveTileServerUrl =
      tileServerUrl && tileServerUrl.trim() !== ""
        ? tileServerUrl
        : "https://tileserver.carp.school";

    return `${effectiveTileServerUrl}/styles/OSM%20OpenMapTiles/{z}/{x}/{y}.png`;
  };

  // Create custom markers for start and end points
  const createStartIcon = () => L.divIcon({
      className: "custom-start-marker",
      html: "<div style=\"background-color: #28a745; color: white; border-radius: 50%; " +
        "width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; " +
        "border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: bold; " +
        "font-size: 14px;\">A</div>",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

  const createEndIcon = () => L.divIcon({
      className: "custom-end-marker",
      html: "<div style=\"background-color: #dc3545; color: white; border-radius: 50%; " +
        "width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; " +
        "border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: bold; " +
        "font-size: 14px;\">B</div>",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

  // Find route using optimized routing service
  const findRouteOptimized = async (start, end) => {
    try {
      // Use optimized routing service with caching
      const { getRoute } = await import("../utils/mapServices");
      const routeData = await getRoute(start, end, { service: "driving" });

      return {
        geometry: routeData.geometry,
        distance: routeData.distance,
        duration: routeData.duration,
        service: routeData.service,
      };
    } catch (routingError) {
      console.error("Optimized routing error:", routingError);
      throw routingError;
    }
  };

  // Calculate straight-line distance between two points (Haversine formula)
  const calculateDistance = (start, end) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((end.lat - start.lat) * Math.PI) / 180;
    const dLng = ((end.lng - start.lng) * Math.PI) / 180;
    const a =
      (Math.sin(dLat / 2) * Math.sin(dLat / 2)) +
      (Math.cos((start.lat * Math.PI) / 180) * Math.cos((end.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2));
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fallback: create straight line route
  const createStraightLineRoute = (start, end) => {
    const distance = calculateDistance(start, end);
    return {
      geometry: {
        type: "LineString",
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
      },
      distance: distance * 1000, // convert km to meters
      duration: (distance / 50) * 3600, // assume 50 km/h average speed
      service: "Straight Line",
    };
  };

  // Format distance for display
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
      return `${(meters / 1000).toFixed(1)} km`;

  };

  // Format duration for display
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
      return `${minutes}m`;

  };

  // Find and display route (non-blocking)
  const findRoute = () => {
    if (!startCoord || !endCoord) {
      setError("Both start and end coordinates are required");
      return;
    }

    // Immediately show loading state (non-blocking UI update)
    setIsLoading(true);
    setError(null);

    // Use setTimeout to ensure UI updates immediately before starting async work
    setTimeout(async () => {
      try {
        let route;

        if (routingService === "osrm") {
          try {
            route = await findRouteOptimized(startCoord, endCoord);
          } catch (routingError) {
            console.warn("Optimized routing failed, using fallback:", routingError);
            if (routingError.message.includes("timeout")) {
              setError("Route calculation timed out, showing direct path");
            }
            route = createStraightLineRoute(startCoord, endCoord);
          }
        } else {
          // Default to straight line
          route = createStraightLineRoute(startCoord, endCoord);
        }

        setRouteData(route);

        // Add route to map
        if (mapInstanceRef.current && routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }

        if (mapInstanceRef.current) {
          const routeLayer = L.geoJSON(route.geometry, {
            style: {
              color: route.service === "Straight Line" ? "#ffc107" : "#007bff",
              weight: 4,
              opacity: 0.8,
              dashArray: route.service === "Straight Line" ? "10, 5" : null,
            },
          }).addTo(mapInstanceRef.current);

          routeLayerRef.current = routeLayer;

          // Fit map to show entire route
          const group = new L.FeatureGroup([
            startMarkerRef.current,
            endMarkerRef.current,
            routeLayer,
          ]);
          mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
      } catch (routeError) {
        console.error("Route finding error:", routeError);
        if (routeError.message.includes("timeout")) {
          setError("Route calculation timed out. Please try again.");
        } else {
          setError(`Route finding failed: ${routeError.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    }, 0); // Immediate execution but non-blocking
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current, {
      center: getMapCenter(),
      zoom: getZoomLevel(),
      zoomControl: true,
    });

    // Add async tile layer
    const asyncTileLayer = new AsyncTileLayer(getTileUrl(), {
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
      maxZoom: 18,
      tileSize: 256,
    });
    asyncTileLayer.addTo(map);

    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn("Error removing map instance:", error);
        } finally {
          mapInstanceRef.current = null;
          startMarkerRef.current = null;
          endMarkerRef.current = null;
          routeLayerRef.current = null;
        }
      }
    };
  }, []);

  // Update markers when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing markers
    if (startMarkerRef.current) {
      mapInstanceRef.current.removeLayer(startMarkerRef.current);
    }
    if (endMarkerRef.current) {
      mapInstanceRef.current.removeLayer(endMarkerRef.current);
    }
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Add new markers if coordinates are provided
    if (startCoord) {
      const startMarker = L.marker([startCoord.lat, startCoord.lng], {
        icon: createStartIcon(),
      }).addTo(mapInstanceRef.current);
      startMarker.bindPopup(`Start: ${startCoord.lat.toFixed(6)}, ${startCoord.lng.toFixed(6)}`);
      startMarkerRef.current = startMarker;
    }

    if (endCoord) {
      const endMarker = L.marker([endCoord.lat, endCoord.lng], {
        icon: createEndIcon(),
      }).addTo(mapInstanceRef.current);
      endMarker.bindPopup(`End: ${endCoord.lat.toFixed(6)}, ${endCoord.lng.toFixed(6)}`);
      endMarkerRef.current = endMarker;
    }

    // Reset route data when coordinates change
    setRouteData(null);
    setError(null);

    // Update map center and zoom
    if (startCoord && endCoord) {
      const center = getMapCenter();
      const zoom = getZoomLevel();
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [startCoord, endCoord, tileServerUrl]);

  // Clear route
  const clearRoute = () => {
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    setRouteData(null);
    setError(null);
  };

  return (
    <MapContainer>
      <MapWrapper style={{ height }}>
        <MapViewContainer ref={mapRef} />

        <ControlsContainer>
          <ControlButton
            onClick={findRoute}
            disabled={!startCoord || !endCoord || isLoading}
            title="Find route between points"
          >
            {isLoading ? "🔄" : "🗺️"}
          </ControlButton>
          <ControlButton
            onClick={clearRoute}
            disabled={!routeData}
            title="Clear route"
          >
            🗑️
          </ControlButton>
        </ControlsContainer>
      </MapWrapper>

      {isLoading && (
        <LoadingMessage>
          Finding route...
        </LoadingMessage>
      )}

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {routeData && (
        <RouteInfo>
          <RouteLabel>Route found ({routeData.service}):</RouteLabel>
          <RouteValue>
            Distance: {formatDistance(routeData.distance)} |
            Duration: {formatDuration(routeData.duration)}
          </RouteValue>
          {routeData.service === "Straight Line" && (
            <RouteValue style={{ fontSize: "12px", color: "#ffc107" }}>
              ⚠️ Showing straight line - actual route may differ
            </RouteValue>
          )}
        </RouteInfo>
      )}

      {startCoord && endCoord && !routeData && !isLoading && !error && (
        <RouteInfo>
          <RouteLabel>Ready to find route</RouteLabel>
          <RouteValue>
            From: {startCoord.lat.toFixed(6)}, {startCoord.lng.toFixed(6)}<br/>
            To: {endCoord.lat.toFixed(6)}, {endCoord.lng.toFixed(6)}
          </RouteValue>
        </RouteInfo>
      )}
    </MapContainer>
  );
};

PathMapView.propTypes = {
  startCoord: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  endCoord: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  tileServerUrl: PropTypes.string,
  height: PropTypes.string,
  routingService: PropTypes.oneOf(["osrm", "graphhopper", "straight-line"]),
};

export default PathMapView;
