import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";

/**
 * OneSignal client-side utilities for the Carp School app
 * Handles OneSignal web SDK (v16) integration and user registration.
 *
 * The SDK itself is loaded and initialised by client/oneSignalInit.js via
 * OneSignalDeferred; this module never injects a script tag of its own (a
 * second, older SDK used to be pulled from cdn.onesignal.com here whenever
 * window.OneSignal was still undefined at module evaluation).
 */

class OneSignalManager {
  constructor() {
    this.isSupported = false;
    this.isInitialized = false;
    this.playerId = null;
    // "<userId>:<playerId>" of the last successful server registration, so
    // the same device is not re-registered on every reactive rerun. Reset
    // whenever the logged-in user changes.
    this.lastRegistrationAttempt = null;

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
        await new Promise(resolve => { setTimeout(resolve, 100); });
        attempts++;
      }

      if (!window.OneSignal && !window.OneSignalDeferred) {
        console.warn("[OneSignal] OneSignal SDK not available (blocked or failed to load)");
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

      try {
        if (window.OneSignal.User?.PushSubscription?.id) {
          this.playerId = window.OneSignal.User.PushSubscription.id;
        }
      } catch (error) {
        console.log("[OneSignal] User ID not available yet:", error.message);
      }

      // Listen for subscription changes
      try {
        window.OneSignal.User?.PushSubscription?.addEventListener?.("change", (event) => {
          if (event.current?.id && event.current.id !== this.playerId) {
            this.playerId = event.current.id;
            this.registerWithServer();
          }
        });
      } catch (error) {
        console.log("[OneSignal] Event listener setup failed:", error.message);
      }

      this.isInitialized = true;

      // The user may have logged in before the SDK finished loading.
      if (Meteor.userId()) {
        await this.loginUser(Meteor.userId());
      }

    } catch (error) {
      console.error("[OneSignal] Initialization failed:", error);
    }
  }

  /**
   * Request notification permission. Must be called from a user gesture -
   * browsers ignore (or penalise) prompts that are not.
   */
  async requestPermission() {
    if (!this.isSupported || !window.OneSignal) {
      return false;
    }

    try {
      const permission = await window.OneSignal.Notifications.requestPermission();

      if (permission) {
        // For v16, the subscription id may take a moment to appear
        let userId = window.OneSignal.User?.PushSubscription?.id;
        if (!userId) {
          await new Promise(resolve => { setTimeout(resolve, 1000); });
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
   * Bind the OneSignal identity to the logged-in user, then register the
   * device with the server. OneSignal.login is always called - it is what
   * routes include_external_user_ids sends to this browser.
   */
  async loginUser(userId) {
    if (!userId || !this.isSupported || !window.OneSignal) {
      return;
    }

    try {
      await window.OneSignal.login(userId);
    } catch (error) {
      console.warn("[OneSignal] login failed:", error.message);
    }

    await this.registerWithServer();
  }

  /**
   * Register player ID with server (once per user + device)
   */
  async registerWithServer() {
    try {
      const userId = Meteor.userId();
      if (!this.playerId || !userId) {
        return;
      }

      const attemptKey = `${userId}:${this.playerId}`;
      if (this.lastRegistrationAttempt === attemptKey) {
        return;
      }
      this.lastRegistrationAttempt = attemptKey;

      await Meteor.callAsync("notifications.registerOneSignalPlayer", this.playerId, this.getDeviceInfo());

    } catch (error) {
      // Let the next reactive rerun retry
      this.lastRegistrationAttempt = null;
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

    if (navigator.userAgentData) {
      info.brands = navigator.userAgentData.brands;
      info.mobile = navigator.userAgentData.mobile;
    }

    if (window.screen) {
      info.screenResolution = `${window.screen.width}x${window.screen.height}`;
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
      return permission === "granted" || permission === true;
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

// Bind/unbind the OneSignal identity as the logged-in user changes. The
// registration dedupe is reset on every change so a second account on the
// same browser is registered too.
if (Meteor.isClient) {
  let lastUserId;
  Tracker.autorun(() => {
    const userId = Meteor.userId();
    if (userId === lastUserId) {
      return;
    }
    lastUserId = userId;
    oneSignalManager.lastRegistrationAttempt = null;

    if (userId && oneSignalManager.isInitialized) {
      oneSignalManager.loginUser(userId);
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

    return oneSignalManager.requestPermission();
  },

  /**
   * Set ride-specific tags
   */
  async setRideTags(rideId) {
    return oneSignalManager.setTags({
      currentRide: rideId,
      hasActiveRide: "true",
      lastRideUpdate: new Date().toISOString(),
    });
  },

  /**
   * Clear ride tags
   */
  async clearRideTags() {
    return oneSignalManager.setTags({
      currentRide: "",
      hasActiveRide: "false",
    });
  },

  /**
   * Set location tags for city-based notifications
   */
  async setLocationTags(city, state, country) {
    return oneSignalManager.setTags({
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
