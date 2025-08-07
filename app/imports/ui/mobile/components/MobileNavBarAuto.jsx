import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import MobileNavBarCSS from "./MobileNavBarCSS";
import NativeNavBar from "../ios/components/NativeNavBar";

/**
 * MobileNavBarAuto - Smart navbar component that automatically detects the environment
 * and renders the appropriate navigation bar (CSS or native iOS)
 *
 * USAGE:
 * ```jsx
 * import MobileNavBarAuto from '../components/MobileNavBarAuto';
 *
 * // Simple usage - automatically detects environment
 * <MobileNavBarAuto />
 *
 * // With custom props for NativeNavBar (when in iOS)
 * <MobileNavBarAuto
 *   items={customNavItems}
 *   activeIndex={2}
 *   onItemPress={handleItemPress}
 * />
 * ```
 *
 * ENVIRONMENT DETECTION:
 * - iOS Cordova App: Uses NativeNavBar with native UITabBar
 * - Web Browser: Uses MobileNavBarCSS with styled-components
 * - Android Cordova: Uses MobileNavBarCSS (fallback)
 *
 * FEATURES:
 * - Automatic environment detection
 * - Seamless prop forwarding
 * - Debug logging in development
 * - Backwards compatible with existing navbar usage
 */
class MobileNavBarAuto extends React.Component {
  /**
   * Detect if we're running in a native iOS environment
   */
  isNativeIOS = () => {
    // Check if we're in Cordova environment
    if (!window.cordova) {
      return false;
    }

    // Check if device is iOS
    if (window.device && window.device.platform) {
      return window.device.platform.toLowerCase() === "ios";
    }

    // Fallback: check user agent for iOS
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

    // Only return true if it's iOS AND we're in Cordova
    return isIOS && window.cordova;
  };

  /**
   * Check if native navbar is supported and should be used
   */
  shouldUseNativeNavBar = () =>
    // Only use native navbar if we're in native iOS environment
    // The NativeNavBar component itself handles feature detection and fallback
     this.isNativeIOS()
  ;

  /**
   * Get environment info for debugging
   */
  getEnvironmentInfo = () => ({
      hasDevice: !!window.device,
      hasCordova: !!window.cordova,
      platform: window.device?.platform || "unknown",
      userAgent: navigator.userAgent,
      isNativeIOS: this.isNativeIOS(),
      shouldUseNative: this.shouldUseNativeNavBar(),
    });

  constructor(props) {
    super(props);
    // Refs for CSS navbar buttons to simulate clicks
    this.cssNavBarRef = React.createRef();
    this.cssButtonRefs = {
      home: React.createRef(),
      search: React.createRef(),
      create: React.createRef(),
      messages: React.createRef(),
      profile: React.createRef(),
    };
  }

  // Handle native navbar clicks by simulating CSS navbar clicks
  handleNativeClick = (item, index, action) => {
    console.log("[MobileNavBarAuto] 🔗 Bridging native click to CSS:", { id: item.id, index, action });

    // Map native item IDs to CSS button actions
    const buttonMap = {
      home: () => {
        // Home button - find and click the first tab
        const homeButton = this.cssNavBarRef.current?.querySelector('[data-navbar-item="home"]');
        if (homeButton) {
          console.log("[MobileNavBarAuto] 🏠 Clicking CSS home button");
          homeButton.click();
        }
      },
      search: () => {
        // Search button - find and click the search/join button
        const searchButton = this.cssNavBarRef.current?.querySelector('[data-navbar-item="search"]');
        if (searchButton) {
          console.log("[MobileNavBarAuto] 🔍 Clicking CSS search button");
          searchButton.click();
        }
      },
      create: () => {
        // Create button - find and click the add/create button
        const createButton = this.cssNavBarRef.current?.querySelector('[data-navbar-item="create"]');
        if (createButton) {
          console.log("[MobileNavBarAuto] ➕ Clicking CSS create button");
          createButton.click();
        }
      },
      messages: () => {
        // Messages button - find and click the messages/chat button
        const messagesButton = this.cssNavBarRef.current?.querySelector('[data-navbar-item="messages"]');
        if (messagesButton) {
          console.log("[MobileNavBarAuto] 💬 Clicking CSS messages button");
          messagesButton.click();
        }
      },
      profile: () => {
        // Profile button - find and click the profile button
        const profileButton = this.cssNavBarRef.current?.querySelector('[data-navbar-item="profile"]');
        if (profileButton) {
          console.log("[MobileNavBarAuto] 👤 Clicking CSS profile button");
          profileButton.click();
        }
      }
    };

    // Execute the mapped action
    const action = buttonMap[item.id];
    if (action) {
      action();
    } else {
      console.warn("[MobileNavBarAuto] ❓ No CSS button mapping found for:", item.id);
    }
  };

  render() {
    const { ...props } = this.props;

    // Log environment detection for debugging (only in development)
    if (Meteor.isDevelopment) {
      console.log("[MobileNavBarAuto] Environment detection:", this.getEnvironmentInfo());
    }

    // Determine which navbar to render
    if (this.shouldUseNativeNavBar()) {
      console.log("[MobileNavBarAuto] 🍎 Using Native iOS NavBar with hidden CSS controller");

      // For NativeNavBar, we need to provide default items since it expects an items prop
      // but the CSS version handles this internally
      const defaultItems = [
        {
          id: "home",
          label: "Home",
          icon: "/svg/home.svg",
          action: "navigate",
        },
        {
          id: "search",
          label: "Search",
          icon: "/svg/search.svg",
          action: "navigate",
        },
        {
          id: "create",
          label: "Create",
          icon: "/svg/plus.svg",
          action: "navigate",
        },
        {
          id: "messages",
          label: "Messages",
          icon: "/svg/message.svg",
          action: "navigate",
        },
        {
          id: "profile",
          label: "Profile",
          icon: "/svg/user.svg",
          action: "navigate",
        },
      ];

      return (
        <>
          {/* Native NavBar - Visible UI */}
          <NativeNavBar
            items={defaultItems}
            visible={true}
            activeIndex={props.activeIndex || 0}
            onItemPress={this.handleNativeClick}
            {...props}
          />

          {/* CSS NavBar - Hidden Controller (height: 0, invisible) */}
          <div
            ref={this.cssNavBarRef}
            style={{
              height: 0,
              overflow: "hidden",
              pointerEvents: "none",
              position: "fixed",
              bottom: -200, // Move completely off-screen
              left: 0,
              right: 0,
              zIndex: -1, // Behind everything
            }}
          >
            <MobileNavBarCSS {...props} />
          </div>
        </>
      );
    }
      console.log("[MobileNavBarAuto] 🌐 Using CSS NavBar");

      // Use CSS version for web and non-iOS environments
      return <MobileNavBarCSS {...props} />;

  }
}

/** Declare the types of all properties. */
MobileNavBarAuto.propTypes = {
  // Props that work for both components
  history: PropTypes.object.isRequired,

  // Props specific to NativeNavBar (optional)
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

  // Props specific to MobileNavBarCSS (handled by withTracker)
  currentUser: PropTypes.string,
  currentId: PropTypes.string,
  isAdmin: PropTypes.bool,
  isLoggedInAndEmailVerified: PropTypes.bool,
};

/** Enable ReactRouter for this component. */
export default withRouter(MobileNavBarAuto);
