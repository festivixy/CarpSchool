import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { Redirect } from "react-router-dom";
import {
  VerifyContainer,
  VerifyHeader,
  VerifyTitle,
  VerifyContent,
  VerifyText,
  VerifyDescription,
  VerifyButton,
  VerifyIcon,
  SuccessMessage,
  ErrorMessage,
} from "../styles/Verify";
import BackButton from "../mobile/components/BackButton";

const DriverVerify = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [redirectToProfile, setRedirectToProfile] = useState(false);

  const handleFinishVerification = () => {
    setIsVerifying(true);
    setError("");
    setSuccess("");

    Meteor.call("verify.finish", (err, result) => {
      setIsVerifying(false);
      
      if (err) {
        setError(err.reason || "Verification failed. Please try again.");
      } else {
        setSuccess(result.message);
        // Redirect after 2 seconds
        setTimeout(() => {
          setRedirectToProfile(true);
        }, 2000);
      }
    });
  };

  if (redirectToProfile) {
    return <Redirect to="/edit-profile" />;
  }

  return (
    <VerifyContainer>
      <BackButton />
      
      <VerifyHeader>
        <VerifyIcon>🚙</VerifyIcon>
        <VerifyTitle>Driver Verification</VerifyTitle>
      </VerifyHeader>

      <VerifyContent>
        <VerifyText>
          Complete your driver verification to start offering rides
        </VerifyText>
        
        <VerifyDescription>
          As a verified driver, you'll be able to:
          • Create and publish ride offers
          • Accept riders for your trips
          • Access driver-specific features
          • Build your driver reputation
          • Earn through ride sharing
        </VerifyDescription>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <VerifyButton
          onClick={handleFinishVerification}
          disabled={isVerifying || success}
        >
          {isVerifying ? "Verifying..." : success ? "Verified!" : "Finish Driver Verification"}
        </VerifyButton>
      </VerifyContent>
    </VerifyContainer>
  );
};

export default DriverVerify;
