/**
 * Web Worker for heavy map calculations
 * Handles OSRM routing and complex calculations off the main thread
 */

// Import fetch polyfill for worker environment if needed
if (typeof fetch === 'undefined') {
  importScripts('https://unpkg.com/whatwg-fetch@3.6.2/dist/fetch.umd.js');
}

/**
 * Fetch with timeout utility for worker
 */
const fetchWithTimeout = (url, timeout = 3000) => {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
    )
  ]);
};

/**
 * Calculate straight-line distance (Haversine formula)
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
 * Create straight line route as fallback
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
 * Fetch route from OSRM with timeout
 */
const fetchOSRMRoute = async (startCoord, endCoord, timeout = 3000) => {
  try {
    const baseUrl = 'https://osrm.carp.school/route/v1/driving';
    const coords = `${startCoord.lng},${startCoord.lat};${endCoord.lng},${endCoord.lat}`;
    const routeUrl = `${baseUrl}/${coords}?overview=full&geometries=geojson`;

    const response = await fetchWithTimeout(routeUrl, timeout);

    if (!response.ok) {
      throw new Error(`OSRM routing failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        geometry: route.geometry,
        distance: route.distance,
        duration: route.duration,
        service: 'OSRM',
      };
    } else {
      throw new Error('No route found');
    }
  } catch (error) {
    console.warn('[MapWorker] OSRM failed, using fallback:', error.message);
    return createStraightLineRoute(startCoord, endCoord);
  }
};

/**
 * Handle messages from main thread
 */
self.onmessage = async function(e) {
  const { id, type, data } = e.data;

  try {
    let result;

    switch (type) {
      case 'CALCULATE_ROUTE':
        result = await fetchOSRMRoute(data.startCoord, data.endCoord, data.timeout);
        break;
      
      case 'CALCULATE_DISTANCE':
        result = calculateDistance(data.startCoord, data.endCoord);
        break;
      
      case 'CREATE_STRAIGHT_LINE':
        result = createStraightLineRoute(data.startCoord, data.endCoord);
        break;
      
      default:
        throw new Error(`Unknown worker task: ${type}`);
    }

    // Send success response
    self.postMessage({
      id,
      success: true,
      result
    });

  } catch (error) {
    // Send error response
    self.postMessage({
      id,
      success: false,
      error: error.message
    });
  }
};
