import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { ReactiveVar } from "meteor/reactive-var";
import { Notifications, NOTIFICATION_TYPES } from "../../api/notifications/Notifications";

/**
 * Client-side notification utilities for the Carp School app
 * Handles push notification registration, permission management, and UI integration
 */

class NotificationManager {
  constructor() {
    this.isSupported = false;
    this.hasPermission = false;
    this.pushToken = new ReactiveVar(null);
    this.isInitialized = false;
    this.lastRegistrationAttempt = null;

    // Initialize on client only
    if (Meteor.isClient) {
      this.initialize();
    }
  }

  /**
   * Initialize notification manager
   */
  async initialize() {
    try {
      // Check if we're in Cordova environment
      if (window.cordova) {
        await this.initializeCordova();
      } else {
        await this.initializeWeb();
      }

      this.isInitialized = true;
      console.log("[Notifications] Manager initialized");

    } catch (error) {
      console.error("[Notifications] Initialization failed:", error);
    }
  }

  /**
   * Initialize Cordova push notifications
   */
  async initializeCordova() {
    return new Promise((resolve) => {
      document.addEventListener("deviceready", async () => {
        try {
          // Check if push plugin is available
          if (!window.PushNotification) {
            console.warn("[Notifications] PushNotification plugin not available");
            resolve();
            return;
          }

          this.isSupported = true;

          // Initialize push notification plugin
          const push = window.PushNotification.init({
            android: {
              senderID: Meteor.settings.public?.firebase?.senderId || "YOUR_SENDER_ID",
              icon: "ic_notification",
              iconColor: "#000000",
            },
            ios: {
              alert: true,
              badge: true,
              sound: true,
              categories: {
                emergency: {
                  yes: { callback: "onYes", title: "Emergency", foreground: true },
                  no: { callback: "onNo", title: "Cancel", foreground: true },
                },
              },
            },
          });

          // Handle registration
          push.on("registration", (data) => {
            console.log("[Push] Registration successful:", data.registrationId);
            this.pushToken.set(data.registrationId);
            this.registerTokenWithServer(data.registrationId);
          });

          // Handle notifications
          push.on("notification", (data) => {
            this.handleNotification(data);
          });

          // Handle errors
          push.on("error", (error) => {
            console.error("[Push] Registration error:", error);
          });

          this.hasPermission = true;
          resolve();

        } catch (error) {
          console.error("[Notifications] Cordova setup failed:", error);
          resolve();
        }
      }, false);
    });
  }

