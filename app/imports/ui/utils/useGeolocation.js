import { useCallback, useRef, useState } from "react";

const isSecureContext = () => {
  if (typeof window === "undefined") return false;
  const { protocol, hostname } = window.location;
  return protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1";
};

const DEFAULT_OPTIONS = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 };

/**
 * Thin, retryable wrapper over the browser Geolocation API.
 *
 * `status` is one of "idle" | "locating" | "granted" | "denied" | "timeout"
 * | "unavailable" | "unsupported". Only "denied" is terminal -- every other
 * non-granted status can be retried by calling `request()` again (better GPS
 * signal, a permission prompt reappearing, etc).
 */
export const useGeolocation = (options = {}) => {
  const [status, setStatus] = useState("idle");
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      setError(new Error("Geolocation is not supported by this browser."));
      return;
    }
    if (!isSecureContext()) {
      setStatus("unavailable");
      setError(new Error("Location services require a secure connection (HTTPS)."));
      return;
    }

    setStatus("locating");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      (err) => {
        if (err && err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
        } else if (err && err.code === err.TIMEOUT) {
          setStatus("timeout");
        } else {
          setStatus("unavailable");
        }
        setError(err instanceof Error ? err : new Error(err?.message || "Could not determine location."));
      },
      { ...DEFAULT_OPTIONS, ...optionsRef.current },
    );
  }, []);

  return { status, position, error, request };
};

export default useGeolocation;
