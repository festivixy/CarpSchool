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
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      // If not logged in, redirect to signin
      if (!loggedIn) {
        return <Redirect to="/signin" />;
      }

      // If email not verified, redirect to verify email page
      if (!emailVerified) {
        return <Redirect to="/verify-email" />;
      }

      // If logged in, email verified, but no profile, redirect to onboarding
      if (ready && !profileData) {
        return <Redirect to="/onboarding" />;
      }

      // If everything is good, render the component
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
      const isLogged = Meteor.userId() !== null;
      const isAdmin = user && user.roles && user.roles.includes("admin");

      // Show loading while authentication state is being determined
      if (isLoggingIn) {
        return <LoadingPage message="Authenticating..." />;
      }

      return isLogged && isAdmin ? (
        <Component {...props} />
      ) : (
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
  };
})(ProtectedRoutesComponent);

export default ProtectedRoutes;
