/**
 * Geolocation utility functions
 */

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

const formatLocation = (coords) => {
  const lat = typeof coords.latitude === "number" ? parseFloat(coords.latitude.toFixed(6)) : 0;
  const lng = typeof coords.longitude === "number" ? parseFloat(coords.longitude.toFixed(6)) : 0;
  
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Invalid location coordinates received");
  }
  
  return { lat, lng };
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

export const getCurrentLocation = async (options = {}) => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("Geolocation not supported");
  }
  
  if (!isSecure()) {
    throw new Error("Location services require HTTPS or Cordova environment");
  }

  await waitForCordova();

  const geoOptions = { ...getPlatformOptions(), ...options };

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          resolve(formatLocation(position.coords));
        } catch (err) {
          reject(err);
        }
      },
      (error) => reject(new Error(getErrorDetails(error))),
      geoOptions,
    );
  });
};

export const watchLocation = (onSuccess, onError, options = {}) => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError?.(new Error("Geolocation not supported"));
    return null;
  }
  
  if (!isSecure()) {
    onError?.(new Error("Location services require HTTPS or Cordova environment"));
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
