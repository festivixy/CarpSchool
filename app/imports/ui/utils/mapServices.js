/**
 * Optimized map service utilities with debouncing, caching, and request management
 *
 * This module provides efficient access to Nominatim search and OSRM routing services
 * with automatic caching, request debouncing, and deduplication.
 */

// Cache for storing search results
const searchCache = new Map();
const routeCache = new Map();

// Pending requests to prevent duplicates
const pendingSearchRequests = new Map();
const pendingRouteRequests = new Map();

// Active AbortControllers for canceling requests
const activeSearchControllers = new Map();
const activeRouteControllers = new Map();

// Cache configuration
const CACHE_CONFIG = {
  SEARCH_TTL: 5 * 60 * 1000, // 5 minutes
  ROUTE_TTL: 15 * 60 * 1000, // 15 minutes
  MAX_CACHE_SIZE: 100,
};

/**
 * Simple debounce utility
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
};

/**
 * Cache management utilities
 */
const CacheManager = {
  /**
   * Get item from cache if not expired
   */
  get(cache, key, ttl) {
    const item = cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > ttl;
    if (isExpired) {
      cache.delete(key);
      return null;
    }

    return item.data;
  },

  /**
   * Set item in cache with timestamp
   */
  set(cache, key, data, maxSize = CACHE_CONFIG.MAX_CACHE_SIZE) {
    // Implement simple LRU by removing oldest entries
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  /**
   * Clear expired entries from cache
   */
  cleanup(cache, ttl) {
    const now = Date.now();
    for (const [key, item] of cache.entries()) { // eslint-disable-line no-restricted-syntax
      if (now - item.timestamp > ttl) {
        cache.delete(key);
      }
    }
  },
};

/**
 * Optimized Nominatim search with caching and debouncing
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @returns {Promise<Array>} - Search results
 */
const searchLocations = async (query, options = {}) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();
  const cacheKey = `${normalizedQuery}:${JSON.stringify(options)}`;

  // Check cache first
  const cachedResult = CacheManager.get(searchCache, cacheKey, CACHE_CONFIG.SEARCH_TTL);
  if (cachedResult) {
    return cachedResult;
  }

  // Cancel any existing search for this query (for rapid typing)
  if (activeSearchControllers.has(normalizedQuery)) {
    activeSearchControllers.get(normalizedQuery).abort();
    activeSearchControllers.delete(normalizedQuery);
  }

  // Check if request is already pending
  if (pendingSearchRequests.has(cacheKey)) {
    return pendingSearchRequests.get(cacheKey);
  }

  // Create abort controller for this request
  const controller = new AbortController();
  activeSearchControllers.set(normalizedQuery, controller);

  // Create new request
  const requestPromise = (async () => {
    try {
      const {
        limit = 5,
        countrycodes = "ca",
        addressdetails = 1,
      } = options;

      const searchUrl = new URL("https://nominatim.carp.school/search");
      searchUrl.searchParams.set("q", query);
      searchUrl.searchParams.set("format", "json");
      searchUrl.searchParams.set("limit", limit.toString());
      searchUrl.searchParams.set("addressdetails", addressdetails.toString());
      searchUrl.searchParams.set("countrycodes", countrycodes);

      console.log("[MapServices] Fetching search results for:", normalizedQuery);

      // Use fetch with timeout and cancellation (3 second timeout for search)
      const response = await fetchWithTimeout(searchUrl.toString(), 3000, controller);

      if (!response.ok) {
        throw new Error(`Nominatim search failed: ${response.status}`);
      }

      const results = await response.json();

      // Ensure results is an array before mapping
      if (!Array.isArray(results)) {
        console.warn("[MapServices] Nominatim returned non-array response:", results);
        return [];
      }

      // Format results
      const formattedResults = results.map((result) => ({
        id: result.place_id,
        display_name: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        importance: result.importance,
      }));

      // Cache the results
      CacheManager.set(searchCache, cacheKey, formattedResults);

      return formattedResults;
    } catch (error) {
      console.error("[MapServices] Search error:", error);
      throw error;
    } finally {
      // Remove from pending requests and cleanup controller
      pendingSearchRequests.delete(cacheKey);
      activeSearchControllers.delete(normalizedQuery);
    }
  })();

  // Store pending request
  pendingSearchRequests.set(cacheKey, requestPromise);

  return requestPromise;
};

/**
 * Debounced search function with 300ms delay
 */
export const debouncedSearch = debounce(searchLocations, 300);

/**
 * Create a fetch request with timeout and cancellation
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @param {AbortController} externalController - Optional external controller for cancellation
 * @returns {Promise} - Fetch promise with timeout
 */
