// @deprecated unused. use app/imports/ui/mobile/components/AddRides.jsx instead

import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Rides } from "../../../api/ride/Rides";
import MobileNavBar from "../components/NavBar";
import MobileFooter from "../components/Footer";

// Hawaii places for the ride system
const hawaiiPlaces = [
  "Aiea",
  "Ewa Beach",
  "Hale`iwa",
  "Hau`ula",
  "Hawaii Kai",
  "Honolulu",
  "Ka`a`awa",
  "Kahala",
  "Kahuku",
  "Kailua",
  "Kane`ohe",
  "Kapolei",
  "La`ie",
  "Lanikai",
  "Ma`ili",
  "Makaha",
  "Manoa",
  "Mililani",
  "Nanakuli",
  "Pearl City",
  "University of Hawaii Manoa",
  "Wahiawa",
  "Waialua",
  "Wai`anae",
  "Waikiki",
  "Waimanalo",
  "Waipahu",
];

/**
 * Modern Mobile AddRides component with clean design and comprehensive functionality
 */
class MobileAddRides extends React.Component {
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
      filteredOrigins: hawaiiPlaces,
      filteredDestinations: hawaiiPlaces,
      originSearch: "",
      destinationSearch: "",
    };
  }

  componentDidMount() {
    // Set minimum date to today
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];
    this.setState({ minDate });

    // Add click listener to close dropdowns when clicking outside
    document.addEventListener("click", this.handleOutsideClick);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  }

  handleOutsideClick = (event) => {
    if (!event.target.closest(".mobile-addrides-dropdown-container")) {
      this.setState({
        showOriginDropdown: false,
        showDestinationDropdown: false,
      });
    }
  };

  handleInputChange = (field, value) => {
    this.setState({ [field]: value, error: "" });
  };

  handlePlaceSearch = (field, searchValue) => {
    const searchField =
      field === "origin" ? "originSearch" : "destinationSearch";
    const filteredField =
      field === "origin" ? "filteredOrigins" : "filteredDestinations";

    const filtered = hawaiiPlaces.filter((place) =>
      place.toLowerCase().includes(searchValue.toLowerCase()),
    );

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
      seats: parseInt(seats),
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

        // Redirect after showing success
        setTimeout(() => {
          this.props.history.push("/imRiding");
        }, 2000);
      }
    });
  };

  render() {
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

    if (success) {
      return (
        <>
          <MobileNavBar />
          <div className="mobile-addrides-container">
            <div className="mobile-addrides-success">
              <div className="mobile-addrides-success-icon">✓</div>
              <h2 className="mobile-addrides-success-title">
                Ride Created Successfully!
              </h2>
              <p className="mobile-addrides-success-message">
                Your ride from {origin} to {destination} has been added to the
                system. Other students can now join your ride.
              </p>
              <div className="mobile-addrides-success-details">
                <div className="mobile-addrides-success-detail">
                  <strong>Date:</strong> {new Date(date).toLocaleDateString()}
                </div>
                <div className="mobile-addrides-success-detail">
                  <strong>Time:</strong> {time}
                </div>
                <div className="mobile-addrides-success-detail">
                  <strong>Available Seats:</strong> {seats}
                </div>
              </div>
            </div>
          </div>
          <MobileFooter />
        </>
      );
    }

    return (
      <>
        <MobileNavBar />
        <div className="mobile-addrides-container">
          <div className="mobile-addrides-header">
            <h1 className="mobile-addrides-title">Create Your Ride</h1>
            <p className="mobile-addrides-subtitle">
              Share your ride with fellow students and split the costs
            </p>
          </div>

          <form onSubmit={this.handleSubmit} className="mobile-addrides-form">
            {/* Route Section */}
            <div className="mobile-addrides-section">
              <h3 className="mobile-addrides-section-title">📍 Route</h3>

              {/* Origin */}
              <div className="mobile-addrides-field">
                <label className="mobile-addrides-label">From</label>
                <div className="mobile-addrides-dropdown-container">
                  <div
                    className="mobile-addrides-dropdown-trigger"
                    onClick={() => this.toggleDropdown("origin")}
                  >
                    <input
                      type="text"
                      value={originSearch}
                      onChange={(e) =>
                        this.handlePlaceSearch("origin", e.target.value)
                      }
                      placeholder="Search origin location..."
                      className="mobile-addrides-dropdown-input"
                      autoComplete="off"
                    />
                    <span className="mobile-addrides-dropdown-arrow">▼</span>
                  </div>

                  {showOriginDropdown && (
                    <div className="mobile-addrides-dropdown-menu">
                      {filteredOrigins.length > 0 ? (
                        filteredOrigins.map((place, index) => (
                          <div
                            key={index}
                            className="mobile-addrides-dropdown-item"
                            onClick={() =>
                              this.handlePlaceSelect("origin", place)
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
              <div className="mobile-addrides-swap-container">
                <button
                  type="button"
                  onClick={this.swapLocations}
                  className="mobile-addrides-swap-button"
                  title="Swap origin and destination"
                >
                  ⇅
                </button>
              </div>

              {/* Destination */}
              <div className="mobile-addrides-field">
                <label className="mobile-addrides-label">To</label>
                <div className="mobile-addrides-dropdown-container">
                  <div
                    className="mobile-addrides-dropdown-trigger"
                    onClick={() => this.toggleDropdown("destination")}
                  >
                    <input
                      type="text"
                      value={destinationSearch}
                      onChange={(e) =>
                        this.handlePlaceSearch("destination", e.target.value)
                      }
                      placeholder="Search destination location..."
                      className="mobile-addrides-dropdown-input"
                      autoComplete="off"
                    />
                    <span className="mobile-addrides-dropdown-arrow">▼</span>
                  </div>

                  {showDestinationDropdown && (
                    <div className="mobile-addrides-dropdown-menu">
                      {filteredDestinations.length > 0 ? (
                        filteredDestinations.map((place, index) => (
                          <div
                            key={index}
                            className="mobile-addrides-dropdown-item"
                            onClick={() =>
                              this.handlePlaceSelect("destination", place)
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
            <div className="mobile-addrides-section">
              <h3 className="mobile-addrides-section-title">🕒 When</h3>

              <div className="mobile-addrides-datetime-row">
                <div className="mobile-addrides-field mobile-addrides-field-half">
                  <label className="mobile-addrides-label">Date</label>
                  <input
                    type="date"
                    value={date}
                    min={minDate}
                    onChange={(e) =>
                      this.handleInputChange("date", e.target.value)
                    }
                    className="mobile-addrides-input"
                    required
                  />
                </div>

                <div className="mobile-addrides-field mobile-addrides-field-half">
                  <label className="mobile-addrides-label">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) =>
                      this.handleInputChange("time", e.target.value)
                    }
                    className="mobile-addrides-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="mobile-addrides-section">
              <h3 className="mobile-addrides-section-title">👥 Details</h3>

              <div className="mobile-addrides-field">
                <label className="mobile-addrides-label">Available Seats</label>
                <select
                  value={seats}
                  onChange={(e) =>
                    this.handleInputChange("seats", e.target.value)
                  }
                  className="mobile-addrides-select"
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

              <div className="mobile-addrides-field">
                <label className="mobile-addrides-label">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) =>
                    this.handleInputChange("notes", e.target.value)
                  }
                  placeholder="Any additional details about your ride..."
                  className="mobile-addrides-textarea"
                  rows="3"
                  maxLength="300"
                />
                <div className="mobile-addrides-char-count">
                  {notes.length}/300 characters
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && <div className="mobile-addrides-error">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mobile-addrides-submit-button"
            >
              {isSubmitting ? "Creating Ride..." : "Create Ride"}
            </button>
          </form>
        </div>
        <MobileFooter />

        <style jsx>{`
          .mobile-addrides-container {
            background-color: rgba(255, 255, 255, 1);
            width: 100%;
            min-height: 100vh;
            font-family:
              Inter,
              -apple-system,
              Roboto,
              Helvetica,
              sans-serif;
            padding: 20px;
            box-sizing: border-box;
          }

          .mobile-addrides-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .mobile-addrides-title {
            font-size: 24px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.87);
            margin: 0 0 8px 0;
            letter-spacing: -0.3px;
          }

          .mobile-addrides-subtitle {
            font-size: 16px;
            color: rgba(100, 100, 100, 1);
            margin: 0;
            line-height: 1.4;
          }

          .mobile-addrides-form {
            max-width: 500px;
            margin: 0 auto;
          }

          .mobile-addrides-section {
            background-color: rgba(255, 255, 255, 1);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(240, 240, 240, 1);
          }

          .mobile-addrides-section-title {
            font-size: 18px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .mobile-addrides-field {
            margin-bottom: 16px;
          }

          .mobile-addrides-field:last-child {
            margin-bottom: 0;
          }

          .mobile-addrides-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: rgba(0, 0, 0, 1);
            margin-bottom: 8px;
          }

          .mobile-addrides-input,
          .mobile-addrides-select,
          .mobile-addrides-textarea {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid rgba(224, 224, 224, 1);
            border-radius: 8px;
            font-size: 16px;
            font-family: inherit;
            background-color: rgba(255, 255, 255, 1);
            transition: all 0.2s ease;
            box-sizing: border-box;
          }

          .mobile-addrides-input:focus,
          .mobile-addrides-select:focus,
          .mobile-addrides-textarea:focus {
            outline: none;
            border-color: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
          }

          .mobile-addrides-textarea {
            resize: vertical;
            min-height: 80px;
          }

          .mobile-addrides-char-count {
            font-size: 12px;
            color: rgba(150, 150, 150, 1);
            text-align: right;
            margin-top: 4px;
          }

          .mobile-addrides-datetime-row {
            display: flex;
            gap: 12px;
          }

          .mobile-addrides-field-half {
            flex: 1;
          }

          .mobile-addrides-dropdown-container {
            position: relative;
          }

          .mobile-addrides-dropdown-trigger {
            position: relative;
            cursor: pointer;
          }

          .mobile-addrides-dropdown-input {
            padding-right: 40px;
            cursor: pointer;
          }

          .mobile-addrides-dropdown-arrow {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(150, 150, 150, 1);
            font-size: 12px;
            pointer-events: none;
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
            max-height: 200px;
            overflow-y: auto;
            margin-top: 4px;
          }

          .mobile-addrides-dropdown-item {
            padding: 12px 16px;
            cursor: pointer;
            border-bottom: 1px solid rgba(240, 240, 240, 1);
            transition: background-color 0.2s ease;
            font-size: 16px;
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

          .mobile-addrides-swap-container {
            display: flex;
            justify-content: center;
            margin: 8px 0;
          }

          .mobile-addrides-swap-button {
            background-color: rgba(248, 249, 250, 1);
            border: 1px solid rgba(224, 224, 224, 1);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            color: rgba(100, 100, 100, 1);
            transition: all 0.2s ease;
          }

          .mobile-addrides-swap-button:hover {
            background-color: rgba(230, 230, 230, 1);
            color: rgba(0, 0, 0, 1);
            transform: scale(1.05);
          }

          .mobile-addrides-error {
            background-color: rgba(255, 240, 240, 1);
            border: 1px solid rgba(255, 200, 200, 1);
            border-radius: 8px;
            padding: 12px 16px;
            color: rgba(200, 0, 0, 1);
            font-size: 14px;
            margin-bottom: 20px;
            text-align: center;
          }

          .mobile-addrides-submit-button {
            width: 100%;
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 12px;
            padding: 16px 24px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            margin-top: 8px;
          }

          .mobile-addrides-submit-button:hover:not(:disabled) {
            background-color: rgba(40, 40, 40, 1);
            transform: translateY(-1px);
          }

          .mobile-addrides-submit-button:disabled {
            background-color: rgba(200, 200, 200, 1);
            color: rgba(150, 150, 150, 1);
            cursor: not-allowed;
            transform: none;
          }

          .mobile-addrides-success {
            text-align: center;
            padding: 40px 20px;
            max-width: 400px;
            margin: 100px auto;
          }

          .mobile-addrides-success-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background-color: rgba(0, 200, 0, 1);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            margin: 0 auto 24px auto;
            animation: successBounce 0.6s ease-out;
          }

          @keyframes successBounce {
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

          .mobile-addrides-success-title {
            font-size: 22px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            margin: 0 0 12px 0;
          }

          .mobile-addrides-success-message {
            font-size: 16px;
            color: rgba(100, 100, 100, 1);
            line-height: 1.4;
            margin: 0 0 24px 0;
          }

          .mobile-addrides-success-details {
            background-color: rgba(248, 249, 250, 1);
            border-radius: 8px;
            padding: 16px;
            text-align: left;
          }

          .mobile-addrides-success-detail {
            font-size: 14px;
            margin-bottom: 8px;
            color: rgba(60, 60, 60, 1);
          }

          .mobile-addrides-success-detail:last-child {
            margin-bottom: 0;
          }

          @media (max-width: 480px) {
            .mobile-addrides-container {
              padding: 16px;
            }

            .mobile-addrides-datetime-row {
              flex-direction: column;
              gap: 0;
            }

            .mobile-addrides-field-half {
              margin-bottom: 16px;
            }
          }
        `}</style>
      </>
    );
  }
}

MobileAddRides.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(MobileAddRides);
