import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";

/**
 * Mobile Push Notification Manager for Cordova Apps
 * Handles both Firebase and OneSignal native mobile push notifications
 *
 * Supported Platforms: iOS, Android
 * Supported Backends: Firebase FCM, OneSignal
 */

class MobilePushNotificationManager {
  constructor() {
    this.isInitialized = false;
    this.platform = null;
    this.pushToken = null;
    this.backend = 'firebase'; // default
    this.pushPlugin = null;
    this.oneSignalPlugin = null;

    // Initialize only in Cordova environment
    if (window.cordova) {
      this.initializeWhenReady();
    }
  }

  /**
   * Initialize when device is ready
   */
  initializeWhenReady() {
    document.addEventListener('deviceready', () => {
      this.platform = device.platform.toLowerCase();
      this.backend = Meteor.settings.public?.notifications?.backend || 'firebase';

      console.log(`[MobilePush] Initializing for ${this.platform} with ${this.backend} backend`);

      if (this.backend === 'onesignal') {
        this.initializeOneSignal();
      } else {
        this.initializeFirebase();
      }
    }, false);
  }

  /**
   * Initialize Firebase push notifications
   */
  async initializeFirebase() {
    try {
      // Check if Firebase push plugin is available
      if (!window.FCMPlugin && !window.PushNotification) {
        console.warn('[MobilePush] Firebase push plugin not found. Install: meteor add cordova:cordova-plugin-fcm-with-dependecy-updated');
        return;
      }

      // Use FCM plugin if available, otherwise fall back to PushNotification
      if (window.FCMPlugin) {
        await this.initializeFirebaseFCM();
      } else if (window.PushNotification) {
        await this.initializeFirebasePushPlugin();
      }

    } catch (error) {
      console.error('[MobilePush] Firebase initialization failed:', error);
    }
  }

  /**
   * Initialize Firebase using FCM plugin
   */
  async initializeFirebaseFCM() {
    try {
      // Get initial token
      FCMPlugin.getToken((token) => {
        console.log('[MobilePush] FCM token received:', token);
        this.pushToken = token;
        this.registerTokenWithServer(token, 'firebase');
      }, (error) => {
        console.error('[MobilePush] FCM getToken error:', error);
      });

      // Listen for token refresh
      FCMPlugin.onTokenRefresh((token) => {
        console.log('[MobilePush] FCM token refreshed:', token);
        this.pushToken = token;
        this.registerTokenWithServer(token, 'firebase');
      }, (error) => {
        console.error('[MobilePush] FCM token refresh error:', error);
      });

      // Handle received notifications
      FCMPlugin.onNotification((data) => {
        console.log('[MobilePush] FCM notification received:', data);
        this.handleNotification(data);
      }, (error) => {
        console.error('[MobilePush] FCM notification error:', error);
      });

      // Request permission (iOS)
      if (this.platform === 'ios') {
        FCMPlugin.requestPushPermission({
          ios9Support: {
            timeout: 10,
            interval: 0.3
          }
        }, (success) => {
          console.log('[MobilePush] FCM permission granted:', success);
        }, (error) => {
          console.error('[MobilePush] FCM permission denied:', error);
        });
      }

      this.isInitialized = true;
      console.log('[MobilePush] Firebase FCM initialized successfully');

    } catch (error) {
      console.error('[MobilePush] Firebase FCM initialization failed:', error);
    }
  }

  /**
   * Initialize Firebase using PushNotification plugin
   */
  async initializeFirebasePushPlugin() {
    try {
      const push = PushNotification.init({
        android: {
          senderID: Meteor.settings.public?.firebase?.senderId,
          icon: 'ic_notification',
          iconColor: '#000000'
        },
        ios: {
          alert: true,
          badge: true,
          sound: true,
          categories: {
            ride_update: {
              yes: { callback: 'onRideAction', title: 'View Ride', foreground: true },
              no: { callback: 'onDismiss', title: 'Dismiss', foreground: false }
            },
            chat_message: {
              reply: { callback: 'onChatReply', title: 'Reply', foreground: true },
              view: { callback: 'onChatView', title: 'View Chat', foreground: true }
            }
          }
        }
      });

      // Handle registration
      push.on('registration', (data) => {
        console.log('[MobilePush] PushNotification registration:', data.registrationId);
        this.pushToken = data.registrationId;
        this.registerTokenWithServer(data.registrationId, 'firebase');
      });

      // Handle notifications
      push.on('notification', (data) => {
        console.log('[MobilePush] PushNotification received:', data);
        this.handleNotification(data);
      });

      // Handle errors
      push.on('error', (error) => {
        console.error('[MobilePush] PushNotification error:', error);
      });

      this.pushPlugin = push;
      this.isInitialized = true;
      console.log('[MobilePush] Firebase PushNotification initialized successfully');

    } catch (error) {
      console.error('[MobilePush] Firebase PushNotification initialization failed:', error);
    }
  }

