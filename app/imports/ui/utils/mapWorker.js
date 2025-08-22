/**
 * Web Worker utility for offloading heavy map calculations
 *
 * This module provides a clean interface to use Web Workers for route calculations
 * and other heavy map operations, keeping the main thread responsive.
 */

let worker = null;
let messageId = 0;
const pendingMessages = new Map();

/**
 * Initialize the Web Worker
 */
const initWorker = () => {
  if (!worker && typeof Worker !== 'undefined') {
    try {
      worker = new Worker('/mapWorker.js');

      worker.onmessage = (e) => {
        const { id, success, result, error } = e.data;

        if (pendingMessages.has(id)) {
          const { resolve, reject } = pendingMessages.get(id);
          pendingMessages.delete(id);

          if (success) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      };

      worker.onerror = (error) => {
        console.error('[MapWorker] Worker error:', error);
        // Fallback to main thread if worker fails
        worker = null;
      };

      console.log('[MapWorker] Web Worker initialized');
    } catch (error) {
      console.warn('[MapWorker] Failed to initialize worker:', error);
      worker = null;
    }
  }
};

/**
 * Send message to worker and get promise for result
 */
const sendWorkerMessage = (type, data, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject(new Error('Web Worker not available'));
      return;
    }

    const id = ++messageId;

    // Store promise handlers
    pendingMessages.set(id, { resolve, reject });

    // Set timeout for worker response
    const timeoutId = setTimeout(() => {
      if (pendingMessages.has(id)) {
        pendingMessages.delete(id);
        reject(new Error(`Worker timeout after ${timeout}ms`));
      }
    }, timeout);

    // Clear timeout when promise resolves/rejects
    const originalResolve = resolve;
    const originalReject = reject;

    pendingMessages.set(id, {
      resolve: (result) => {
        clearTimeout(timeoutId);
        originalResolve(result);
      },
      reject: (error) => {
        clearTimeout(timeoutId);
        originalReject(error);
      }
    });

    // Send message to worker
    worker.postMessage({ id, type, data });
  });
};

/**
 * Calculate route using Web Worker (non-blocking)
 * @param {object} startCoord - Start coordinates {lat, lng}
 * @param {object} endCoord - End coordinates {lat, lng}
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<object>} - Route data
 */
export const calculateRouteInWorker = async (startCoord, endCoord, timeout = 3000) => {
  initWorker();

  if (!worker) {
    // Fallback to main thread if worker not available
    const { calculateCoreRoute } = await import('./mapCore');
    return calculateCoreRoute(startCoord, endCoord, { timeout });
  }

  try {
    return await sendWorkerMessage('CALCULATE_ROUTE', {
      startCoord,
      endCoord,
      timeout
    }, timeout + 1000); // Add buffer for worker timeout
  } catch (error) {
    console.warn('[MapWorker] Worker calculation failed, falling back to main thread:', error);
    // Fallback to main thread
    const { calculateCoreRoute } = await import('./mapCore');
    return calculateCoreRoute(startCoord, endCoord, { timeout });
  }
};

/**
 * Calculate distance using Web Worker
 * @param {object} startCoord - Start coordinates {lat, lng}
 * @param {object} endCoord - End coordinates {lat, lng}
 * @returns {Promise<number>} - Distance in kilometers
 */
export const calculateDistanceInWorker = async (startCoord, endCoord) => {
  initWorker();

  if (!worker) {
    // Fallback calculation in main thread
    const R = 6371;
    const dLat = ((endCoord.lat - startCoord.lat) * Math.PI) / 180;
    const dLng = ((endCoord.lng - startCoord.lng) * Math.PI) / 180;
    const a =
      (Math.sin(dLat / 2) * Math.sin(dLat / 2)) +
      (Math.cos((startCoord.lat * Math.PI) / 180) * Math.cos((endCoord.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2));
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  try {
    return await sendWorkerMessage('CALCULATE_DISTANCE', {
      startCoord,
      endCoord
    });
  } catch (error) {
    console.warn('[MapWorker] Distance calculation failed in worker, using fallback');
    // Fallback calculation
    const R = 6371;
    const dLat = ((endCoord.lat - startCoord.lat) * Math.PI) / 180;
    const dLng = ((endCoord.lng - startCoord.lng) * Math.PI) / 180;
    const a =
      (Math.sin(dLat / 2) * Math.sin(dLat / 2)) +
      (Math.cos((startCoord.lat * Math.PI) / 180) * Math.cos((endCoord.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2));
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
};

/**
 * Cleanup worker resources
 */
export const cleanupWorker = () => {
  if (worker) {
    // Cancel all pending messages
    for (const { reject } of pendingMessages.values()) {
      reject(new Error('Worker cleanup - operation cancelled'));
    }
    pendingMessages.clear();

    // Terminate worker
    worker.terminate();
    worker = null;

    console.log('[MapWorker] Worker terminated and cleaned up');
  }
};

// Cleanup worker when page unloads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupWorker);
}
