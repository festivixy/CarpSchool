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
const Profile = ({ history, currentUser, isAdmin, userReady }) => {
  const handleNavigation = (path) => {
    history.push(path);
  };

  const handleSignOut = () => {
    history.push("/signout");
  };

  const handleDeleteAccount = () => {
    // Show confirmation dialog
    if (window.confirm(
      "⚠️ Are you sure you want to delete your account?\n\n" +
      "This action cannot be undone. All your data including:\n" +
      "• Your profile\n" +
      "• Your rides (as driver)\n" +
      "• Your saved places\n" +
      "• Your chat history\n\n" +
      "will be permanently deleted.\n\n" +
      "Type DELETE to confirm:"
    )) {
      const confirmation = prompt("Type DELETE (in uppercase) to confirm account deletion:");
      
      if (confirmation === "DELETE") {
        // Show loading indicator
        const deleteButton = document.getElementById("delete-account-btn");
        if (deleteButton) {
          deleteButton.disabled = true;
          deleteButton.textContent = "Deleting...";
        }

        Meteor.call("accounts.deleteMyAccount", (error) => {
          if (error) {
            console.error("Failed to delete account:", error);
            alert("Failed to delete account: " + error.reason);
            if (deleteButton) {
              deleteButton.disabled = false;
              deleteButton.textContent = "🗑️ Delete Account";
            }
          } else {
            alert("Your account has been successfully deleted. You will be signed out now.");
            // User will be automatically logged out since account is deleted
            history.push("/");
          }
        });
      } else if (confirmation !== null) {
        alert("Account deletion cancelled. You must type DELETE exactly to confirm.");
      }
    }
  };

  // Show loading state while user data is being fetched
  if (!userReady) {
    return (
      <ProfilePageContainer>
        <FixedHeader>
          <HeaderTitle>Profile</HeaderTitle>
        </FixedHeader>
        <ContentContainer>
          <div style={{ padding: "20px", textAlign: "center" }}>
            Loading...
          </div>
        </ContentContainer>
      </ProfilePageContainer>
    );
  }

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
          {currentUser && (
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
          )}

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

        {/* Account Management Section */}
        <Section style={{ marginTop: "20px" }}>
          <SectionTitle style={{ color: "#FF3B30" }}>
            Account Management
          </SectionTitle>

          <button
            id="delete-account-btn"
            onClick={handleDeleteAccount}
            style={{
              width: "100%",
              padding: "18px 20px",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: "1px solid #ffebee",
              textAlign: "left",
              fontSize: "16px",
              color: "#FF3B30",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuIcon>🗑️</MenuIcon>
            Delete Account
            <MenuArrow style={{ color: "#FF3B30" }}>›</MenuArrow>
          </button>
        </Section>

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
            marginTop: "20px",
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
  userReady: PropTypes.bool,
};

export default withRouter(withTracker(() => {
  const currentUser = Meteor.user();
  const userReady = Meteor.userId() !== undefined; // User subscription is ready when userId is defined or null
  const isAdmin = currentUser ? isAdminRole(currentUser) : false;

  return {
    currentUser,
    isAdmin,
    userReady,
  };
})(Profile));
