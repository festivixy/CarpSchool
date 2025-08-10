import React, { useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import BackButton from "../../components/BackButton";

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
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#f5f5f5",
      paddingTop: "60px",
      paddingBottom: "100px", // Space for bottom navbar
      overflowY: "auto"
    }}>
      {/* Fixed Header */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        backgroundColor: "white",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "18px",
          fontWeight: "600",
          color: "#333"
        }}>
          Profile
        </h1>
      </div>

      <BackButton />

      <div style={{ padding: "20px" }}>
        {/* User Info */}
        {currentUser && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "4px"
            }}>
              {currentUser.profile?.firstName} {currentUser.profile?.lastName}
            </div>
            <div style={{
              fontSize: "16px",
              color: "#666"
            }}>
              {currentUser.emails?.[0]?.address}
            </div>
          </div>
        )}

        {/* Profile Options */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
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
        </div>

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
      </div>
    </div>
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
