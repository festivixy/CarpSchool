import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for managing iOS 26 native navigation bars
 * Provides interface to native iOS 26 liquid glass navbar functionality
 */
export const useNativeiOS26NavBar = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iosVersion, setIOSVersion] = useState(null);
  const navBarsRef = useRef(new Map());
  const actionHandlerRef = useRef(null);

  useEffect(() => {
    const checkSupport = async () => {
      console.log("[useNativeiOS26NavBar] 🔍 Starting support check:", {
        hasCordova: !!window.cordova,
        hasPlugin: !!window.cordova?.plugins?.iOS26NavBar,
        hasPromise: !!window.cordova?.plugins?.iOS26NavBar?.promise,
      });

      try {
        if (window.cordova?.plugins?.iOS26NavBar) {
          console.log("[useNativeiOS26NavBar] 🚀 Calling isSupported()...");
          
          // Get iOS version first
          const version = await window.cordova.plugins.iOS26NavBar.promise.getIOSVersion();
          setIOSVersion(version);
          console.log("[useNativeiOS26NavBar] 📱 iOS Version:", version);
          
          // Check if iOS 26+ native liquid glass is supported
          const supported = await window.cordova.plugins.iOS26NavBar.promise.isSupported();
          console.log("[useNativeiOS26NavBar] ✅ Support check result:", supported);
          setIsSupported(supported);
        } else {
          console.log("[useNativeiOS26NavBar] ❌ Plugin not found");
          setIsSupported(false);
        }
      } catch (error) {
        console.error("[useNativeiOS26NavBar] ❌ Support check error:", error);
        setIsSupported(false);
      } finally {
        console.log("[useNativeiOS26NavBar] 🏁 Support check complete, setting loading false");
        setIsLoading(false);
      }
    };

    console.log("[useNativeiOS26NavBar] 🎬 useEffect triggered:", {
      hasCordova: !!window.cordova,
      deviceReady: !!window.cordova,
    });

    if (window.cordova) {
      console.log("[useNativeiOS26NavBar] 📱 Cordova available, checking support immediately");
      checkSupport();
    } else {
      console.log("[useNativeiOS26NavBar] ⏳ Waiting for deviceready event");
      const onDeviceReady = () => {
        console.log("[useNativeiOS26NavBar] 🎉 Device ready event fired");
        checkSupport();
      };
      document.addEventListener("deviceready", onDeviceReady);

      // Add timeout for web environments where deviceready never fires
      const webTimeout = setTimeout(() => {
        console.log("[useNativeiOS26NavBar] ⏰ Web timeout - deviceready never fired, proceeding with web mode");
        setIsSupported(false);
        setIsLoading(false);
      }, 2000); // 2 second timeout

      return () => {
        document.removeEventListener("deviceready", onDeviceReady);
        clearTimeout(webTimeout);
      };
    }
  }, []);

  const setActionHandler = useCallback((handler) => {
    console.log("[useNativeiOS26NavBar] 🎛️ setActionHandler called:", {
      hasHandler: !!handler,
      hasPlugin: !!window.cordova?.plugins?.iOS26NavBar,
    });

    actionHandlerRef.current = handler;

    if (window.cordova?.plugins?.iOS26NavBar) {
      console.log("[useNativeiOS26NavBar] ✅ Setting native action handler");
      window.cordova.plugins.iOS26NavBar.setActionHandler(handler);
    } else {
      console.warn("[useNativeiOS26NavBar] ⚠️ Cannot set action handler - plugin not available");
    }
  }, []);

  const createNavBar = useCallback(async (options = {}) => {
    console.log("[useNativeiOS26NavBar] 🏗️ createNavBar called:", {
      isSupported,
      hasPlugin: !!window.cordova?.plugins?.iOS26NavBar,
      options,
    });

    if (!isSupported || !window.cordova?.plugins?.iOS26NavBar) {
      const error = new Error("Native iOS 26 navbar not supported");
      console.error("[useNativeiOS26NavBar] ❌ Cannot create navbar:", error.message);
      throw error;
    }

    try {
      console.log("[useNativeiOS26NavBar] 🚀 Calling native createNavBar with options:", options);
      const navBarId = await window.cordova.plugins.iOS26NavBar.promise.createNavBar(options);
      console.log("[useNativeiOS26NavBar] ✅ Native navbar created successfully:", navBarId);

      navBarsRef.current.set(navBarId, options);
      console.log("[useNativeiOS26NavBar] 📝 NavBar stored in ref, total navbars:", navBarsRef.current.size);

      return navBarId;
    } catch (error) {
      console.error("[useNativeiOS26NavBar] ❌ Create navbar error:", error);
      throw error;
    }
  }, [isSupported]);

  const setNavBarItems = useCallback(async (navBarId, items) => {
    console.log("[useNativeiOS26NavBar] ���� setNavBarItems called:", {
      navBarId,
      itemCount: items.length,
      hasPlugin: !!window.cordova?.plugins?.iOS26NavBar,
    });

    if (!window.cordova?.plugins?.iOS26NavBar) {
      throw new Error("Plugin not available");
    }

    try {
      await window.cordova.plugins.iOS26NavBar.promise.setNavBarItems(navBarId, items);
      console.log("[useNativeiOS26NavBar] ✅ NavBar items set successfully");
    } catch (error) {
      console.error("[useNativeiOS26NavBar] ❌ Set navbar items error:", error);
      throw error;
    }
  }, []);

  const setActiveItem = useCallback(async (navBarId, itemIndex) => {
    console.log("[useNativeiOS26NavBar] 🎯 setActiveItem called:", {
      navBarId,
      itemIndex,
    });

    if (!window.cordova?.plugins?.iOS26NavBar) {
      throw new Error("Plugin not available");
    }

    try {
      await window.cordova.plugins.iOS26NavBar.promise.setActiveItem(navBarId, itemIndex);
      console.log("[useNativeiOS26NavBar] ✅ Active item set successfully");
    } catch (error) {
      console.error("[useNativeiOS26NavBar] ❌ Set active item error:", error);
      throw error;
    }
  }, []);

  const showNavBar = useCallback(async (navBarId) => {
    console.log("[useNativeiOS26NavBar] 👁️ showNavBar called:", navBarId);

    if (!window.cordova?.plugins?.iOS26NavBar) {
      throw new Error("Plugin not available");
    }

    try {
      await window.cordova.plugins.iOS26NavBar.promise.showNavBar(navBarId);
      console.log("[useNativeiOS26NavBar] ✅ NavBar shown successfully");
    } catch (error) {
      console.error("[useNativeiOS26NavBar] ❌ Show navbar error:", error);
      throw error;
    }
  }, []);

  const hideNavBar = useCallback(async (navBarId) => {
    console.log("[useNativeiOS26NavBar] 🙈 hideNavBar called:", navBarId);

    if (!window.cordova?.plugins?.iOS26NavBar) {
      throw new Error("Plugin not available");
    }

    try {
      await window.cordova.plugins.iOS26NavBar.promise.hideNavBar(navBarId);
      console.log("[useNativeiOS26NavBar] ✅ NavBar hidden successfully");
    } catch (error) {
      console.error("[useNativeiOS26NavBar] ❌ Hide navbar error:", error);
      throw error;
    }
  }, []);

  const removeNavBar = useCallback(async (navBarId) => {
    console.log("[useNativeiOS26NavBar] 🗑️ removeNavBar called:", navBarId);

    if (!window.cordova?.plugins?.iOS26NavBar) {
      throw new Error("Plugin not available");
    }

    try {
      await window.cordova.plugins.iOS26NavBar.promise.removeNavBar(navBarId);
      navBarsRef.current.delete(navBarId);
      console.log("[useNativeiOS26NavBar] ✅ NavBar removed successfully");
    } catch (error) {
      console.error("[useNativeiOS26NavBar] ❌ Remove navbar error:", error);
      throw error;
    }
  }, []);

  return {
    // State
    isSupported,
    isLoading,
    iosVersion,
    
    // Methods
    createNavBar,
    setNavBarItems,
    setActiveItem,
    showNavBar,
    hideNavBar,
    removeNavBar,
    setActionHandler,
    
    // Utility
    navBars: navBarsRef.current,
  };
};

export default useNativeiOS26NavBar;
