import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import BackButton from "../../mobile/components/BackButton";
import { isAdminRole } from "../../desktop/components/NavBarRoleUtils";
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
      icon: "",
      name: "Map Components",
      description: "Test MapView, InteractiveMapPicker, and PathMapView components",
    },
    {
      path: "/_test/footer-components",
      icon: "",
      name: "Footer Components",
      description: "Test Simple, Verbose, and LiquidGlass footer variants",
    },
    {
      path: "/_test/liquidglass-components",
      icon: "",
      name: "LiquidGlass Components",
      description: "Test LiquidGlass buttons, inputs, dropdowns, and navbar components",
    },
    {
      path: "/_test/mobile-navbar-auto",
      icon: "",
      name: "Mobile NavBar Auto",
      description: "Test MobileNavBarAuto component and environment detection",
    },
    {
      path: "/_test/shared-components",
      icon: "",
      name: "Shared Components",
      description: "Test Button, TextInput, Dropdown, and other shared components",
    },
    {
      path: "/_test/liquidglass/login",
      icon: "",
      name: "LiquidGlass Login",
      description: "Test LiquidGlass design system login page",
    },
    {
      path: "/_test/image-upload",
      icon: "",
      name: "Image Upload",
      description: "Test image upload functionality and components",
    },
    {
      path: "/_test/skeleton-components",
      icon: "",
      name: "Skeleton Components",
      description: "Test skeleton loading states and shimmer animations",
    },
    {
      path: "/_test/crash-app",
      icon: "",
      name: "Crash App",
      description: "Test ErrorBoundary component by intentionally crashing the app",
    },
    {
      path: "/_test/notifications",
      icon: "",
      name: "Push Notifications",
      description: "Test web push notifications, OneSignal, and Firebase integration",
    },
    {
      path: "/_test/mobile-push",
      icon: "",
      name: "Mobile Push Notifications",
      description: "Test native iOS/Android push notifications in Cordova apps",
    },
  ];

  const appNavigatorPages = [
    {
      path: "/ios/create-ride",
      icon: "",
      name: "iOS Create Ride",
      description: "Native iOS-style create ride page (normally iOS-only)",
    },
    {
      path: "/ios/join-ride",
      icon: "",
      name: "iOS Join Ride",
      description: "Native iOS-style join ride page (normally iOS-only)",
    },
    {
      path: "/mobile/profile",
      icon: "",
      name: "iOS Profile",
      description: "Native iOS-style profile page (normally iOS-only)",
    },
    {
      path: "/onboarding",
      icon: "",
      name: "Onboarding Flow",
      description: "User onboarding and profile setup flow",
    },
    {
      path: "/admin/error-reports",
      icon: "",
      name: "Error Reports",
      description: "Admin error tracking and management system",
    },
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

        {/* App Navigator Section */}
        <MainCard>
          <MainTitle>
            App Navigator
          </MainTitle>
          <MainDescription>
            Access app sections that are normally restricted by platform or user state.
            These links bypass normal restrictions for testing purposes.
          </MainDescription>
        </MainCard>

        <TestGrid>
          {appNavigatorPages.map((page, index) => (
            <TestButton
              key={`nav-${index}`}
              onClick={() => handleNavigation(page.path)}
            >
              <TestIcon>
                {page.icon}
              </TestIcon>
              <TestContent>
                <TestName>
                  {page.name}
                </TestName>
                <TestDescription>
                  {page.description}
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
                {currentUser?.profile?.firstName} {currentUser?.profile?.lastName}
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
  const isAdmin = isAdminRole(currentUser);

  return {
    currentUser,
    isAdmin,
  };
})(ComponentsTest));
