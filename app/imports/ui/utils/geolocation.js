/**
 * Geolocation utility functions with improved accuracy, fallbacks, and triangulation
 */

// Cache for recent positions (with timestamp)
let positionCache = null;
const CACHE_VALIDITY_MS = 30000; // 30 seconds

const isCordova = () => typeof Meteor !== "undefined" && Meteor.isCordova;
const isSecure = () => {
  if (typeof window === "undefined") return false;
  const { protocol, hostname } = window.location;
  return protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1" || isCordova();
};

const waitForCordova = () => {
  if (!isCordova() || (typeof navigator !== "undefined" && navigator.geolocation)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    if (typeof document !== "undefined") {
      const onReady = () => resolve();
      document.addEventListener("deviceready", onReady, { once: true });
      setTimeout(() => {
        document.removeEventListener("deviceready", onReady);
        resolve();
      }, 1000);
    } else {
      resolve();
    }
  });
};

const getPlatformOptions = () => {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
  const isFirefox = ua.includes("firefox");
  const isMobile = isCordova() || /mobile|android|ios|iphone|ipad/i.test(ua);
  
  return {
    enableHighAccuracy: isMobile && !isFirefox,
    timeout: isMobile ? 15000 : isFirefox ? 15000 : 10000,
    maximumAge: isMobile ? 60000 : isFirefox ? 600000 : 300000,
  };
};

const formatLocation = (coords, accuracy = null) => {
  const lat = typeof coords.latitude === "number" ? parseFloat(coords.latitude.toFixed(6)) : 0;
  const lng = typeof coords.longitude === "number" ? parseFloat(coords.longitude.toFixed(6)) : 0;
  
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Invalid location coordinates received");
  }
  
  // Validate coordinates are within valid ranges
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw new Error("Coordinates out of valid range");
  }
  
  const result = { lat, lng };
  if (accuracy !== null && Number.isFinite(accuracy)) {
    result.accuracy = accuracy;
  }
  
  return result;
};

// Calculate distance between two coordinates (Haversine formula) in meters
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Validate if a position jump is reasonable (not more than 1km per second)
const validatePositionJump = (newPos, oldPos) => {
  if (!oldPos) return true;
  const distance = calculateDistance(oldPos.lat, oldPos.lng, newPos.lat, newPos.lng);
  const timeDiff = Date.now() - (oldPos.timestamp || 0);
  const maxSpeed = 1000; // meters per second (3600 km/h - way faster than any vehicle)
  return distance / (timeDiff / 1000) <= maxSpeed;
};

// Average multiple positions for better accuracy (triangulation)
const averagePositions = (positions) => {
  if (positions.length === 0) throw new Error("No positions to average");
  if (positions.length === 1) return positions[0];
  
  // Filter out outliers using median absolute deviation
  const lats = positions.map(p => p.lat).sort((a, b) => a - b);
  const lngs = positions.map(p => p.lng).sort((a, b) => a - b);
  
  const medianLat = lats[Math.floor(lats.length / 2)];
  const medianLng = lngs[Math.floor(lngs.length / 2)];
  
  // Calculate median absolute deviation
  const latDeviations = positions.map(p => Math.abs(p.lat - medianLat));
  const lngDeviations = positions.map(p => Math.abs(p.lng - medianLng));
  const madLat = latDeviations.sort((a, b) => a - b)[Math.floor(latDeviations.length / 2)];
  const madLng = lngDeviations.sort((a, b) => a - b)[Math.floor(lngDeviations.length / 2)];
  
  // Filter positions within 2 MAD of median
  const threshold = 2;
  const filtered = positions.filter(p => 
    Math.abs(p.lat - medianLat) <= threshold * madLat &&
    Math.abs(p.lng - medianLng) <= threshold * madLng
  );
  
  if (filtered.length === 0) {
    // If all filtered out, use original positions
    filtered.push(...positions);
  }
  
  // Calculate weighted average (weight by inverse of accuracy if available)
  let totalWeight = 0;
  let weightedLat = 0;
  let weightedLng = 0;
  let minAccuracy = Infinity;
  
  filtered.forEach(pos => {
    const weight = pos.accuracy ? 1 / (pos.accuracy + 1) : 1;
    weightedLat += pos.lat * weight;
    weightedLng += pos.lng * weight;
    totalWeight += weight;
    if (pos.accuracy) minAccuracy = Math.min(minAccuracy, pos.accuracy);
  });
  
  const result = {
    lat: parseFloat((weightedLat / totalWeight).toFixed(6)),
    lng: parseFloat((weightedLng / totalWeight).toFixed(6)),
  };
  
  if (minAccuracy !== Infinity) {
    result.accuracy = minAccuracy;
  }
  
  return result;
};


const getErrorDetails = (error) => {
  const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("firefox");
  const isMobile = isCordova();
  
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return isMobile
        ? "Location permission denied. Enable location access in device Settings → Privacy → Location Services."
        : "Location access denied. Enable location permissions in browser settings and try again.";
    case error.POSITION_UNAVAILABLE:
      return isMobile
        ? "Location unavailable. Check device location settings and ensure GPS is enabled."
        : isFirefox
          ? "Firefox couldn't determine location. Enable macOS Location Services for Firefox:\nSystem Preferences → Security & Privacy → Location Services → Enable for Firefox"
          : "Location unavailable. Check device location settings.";
    case error.TIMEOUT:
      return "Location request timed out. Check GPS signal and try again.";
    default:
      return `Location error: ${error.message || "Unknown error"}`;
  }
};

