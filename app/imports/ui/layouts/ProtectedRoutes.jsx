import React from "react";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Profiles } from "../../api/profile/Profile";
import LoadingPage from "../mobile/components/LoadingPage";

/**
 * Main protected route with onboarding logic
 * Checks authentication, email verification, and profile completion
 */
const ProtectedRoutesComponent = ({
  component: Component,
  profileData,
  ready,
  loggedIn,
  emailVerified,
  loggingIn,
  userLoaded,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      // Debug logging
      console.log('ProtectedRoutesComponent Debug:', {
        loggingIn,
        userLoaded,
        loggedIn,
        emailVerified,
        ready,
        profileData: profileData ? 'profile exists' : profileData,
        path: props.location.pathname
      });

      // Show loading while authentication state is being determined
      // Only show loading if we're actually logging in AND haven't loaded user data yet
      if (loggingIn && !userLoaded) {
        console.log('Showing loading page for main protected route');
        return <LoadingPage message="Authenticating..." />;
      }

      // If not logged in, redirect to signin
      if (!loggedIn) {
        console.log('User not logged in, redirecting to signin');
        return <Redirect to="/signin" />;
      }

      // If email not verified, redirect to verify email page
      if (!emailVerified) {
        console.log('Email not verified, redirecting to verify-email');
        return <Redirect to="/verify-email" />;
      }

      // If logged in, email verified, but no profile, redirect to onboarding
      if (ready && !profileData) {
        console.log('No profile data, redirecting to onboarding');
        return <Redirect to="/onboarding" />;
      }

      // If everything is good, render the component
      console.log('All checks passed, rendering component');
      return <Component {...props} />;
    }}
  />
);

/**
 * Simple protected route with email verification
 */
export const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      const isLoggingIn = Meteor.loggingIn();
      const user = Meteor.user();

      // Show loading while authentication state is being determined
      if (isLoggingIn) {
        return <LoadingPage message="Authenticating..." />;
      }

      if (user) {
        if (user.emails[0].verified) {
          return <Component {...props} />;
        }
        return <Redirect to="/verify-email" />;
      }
      return (
        <Redirect
          to={{ pathname: "/signin", state: { from: props.location } }}
        />
      );
    }}
  />
);

export const ProtectedRouteRequireNotEmailVerified = ({
  component: Component,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      const isLoggingIn = Meteor.loggingIn();
      const user = Meteor.user();

      // Show loading while authentication state is being determined
      if (isLoggingIn) {
        return <LoadingPage message="Authenticating..." />;
      }

      if (user) {
        if (!user.emails[0].verified) {
          return <Component {...props} />;
        }
        return (
          <Redirect
            to={
              props.location.state && props.location.state.from
                ? props.location.state.from.pathname
                : "/"
            }
          />
        );
      }
      return (
        <Redirect
          to={{ pathname: "/signin", state: { from: props.location } }}
        />
      );
    }}
  />
);

/**
 * Route that requires user to NOT be logged in
 */
export const ProtectedRouteRequireNotLoggedIn = ({
  component: Component,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      const isLoggingIn = Meteor.loggingIn();
      const user = Meteor.user();

      // Show loading while authentication state is being determined
      if (isLoggingIn) {
        return <LoadingPage message="Authenticating..." />;
      }

      if (!user) {
        return <Component {...props} />;
      }
      return (
        <Redirect
          to={
            props.location.state && props.location.state.from
              ? props.location.state.from.pathname
              : "/"
          }
        />
      );
    }}
  />
);

/**
 * Route that requires admin privileges
 */
export const ProtectedRouteRequireAdmin = ({
  component: Component,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      const isLoggingIn = Meteor.loggingIn();
      const user = Meteor.user();
      const userId = Meteor.userId();
      const isLogged = userId !== null;
      const isAdmin = user && user.roles && user.roles.includes("admin");
      const userLoaded = user !== undefined;

      // Debug logging
      console.log('ProtectedRouteRequireAdmin Debug:', {
        isLoggingIn,
        user: user ? 'user object exists' : user,
        userId,
        isLogged,
        isAdmin,
        userLoaded,
        userRoles: user ? user.roles : 'no user',
        path: props.location.pathname
      });

      // If we don't have a userId, we're definitely not logged in
      if (!userId) {
        console.log('No user ID, redirecting to signin');
        return (
          <Redirect
            to={{ pathname: "/signin", state: { from: props.location } }}
          />
        );
      }

      // If we have userId but no user object, show loading briefly
      // But don't wait indefinitely - if loggingIn is false, proceed anyway
      if (userId && !userLoaded && isLoggingIn) {
        console.log('User ID exists, user data loading, showing loading page');
        return <LoadingPage message="Loading user data..." />;
      }

      // At this point we have a userId, so proceed with admin check
      // Even if user object is not fully loaded, we can make basic decisions

      // If user object exists, check admin status normally
      if (user && user.roles && user.roles.includes("admin")) {
        console.log('User is admin, rendering component');
        return <Component {...props} />;
      }

      // If user object exists but no admin role, redirect
      if (user) {
        console.log('User exists but not admin, redirecting to signin');
        return (
          <Redirect
            to={{ pathname: "/signin", state: { from: props.location } }}
          />
        );
      }

      // If we have userId but user object is still null/undefined and not logging in
      // This might be a permissions issue or user doesn't exist anymore
      console.log('User ID exists but no user object available, redirecting to signin');
      return (
        <Redirect
          to={{ pathname: "/signin", state: { from: props.location } }}
        />
      );
    }}
  />
);

ProtectedRoutesComponent.propTypes = {
  component: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  profileData: PropTypes.object,
  ready: PropTypes.bool.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  emailVerified: PropTypes.bool.isRequired,
  loggingIn: PropTypes.bool.isRequired,
  userLoaded: PropTypes.bool.isRequired,
};

ProtectedRoute.propTypes = {
  component: PropTypes.func.isRequired,
  location: PropTypes.object,
};

ProtectedRouteRequireNotLoggedIn.propTypes = {
  component: PropTypes.func.isRequired,
  location: PropTypes.object,
};

ProtectedRouteRequireAdmin.propTypes = {
  component: PropTypes.func.isRequired,
  location: PropTypes.object,
};

ProtectedRouteRequireNotEmailVerified.propTypes = {
  component: PropTypes.func.isRequired,
  location: PropTypes.object,
};

// Main export with tracker for onboarding logic
const ProtectedRoutes = withTracker(() => {
  const subscription = Meteor.subscribe("Profiles");
  const user = Meteor.user();
  const userId = Meteor.userId();

  return {
    profileData: Profiles.findOne({ Owner: userId }),
    ready: subscription.ready(),
    loggedIn: !!userId,
    emailVerified: user
      ? user.emails && user.emails[0] && user.emails[0].verified
      : false,
    loggingIn: Meteor.loggingIn(),
    userLoaded: user !== undefined, // Check if user data is loaded (null means not logged in, undefined means loading)
  };
})(ProtectedRoutesComponent);

export default ProtectedRoutes;
