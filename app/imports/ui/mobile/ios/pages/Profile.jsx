import React, { useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import BackButton from "../../components/BackButton";
import {
  ProfilePageContainer,
  FixedHeader,
  HeaderTitle,
  ContentContainer,
  ProfileHeader,
  ProfileAvatar,
  ProfileName,
  ProfileEmail,
  LegalSection,
  Section,
  MenuItem,
  MenuItemIcon,
  MenuItemText,
  MenuItemChevron,
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

  const handleBack = () => {
    history.goBack();
  };

  return (
    <ProfilePageContainer>
      {/* Fixed Header */}
      <FixedHeader>
        <HeaderTitle>
          Profile
        </HeaderTitle>
      </FixedHeader>

      <BackButton />

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
          <button
            onClick={() => handleNavigation("/editProfile")}
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
              alignItems: "center"
            }}
          >
            <span style={{ marginRight: "12px" }}>📝</span>
            Edit Profile
            <span style={{ marginLeft: "auto", color: "#999" }}>›</span>
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
              alignItems: "center"
            }}
          >
            <span style={{ marginRight: "12px" }}>📍</span>
            My Places
            <span style={{ marginLeft: "auto", color: "#999" }}>›</span>
          </button>
        </Section>

        {/* Admin Options */}
        {isAdmin && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{
              padding: "12px 20px",
              borderBottom: "1px solid #f0f0f0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Admin
            </div>

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
                alignItems: "center"
              }}
            >
              <span style={{ marginRight: "12px" }}>👥</span>
              Manage Users
              <span style={{ marginLeft: "auto", color: "#999" }}>›</span>
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
                alignItems: "center"
              }}
            >
              <span style={{ marginRight: "12px" }}>🚗</span>
              Manage Rides
              <span style={{ marginLeft: "auto", color: "#999" }}>›</span>
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
                alignItems: "center"
              }}
            >
              <span style={{ marginRight: "12px" }}>📍</span>
              Manage Places
              <span style={{ marginLeft: "auto", color: "#999" }}>›</span>
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
                alignItems: "center"
              }}
            >
              <span style={{ marginRight: "12px" }}>🧪</span>
              Components Test
              <span style={{ marginLeft: "auto", color: "#999" }}>›</span>
            </button>
          </div>
        )}

        {/* Legal & Information Section */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{
            padding: "12px 20px",
            borderBottom: "1px solid #f0f0f0",
            fontSize: "14px",
            fontWeight: "600",
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Legal & Information
          </div>

          <button
            onClick={() => handleNavigation("/tos")}
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
              alignItems: "center"
            }}
          >
            <span style={{ marginRight: "12px" }}>📄</span>
            Terms of Service
            <span style={{ marginLeft: "auto", color: "#999" }}>›</span>
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
              alignItems: "center"
            }}
          >
            <span style={{ marginRight: "12px" }}>🔒</span>
            Privacy Policy
            <span style={{ marginLeft: "auto", color: "#999" }}>›</span>
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
              alignItems: "center"
            }}
          >
            <span style={{ marginRight: "12px" }}>💰</span>
            Credits
            <span style={{ marginLeft: "auto", color: "#999" }}>›</span>
          </button>
        </div>

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
            justifyContent: "center"
          }}
        >
          <span style={{ marginRight: "8px" }}>🚪</span>
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
  const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes("admin");

  return {
    currentUser,
    isAdmin,
  };
})(Profile));