  /**
   * Initialize web push notifications
   */
  async initializeWeb() {
    try {
      // Check browser support
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("[Notifications] Web push not supported");
        return;
      }

      this.isSupported = true;

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("[Push] Service worker registered");

      // Check current permission
      this.hasPermission = Notification.permission === "granted";

      if (this.hasPermission) {
        await this.subscribeWebPush(registration);
      }

    } catch (error) {
      console.error("[Notifications] Web push setup failed:", error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    try {
      if (window.cordova) {
        // Cordova handles permissions automatically
        return this.hasPermission;
      }

      // Check secure context requirement
      if (!window.isSecureContext && location.protocol !== "https:" && location.hostname !== "localhost") {
        const error = `Push notifications require HTTPS or localhost. Current URL: ${window.location.href}`;
        console.error("[Notifications]", error);
        throw new Error(error);
      }

      // Web push permission request - must be synchronous from user action
      const permission = await new Promise((resolve) => {
        // Call immediately, not in async chain
        const result = Notification.requestPermission();
        if (result && typeof result.then === "function") {
          // Modern promise-based API
          result.then(resolve);
        } else {
          // Legacy callback-based API
          resolve(result);
        }
      });
      this.hasPermission = permission === "granted";

      if (this.hasPermission) {
        const registration = await navigator.serviceWorker.ready;
        await this.subscribeWebPush(registration);
      }

      return this.hasPermission;

    } catch (error) {
      console.error("[Notifications] Permission request failed:", error);
      return false;
    }
  }

  /**
   * Subscribe to web push
   */
  async subscribeWebPush(registration) {
    try {
      let vapidPublicKey = null;

      // Try to get VAPID key from multiple sources
      try {
        // First, try to get from server
        const vapidData = await Meteor.callAsync("notifications.getVapidPublicKey");
        vapidPublicKey = vapidData.publicKey;
        console.log(`[Push] VAPID key loaded from ${vapidData.source}`);
      } catch (error) {
        console.warn("[Push] Failed to get VAPID key from server:", error.reason);

        // Fallback to client settings
        vapidPublicKey = Meteor.settings.public?.vapid?.publicKey;
        if (vapidPublicKey) {
          console.log("[Push] Using VAPID key from client settings");
        }
      }

      if (!vapidPublicKey) {
        console.warn("[Push] VAPID public key not configured");
        console.warn("[Push] Configure VAPID_PUBLIC_KEY environment variable or Meteor settings");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      const token = JSON.stringify(subscription);
      this.pushToken.set(token);
      this.registerTokenWithServer(token, "web");

      console.log("[Push] Web push subscription successful");

    } catch (error) {
      console.error("[Push] Web push subscription failed:", error);
    }
  }

  /**
   * Register token with server
   */
  async registerTokenWithServer(token, platform = null) {
    try {
      // Avoid duplicate registrations
      if (this.lastRegistrationAttempt === token) {
        return;
      }
      this.lastRegistrationAttempt = token;

      // Determine platform if not provided
      if (!platform) {
        if (window.cordova) {
          platform = window.device?.platform?.toLowerCase() || "unknown";
          if (platform === "ios") platform = "ios";
          else if (platform.includes("android")) platform = "android";
        } else {
          platform = "web";
        }
      }

      // Get device info
      const deviceInfo = this.getDeviceInfo();

      await Meteor.callAsync("notifications.registerPushToken", token, platform, deviceInfo);
      console.log(`[Push] Token registered with server for platform: ${platform}`);

    } catch (error) {
      console.error("[Push] Server registration failed:", error);
    }
  }

  /**
   * Handle incoming notification
   */
  handleNotification(data) {
    console.log("[Push] Notification received:", data);

    try {
      // Mark as delivered if we have notification ID
      if (data.additionalData?.notificationId) {
        // Note: We could call a method to mark as delivered, but that might be overkill
        // Meteor.call('notifications.markAsDelivered', data.additionalData.notificationId);
      }

      // Handle notification tap/action
      if (data.additionalData?.foreground === false) {
        // App was in background, user tapped notification
        this.navigateFromNotification(data);
      } else {
        // App was in foreground, show in-app notification
        this.showInAppNotification(data);
      }

      // Update badge count (iOS)
      if (window.cordova && window.cordova.plugins?.notification?.badge) {
        const count = data.count || 0;
        window.cordova.plugins.notification.badge.set(count);
      }

    } catch (error) {
      console.error("[Push] Notification handling failed:", error);
    }
  }

  /**
   * Navigate based on notification data
   */
  navigateFromNotification(data) {
    try {
      const { type, rideId, chatId, action } = data.additionalData || {};

      // Use FlowRouter for navigation
      if (window.FlowRouter) {
        switch (type) {
          case NOTIFICATION_TYPES.RIDE_UPDATE:
          case NOTIFICATION_TYPES.RIDE_CANCELLED:
          case NOTIFICATION_TYPES.RIDER_JOINED:
          case NOTIFICATION_TYPES.RIDE_STARTING:
            if (rideId) {
              FlowRouter.go("/mobile/ride-info", { rideId });
            }
            break;

          case NOTIFICATION_TYPES.CHAT_MESSAGE:
            if (chatId) {
              FlowRouter.go("/chat", {}, { chatId });
            } else if (rideId) {
              FlowRouter.go("/chat", {}, { rideId });
            }
            break;

          case NOTIFICATION_TYPES.EMERGENCY:
            if (rideId) {
              FlowRouter.go("/mobile/ride-info", { rideId });
              // Could also show emergency modal
            }
            break;

          default:
            // Default navigation or no navigation
            if (action === "open_chat" && chatId) {
              FlowRouter.go("/chat", {}, { chatId });
            } else if (rideId) {
              FlowRouter.go("/mobile/ride-info", { rideId });
            }
        }
      }

    } catch (error) {
      console.error("[Push] Navigation failed:", error);
    }
  }

  /**
   * Show in-app notification when app is in foreground
   */
  showInAppNotification(data) {
    // This could integrate with a toast/banner system
    // For now, just log it
    console.log("[Push] In-app notification:", data.message);

    // You could emit a custom event that UI components listen to
    if (window.dispatchEvent) {
      const event = new CustomEvent("inAppNotification", {
        detail: {
          title: data.title,
          message: data.message,
          type: data.additionalData?.type,
          data: data.additionalData,
        },
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Get device information
   */
  getDeviceInfo() {
    const info = {};

    if (window.device) {
      info.model = window.device.model;
      info.version = window.device.version;
      info.platform = window.device.platform;
      info.isSimulator = window.device.isVirtual;
    }

    if (window.cordova) {
      info.appVersion = window.cordova.platformVersion;
    }

    // Web browser info
    if (navigator.userAgent) {
      info.userAgent = navigator.userAgent;
    }

    return info;
  }

  /**
   * Utility function for VAPID key conversion
   */
  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Check if notifications are supported and enabled
   */
  isEnabled() {
    return this.isSupported && this.hasPermission;
  }

  /**
   * Get current push token
   */
  getToken() {
    return this.pushToken.get();
  }

  /**
   * Unregister from push notifications
   */
  async unregister() {
    try {
      const token = this.getToken();
      if (token) {
        await Meteor.callAsync("notifications.unregisterPushToken", token);
        this.pushToken.set(null);
      }
    } catch (error) {
      console.error("[Push] Unregistration failed:", error);
    }
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Reactive helpers for UI components
export const NotificationHelpers = {
  /**
   * Get unread notification count reactively
   */
  getUnreadCount() {
    const subscription = Meteor.subscribe("notifications.unreadCount");
    if (!subscription.ready()) return 0;

    const countDoc = NotificationCounts?.findOne(Meteor.userId());
    return countDoc?.unreadCount || 0;
  },

  /**
   * Get recent notifications reactively
   */
  getRecentNotifications() {
    const subscription = Meteor.subscribe("notifications.recent");
    if (!subscription.ready()) return [];

    return Notifications.find({}, { sort: { createdAt: -1 } }).fetch();
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await Meteor.callAsync("notifications.markAsRead", notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      await Meteor.callAsync("notifications.markAllAsRead");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },

  /**
   * Request notification permission with user-friendly prompt
   */
  async requestPermissionWithPrompt() {
    if (notificationManager.hasPermission) {
      return true;
    }

    // Could show a custom modal explaining why notifications are needed
    const granted = await notificationManager.requestPermission();

    if (!granted) {
      console.log("User denied notification permission");
      // Could show instructions on how to enable in settings
    }

    return granted;
  },
};

// Auto-initialize when user logs in
if (Meteor.isClient) {
  Tracker.autorun(() => {
    const user = Meteor.user();
    if (user && notificationManager.isInitialized && !notificationManager.getToken()) {
      // Auto-request permissions for logged-in users
      setTimeout(() => {
        NotificationHelpers.requestPermissionWithPrompt();
      }, 2000); // Small delay to avoid overwhelming new users
    }
  });
}

// Export collection for use in components
export { Notifications } from "../../api/notifications/Notifications";

// Client-only exports - handled at module level
let NotificationCounts;
if (Meteor.isClient) {
  // eslint-disable-next-line global-require
  const { NotificationCounts: ClientCounts } = require("../../api/notifications/NotificationPublications");
  NotificationCounts = ClientCounts;
}
export { NotificationCounts };
