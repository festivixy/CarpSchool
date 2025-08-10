import React, { useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import {
  PageContainer,
  Header,
  HeaderTitle,
  BackButton,
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
 * Native iOS styling without LiquidGlass components
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

  // Get today's date for min date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={handleBack}>
          ← Back
        </BackButton>
        <HeaderTitle>Create Ride</HeaderTitle>
      </Header>

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
