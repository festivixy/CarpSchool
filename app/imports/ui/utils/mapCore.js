/**
 * Core map utilities - shared between mapServices and mapWorker
 * This module contains the base functionality without circular dependencies
 */

/**
 * Core route calculation using OSRM API
 * @param {object} startCoord - Start coordinates {lat, lng}
 * @param {object} endCoord - End coordinates {lat, lng}
 * @param {object} options - Options for route calculation
 * @returns {Promise<object>} Route data with geometry and distance
 */
export const calculateCoreRoute = async (startCoord, endCoord, options = {}) => {
  const { 
    service = 'driving',
    timeout = 10000
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const baseUrl = 'https://osrm.carp.school/route/v1';
    const coords = `${startCoord.lng},${startCoord.lat};${endCoord.lng},${endCoord.lat}`;
    const routeUrl = `${baseUrl}/${service}/${coords}?overview=full&geometries=geojson`;

    const response = await fetch(routeUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    
    return {
      geometry: route.geometry,
      distance: route.distance / 1000, // Convert to kilometers
      duration: route.duration / 60, // Convert to minutes
      legs: route.legs || []
    };

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Route calculation timeout after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {object} coord1 - First coordinate {lat, lng}
 * @param {object} coord2 - Second coordinate {lat, lng}
 * @returns {number} Distance in kilometers
 */
export const calculateHaversineDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
const toRadians = (degrees) => degrees * (Math.PI / 180);
