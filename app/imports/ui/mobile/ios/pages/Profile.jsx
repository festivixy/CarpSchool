import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import useNativeNavBar from "../hooks/useNativeNavBar";
import {
  PageContainer,
  Content,
  Section,
  SectionTitle,
  MenuItem,
  MenuItemIcon,
  MenuItemText,
  MenuItemChevron,
  UserInfo,
  UserName,
  UserEmail,
  Separator,
} from "../styles/Profile";

/**
 * iOS-specific Profile page
 * Integrates with native iOS navbar system
 * Replaces the profile dropdown with a full page
 */
const Profile = ({ history, currentUser, isAdmin }) => {
  const [navBarId, setNavBarId] = useState(null);

  const {
    isSupported,
    createNavBar,
    showNavBar,
    removeNavBar,
    registerActionHandler,
    unregisterActionHandler,
  } = useNativeNavBar();

  const handleBack = () => {
    history.goBack();
  };

  const handleNavigation = (path) => {
    history.push(path);
  };

  const handleSignOut = () => {
    history.push("/signout");
  };

  // Register action handler for this page's navbar
  useEffect(() => {
    if (!isSupported || !navBarId) return;

    // Register action handler specifically for this page's top navbar
    registerActionHandler(navBarId, (navBarId, action, itemIndex) => {
      console.log("[Profile] Action handler called:", { navBarId, action, itemIndex });

      if (action === "back") {
        handleBack();
      }
      // Don't handle "tap" actions here - let them go to the bottom navbar
    });

    // Cleanup registration when component unmounts
    return () => {
      unregisterActionHandler(navBarId);
    };
  }, [isSupported, navBarId, registerActionHandler, unregisterActionHandler, handleBack]);

  // Set up native navbar
  useEffect(() => {
    if (!isSupported) return;

    const setupNavBar = async () => {
      try {
        // Create native navbar with back button
        const newNavBarId = await createNavBar({
          title: "Profile",
          showBackButton: true,
          position: "top"
        });

        setNavBarId(newNavBarId);

        // Show the navbar
        await showNavBar(newNavBarId);

      } catch (error) {
        console.error("[Profile] Failed to setup native navbar:", error);
      }
    };

    setupNavBar();

    // Cleanup
    return () => {
      if (navBarId) {
        removeNavBar(navBarId).catch(console.error);
      }
    };
  }, [isSupported, createNavBar, showNavBar, removeNavBar, unregisterActionHandler]);

  const userSectionItems = [
    {
      icon: "📋",
      label: "Edit Profile",
      action: () => handleNavigation("/editProfile"),
    },
    {
      icon: "📍",
      label: "My Places",
      action: () => handleNavigation("/places"),
    },
  ];

  const adminSectionItems = [
    {
      icon: "🚗",
      label: "Manage Rides",
      action: () => handleNavigation("/admin/rides"),
    },
    {
      icon: "👥",
      label: "Manage Users",
      action: () => handleNavigation("/admin/users"),
    },
    {
      icon: "📍",
      label: "Manage Places",
      action: () => handleNavigation("/admin/places"),
    },
    {
      icon: "🧪",
      label: "Components Test",
      action: () => handleNavigation("/_test"),
    },
  ];

  const accountSectionItems = currentUser ? [
    {
      icon: "🚪",
      label: "Sign Out",
      action: handleSignOut,
      isDestructive: true,
    },
  ] : [
    {
      icon: "🔑",
      label: "Sign In",
      action: () => handleNavigation("/signin"),
    },
    {
      icon: "👤",
      label: "Sign Up",
      action: () => handleNavigation("/signup"),
    },
  ];

  return (
    <PageContainer>
      <Content>
        {currentUser && (
          <>
            <UserInfo>
              <UserName>{currentUser.username || "User"}</UserName>
              <UserEmail>
                {currentUser.emails && currentUser.emails[0]
                  ? currentUser.emails[0].address
                  : "No email"}
              </UserEmail>
            </UserInfo>
            <Separator />
          </>
        )}

        {currentUser && (
          <Section>
            <SectionTitle>Account</SectionTitle>
            {userSectionItems.map((item, index) => (
              <MenuItem key={index} onClick={item.action}>
                <MenuItemIcon>{item.icon}</MenuItemIcon>
                <MenuItemText>{item.label}</MenuItemText>
                <MenuItemChevron>›</MenuItemChevron>
              </MenuItem>
            ))}
          </Section>
        )}

        {isAdmin && (
          <Section>
            <SectionTitle>Admin</SectionTitle>
            {adminSectionItems.map((item, index) => (
              <MenuItem key={index} onClick={item.action}>
                <MenuItemIcon>{item.icon}</MenuItemIcon>
                <MenuItemText>{item.label}</MenuItemText>
                <MenuItemChevron>›</MenuItemChevron>
              </MenuItem>
            ))}
          </Section>
        )}

        <Section>
          <SectionTitle>{currentUser ? "Sign Out" : "Authentication"}</SectionTitle>
          {accountSectionItems.map((item, index) => (
            <MenuItem
              key={index}
              onClick={item.action}
              $isDestructive={item.isDestructive}
            >
              <MenuItemIcon>{item.icon}</MenuItemIcon>
              <MenuItemText>{item.label}</MenuItemText>
              <MenuItemChevron>›</MenuItemChevron>
            </MenuItem>
          ))}
        </Section>
      </Content>
    </PageContainer>
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
