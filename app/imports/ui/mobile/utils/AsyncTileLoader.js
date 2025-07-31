/**
 * Async Tile Loading Utility
 *
 * This utility provides asynchronous tile loading for map components,
 * preventing main thread blocking when loading map tiles from the tileserver.
 * Features:
 * - Web Worker-based tile loading
 * - Intelligent caching with IndexedDB
 * - Progressive loading with placeholders
 * - Tile preloading for better UX
 * - Error handling and fallbacks
 */

class AsyncTileLoader {
  constructor(tileServerUrl = "/tileserver") {
    this.tileServerUrl = tileServerUrl;
    this.cache = new Map();
    this.loadingTiles = new Set();
    this.worker = null;
    this.initWorker();
    this.initIndexedDB();
  }

  /**
   * Initialize Web Worker for tile loading
   */
  initWorker() {
    try {
      // Create inline worker to avoid separate file dependency
      const workerScript = `
        self.onmessage = async function(e) {
          const { tileUrl, tileId } = e.data;

          try {
            const response = await fetch(tileUrl);
            if (!response.ok) {
              throw new Error(\`HTTP \${response.status}\`);
            }

            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();

            self.postMessage({
              success: true,
              tileId,
              data: arrayBuffer,
              contentType: blob.type
            });
          } catch (error) {
            self.postMessage({
              success: false,
              tileId,
              error: error.message
            });
          }
        };
      `;

      const blob = new Blob([workerScript], { type: "application/javascript" });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onmessage = (_e) => {
        // Worker messages are handled directly in fetchTileWithWorker
        // This is just for error handling
      };

      this.worker.onerror = (error) => {
        console.warn("Tile loader worker error:", error);
        // Fall back to main thread loading
        this.worker = null;
      };
    } catch (error) {
      console.warn("Web Worker not available, using main thread:", error);
      this.worker = null;
    }
  }

