import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import BackButton from "../../mobile/components/BackButton";
import {
  PageContainer,
  FixedHeader,
  HeaderTitle,
  ContentPadding,
  MainCard,
  MainTitle,
  MainDescription,
  TestGrid,
  TestButton,
  TestIcon,
  TestContent,
  TestName,
  TestDescription,
  TestArrow,
  UserInfoCard,
  UserInfoTitle,
  UserInfoItem,
  UserRoleBadge,
} from "../styles/ComponentsTest";

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
    <PageContainer>
      <BackButton />

      {/* Fixed Header */}
      <FixedHeader>
        <HeaderTitle>
          Components Test Hub
        </HeaderTitle>
      </FixedHeader>

      <ContentPadding>
        <MainCard>
          <MainTitle>
            Admin Test Environment
          </MainTitle>
          <MainDescription>
            Access test pages for components, demos, and development tools.
            These pages are only available to admin users.
          </MainDescription>
        </MainCard>

        {/* Test Pages Grid */}
        <TestGrid>
          {testPages.map((test, index) => (
            <TestButton
              key={index}
              onClick={() => handleNavigation(test.path)}
            >
              <TestIcon>
                {test.icon}
              </TestIcon>
              <TestContent>
                <TestName>
                  {test.name}
                </TestName>
                <TestDescription>
                  {test.description}
                </TestDescription>
              </TestContent>
              <TestArrow>
                ›
              </TestArrow>
            </TestButton>
          ))}
        </TestGrid>

        {/* User Info */}
        <UserInfoCard>
          <UserInfoTitle>
            Current User
          </UserInfoTitle>
          {currentUser && (
            <div>
              <UserInfoItem>
                {currentUser.profile?.firstName} {currentUser.profile?.lastName}
              </UserInfoItem>
              <UserInfoItem>
                {currentUser.emails?.[0]?.address}
              </UserInfoItem>
              <UserRoleBadge>
                {isAdmin ? "Admin Access" : "Regular User"}
              </UserRoleBadge>
            </div>
          )}
        </UserInfoCard>
      </ContentPadding>
    </PageContainer>
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
