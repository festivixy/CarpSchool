import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { useAuth } from "@clerk/clerk-react";
import { Profiles } from "../../api/profile/Profile";
import TopNav from "./TopNav";
import NavBar from "../desktop/components/NavBar";
import { isSystemRole } from "../desktop/components/NavBarRoleUtils";
import { NavSpacer } from "../styles/TopNav";

/**
 * Chooses the desktop navigation for the current route.
 *
 * The design handoff specifies the floating TopNav pill on every
 * customer-facing screen. The admin area uses it too, carrying the admin
 * sections as its nav items -- the handoff never covered admin, and leaving
 * it on the legacy NavBar made the portal read as a different product.
 *
 * Test routes keep the legacy NavBar, as do signed-out visitors, who need
 * its sign in / sign up links.
 */
const LEGACY_NAV_PREFIXES = ["/_test"];

/* No admin page carries its own navigation, so whatever the nav offers here
 * is the only way to move between admin sections. */
const ADMIN_PREFIXES = ["/admin", "/system"];

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
  // Admin area. Split between the nav pill and the account menu below.
  adminOverview: "/admin/overview",
  adminRides: "/admin/rides",
  adminUsers: "/admin/users",
  adminPlaces: "/admin/places",
  adminPending: "/admin/pending-users",
  adminSchoolManagement: "/admin/school-management",
  adminErrors: "/admin/error-reports",
  systemSchools: "/admin/schools",
  systemAdmin: "/system",
  site: "/",
};

/* The pill fits four items at the design's density, so the busiest sections
 * ride there and the rest live in the account menu. */
const ADMIN_ITEMS = [
  { id: "adminOverview", label: "Overview" },
  { id: "adminRides", label: "Rides" },
  { id: "adminUsers", label: "Users" },
  { id: "adminPlaces", label: "Places" },
];

const ADMIN_MENU = [
  { id: "adminPending", label: "Pending users", icon: "user" },
  { id: "adminSchoolManagement", label: "School management", icon: "school" },
  { id: "adminErrors", label: "Error reports", icon: "bell" },
];

/* System-role destinations, matching the legacy NavBar's System menu. */
const SYSTEM_MENU = [
  { id: "systemSchools", label: "All schools", icon: "school" },
  { id: "systemAdmin", label: "System admin", icon: "settings" },
];

/* Longest prefix wins: /admin/pending-users must not match /admin/users. */
const ADMIN_ACTIVE_BY_PREFIX = [
  ["/admin/overview", "adminOverview"],
  ["/admin/rides", "adminRides"],
  ["/admin/users", "adminUsers"],
  ["/admin/places", "adminPlaces"],
];

const adminActiveFor = (pathname) => {
  const hit = ADMIN_ACTIVE_BY_PREFIX.find(([prefix]) => pathname.startsWith(prefix));
  return hit ? hit[1] : "";
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
  const isAdminArea = ADMIN_PREFIXES.some(p => pathname.startsWith(p));

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

  if (isAdminArea) {
    const adminMenu = [
      ...ADMIN_MENU,
      ...(isSystemRole(currentUser) ? SYSTEM_MENU : []),
      { id: "site", label: "Back to site", icon: "home" },
      { id: "signOut", label: "Sign out", icon: "arrow", danger: true },
    ];

    return (
      <>
        <TopNav
          active={adminActiveFor(pathname)}
          items={ADMIN_ITEMS}
          user={avatarUserFrom(currentUser)}
          onNav={id => history.push(NAV_TARGETS[id] || "/")}
          showOffer={false}
          menuItems={adminMenu}
          onMenuSelect={handleMenuSelect}
        />
        <NavSpacer />
      </>
    );
  }

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
