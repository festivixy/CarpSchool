import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import MobileNavBarCSS from "./MobileNavBarCSS";
import NativeNavBar from "../ios/components/NativeNavBar";

/* Tabs offered to the native iOS bar. Mirrors the CSS bottom bar's signed-in
 * items -- "More" stands in for the profile/settings menu. */
const NATIVE_TAB_ITEMS = [
  { label: "Rides", path: "/my-rides", icon: "car" },
  { label: "Find", path: "/find", icon: "search" },
  { label: "Places", path: "/places", icon: "pin" },
  { label: "Chat", path: "/chat", icon: "chat" },
  { label: "More", path: "/mobile/profile", icon: "user" },
];

const activeIndexFor = (pathname) => {
  const index = NATIVE_TAB_ITEMS.findIndex(item => pathname && pathname.startsWith(item.path));
  return index === -1 ? 0 : index;
};

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
    return (
      <NativeNavBar
        items={NATIVE_TAB_ITEMS}
        activeIndex={activeIndexFor(location?.pathname)}
        history={history}
        {...{ isSignedIn }}
      />
    );
  }

  return <MobileNavBarCSS {...{ isSignedIn }} />;
}

MobileNavBarAuto.propTypes = {
  history: PropTypes.object,
};

export default withRouter(MobileNavBarAuto);
