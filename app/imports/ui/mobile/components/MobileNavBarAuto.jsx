import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import MobileNavBarCSS from "./MobileNavBarCSS";
import NativeNavBar from "../ios/components/NativeNavBar";

/**
 * MobileNavBarAuto - Smart navbar component that automatically detects the environment
 * and renders the appropriate navigation bar (CSS or native iOS)
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
  shouldUseNativeNavBar = () => {
    // Only use native navbar if:
    // 1. We're in native iOS environment
    // 2. Native navbar hook is available (basic check)
    return this.isNativeIOS() && typeof window.NativeNavBar !== "undefined";
  };

  /**
   * Get environment info for debugging
   */
  getEnvironmentInfo = () => {
    return {
      hasDevice: !!window.device,
      hasCordova: !!window.cordova,
      platform: window.device?.platform || "unknown",
      userAgent: navigator.userAgent,
      isNativeIOS: this.isNativeIOS(),
      shouldUseNative: this.shouldUseNativeNavBar(),
    };
  };

  render() {
    const { ...props } = this.props;
    
    // Log environment detection for debugging (only in development)
    if (Meteor.isDevelopment) {
      console.log("[MobileNavBarAuto] Environment detection:", this.getEnvironmentInfo());
    }

    // Determine which navbar to render
    if (this.shouldUseNativeNavBar()) {
      console.log("[MobileNavBarAuto] 🍎 Using Native iOS NavBar");
      
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
        <NativeNavBar
          items={defaultItems}
          visible={true}
          activeIndex={0}
          {...props}
        />
      );
    } else {
      console.log("[MobileNavBarAuto] 🌐 Using CSS NavBar");
      
      // Use CSS version for web and non-iOS environments
      return <MobileNavBarCSS {...props} />;
    }
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
