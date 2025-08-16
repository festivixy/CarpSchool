import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook for managing native iOS navigation bars
 * Provides interface to native iOS navbar functionality
 */
export const useNativeNavBar = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iosVersion, setIOSVersion] = useState(null);
  const navBarsRef = useRef(new Map());
  const actionHandlerRef = useRef(null);
  const actionHandlersRegistry = useRef(new Map()); // Registry of handlers by navBarId
  const masterHandlerSet = useRef(false); // Track if master handler is already set

  useEffect(() => {
    const checkSupport = async () => {
      console.log("[useNativeNavBar] 🔍 Starting support check:", {
        hasCordova: !!window.cordova,
        hasPlugin: !!window.cordova?.plugins?.NativeNavBar,
        hasPromise: !!window.cordova?.plugins?.NativeNavBar?.promise,
      });

      try {
        if (window.cordova?.plugins?.NativeNavBar) {
          console.log("[useNativeNavBar] 🚀 Calling isSupported()...");

          // Get iOS version first
          const version = await window.cordova.plugins.NativeNavBar.promise.getIOSVersion();
          setIOSVersion(version);
          console.log("[useNativeNavBar] 📱 iOS Version:", version);

          // Check if native navbar is supported (should be true for all iOS versions)
          const supported = await window.cordova.plugins.NativeNavBar.promise.isSupported();
          console.log("[useNativeNavBar] ✅ Support check result:", supported);
          setIsSupported(supported);
        } else {
          console.log("[useNativeNavBar] ❌ Plugin not found");
          setIsSupported(false);
        }
      } catch (error) {
        console.error("[useNativeNavBar] ❌ Support check error:", error);
        setIsSupported(false);
      } finally {
        console.log("[useNativeNavBar] 🏁 Support check complete, setting loading false");
        setIsLoading(false);
      }
    };

    console.log("[useNativeNavBar] 🎬 useEffect triggered:", {
      hasCordova: !!window.cordova,
      deviceReady: !!window.cordova,
    });

    if (window.cordova) {
      console.log("[useNativeNavBar] 📱 Cordova available, checking support immediately");
      checkSupport();
      return undefined; // Explicit return for consistency
    }

    console.log("[useNativeNavBar] ⏳ Waiting for deviceready event");
    const onDeviceReady = () => {
      console.log("[useNativeNavBar] 🎉 Device ready event fired");
      checkSupport();
    };
    document.addEventListener("deviceready", onDeviceReady);

    // Add timeout for web environments where deviceready never fires
    const webTimeout = setTimeout(() => {
      console.log("[useNativeNavBar] ⏰ Web timeout - deviceready never fired, proceeding with web mode");
      setIsSupported(false);
      setIsLoading(false);
    }, 2000); // 2 second timeout

    return () => {
      document.removeEventListener("deviceready", onDeviceReady);
      clearTimeout(webTimeout);
    };
  }, []);

  // Master action handler that routes to specific navbar handlers
  const masterActionHandler = useCallback((navBarId, action, itemIndex) => {
    console.log("[useNativeNavBar] 🎯 Master action handler called:", {
      navBarId,
      action,
      itemIndex,
      registeredHandlers: actionHandlersRegistry.current.size,
    });

    // Try to find a specific handler for this navBarId
    const specificHandler = actionHandlersRegistry.current.get(navBarId);
    if (specificHandler) {
      console.log("[useNativeNavBar] 📍 Found specific handler for navBarId:", navBarId);
      specificHandler(navBarId, action, itemIndex);
      return;
    }

    // Fallback to the default action handler
    if (actionHandlerRef.current) {
      console.log("[useNativeNavBar] 🔄 Using fallback action handler");
      actionHandlerRef.current(navBarId, action, itemIndex);
    } else {
      console.warn("[useNativeNavBar] ⚠️ No action handler found for navBarId:", navBarId);
    }
  }, []);

  // Register a specific action handler for a navBarId
  const registerActionHandler = useCallback((navBarId, handler) => {
    console.log("[useNativeNavBar] 📝 Registering action handler for navBarId:", navBarId);
    actionHandlersRegistry.current.set(navBarId, handler);

    // Set the master action handler only once
    if (window.cordova?.plugins?.NativeNavBar && !masterHandlerSet.current) {
      console.log("[useNativeNavBar] 🎯 Setting master action handler (first time)");
      window.cordova.plugins.NativeNavBar.setActionHandler(masterActionHandler);
      masterHandlerSet.current = true;
    } else if (masterHandlerSet.current) {
      console.log("[useNativeNavBar] ✅ Master action handler already set, skipping");
    }
  }, [masterActionHandler]);

  // Unregister action handler for a navBarId
  const unregisterActionHandler = useCallback((navBarId) => {
    console.log("[useNativeNavBar] 🗑️ Unregistering action handler for navBarId:", navBarId);
    actionHandlersRegistry.current.delete(navBarId);
  }, []);

  const setActionHandler = useCallback((handler) => {
    console.log("[useNativeNavBar] 🎛️ setActionHandler called (legacy):", {
      hasHandler: !!handler,
      hasPlugin: !!window.cordova?.plugins?.NativeNavBar,
      masterHandlerAlreadySet: masterHandlerSet.current,
    });

    actionHandlerRef.current = handler;

    if (window.cordova?.plugins?.NativeNavBar && !masterHandlerSet.current) {
      console.log("[useNativeNavBar] 🎯 Setting master action handler (legacy call)");
      window.cordova.plugins.NativeNavBar.setActionHandler(masterActionHandler);
      masterHandlerSet.current = true;
    } else if (masterHandlerSet.current) {
      console.log("[useNativeNavBar] ✅ Master action handler already set, preserving it");
    } else {
      console.warn("[useNativeNavBar] ⚠️ Cannot set action handler - plugin not available");
    }
  }, [masterActionHandler]);

  const createNavBar = useCallback(async (options = {}) => {
    console.log("[useNativeNavBar] 🏗️ createNavBar called:", {
      isSupported,
      hasPlugin: !!window.cordova?.plugins?.NativeNavBar,
      options,
    });

    if (!isSupported || !window.cordova?.plugins?.NativeNavBar) {
      const error = new Error("Native navbar not supported");
      console.error("[useNativeNavBar] ❌ Cannot create navbar:", error.message);
      throw error;
    }

    try {
      console.log("[useNativeNavBar] 🚀 Calling native createNavBar with options:", options);
      const navBarId = await window.cordova.plugins.NativeNavBar.promise.createNavBar(options);
      console.log("[useNativeNavBar] ✅ Native navbar created successfully:", navBarId);

      navBarsRef.current.set(navBarId, options);
      console.log("[useNativeNavBar] 📝 NavBar stored in ref, total navbars:", navBarsRef.current.size);

      return navBarId;
    } catch (error) {
      console.error("[useNativeNavBar] ❌ Create navbar error:", error);
      throw error;
    }
  }, [isSupported]);

  const setNavBarItems = useCallback(async (navBarId, items) => {
    console.log("[useNativeNavBar] 📋 setNavBarItems called:", {
      navBarId,
      itemCount: items.length,
      hasPlugin: !!window.cordova?.plugins?.NativeNavBar,
    });

    if (!window.cordova?.plugins?.NativeNavBar) {
      throw new Error("Plugin not available");
    }

    try {
      await window.cordova.plugins.NativeNavBar.promise.setNavBarItems(navBarId, items);
      console.log("[useNativeNavBar] ✅ NavBar items set successfully");
    } catch (error) {
      console.error("[useNativeNavBar] ❌ Set navbar items error:", error);
      throw error;
    }
  }, []);

  const setActiveItem = useCallback(async (navBarId, itemIndex) => {
    console.log("[useNativeNavBar] 🎯 setActiveItem called:", {
      navBarId,
      itemIndex,
    });

    if (!window.cordova?.plugins?.NativeNavBar) {
      throw new Error("Plugin not available");
    }

    try {
      await window.cordova.plugins.NativeNavBar.promise.setActiveItem(navBarId, itemIndex);
      console.log("[useNativeNavBar] ✅ Active item set successfully");
    } catch (error) {
      console.error("[useNativeNavBar] ❌ Set active item error:", error);
      throw error;
    }
  }, []);

  const showNavBar = useCallback(async (navBarId) => {
    console.log("[useNativeNavBar] ����️ showNavBar called:", navBarId);

    if (!window.cordova?.plugins?.NativeNavBar) {
      throw new Error("Plugin not available");
    }

    try {
      await window.cordova.plugins.NativeNavBar.promise.showNavBar(navBarId);
      console.log("[useNativeNavBar] ✅ NavBar shown successfully");
    } catch (error) {
      console.error("[useNativeNavBar] ❌ Show navbar error:", error);
      throw error;
    }
  }, []);

  const hideNavBar = useCallback(async (navBarId) => {
    console.log("[useNativeNavBar] 🙈 hideNavBar called:", navBarId);

    if (!window.cordova?.plugins?.NativeNavBar) {
      throw new Error("Plugin not available");
    }

    try {
      await window.cordova.plugins.NativeNavBar.promise.hideNavBar(navBarId);
      console.log("[useNativeNavBar] ✅ NavBar hidden successfully");
    } catch (error) {
      console.error("[useNativeNavBar] ❌ Hide navbar error:", error);
      throw error;
    }
  }, []);

  const removeNavBar = useCallback(async (navBarId) => {
    console.log("[useNativeNavBar] 🗑️ removeNavBar called:", navBarId);

    if (!window.cordova?.plugins?.NativeNavBar) {
      throw new Error("Plugin not available");
    }

    try {
      await window.cordova.plugins.NativeNavBar.promise.removeNavBar(navBarId);
      navBarsRef.current.delete(navBarId);
      console.log("[useNativeNavBar] ✅ NavBar removed successfully");
    } catch (error) {
      console.error("[useNativeNavBar] ❌ Remove navbar error:", error);
      throw error;
    }
  }, []);

  const hideAllNavBars = useCallback(async () => {
    console.log("[useNativeNavBar] 🙈 hideAllNavBars called");

    if (!window.cordova?.plugins?.NativeNavBar) {
      throw new Error("Plugin not available");
    }

    try {
      const result = await window.cordova.plugins.NativeNavBar.promise.hideAllNavBars();
      console.log("[useNativeNavBar] ✅ All navbars hidden:", result);
      return result;
    } catch (error) {
      console.error("[useNativeNavBar] ❌ Hide all navbars error:", error);
      throw error;
    }
  }, []);

  const showAllNavBars = useCallback(async () => {
    console.log("[useNativeNavBar] 👁️ showAllNavBars called");

    if (!window.cordova?.plugins?.NativeNavBar) {
      throw new Error("Plugin not available");
    }

    try {
      const result = await window.cordova.plugins.NativeNavBar.promise.showAllNavBars();
      console.log("[useNativeNavBar] ✅ All navbars shown:", result);
      return result;
    } catch (error) {
      console.error("[useNativeNavBar] ❌ Show all navbars error:", error);
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

    // Global navbar methods
    hideAllNavBars,
    showAllNavBars,

    // New centralized action handler methods
    registerActionHandler,
    unregisterActionHandler,

    // Utility
    navBars: navBarsRef.current,
  };
};

export default useNativeNavBar;
