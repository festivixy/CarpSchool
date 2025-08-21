import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { oneSignalManager, OneSignalHelpers } from '../utils/oneSignalNotifications';

/**
 * AutoSubscribeNotification Component
 * 
 * Invisible component that automatically handles notification subscription
 * - Runs on every page visit/refresh
 * - Checks if user is subscribed to notifications
 * - Automatically subscribes if not already subscribed
 * - Handles both OneSignal and browser permissions
 * - Respects user preferences and browser limitations
 */
const AutoSubscribeNotification = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    checked: false,
    subscribed: false,
    method: null
  });

  /**
   * Check if user is already subscribed to notifications
   */
  const checkSubscriptionStatus = async () => {
    try {
      // Check browser notification permission
      const browserPermission = Notification?.permission;
      
      // Check OneSignal subscription status
      let oneSignalSubscribed = false;
      if (oneSignalManager.isSupported && window.OneSignal) {
        try {
          oneSignalSubscribed = await oneSignalManager.isEnabled();
        } catch (error) {
          console.log('[AutoSub] OneSignal check failed:', error.message);
        }
      }

      // Check if user has active tokens on server
      let hasServerTokens = false;
      if (Meteor.userId()) {
        try {
          const devices = await OneSignalHelpers.getUserDevices();
          hasServerTokens = devices.length > 0;
        } catch (error) {
          console.log('[AutoSub] Server token check failed:', error.message);
        }
      }

      const isSubscribed = browserPermission === 'granted' && (oneSignalSubscribed || hasServerTokens);
      
      console.log('[AutoSub] Subscription status check:', {
        browserPermission,
        oneSignalSubscribed,
        hasServerTokens,
        isSubscribed
      });

      return {
        isSubscribed,
        browserPermission,
        oneSignalSubscribed,
        hasServerTokens
      };

    } catch (error) {
      console.error('[AutoSub] Status check failed:', error);
      return { isSubscribed: false, error: error.message };
    }
  };

  /**
   * Attempt to automatically subscribe user to notifications
   */
  const attemptAutoSubscribe = async () => {
    if (isProcessing) {
      console.log('[AutoSub] Already processing, skipping...');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('[AutoSub] Starting auto-subscription process...');

      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('[AutoSub] Notifications not supported in this browser');
        setSubscriptionStatus({ checked: true, subscribed: false, method: 'unsupported' });
        return;
      }

      // Check current status first
      const status = await checkSubscriptionStatus();
      
      if (status.isSubscribed) {
        console.log('[AutoSub] User already subscribed');
        setSubscriptionStatus({ checked: true, subscribed: true, method: 'already-subscribed' });
        return;
      }

      // If permission is denied, don't try to subscribe
      if (status.browserPermission === 'denied') {
        console.log('[AutoSub] Browser permission denied, cannot auto-subscribe');
        setSubscriptionStatus({ checked: true, subscribed: false, method: 'permission-denied' });
        return;
      }

      // Attempt auto-subscription
      let subscriptionSuccess = false;
      let subscriptionMethod = null;

      // Method 1: Try OneSignal if available
      if (oneSignalManager.isSupported && !status.oneSignalSubscribed) {
        try {
          console.log('[AutoSub] Attempting OneSignal subscription...');
          
          // Request permission through OneSignal
          const granted = await oneSignalManager.requestPermission();
          
          if (granted) {
            console.log('[AutoSub] OneSignal subscription successful');
            subscriptionSuccess = true;
            subscriptionMethod = 'onesignal';
          }

        } catch (oneSignalError) {
          console.log('[AutoSub] OneSignal subscription failed:', oneSignalError.message);
        }
      }

      // Method 2: Fallback to browser native if OneSignal failed
      if (!subscriptionSuccess && status.browserPermission === 'default') {
        try {
          console.log('[AutoSub] Attempting browser native subscription...');
          
          const permission = await Notification.requestPermission();
          
          if (permission === 'granted') {
            console.log('[AutoSub] Browser native subscription successful');
            subscriptionSuccess = true;
            subscriptionMethod = 'browser-native';
          }

        } catch (nativeError) {
          console.log('[AutoSub] Browser native subscription failed:', nativeError.message);
        }
      }

      // Update status
      setSubscriptionStatus({
        checked: true,
        subscribed: subscriptionSuccess,
        method: subscriptionMethod || 'failed'
      });

      if (subscriptionSuccess) {
        console.log(`[AutoSub] Auto-subscription completed via ${subscriptionMethod}`);
        
        // Set a timestamp to avoid re-subscribing too frequently
        localStorage.setItem('autoSubscribeLastSuccess', Date.now().toString());
      } else {
        console.log('[AutoSub] Auto-subscription failed - user may need to manually enable notifications');
      }

    } catch (error) {
      console.error('[AutoSub] Auto-subscription process failed:', error);
      setSubscriptionStatus({ checked: true, subscribed: false, method: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Check if we should attempt auto-subscription
   */
  const shouldAttemptSubscription = () => {
    // Don't auto-subscribe if user is not logged in
    if (!Meteor.userId()) {
      console.log('[AutoSub] User not logged in, skipping auto-subscription');
      return false;
    }

    // Check cooldown period (don't try more than once per hour)
    const lastSuccess = localStorage.getItem('autoSubscribeLastSuccess');
    if (lastSuccess) {
      const hourAgo = Date.now() - (60 * 60 * 1000);
      if (parseInt(lastSuccess) > hourAgo) {
        console.log('[AutoSub] Cooldown period active, skipping auto-subscription');
        return false;
      }
    }

    // Check if we already attempted in this session
    const sessionKey = 'autoSubscribeAttempted_' + Meteor.userId();
    if (sessionStorage.getItem(sessionKey)) {
      console.log('[AutoSub] Already attempted in this session, skipping');
      return false;
    }

    return true;
  };

  /**
   * Main effect - runs on component mount and user changes
   */
  useEffect(() => {
    let mounted = true;
    let timeoutId = null;

    const runAutoSubscribe = async () => {
      // Wait a bit for OneSignal to initialize
      timeoutId = setTimeout(async () => {
        if (!mounted) return;

        setLastCheck(new Date());

        if (shouldAttemptSubscription()) {
          // Mark as attempted for this session
          const sessionKey = 'autoSubscribeAttempted_' + Meteor.userId();
          sessionStorage.setItem(sessionKey, 'true');

          await attemptAutoSubscribe();
        } else {
          // Still check status even if we don't attempt subscription
          const status = await checkSubscriptionStatus();
          setSubscriptionStatus({
            checked: true,
            subscribed: status.isSubscribed,
            method: status.isSubscribed ? 'pre-existing' : 'skipped'
          });
        }
      }, 2000); // 2 second delay to allow for initialization
    };

    // Run when component mounts
    runAutoSubscribe();

    // Setup reactive tracker for user changes
    const computation = Tracker.autorun(() => {
      const userId = Meteor.userId();
      if (userId && mounted) {
        // User logged in, check if we should auto-subscribe
        runAutoSubscribe();
      }
    });

    // Cleanup
    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      computation.stop();
    };
  }, []);

  /**
   * Development helper - log status changes
   */
  useEffect(() => {
    if (subscriptionStatus.checked) {
      console.log('[AutoSub] Final status:', subscriptionStatus);
    }
  }, [subscriptionStatus]);

  // This component renders nothing (invisible)
  return null;
};

export default AutoSubscribeNotification;
