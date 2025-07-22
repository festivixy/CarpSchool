import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
 * Uses the tileserver proxy for map tiles
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

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current, {
      center: [currentLocation.lat, currentLocation.lng],
      zoom: 13,
      zoomControl: true,
    });

    // Add custom tile layer using our tileserver proxy
    L.tileLayer("/tileserver/styles/OSM%20OpenMapTiles/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
      tileSize: 256,
    }).addTo(map);

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
      onLocationSelect?.(newLocation);
    });

    // Handle map clicks
    map.on("click", (e) => {
      const newLocation = {
        lat: parseFloat(e.latlng.lat.toFixed(6)),
        lng: parseFloat(e.latlng.lng.toFixed(6)),
      };
      marker.setLatLng([newLocation.lat, newLocation.lng]);
      setCurrentLocation(newLocation);
      onLocationSelect?.(newLocation);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position when selectedLocation prop changes
  useEffect(() => {
    if (selectedLocation && markerRef.current && mapInstanceRef.current) {
      const newPos = [selectedLocation.lat, selectedLocation.lng];
      markerRef.current.setLatLng(newPos);
      mapInstanceRef.current.setView(newPos);
      setCurrentLocation(selectedLocation);
    }
  }, [selectedLocation]);

  // Center map on current location
  const centerOnLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6)),
          };
          mapInstanceRef.current.setView(
            [newLocation.lat, newLocation.lng],
            15,
          );
          markerRef.current.setLatLng([newLocation.lat, newLocation.lng]);
          setCurrentLocation(newLocation);
          onLocationSelect?.(newLocation);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          alert(
            "Could not get your current location. Please check your browser permissions.",
          );
        },
      );
    }
  };

  // Search for locations using Nominatim (OpenStreetMap geocoding)
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery,
        )}&format=json&limit=5&addressdetails=1`,
      );
      const results = await response.json();

      const formattedResults = results.map((result) => ({
        id: result.place_id,
        display_name: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      }));

      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
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
      mapInstanceRef.current.setView([result.lat, result.lng], 15);
      markerRef.current.setLatLng([result.lat, result.lng]);
      setCurrentLocation(newLocation);
      onLocationSelect?.(newLocation);
    }

    setSearchResults([]);
    setSearchQuery("");
  };

  // Zoom controls
  const zoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const zoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <MapContainer>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

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
