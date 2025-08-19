import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AsyncTileLayer } from "../utils/AsyncTileLayer";
import {
  RouteMapContainer,
  RouteMapWrapper,
  RefreshButton,
  MapViewContainer,
} from "../mobile/styles/RouteMapView";

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
 * Production-ready RouteMapView component for displaying routes between two points
 * Automatically finds and displays routes on component load
 */
const RouteMapView = ({
  startCoord,
  endCoord,
  height = "400px",
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  const getTileUrl = () => "https://tileserver.carp.school/styles/OSM%20OpenMapTiles/{z}/{x}/{y}.png";

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

  // Create straight line geometry as fallback
  const createStraightLineGeometry = (start, end) => ({
      type: "LineString",
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
    });
  // Find route using OSRM with fallback to straight line
  const findRouteOSRM = async (start, end) => {
    try {
      const baseUrl = "https://osrm.carp.school/route/v1/driving";
      const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
      const osrmUrl = `${baseUrl}/${coords}?overview=full&geometries=geojson`;
      const response = await fetch(osrmUrl);

      if (!response.ok) {
        throw new Error(`OSRM routing failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry;
      }
      throw new Error("No route found");
    } catch (routingError) {
      // Fallback to straight line
      return createStraightLineGeometry(start, end);
    }
  };

  // Find and display route
  const findAndDisplayRoute = async (showRefreshAnimation = false) => {
    if (!startCoord || !endCoord || !mapInstanceRef.current) {
      return;
    }

    if (showRefreshAnimation) {
      setIsRefreshing(true);
    }

    try {
      const geometry = await findRouteOSRM(startCoord, endCoord);

      // Remove existing route
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
      }

      // Add new route to map
      const routeLayer = L.geoJSON(geometry, {
        style: {
          color: "#007bff",
          weight: 4,
          opacity: 0.8,
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
    } catch (error) {
      console.error("Route finding error:", error);
    } finally {
      if (showRefreshAnimation) {
        setIsRefreshing(false);
      }
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    findAndDisplayRoute(true);
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

  // Update markers and route when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing markers and route
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
      startMarker.bindPopup("Start Location");
      startMarkerRef.current = startMarker;
    }

    if (endCoord) {
      const endMarker = L.marker([endCoord.lat, endCoord.lng], {
        icon: createEndIcon(),
      }).addTo(mapInstanceRef.current);
      endMarker.bindPopup("End Location");
      endMarkerRef.current = endMarker;
    }

    // Update map center and zoom
    if (startCoord && endCoord) {
      const center = getMapCenter();
      const zoom = getZoomLevel();
      mapInstanceRef.current.setView(center, zoom);

      // Automatically find and display route
      findAndDisplayRoute();
    }
  }, [startCoord, endCoord]);

  return (
    <RouteMapContainer>
      <RouteMapWrapper style={{ height }}>
        <MapViewContainer ref={mapRef} />

        <RefreshButton
          onClick={handleRefresh}
          disabled={!startCoord || !endCoord || isRefreshing}
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
  height: PropTypes.string,
};

export default RouteMapView;
