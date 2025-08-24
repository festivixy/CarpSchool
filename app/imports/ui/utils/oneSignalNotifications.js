import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";

/**
 * OneSignal client-side utilities for the Carp School app
 * Handles OneSignal web SDK integration and user registration
 */

class OneSignalManager {
  constructor() {
    this.isSupported = false;
    this.isInitialized = false;
    this.playerId = null;
    this.lastRegistrationAttempt = null;

    // Initialize on client only
    if (Meteor.isClient) {
      this.initialize();
    }
  }

  /**
   * Initialize OneSignal web SDK
   */
  async initialize() {
    try {
      // Wait for OneSignal SDK to load (v16 uses deferred loading)
      let attempts = 0;
      while (!window.OneSignal && !window.OneSignalDeferred && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // Check if OneSignal is available (v16 SDK)
      if (!window.OneSignal && !window.OneSignalDeferred) {
        console.warn("[OneSignal] OneSignal SDK not available (blocked or failed to load)");
        console.log("[OneSignal] Server-side push notifications will still function");
        return;
      }

      // Wait for OneSignal to be ready
      if (window.OneSignalDeferred) {
        await new Promise(resolve => {
          window.OneSignalDeferred.push(function (OneSignal) {
            window.OneSignal = OneSignal;
            resolve();
          });
        });
      }

      this.isSupported = true;

      // OneSignal v16 SDK is now initialized via official script in HTML
      // No need to call init() again as it's handled by OneSignalDeferred
      console.log("[OneSignal] Using official v16 SDK initialization");

      // Get user ID when available (try both v16 and legacy methods)
      try {
        if (window.OneSignal.User?.PushSubscription?.id) {
          // v16 SDK method
          this.playerId = window.OneSignal.User.PushSubscription.id;
          this.registerWithServer();
        } else if (window.OneSignal.getUserId) {
          // Legacy method fallback
          window.OneSignal.getUserId().then((userId) => {
            if (userId) {
              this.playerId = userId;
              this.registerWithServer();
            }
          });
        }
      } catch (error) {
        console.log("[OneSignal] User ID not available yet:", error.message);
      }

      // Listen for subscription changes (try v16 first, then legacy)
      try {
        if (window.OneSignal.User?.PushSubscription?.addEventListener) {
          // v16 SDK event listener
          window.OneSignal.User.PushSubscription.addEventListener("change", (event) => {
            if (event.current?.id && event.current.id !== this.playerId) {
              this.playerId = event.current.id;
              this.registerWithServer();
            }
          });
        } else if (window.OneSignal.on) {
          // Legacy event listener
          window.OneSignal.on("subscriptionChange", (isSubscribed) => {
            if (isSubscribed && window.OneSignal.getUserId) {
              window.OneSignal.getUserId().then((userId) => {
                if (userId && userId !== this.playerId) {
                  this.playerId = userId;
                  this.registerWithServer();
                }
              });
            }
          });
        }
      } catch (error) {
        console.log("[OneSignal] Event listener setup failed:", error.message);
      }

      this.isInitialized = true;
      console.log("[OneSignal] Client manager initialized");

    } catch (error) {
      console.error("[OneSignal] Initialization failed:", error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if (!this.isSupported || !window.OneSignal) {
      return false;
    }

    try {
      const permission = await window.OneSignal.Notifications.requestPermission();

      if (permission) {
        // Get the player ID after permission granted
        // For v16, we need to wait for the subscription to be ready
        let userId = window.OneSignal.User?.PushSubscription?.id;

        // If not available immediately, wait a moment and try again
        if (!userId) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          userId = window.OneSignal.User?.PushSubscription?.id;
        }

        if (userId) {
          this.playerId = userId;
          await this.registerWithServer();
        }
      }

      return permission;

    } catch (error) {
      console.error("[OneSignal] Permission request failed:", error);
      return false;
    }
  }

  /**
   * Register player ID with server
   */
  async registerWithServer() {
    try {
      if (!this.playerId || !Meteor.userId()) {
        return;
      }

      // Avoid duplicate registrations
      if (this.lastRegistrationAttempt === this.playerId) {
        return;
      }
      this.lastRegistrationAttempt = this.playerId;

      // Get device info
      const deviceInfo = this.getDeviceInfo();

      await Meteor.callAsync("notifications.registerOneSignalPlayer", this.playerId, deviceInfo);
      console.log(`[OneSignal] Player registered with server: ${this.playerId}`);

      // Set external user ID
      await window.OneSignal.login(Meteor.userId());

    } catch (error) {
      console.error("[OneSignal] Server registration failed:", error);
    }
  }

  /**
   * Set user tags for segmentation
   */
  async setTags(tags) {
    if (!this.isSupported || !window.OneSignal) {
      return false;
    }

    try {
      await window.OneSignal.User.addTags(tags);
      console.log("[OneSignal] Tags set:", tags);
      return true;

    } catch (error) {
      console.error("[OneSignal] Set tags failed:", error);
      return false;
    }
  }

  /**
   * Get device information
   */
  getDeviceInfo() {
    const info = {
      userAgent: navigator.userAgent,
      platform: "web",
      oneSignalPlayerId: this.playerId,
      browserName: this.getBrowserName(),
      deviceType: this.getDeviceType(),
      registeredAt: new Date().toISOString(),
      url: window.location.href,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Add browser info
    if (navigator.userAgentData) {
      info.brands = navigator.userAgentData.brands;
      info.mobile = navigator.userAgentData.mobile;
    }

    // Add screen info
    if (screen) {
      info.screenResolution = `${screen.width}x${screen.height}`;
    }

    return info;
  }

  /**
   * Get browser name for device identification
   */
  getBrowserName() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera")) return "Opera";
    return "Unknown";
  }

  /**
   * Get device type for identification
   */
  getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad/i.test(userAgent)) return "tablet";
    if (/mobile|android|iphone/i.test(userAgent)) return "mobile";
    return "desktop";
  }

