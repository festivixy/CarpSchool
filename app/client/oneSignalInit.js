import { Meteor } from 'meteor/meteor';

/**
 * OneSignal Initialization with Environment Variable Support
 * 
 * Configuration priority:
 * 1. Meteor.settings.public.oneSignal
 * 2. Environment variables (via server method)
 * 3. Fallback to hardcoded values
 */

// Initialize OneSignal when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get OneSignal configuration
    const config = await getOneSignalConfig();
    
    if (!config.appId) {
      console.warn('[OneSignal] No app ID configured, skipping initialization');
      return;
    }

    console.log('[OneSignal] Initializing with app ID:', config.appId);

    // Initialize OneSignal
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(async function(OneSignal) {
      await OneSignal.init({
        appId: config.appId,
        safari_web_id: config.safariWebId,
        notifyButton: {
          enable: false, // We handle permissions manually in our test interface
        },
        allowLocalhostAsSecureOrigin: true,
        // Disable default welcome/subscription notifications
        welcomeNotification: {
          disable: true
        }
      });

      console.log('[OneSignal] Initialization completed');
    });

  } catch (error) {
    console.error('[OneSignal] Initialization failed:', error);
  }
});

/**
 * Get OneSignal configuration from multiple sources
 */
async function getOneSignalConfig() {
  let config = {
    appId: null,
    safariWebId: null
  };

  // Method 1: Try Meteor.settings.public (preferred)
  if (Meteor.settings?.public?.oneSignal) {
    const settings = Meteor.settings.public.oneSignal;
    
    if (settings.appId) {
      config.appId = settings.appId;
      config.safariWebId = settings.safariWebId;
      console.log('[OneSignal] Using configuration from Meteor.settings.public');
      return config;
    }
  }

  // Method 2: Try to get from server (environment variables)
  try {
    const serverConfig = await Meteor.callAsync('oneSignal.getConfig');
    if (serverConfig?.appId) {
      config = serverConfig;
      console.log('[OneSignal] Using configuration from server environment variables');
      return config;
    }
  } catch (error) {
    console.log('[OneSignal] Could not get config from server:', error.reason || error.message);
  }

  // Method 3: Fallback to hardcoded values (for backward compatibility)
  console.warn('[OneSignal] Using fallback hardcoded configuration');
  config = {
    appId: "a1f06572-fc69-4ec0-9402-b6e8a56bf14c",
    safariWebId: "web.onesignal.auto.313afc18-65a3-4cb5-bd8a-eabd69c6e4d8"
  };

  return config;
}
