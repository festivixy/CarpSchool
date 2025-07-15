import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Rides } from "../../../api/ride/Rides";
import MobileRide from "../components/Ride";
import "../../../api/chat/ChatMethods";

/**
 * Modern Mobile ImDriving component showing rides where user is the driver
 */
class MobileImDriving extends React.Component {
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

    let filteredRides = rides.filter((ride) => ride.driver === currentUser);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredRides = filteredRides.filter(
        (ride) =>
          ride.origin.toLowerCase().includes(query) ||
          ride.destination.toLowerCase().includes(query) ||
          (ride.rider &&
            ride.rider !== "TBD" &&
            ride.rider.toLowerCase().includes(query)),
      );
    }

    this.setState({ filteredRides });
  };

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value }, this.filterRides);
  };

  handleCancelRide = (rideId) => {
    if (confirm("Are you sure you want to cancel this ride?")) {
      Meteor.call("rides.remove", rideId, (error) => {
        if (error) {
          alert("Error canceling ride: " + error.reason);
        }
      });
    }
  };

  handleContactRider = async (rider) => {
    try {
      // Create or find existing chat with the rider (chats.create returns existing chat if one exists)
      const chatId = await Meteor.callAsync("chats.create", [rider]);

      // Navigate to chat page with the specific chat ID
      this.props.history.push("/chat", { selectedChatId: chatId });
    } catch (error) {
      console.error("Error creating/opening chat:", error);
      alert("Unable to open chat. Please try again.");
    }
  };

  render() {
    if (!this.props.ready) {
      return (
        <div className="mobile-imdriving-container">
          <div className="mobile-imdriving-loading">
            <div className="mobile-imdriving-loading-spinner"></div>
            <p>Loading your rides...</p>
          </div>
        </div>
      );
    }

    const { filteredRides, searchQuery } = this.state;

    return (
      <>
        <div className="mobile-imdriving-container">
          <div className="mobile-imdriving-header">
            <h1 className="mobile-imdriving-title">My Rides as Driver</h1>
            <p className="mobile-imdriving-subtitle">
              Manage rides where you're the driver
            </p>
          </div>

          {/* Search Section */}
          <div className="mobile-imdriving-search-section">
            <div className="mobile-imdriving-search-container">
              <input
                type="text"
                placeholder="Search by location or rider..."
                value={searchQuery}
                onChange={this.handleSearchChange}
                className="mobile-imdriving-search-input"
              />
              <span className="mobile-imdriving-search-icon">🔍</span>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mobile-imdriving-summary">
            {searchQuery ? (
              <p>
                {filteredRides.length} ride
                {filteredRides.length !== 1 ? "s" : ""} found for "{searchQuery}
                "
              </p>
            ) : (
              <p>
                {filteredRides.length} ride
                {filteredRides.length !== 1 ? "s" : ""} as driver
              </p>
            )}
          </div>

          {/* Rides List */}
          <div className="mobile-imdriving-rides-container">
            {filteredRides.length === 0 ? (
              <div className="mobile-imdriving-empty">
                <div className="mobile-imdriving-empty-icon">🚗</div>
                <h3 className="mobile-imdriving-empty-title">
                  {searchQuery ? "No rides found" : "No rides as driver"}
                </h3>
                <p className="mobile-imdriving-empty-message">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create a new ride to start driving other students"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() =>
                      this.setState({ searchQuery: "" }, this.filterRides)
                    }
                    className="mobile-imdriving-clear-search"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredRides.map((ride) => (
                <div key={ride._id} className="mobile-imdriving-ride-wrapper">
                  <MobileRide ride={ride} />
                  <div className="mobile-imdriving-additional-actions">
                    {ride.rider !== "TBD" && (
                      <button
                        onClick={() => this.handleContactRider(ride.rider)}
                        className="mobile-imdriving-contact-button"
                      >
                        Contact Rider
                      </button>
                    )}
                    <button
                      onClick={() => this.handleCancelRide(ride._id)}
                      className="mobile-imdriving-cancel-button"
                    >
                      Cancel Ride
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <style jsx>{`
          .mobile-imdriving-container {
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

          .mobile-imdriving-header {
            text-align: center;
            margin-bottom: 24px;
          }

          .mobile-imdriving-title {
            font-size: 24px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.87);
            margin: 0 0 8px 0;
            letter-spacing: -0.3px;
          }

          .mobile-imdriving-subtitle {
            font-size: 16px;
            color: rgba(100, 100, 100, 1);
            margin: 0;
            line-height: 1.4;
          }

          .mobile-imdriving-search-section {
            margin-bottom: 20px;
          }

          .mobile-imdriving-search-container {
            position: relative;
            max-width: 500px;
            margin: 0 auto;
          }

          .mobile-imdriving-search-input {
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

          .mobile-imdriving-search-input:focus {
            outline: none;
            border-color: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
          }

          .mobile-imdriving-search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 16px;
            color: rgba(150, 150, 150, 1);
          }

          .mobile-imdriving-summary {
            text-align: center;
            margin-bottom: 20px;
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
          }

          .mobile-imdriving-rides-container {
            max-width: 600px;
            margin: 0 auto;
          }

          .mobile-imdriving-ride-wrapper {
            margin-bottom: 16px;
          }

          .mobile-imdriving-additional-actions {
            display: flex;
            gap: 12px;
            margin-top: 12px;
          }

          .mobile-imdriving-contact-button {
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

          .mobile-imdriving-contact-button:hover {
            background-color: rgba(40, 40, 40, 1);
            transform: translateY(-1px);
          }

          .mobile-imdriving-cancel-button {
            flex: 1;
            background-color: rgba(244, 67, 54, 1);
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

          .mobile-imdriving-cancel-button:hover {
            background-color: rgba(211, 47, 47, 1);
            transform: translateY(-1px);
          }

          .mobile-imdriving-empty {
            text-align: center;
            padding: 60px 20px;
            background-color: rgba(255, 255, 255, 1);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .mobile-imdriving-empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .mobile-imdriving-empty-title {
            font-size: 18px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            margin: 0 0 8px 0;
          }

          .mobile-imdriving-empty-message {
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
            margin: 0 0 20px 0;
            line-height: 1.4;
          }

          .mobile-imdriving-clear-search {
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

          .mobile-imdriving-clear-search:hover {
            background-color: rgba(40, 40, 40, 1);
          }

          .mobile-imdriving-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 100px 20px;
            text-align: center;
          }

          .mobile-imdriving-loading-spinner {
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

          .mobile-imdriving-loading p {
            font-size: 16px;
            color: rgba(100, 100, 100, 1);
            margin: 0;
          }

          @media (max-width: 480px) {
            .mobile-imdriving-container {
              padding: 16px;
            }

            .mobile-imdriving-additional-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </>
    );
  }
}

MobileImDriving.propTypes = {
  rides: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(
  withTracker(() => {
    const subscription = Meteor.subscribe("Rides");
    return {
      rides: Rides.find({}).fetch(),
      ready: subscription.ready(),
    };
  })(MobileImDriving),
);
