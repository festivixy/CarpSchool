import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTileUrlTemplate } from "../utils/mapConfig";
import { installDefaultIcon, attachTileErrorTracking, TileFailureNotice } from "../utils/leafletIcons";
import {
  RouteMapContainer,
  RouteMapWrapper,
  RefreshButton,
  MapViewContainer,
} from "../mobile/styles/RouteMapView";

installDefaultIcon();

const isValidCoord = (coord) => Boolean(coord) &&
  Number.isFinite(coord.lat) && Number.isFinite(coord.lng) &&
  Math.abs(coord.lat) <= 90 && Math.abs(coord.lng) <= 180;

/**
 * Production-ready RouteMapView component for displaying routes between two points
 * Automatically finds and displays routes on component load
 */
const RouteMapView = ({
  startCoord,
  endCoord,
  liveLocations = [],
  height = "400px",
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const liveMarkersRef = useRef({});
  const routeGenerationRef = useRef(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);

  const validStart = isValidCoord(startCoord) ? startCoord : null;
  const validEnd = isValidCoord(endCoord) ? endCoord : null;

  // Calculate map center based on start and end coordinates
  const getMapCenter = () => {
    if (!validStart || !validEnd) {
      return [49.345196, -123.149805]; // Default to Vancouver
    }
    const centerLat = (validStart.lat + validEnd.lat) / 2;
    const centerLng = (validStart.lng + validEnd.lng) / 2;
    return [centerLat, centerLng];
  };

  // Calculate appropriate zoom level based on coordinate spread
  const getZoomLevel = () => {
    if (!validStart || !validEnd) {
      return 13;
    }
    const latSpread = Math.abs(validStart.lat - validEnd.lat);
    const lngSpread = Math.abs(validStart.lng - validEnd.lng);
    const maxSpread = Math.max(latSpread, lngSpread);

    if (maxSpread > 0.2) return 9;
    if (maxSpread > 0.1) return 10;
    if (maxSpread > 0.05) return 11;
    if (maxSpread > 0.01) return 12;
    return 13;
  };

  // Get tile server URL (settings-overridable; see utils/mapConfig)
  const getTileUrl = () => getTileUrlTemplate();

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

  const createDriverIcon = () => L.divIcon({
    className: "custom-driver-marker",
    html: "<div style=\"background-color: #007bff; color: white; border-radius: 50%; " +
      "width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; " +
      "border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 16px;\"></div>",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  const createRiderIcon = () => L.divIcon({
    className: "custom-rider-marker",
    html: "<div style=\"background-color: #6c757d; color: white; border-radius: 50%; " +
      "width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; " +
      "border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 16px;\"></div>",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  // Create straight line geometry as fallback
  const createStraightLineGeometry = (start, end) => ({
      type: "LineString",
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
    });

  // Find route using optimized routing service
  const findRouteOptimized = async (start, end) => {
    try {
      // Use optimized routing service with caching
      const { getRoute } = await import("../utils/mapServices");
      const routeData = await getRoute(start, end, { service: "driving" });

      return { geometry: routeData.geometry, approximate: false };
    } catch (routingError) {
      console.warn("Optimized routing failed, using straight line:", routingError);
      // Fallback to straight line
      return { geometry: createStraightLineGeometry(start, end), approximate: true };
    }
  };

  // Find and display route (non-blocking)
  const findAndDisplayRoute = (showRefreshAnimation = false) => {
    if (!validStart || !validEnd || !mapInstanceRef.current) {
      return;
    }

    // Immediately show loading state (non-blocking UI update)
    if (showRefreshAnimation) {
      setIsRefreshing(true);
    }

    const generation = ++routeGenerationRef.current;

    // Use setTimeout to ensure UI updates immediately before starting async work
    setTimeout(async () => {
      try {
        const { geometry, approximate } = await findRouteOptimized(validStart, validEnd);

        // Ignore stale results: the component may have unmounted, or a newer
        // route request may already have started (coordinates changed again).
        if (!mapInstanceRef.current || generation !== routeGenerationRef.current) return;

        // Remove existing route
        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }

        // Add new route to map
        const routeLayer = L.geoJSON(geometry, {
          style: approximate
            ? { color: "#ffc107", weight: 4, opacity: 0.8, dashArray: "10, 5" }
            : { color: "#007bff", weight: 4, opacity: 0.8 },
        }).addTo(mapInstanceRef.current);
        if (approximate) {
          routeLayer.bindTooltip("Approximate route", { permanent: false, direction: "top" });
        }

        routeLayerRef.current = routeLayer;

        // Fit map to show entire route
        const group = new L.FeatureGroup([
          startMarkerRef.current,
          endMarkerRef.current,
          routeLayer,
        ]);
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
      } catch (error) {
        console.error("Route finding error:", error);
        // Route errors are handled gracefully by fallback in mapServices
      } finally {
        if (generation === routeGenerationRef.current && showRefreshAnimation) {
          setIsRefreshing(false);
        }
      }
    }, 0); // Immediate execution but non-blocking
  };

  // Handle refresh button click
  const handleRefresh = () => {
    findAndDisplayRoute(true);
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return undefined;

    // Initialize the map
    const map = L.map(mapRef.current, {
      center: getMapCenter(),
      zoom: getZoomLevel(),
      zoomControl: true,
    });

    // Add async tile layer
    const tileLayer = L.tileLayer(getTileUrl(), {
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
      maxZoom: 18,
      tileSize: 256,
    });
    tileLayer.addTo(map);
    const detachTileTracking = attachTileErrorTracking(tileLayer, () => setTilesFailed(true));

    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      detachTileTracking();
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

  // Update markers and route when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing markers and route
    if (startMarkerRef.current) {
      mapInstanceRef.current.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      mapInstanceRef.current.removeLayer(endMarkerRef.current);
      endMarkerRef.current = null;
    }
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    // Any in-flight route lookup for the old coordinates is now stale.
    routeGenerationRef.current += 1;

    // Add new markers if coordinates are provided
    if (validStart) {
      const startMarker = L.marker([validStart.lat, validStart.lng], {
        icon: createStartIcon(),
      }).addTo(mapInstanceRef.current);
      startMarker.bindPopup("Start Location");
      startMarkerRef.current = startMarker;
    }

    if (validEnd) {
      const endMarker = L.marker([validEnd.lat, validEnd.lng], {
        icon: createEndIcon(),
      }).addTo(mapInstanceRef.current);
      endMarker.bindPopup("End Location");
      endMarkerRef.current = endMarker;
    }

    // Update map center and zoom
    if (validStart && validEnd) {
      const center = getMapCenter();
      const zoom = getZoomLevel();
      mapInstanceRef.current.setView(center, zoom);

      // Automatically find and display route
      findAndDisplayRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCoord?.lat, startCoord?.lng, endCoord?.lat, endCoord?.lng]);

  // Update live location markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const currentMarkers = liveMarkersRef.current;
    const newMarkerIds = new Set();

    liveLocations.forEach((location) => {
      const { userId, lat, lng, role } = location;
      if (!userId || !Number.isFinite(lat) || !Number.isFinite(lng) ||
          Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return;
      }
      newMarkerIds.add(userId);

      if (currentMarkers[userId]) {
        // Update existing marker position
        currentMarkers[userId].setLatLng([lat, lng]);
      } else {
        // Create new marker
        const icon = role === "driver" ? createDriverIcon() : createRiderIcon();
        const marker = L.marker([lat, lng], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(role === "driver" ? "Driver" : "Rider");

        currentMarkers[userId] = marker;
      }
    });

    // Remove markers for users who are no longer in the list
    Object.keys(currentMarkers).forEach((userId) => {
      if (!newMarkerIds.has(userId)) {
        mapInstanceRef.current.removeLayer(currentMarkers[userId]);
        delete currentMarkers[userId];
      }
    });
  }, [liveLocations]);

  return (
    <RouteMapContainer>
      <RouteMapWrapper style={{ height }}>
        <MapViewContainer ref={mapRef} />
        {tilesFailed && <TileFailureNotice />}

        <RefreshButton
          onClick={handleRefresh}
          disabled={!validStart || !validEnd || isRefreshing}
          title="Refresh route"
        >
          <img src="/svg/refresh.svg" alt="Refresh" width="16" height="16" />
        </RefreshButton>
      </RouteMapWrapper>
    </RouteMapContainer>
  );
};

RouteMapView.propTypes = {
  startCoord: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  endCoord: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  liveLocations: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.string.isRequired,
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      role: PropTypes.string,
    })
  ),
  height: PropTypes.string,
};

export default RouteMapView;
