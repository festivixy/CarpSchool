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
      // Determine if we should show the auth overlay
      const showAuthOverlay = loggingIn && !userLoaded;

      // Debug logging
      console.log('ProtectedRoutesComponent Debug:', {
        loggingIn,
        userLoaded,
        loggedIn,
        emailVerified,
        ready,
        showAuthOverlay,
        profileData: profileData ? 'profile exists' : profileData,
        path: props.location.pathname
      });

      // If not logged in, redirect to signin
      if (!loggedIn && userLoaded) {
        console.log('User not logged in, redirecting to signin');
        return <Redirect to="/signin" />;
      }

      // If email not verified, redirect to verify email page
      if (loggedIn && userLoaded && !emailVerified) {
        console.log('Email not verified, redirecting to verify-email');
        return <Redirect to="/verify-email" />;
      }

      // If logged in, email verified, but no profile, redirect to onboarding
      if (loggedIn && userLoaded && ready && !profileData) {
        console.log('No profile data, redirecting to onboarding');
        return <Redirect to="/onboarding" />;
      }

      // Always render the component, but show overlay if still authenticating
      console.log('Rendering component with overlay:', showAuthOverlay);
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Component {...props} />
          {showAuthOverlay && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
              }}
            >
              <LoadingPage message="Authenticating..." />
            </div>
          )}
        </div>
      );
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
      const userLoaded = user !== undefined;
      const showAuthOverlay = isLoggingIn && !userLoaded;

      // If no user and not logging in, redirect to signin
      if (!user && !isLoggingIn) {
        return (
          <Redirect
            to={{ pathname: "/signin", state: { from: props.location } }}
          />
        );
      }

      // If user exists but email not verified, redirect to verify email
      if (user && !user.emails[0].verified) {
        return <Redirect to="/verify-email" />;
      }

      // Always render the component, but show overlay if still authenticating
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Component {...props} />
          {showAuthOverlay && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
              }}
            >
              <LoadingPage message="Authenticating..." />
            </div>
          )}
        </div>
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

      // Determine if we should show the auth overlay
      const showAuthOverlay = userId && (!userLoaded || (isLoggingIn && !isAdmin));

      // Debug logging
      console.log('ProtectedRouteRequireAdmin Debug:', {
        isLoggingIn,
        user: user ? 'user object exists' : user,
        userId,
        isLogged,
        isAdmin,
        userLoaded,
        showAuthOverlay,
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

      // If user object exists but no admin role, redirect
      if (userLoaded && !isAdmin) {
        console.log('User exists but not admin, redirecting to signin');
        return (
          <Redirect
            to={{ pathname: "/signin", state: { from: props.location } }}
          />
        );
      }

      // Always render the component, but show overlay if still authenticating
      console.log('Rendering component with overlay:', showAuthOverlay);
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Component {...props} />
          {showAuthOverlay && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
              }}
            >
              <LoadingPage message="Verifying admin access..." />
            </div>
          )}
        </div>
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
