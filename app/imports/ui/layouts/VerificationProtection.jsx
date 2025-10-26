import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Profiles } from "../../api/profile/Profile";
import LoadingPage from "../components/LoadingPage";
import { MobileGenericSkeleton } from "../skeleton";
import { MobileOnly, DesktopOnly } from "./Devices";
import { RouteContainer, AuthOverlay } from "../styles/ProtectedRoutes";

/**
 * Protected route that requires user verification
 * Used for routes that need verified users only
 */
const ProtectedRouteRequireVerificationComponent = ({
  component: Component,
  profileData,
  ready,
  loggedIn,
  emailVerified,
  loggingIn,
  userLoaded,
  ...rest
}) => {
  // Create a functional component to use hooks
  const VerificationRouteWrapper = (props) => {
    // Get current path to check if it's an allowed unverified route
    const currentPath = props.location.pathname;
    const allowedUnverifiedRoutes = [
      "/",
      "/login",
      "/signup",
      "/signout",
      "/onboarding",
      "/verify",
      "/verify-email",
      "/forgot",
      "/terms",
      "/privacy",
      "/credits",
      "/waiting-confirmation",
    ];

    // Check if current route is allowed for unverified users
    const isAllowedRoute = allowedUnverifiedRoutes.includes(currentPath);

    // Dynamic auth overlay state
    const initialOverlayState = !loggedIn && !userLoaded && loggingIn;
    const [showAuthOverlay, setShowAuthOverlay] = useState(initialOverlayState);

    // Update overlay state when auth conditions change
    useEffect(() => {
      const shouldShow = !loggedIn && !userLoaded && loggingIn;

      if (shouldShow !== showAuthOverlay) {
        setShowAuthOverlay(shouldShow);
      }
    }, [loggedIn, userLoaded, loggingIn, showAuthOverlay]);

    // If not logged in, redirect to signin
    if (!loggedIn && userLoaded) {
      return <Redirect to="/login" />;
    }

    // If email not verified, redirect to verify email page
    if (loggedIn && userLoaded && !emailVerified) {
      return <Redirect to="/verify-email" />;
    }

    // If logged in, email verified, but no profile, redirect to onboarding
    if (loggedIn && userLoaded && ready && !profileData) {
      return <Redirect to="/onboarding" />;
    }

    // If logged in, has profile, but not verified and not requested (needs verification), redirect to verification
    if (loggedIn && userLoaded && ready && profileData && !profileData.verified && !profileData.requested && !isAllowedRoute) {
      return <Redirect to="/verify" />;
    }

    // If logged in, has profile, not verified but requested (waiting for admin approval), redirect to waiting page
    if (loggedIn && userLoaded && ready && profileData && !profileData.verified && profileData.requested && !isAllowedRoute) {
      return <Redirect to="/waiting-confirmation" />;
    }

    // Always render the component, but show overlay if still authenticating
    return (
      <RouteContainer>
        <Component {...props} />
        {showAuthOverlay && (
          <AuthOverlay>
            <MobileOnly>
              <MobileGenericSkeleton numberOfLines={35} showBackButton={true} lineVariations="default" />
            </MobileOnly>
            <DesktopOnly>
              <LoadingPage message="Authenticating..." />
            </DesktopOnly>
          </AuthOverlay>
        )}
      </RouteContainer>
    );
  };

  return (
    <Route
      {...rest}
      render={(props) => <VerificationRouteWrapper {...props} />}
    />
  );
};

ProtectedRouteRequireVerificationComponent.propTypes = {
  component: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  profileData: PropTypes.object,
  ready: PropTypes.bool.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  emailVerified: PropTypes.bool.isRequired,
  loggingIn: PropTypes.bool.isRequired,
  userLoaded: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
};

// Export with tracker for verification logic
export const ProtectedRouteRequireVerification = withTracker(() => {
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
    userLoaded: user !== undefined,
  };
})(ProtectedRouteRequireVerificationComponent);
