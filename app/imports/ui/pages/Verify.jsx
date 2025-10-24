import React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Profiles } from "../../api/profile/Profile";
import { ProfileSkeleton } from "../skeleton";
import RiderVerify from "../components/RiderVerify";
import DriverVerify from "../components/DriverVerify";
import {
  VerifyContainer,
  VerifyHeader,
  VerifyTitle,
  VerifyContent,
  ErrorMessage,
} from "../styles/Verify";
import BackButton from "../mobile/components/BackButton";

const Verify = ({ profileData, ready, currentUser }) => {
  if (!currentUser) {
    return (
      <VerifyContainer>
        <BackButton />
        <VerifyHeader>
          <VerifyTitle>Verification</VerifyTitle>
        </VerifyHeader>
        <VerifyContent>
          <ErrorMessage>Please log in to access verification.</ErrorMessage>
        </VerifyContent>
      </VerifyContainer>
    );
  }

  if (!ready) {
    return <ProfileSkeleton />;
  }

  if (!profileData) {
    return (
      <VerifyContainer>
        <BackButton />
        <VerifyHeader>
          <VerifyTitle>Verification</VerifyTitle>
        </VerifyHeader>
        <VerifyContent>
          <ErrorMessage>
            Please complete your profile before verification.
          </ErrorMessage>
        </VerifyContent>
      </VerifyContainer>
    );
  }

  const userType = profileData.UserType;

  // Route to appropriate verification component based on user type
  switch (userType) {
    case "Driver":
      return <DriverVerify />;
    case "Rider":
      return <RiderVerify />;
    default:
      return (
        <VerifyContainer>
          <BackButton />
          <VerifyHeader>
            <VerifyTitle>Verification</VerifyTitle>
          </VerifyHeader>
          <VerifyContent>
            <ErrorMessage>
              Invalid user type. Please update your profile with a valid role (Driver or Rider).
            </ErrorMessage>
          </VerifyContent>
        </VerifyContainer>
      );
  }
};

Verify.propTypes = {
  profileData: PropTypes.object,
  ready: PropTypes.bool.isRequired,
  currentUser: PropTypes.string,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe("Profiles");
  const userId = Meteor.userId();

  return {
    profileData: Profiles.findOne({ Owner: userId }),
    currentUser: userId,
    ready: subscription.ready(),
  };
})(Verify);