// Get a single position reading
const getSinglePosition = (options, retryCount = 0) => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const location = formatLocation(
            position.coords,
            position.coords.accuracy || null
          );
          location.timestamp = Date.now();
          resolve(location);
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        // Retry on timeout with exponential backoff (up to 2 retries)
        if (error && error.code === error.TIMEOUT && retryCount < 2) {
          setTimeout(() => {
            getSinglePosition(options, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, Math.pow(2, retryCount) * 1000); // 1s, 2s dela`ys
        } else {
          reject(error);
        }
      },
      options,
    );
  });
};

export const getCurrentLocation = async (options = {}) => {
  const {
    useTriangulation = true,
    triangulationReadings = 3,
    useCache = true,
    minAccuracy = null, // Minimum accuracy in meters (null = no minimum)
    ...geoOptions
  } = options;
  
  // GPS is required for ride safety - no fallbacks allowed
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("GPS location is required for ride safety. Please enable location services on your device.");
  }
  
  if (!isSecure()) {
    throw new Error("Location services require a secure connection. Please use a secure web browser or mobile app.");
  }

  await waitForCordova();

  // Check cache first
  if (useCache && positionCache) {
    const cacheAge = Date.now() - positionCache.timestamp;
    if (cacheAge < CACHE_VALIDITY_MS) {
      // Validate cached position is still reasonable
      if (validatePositionJump(positionCache, positionCache)) {
        return { lat: positionCache.lat, lng: positionCache.lng };
      }
    }
  }

  const platformOptions = getPlatformOptions();
  const finalOptions = { ...platformOptions, ...geoOptions };

  try {
    let positions = [];
    
    // Try high accuracy first
    if (useTriangulation && triangulationReadings > 1) {
      const highAccuracyOptions = { ...finalOptions, enableHighAccuracy: true };
      
      // Collect multiple readings for triangulation
      for (let i = 0; i < triangulationReadings; i++) {
        try {
          const pos = await getSinglePosition(highAccuracyOptions);
          positions.push(pos);
          
          // Small delay between readings (except last one)
          if (i < triangulationReadings - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (err) {
          // If high accuracy fails, break and try lower accuracy
          if (err && (err.code === err.PERMISSION_DENIED || err.code === err.POSITION_UNAVAILABLE)) {
            break;
          }
          // Continue on timeout errors
        }
      }
      
      // If we got some readings, average them
      if (positions.length > 0) {
        const averaged = averagePositions(positions);
        
        // Check accuracy threshold
        if (minAccuracy === null || !averaged.accuracy || averaged.accuracy <= minAccuracy) {
          // Validate position jump
          if (!positionCache || validatePositionJump(averaged, positionCache)) {
            positionCache = { ...averaged, timestamp: Date.now() };
            return { lat: averaged.lat, lng: averaged.lng };
          }
        }
      }
    }
    
    // Fallback to single reading (or if triangulation disabled)
    const position = await getSinglePosition(finalOptions);
    
    // Check accuracy threshold
    if (minAccuracy !== null && position.accuracy && position.accuracy > minAccuracy) {
      throw new Error(`Position accuracy (${position.accuracy}m) below required threshold (${minAccuracy}m)`);
    }
    
    // Validate position jump
    if (positionCache && !validatePositionJump(position, positionCache)) {
      console.warn("Position jump detected, may be inaccurate");
    }
    
    positionCache = position;
    return { lat: position.lat, lng: position.lng };
    
  } catch (error) {
    // Try lower accuracy if high accuracy failed
    if (finalOptions.enableHighAccuracy && error && error.code !== error.PERMISSION_DENIED) {
      try {
        const lowAccuracyOptions = { ...finalOptions, enableHighAccuracy: false };
        const position = await getSinglePosition(lowAccuracyOptions);
        positionCache = position;
        return { lat: position.lat, lng: position.lng };
      } catch (lowAccuracyError) {
        // Continue to throw error - GPS is required
      }
    }
    
    // GPS is required - no fallbacks allowed for ride safety
    // Check if error has code property (geolocation error) or is a regular Error
    if (error && typeof error.code !== "undefined") {
      throw new Error(getErrorDetails(error));
    } else {
      throw error; // Re-throw regular errors as-is
    }
  }
};

export const watchLocation = (onSuccess, onError, options = {}) => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError?.(new Error("Geolocation not supported"));
    return null;
  }
  
  if (!isSecure()) {
    onError?.(new Error("Location services require a secure connection. Please use a secure web browser or mobile app."));
    return null;
  }

  const geoOptions = { ...getPlatformOptions(), ...options };
  
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      try {
        onSuccess(formatLocation(position.coords));
      } catch (err) {
        onError?.(err);
      }
    },
    (error) => onError?.(new Error(getErrorDetails(error))),
    geoOptions,
  );

  return watchId;
};

export const clearLocationWatch = (watchId) => {
  if (watchId != null && typeof navigator !== "undefined" && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};
