import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AsyncTileLayer } from "../../utils/AsyncTileLayer";
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
 * Interactive map picker component that allows users to click on a map to select coordinates
 * Uses AsyncTileLayer with the tileserver proxy for non-blocking tile loading
 */
const InteractiveMapPicker = ({
  initialLat = 49.345196,
  initialLng = -123.149805,
  onLocationSelect,
  selectedLocation,
  height = "400px",
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    lat: selectedLocation?.lat || initialLat,
    lng: selectedLocation?.lng || initialLng,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Clear messages
  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
    // Clear any pending success message timeout
    if (showSuccess.currentTimeout) {
      clearTimeout(showSuccess.currentTimeout);
      showSuccess.currentTimeout = null;
    }
  };

  // Show error message
  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage("");
  };

  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage("");
    // Auto-dismiss success messages after 5 seconds
    const dismissTimeout = setTimeout(() => {
      setSuccessMessage("");
    }, 5000);

    // Store the timeout reference for potential cleanup
    showSuccess.currentTimeout = dismissTimeout;
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current, {
      center: [currentLocation.lat, currentLocation.lng],
      zoom: 13,
      zoomControl: true,
    });

    // Add async tile layer using our tileserver for better performance
    const tileUrl = "https://tileserver.carp.school/styles/OSM%20OpenMapTiles/{z}/{x}/{y}.png";
    const asyncTileLayer = new AsyncTileLayer(tileUrl, {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
      tileSize: 256,
    });
    asyncTileLayer.addTo(map);

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
      if (onLocationSelect) {
        onLocationSelect(newLocation);
      }
    });

    // Handle map clicks
    map.on("click", (e) => {
      const newLocation = {
        lat: parseFloat(e.latlng.lat.toFixed(6)),
        lng: parseFloat(e.latlng.lng.toFixed(6)),
      };
      marker.setLatLng([newLocation.lat, newLocation.lng]);
      setCurrentLocation(newLocation);
      if (onLocationSelect) {
        onLocationSelect(newLocation);
      }
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Cleanup function
    return () => { // eslint-disable-line consistent-return
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

      // Clear any pending success message timeout
      if (showSuccess.currentTimeout) {
        clearTimeout(showSuccess.currentTimeout);
        showSuccess.currentTimeout = null;
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

  // Fallback IP-based location detection
  const tryIpBasedLocation = async () => {
    try {
      // Use a simple IP geolocation service
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) throw new Error("IP location service unavailable");

      const data = await response.json();
      if (data.latitude && data.longitude) {
        const newLocation = {
          lat: parseFloat(data.latitude.toFixed(6)),
          lng: parseFloat(data.longitude.toFixed(6)),
        };

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLocation.lat, newLocation.lng], 10); // Lower zoom for IP location
          markerRef.current.setLatLng([newLocation.lat, newLocation.lng]);
          setCurrentLocation(newLocation);
          if (onLocationSelect) {
            onLocationSelect(newLocation);
          }

          // Show success message
          const successTimeout = setTimeout(() => {
            showSuccess(
              `Located you in ${data.city || "your area"} using network location. ` +
              "This is less precise than GPS - you may want to refine the marker position manually.",
            );
          }, 500);

          // Store timeout for potential cleanup
          return () => clearTimeout(successTimeout);
        }
      }
    } catch (ipError) {
      console.warn("IP-based location failed:", ipError);
      // Silent fallback failure - user already got the main error message
    }
  };

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

    // Detect Firefox browser
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
            if (onLocationSelect) {
              onLocationSelect(newLocation);
            }
          }
        } catch (error) {
          console.warn("Error setting location:", error);
          showError("Error processing your location. Please try again.");
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);

        let geoErrorMessage;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            geoErrorMessage = "Location access was denied. Please enable location permissions in your " +
              "browser settings and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            if (isFirefox) {
              geoErrorMessage = "Firefox couldn't determine your location. This might be due to:\n\n" +
                "• macOS Location Services not enabled for Firefox\n" +
                "• Firefox privacy settings blocking location\n" +
                "• Network connectivity issues\n\n" +
                "Try:\n" +
                "1. System Preferences → Security & Privacy → Location Services → Enable for Firefox\n" +
                "2. Firefox Settings → Privacy & Security → Permissions → Location → Allow\n" +
                "3. Or manually click on the map to set your location";
            } else {
              geoErrorMessage = "Location information is unavailable. Please check your device's location settings.";
            }
            break;
          case error.TIMEOUT:
            geoErrorMessage = "Location request timed out. Please try again or click on the map to " +
              "manually set your location.";
            break;
          default:
            geoErrorMessage = `An unknown error occurred while retrieving your location (Error: ${error.message}). ` +
              "Please click on the map to manually set your location.";
            break;
        }

        showError(geoErrorMessage);

        // For Firefox, try fallback IP-based location as last resort
        if (isFirefox && error.code === error.POSITION_UNAVAILABLE) {
          tryIpBasedLocation();
        }
      },
      {
        enableHighAccuracy: !isFirefox, // Firefox often fails with high accuracy on macOS
        timeout: isFirefox ? 15000 : 10000, // Longer timeout for Firefox
        maximumAge: isFirefox ? 600000 : 300000, // 10 minutes cache for Firefox, 5 for others
      },
    );
  };

  // Search for locations using optimized map service
  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      // Use optimized map service with debouncing and caching
      const { searchLocation: optimizedSearch } = await import("../../utils/mapServices");
      const results = await optimizedSearch(searchQuery, {
        limit: 5,
        countrycodes: 'ca',
        addressdetails: 1,
      });

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      showError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
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
        if (onLocationSelect) {
          onLocationSelect(newLocation);
        }
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
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // Trigger optimized search automatically as user types
            searchLocation();
          }}
          onKeyPress={(e) => e.key === "Enter" && searchLocation()}
        />
        <SearchButton onClick={searchLocation} disabled={isSearching}>
          {isSearching ? "🔄" : "🔍"}
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

        <MapControls>
          <ControlButton onClick={zoomIn} title="Zoom in">
            ➕
          </ControlButton>
          <ControlButton onClick={zoomOut} title="Zoom out">
            ➖
          </ControlButton>
          <ControlButton
            onClick={centerOnLocation}
            title="Center on my location"
          >
            📍
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
        💡 Click anywhere on the map or drag the marker to select a location.
        You can also search for places using the search box above.
      </HelpText>
    </MapContainer>
  );
};

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
