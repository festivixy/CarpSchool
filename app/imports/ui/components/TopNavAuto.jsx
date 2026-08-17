import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { useAuth } from "@clerk/clerk-react";
import TopNav from "./TopNav";
import NavBar from "../desktop/components/NavBar";
import { NavSpacer } from "../styles/TopNav";

/**
 * Chooses the desktop navigation for the current route.
 *
 * The design handoff specifies the floating TopNav pill on every
 * customer-facing screen. Admin, system and test routes keep the legacy
 * NavBar, which carries the role menus and auth actions TopNav has no slot
 * for. Signed-out visitors also keep NavBar for its sign in / sign up links.
 */
const LEGACY_NAV_PREFIXES = ["/admin", "/system", "/_test"];

const NAV_TARGETS = {
  home: "/",
  find: "/find",
  rides: "/my-rides",
  inbox: "/chat",
};

/* Longest prefix wins, so /ride-history maps to rides rather than home. */
const ACTIVE_BY_PREFIX = [
  ["/find", "find"],
  ["/my-rides", "rides"],
  ["/ride-history", "rides"],
  ["/ride/", "rides"],
  ["/create", "rides"],
  ["/chat", "inbox"],
];

const activeFor = (pathname) => {
  const hit = ACTIVE_BY_PREFIX.find(([prefix]) => pathname.startsWith(prefix));
  return hit ? hit[1] : "home";
};

/* Deterministic hue so a given account always gets the same avatar colour. */
const hueFor = (seed) => {
  if (!seed) return 220;
  let total = 0;
  for (let i = 0; i < seed.length; i += 1) total += seed.charCodeAt(i);
  return total % 360;
};

const avatarUserFrom = (currentUser) => {
  if (!currentUser) return null;
  const name = currentUser.profile?.name
    || currentUser.username
    || currentUser.emails?.[0]?.address
    || "";
  return { id: currentUser._id, name, hue: hueFor(currentUser._id) };
};

function TopNavAuto({ currentUser, history, location }) {
  const { isSignedIn } = useAuth();
  const pathname = location?.pathname || "/";
  const isLegacyRoute = LEGACY_NAV_PREFIXES.some(p => pathname.startsWith(p));

  if (isLegacyRoute || !isSignedIn) {
    return <NavBar />;
  }

  return (
    <>
      <TopNav
        active={activeFor(pathname)}
        user={avatarUserFrom(currentUser)}
        onNav={id => history.push(NAV_TARGETS[id] || "/")}
        onOffer={() => history.push("/create")}
      />
      <NavSpacer />
    </>
  );
}

TopNavAuto.propTypes = {
  currentUser: PropTypes.object,
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
};

TopNavAuto.defaultProps = {
  currentUser: null,
  location: null,
};

const TopNavAutoTracked = withTracker(() => ({
  currentUser: Meteor.user(),
}))(TopNavAuto);

export default withRouter(TopNavAutoTracked);
