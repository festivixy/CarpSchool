import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import useNativeiOS26NavBar from "../hooks/useNativeiOS26NavBar";

/**
 * iOS26NativeNavBar Component
 *
 * Provides true native iOS 26 liquid glass navigation bar
 * Uses UITabBar with iOS 26 system materials for authentic look
 * Falls back gracefully on non-iOS 26 devices
 */
const iOS26NativeNavBar = ({
  items = [],
  visible = true,
  onItemPress = null,
  activeIndex = 0,
  className = "",
  style = {},
  ...props
}) => {
  const {
    isSupported,
    isLoading,
    iosVersion,
    createNavBar,
    setNavBarItems,
    setActiveItem,
    showNavBar,
    hideNavBar,
    removeNavBar,
    setActionHandler,
  } = useNativeiOS26NavBar();

  const [navBarId, setNavBarId] = useState(null);
  const [currentActiveIndex, setCurrentActiveIndex] = useState(activeIndex);
  const navBarRef = useRef(null);

  // Update active index when prop changes
  useEffect(() => {
    setCurrentActiveIndex(activeIndex);
    if (navBarId && isSupported) {
      setActiveItem(navBarId, activeIndex).catch((error) => {
        console.error("[iOS26NativeNavBar] ❌ Failed to set active item:", error);
      });
    }
  }, [activeIndex, navBarId, isSupported, setActiveItem]);

  // Set up action handler for native navbar
  useEffect(() => {
    console.log("[iOS26NativeNavBar] 🎛️ Setting up action handler:", {
      isSupported,
      hasOnItemPress: !!onItemPress,
      itemCount: items.length,
    });

    if (isSupported && onItemPress) {
      console.log("[iOS26NativeNavBar] ✅ Registering native action handler");
      setActionHandler((navBarId, action, itemIndex) => {
        console.log("[iOS26NativeNavBar] 🔥 Native action triggered:", {
          navBarId,
          action,
          itemIndex,
          item: items[itemIndex],
        });

        const item = items[itemIndex];
        if (item && onItemPress) {
          setCurrentActiveIndex(itemIndex);
          onItemPress(item, itemIndex, action);
        }
      });
    }
  }, [isSupported, onItemPress, items, setActionHandler]);

  // Create native navbar when component mounts
  useEffect(() => {
    if (!isSupported || !visible) {
      console.log("[iOS26NativeNavBar] ❌ Cannot create navbar:", {
        isSupported,
        visible,
        iosVersion,
      });
      return;
    }

    console.log("[iOS26NativeNavBar] 🏗️ Creating native navbar...");

    const createNativeNavBar = async () => {
      try {
        // Create the navbar
        const newNavBarId = await createNavBar({
          position: "bottom",
          blurStyle: "systemMaterial",
          safeArea: true,
        });

        console.log("[iOS26NativeNavBar] ✅ Native navbar created:", newNavBarId);
        setNavBarId(newNavBarId);

        // Set items
        if (items.length > 0) {
          await setNavBarItems(newNavBarId, items);
          console.log("[iOS26NativeNavBar] ✅ NavBar items set");
        }

        // Set active item
        if (currentActiveIndex >= 0 && currentActiveIndex < items.length) {
          await setActiveItem(newNavBarId, currentActiveIndex);
          console.log("[iOS26NativeNavBar] ✅ Active item set to:", currentActiveIndex);
        }

        // Show navbar
        await showNavBar(newNavBarId);
        console.log("[iOS26NativeNavBar] ✅ Native navbar shown");

      } catch (error) {
        console.error("[iOS26NativeNavBar] ❌ Failed to create native navbar:", error);
      }
    };

    createNativeNavBar();

    // Cleanup function
    return () => {
      if (navBarId) {
        console.log("[iOS26NativeNavBar] 🧹 Cleaning up navbar:", navBarId);
        removeNavBar(navBarId).catch((error) => {
          console.error("[iOS26NativeNavBar] ❌ Cleanup error:", error);
        });
      }
    };
  }, [isSupported, visible, iosVersion]); // Don't include items to avoid recreating

  // Update items when they change
  useEffect(() => {
    if (navBarId && items.length > 0) {
      console.log("[iOS26NativeNavBar] 🔄 Updating navbar items");
      setNavBarItems(navBarId, items).catch((error) => {
        console.error("[iOS26NativeNavBar] ❌ Failed to update items:", error);
      });
    }
  }, [navBarId, items, setNavBarItems]);

  // Handle visibility changes
  useEffect(() => {
    if (navBarId) {
      if (visible) {
        showNavBar(navBarId).catch((error) => {
          console.error("[iOS26NativeNavBar] ❌ Failed to show navbar:", error);
        });
      } else {
        hideNavBar(navBarId).catch((error) => {
          console.error("[iOS26NativeNavBar] ❌ Failed to hide navbar:", error);
        });
      }
    }
  }, [navBarId, visible, showNavBar, hideNavBar]);

  // Loading state
  if (isLoading) {
    console.log("[iOS26NativeNavBar] ⏳ Rendering loading state");
    return (
      <div
        className={className}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 83,
          backgroundColor: 'rgba(249, 249, 249, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
        {...props}
      >
        <div style={{ fontSize: '14px', color: '#666' }}>
          Initializing Native iOS 26 NavBar...
        </div>
      </div>
    );
  }

  // Not supported - return nothing (let CSS version handle it)
  if (!isSupported) {
    console.log("[iOS26NativeNavBar] ❌ Native navbar not supported:", {
      iosVersion,
      isSupported,
      platform: window.cordova ? 'Cordova' : 'Web',
    });
    return null;
  }

  // Native navbar is active - render invisible placeholder
  if (navBarId && visible) {
    console.log("[iOS26NativeNavBar] 🍎 Rendering native placeholder:", {
      navBarId,
      activeIndex: currentActiveIndex,
      itemCount: items.length,
    });

    return (
      <div
        ref={navBarRef}
        className={className}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 83,
          pointerEvents: 'none', // Let native navbar handle touches
          ...style
        }}
        {...props}
      >
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          fontSize: '10px',
          color: 'rgba(0,0,0,0.3)',
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          Native iOS 26
        </div>
      </div>
    );
  }

  // Hidden state
  return null;
};

iOS26NativeNavBar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      action: PropTypes.string,
      disabled: PropTypes.bool,
    })
  ),
  visible: PropTypes.bool,
  onItemPress: PropTypes.func,
  activeIndex: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default iOS26NativeNavBar;