  /**
   * Initialize OneSignal push notifications
   */
  async initializeOneSignal() {
    try {
      // Check if OneSignal plugin is available
      if (!window.plugins?.OneSignal) {
        console.warn('[MobilePush] OneSignal plugin not found. Install: meteor add onesignal-cordova-plugin');
        return;
      }

      const oneSignal = window.plugins.OneSignal;
      const appId = Meteor.settings.public?.oneSignal?.appId;

      if (!appId) {
        console.error('[MobilePush] OneSignal App ID not configured in Meteor settings');
        return;
      }

      // Initialize OneSignal
      oneSignal.startInit(appId);

      // Handle notification received
      oneSignal.handleNotificationReceived((notification) => {
        console.log('[MobilePush] OneSignal notification received:', notification);
        this.handleNotification(notification);
      });

      // Handle notification opened
      oneSignal.handleNotificationOpened((result) => {
        console.log('[MobilePush] OneSignal notification opened:', result);
        this.handleNotificationAction(result.notification, result.action);
      });

      // iOS specific configuration
      if (this.platform === 'ios') {
        oneSignal.inFocusDisplaying(oneSignal.OSInFocusDisplayOption.Notification);
        oneSignal.setSubscription(true);
      }

      // Complete initialization
      oneSignal.endInit();

      // Get player ID
      oneSignal.getIds((ids) => {
        console.log('[MobilePush] OneSignal player ID:', ids.userId);
        this.pushToken = ids.userId;
        this.registerTokenWithServer(ids.userId, 'onesignal');

        // iOS: Request permission after initialization
        if (this.platform === 'ios') {
          oneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
            console.log('[MobilePush] iOS push permission:', accepted ? 'granted' : 'denied');
          });
        }
      });

      // Set external user ID when user logs in
      if (Meteor.userId()) {
        oneSignal.setExternalUserId(Meteor.userId());
      }

