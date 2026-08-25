import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { isAdminRole } from "../../desktop/components/NavBarRoleUtils";
import { Rides } from "../../../api/ride/Rides";
import { Places } from "../../../api/places/Places";
import { Profiles } from "../../../api/profile/Profile";
import { estimateRoute } from "../../../api/ride/routeEstimate";
import Avatar from "../../components/Avatar";
import {
  Page,
  Banner,
  BannerInner,
  Identity,
  Name,
  Email,
  VerifiedChip,
  Body,
  Section,
  SectionTitle,
  MenuList,
  MenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuArrow,
  StatStrip,
  StatCard,
  StatLabel,
  StatValue,
  StatUnit,
  CheckRow,
  CheckMark,
  CheckLabel,
  CheckNote,
  SignOutBtn,
  Loading,
} from "../styles/Profile";

const ADMIN_LINKS = [
  { icon: "👥", label: "Manage users", path: "/admin/users" },
  { icon: "⏳", label: "Pending approvals", path: "/admin/pending-users" },
  { icon: "🚗", label: "Manage rides", path: "/admin/rides" },
  { icon: "🏫", label: "School settings", path: "/admin/school-management" },
  { icon: "📍", label: "Manage places", path: "/admin/places" },
  { icon: "🚨", label: "Error reports", path: "/admin/error-reports" },
];

const LEGAL_LINKS = [
  { icon: "📄", label: "Terms of Service", path: "/terms" },
  { icon: "🔒", label: "Privacy Policy", path: "/privacy" },
  { icon: "💰", label: "Credits", path: "/credits" },
];

const CO2_LB_PER_MILE = 0.89;

const Profile = ({
  history, currentUser, isAdmin, userReady,
  myProfile, ridesTaken, milesShared, co2AvoidedLb,
}) => {
  const go = (path) => history.push(path);

  const verifyIdentity = () => {
    const inquiryTemplateId = "itmpl_PygaeTqwQpVeoiAMmVmZzrWwezCN";
    const environmentId = "env_5ZRRvhfj6N4FoUoQ2e4KSv19gUuG";
    const referenceId = currentUser._id;
    const redirectUri = encodeURIComponent("https://carp.school");
    window.location.href = `https://miniapp.withpersona.com/verify?inquiry-template-id=${inquiryTemplateId}`
      + `&environment-id=${environmentId}&reference-id=${referenceId}&redirect-uri=${redirectUri}`;
  };

  const deleteAccount = () => {
    const ok = window.confirm(
      "Delete your account? This permanently removes your profile, rides, "
      + "saved places, and chat history and cannot be undone.",
    );
    if (!ok) return;
    const confirmation = window.prompt("Type DELETE (uppercase) to confirm:");
    if (confirmation !== "DELETE") {
      if (confirmation !== null) window.alert("Cancelled — you must type DELETE exactly.");
      return;
    }
    Meteor.call("accounts.deleteMyAccount", (error) => {
      if (error) {
        window.alert(`Failed to delete account: ${error.reason || error.message}`);
      } else {
        window.alert("Your account has been deleted. Signing you out.");
        history.push("/");
      }
    });
  };

  if (!userReady) {
    return (
      <Page>
        <Banner><BannerInner><Name>Profile</Name></BannerInner></Banner>
        <Body><Loading>Loading…</Loading></Body>
      </Page>
    );
  }

  const firstName = currentUser?.profile?.firstName || "";
  const lastName = currentUser?.profile?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Your profile";
  const email = currentUser?.emails?.[0]?.address || "";
  const verified = currentUser?.profile?.identityVerified;

  const statNodes = (
    <StatStrip>
      <StatCard>
        <StatLabel>RIDES</StatLabel>
        <StatValue $accent="var(--signal-yellow-deep)">{ridesTaken}</StatValue>
        <StatUnit>completed</StatUnit>
      </StatCard>
      <StatCard>
        <StatLabel>MILES</StatLabel>
        <StatValue $accent="var(--sky)">{Math.round(milesShared)}</StatValue>
        <StatUnit>shared</StatUnit>
      </StatCard>
      <StatCard>
        <StatLabel>CO&#8322; SAVED</StatLabel>
        <StatValue $accent="var(--leaf)">{`${co2AvoidedLb} lb`}</StatValue>
        <StatUnit>vs. solo</StatUnit>
      </StatCard>
    </StatStrip>
  );

  const checklist = [
    [".edu email", Boolean(myProfile?.schoolemail || email), myProfile?.schoolemail || email || "not on file"],
    ["Student ID", Boolean(myProfile?.verified), myProfile?.verified ? "approved" : "awaiting review"],
    ["Phone", Boolean(myProfile?.Phone), myProfile?.Phone ? "on file" : "add a number"],
  ];

  return (
    <Page>
      <Banner>
        <BannerInner>
          <Avatar user={{ name: fullName, hue: 38 }} size={72} ring="var(--signal-yellow)" />
          <Identity>
            <Name>{fullName}</Name>
            {email && <Email>{email}</Email>}
            {verified && <VerifiedChip>✓ VERIFIED</VerifiedChip>}
          </Identity>
        </BannerInner>
      </Banner>

      <Body>
        <Section>
          {statNodes}
        </Section>

        <Section>
          <SectionTitle>VERIFIED</SectionTitle>
          <MenuList>
            {checklist.map(([label, ok, note]) => (
              <CheckRow key={label}>
                <CheckMark $ok={ok}>{ok ? "✓" : ""}</CheckMark>
                <CheckLabel>{label}</CheckLabel>
                <CheckNote $ok={ok}>{note}</CheckNote>
              </CheckRow>
            ))}
          </MenuList>
        </Section>

        <Section>
          <SectionTitle>ACCOUNT</SectionTitle>
          <MenuList>
            {!verified && (
              <MenuItem type="button" onClick={verifyIdentity}>
                <MenuItemIcon>🛡️</MenuItemIcon>
                <MenuItemLabel>Verify identity</MenuItemLabel>
                <MenuArrow>›</MenuArrow>
              </MenuItem>
            )}
            <MenuItem type="button" onClick={() => go("/edit-profile")}>
              <MenuItemIcon>📝</MenuItemIcon>
              <MenuItemLabel>Edit profile</MenuItemLabel>
              <MenuArrow>›</MenuArrow>
            </MenuItem>
            <MenuItem type="button" onClick={() => go("/places")}>
              <MenuItemIcon>📍</MenuItemIcon>
              <MenuItemLabel>My places</MenuItemLabel>
              <MenuArrow>›</MenuArrow>
            </MenuItem>
          </MenuList>
        </Section>

        {isAdmin && (
          <Section>
            <SectionTitle>ADMIN</SectionTitle>
            <MenuList>
              {ADMIN_LINKS.map(item => (
                <MenuItem key={item.path} type="button" onClick={() => go(item.path)}>
                  <MenuItemIcon>{item.icon}</MenuItemIcon>
                  <MenuItemLabel>{item.label}</MenuItemLabel>
                  <MenuArrow>›</MenuArrow>
                </MenuItem>
              ))}
            </MenuList>
          </Section>
        )}

        <Section>
          <SectionTitle>LEGAL &amp; INFO</SectionTitle>
          <MenuList>
            {LEGAL_LINKS.map(item => (
              <MenuItem key={item.path} type="button" onClick={() => go(item.path)}>
                <MenuItemIcon>{item.icon}</MenuItemIcon>
                <MenuItemLabel>{item.label}</MenuItemLabel>
                <MenuArrow>›</MenuArrow>
              </MenuItem>
            ))}
          </MenuList>
        </Section>

        <Section>
          <SectionTitle $danger>DANGER ZONE</SectionTitle>
          <MenuList>
            <MenuItem type="button" $danger onClick={deleteAccount}>
              <MenuItemIcon>🗑️</MenuItemIcon>
              <MenuItemLabel>Delete account</MenuItemLabel>
              <MenuArrow>›</MenuArrow>
            </MenuItem>
          </MenuList>
        </Section>

        <SignOutBtn type="button" onClick={() => go("/signout")}>
          Sign out
        </SignOutBtn>
      </Body>
    </Page>
  );
};

