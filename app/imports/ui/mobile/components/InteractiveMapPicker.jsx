import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTileUrlTemplate } from "../../utils/mapConfig";
import { useDebounce, getErrorDetails } from "../../utils/geolocation";
import { installDefaultIcon, attachTileErrorTracking, TileFailureNotice } from "../../utils/leafletIcons";
import {
  MapContainer,
  MapWrapper,
  MapControls,
  ControlButton,
  LocationInfo,
  LocationLabel,
  LocationValue,
  SearchContainer,
  SearchInput,
  SearchButton,
  SearchResults,
  SearchResult,
  HelpText,
  ErrorMessage,
  SuccessMessage,
  MapViewContainer,
} from "../styles/InteractiveMapPicker";

installDefaultIcon();

const SEARCH_DEBOUNCE_MS = 600;
const MIN_REQUEST_INTERVAL_MS = 1100;

/**
 * Interactive map picker component that allows users to click on a map to select coordinates
 * Optimized with React.memo and useMemo for better performance
 */
const InteractiveMapPicker = React.memo(({
  initialLat = 49.345196,
  initialLng = -123.149805,
  onLocationSelect,
  selectedLocation,
  height = "400px",
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  // Memoize initial coordinates to prevent unnecessary recalculations
  const initialCoordinates = useMemo(() => ({
    lat: selectedLocation?.lat || initialLat,
    lng: selectedLocation?.lng || initialLng,
  }), [selectedLocation, initialLat, initialLng]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(initialCoordinates);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [tilesFailed, setTilesFailed] = useState(false);

  const successTimeoutRef = useRef(null);
  const lastRequestAtRef = useRef(0);
  const rateLimitTimerRef = useRef(null);

  // Memoize tile URL to prevent recreation on every render
  const tileUrl = useMemo(() => getTileUrlTemplate(), []);

  // Memoize location select callback to prevent unnecessary re-renders
  const handleLocationSelect = useCallback((location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  }, [onLocationSelect]);

  // Clear messages
  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  };

  // Show error message
  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage("");
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return undefined;

    // Initialize the map
    const map = L.map(mapRef.current, {
      center: [currentLocation.lat, currentLocation.lng],
      zoom: 13,
      zoomControl: true,
    });

    // Add async tile layer using our tileserver for better performance
    const tileLayer = L.tileLayer(tileUrl, {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
      tileSize: 256,
    });
    tileLayer.addTo(map);
    const detachTileTracking = attachTileErrorTracking(tileLayer, () => setTilesFailed(true));

    // Add initial marker
    const marker = L.marker([currentLocation.lat, currentLocation.lng], {
      draggable: true,
    }).addTo(map);

    // Handle marker drag
    marker.on("dragend", (e) => {
      const position = e.target.getLatLng();
      const newLocation = {
        lat: parseFloat(position.lat.toFixed(6)),
        lng: parseFloat(position.lng.toFixed(6)),
      };
      setCurrentLocation(newLocation);
      handleLocationSelect(newLocation);
    });

    // Handle map clicks -- this is the manual coordinate-entry path: click
    // (or drag the marker) anywhere to set an exact lat/lng.
    map.on("click", (e) => {
      const newLocation = {
        lat: parseFloat(e.latlng.lat.toFixed(6)),
        lng: parseFloat(e.latlng.lng.toFixed(6)),
      };
      marker.setLatLng([newLocation.lat, newLocation.lng]);
      setCurrentLocation(newLocation);
      handleLocationSelect(newLocation);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Cleanup function
    return () => { // eslint-disable-line consistent-return
      detachTileTracking();
      if (mapInstanceRef.current) {
        try {
          // Remove marker first if it exists
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
            markerRef.current = null;
          }

          // Then remove the map
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.warn("Error during map cleanup:", error);
          // Force cleanup of references even if removal fails
          mapInstanceRef.current = null;
          markerRef.current = null;
        }
      }

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
      if (rateLimitTimerRef.current) {
        clearTimeout(rateLimitTimerRef.current);
        rateLimitTimerRef.current = null;
      }
    };
  }, []);

  // Update marker position when selectedLocation prop changes
  useEffect(() => {
    if (selectedLocation && markerRef.current && mapInstanceRef.current) {
      try {
        const newPos = [selectedLocation.lat, selectedLocation.lng];
        markerRef.current.setLatLng(newPos);
        mapInstanceRef.current.setView(newPos);
        setCurrentLocation(selectedLocation);
      } catch (error) {
        console.warn("Error updating marker position:", error);
      }
    }
  }, [selectedLocation]);

  // Center map on current location
  const centerOnLocation = () => {
    clearMessages(); // Clear any existing messages

    if (!navigator.geolocation) {
      showError("Geolocation is not supported by this browser.");
      return;
    }

    if (!mapInstanceRef.current || !markerRef.current) {
      showError("Map is not ready. Please try again in a moment.");
      return;
    }

    // Check if we're on HTTPS or localhost (required for geolocation)
    if (window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1") {
      showError("Location services require a secure connection (HTTPS) to work.");
      return;
    }

    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const newLocation = {
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6)),
          };

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView(
              [newLocation.lat, newLocation.lng],
              15,
            );
            markerRef.current.setLatLng([newLocation.lat, newLocation.lng]);
            setCurrentLocation(newLocation);
            handleLocationSelect(newLocation);
          }
        } catch (error) {
          console.warn("Error setting location:", error);
          showError("Error processing your location. Please try again.");
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
        showError(getErrorDetails(error));
      },
      {
        enableHighAccuracy: !isFirefox, // Firefox often fails with high accuracy on macOS
        timeout: isFirefox ? 15000 : 10000, // Longer timeout for Firefox
        maximumAge: isFirefox ? 600000 : 300000, // 10 minutes cache for Firefox, 5 for others
      },
    );
  };

  // Run one search request against the map service and show its results.
  const performSearch = useCallback(async (queryText) => {
    lastRequestAtRef.current = Date.now();
    setIsSearching(true);
    setSearchResults([]);
    clearMessages();

    try {
      const { searchLocation: optimizedSearch } = await import("../../utils/mapServices");
      const results = await optimizedSearch(queryText, { limit: 5, addressdetails: 1 });
      setSearchResults(results);
    } catch (error) {
      // A superseded (debounced) request rejects with AbortError -- not a
      // real failure, just an older keystroke losing to a newer one.
      if (error?.name === "AbortError") return;
      console.error("Search error:", error);
      if (error.message?.includes("timeout")) {
        showError("Search timed out. Please try again.");
      } else {
        showError("Search failed. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Search as the user types, debounced and rate-limited so Nominatim never
  // sees more than one request roughly every second.
  const debouncedQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
  useEffect(() => {
    if (rateLimitTimerRef.current) {
      clearTimeout(rateLimitTimerRef.current);
      rateLimitTimerRef.current = null;
    }

    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return undefined;
    }

    const elapsed = Date.now() - lastRequestAtRef.current;
    const wait = Math.max(0, MIN_REQUEST_INTERVAL_MS - elapsed);
    setIsSearching(true);
    rateLimitTimerRef.current = setTimeout(() => performSearch(debouncedQuery), wait);

    return () => {
      if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current);
    };
  }, [debouncedQuery, performSearch]);

  // Explicit search action (Enter key / search button) -- runs immediately.
  const searchLocation = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    performSearch(searchQuery);
  };

  // Handle search result selection
  const selectSearchResult = (result) => {
    const newLocation = {
      lat: result.lat,
      lng: result.lng,
    };

    if (mapInstanceRef.current && markerRef.current) {
      try {
        mapInstanceRef.current.setView([result.lat, result.lng], 15);
        markerRef.current.setLatLng([result.lat, result.lng]);
        setCurrentLocation(newLocation);
        handleLocationSelect(newLocation);
      } catch (error) {
        console.warn("Error selecting search result:", error);
      }
    }

    setSearchResults([]);
    setSearchQuery("");
  };

  // Zoom controls
  const zoomIn = () => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.zoomIn();
      } catch (error) {
        console.warn("Error zooming in:", error);
      }
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.zoomOut();
      } catch (error) {
        console.warn("Error zooming out:", error);
      }
    }
  };

  return (
    <MapContainer>
      {errorMessage && <ErrorMessage onClick={clearMessages}>{errorMessage}</ErrorMessage>}
      {successMessage && <SuccessMessage onClick={clearMessages}>{successMessage}</SuccessMessage>}

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Address, postcode or place name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && searchLocation()}
        />
        <SearchButton onClick={searchLocation} disabled={isSearching}>
          {isSearching ? "" : ""}
        </SearchButton>
      </SearchContainer>

      {searchResults.length > 0 && (
        <SearchResults>
          {searchResults.map((result) => (
            <SearchResult
              key={result.id}
              onClick={() => selectSearchResult(result)}
            >
              {result.display_name}
            </SearchResult>
          ))}
        </SearchResults>
      )}

      <MapWrapper style={{ height }}>
        <MapViewContainer ref={mapRef} />
        {tilesFailed && <TileFailureNotice />}

        <MapControls>
          <ControlButton onClick={zoomIn} title="Zoom in">

          </ControlButton>
          <ControlButton onClick={zoomOut} title="Zoom out">

          </ControlButton>
          <ControlButton
            onClick={centerOnLocation}
            title="Center on my location"
          >

          </ControlButton>
        </MapControls>
      </MapWrapper>

      <LocationInfo>
        <LocationLabel>Selected coordinates:</LocationLabel>
        <LocationValue>
          {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
        </LocationValue>
      </LocationInfo>

      <HelpText>
        Click anywhere on the map or drag the marker to select a location.
        You can also search for places using the search box above.
      </HelpText>
    </MapContainer>
  );
}, (prevProps, nextProps) =>
  // Custom comparison for better memoization performance
   (
    prevProps.initialLat === nextProps.initialLat &&
    prevProps.initialLng === nextProps.initialLng &&
    prevProps.height === nextProps.height &&
    prevProps.selectedLocation?.lat === nextProps.selectedLocation?.lat &&
    prevProps.selectedLocation?.lng === nextProps.selectedLocation?.lng &&
    prevProps.onLocationSelect === nextProps.onLocationSelect
  ));

InteractiveMapPicker.propTypes = {
  initialLat: PropTypes.number,
  initialLng: PropTypes.number,
  onLocationSelect: PropTypes.func,
  selectedLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  height: PropTypes.string,
};

export default InteractiveMapPicker;
