import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import BackButton from "../../components/BackButton";
import {
  SuccessOverlay,
  SuccessModal,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  PageContainer,
  Content,
  Form,
  FormGroup,
  Label,
  Input,
  SubmitButton,
  LoadingSpinner,
  ErrorMessage,
  JoinRidePageContainer,
  JoinRideHeader,
  JoinRideHeaderTitle,
  JoinRideContent,
  JoinRideForm,
  CodeContainer,
} from "../styles/JoinRide";

/**
 * iOS-specific Join Ride page
 * Wrapper that removes modal styling from JoinRideModal content
 */
const JoinRide = ({ history, currentUser }) => {
  const [codeInputs, setCodeInputs] = useState(["", "", "", "", "", "", "", ""]);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRefs = [];

  const handleBack = () => {
    history.goBack();
  };

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

    Meteor.call("rides.join", { rideCode }, (error, result) => {
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

  const handleTryAgain = () => {
    setSuccess(false);
    setCodeInputs(["", "", "", "", "", "", "", ""]);
    setError(null);
    // Focus first input
    if (inputRefs[0]) {
      inputRefs[0].focus();
    }
  };

  if (success) {
    return (
      <SuccessOverlay>
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "40px 30px",
          textAlign: "center",
          maxWidth: "320px",
          width: "100%",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "20px"
          }}>
            ✅
          </div>
          <h2 style={{
            margin: "0 0 12px 0",
            fontSize: "22px",
            fontWeight: "600",
            color: "#333"
          }}>
            Successfully Joined!
          </h2>
          <p style={{
            margin: 0,
            fontSize: "16px",
            color: "#666",
            lineHeight: "1.4"
          }}>
            You've successfully joined the ride. Redirecting to your rides...
          </p>
        </div>
      </SuccessOverlay>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#f5f5f5",
      paddingTop: "60px",
      paddingBottom: "100px"
    }}>
      {/* Fixed Header */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        backgroundColor: "white",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "18px",
          fontWeight: "600",
          color: "#333"
        }}>
          Join Ride
        </h1>
      </div>

      <BackButton />

      <div style={{ padding: "20px" }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{
            margin: "0 0 8px 0",
            fontSize: "24px",
            fontWeight: "700",
            color: "#333",
            textAlign: "center"
          }}>
            Enter Ride Code
          </h2>
          <p style={{
            margin: "0 0 30px 0",
            fontSize: "16px",
            color: "#666",
            textAlign: "center",
            lineHeight: "1.4"
          }}>
            Enter the 8-character code shared by the driver
          </p>

          {/* Code Inputs */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "20px",
            flexWrap: "wrap"
          }}>
            {codeInputs.map((value, index) => (
              <div key={index}>
                <input
                  ref={(el) => (inputRefs[index] = el)}
                  type="text"
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: "40px",
                    height: "50px",
                    textAlign: "center",
                    fontSize: "20px",
                    fontWeight: "600",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    color: "#333",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#007AFF"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
                {index === 3 && (
                  <span style={{
                    display: "inline-block",
                    width: "16px",
                    textAlign: "center",
                    fontSize: "20px",
                    color: "#ccc",
                    verticalAlign: "middle"
                  }}>
                    -
                  </span>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div style={{
              padding: "12px 16px",
              marginBottom: "20px",
              backgroundColor: "#FFEBEE",
              border: "1px solid #FFCDD2",
              borderRadius: "8px",
              color: "#C62828",
              fontSize: "14px",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleJoinRide}
            disabled={isJoining || codeInputs.join("").length < 8}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: codeInputs.join("").length === 8 ? "#007AFF" : "#ccc",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white",
              cursor: codeInputs.join("").length === 8 ? "pointer" : "not-allowed",
              transition: "background-color 0.2s ease"
            }}
          >
            {isJoining ? "Joining..." : "Join Ride"}
          </button>
        </div>
      </div>
    </div>
  );
};

JoinRide.propTypes = {
  history: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
};

export default withRouter(withTracker(() => ({
  currentUser: Meteor.user(),
}))(JoinRide));