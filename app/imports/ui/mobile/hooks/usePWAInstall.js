import { useState, useEffect } from 'react';

/**
 * Custom hook for managing PWA installation state and functionality
 * Only shows on mobile devices (iOS/Android) and tracks if shown before
 */
export const usePWAInstall = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  // Device detection
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;
  const isRunningAsPWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  /**
   * Check if app is installable based on URL hash (kept for compatibility)
   */
  const checkInstallHash = () => {
    const hash = window.location.hash;
    return hash.startsWith('#pwa'); // Includes #pwa-install, #pwa-auto-show, etc.
  };

  /**
   * Check if prompt has been shown before
   */
  const getHasBeenShown = () => {
    try {
      return localStorage.getItem('pwa-install-prompt-shown') === 'true';
    } catch (error) {
      console.warn('[PWA] localStorage not available:', error);
      return false;
    }
  };

  /**
   * Mark prompt as shown in localStorage
   */
  const markAsShown = () => {
    try {
      localStorage.setItem('pwa-install-prompt-shown', 'true');
      setHasBeenShown(true);
    } catch (error) {
      console.warn('[PWA] Could not save to localStorage:', error);
    }
  };

  /**
   * Show the install prompt (only on mobile, only once)
   */
  const showInstallPrompt = () => {
    if (!isMobile || isRunningAsPWA || hasBeenShown) {
      return;
    }

    setIsVisible(true);
    markAsShown();
    window.location.hash = '#pwa-install';
  };

  /**
   * Force show the install prompt (for testing/debugging)
   */
  const forceShowInstallPrompt = () => {
    console.log('[PWA] Force showing install prompt');
    setIsVisible(true);
    window.location.hash = '#pwa-install';
  };

  /**
   * Hide the install prompt
   */
  const hideInstallPrompt = () => {
    setIsVisible(false);
    if (window.location.hash.startsWith('#pwa')) {
      window.location.hash = '';
    }
  };

  /**
   * Initialize hasBeenShown state from localStorage
   */
  useEffect(() => {
    setHasBeenShown(getHasBeenShown());
  }, []);

  /**
   * Handle hash changes to show/hide prompt (hash overrides show-once logic)
   */
  useEffect(() => {
    const handleHashChange = () => {
      const hashIndicatesShow = checkInstallHash();

      console.log('[PWA Debug]', {
        hash: window.location.hash,
        hashIndicatesShow,
        isMobile,
        isRunningAsPWA,
        hasBeenShown
      });

      if (hashIndicatesShow) {
        // Hash overrides all restrictions except PWA check
        const shouldShow = !isRunningAsPWA;
        console.log('[PWA Debug] Hash detected, showing:', shouldShow);
        setIsVisible(shouldShow);

        // Mark as shown for future auto-shows (but hash can still override)
        if (shouldShow && isMobile) {
          markAsShown();
        }
      } else {
        setIsVisible(false);
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isMobile, isRunningAsPWA]);

  /**
   * Check if PWA is already installed
   */
  useEffect(() => {
    setIsInstalled(isRunningAsPWA);

    if (isRunningAsPWA) {
      hideInstallPrompt();
    }
  }, [isRunningAsPWA]);

  /**
   * Auto-show prompt for first-time mobile users
   */
  useEffect(() => {
    console.log('[PWA Auto-Show Debug]', {
      isMobile,
      isRunningAsPWA,
      hasBeenShown,
      shouldAutoShow: isMobile && !isRunningAsPWA && !hasBeenShown
    });

    // Only auto-show for mobile users who haven't seen it and aren't running as PWA
    if (isMobile && !isRunningAsPWA && !hasBeenShown) {
      console.log('[PWA] Auto-showing install prompt for first-time mobile user in 3 seconds...');

      // Delay the auto-show slightly to avoid showing too early
      const autoShowTimeout = setTimeout(() => {
        console.log('[PWA] Triggering auto-show now');
        setIsVisible(true);
        markAsShown();
        window.location.hash = '#pwa-auto-show';
      }, 3000); // 3 second delay after page load

      return () => {
        console.log('[PWA] Auto-show timeout cleared');
        clearTimeout(autoShowTimeout);
      };
    }
  }, [isMobile, isRunningAsPWA, hasBeenShown]);

  /**
   * Listen for beforeinstallprompt to determine installability (mobile only)
   */
  useEffect(() => {
    if (!isMobile || isRunningAsPWA) {
      setCanInstall(false);
      return;
    }

    if (isIOS) {
      // iOS doesn't support beforeinstallprompt, but can still be "installed"
      setCanInstall(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
      hideInstallPrompt();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isMobile, isIOS, isRunningAsPWA]);

  // Expose force show function globally for testing
  if (typeof window !== 'undefined') {
    window.forcePWAPrompt = forceShowInstallPrompt;
  }

  return {
    isVisible,
    canInstall,
    isInstalled,
    hasBeenShown,
    isIOS,
    isAndroid,
    isMobile,
    isRunningAsPWA,
    showInstallPrompt,
    hideInstallPrompt,
    forceShowInstallPrompt
  };
};

export default usePWAInstall;
