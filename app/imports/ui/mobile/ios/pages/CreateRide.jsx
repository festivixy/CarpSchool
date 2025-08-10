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
  TextArea,
  Button,
  ErrorMessage,
  LoadingSpinner,
} from "../styles/CreateRide";

/**
 * iOS-specific Create Ride page
 * Integrates with native iOS navbar system
 */
const CreateRide = ({ history, currentUser }) => {
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    departureTime: "",
    availableSeats: "1",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [navBarId, setNavBarId] = useState(null);

  const {
    isSupported,
    createNavBar,
    setNavBarItems,
    showNavBar,
    removeNavBar,
    setActionHandler,
  } = useNativeNavBar();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.origin || !formData.destination || !formData.departureDate || !formData.departureTime) {
        throw new Error("Please fill in all required fields");
      }

      // Create the ride using Meteor method
      await new Promise((resolve, reject) => {
        Meteor.call("rides.insert", {
          origin: formData.origin,
          destination: formData.destination,
          departureDate: formData.departureDate,
          departureTime: formData.departureTime,
          availableSeats: parseInt(formData.availableSeats),
          description: formData.description,
        }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      // Success - redirect to My Rides
      console.log("[iOS CreateRide] ✅ Ride created successfully, redirecting to /myRides");
      history.push("/myRides");

    } catch (err) {
      console.error("[iOS CreateRide] ❌ Error creating ride:", err);
      setError(err.reason || err.message || "Failed to create ride");
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

    // Set action handler for back button AND preserve bottom navbar actions
    setActionHandler((navBarId, action, itemIndex) => {
      console.log("[CreateRide] Action handler called:", { navBarId, action, itemIndex });

      if (action === "back") {
        handleBack();
      } else if (action === "tap") {
        // This is likely a bottom navbar action, let the default NativeNavBar handler deal with it
        // We need to route this back to the main navbar handler
        console.log("[CreateRide] Delegating tap action to main navbar");

        // Import the history for navigation
        if (itemIndex === 0) { // Home
          const homeLink = Meteor.user() ? "/myRides" : "/";
          history.push(homeLink);
        } else if (itemIndex === 1) { // Join Ride
          history.push("/ios/join-ride");
        } else if (itemIndex === 2) { // Create (current page)
          // Already on create page, no action needed
        } else if (itemIndex === 3) { // Messages
          history.push("/chat");
        } else if (itemIndex === 4) { // Profile
          history.push("/ios/profile");
        }
      }
    });
  }, [isSupported, setActionHandler, handleBack, history]);

  // Set up native navbar
  useEffect(() => {
    if (!isSupported) return;

    const setupNavBar = async () => {
      try {
        // Create native navbar with back button
        const newNavBarId = await createNavBar({
          title: "Create Ride",
          showBackButton: true,
          position: "top"
        });

        setNavBarId(newNavBarId);

        // Show the navbar
        await showNavBar(newNavBarId);

      } catch (error) {
        console.error("[CreateRide] Failed to setup native navbar:", error);
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

  // Get today's date for min date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <PageContainer>
      <Content>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="origin">Origin *</Label>
            <Input
              id="origin"
              type="text"
              placeholder="Where are you leaving from?"
              value={formData.origin}
              onChange={(e) => handleInputChange("origin", e.target.value)}
              disabled={isLoading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="destination">Destination *</Label>
            <Input
              id="destination"
              type="text"
              placeholder="Where are you going?"
              value={formData.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              disabled={isLoading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="departureDate">Departure Date *</Label>
            <Input
              id="departureDate"
              type="date"
              min={today}
              value={formData.departureDate}
              onChange={(e) => handleInputChange("departureDate", e.target.value)}
              disabled={isLoading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="departureTime">Departure Time *</Label>
            <Input
              id="departureTime"
              type="time"
              value={formData.departureTime}
              onChange={(e) => handleInputChange("departureTime", e.target.value)}
              disabled={isLoading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="availableSeats">Available Seats</Label>
            <Input
              id="availableSeats"
              type="number"
              min="1"
              max="8"
              value={formData.availableSeats}
              onChange={(e) => handleInputChange("availableSeats", e.target.value)}
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description (Optional)</Label>
            <TextArea
              id="description"
              placeholder="Any additional details about your ride..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isLoading}
              rows="3"
            />
          </FormGroup>

          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}

          <Button
            type="submit"
            disabled={isLoading || !formData.origin || !formData.destination || !formData.departureDate || !formData.departureTime}
          >
            {isLoading ? <LoadingSpinner /> : "Create Ride"}
          </Button>
        </Form>
      </Content>
    </PageContainer>
  );
};

CreateRide.propTypes = {
  history: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
};

export default withRouter(withTracker(() => ({
  currentUser: Meteor.user(),
}))(CreateRide));
