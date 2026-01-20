import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { withTracker } from "meteor/react-meteor-data";
import { Profiles } from "../../api/profile/Profile";
import { getImageUrl } from "../utils/imageUtils";

/**
 * HOC for components that need Meteor user data
 * Wraps component with Clerk auth and Meteor user tracking
 */
export function withMeteorUser(WrappedComponent) {
  return function MeteorUserWrapper(props) {
    const { isLoaded, isSignedIn, meteorUser } = useAuth();

    if (!isLoaded) {
      return <div className="loading">Loading...</div>;
    }

    return <WrappedComponent {...props} user={meteorUser} isSignedIn={isSignedIn} />;
  };
}

/**
 * HOC for components that need profile data
 */
export function withProfile(WrappedComponent) {
  const container = withTracker((props) => {
    const profileSubscription = Meteor.subscribe("profiles.mine");
    const profileData = Profiles.findOne({ Owner: Meteor.userId() });

    return {
      loading: !profileSubscription.ready(),
      profileData,
    };
  })(WrappedComponent);

  return function ProfileWrapper(props) {
    const { isLoaded, isSignedIn, meteorUser } = useAuth();

    if (!isLoaded) {
      return <div className="loading">Loading...</div>;
    }

    if (!isSignedIn) {
      return null;
    }

    const Container = container;
    return <Container {...props} user={meteorUser} />;
  };
}