  /**
   * Initialize IndexedDB for persistent tile caching
   */
  async initIndexedDB() {
    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("MapTileCache", 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains("tiles")) {
            const store = db.createObjectStore("tiles", { keyPath: "id" });
            store.createIndex("timestamp", "timestamp", { unique: false });
          }
        };
      });
    } catch (error) {
      console.warn("IndexedDB not available for tile caching:", error);
      this.db = null;
    }
  }

  /**
   * Generate tile ID from coordinates
   */
  getTileId(z, x, y) {
    return `${z}-${x}-${y}`;
  }

  /**
   * Get tile URL for given coordinates
   */
  getTileUrl(z, x, y) {
    return `${this.tileServerUrl}/styles/${encodeURIComponent('OSM OpenMapTiles')}/${z}/${x}/${y}.png`;
  }

  /**
   * Load tile asynchronously
   */
  async loadTile(z, x, y) {
    const tileId = this.getTileId(z, x, y);

    // Check memory cache first
    if (this.cache.has(tileId)) {
      const cached = this.cache.get(tileId);
      if (cached.expires > Date.now()) {
        return cached.imageUrl;
      }
        this.cache.delete(tileId);

    }

    // Check if already loading
    if (this.loadingTiles.has(tileId)) {
      return this.waitForTileLoad(tileId);
    }

    this.loadingTiles.add(tileId);

    try {
      // Check IndexedDB cache
      const cachedTile = await this.getCachedTile(tileId);
      if (cachedTile && cachedTile.expires > Date.now()) {
        const imageUrl = URL.createObjectURL(new Blob([cachedTile.data], { type: cachedTile.contentType }));
        this.cacheInMemory(tileId, imageUrl);
        this.loadingTiles.delete(tileId);
        return imageUrl;
      }

      // Load new tile
      const result = await this.fetchTile(z, x, y, tileId);
      this.loadingTiles.delete(tileId);
      return result;

    } catch (error) {
      this.loadingTiles.delete(tileId);
      console.warn(`Failed to load tile ${tileId}:`, error);
      return null;
    }
  }

  /**
   * Fetch tile using Web Worker or main thread
   */
  async fetchTile(z, x, y, tileId) {
    const tileUrl = this.getTileUrl(z, x, y);

    if (this.worker) {
      return this.fetchTileWithWorker(tileUrl, tileId);
    }
      return this.fetchTileMainThread(tileUrl, tileId);

  }

  /**
   * Fetch tile using Web Worker
   */
  async fetchTileWithWorker(tileUrl, tileId) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        if (e.data.tileId === tileId) {
          this.worker.removeEventListener("message", messageHandler);

          if (e.data.success) {
            const imageUrl = URL.createObjectURL(new Blob([e.data.data], { type: e.data.contentType }));
            this.cacheInMemory(tileId, imageUrl);
            this.cacheTile(tileId, e.data.data, e.data.contentType);
            resolve(imageUrl);
          } else {
            reject(new Error(e.data.error));
          }
        }
      };

      this.worker.addEventListener("message", messageHandler);
      this.worker.postMessage({ tileUrl, tileId });
    });
  }

  /**
   * Fetch tile on main thread (fallback)
   */
  async fetchTileMainThread(tileUrl, tileId) {
    // Use requestIdleCallback to avoid blocking main thread
    return new Promise((resolve, reject) => {
      const loadTile = async () => {
        try {
          const response = await fetch(tileUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          const arrayBuffer = await blob.arrayBuffer();

          this.cacheInMemory(tileId, imageUrl);
          this.cacheTile(tileId, arrayBuffer, blob.type);

          resolve(imageUrl);
        } catch (error) {
          reject(error);
        }
      };

      // Use requestIdleCallback if available, otherwise setTimeout
      if (window.requestIdleCallback) {
        window.requestIdleCallback(loadTile);
      } else {
        setTimeout(loadTile, 0);
      }
    });
  }

  /**
   * Wait for tile that's already being loaded
   */
  async waitForTileLoad(tileId) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.loadingTiles.has(tileId)) {
          clearInterval(checkInterval);
          const cached = this.cache.get(tileId);
          resolve(cached ? cached.imageUrl : null);
        }
      }, 50);
    });
  }

  /**
   * Cache tile in memory
   */
  cacheInMemory(tileId, imageUrl) {
    // Cache for 30 minutes
    const expires = Date.now() + (30 * 60 * 1000);
    this.cache.set(tileId, { imageUrl, expires });

    // Cleanup old entries if cache gets too large
    if (this.cache.size > 1000) {
      const now = Date.now();
      // eslint-disable-next-line no-restricted-syntax
      for (const [id, data] of this.cache.entries()) {
        if (data.expires < now) {
          URL.revokeObjectURL(data.imageUrl);
          this.cache.delete(id);
        }
      }
    }
  }

  /**
   * Cache tile in IndexedDB
   */
  async cacheTile(tileId, data, contentType) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(["tiles"], "readwrite");
      const store = transaction.objectStore("tiles");

      await store.put({
        id: tileId,
        data,
        contentType,
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      });
    } catch (error) {
      console.warn("Failed to cache tile in IndexedDB:", error);
    }
  }

  /**
   * Get cached tile from IndexedDB
   */
  async getCachedTile(tileId) {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(["tiles"], "readonly");
      const store = transaction.objectStore("tiles");
      const request = store.get(tileId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn("Failed to get cached tile from IndexedDB:", error);
      return null;
    }
  }

  /**
   * Preload tiles for given bounds
   */
  async preloadTiles(bounds, zoom) {
    const { north, south, east, west } = bounds;
    const tiles = this.getTilesInBounds(north, south, east, west, zoom);

    // Load tiles with priority (center first)
    const centerX = Math.floor((tiles.minX + tiles.maxX) / 2);
    const centerY = Math.floor((tiles.minY + tiles.maxY) / 2);

    const loadPromises = [];

    // Load center tiles first
    for (let x = centerX; x <= tiles.maxX; x++) {
      for (let y = centerY; y <= tiles.maxY; y++) {
        loadPromises.push(this.loadTile(zoom, x, y));
      }
    }

    // Load remaining tiles
    for (let x = tiles.minX; x < centerX; x++) {
      for (let y = tiles.minY; y <= tiles.maxY; y++) {
        loadPromises.push(this.loadTile(zoom, x, y));
      }
    }

    // Don't wait for all tiles, just start loading
    Promise.allSettled(loadPromises).catch(() => {});
  }

  /**
   * Calculate tiles needed for given bounds
   */
  getTilesInBounds(north, south, east, west, zoom) {
    const minX = Math.floor(this.lon2tile(west, zoom));
    const maxX = Math.floor(this.lon2tile(east, zoom));
    const minY = Math.floor(this.lat2tile(north, zoom));
    const maxY = Math.floor(this.lat2tile(south, zoom));

    return { minX, maxX, minY, maxY };
  }

  /**
   * Convert longitude to tile X coordinate
   */
  lon2tile(lon, zoom) {
    return ((lon + 180) / 360) * (2 ** zoom);
  }

  /**
   * Convert latitude to tile Y coordinate
   */
  lat2tile(lat, zoom) {
    const latRad = (lat * Math.PI) / 180;
    const logValue = Math.log(Math.tan(latRad) + (1 / Math.cos(latRad)));
    return ((1 - (logValue / Math.PI)) / 2) * (2 ** zoom);
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    // Clean up object URLs
    // eslint-disable-next-line no-restricted-syntax
    for (const [, data] of this.cache.entries()) {
      URL.revokeObjectURL(data.imageUrl);
    }
    this.cache.clear();

    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Create singleton instance
const asyncTileLoader = new AsyncTileLoader();

export default asyncTileLoader;
export { AsyncTileLoader };
