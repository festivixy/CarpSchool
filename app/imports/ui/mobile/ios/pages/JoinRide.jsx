import React, { useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import BackButton from "../../components/BackButton";
import {
  SuccessOverlay,
  SubmitButton,
  SuccessModalContainer,
  SuccessIconContainer,
  SuccessHeading,
  SuccessText,
  MainPageContainer,
  FixedHeader,
  HeaderTitle,
  ContentPadding,
  FormContainer,
  FormTitle,
  FormDescription,
  CodeInputsContainer,
  CodeInputWrapper,
  CodeInput,
  CodeSeparator,
  FormErrorMessage,
} from "../styles/JoinRide";

/**
 * iOS-specific Join Ride page
 * Wrapper that removes modal styling from JoinRideModal content
 */
const JoinRide = ({ history, currentUser: _currentUser }) => {
  const [codeInputs, setCodeInputs] = useState(["", "", "", "", "", "", "", ""]);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRefs = [];

  const handleInputChange = (index, value) => {
    // Only allow alphanumeric characters and limit to 1 character
    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (sanitizedValue.length <= 1) {
      const newInputs = [...codeInputs];
      newInputs[index] = sanitizedValue;
      setCodeInputs(newInputs);

      // Auto-focus next input
      if (sanitizedValue && index < 7) {
        const nextInput = inputRefs[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codeInputs[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      const prevInput = inputRefs[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleJoinRide = () => {
    const rideCode = codeInputs.join("").trim();

    if (rideCode.length < 8) {
      setError("Please enter a complete 8-character ride code");
      return;
    }

    setIsJoining(true);
    setError(null);

    Meteor.call("rides.join", { rideCode }, (error, _result) => {
      setIsJoining(false);

      if (error) {
        setError(error.reason || "Failed to join ride");
      } else {
        setSuccess(true);
        setTimeout(() => {
          history.push("/myRides");
        }, 2000);
      }
    });
  };

  if (success) {
    return (
      <SuccessOverlay>
        <SuccessModalContainer>
          <SuccessIconContainer>
            ✅
          </SuccessIconContainer>
          <SuccessHeading>
            Successfully Joined!
          </SuccessHeading>
          <SuccessText>
            You&apos;ve successfully joined the ride. Redirecting to your rides...
          </SuccessText>
        </SuccessModalContainer>
      </SuccessOverlay>
    );
  }

  return (
    <MainPageContainer>
      {/* Fixed Header */}
      <FixedHeader>
        <HeaderTitle>
          Join Ride
        </HeaderTitle>
      </FixedHeader>

      <BackButton />

      <ContentPadding>
        <FormContainer>
          <FormTitle>
            Enter Ride Code
          </FormTitle>
          <FormDescription>
            Enter the 8-character code shared by the driver
          </FormDescription>

          {/* Code Inputs */}
          <CodeInputsContainer>
            {codeInputs.map((value, index) => (
              <CodeInputWrapper key={index}>
                <CodeInput
                  ref={(el) => (inputRefs[index] = el)}
                  type="text"
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
                {index === 3 && (
                  <CodeSeparator>
                    -
                  </CodeSeparator>
                )}
              </CodeInputWrapper>
            ))}
          </CodeInputsContainer>

          {error && (
            <FormErrorMessage>
              {error}
            </FormErrorMessage>
          )}

          <SubmitButton
            onClick={handleJoinRide}
            disabled={isJoining || codeInputs.join("").length < 8}
            enabled={codeInputs.join("").length === 8}
          >
            {isJoining ? "Joining..." : "Join Ride"}
          </SubmitButton>
        </FormContainer>
      </ContentPadding>
    </MainPageContainer>
  );
};

JoinRide.propTypes = {
  history: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
};

export default withRouter(withTracker(() => ({
  currentUser: Meteor.user(),
}))(JoinRide));
