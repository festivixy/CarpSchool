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
  const [redirectTo, setRedirectTo] = useState("");

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
        /* Straight to where the account now stands. /edit-profile is gated on
         * the very state this leaves behind, so it used to bounce. */
        setTimeout(() => {
          setRedirectTo(result.alreadyApproved ? "/mobile/profile" : "/waiting-confirmation");
        }, 2000);
      }
    });
  };

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  return (
    <VerifyContainer>
      <BackButton />
      
      <VerifyHeader>
        <VerifyIcon></VerifyIcon>
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
