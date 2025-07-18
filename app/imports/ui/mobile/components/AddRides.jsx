import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Rides } from "../../../api/ride/Rides";
import { places } from "../../../api/places/Places.mjs";

/**
 * Modern Mobile AddRides modal component with clean design and comprehensive functionality
 */
class MobileAddRidesModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      origin: "",
      destination: "",
      date: "",
      time: "",
      seats: "1",
      notes: "",
      isSubmitting: false,
      error: "",
      success: false,
      showOriginDropdown: false,
      showDestinationDropdown: false,
      filteredOrigins: places,
      filteredDestinations: places,
      originSearch: "",
      destinationSearch: "",
    };
  }

  componentDidMount() {
    // Set minimum date to today
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];
    this.setState({ minDate });

    // Add event listener for escape key
    document.addEventListener("keydown", this.handleEscapeKey);
    document.addEventListener("click", this.handleOutsideClick);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleEscapeKey);
    document.removeEventListener("click", this.handleOutsideClick);
  }

  componentDidUpdate(prevProps) {
    // Reset form when modal opens
    if (!prevProps.open && this.props.open) {
      this.resetForm();
    }
  }

  handleEscapeKey = (event) => {
    if (event.key === "Escape" && this.props.open) {
      this.handleClose();
    }
  };

  handleOutsideClick = (event) => {
    if (!event.target.closest(".mobile-addrides-dropdown-container")) {
      this.setState({
        showOriginDropdown: false,
        showDestinationDropdown: false,
      });
    }
  };

  resetForm = () => {
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];

    this.setState({
      origin: "",
      destination: "",
      date: "",
      time: "",
      seats: "1",
      notes: "",
      isSubmitting: false,
      error: "",
      success: false,
      showOriginDropdown: false,
      showDestinationDropdown: false,
      filteredOrigins: places,
      filteredDestinations: places,
      originSearch: "",
      destinationSearch: "",
      minDate,
    });
  };

  handleInputChange = (field, value) => {
    this.setState({ [field]: value, error: "" });
  };

  handlePlaceSearch = (field, searchValue) => {
    const searchField =
      field === "origin" ? "originSearch" : "destinationSearch";
    const filteredField =
      field === "origin" ? "filteredOrigins" : "filteredDestinations";

    const filtered = places.filter((place) => place.toLowerCase().includes(searchValue.toLowerCase()));

    this.setState({
      [searchField]: searchValue,
      [filteredField]: filtered,
    });
  };

  handlePlaceSelect = (field, place) => {
    const searchField =
      field === "origin" ? "originSearch" : "destinationSearch";
    const dropdownField =
      field === "origin" ? "showOriginDropdown" : "showDestinationDropdown";

    this.setState({
      [field]: place,
      [searchField]: place,
      [dropdownField]: false,
      error: "",
    });
  };

  toggleDropdown = (field) => {
    const dropdownField =
      field === "origin" ? "showOriginDropdown" : "showDestinationDropdown";
    const searchField =
      field === "origin" ? "originSearch" : "destinationSearch";
    const currentValue = this.state[field];

    this.setState({
      [dropdownField]: !this.state[dropdownField],
      showOriginDropdown:
        field === "origin" ? !this.state.showOriginDropdown : false,
      showDestinationDropdown:
        field === "destination" ? !this.state.showDestinationDropdown : false,
      [searchField]: currentValue,
    });
  };

  swapLocations = () => {
    const { origin, destination } = this.state;
    this.setState({
      origin: destination,
      destination: origin,
      originSearch: destination,
      destinationSearch: origin,
      error: "",
    });
  };

  validateForm = () => {
    const { origin, destination, date, time } = this.state;

    if (!origin.trim()) {
      this.setState({ error: "Please select an origin location" });
      return false;
    }

    if (!destination.trim()) {
      this.setState({ error: "Please select a destination location" });
      return false;
    }

    if (origin === destination) {
      this.setState({ error: "Origin and destination cannot be the same" });
      return false;
    }

    if (!date) {
      this.setState({ error: "Please select a date for your ride" });
      return false;
    }

    if (!time) {
      this.setState({ error: "Please select a time for your ride" });
      return false;
    }

    // Check if date/time is not in the past
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (selectedDateTime <= now) {
      this.setState({ error: "Please select a future date and time" });
      return false;
    }

    return true;
  };

  handleSubmit = (e) => {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const { origin, destination, date, time, seats, notes } = this.state;

    this.setState({ isSubmitting: true, error: "" });

    const rideData = {
      driver: Meteor.user().username,
      rider: "TBD",
      origin: origin.trim(),
      destination: destination.trim(),
      date: new Date(`${date}T${time}`),
      seats: parseInt(seats), // eslint-disable-line
      notes: notes.trim(),
      createdAt: new Date(),
    };

    Rides.insert(rideData, (error) => {
      this.setState({ isSubmitting: false });

      if (error) {
        this.setState({
          error: error.message || "Failed to create ride. Please try again.",
        });
      } else {
        this.setState({ success: true });

        // Close modal and redirect after showing success
        // setTimeout(() => {
        //   this.handleClose();
        //   this.props.history.push("/imRiding");
        // }, 2000);
        // removed redirect to allow user to stay on the same page after ride creation
      }
    });
  };

  handleClose = () => {
    this.resetForm();
    this.props.onClose();
  };

  render() {
    const { open } = this.props;
    const {
      origin,
      destination,
      date,
      time,
      seats,
      notes,
      isSubmitting,
      error,
      success,
      minDate,
      showOriginDropdown,
      showDestinationDropdown,
      filteredOrigins,
      filteredDestinations,
      originSearch,
      destinationSearch,
    } = this.state;

    if (!open) return null;

    return (
      <div className="mobile-addrides-modal-overlay" onClick={this.handleClose}>
        <div
          className="mobile-addrides-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mobile-addrides-modal-header">
            <button
              className="mobile-addrides-modal-close"
              onClick={this.handleClose}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="mobile-addrides-modal-title">Create Your Ride</h2>
            <p className="mobile-addrides-modal-subtitle">
              Share your ride with fellow students
            </p>
          </div>

          {/* Content */}
          <div className="mobile-addrides-modal-content">
            {success ? (
              <div className="mobile-addrides-modal-success">
                <div className="mobile-addrides-modal-success-icon">✓</div>
                <h3 className="mobile-addrides-modal-success-title">
                  Ride Created!
                </h3>
                <p className="mobile-addrides-modal-success-message">
                  Your ride from {origin} to {destination} has been added
                  successfully.
                </p>
                <div className="mobile-addrides-modal-success-details">
                  <div>
                    <strong>Date:</strong> {new Date(date).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Time:</strong> {time}
                  </div>
                  <div>
                    <strong>Seats:</strong> {seats}
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={this.handleSubmit}
                className="mobile-addrides-modal-form"
              >
                {/* Route Section */}
                <div className="mobile-addrides-modal-section">
                  <h3 className="mobile-addrides-modal-section-title">
                    📍 Route
                  </h3>

                  {/* Origin */}
                  <div className="mobile-addrides-modal-field">
                    <label className="mobile-addrides-modal-label">From</label>
                    <div className="mobile-addrides-dropdown-container">
                      <div
                        className="mobile-addrides-dropdown-trigger"
                        onClick={() => this.toggleDropdown("origin")}
                      >
                        <input
                          type="text"
                          value={originSearch}
                          onChange={(e) => this.handlePlaceSearch("origin", e.target.value)
                          }
                          placeholder="Search origin..."
                          className="mobile-addrides-dropdown-input"
                          autoComplete="off"
                        />
                        <span className="mobile-addrides-dropdown-arrow">
                          ▼
                        </span>
                      </div>

                      {showOriginDropdown && (
                        <div className="mobile-addrides-dropdown-menu">
                          {filteredOrigins.length > 0 ? (
                            filteredOrigins.map((place, index) => (
                              <div
                                key={index}
                                className="mobile-addrides-dropdown-item"
                                onClick={() => this.handlePlaceSelect("origin", place)
                                }
                              >
                                {place}
                              </div>
                            ))
                          ) : (
                            <div className="mobile-addrides-dropdown-item mobile-addrides-dropdown-no-results">
                              No locations found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="mobile-addrides-modal-swap-container">
                    <button
                      type="button"
                      onClick={this.swapLocations}
                      className="mobile-addrides-modal-swap-button"
                      title="Swap locations"
                    >
                      ⇅
                    </button>
                  </div>

                  {/* Destination */}
                  <div className="mobile-addrides-modal-field">
                    <label className="mobile-addrides-modal-label">To</label>
                    <div className="mobile-addrides-dropdown-container">
                      <div
                        className="mobile-addrides-dropdown-trigger"
                        onClick={() => this.toggleDropdown("destination")}
                      >
                        <input
                          type="text"
                          value={destinationSearch}
                          onChange={(e) => this.handlePlaceSearch(
                              "destination",
                              e.target.value,
                            )
                          }
                          placeholder="Search destination..."
                          className="mobile-addrides-dropdown-input"
                          autoComplete="off"
                        />
                        <span className="mobile-addrides-dropdown-arrow">
                          ▼
                        </span>
                      </div>

                      {showDestinationDropdown && (
                        <div className="mobile-addrides-dropdown-menu">
                          {filteredDestinations.length > 0 ? (
                            filteredDestinations.map((place, index) => (
                              <div
                                key={index}
                                className="mobile-addrides-dropdown-item"
                                onClick={() => this.handlePlaceSelect("destination", place)
                                }
                              >
                                {place}
                              </div>
                            ))
                          ) : (
                            <div className="mobile-addrides-dropdown-item mobile-addrides-dropdown-no-results">
                              No locations found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* DateTime Section */}
                <div className="mobile-addrides-modal-section">
                  <h3 className="mobile-addrides-modal-section-title">
                    🕒 When
                  </h3>

                  <div className="mobile-addrides-modal-datetime-row">
                    <div className="mobile-addrides-modal-field mobile-addrides-modal-field-half">
                      <label className="mobile-addrides-modal-label">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        min={minDate}
                        onChange={(e) => this.handleInputChange("date", e.target.value)
                        }
                        className="mobile-addrides-modal-input"
                        required
                      />
                    </div>

                    <div className="mobile-addrides-modal-field mobile-addrides-modal-field-half">
                      <label className="mobile-addrides-modal-label">
                        Time
                      </label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => this.handleInputChange("time", e.target.value)
                        }
                        className="mobile-addrides-modal-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="mobile-addrides-modal-section">
                  <h3 className="mobile-addrides-modal-section-title">
                    👥 Details
                  </h3>

                  <div className="mobile-addrides-modal-field">
                    <label className="mobile-addrides-modal-label">
                      Available Seats
                    </label>
                    <select
                      value={seats}
                      onChange={(e) => this.handleInputChange("seats", e.target.value)
                      }
                      className="mobile-addrides-modal-select"
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

                  <div className="mobile-addrides-modal-field">
                    <label className="mobile-addrides-modal-label">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => this.handleInputChange("notes", e.target.value)
                      }
                      placeholder="Additional details..."
                      className="mobile-addrides-modal-textarea"
                      rows="2"
                      maxLength="200"
                    />
                    <div className="mobile-addrides-modal-char-count">
                      {notes.length}/200
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mobile-addrides-modal-error">{error}</div>
                )}

                {/* Action Buttons */}
                <div className="mobile-addrides-modal-actions">
                  <button
                    type="button"
                    className="mobile-addrides-modal-button-secondary"
                    onClick={this.handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mobile-addrides-modal-button-primary"
                  >
                    {isSubmitting ? "Creating..." : "Create Ride"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <style jsx>{`
          .mobile-addrides-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
            backdrop-filter: blur(4px);
          }

          .mobile-addrides-modal {
            background-color: rgba(255, 255, 255, 1);
            border-radius: 16px;
            max-width: 450px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            font-family:
              Inter,
              -apple-system,
              Roboto,
              Helvetica,
              sans-serif;
            animation: modalSlideIn 0.3s ease-out;
          }

          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .mobile-addrides-modal-header {
            padding: 24px 24px 16px 24px;
            border-bottom: 1px solid rgba(240, 240, 240, 1);
            position: relative;
            text-align: center;
          }

          .mobile-addrides-modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            font-size: 18px;
            color: rgba(100, 100, 100, 1);
            cursor: pointer;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .mobile-addrides-modal-close:hover {
            background-color: rgba(240, 240, 240, 1);
            color: rgba(0, 0, 0, 1);
          }

          .mobile-addrides-modal-title {
            font-size: 20px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            margin: 0 0 8px 0;
            letter-spacing: -0.3px;
          }

          .mobile-addrides-modal-subtitle {
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
            margin: 0;
            line-height: 1.4;
          }

          .mobile-addrides-modal-content {
            padding: 24px;
          }

          .mobile-addrides-modal-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .mobile-addrides-modal-section {
            background-color: rgba(248, 249, 250, 1);
            border-radius: 12px;
            padding: 16px;
          }

          .mobile-addrides-modal-section-title {
            font-size: 16px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            margin: 0 0 12px 0;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .mobile-addrides-modal-field {
            margin-bottom: 12px;
          }

          .mobile-addrides-modal-field:last-child {
            margin-bottom: 0;
          }

          .mobile-addrides-modal-label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: rgba(0, 0, 0, 1);
            margin-bottom: 6px;
          }

          .mobile-addrides-modal-input,
          .mobile-addrides-modal-select,
          .mobile-addrides-modal-textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid rgba(224, 224, 224, 1);
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            background-color: rgba(255, 255, 255, 1);
            transition: all 0.2s ease;
            box-sizing: border-box;
          }

          .mobile-addrides-modal-input:focus,
          .mobile-addrides-modal-select:focus,
          .mobile-addrides-modal-textarea:focus {
            outline: none;
            border-color: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
          }

          .mobile-addrides-modal-textarea {
            resize: vertical;
            min-height: 60px;
          }

          .mobile-addrides-modal-char-count {
            font-size: 11px;
            color: rgba(150, 150, 150, 1);
            text-align: right;
            margin-top: 4px;
          }

          .mobile-addrides-modal-datetime-row {
            display: flex;
            gap: 12px;
          }

          .mobile-addrides-modal-field-half {
            flex: 1;
          }

          .mobile-addrides-dropdown-container {
            position: relative;
            width: 100%;
          }

          .mobile-addrides-dropdown-trigger {
            position: relative;
            cursor: pointer;
            width: 100%;
            display: block;
          }

          .mobile-addrides-dropdown-input {
            width: 100%;
            padding: 10px 12px 10px 12px;
            padding-right: 40px;
            cursor: pointer;
            box-sizing: border-box;
            border: 1px solid rgba(224, 224, 224, 1);
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            background-color: rgba(255, 255, 255, 1);
            transition: all 0.2s ease;
          }

          .mobile-addrides-dropdown-input:focus {
            outline: none;
            border-color: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
          }

          .mobile-addrides-dropdown-arrow {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(150, 150, 150, 1);
            font-size: 12px;
            pointer-events: none;
            line-height: 1;
          }

          .mobile-addrides-dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: rgba(255, 255, 255, 1);
            border: 1px solid rgba(224, 224, 224, 1);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            max-height: 150px;
            overflow-y: auto;
            margin-top: 4px;
          }

          .mobile-addrides-dropdown-item {
            padding: 10px 12px;
            cursor: pointer;
            border-bottom: 1px solid rgba(240, 240, 240, 1);
            transition: background-color 0.2s ease;
            font-size: 14px;
          }

          .mobile-addrides-dropdown-item:last-child {
            border-bottom: none;
          }

          .mobile-addrides-dropdown-item:hover {
            background-color: rgba(248, 249, 250, 1);
          }

          .mobile-addrides-dropdown-no-results {
            color: rgba(150, 150, 150, 1);
            font-style: italic;
            cursor: default;
          }

          .mobile-addrides-dropdown-no-results:hover {
            background-color: transparent;
          }

          .mobile-addrides-modal-swap-container {
            display: flex;
            justify-content: center;
            margin: 6px 0;
          }

          .mobile-addrides-modal-swap-button {
            background-color: rgba(255, 255, 255, 1);
            border: 1px solid rgba(224, 224, 224, 1);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
            transition: all 0.2s ease;
          }

          .mobile-addrides-modal-swap-button:hover {
            background-color: rgba(230, 230, 230, 1);
            color: rgba(0, 0, 0, 1);
            transform: scale(1.05);
          }

          .mobile-addrides-modal-error {
            background-color: rgba(255, 240, 240, 1);
            border: 1px solid rgba(255, 200, 200, 1);
            border-radius: 8px;
            padding: 12px 16px;
            color: rgba(200, 0, 0, 1);
            font-size: 14px;
            text-align: center;
            margin-bottom: 16px;
          }

          .mobile-addrides-modal-actions {
            display: flex;
            gap: 12px;
            margin-top: 8px;
          }

          .mobile-addrides-modal-button-primary {
            flex: 1;
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 12px;
            padding: 14px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          .mobile-addrides-modal-button-primary:hover:not(:disabled) {
            background-color: rgba(40, 40, 40, 1);
            transform: translateY(-1px);
          }

          .mobile-addrides-modal-button-primary:disabled {
            background-color: rgba(200, 200, 200, 1);
            color: rgba(150, 150, 150, 1);
            cursor: not-allowed;
            transform: none;
          }

          .mobile-addrides-modal-button-secondary {
            flex: 1;
            background-color: rgba(245, 245, 245, 1);
            color: rgba(100, 100, 100, 1);
            border: none;
            border-radius: 12px;
            padding: 14px 24px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          .mobile-addrides-modal-button-secondary:hover:not(:disabled) {
            background-color: rgba(230, 230, 230, 1);
            color: rgba(0, 0, 0, 1);
          }

          .mobile-addrides-modal-button-secondary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .mobile-addrides-modal-success {
            text-align: center;
            padding: 20px 0;
          }

          .mobile-addrides-modal-success-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background-color: rgba(0, 200, 0, 1);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin: 0 auto 20px auto;
            animation: successPulse 0.6s ease-out;
          }

          @keyframes successPulse {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          .mobile-addrides-modal-success-title {
            font-size: 18px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            margin: 0 0 8px 0;
          }

          .mobile-addrides-modal-success-message {
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
            line-height: 1.4;
            margin: 0 0 16px 0;
          }

          .mobile-addrides-modal-success-details {
            background-color: rgba(248, 249, 250, 1);
            border-radius: 8px;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            color: rgba(60, 60, 60, 1);
          }

          .mobile-addrides-modal-success-details div {
            margin-bottom: 4px;
          }

          .mobile-addrides-modal-success-details div:last-child {
            margin-bottom: 0;
          }

          @media (max-width: 480px) {
            .mobile-addrides-modal {
              margin: 10px;
              border-radius: 12px;
              max-height: 95vh;
            }

            .mobile-addrides-modal-datetime-row {
              flex-direction: column;
              gap: 0;
            }

            .mobile-addrides-modal-field-half {
              margin-bottom: 12px;
            }

            .mobile-addrides-modal-actions {
              flex-direction: column;
            }

            .mobile-addrides-modal-button-primary,
            .mobile-addrides-modal-button-secondary {
              flex: none;
            }
          }
        `}</style>
      </div>
    );
  }
}

MobileAddRidesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(MobileAddRidesModal);
