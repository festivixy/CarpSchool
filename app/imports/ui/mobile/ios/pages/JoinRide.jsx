import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import useNativeNavBar from "../hooks/useNativeNavBar";
import {
  PageContainer,
  Content,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  ErrorMessage,
  LoadingSpinner,
  InfoText,
} from "../styles/JoinRide";

/**
 * iOS-specific Join Ride page
 * Integrates with native iOS navbar system
 */
const JoinRide = ({ history, currentUser }) => {
  const [rideCode, setRideCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [navBarId, setNavBarId] = useState(null);

  const {
    isSupported,
    createNavBar,
    showNavBar,
    removeNavBar,
    setActionHandler,
  } = useNativeNavBar();

  const handleInputChange = (value) => {
    setRideCode(value.toUpperCase());
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate ride code
      if (!rideCode || rideCode.length < 3) {
        throw new Error("Please enter a valid ride code");
      }

      // Join the ride using Meteor method
      await new Promise((resolve, reject) => {
        Meteor.call("rides.join", {
          rideCode: rideCode.trim(),
        }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      // Success - redirect to My Rides
      console.log("[iOS JoinRide] ✅ Successfully joined ride, redirecting to /myRides");
      history.push("/myRides");

    } catch (err) {
      console.error("[iOS JoinRide] ❌ Error joining ride:", err);
      setError(err.reason || err.message || "Failed to join ride");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    history.goBack();
  };

  // Set up action handler only once
  useEffect(() => {
    if (!isSupported) return;

    // Set action handler for back button
    setActionHandler((navBarId, action, itemIndex) => {
      if (action === "back") {
        handleBack();
      }
    });
  }, [isSupported, setActionHandler, handleBack]);

  // Set up native navbar
  useEffect(() => {
    if (!isSupported) return;

    const setupNavBar = async () => {
      try {
        // Create native navbar with back button
        const newNavBarId = await createNavBar({
          title: "Join Ride",
          showBackButton: true,
          position: "top"
        });

        setNavBarId(newNavBarId);

        // Show the navbar
        await showNavBar(newNavBarId);

      } catch (error) {
        console.error("[JoinRide] Failed to setup native navbar:", error);
      }
    };

    setupNavBar();

    // Cleanup
    return () => {
      if (navBarId) {
        removeNavBar(navBarId).catch(console.error);
      }
    };
  }, [isSupported, createNavBar, showNavBar, removeNavBar]);

  const handleScanQR = () => {
    // TODO: Implement QR code scanning
    console.log("[iOS JoinRide] 📱 QR scan feature would be implemented here");
    setError("QR scanning not yet implemented");
  };

  return (
    <PageContainer>
      <Content>
        <InfoText>
          Enter the ride code shared by the driver to join their ride.
        </InfoText>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="rideCode">Ride Code *</Label>
            <Input
              id="rideCode"
              type="text"
              placeholder="Enter ride code (e.g. ABC123)"
              value={rideCode}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={isLoading}
              maxLength="10"
              autoCapitalize="characters"
              autoComplete="off"
              required
            />
          </FormGroup>

          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}

          <Button
            type="submit"
            disabled={isLoading || !rideCode}
          >
            {isLoading ? <LoadingSpinner /> : "Join Ride"}
          </Button>

          <Button
            type="button"
            onClick={handleScanQR}
            disabled={isLoading}
            style={{ marginTop: "12px", backgroundColor: "#34C759" }}
          >
            📱 Scan QR Code
          </Button>
        </Form>

        <InfoText style={{ marginTop: "24px", fontSize: "14px", color: "#8E8E93" }}>
          Don't have a ride code? Ask the driver to share their ride code with you,
          or check your messages for ride invitations.
        </InfoText>
      </Content>
    </PageContainer>
  );
};

JoinRide.propTypes = {
  history: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
};

export default withRouter(withTracker(() => ({
  currentUser: Meteor.user(),
}))(JoinRide));
