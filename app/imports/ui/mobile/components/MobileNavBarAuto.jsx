import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
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
 * // With custom props (activeIndex, etc.)
 * <MobileNavBarAuto activeIndex={2} />
 * ```
 *
 * ENVIRONMENT DETECTION:
 * - iOS Cordova App: Uses NativeNavBar with native UITabBar
 * - Web Browser: Uses MobileNavBarCSS with styled-components
 * - Android Cordova: Uses MobileNavBarCSS (fallback)
 *
 * FEATURES:
 * - Automatic environment detection
 * - Synchronized labels between CSS and native implementations
 * - Dynamic home label based on user authentication state
 * - Debug logging in development
 * - Consistent navigation behavior across platforms
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
  }

  render() {
    const { ...props } = this.props;
    const { location } = this.props.history;

    // List of pages where navbar should be hidden when using native iOS
    const hideNavbarPaths = [];

    // Check if current page should hide navbar
    const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

    if (this.shouldUseNativeNavBar() && shouldHideNavbar) {
      console.log("[MobileNavBarAuto] 🍎 Hiding navbar for page:", location.pathname);
      return null;
    }

    // Log environment detection for debugging (only in development)
    if (Meteor.isDevelopment) {
      console.log("[MobileNavBarAuto] Environment detection:", this.getEnvironmentInfo());
    }

    // Determine which navbar to render
    if (this.shouldUseNativeNavBar()) {
      console.log("[MobileNavBarAuto] 🍎 Using Native iOS NavBar");

      // Get current user to determine home label
      const currentUser = Meteor.user();
      const homeLabel = currentUser ? "My Rides" : "Home";

      // Native navbar items synced with CSS labels
      const defaultItems = [
        {
          id: "home",
          label: homeLabel,
          icon: "/svg/home.svg",
          action: "home",
        },
        {
          id: "search",
          label: "Join Ride",
          icon: "/svg/search.svg",
          action: "search",
        },
        {
          id: "create",
          label: "Create",
          icon: "/svg/plus.svg",
          action: "create",
        },
        {
          id: "messages",
          label: "Messages",
          icon: "/svg/message.svg",
          action: "messages",
        },
        {
          id: "profile",
          label: "Profile",
          icon: "/svg/user.svg",
          action: "profile",
        },
      ];

      return (
        <NativeNavBar
          items={defaultItems}
          visible={true}
          activeIndex={props.activeIndex || 0}
          {...props}
        />
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

  // Optional props
  visible: PropTypes.bool,
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