      this.oneSignalPlugin = oneSignal;
      this.isInitialized = true;
      console.log('[MobilePush] OneSignal initialized successfully');

    } catch (error) {
      console.error('[MobilePush] OneSignal initialization failed:', error);
    }
  }

  /**
   * Register push token with server
   */
  async registerTokenWithServer(token, backend) {
    try {
      if (!token || !Meteor.userId()) {
        return;
      }

      const deviceInfo = this.getDeviceInfo();

      if (backend === 'onesignal') {
        // Register OneSignal player ID
        await Meteor.callAsync('notifications.registerOneSignalPlayer', token, deviceInfo);
      } else {
        // Register Firebase token
        await Meteor.callAsync('notifications.registerPushToken', token, this.platform, deviceInfo);
      }

      console.log(`[MobilePush] Token registered with server: ${token.substring(0, 20)}...`);

    } catch (error) {
      console.error('[MobilePush] Token registration failed:', error);
    }
  }

  /**
   * Handle received notification
   */
  handleNotification(notification) {
    try {
      console.log('[MobilePush] Processing notification:', notification);

      // Extract notification data based on backend
      let notificationData;
      if (this.backend === 'onesignal') {
        notificationData = {
          title: notification.payload?.title || 'Carp School',
          body: notification.payload?.body || '',
          data: notification.payload?.additionalData || {},
          foreground: notification.isAppInFocus
        };
      } else {
        // Firebase format
        notificationData = {
          title: notification.title || notification.message || 'Carp School',
          body: notification.body || notification.message || '',
          data: notification.additionalData || notification.data || {},
          foreground: notification.foreground
        };
      }

      // Handle foreground vs background
      if (notificationData.foreground) {
        this.showInAppNotification(notificationData);
      } else {
        // Background notification was tapped
        this.handleNotificationAction(notificationData);
      }

      // Mark as delivered if we have notification ID
      if (notificationData.data.notificationId) {
        this.markAsDelivered(notificationData.data.notificationId);
      }

    } catch (error) {
      console.error('[MobilePush] Notification handling failed:', error);
    }
  }

  /**
   * Handle notification action (tap, button press)
   */
  handleNotificationAction(notification, action = null) {
    try {
      const data = notification.data || notification.additionalData || {};

      console.log('[MobilePush] Handling notification action:', action, data);

      // Navigate based on notification data
      if (data.rideId) {
        // Navigate to ride details
        this.navigateToRide(data.rideId);
      } else if (data.chatId) {
        // Navigate to chat
        this.navigateToChat(data.chatId);
      } else if (data.action === 'open_app') {
        // Just bring app to foreground
        this.bringAppToForeground();
      }

      // Handle specific actions
      if (action) {
        this.handleSpecificAction(action, data);
      }

      // Mark as read if we have notification ID
      if (data.notificationId) {
        this.markAsRead(data.notificationId);
      }

    } catch (error) {
      console.error('[MobilePush] Notification action handling failed:', error);
    }
  }

  /**
   * Show in-app notification for foreground notifications
   */
  showInAppNotification(notification) {
    // Emit custom event that UI components can listen to
    if (window.dispatchEvent) {
      const event = new CustomEvent('inAppNotification', {
        detail: notification
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Navigate to ride screen
   */
  navigateToRide(rideId) {
    if (window.FlowRouter) {
      window.FlowRouter.go('/mobile/ride-info', { rideId });
    } else {
      console.warn('[MobilePush] FlowRouter not available for navigation');
    }
  }

  /**
   * Navigate to chat screen
   */
  navigateToChat(chatId) {
    if (window.FlowRouter) {
      window.FlowRouter.go('/chat', {}, { chatId });
    } else {
      console.warn('[MobilePush] FlowRouter not available for navigation');
    }
  }

  /**
   * Bring app to foreground
   */
  bringAppToForeground() {
    // App is already in foreground when this is called
    console.log('[MobilePush] App brought to foreground');
  }

  /**
   * Handle specific notification actions
   */
  handleSpecificAction(action, data) {
    switch (action) {
      case 'call_driver':
        if (data.driverPhone) {
          window.open(`tel:${data.driverPhone}`, '_system');
        }
        break;
      case 'track_ride':
        this.navigateToRide(data.rideId);
        break;
      case 'reply_chat':
        this.navigateToChat(data.chatId);
        break;
      default:
        console.log('[MobilePush] Unknown action:', action);
    }
  }

  /**
   * Mark notification as delivered
   */
  async markAsDelivered(notificationId) {
    try {
      // We could add a method for this, but for now just log
      console.log('[MobilePush] Notification delivered:', notificationId);
    } catch (error) {
      console.error('[MobilePush] Mark as delivered failed:', error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await Meteor.callAsync('notifications.markAsRead', notificationId);
      console.log('[MobilePush] Notification marked as read:', notificationId);
    } catch (error) {
      console.error('[MobilePush] Mark as read failed:', error);
    }
  }

  /**
   * Get device information
   */
  getDeviceInfo() {
    const info = {
      platform: this.platform,
      model: device.model || 'Unknown',
      version: device.version || 'Unknown',
      uuid: device.uuid || 'Unknown',
      cordova: device.cordova || 'Unknown',
      manufacturer: device.manufacturer || 'Unknown',
      isVirtual: device.isVirtual || false,
      serial: device.serial || 'Unknown'
    };

    return info;
  }

  /**
   * Request notification permission (iOS mainly)
   */
  async requestPermission() {
    try {
      if (this.backend === 'onesignal' && this.oneSignalPlugin) {
        // OneSignal handles permissions automatically
        return true;
      } else if (this.platform === 'ios' && window.FCMPlugin) {
        // Request FCM permission
        return new Promise((resolve) => {
          FCMPlugin.requestPushPermission({},
            () => resolve(true),
            () => resolve(false)
          );
        });
      }

      // Android doesn't need explicit permission request
      return true;

    } catch (error) {
      console.error('[MobilePush] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Set user tags (OneSignal only)
   */
  async setTags(tags) {
    try {
      if (this.backend === 'onesignal' && this.oneSignalPlugin) {
        this.oneSignalPlugin.sendTags(tags);
        return true;
      } else {
        // For Firebase, we handle tags on the server side
        await Meteor.callAsync('notifications.setUserTags', tags);
        return true;
      }
    } catch (error) {
      console.error('[MobilePush] Set tags failed:', error);
      return false;
    }
  }

  /**
   * Get current push token
   */
  getToken() {
    return this.pushToken;
  }

  /**
   * Check if push notifications are supported and enabled
   */
  isSupported() {
    return window.cordova && this.isInitialized;
  }

  /**
   * Get push notification status
   */
  getStatus() {
    return {
      supported: this.isSupported(),
      initialized: this.isInitialized,
      platform: this.platform,
      backend: this.backend,
      hasToken: !!this.pushToken,
      token: this.pushToken ? this.pushToken.substring(0, 20) + '...' : null
    };
  }
}

// Create singleton instance
export const mobilePushManager = new MobilePushNotificationManager();

// Auto-register when user logs in
if (Meteor.isClient) {
  Tracker.autorun(() => {
    const user = Meteor.user();
    if (user && mobilePushManager.isInitialized && mobilePushManager.pushToken) {
      // Set external user ID for OneSignal
      if (mobilePushManager.backend === 'onesignal' && mobilePushManager.oneSignalPlugin) {
        mobilePushManager.oneSignalPlugin.setExternalUserId(user._id);
      }

      // Re-register token with current user
      mobilePushManager.registerTokenWithServer(
        mobilePushManager.pushToken,
        mobilePushManager.backend
      );
    }
  });
}

// Export utility functions
export const MobilePushHelpers = {
  /**
   * Request permission with user-friendly handling
   */
  async requestPermission() {
    return await mobilePushManager.requestPermission();
  },

  /**
   * Set ride-related tags
   */
  async setRideTags(rideId) {
    return await mobilePushManager.setTags({
      currentRide: rideId,
      hasActiveRide: 'true',
      lastRideUpdate: new Date().toISOString()
    });
  },

  /**
   * Clear ride tags
   */
  async clearRideTags() {
    return await mobilePushManager.setTags({
      currentRide: '',
      hasActiveRide: 'false'
    });
  },

  /**
   * Set location tags
   */
  async setLocationTags(city, state) {
    return await mobilePushManager.setTags({
      city: city || '',
      state: state || ''
    });
  },

  /**
   * Get push notification status
   */
  getStatus() {
    return mobilePushManager.getStatus();
  }
};