Profile.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  currentUser: PropTypes.object,
  isAdmin: PropTypes.bool,
  userReady: PropTypes.bool,
  myProfile: PropTypes.object,
  ridesTaken: PropTypes.number,
  milesShared: PropTypes.number,
  co2AvoidedLb: PropTypes.number,
};

Profile.defaultProps = {
  currentUser: null,
  isAdmin: false,
  userReady: false,
  myProfile: null,
  ridesTaken: 0,
  milesShared: 0,
  co2AvoidedLb: 0,
};

export default withRouter(withTracker(() => {
  const currentUser = Meteor.user();
  const userReady = Meteor.userId() !== undefined;
  const isAdmin = currentUser ? isAdminRole(currentUser) : false;

  Meteor.subscribe("Rides");
  Meteor.subscribe("places.options");
  Meteor.subscribe("profiles.interacted");

  const uid = Meteor.userId();
  const coords = {};
  Places.find({}).forEach((place) => {
    coords[place._id] = place.value;
  });

  const now = new Date();
  const completed = Rides.find({}).fetch().filter(r => new Date(r.date) < now);
  const milesShared = completed.reduce((sum, r) => {
    if (typeof r.distanceMi === "number") return sum + r.distanceMi;
    const est = estimateRoute(coords[r.origin], coords[r.destination]);
    return sum + (est ? est.distanceMi : 0);
  }, 0);

  return {
    currentUser,
    isAdmin,
    userReady,
    myProfile: uid ? Profiles.findOne({ Owner: uid }) : null,
    ridesTaken: completed.length,
    milesShared,
    co2AvoidedLb: Math.round(milesShared * CO2_LB_PER_MILE),
  };
})(Profile));
