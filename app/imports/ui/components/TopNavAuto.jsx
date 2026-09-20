import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { useAuth } from "@clerk/clerk-react";
import { Profiles } from "../../api/profile/Profile";
import TopNav from "./TopNav";
import NavBar from "../desktop/components/NavBar";
import { adminPathFor, adminSectionFor } from "../utils/adminNav";
import { fullSignOut } from "../utils/signOut";
import { useApprovalStatus } from "../utils/useApproval";
import { NavSpacer } from "../styles/TopNav";
import { hueFor } from "../utils/avatarHue";

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

/* Admin screens sit in AdminShell, which carries the section rail. The pill
 * used to list those sections too, because nothing else did; now it would be
 * the same nine entries twice, and they overflowed the pill. Here it keeps
 * only identity: the avatar, notifications, and the account menu. */
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
  availability: "/availability",
  drivers: "/drivers",
  history: "/ride-history/me",
  admin: "/admin/overview",
  site: "/",
};

const MENU_BASE = [
  { id: "profile", label: "My profile", icon: "user" },
  { id: "editProfile", label: "Edit profile", icon: "edit" },
  { id: "places", label: "Saved places", icon: "pin" },
  { id: "drivers", label: "Drivers available", icon: "car" },
  { id: "history", label: "Ride history", icon: "clock" },
];

/* Setting a schedule is only meaningful for an account that can drive. */
const DRIVER_MENU = [{ id: "availability", label: "My availability", icon: "clock" }];

/* All an unapproved account can actually open. */
const RESTRICTED_ITEMS = [{ id: "home", label: "Home" }];

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
  const { ready: approvalReady, approved } = useApprovalStatus();
  const pathname = location?.pathname || "/";
  const isLegacyRoute = LEGACY_NAV_PREFIXES.some(p => pathname.startsWith(p));
  const isAdminArea = ADMIN_PREFIXES.some(p => pathname.startsWith(p));

  if (isLegacyRoute || !isSignedIn) {
    return <NavBar />;
  }

  const fullBleed = FULL_BLEED_PREFIXES.some(p => pathname.startsWith(p));

  /* An account still at onboarding, waiting for approval or rejected cannot
   * reach any of the member routes, so the nav must not offer them. Judged
   * only once the subscription has resolved: treating "not yet known" as
   * unapproved would blank the nav on every load for everyone else. */
  const restricted = approvalReady && !approved;

  const isAdmin = currentUser?.roles?.includes("system")
    || currentUser?.roles?.some(r => r.startsWith("admin."));

  const canDrive = myProfile?.UserType !== "Rider";

  const signOutItem = { id: "signOut", label: "Sign out", icon: "arrow", danger: true };

  /* Nothing in the account menu is reachable either, so it comes down to the
   * one action that always works. */
  const menuItems = restricted ? [signOutItem] : [
    ...MENU_BASE,
    ...(canDrive ? DRIVER_MENU : []),
    ...(isAdmin ? [{ id: "admin", label: "Admin panel", icon: "settings" }] : []),
    signOutItem,
  ];

  const handleMenuSelect = (id) => {
    if (id === "signOut") {
      fullSignOut(signOut);
      return;
    }
    history.push(NAV_TARGETS[id] || "/");
  };

  if (isAdminArea) {
    const adminMenu = [
      { id: "site", label: "Back to site", icon: "home" },
      { id: "signOut", label: "Sign out", icon: "arrow", danger: true },
    ];

    return (
      <>
        <TopNav
          active={adminSectionFor(pathname)}
          items={[]}
          user={avatarUserFrom(currentUser)}
          onNav={id => history.push(adminPathFor(id) || NAV_TARGETS[id] || "/")}
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
        items={restricted ? RESTRICTED_ITEMS : undefined}
        user={avatarUserFrom(currentUser)}
        onNav={id => history.push(NAV_TARGETS[id] || "/")}
        onOffer={canDrive && !restricted ? () => history.push("/create") : undefined}
        showOffer={canDrive && !restricted}
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
