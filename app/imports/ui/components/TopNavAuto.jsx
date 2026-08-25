import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { useAuth } from "@clerk/clerk-react";
import { Profiles } from "../../api/profile/Profile";
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

/* Screens whose content runs full-bleed under the nav (a map fills the
 * viewport). They must not get the spacer, or the map is pushed down and the
 * design's floating-over-map effect is lost. */
const FULL_BLEED_PREFIXES = ["/find"];

const NAV_TARGETS = {
  home: "/",
  find: "/find",
  rides: "/my-rides",
  inbox: "/chat",
  // Account menu destinations. These carry the routes the legacy NavBar
  // exposed; without them a signed-in desktop user has no way to reach their
  // profile, places, history, admin or sign-out.
  profile: "/mobile/profile",
  editProfile: "/edit-profile",
  places: "/places",
  history: "/ride-history/me",
  admin: "/admin/overview",
};

const MENU_BASE = [
  { id: "profile", label: "My profile", icon: "user" },
  { id: "editProfile", label: "Edit profile", icon: "edit" },
  { id: "places", label: "Saved places", icon: "pin" },
  { id: "history", label: "Ride history", icon: "clock" },
];

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

function TopNavAuto({ currentUser, myProfile, history, location }) {
  const { isSignedIn, signOut } = useAuth();
  const pathname = location?.pathname || "/";
  const isLegacyRoute = LEGACY_NAV_PREFIXES.some(p => pathname.startsWith(p));

  if (isLegacyRoute || !isSignedIn) {
    return <NavBar />;
  }

  const fullBleed = FULL_BLEED_PREFIXES.some(p => pathname.startsWith(p));

  const isAdmin = currentUser?.roles?.includes("system")
    || currentUser?.roles?.some(r => r.startsWith("admin."));

  const canDrive = myProfile?.UserType !== "Rider";

  const menuItems = [
    ...MENU_BASE,
    ...(isAdmin ? [{ id: "admin", label: "Admin panel", icon: "settings" }] : []),
    { id: "signOut", label: "Sign out", icon: "arrow", danger: true },
  ];

  const handleMenuSelect = async (id) => {
    if (id === "signOut") {
      try {
        await signOut({ redirectUrl: "/" });
      } catch (error) {
        console.error("Sign out error:", error);
      }
      return;
    }
    history.push(NAV_TARGETS[id] || "/");
  };

  return (
    <>
      <TopNav
        active={activeFor(pathname)}
        user={avatarUserFrom(currentUser)}
        onNav={id => history.push(NAV_TARGETS[id] || "/")}
        onOffer={canDrive ? () => history.push("/create") : undefined}
        showOffer={canDrive}
        menuItems={menuItems}
        onMenuSelect={handleMenuSelect}
      />
      {!fullBleed && <NavSpacer />}
    </>
  );
}

TopNavAuto.propTypes = {
  currentUser: PropTypes.object,
  myProfile: PropTypes.object,
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
};

TopNavAuto.defaultProps = {
  currentUser: null,
  myProfile: null,
  location: null,
};

const TopNavAutoTracked = withTracker(() => {
  const uid = Meteor.userId();
  Meteor.subscribe("profiles.mineWithApprovalStatus");
  return {
    currentUser: Meteor.user(),
    myProfile: uid ? Profiles.findOne({ Owner: uid }) : null,
  };
})(TopNavAuto);

export default withRouter(TopNavAutoTracked);
