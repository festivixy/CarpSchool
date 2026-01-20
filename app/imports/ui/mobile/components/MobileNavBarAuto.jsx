import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import MobileNavBarCSS from "./MobileNavBarCSS";
import NativeNavBar from "../ios/components/NativeNavBar";

/**
 * MobileNavBarAuto - Smart navbar component that automatically detects the environment
 * and renders the appropriate navigation bar (CSS or native iOS)
 * Uses Clerk for authentication
 */
function MobileNavBarAuto({ history }) {
  const { isSignedIn } = useAuth();
  const location = history?.location;

  const isNativeIOS = () => {
    if (!window.cordova) {
      return false;
    }
    if (window.device && window.device.platform) {
      return window.device.platform.toLowerCase() === "ios";
    }
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    return isIOS && window.cordova;
  };

  const shouldUseNativeNavBar = () => isNativeIOS();

  const hideNavbarPaths = [];

  const shouldHideNavbar = location && hideNavbarPaths.includes(location.pathname);

  if (shouldUseNativeNavBar() && shouldHideNavbar) {
    return null;
  }

  if (shouldUseNativeNavBar()) {
    return <NativeNavBar {...{ isSignedIn }} />;
  }

  return <MobileNavBarCSS {...{ isSignedIn }} />;
}

MobileNavBarAuto.propTypes = {
  history: PropTypes.object,
};

export default withRouter(MobileNavBarAuto);
