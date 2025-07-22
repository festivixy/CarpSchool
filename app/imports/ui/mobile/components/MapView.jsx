import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  MapContainer,
  MapImage,
  PriceChip,
  PriceText,
} from "../styles/MapView";

/**
 * MapView component that displays a map with price chips overlay
 * Takes latitude and longitude props for positioning
 * Optional tileServerUrl prop for self-hosted OpenMapTiles server
 */
export default function MapView({ latitude, longitude, tileServerUrl }) {
  const [mapUrl, setMapUrl] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  // Sample price data - in a real app, this would be fetched based on lat/lng
  const priceData = [
    { id: 1, price: "$199", left: 152, top: 33, selected: false },
    { id: 2, price: "$123", left: 152, top: 116, selected: true },
    { id: 3, price: "$234", left: 33, top: 59, selected: false },
    { id: 4, price: "$567", left: 23, top: 146, selected: false },
    { id: 5, price: "$345", left: 100, top: 184, selected: false },
    { id: 6, price: "$299", left: 292, top: 60, selected: false },
    { id: 7, price: "$176", left: 271, top: 153, selected: false },
  ];

  // TileServer GL static map endpoint support
  const generateTileServerGLMapUrl = (lat, lng, baseUrl) => {
    const zoom = 13;
    const width = 376;
    const height = 320;
    // Use /styles/{id}/static/{lon},{lat},{zoom}/{width}x{height}.png as per TileServer GL docs
    // Default style is "streets" unless specified in baseUrl
    let stylePath;
    // Use 'OSM OpenMapTiles' as the style name
    const styleName = "OSM OpenMapTiles";
    if (baseUrl.match(/\/styles\/[^/]+$/)) {
      stylePath = baseUrl;
    } else {
      stylePath = `${baseUrl.replace(/\/$/, "")}/styles/${encodeURIComponent(styleName)}`;
    }
    return `${stylePath}/static/${lng},${lat},${zoom}/${width}x${height}.png`;
  };

  // Update map URL whenever input changes
  useEffect(() => {
    setRetryCount(0);
    // Use /tileserver proxy route if tileServerUrl is empty or falsy
    const effectiveTileServerUrl =
      tileServerUrl && tileServerUrl.trim() !== ""
        ? tileServerUrl
        : "/tileserver";
    const url = generateTileServerGLMapUrl(
      latitude,
      longitude,
      effectiveTileServerUrl,
    );
    setMapUrl(url);
  }, [latitude, longitude, tileServerUrl]);

  // Error handler to retry loading map image
  const handleMapError = (e) => {
    const currentSrc = e.target.src;
    let nextUrl = "";
    // Use /tileserver proxy route if tileServerUrl is empty or falsy
    const effectiveTileServerUrl =
      tileServerUrl && tileServerUrl.trim() !== ""
        ? tileServerUrl
        : "/tileserver";
    if (
      effectiveTileServerUrl &&
      (currentSrc.includes(effectiveTileServerUrl) ||
        currentSrc.includes("/tileserver"))
    ) {
      nextUrl = generateTileServerGLMapUrl(
        latitude,
        longitude,
        effectiveTileServerUrl,
      );
    } else if (
      currentSrc.includes("127.0.0.1") ||
      currentSrc.includes("localhost")
    ) {
      nextUrl = generateTileServerGLMapUrl(latitude, longitude, "/tileserver");
    } else {
      nextUrl =
        "https://api.builder.io/api/v1/image/assets/TEMP/6c0d2472327d5959e89f81bdc544d6ac3f3feed8?width=752";
    }
    // Only retry up to 3 times to avoid infinite loop
    if (retryCount < 3) {
      setRetryCount(retryCount + 1);
      setMapUrl(nextUrl + `?retry=${retryCount + 1}`);
    }
  };

  return (
    <MapContainer>
      <MapImage
        src={mapUrl}
        alt={`Map view for coordinates ${latitude}, ${longitude}`}
        onError={handleMapError}
        key={mapUrl}
      />
      {priceData.map((item) => (
        <PriceChip
          key={item.id}
          selected={item.selected}
          style={{ left: `${item.left}px`, top: `${item.top}px` }}
        >
          <PriceText selected={item.selected}>{item.price}</PriceText>
        </PriceChip>
      ))}
    </MapContainer>
  );
}

MapView.propTypes = {
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  tileServerUrl: PropTypes.string, // Optional: URL to self-hosted OpenMapTiles server
};
