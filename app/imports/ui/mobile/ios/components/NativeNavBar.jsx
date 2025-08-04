import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import useNativeNavBar from "../hooks/useNativeNavBar";
import LiquidGlassDropdown from "../../liquidGlass/components/Dropdown";

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
  } = useNativeNavBar();

  const [navBarId, setNavBarId] = useState(null);
  const [currentActiveIndex, setCurrentActiveIndex] = useState(activeIndex);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navBarRef = useRef(null);

  // Update active index when prop changes
  useEffect(() => {
    setCurrentActiveIndex(activeIndex);
    if (navBarId && isSupported) {
      setActiveItem(navBarId, activeIndex).catch((error) => {
        console.error("[NativeNavBar] ❌ Failed to set active item:", error);
      });
    }
  }, [activeIndex, navBarId, isSupported, setActiveItem]);

  // Set up action handler for native navbar
  useEffect(() => {
    console.log("[NativeNavBar] 🎛️ Setting up action handler:", {
      isSupported,
      hasOnItemPress: !!onItemPress,
      itemCount: items.length,
    });

    if (isSupported && onItemPress) {
      console.log("[NativeNavBar] ✅ Registering native action handler");
      setActionHandler((navBarId, action, itemIndex) => {
        console.log("[NativeNavBar] 🔥 Native action triggered:", {
          navBarId,
          action,
          itemIndex,
          item: items[itemIndex],
        });

        const item = items[itemIndex];
        if (item) {
          // Handle profile dropdown specially
          if (item.id === 'profile' || item.action === 'profile') {
            setProfileDropdownOpen(true);
            setCurrentActiveIndex(itemIndex);
          } else {
            setCurrentActiveIndex(itemIndex);
            if (onItemPress) {
              onItemPress(item, itemIndex, action);
            }
          }
        }
      });
    }
  }, [isSupported, onItemPress, items, setActionHandler]);

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

        console.log("[NativeNavBar] �� Native navbar created:", newNavBarId);
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
      setNavBarItems(navBarId, items).catch((error) => {
        console.error("[NativeNavBar] ❌ Failed to update items:", error);
      });
    }
  }, [navBarId, items, setNavBarItems]);

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
          Initializing Native NavBar...
        </div>
      </div>
    );
  }

  // Not supported - return nothing (let CSS version handle it)
  if (!isSupported) {
    console.log("[NativeNavBar] ❌ Native navbar not supported:", {
      iosVersion,
      isSupported,
      platform: window.cordova ? 'Cordova' : 'Web',
    });
    return null;
  }

  // Native navbar is active - render invisible placeholder with dropdown overlay
  if (navBarId && visible) {
    console.log("[NativeNavBar] 🍎 Rendering native placeholder:", {
      navBarId,
      activeIndex: currentActiveIndex,
      itemCount: items.length,
    });

    // Get profile dropdown options
    const getProfileDropdownOptions = () => {
      const currentUser = window.Meteor?.user();
      const isAdmin = currentUser?.profile?.isAdmin;

      if (currentUser) {
        const options = [
          { value: '/editProfile', label: '📋 Edit Profile' },
          { value: '/places', label: '📍 My Places' },
        ];

        if (isAdmin) {
          options.push(
            { value: '/adminRides', label: '🚗 Manage Rides' },
            { value: '/adminUsers', label: '👥 Manage Users' },
            { value: '/adminPlaces', label: '📍 Manage Places' },
            { value: '/_test', label: '🧪 Components Test' }
          );
        }

        options.push({ value: '/signout', label: '🚪 Sign Out' });
        return options;
      } else {
        return [
          { value: '/signin', label: '👤 Sign In' },
          { value: '/signup', label: '📝 Sign Up' },
        ];
      }
    };

    const handleDropdownSelect = (option) => {
      setProfileDropdownOpen(false);
      if (option.value === '/signout') {
        // Handle sign out
        window.FlowRouter?.go('/signout');
      } else {
        // Navigate to selected route
        window.FlowRouter?.go(option.value);
      }
    };

    return (
      <>
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
            Native iOS
          </div>
        </div>

        {/* Profile Dropdown Overlay */}
        {profileDropdownOpen && (
          <div style={{
            position: 'fixed',
            bottom: 100,
            right: 20,
            zIndex: 10000,
            pointerEvents: 'auto',
          }}>
            <LiquidGlassDropdown
              options={getProfileDropdownOptions()}
              placeholder="Profile Menu"
              onSelect={handleDropdownSelect}
              onClose={() => setProfileDropdownOpen(false)}
              isOpen={profileDropdownOpen}
              searchable={false}
            />
          </div>
        )}
      </>
    );
  }

  // Hidden state
  return null;
};

NativeNavBar.propTypes = {
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

export default NativeNavBar;
