import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { useNativeNavBar } from "../hooks/useNativeNavBar";
import { isAdminRole } from "../../../desktop/components/NavBarRoleUtils";
import JoinRideModal from "../../../components/JoinRideModal";
import {
  NativeNavBarContainer,
  LoadingIndicator,
  StatusText,
  FallbackContainer,
  FallbackButton,
  FallbackItemIcon,
  FallbackItemText,
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
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const navBarRef = useRef(null);

  // Navigation methods - same as MobileNavBarCSS - memoized to prevent re-renders
  const handleNavigation = React.useCallback((path) => {
    if (history) {
      history.push(path);
    }
  }, [history]);

  const handleJoinRideClick = React.useCallback(() => {
    setJoinModalOpen(true);
  }, []);

  const handleAddRidesClick = React.useCallback(() => {
    handleNavigation("/create");
  }, [handleNavigation]);

  const handleProfileClick = React.useCallback(() => {
    handleNavigation("/mobile/profile");
  }, [handleNavigation]);

  // Update active index when prop changes
  useEffect(() => {
    setCurrentActiveIndex(activeIndex);
    if (navBarId && isSupported) {
      setActiveItem(navBarId, activeIndex).catch((error) => {
        console.error("[NativeNavBar] Failed to set active item:", error);
      });
    }
  }, [activeIndex, navBarId, isSupported, setActiveItem]);

  // Set up action handler for native navbar using centralized system
  useEffect(() => {

    if (isSupported && navBarId) {

      // Use registerActionHandler instead of setActionHandler for the bottom navbar
      registerActionHandler(navBarId, (currentNavBarId, action, itemIndex) => {

        const item = items[itemIndex];
        if (item) {
          // Update both local state and native navbar active item
          setCurrentActiveIndex(itemIndex);
          setActiveItem(navBarId, itemIndex).catch((error) => {
            console.error("[NativeNavBar] Failed to set active item after click:", error);
          });

          // Prioritize onItemPress prop for bridging solution
          if (onItemPress) {
            onItemPress(item, itemIndex, action);
            return;
          }

          // Handle different navigation items (fallback for standalone usage)

          if (item.id === "home" || item.action === "home") {
            const homeLink = currentUser ? "/my-rides" : "/";
            handleNavigation(homeLink);
          } else if (item.id === "search" || item.action === "search") {
            handleJoinRideClick();
          } else if (
            item.id === "add" || item.id === "create" ||
            item.action === "add" || item.action === "create"
          ) {
            handleAddRidesClick();
          } else if (
            item.id === "chat" || item.id === "messages" ||
            item.action === "chat" || item.action === "messages"
          ) {
            handleNavigation("/chat");
          } else if (item.id === "profile" || item.action === "profile") {
            handleProfileClick();
          } else if (item.path) {
            handleNavigation(item.path);
          }
        }
      });

      // Cleanup registration when component unmounts or navBarId changes
      return () => {
        unregisterActionHandler(navBarId);
      };
    }

    return undefined; // Explicit return for consistency
  }, [
    isSupported, navBarId, registerActionHandler, unregisterActionHandler, setActiveItem,
    currentUser, handleNavigation, handleJoinRideClick, handleAddRidesClick, handleProfileClick,
    onItemPress, items,
  ]);

  // Create native navbar when component mounts
  useEffect(() => {
    if (!isSupported || !visible) {
      return;
    }

    const createNativeNavBar = async () => {
      try {
        // Create the navbar
        const newNavBarId = await createNavBar({
          position: "bottom",
          safeArea: true,
        });

        setNavBarId(newNavBarId);

        // Set items
        if (items.length > 0) {
          await setNavBarItems(newNavBarId, items);
        }

        // Set active item
        if (currentActiveIndex >= 0 && currentActiveIndex < items.length) {
          await setActiveItem(newNavBarId, currentActiveIndex);
        }

        // Show navbar
        await showNavBar(newNavBarId);

      } catch (error) {
        console.error("[NativeNavBar] Failed to create native navbar:", error);
      }
    };

    createNativeNavBar();

    // Cleanup function
    // eslint-disable-next-line consistent-return
    return () => {
      if (navBarId) {
        removeNavBar(navBarId).catch((error) => {
          console.error("[NativeNavBar] Cleanup error:", error);
        });
      }
    };
  }, [isSupported, visible, iosVersion]); // Don't include items to avoid recreating

  // Update items when they change
  useEffect(() => {
    if (navBarId && items.length > 0) {
      setNavBarItems(navBarId, items).then(() => (
        // Restore the current active state after updating items
        setActiveItem(navBarId, currentActiveIndex)
      )).catch((error) => {
        console.error("[NativeNavBar] Failed to update items:", error);
      });
    }
  }, [navBarId, items, setNavBarItems, setActiveItem, currentActiveIndex]);

  // Handle visibility changes
  useEffect(() => {
    if (navBarId) {
      if (visible) {
        showNavBar(navBarId).catch((error) => {
          console.error("[NativeNavBar] Failed to show navbar:", error);
        });
      } else {
        hideNavBar(navBarId).catch((error) => {
          console.error("[NativeNavBar] Failed to hide navbar:", error);
        });
      }
    }
  }, [navBarId, visible, showNavBar, hideNavBar]);

  // Loading state
  if (isLoading) {
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
    return null;
  }

  // If native navbar was created successfully, render placeholder
    if (navBarId) {
      return (
        <>
          <NativeNavBarContainer
            ref={navBarRef}
            className={className}
            style={style}
            {...props}
          />
          <JoinRideModal open={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
        </>
      );
    }

    // Native navbar creation failed - render fallback CSS navbar
    return (
      <>
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
                const homeLink = currentUser ? "/my-rides" : "/";
                handleNavigation(homeLink);
              } else if (item.id === "search" || item.action === "search") {
                handleJoinRideClick();
              } else if (
                item.id === "add" || item.id === "create" ||
                item.action === "add" || item.action === "create"
              ) {
                handleAddRidesClick();
              } else if (
                item.id === "chat" || item.id === "messages" ||
                item.action === "chat" || item.action === "messages"
              ) {
                handleNavigation("/chat");
            } else if (item.id === "profile" || item.action === "profile") {
              handleProfileClick();
              } else if (item.path) {
                handleNavigation(item.path);
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
      </FallbackContainer>
      <JoinRideModal open={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
      </>
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
  const isAdmin = isAdminRole(currentUser);

  return {
    currentUser,
    isAdmin,
  };
})(NativeNavBar));
