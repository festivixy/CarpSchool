import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import useNativeNavBar from "../hooks/useNativeNavBar";
import LiquidGlassDropdown from "../../../liquidGlass/components/Dropdown";
import JoinRideModal from "../../../components/JoinRideModal";
import AddRidesModal from "../../../components/AddRides";

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
    setActionHandler,
  } = useNativeNavBar();

  const [navBarId, setNavBarId] = useState(null);
  const [currentActiveIndex, setCurrentActiveIndex] = useState(activeIndex);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [joinRideModalOpen, setJoinRideModalOpen] = useState(false);
  const [addRidesModalOpen, setAddRidesModalOpen] = useState(false);
  const navBarRef = useRef(null);

  // Navigation methods - same as MobileNavBarCSS - memoized to prevent re-renders
  const handleNavigation = React.useCallback((path) => {
    history.push(path);
    setProfileDropdownOpen(false);
  }, [history]);

  const handleSignOut = React.useCallback(() => {
    history.push("/signout");
    setProfileDropdownOpen(false);
  }, [history]);

  const handleJoinRideClick = React.useCallback(() => {
    console.log("[NativeNavBar] 🔍 handleJoinRideClick called - setting joinRideModalOpen to true");
    setJoinRideModalOpen(true);
    setProfileDropdownOpen(false);
    console.log("[NativeNavBar] 🔍 joinRideModalOpen state should now be true");
  }, []);

  const handleJoinRideClose = React.useCallback(() => {
    console.log("[NativeNavBar] 🔍 handleJoinRideClose called - setting joinRideModalOpen to false");
    setJoinRideModalOpen(false);
  }, []);

  const handleAddRidesClick = React.useCallback(() => {
    console.log("[NativeNavBar] ➕ handleAddRidesClick called - setting addRidesModalOpen to true");
    setAddRidesModalOpen(true);
    setProfileDropdownOpen(false);
    console.log("[NativeNavBar] ➕ addRidesModalOpen state should now be true");
  }, []);

  const handleAddRidesClose = React.useCallback(() => {
    console.log("[NativeNavBar] ➕ handleAddRidesClose called - setting addRidesModalOpen to false");
    setAddRidesModalOpen(false);
  }, []);

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

    if (isSupported) {
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
          setCurrentActiveIndex(itemIndex);

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
            setProfileDropdownOpen(true);
          } else {
            console.log("[NativeNavBar] ❓ Unknown item action, no handler available");
          }
        }
      });
    }
  }, [isSupported, setActionHandler, currentUser, handleNavigation, handleJoinRideClick, handleAddRidesClick]);

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
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 83,
          backgroundColor: "rgba(249, 249, 249, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
        {...props}
      >
        <div style={{ fontSize: "14px", color: "#666" }}>
          Initializing Native NavBar...
        </div>
      </div>
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

  // Get profile dropdown options
  const getProfileDropdownOptions = () => {
    if (currentUser) {
      const options = [
        { value: "edit-profile", label: "📋 Edit Profile" },
        { value: "my-places", label: "📍 My Places" },
      ];

      if (isAdmin) {
        options.push(
          { value: "admin-rides", label: "🚗 Manage Rides" },
          { value: "admin-users", label: "👥 Manage Users" },
          { value: "admin-places", label: "📍 Manage Places" },
          { value: "components-test", label: "🧪 Components Test" },
        );
      }

      options.push({ value: "signout", label: "🚪 Sign Out" });
      return options;
    }

    return [
      { value: "signin", label: "🔑 Sign In" },
      { value: "signup", label: "👤 Sign Up" },
    ];
  };

  // Handle dropdown selection
  const handleDropdownSelect = (option) => {
    console.log("[NativeNavBar] 📱 Dropdown option selected:", option);
    setProfileDropdownOpen(false);

    if (!option || !option.value) {
      console.log("[NativeNavBar] ❌ Invalid dropdown option");
      return;
    }

    switch (option.value) {
      case "edit-profile":
        handleNavigation("/profile");
        break;
      case "my-places":
        handleNavigation("/profile");
        break;
      case "admin-rides":
        handleNavigation("/admin/rides");
        break;
      case "admin-users":
        handleNavigation("/admin/users");
        break;
      case "admin-places":
        handleNavigation("/admin/places");
        break;
      case "components-test":
        handleNavigation("/_test");
        break;
      case "signout":
        handleSignOut();
        break;
      case "signin":
        handleNavigation("/signin");
        break;
      case "signup":
        handleNavigation("/signup");
        break;
      default:
        console.log("[NativeNavBar] ❓ Unknown dropdown option:", option.value);
    }
  };

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
          <div
            ref={navBarRef}
            className={className}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: 83,
              pointerEvents: "none", // Let native navbar handle touches
              ...style,
            }}
            {...props}
          >
            <div style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              fontSize: "10px",
              color: "rgba(0,0,0,0.3)",
              userSelect: "none",
              pointerEvents: "none",
            }}>
              Native iOS
            </div>
          </div>

          {/* Profile Dropdown Overlay */}
          {profileDropdownOpen && (
            <div
              style={{
                position: "fixed",
                bottom: 100,
                right: 20,
                zIndex: 10000,
                pointerEvents: "auto",
              }}
              onClick={(e) => {
                // Close dropdown if clicking outside
                if (e.target === e.currentTarget) {
                  setProfileDropdownOpen(false);
                }
              }}
            >
              <LiquidGlassDropdown
                options={getProfileDropdownOptions()}
                value={null}
                placeholder="Profile Menu"
                onChange={handleDropdownSelect}
                onOpen={() => {}}
                onClose={() => setProfileDropdownOpen(false)}
                width="200px"
                position="top"
                searchable={false}
                disabled={false}
                loading={false}
                clearable={false}
              />
            </div>
          )}
        </>
      );
    }

    // Native navbar creation failed - render fallback CSS navbar
    console.log("[NativeNavBar] 🔄 Rendering fallback CSS navbar - native creation failed");
    return (
      <div
        ref={navBarRef}
        className={className}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 83,
          backgroundColor: "rgba(0,0,0,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          ...style,
        }}
        {...props}
      >
        {items.map((item, index) => (
          <button
            key={item.id || index}
            style={{
              background: "none",
              border: "none",
              color: index === currentActiveIndex ? "#007AFF" : "white",
              fontSize: "24px",
              padding: "8px",
              borderRadius: "8px",
              minWidth: "44px",
              minHeight: "44px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
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
                setProfileDropdownOpen(true);
              } else if (onItemPress) {
                // Fallback to custom handler
                onItemPress(item, index, item.action);
              }
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "2px" }}>
              {item.icon}
            </div>
            <div style={{ fontSize: "10px", fontWeight: "500" }}>
              {item.label}
            </div>
          </button>
        ))}

        <div style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          fontSize: "10px",
          color: "rgba(255,255,255,0.5)",
          userSelect: "none",
          pointerEvents: "none",
        }}>
          CSS Fallback
        </div>

        {/* Profile Dropdown Overlay for fallback navbar */}
        {profileDropdownOpen && (
          <div
            style={{
              position: "fixed",
              bottom: 100,
              right: 20,
              zIndex: 10000,
              pointerEvents: "auto",
            }}
            onClick={(e) => {
              // Close dropdown if clicking outside
              if (e.target === e.currentTarget) {
                setProfileDropdownOpen(false);
              }
            }}
          >
            <LiquidGlassDropdown
              options={getProfileDropdownOptions()}
              value={null}
              placeholder="Profile Menu"
              onChange={handleDropdownSelect}
              onOpen={() => {}}
              onClose={() => setProfileDropdownOpen(false)}
              width="200px"
              position="top"
              searchable={false}
              disabled={false}
              loading={false}
              clearable={false}
            />
          </div>
        )}

        {/* Join Ride Modal */}
        {console.log("[NativeNavBar] 🔍 Rendering JoinRideModal with isOpen:", joinRideModalOpen)}
        <JoinRideModal
          isOpen={joinRideModalOpen}
          onClose={handleJoinRideClose}
        />

        {/* Add Rides Modal */}
        {console.log("[NativeNavBar] ➕ Rendering AddRidesModal with isOpen:", addRidesModalOpen)}
        <AddRidesModal
          isOpen={addRidesModalOpen}
          onClose={handleAddRidesClose}
        />
      </div>
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
