import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import BackButton from "../../mobile/components/BackButton";

/**
 * Test Components Navigator - Admin only
 * Central hub for accessing all test pages and demos
 */
const ComponentsTest = ({ history, currentUser, isAdmin }) => {
  const handleNavigation = (path) => {
    history.push(path);
  };

  const testPages = [
    {
      path: "/_test/map-components",
      icon: "🗺️",
      name: "Map Components",
      description: "Test MapView, InteractiveMapPicker, and PathMapView components"
    },
    {
      path: "/_test/footer-components",
      icon: "🦶",
      name: "Footer Components",
      description: "Test Simple, Verbose, and LiquidGlass footer variants"
    },
    {
      path: "/_test/liquidglass-components",
      icon: "✨",
      name: "LiquidGlass Components",
      description: "Test LiquidGlass buttons, inputs, dropdowns, and navbar components"
    },
    {
      path: "/_test/mobile-navbar-auto",
      icon: "📱",
      name: "Mobile NavBar Auto",
      description: "Test MobileNavBarAuto component and environment detection"
    },
    {
      path: "/_test/native-blur",
      icon: "🌫️",
      name: "Native Blur Demo",
      description: "Test iOS native blur effects and backdrop filters"
    },
    {
      path: "/_test/shared-components",
      icon: "🧩",
      name: "Shared Components",
      description: "Test Button, TextInput, Dropdown, and other shared components"
    },
    {
      path: "/_test/liquidglass/login",
      icon: "🔐",
      name: "LiquidGlass Login",
      description: "Test LiquidGlass design system login page"
    },
    {
      path: "/_test/image-upload",
      icon: "📸",
      name: "Image Upload",
      description: "Test image upload functionality and components"
    }
  ];

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#f5f5f5",
      paddingTop: "60px",
      paddingBottom: "100px",
      overflowY: "auto"
    }}>
      <BackButton />

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
          Components Test Hub
        </h1>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{
            margin: "0 0 8px 0",
            fontSize: "20px",
            fontWeight: "600",
            color: "#333"
          }}>
            Admin Test Environment
          </h2>
          <p style={{
            margin: 0,
            fontSize: "16px",
            color: "#666",
            lineHeight: "1.4"
          }}>
            Access test pages for components, demos, and development tools.
            These pages are only available to admin users.
          </p>
        </div>

        {/* Test Pages Grid */}
        <div style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "1fr"
        }}>
          {testPages.map((test, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(test.path)}
              style={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                transition: "transform 0.2s ease, box-shadow 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div style={{
                fontSize: "24px",
                minWidth: "32px",
                textAlign: "center"
              }}>
                {test.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "4px"
                }}>
                  {test.name}
                </div>
                <div style={{
                  fontSize: "14px",
                  color: "#666",
                  lineHeight: "1.3"
                }}>
                  {test.description}
                </div>
              </div>
              <div style={{
                fontSize: "20px",
                color: "#999"
              }}>
                ›
              </div>
            </button>
          ))}
        </div>

        {/* User Info */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          marginTop: "24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{
            margin: "0 0 12px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#333"
          }}>
            Current User
          </h3>
          {currentUser && (
            <div>
              <div style={{
                fontSize: "14px",
                color: "#666",
                marginBottom: "4px"
              }}>
                {currentUser.profile?.firstName} {currentUser.profile?.lastName}
              </div>
              <div style={{
                fontSize: "14px",
                color: "#666",
                marginBottom: "8px"
              }}>
                {currentUser.emails?.[0]?.address}
              </div>
              <div style={{
                display: "inline-block",
                padding: "4px 8px",
                backgroundColor: "#28a745",
                color: "white",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase"
              }}>
                {isAdmin ? "Admin Access" : "Regular User"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ComponentsTest.propTypes = {
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
})(ComponentsTest));