const fetchWithTimeout = (url, timeout = 10000, externalController = null) => {
  const controller = externalController || new AbortController();
  const signal = controller.signal;

  // Set up timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  return fetch(url, { signal })
    .then(response => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch(error => {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    });
};

/**
 * Optimized OSRM routing with caching and timeout handling
 * @param {object} startCoord - Start coordinates {lat, lng}
 * @param {object} endCoord - End coordinates {lat, lng}
 * @param {object} options - Routing options
 * @param {boolean} options.useWorker - Whether to use Web Worker for heavy calculations
 * @returns {Promise<object>} - Route data
 */
export const getRoute = async (startCoord, endCoord, options = {}) => {
  if (!startCoord || !endCoord) {
    throw new Error("Start and end coordinates are required");
  }

  // Create cache key from coordinates (rounded to reduce cache size)
  const startKey = `${startCoord.lat.toFixed(4)},${startCoord.lng.toFixed(4)}`;
  const endKey = `${endCoord.lat.toFixed(4)},${endCoord.lng.toFixed(4)}`;
  const cacheKey = `${startKey}-${endKey}:${JSON.stringify(options)}`;

  // Check cache first
  const cachedRoute = CacheManager.get(routeCache, cacheKey, CACHE_CONFIG.ROUTE_TTL);
  if (cachedRoute) {
    console.log("[MapServices] Using cached route");
    return cachedRoute;
  }

  // Check if request is already pending
  if (pendingRouteRequests.has(cacheKey)) {
    return pendingRouteRequests.get(cacheKey);
  }

  // Create new request with timeout handling
  const requestPromise = (async () => {
    try {
      const { service = "driving", timeout = 3000, useWorker = false } = options; // Reduced to 3 seconds

      // Use Web Worker for heavy calculations if requested
      if (useWorker && typeof Worker !== "undefined") {
        try {
          const { calculateRouteInWorker } = await import("./mapWorker");
          const workerResult = await calculateRouteInWorker(startCoord, endCoord, { timeout });

          // Cache the result
          CacheManager.set(routeCache, cacheKey, workerResult);

          return workerResult;
        } catch (workerError) {
          console.warn("[MapServices] Worker route calculation failed, using main thread:", workerError);
          // Continue with main thread calculation
        }
      }

      // Use core route calculation
      const { calculateCoreRoute } = await import("./mapCore");
      console.log("[MapServices] Fetching route from OSRM with timeout:", timeout);

      const routeData = await calculateCoreRoute(startCoord, endCoord, { service, timeout });

      // Add service identifier and convert units to match existing format
      const formattedResult = {
        geometry: routeData.geometry,
        distance: routeData.distance * 1000, // Convert back to meters for compatibility
        duration: routeData.duration * 60, // Convert back to seconds for compatibility
        service: "OSRM",
      };

      // Cache the route
      CacheManager.set(routeCache, cacheKey, formattedResult);

      return formattedResult;
    } catch (error) {
      console.error("[MapServices] Route error:", error);

      // Fallback to straight line if routing fails or times out
      const straightLineRoute = createStraightLineRoute(startCoord, endCoord);
      console.warn("[MapServices] Using straight line fallback due to:", error.message);
      return straightLineRoute;
    } finally {
      // Remove from pending requests
      pendingRouteRequests.delete(cacheKey);
    }
  })();

  // Store pending request
  pendingRouteRequests.set(cacheKey, requestPromise);

  return requestPromise;
};

/**
 * Create straight line route as fallback
 * @param {object} start - Start coordinates
 * @param {object} end - End coordinates
 * @returns {object} - Straight line route data
 */
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

/**
 * Calculate straight-line distance between two points (Haversine formula)
 * @param {object} start - Start coordinates {lat, lng}
 * @param {object} end - End coordinates {lat, lng}
 * @returns {number} - Distance in kilometers
 */
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

/**
 * Cache management utilities for external use
 */
export const MapServiceCache = {
  /**
   * Clear all caches and cancel pending requests
   */
  clearAll() {
    // Cancel all active requests
    for (const controller of activeSearchControllers.values()) { // eslint-disable-line no-restricted-syntax
      controller.abort();
    }
    for (const controller of activeRouteControllers.values()) { // eslint-disable-line no-restricted-syntax
      controller.abort();
    }

    // Clear all caches and maps
    searchCache.clear();
    routeCache.clear();
    pendingSearchRequests.clear();
    pendingRouteRequests.clear();
    activeSearchControllers.clear();
    activeRouteControllers.clear();

    console.log("[MapServices] All caches cleared and requests canceled");
  },

  /**
   * Clear expired entries from all caches
   */
  cleanup() {
    CacheManager.cleanup(searchCache, CACHE_CONFIG.SEARCH_TTL);
    CacheManager.cleanup(routeCache, CACHE_CONFIG.ROUTE_TTL);
    console.log("[MapServices] Cache cleanup completed");
  },

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      searchCache: {
        size: searchCache.size,
        pendingRequests: pendingSearchRequests.size,
      },
      routeCache: {
        size: routeCache.size,
        pendingRequests: pendingRouteRequests.size,
      },
    };
  },
};

/**
 * Exported search function (uses debounced version by default)
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @returns {Promise<Array>} - Search results
 */
export const searchLocation = debouncedSearch;

/**
 * Non-debounced search for immediate results (when needed)
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @returns {Promise<Array>} - Search results
 */
export const searchLocationImmediate = searchLocations;

// Periodic cache cleanup (every 10 minutes)
if (typeof window !== "undefined") {
  setInterval(() => {
    MapServiceCache.cleanup();
  }, 10 * 60 * 1000);
}
