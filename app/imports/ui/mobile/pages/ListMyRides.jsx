import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import { Rides } from "../../../api/ride/Rides";

/**
 * Modern Mobile ListMyRides component showing all available rides
 */
class MobileListMyRides extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      filteredRides: [],
    };
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.rides !== this.props.rides ||
      prevProps.ready !== this.props.ready
    ) {
      this.filterRides();
    }
  }

  componentDidMount() {
    this.filterRides();
  }

  filterRides = () => {
    if (!this.props.ready || !this.props.rides) return;

    const { rides } = this.props;
    const { searchQuery } = this.state;
    const currentUser = Meteor.user()?.username;

    let filteredRides = rides.filter(
      (ride) => ride.driver !== currentUser &&
        // Handle new schema
        ((ride.riders !== undefined &&
          ride.seats !== undefined &&
          ride.riders.length < ride.seats &&
          !ride.riders.includes(currentUser)) ||
          // Handle legacy schema
          (ride.riders === undefined && ride.rider === "TBD")),
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredRides = filteredRides.filter(
        (ride) => ride.origin.toLowerCase().includes(query) ||
          ride.destination.toLowerCase().includes(query) ||
          ride.driver.toLowerCase().includes(query),
      );
    }

    this.setState({ filteredRides });
  };

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value }, this.filterRides);
  };

  formatDate = (date) => new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  formatTime = (date) => new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  handleJoinRide = (rideId) => {
    // This would typically open a join ride modal or handle the join logic
    console.log("Join ride:", rideId);
  };

  render() {
    if (!this.props.ready) {
      return (
        <div className="mobile-listrides-container">
          <div className="mobile-listrides-loading">
            <div className="mobile-listrides-loading-spinner"></div>
            <p>Loading available rides...</p>
          </div>
        </div>
      );
    }

    const { filteredRides, searchQuery } = this.state;

    return (
      <>
        <div className="mobile-listrides-container">
          <div className="mobile-listrides-header">
            <h1 className="mobile-listrides-title">Available Rides</h1>
            <p className="mobile-listrides-subtitle">
              Find and join rides with fellow students
            </p>
          </div>

          {/* Search Section */}
          <div className="mobile-listrides-search-section">
            <div className="mobile-listrides-search-container">
              <input
                type="text"
                placeholder="Search by location or driver..."
                value={searchQuery}
                onChange={this.handleSearchChange}
                className="mobile-listrides-search-input"
              />
              <span className="mobile-listrides-search-icon">🔍</span>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mobile-listrides-summary">
            {searchQuery ? (
              <p>
                {filteredRides.length} ride
                {filteredRides.length !== 1 ? "s" : ""} found for &quot;
                {searchQuery}
                &quot;
              </p>
            ) : (
              <p>
                {filteredRides.length} ride
                {filteredRides.length !== 1 ? "s" : ""} available
              </p>
            )}
          </div>

          {/* Rides List */}
          <div className="mobile-listrides-rides-container">
            {filteredRides.length === 0 ? (
              <div className="mobile-listrides-empty">
                <div className="mobile-listrides-empty-icon">🚗</div>
                <h3 className="mobile-listrides-empty-title">
                  {searchQuery ? "No rides found" : "No rides available"}
                </h3>
                <p className="mobile-listrides-empty-message">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Check back later or create your own ride"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => this.setState({ searchQuery: "" }, this.filterRides)
                    }
                    className="mobile-listrides-clear-search"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredRides.map((ride) => (
                <div key={ride._id} className="mobile-listrides-ride-card">
                  <div className="mobile-listrides-ride-header">
                    <div className="mobile-listrides-route">
                      <div className="mobile-listrides-route-item">
                        <span className="mobile-listrides-route-label">
                          From
                        </span>
                        <span className="mobile-listrides-route-location">
                          {ride.origin}
                        </span>
                      </div>
                      <div className="mobile-listrides-route-arrow">→</div>
                      <div className="mobile-listrides-route-item">
                        <span className="mobile-listrides-route-label">To</span>
                        <span className="mobile-listrides-route-location">
                          {ride.destination}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mobile-listrides-ride-details">
                    <div className="mobile-listrides-detail-item">
                      <span className="mobile-listrides-detail-icon">📅</span>
                      <span className="mobile-listrides-detail-text">
                        {this.formatDate(ride.date)}
                      </span>
                    </div>
                    <div className="mobile-listrides-detail-item">
                      <span className="mobile-listrides-detail-icon">🕐</span>
                      <span className="mobile-listrides-detail-text">
                        {this.formatTime(ride.date)}
                      </span>
                    </div>
                    <div className="mobile-listrides-detail-item">
                      <span className="mobile-listrides-detail-icon">👤</span>
                      <span className="mobile-listrides-detail-text">
                        {ride.driver}
                      </span>
                    </div>
                    {ride.seats && (
                      <div className="mobile-listrides-detail-item">
                        <span className="mobile-listrides-detail-icon">🪑</span>
                        <span className="mobile-listrides-detail-text">
                          {ride.seats} seat{ride.seats !== 1 ? "s" : ""}{" "}
                          available
                        </span>
                      </div>
                    )}
                  </div>

                  {ride.notes && (
                    <div className="mobile-listrides-ride-notes">
                      <span className="mobile-listrides-notes-label">
                        Notes:
                      </span>
                      <span className="mobile-listrides-notes-text">
                        {ride.notes}
                      </span>
                    </div>
                  )}

                  <div className="mobile-listrides-ride-actions">
                    <button
                      onClick={() => this.handleJoinRide(ride._id)}
                      className="mobile-listrides-join-button"
                    >
                      Request to Join
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <style jsx>{`
          .mobile-listrides-container {
            background-color: rgba(248, 249, 250, 1);
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

          .mobile-listrides-header {
            text-align: center;
            margin-bottom: 24px;
          }

          .mobile-listrides-title {
            font-size: 24px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.87);
            margin: 0 0 8px 0;
            letter-spacing: -0.3px;
          }

          .mobile-listrides-subtitle {
            font-size: 16px;
            color: rgba(100, 100, 100, 1);
            margin: 0;
            line-height: 1.4;
          }

          .mobile-listrides-search-section {
            margin-bottom: 20px;
          }

          .mobile-listrides-search-container {
            position: relative;
            max-width: 500px;
            margin: 0 auto;
          }

          .mobile-listrides-search-input {
            width: 100%;
            padding: 12px 16px 12px 44px;
            border: 1px solid rgba(224, 224, 224, 1);
            border-radius: 12px;
            font-size: 16px;
            font-family: inherit;
            background-color: rgba(255, 255, 255, 1);
            transition: all 0.2s ease;
            box-sizing: border-box;
          }

          .mobile-listrides-search-input:focus {
            outline: none;
            border-color: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
          }

          .mobile-listrides-search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 16px;
            color: rgba(150, 150, 150, 1);
          }

          .mobile-listrides-summary {
            text-align: center;
            margin-bottom: 20px;
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
          }

          .mobile-listrides-rides-container {
            max-width: 600px;
            margin: 0 auto;
          }

          .mobile-listrides-ride-card {
            background-color: rgba(255, 255, 255, 1);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(240, 240, 240, 1);
            transition: all 0.2s ease;
          }

          .mobile-listrides-ride-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          }

          .mobile-listrides-ride-header {
            margin-bottom: 16px;
          }

          .mobile-listrides-route {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .mobile-listrides-route-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .mobile-listrides-route-label {
            font-size: 12px;
            color: rgba(150, 150, 150, 1);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .mobile-listrides-route-location {
            font-size: 16px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
          }

          .mobile-listrides-route-arrow {
            font-size: 20px;
            color: rgba(0, 0, 0, 0.6);
            margin: 0 8px;
          }

          .mobile-listrides-ride-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }

          .mobile-listrides-detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .mobile-listrides-detail-icon {
            font-size: 16px;
            width: 20px;
            text-align: center;
          }

          .mobile-listrides-detail-text {
            font-size: 14px;
            color: rgba(60, 60, 60, 1);
          }

          .mobile-listrides-ride-notes {
            background-color: rgba(248, 249, 250, 1);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
          }

          .mobile-listrides-notes-label {
            font-size: 12px;
            font-weight: 600;
            color: rgba(100, 100, 100, 1);
            display: block;
            margin-bottom: 4px;
          }

          .mobile-listrides-notes-text {
            font-size: 14px;
            color: rgba(60, 60, 60, 1);
            line-height: 1.4;
          }

          .mobile-listrides-ride-actions {
            display: flex;
            gap: 12px;
          }

          .mobile-listrides-join-button {
            flex: 1;
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          .mobile-listrides-join-button:hover {
            background-color: rgba(40, 40, 40, 1);
            transform: translateY(-1px);
          }

          .mobile-listrides-empty {
            text-align: center;
            padding: 60px 20px;
            background-color: rgba(255, 255, 255, 1);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .mobile-listrides-empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .mobile-listrides-empty-title {
            font-size: 18px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            margin: 0 0 8px 0;
          }

          .mobile-listrides-empty-message {
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
            margin: 0 0 20px 0;
            line-height: 1.4;
          }

          .mobile-listrides-clear-search {
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 8px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            font-family: inherit;
          }

          .mobile-listrides-clear-search:hover {
            background-color: rgba(40, 40, 40, 1);
          }

          .mobile-listrides-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 100px 20px;
            text-align: center;
          }

          .mobile-listrides-loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(240, 240, 240, 1);
            border-top: 3px solid rgba(0, 0, 0, 1);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          .mobile-listrides-loading p {
            font-size: 16px;
            color: rgba(100, 100, 100, 1);
            margin: 0;
          }

          @media (max-width: 480px) {
            .mobile-listrides-container {
              padding: 16px;
            }

            .mobile-listrides-ride-details {
              grid-template-columns: 1fr;
              gap: 8px;
            }

            .mobile-listrides-route {
              flex-direction: column;
              align-items: stretch;
              gap: 8px;
            }

            .mobile-listrides-route-arrow {
              align-self: center;
              transform: rotate(90deg);
              margin: 4px 0;
            }
          }
        `}</style>
      </>
    );
  }
}

MobileListMyRides.propTypes = {
  rides: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe("Rides");
  return {
    rides: Rides.find({}).fetch(),
    ready: subscription.ready(),
  };
})(MobileListMyRides);
