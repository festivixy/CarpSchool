import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import useNativeNavBar from "../hooks/useNativeNavBar";
import {
  NativeNavBarContainer,
  LoadingIndicator,
  StatusText,
  FallbackContainer,
  FallbackButton,
  FallbackItemIcon,
  FallbackItemText,
  NativeIndicator,
  FallbackIndicator,
} from "../styles/NativeNavBar";

/**
 * NativeNavBar Component
 *
 * Provides native iOS navigation bar using UITabBar
 * Uses standard iOS appearance and works on all iOS versions
 * Falls back gracefully on non-iOS devices
 */
const NativeNavBar = ({
  items = [],
  visible = true,
  onItemPress = null,
  activeIndex = 0,
  className = "",
  style = {},
  history,
  currentUser,
  isAdmin,
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
    registerActionHandler,
    unregisterActionHandler,
  } = useNativeNavBar();

  const [navBarId, setNavBarId] = useState(null);
  const [currentActiveIndex, setCurrentActiveIndex] = useState(activeIndex);
  const navBarRef = useRef(null);

  // Navigation methods - same as MobileNavBarCSS - memoized to prevent re-renders
  const handleNavigation = React.useCallback((path) => {
    history.push(path);
  }, [history]);

  const handleJoinRideClick = React.useCallback(() => {
    console.log("[NativeNavBar] 🔍 Navigating to iOS Join Ride page");
    handleNavigation("/ios/join-ride");
  }, [handleNavigation]);

  const handleAddRidesClick = React.useCallback(() => {
    console.log("[NativeNavBar] ➕ Navigating to iOS Create Ride page");
    handleNavigation("/ios/create-ride");
  }, [handleNavigation]);

  const handleProfileClick = React.useCallback(() => {
    console.log("[NativeNavBar] 👤 Navigating to iOS Profile page");
    handleNavigation("/ios/profile");
  }, [handleNavigation]);

  // Update active index when prop changes
  useEffect(() => {
    setCurrentActiveIndex(activeIndex);
    if (navBarId && isSupported) {
      setActiveItem(navBarId, activeIndex).catch((error) => {
        console.error("[NativeNavBar] ❌ Failed to set active item:", error);
      });
    }
  }, [activeIndex, navBarId, isSupported, setActiveItem]);

  // Set up action handler for native navbar using centralized system
  useEffect(() => {
    console.log("[NativeNavBar] 🎛️ Setting up action handler:", {
      isSupported,
      hasOnItemPress: !!onItemPress,
      itemCount: items.length,
      navBarId,
    });

    if (isSupported && navBarId) {
      console.log("[NativeNavBar] ✅ Registering bottom navbar action handler via centralized system");

      // Use registerActionHandler instead of setActionHandler for the bottom navbar
      registerActionHandler(navBarId, (currentNavBarId, action, itemIndex) => {
        console.log("[NativeNavBar] 🔥 Bottom navbar action triggered:", {
          currentNavBarId,
          action,
          itemIndex,
          item: items[itemIndex],
        });

        const item = items[itemIndex];
        if (item) {
          // Update both local state and native navbar active item
          setCurrentActiveIndex(itemIndex);
          setActiveItem(navBarId, itemIndex).catch((error) => {
            console.error("[NativeNavBar] ❌ Failed to set active item after click:", error);
          });

          // Prioritize onItemPress prop for bridging solution
          if (onItemPress) {
            console.log("[NativeNavBar] 🔗 Delegating to onItemPress handler for bridging");
            onItemPress(item, itemIndex, action);
            return;
          }

          // Handle different navigation items (fallback for standalone usage)
          console.log("[NativeNavBar] 🎯 Processing item with internal handler:", { id: item.id, action: item.action, label: item.label });

          if (item.id === "home" || item.action === "home") {
            console.log("[NativeNavBar] 🏠 Home action triggered");
            const homeLink = currentUser ? "/myRides" : "/";
            handleNavigation(homeLink);
          } else if (item.id === "search" || item.action === "search") {
            console.log("[NativeNavBar] 🔍 Search action triggered - calling handleJoinRideClick");
            handleJoinRideClick();
          } else if (item.id === "add" || item.id === "create" || item.action === "add" || item.action === "create") {
            console.log("[NativeNavBar] ➕ Create action triggered - calling handleAddRidesClick");
            handleAddRidesClick();
          } else if (item.id === "chat" || item.id === "messages" || item.action === "chat" || item.action === "messages") {
            console.log("[NativeNavBar] 💬 Messages action triggered");
            handleNavigation("/chat");
          } else if (item.id === "profile" || item.action === "profile") {
            console.log("[NativeNavBar] 👤 Profile action triggered");
            handleProfileClick();
          } else {
            console.log("[NativeNavBar] ❓ Unknown item action, no handler available");
          }
        }
      });

      // Cleanup registration when component unmounts or navBarId changes
      return () => {
        console.log("[NativeNavBar] 🧹 Unregistering bottom navbar action handler");
        unregisterActionHandler(navBarId);
      };
    }
  }, [isSupported, navBarId, registerActionHandler, unregisterActionHandler, setActiveItem, currentUser, handleNavigation, handleJoinRideClick, handleAddRidesClick, handleProfileClick, onItemPress, items]);

  // Create native navbar when component mounts
  useEffect(() => {
    if (!isSupported || !visible) {
      console.log("[NativeNavBar] ❌ Cannot create navbar:", {
        isSupported,
        visible,
        iosVersion,
      });
      return;
    }

    console.log("[NativeNavBar] 🏗️ Creating native navbar...");

    const createNativeNavBar = async () => {
      try {
        // Create the navbar
        const newNavBarId = await createNavBar({
          position: "bottom",
          safeArea: true,
        });

        console.log("[NativeNavBar]  Native navbar created:", newNavBarId);
        setNavBarId(newNavBarId);

        // Set items
        if (items.length > 0) {
          await setNavBarItems(newNavBarId, items);
          console.log("[NativeNavBar] ✅ NavBar items set");
        }

        // Set active item
        if (currentActiveIndex >= 0 && currentActiveIndex < items.length) {
          await setActiveItem(newNavBarId, currentActiveIndex);
          console.log("[NativeNavBar] ✅ Active item set to:", currentActiveIndex);
        }

        // Show navbar
        await showNavBar(newNavBarId);
        console.log("[NativeNavBar] ✅ Native navbar shown");

      } catch (error) {
        console.error("[NativeNavBar] ❌ Failed to create native navbar:", error);
      }
    };

    createNativeNavBar();

    // Cleanup function
    return () => {
      if (navBarId) {
        console.log("[NativeNavBar] 🧹 Cleaning up navbar:", navBarId);
        removeNavBar(navBarId).catch((error) => {
          console.error("[NativeNavBar] ❌ Cleanup error:", error);
        });
      }
    };
  }, [isSupported, visible, iosVersion]); // Don't include items to avoid recreating

  // Update items when they change
  useEffect(() => {
    if (navBarId && items.length > 0) {
      console.log("[NativeNavBar] 🔄 Updating navbar items");
      setNavBarItems(navBarId, items).then(() => {
        // Restore the current active state after updating items
        console.log("[NativeNavBar] 🔄 Restoring active item after items update:", currentActiveIndex);
        return setActiveItem(navBarId, currentActiveIndex);
      }).catch((error) => {
        console.error("[NativeNavBar] ❌ Failed to update items:", error);
      });
    }
  }, [navBarId, items, setNavBarItems, setActiveItem, currentActiveIndex]);

  // Handle visibility changes
  useEffect(() => {
    if (navBarId) {
      if (visible) {
        showNavBar(navBarId).catch((error) => {
          console.error("[NativeNavBar] ❌ Failed to show navbar:", error);
        });
      } else {
        hideNavBar(navBarId).catch((error) => {
          console.error("[NativeNavBar] ❌ Failed to hide navbar:", error);
        });
      }
    }
  }, [navBarId, visible, showNavBar, hideNavBar]);

  // Loading state
  if (isLoading) {
    console.log("[NativeNavBar] ⏳ Rendering loading state");
    return (
      <LoadingIndicator
        className={className}
        style={style}
        {...props}
      >
        <StatusText>
          Initializing Native NavBar...
        </StatusText>
      </LoadingIndicator>
    );
  }

  // Render based on support and visibility
  if (!isSupported || !visible) {
    console.log("[NativeNavBar] ❌ Not rendering - not supported or not visible:", {
      isSupported,
      visible,
      iosVersion,
      platform: window.cordova ? "Cordova" : "Web",
    });
    return null;
  }

  // Native navbar is supported and visible
  console.log("[NativeNavBar] 🍎 Rendering native navbar:", {
    navBarId,
    activeIndex: currentActiveIndex,
    itemCount: items.length,
    hasNavBarId: !!navBarId,
  });

  // If native navbar was created successfully, render placeholder
    if (navBarId) {
      return (
        <>
          <NativeNavBarContainer
            ref={navBarRef}
            className={className}
            style={style}
            {...props}
          >
            <NativeIndicator>
              Native iOS
            </NativeIndicator>
          </NativeNavBarContainer>

        </>
      );
    }

    // Native navbar creation failed - render fallback CSS navbar
    console.log("[NativeNavBar] 🔄 Rendering fallback CSS navbar - native creation failed");
    return (
      <FallbackContainer
        ref={navBarRef}
        className={className}
        style={style}
        {...props}
      >
        {items.map((item, index) => (
          <FallbackButton
            key={item.id || index}
            isActive={index === currentActiveIndex}
            onClick={() => {
              setCurrentActiveIndex(index);

              // Handle different navigation items
              if (item.id === "home" || item.action === "home") {
                const homeLink = currentUser ? "/myRides" : "/";
                handleNavigation(homeLink);
              } else if (item.id === "search" || item.action === "search") {
                handleJoinRideClick();
              } else if (item.id === "add" || item.id === "create" || item.action === "add" || item.action === "create") {
                handleAddRidesClick();
              } else if (item.id === "chat" || item.id === "messages" || item.action === "chat" || item.action === "messages") {
                handleNavigation("/chat");
            } else if (item.id === "profile" || item.action === "profile") {
              handleProfileClick();
              } else if (onItemPress) {
                // Fallback to custom handler
                onItemPress(item, index, item.action);
              }
            }}
          >
            <FallbackItemIcon>
              {item.icon}
            </FallbackItemIcon>
            <FallbackItemText>
              {item.label}
            </FallbackItemText>
          </FallbackButton>
        ))}

        <FallbackIndicator>
          CSS Fallback
        </FallbackIndicator>

      </FallbackContainer>
    );
};

NativeNavBar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      action: PropTypes.string,
      disabled: PropTypes.bool,
    }),
  ),
  visible: PropTypes.bool,
  onItemPress: PropTypes.func,
  activeIndex: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  history: PropTypes.object.isRequired, // React Router history
  currentUser: PropTypes.object,
  isAdmin: PropTypes.bool,
};

export default withRouter(withTracker(() => {
  const currentUser = Meteor.user();
  const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes("admin");

  return {
    currentUser,
    isAdmin,
  };
})(NativeNavBar));
