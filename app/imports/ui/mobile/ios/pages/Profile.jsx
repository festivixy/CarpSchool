import React, { useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";

/**
 * iOS-specific Profile page
 * Empty page that shows profile menu options
 */
const Profile = ({ history, currentUser, isAdmin }) => {
  const [showMenu, setShowMenu] = useState(true);

  const handleClose = () => {
    setShowMenu(false);
    history.goBack();
  };

  const handleNavigation = (path) => {
    setShowMenu(false);
    history.push(path);
  };

  const handleSignOut = () => {
    setShowMenu(false);
    history.push("/signout");
  };

  if (!showMenu) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        padding: "24px",
        minWidth: "280px",
        maxWidth: "320px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "600",
            color: "#333"
          }}>
            Profile
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              color: "#666",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            ×
          </button>
        </div>

        {/* User Info */}
        {currentUser && (
          <div style={{
            marginBottom: "20px",
            padding: "16px",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            borderRadius: "12px"
          }}>
            <div style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "4px"
            }}>
              {currentUser.profile?.firstName} {currentUser.profile?.lastName}
            </div>
            <div style={{
              fontSize: "14px",
              color: "#666"
            }}>
              {currentUser.emails?.[0]?.address}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => handleNavigation("/editProfile")}
            style={{
              width: "100%",
              padding: "16px",
              marginBottom: "8px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "12px",
              textAlign: "left",
              fontSize: "16px",
              color: "#333",
              cursor: "pointer",
              transition: "background-color 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(0, 0, 0, 0.05)"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            📝 Edit Profile
          </button>

          <button
            onClick={() => handleNavigation("/credits")}
            style={{
              width: "100%",
              padding: "16px",
              marginBottom: "8px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "12px",
              textAlign: "left",
              fontSize: "16px",
              color: "#333",
              cursor: "pointer",
              transition: "background-color 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(0, 0, 0, 0.05)"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            💰 Credits
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => handleNavigation("/admin/users")}
                style={{
                  width: "100%",
                  padding: "16px",
                  marginBottom: "8px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "12px",
                  textAlign: "left",
                  fontSize: "16px",
                  color: "#333",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(0, 0, 0, 0.05)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                ��� Admin: Users
              </button>

              <button
                onClick={() => handleNavigation("/admin/rides")}
                style={{
                  width: "100%",
                  padding: "16px",
                  marginBottom: "8px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "12px",
                  textAlign: "left",
                  fontSize: "16px",
                  color: "#333",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(0, 0, 0, 0.05)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                🚗 Admin: Rides
              </button>

              <button
                onClick={() => handleNavigation("/admin/places")}
                style={{
                  width: "100%",
                  padding: "16px",
                  marginBottom: "8px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "12px",
                  textAlign: "left",
                  fontSize: "16px",
                  color: "#333",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(0, 0, 0, 0.05)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                📍 Admin: Places
              </button>
            </>
          )}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: "#FF3B30",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s ease"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#D70015"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#FF3B30"}
        >
          🚪 Sign Out
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
