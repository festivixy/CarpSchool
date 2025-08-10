import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import {
  PageContainer,
  Header,
  HeaderTitle,
  BackButton,
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
 * Native iOS list styling without LiquidGlass components
 * Replaces the profile dropdown with a full page
 */
const Profile = ({ history, currentUser, isAdmin }) => {
  const handleBack = () => {
    history.goBack();
  };

  const handleNavigation = (path) => {
    history.push(path);
  };

  const handleSignOut = () => {
    history.push("/signout");
  };

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
      action: () => handleNavigation("/adminRides"),
    },
    {
      icon: "👥",
      label: "Manage Users", 
      action: () => handleNavigation("/adminUsers"),
    },
    {
      icon: "📍",
      label: "Manage Places",
      action: () => handleNavigation("/adminPlaces"),
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
      <Header>
        <BackButton onClick={handleBack}>
          ← Back
        </BackButton>
        <HeaderTitle>Profile</HeaderTitle>
      </Header>

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