  /**
   * Check if notifications are enabled
   */
  async isEnabled() {
    if (!this.isSupported || !window.OneSignal) {
      return false;
    }

    try {
      const permission = await window.OneSignal.Notifications.permission;
      return permission === "granted";
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current player ID
   */
  getPlayerId() {
    return this.playerId;
  }

  /**
   * Check OneSignal SDK status for debugging
   */
  getSDKStatus() {
    return {
      sdkLoaded: !!window.OneSignal,
      isSupported: this.isSupported,
      isInitialized: this.isInitialized,
      playerId: this.playerId,
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      isSecureContext: window.isSecureContext,
      serviceWorkerSupported: "serviceWorker" in navigator,
      pushManagerSupported: "PushManager" in window,
      currentUrl: window.location.href,
    };
  }
}

// Create singleton instance
export const oneSignalManager = new OneSignalManager();

// Auto-register when user logs in
if (Meteor.isClient) {
  Tracker.autorun(() => {
    const user = Meteor.user();
    if (user && oneSignalManager.isInitialized && oneSignalManager.playerId) {
      // Auto-register player ID when user logs in
      oneSignalManager.registerWithServer();
    }
  });
}

// OneSignal helper functions
export const OneSignalHelpers = {
  /**
   * Request permission with user-friendly prompt
   */
  async requestPermissionWithPrompt() {
    if (await oneSignalManager.isEnabled()) {
      return true;
    }

    // Could show a custom modal explaining why notifications are needed
    const granted = await oneSignalManager.requestPermission();

    if (!granted) {
      console.log("User denied OneSignal notification permission");
    }

    return granted;
  },

  /**
   * Set ride-specific tags
   */
  async setRideTags(rideId) {
    return await oneSignalManager.setTags({
      currentRide: rideId,
      hasActiveRide: "true",
      lastRideUpdate: new Date().toISOString(),
    });
  },

  /**
   * Clear ride tags
   */
  async clearRideTags() {
    return await oneSignalManager.setTags({
      currentRide: "",
      hasActiveRide: "false",
    });
  },

  /**
   * Set location tags for city-based notifications
   */
  async setLocationTags(city, state, country) {
    return await oneSignalManager.setTags({
      city: city || "",
      state: state || "",
      country: country || "",
    });
  },

  /**
   * Send test notification
   */
  async sendTestNotification() {
    try {
      await Meteor.callAsync("notifications.testOneSignal");
      return true;
    } catch (error) {
      console.error("Test notification failed:", error);
      return false;
    }
  },

  /**
   * Get user's registered devices
   */
  async getUserDevices() {
    try {
      return await Meteor.callAsync("notifications.getUserDevices");
    } catch (error) {
      console.error("Failed to get user devices:", error);
      return [];
    }
  },

  /**
   * Deactivate a specific device
   */
  async deactivateDevice(playerId) {
    try {
      return await Meteor.callAsync("notifications.deactivateDevice", playerId);
    } catch (error) {
      console.error("Failed to deactivate device:", error);
      throw error;
    }
  },

  /**
   * Get info about current device
   */
  getCurrentDeviceInfo() {
    return {
      playerId: oneSignalManager.getPlayerId(),
      deviceInfo: oneSignalManager.getDeviceInfo(),
      isCurrentDevice: true,
      isEnabled: oneSignalManager.isEnabled(),
    };
  },

  /**
   * Get status for multi-device setup
   */
  async getMultiDeviceStatus() {
    try {
      const devices = await this.getUserDevices();
      const currentDevice = this.getCurrentDeviceInfo();

      return {
        totalDevices: devices.length,
        currentDevice,
        otherDevices: devices.filter(d => d.playerId !== currentDevice.playerId),
        canReceiveNotifications: devices.length > 0 || currentDevice.isEnabled,
      };
    } catch (error) {
      console.error("Failed to get multi-device status:", error);
      return {
        totalDevices: 0,
        currentDevice: this.getCurrentDeviceInfo(),
        otherDevices: [],
        canReceiveNotifications: false,
      };
    }
  },
};

// Load OneSignal SDK with proper error handling
if (Meteor.isClient && !window.OneSignal) {
  const loadOneSignalSDK = () => new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.OneSignal) {
        resolve(window.OneSignal);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
      script.async = true;

      script.onload = () => {
        console.log("[OneSignal] SDK loaded successfully");
        resolve(window.OneSignal);
      };

      script.onerror = (error) => {
        console.warn("[OneSignal] SDK failed to load:", error);
        console.warn("[OneSignal] Falling back to server-only push notifications");
        reject(new Error("OneSignal SDK blocked or failed to load"));
      };

      document.head.appendChild(script);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!window.OneSignal) {
          reject(new Error("OneSignal SDK load timeout"));
        }
      }, 10000);
    });

  // Attempt to load SDK
  loadOneSignalSDK().catch(error => {
    console.warn("[OneSignal] Web SDK unavailable:", error.message);
    console.log("[OneSignal] Server-side notifications will still work");
  });
}
