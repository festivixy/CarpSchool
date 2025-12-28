import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { isAdminRole } from "../../desktop/components/NavBarRoleUtils";
import {
  ProfilePageContainer,
  FixedHeader,
  HeaderTitle,
  ContentContainer,
  ProfileHeader,
  ProfileName,
  ProfileEmail,
  LegalSection,
  Section,
  SectionTitle,
  MenuIcon,
  MenuArrow,
  LogoutIcon,
} from "../styles/Profile";

/**
 * iOS-specific Profile page
 * Simple list of profile options without modal styling
 */
const Profile = ({ history, currentUser, isAdmin }) => {
  const handleNavigation = (path) => {
    history.push(path);
  };

  const handleSignOut = () => {
    history.push("/signout");
  };

  return (
    <ProfilePageContainer>
      {/* Fixed Header */}
      <FixedHeader>
        <HeaderTitle>
          Profile
        </HeaderTitle>
      </FixedHeader>

      <ContentContainer>
        {/* User Info */}
        {currentUser && (
          <ProfileHeader>
            <ProfileName>
              {currentUser.profile?.firstName} {currentUser.profile?.lastName}
            </ProfileName>
            <ProfileEmail>
              {currentUser.emails?.[0]?.address}
            </ProfileEmail>
          </ProfileHeader>
        )}

        {/* Profile Options */}
        <Section>
          {/* Identity Verification Status */}
          <button
             onClick={() => {
               if (!currentUser.profile?.identityVerified) {
                 // Redirect to Persona verification flow with userId as reference
                 // NOTE: In production, use the production environment ID
                 const inquiryTemplateId = "itmpl_PygaeTqwQpVeoiAMmVmZzrWwezCN";
                 const environmentId = "env_5ZRRvhfj6N4FoUoQ2e4KSv19gUuG";
                 const referenceId = currentUser._id;
                 const redirectUri = encodeURIComponent("https://carp.school"); // Update this to your app's URL
                 
                 window.location.href = `https://miniapp.withpersona.com/verify?inquiry-template-id=${inquiryTemplateId}&environment-id=${environmentId}&reference-id=${referenceId}&redirect-uri=${redirectUri}`;
               }
             }}
             style={{
               width: "100%",
               padding: "18px 20px",
               backgroundColor: currentUser.profile?.identityVerified ? "#f0f9eb" : "transparent",
               border: "none",
               borderBottom: "1px solid #f0f0f0",
               textAlign: "left",
               fontSize: "16px",
               color: "#333",
               cursor: currentUser.profile?.identityVerified ? "default" : "pointer",
               display: "flex",
               alignItems: "center",
             }}
          >
            <MenuIcon>{currentUser.profile?.identityVerified ? "✅" : "🛡️"}</MenuIcon>
            {currentUser.profile?.identityVerified ? "Identity Verified" : "Verify Identity"}
            {!currentUser.profile?.identityVerified && <MenuArrow>›</MenuArrow>}
          </button>

          <button
            onClick={() => handleNavigation("/edit-profile")}
            style={{
              width: "100%",
              padding: "18px 20px",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: "1px solid #f0f0f0",
              textAlign: "left",
              fontSize: "16px",
              color: "#333",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuIcon>📝</MenuIcon>
            Edit Profile
            <MenuArrow>›</MenuArrow>
          </button>

          <button
            onClick={() => handleNavigation("/places")}
            style={{
              width: "100%",
              padding: "18px 20px",
              backgroundColor: "transparent",
              border: "none",
              textAlign: "left",
              fontSize: "16px",
              color: "#333",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuIcon>📍</MenuIcon>
            My Places
            <MenuArrow>›</MenuArrow>
          </button>
        </Section>

        {/* Admin Options */}
        {isAdmin && (
          <Section>
            <SectionTitle>
              Admin
            </SectionTitle>

            <button
              onClick={() => handleNavigation("/admin/users")}
              style={{
                width: "100%",
                padding: "18px 20px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "1px solid #f0f0f0",
                textAlign: "left",
                fontSize: "16px",
                color: "#333",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <MenuIcon>👥</MenuIcon>
              Manage Users
              <MenuArrow>›</MenuArrow>
            </button>

            <button
              onClick={() => handleNavigation("/admin/pending-users")}
              style={{
                width: "100%",
                padding: "18px 20px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "1px solid #f0f0f0",
                textAlign: "left",
                fontSize: "16px",
                color: "#333",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <MenuIcon>⏳</MenuIcon>
              Pending Approvals
              <MenuArrow>›</MenuArrow>
            </button>

            <button
              onClick={() => handleNavigation("/admin/rides")}
              style={{
                width: "100%",
                padding: "18px 20px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "1px solid #f0f0f0",
                textAlign: "left",
                fontSize: "16px",
                color: "#333",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <MenuIcon>🚗</MenuIcon>
              Manage Rides
              <MenuArrow>›</MenuArrow>
            </button>

            <button
              onClick={() => handleNavigation("/admin/school-management")}
              style={{
                width: "100%",
                padding: "18px 20px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "1px solid #f0f0f0",
                textAlign: "left",
                fontSize: "16px",
                color: "#333",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <MenuIcon>🏫</MenuIcon>
              School Settings
              <MenuArrow>›</MenuArrow>
            </button>

            <button
              onClick={() => handleNavigation("/admin/places")}
              style={{
                width: "100%",
                padding: "18px 20px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "1px solid #f0f0f0",
                textAlign: "left",
                fontSize: "16px",
                color: "#333",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
            <MenuIcon>📍</MenuIcon>
            Manage Places
            <MenuArrow>›</MenuArrow>
            </button>

            <button
              onClick={() => handleNavigation("/admin/error-reports")}
              style={{
                width: "100%",
                padding: "18px 20px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "1px solid #f0f0f0",
                textAlign: "left",
                fontSize: "16px",
                color: "#333",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <MenuIcon>🚨</MenuIcon>
              Error Reports
              <MenuArrow>›</MenuArrow>
            </button>

            <button
              onClick={() => handleNavigation("/_test")}
              style={{
                width: "100%",
                padding: "18px 20px",
                backgroundColor: "transparent",
                border: "none",
                textAlign: "left",
                fontSize: "16px",
                color: "#333",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <MenuIcon>🧪</MenuIcon>
              Components Test
              <MenuArrow>›</MenuArrow>
            </button>
          </Section>
        )}

        {/* Legal & Information Section */}
        <LegalSection>
          <SectionTitle>
            Legal & Information
          </SectionTitle>

          <button
            onClick={() => handleNavigation("/terms")}
            style={{
              width: "100%",
              padding: "18px 20px",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: "1px solid #f0f0f0",
              textAlign: "left",
              fontSize: "16px",
              color: "#333",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuIcon>📄</MenuIcon>
            Terms of Service
            <MenuArrow>›</MenuArrow>
          </button>

          <button
            onClick={() => handleNavigation("/privacy")}
            style={{
              width: "100%",
              padding: "18px 20px",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: "1px solid #f0f0f0",
              textAlign: "left",
              fontSize: "16px",
              color: "#333",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuIcon>🔒</MenuIcon>
            Privacy Policy
            <MenuArrow>›</MenuArrow>
          </button>

          <button
            onClick={() => handleNavigation("/credits")}
            style={{
              width: "100%",
              padding: "18px 20px",
              backgroundColor: "transparent",
              border: "none",
              textAlign: "left",
              fontSize: "16px",
              color: "#333",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuIcon>💰</MenuIcon>
            Credits
            <MenuArrow>›</MenuArrow>
          </button>
        </LegalSection>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          style={{
            width: "100%",
            padding: "18px 20px",
            backgroundColor: "#FF3B30",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LogoutIcon>🚪</LogoutIcon>
          Sign Out
        </button>
      </ContentContainer>
    </ProfilePageContainer>
  );
};

Profile.propTypes = {
  history: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  isAdmin: PropTypes.bool,
};

export default withRouter(withTracker(() => {
  const currentUser = Meteor.user();
  const isAdmin = isAdminRole(currentUser);

  return {
    currentUser,
    isAdmin,
  };
})(Profile));
