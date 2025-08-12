import React, { useState } from "react";
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
  CreateRidePageContainer,
  CreateRideHeader,
  CreateRideHeaderTitle,
  CreateRideContent,
  CreateRideForm,
  FormField,
  DateTimeRow,
  FlexField,
  Form,
  FormGroup,
  Label,
  Input,
  TextArea,
  SubmitButton,
  LoadingSpinner,
  ErrorMessage,
} from "../styles/CreateRide";

/**
 * iOS-specific Create Ride page
 * Wrapper that removes modal styling from AddRidesModal content
 */
const CreateRide = ({ history, currentUser }) => {
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    departureTime: "",
    availableSeats: "1",
    description: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleBack = () => {
    history.goBack();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleCreateRide = () => {
    // Validation
    if (!formData.origin.trim()) {
      setError("Please enter a pickup location");
      return;
    }
    if (!formData.destination.trim()) {
      setError("Please enter a destination");
      return;
    }
    if (!formData.departureDate) {
      setError("Please select a departure date");
      return;
    }
    if (!formData.departureTime) {
      setError("Please select a departure time");
      return;
    }

    setIsCreating(true);
    setError(null);

    // Create ride using Meteor method
    Meteor.call("rides.create", {
      origin: formData.origin.trim(),
      destination: formData.destination.trim(),
      departureDate: formData.departureDate,
      departureTime: formData.departureTime,
      availableSeats: parseInt(formData.availableSeats),
      description: formData.description.trim()
    }, (error, result) => {
      setIsCreating(false);

      if (error) {
        setError(error.reason || "Failed to create ride");
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
        <SuccessModal>
          <SuccessIcon>
            🚗
          </SuccessIcon>
          <SuccessTitle>
            Ride Created!
          </SuccessTitle>
          <SuccessMessage>
            Your ride has been created successfully. Redirecting to your rides...
          </SuccessMessage>
        </SuccessModal>
      </SuccessOverlay>
    );
  }

  return (
    <CreateRidePageContainer>
      {/* Fixed Header */}
      <CreateRideHeader>
        <CreateRideHeaderTitle>
          Create Ride
        </CreateRideHeaderTitle>
      </CreateRideHeader>

      <BackButton />

      <CreateRideContent>
        <CreateRideForm>
          <h2 style={{
            margin: "0 0 8px 0",
            fontSize: "24px",
            fontWeight: "700",
            color: "#333"
          }}>
            Create a New Ride
          </h2>
          <p style={{
            margin: "0 0 30px 0",
            fontSize: "16px",
            color: "#666",
            lineHeight: "1.4"
          }}>
            Share your journey and help others get where they need to go
          </p>

          {/* Form Fields */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px"
            }}>
              Pickup Location *
            </label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => handleInputChange("origin", e.target.value)}
              placeholder="Where will you pick up passengers?"
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "white",
                color: "#333",
                outline: "none",
                transition: "border-color 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#007AFF"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px"
            }}>
              Destination *
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              placeholder="Where are you going?"
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "white",
                color: "#333",
                outline: "none",
                transition: "border-color 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#007AFF"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "8px"
              }}>
                Date *
              </label>
              <input
                type="date"
                value={formData.departureDate}
                onChange={(e) => handleInputChange("departureDate", e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "white",
                  color: "#333",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#007AFF"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "8px"
              }}>
                Time *
              </label>
              <input
                type="time"
                value={formData.departureTime}
                onChange={(e) => handleInputChange("departureTime", e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "white",
                  color: "#333",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#007AFF"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px"
            }}>
              Available Seats
            </label>
            <select
              value={formData.availableSeats}
              onChange={(e) => handleInputChange("availableSeats", e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "white",
                color: "#333",
                outline: "none",
                transition: "border-color 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#007AFF"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            >
              <option value="1">1 seat</option>
              <option value="2">2 seats</option>
              <option value="3">3 seats</option>
              <option value="4">4 seats</option>
              <option value="5">5 seats</option>
              <option value="6">6 seats</option>
              <option value="7">7 seats</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px"
            }}>
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Add any additional details about your ride..."
              rows={3}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "white",
                color: "#333",
                outline: "none",
                transition: "border-color 0.2s ease",
                boxSizing: "border-box",
                resize: "vertical",
                minHeight: "80px"
              }}
              onFocus={(e) => e.target.style.borderColor = "#007AFF"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          {error && (
            <div style={{
              padding: "12px 16px",
              marginBottom: "20px",
              backgroundColor: "#FFEBEE",
              border: "1px solid #FFCDD2",
              borderRadius: "8px",
              color: "#C62828",
              fontSize: "14px"
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleCreateRide}
            disabled={isCreating}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "#007AFF",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              opacity: isCreating ? 0.7 : 1
            }}
          >
            {isCreating ? "Creating Ride..." : "Create Ride"}
          </button>
        </CreateRideForm>
      </CreateRideContent>
    </CreateRidePageContainer>
  );
};

CreateRide.propTypes = {
  history: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
};

export default withRouter(withTracker(() => ({
  currentUser: Meteor.user(),
}))(CreateRide));
