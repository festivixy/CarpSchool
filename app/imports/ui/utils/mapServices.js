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
    for (const [key, item] of cache.entries()) {
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

  // Check if request is already pending
  if (pendingSearchRequests.has(cacheKey)) {
    return pendingSearchRequests.get(cacheKey);
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const {
        limit = 5,
        countrycodes = 'ca',
        addressdetails = 1,
      } = options;

      const searchUrl = new URL('https://nominatim.carp.school/search');
      searchUrl.searchParams.set('q', query);
      searchUrl.searchParams.set('format', 'json');
      searchUrl.searchParams.set('limit', limit.toString());
      searchUrl.searchParams.set('addressdetails', addressdetails.toString());
      searchUrl.searchParams.set('countrycodes', countrycodes);

      console.log('[MapServices] Fetching search results for:', normalizedQuery);
      const response = await fetch(searchUrl.toString());

      if (!response.ok) {
        throw new Error(`Nominatim search failed: ${response.status}`);
      }

      const results = await response.json();

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
      console.error('[MapServices] Search error:', error);
      throw error;
    } finally {
      // Remove from pending requests
      pendingSearchRequests.delete(cacheKey);
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
 * Optimized OSRM routing with caching
 * @param {object} startCoord - Start coordinates {lat, lng}
 * @param {object} endCoord - End coordinates {lat, lng}
 * @param {object} options - Routing options
 * @returns {Promise<object>} - Route data
 */
export const getRoute = async (startCoord, endCoord, options = {}) => {
  if (!startCoord || !endCoord) {
    throw new Error('Start and end coordinates are required');
  }

  // Create cache key from coordinates (rounded to reduce cache size)
  const startKey = `${startCoord.lat.toFixed(4)},${startCoord.lng.toFixed(4)}`;
  const endKey = `${endCoord.lat.toFixed(4)},${endCoord.lng.toFixed(4)}`;
  const cacheKey = `${startKey}-${endKey}:${JSON.stringify(options)}`;

  // Check cache first
  const cachedRoute = CacheManager.get(routeCache, cacheKey, CACHE_CONFIG.ROUTE_TTL);
  if (cachedRoute) {
    console.log('[MapServices] Using cached route');
    return cachedRoute;
  }

  // Check if request is already pending
  if (pendingRouteRequests.has(cacheKey)) {
    return pendingRouteRequests.get(cacheKey);
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const { service = 'driving' } = options;
      
      const baseUrl = 'https://osrm.carp.school/route/v1';
      const coords = `${startCoord.lng},${startCoord.lat};${endCoord.lng},${endCoord.lat}`;
      const routeUrl = `${baseUrl}/${service}/${coords}?overview=full&geometries=geojson`;

      console.log('[MapServices] Fetching route from OSRM');
      const response = await fetch(routeUrl);

      if (!response.ok) {
        throw new Error(`OSRM routing failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeData = {
          geometry: route.geometry,
          distance: route.distance, // meters
          duration: route.duration, // seconds
          service: 'OSRM',
        };

        // Cache the route
        CacheManager.set(routeCache, cacheKey, routeData);

        return routeData;
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('[MapServices] Route error:', error);
      
      // Fallback to straight line if routing fails
      const straightLineRoute = createStraightLineRoute(startCoord, endCoord);
      console.warn('[MapServices] Using straight line fallback');
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
      type: 'LineString',
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
    },
    distance: distance * 1000, // convert km to meters
    duration: (distance / 50) * 3600, // assume 50 km/h average speed
    service: 'Straight Line',
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
   * Clear all caches
   */
  clearAll() {
    searchCache.clear();
    routeCache.clear();
    pendingSearchRequests.clear();
    pendingRouteRequests.clear();
    console.log('[MapServices] All caches cleared');
  },

  /**
   * Clear expired entries from all caches
   */
  cleanup() {
    CacheManager.cleanup(searchCache, CACHE_CONFIG.SEARCH_TTL);
    CacheManager.cleanup(routeCache, CACHE_CONFIG.ROUTE_TTL);
    console.log('[MapServices] Cache cleanup completed');
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
if (typeof window !== 'undefined') {
  setInterval(() => {
    MapServiceCache.cleanup();
  }, 10 * 60 * 1000);
}
