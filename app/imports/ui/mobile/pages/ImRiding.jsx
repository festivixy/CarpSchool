import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Rides } from "../../../api/ride/Rides";
import JoinRideModal from "../components/JoinRideModal";
import MobileRide from "../components/Ride";
import "../../../api/chat/ChatMethods";

/**
 * Modern Mobile ImRiding component showing rides where user is the rider
 */
class MobileImRiding extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      filteredRides: [],
      joinRideModalOpen: false,
      prefillCode: "",
    };
  }

  componentDidMount() {
    this.filterRides();
    // Check for code parameter in URL
    const urlParams = new URLSearchParams(this.props.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Format the code with dash if it's 8 characters
      const formattedCode =
        code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
      this.setState({
        joinRideModalOpen: true,
        prefillCode: formattedCode,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.rides !== this.props.rides ||
      prevProps.ready !== this.props.ready
    ) {
      this.filterRides();
    }
  }

  handleJoinRideClose = () => {
    this.setState({ joinRideModalOpen: false, prefillCode: "" });
    // Clear the URL parameter
    this.props.history.replace("/imRiding");
  };

  filterRides = () => {
    if (!this.props.ready || !this.props.rides) return;

    const { rides } = this.props;
    const { searchQuery } = this.state;
    const currentUser = Meteor.user()?.username;

    let filteredRides = rides.filter((ride) => ride.rider === currentUser);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredRides = filteredRides.filter(
        (ride) =>
          ride.origin.toLowerCase().includes(query) ||
          ride.destination.toLowerCase().includes(query) ||
          ride.driver.toLowerCase().includes(query),
      );
    }

    this.setState({ filteredRides });
  };

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value }, this.filterRides);
  };

  handleLeaveRide = (rideId) => {
    if (confirm("Are you sure you want to leave this ride?")) {
      Meteor.call("rides.leaveRide", rideId, (error) => {
        if (error) {
          alert("Error leaving ride: " + error.reason);
        }
      });
    }
  };

  handleContactDriver = async (driver) => {
    try {
      // Create or find existing chat with the driver
      const chatId = await Meteor.callAsync("chats.create", [driver]);

      // Navigate to chat page
      this.props.history.push("/chat");
    } catch (error) {
      console.error("Error creating/opening chat:", error);
      alert("Unable to open chat. Please try again.");
    }
  };

  handleJoinNewRide = () => {
    this.setState({ joinRideModalOpen: true, prefillCode: "" });
  };

  render() {
    if (!this.props.ready) {
      return (
        <div className="mobile-imriding-container">
          <div className="mobile-imriding-loading">
            <div className="mobile-imriding-loading-spinner"></div>
            <p>Loading your rides...</p>
          </div>
        </div>
      );
    }

    const { filteredRides, searchQuery, joinRideModalOpen, prefillCode } =
      this.state;

    return (
      <>
        <div className="mobile-imriding-container">
          <div className="mobile-imriding-header">
            <h1 className="mobile-imriding-title">My Rides as Rider</h1>
            <p className="mobile-imriding-subtitle">
              Manage rides where you're a passenger
            </p>
          </div>

          {/* Search Section */}
          <div className="mobile-imriding-search-section">
            <div className="mobile-imriding-search-container">
              <input
                type="text"
                placeholder="Search by location or driver..."
                value={searchQuery}
                onChange={this.handleSearchChange}
                className="mobile-imriding-search-input"
              />
              <span className="mobile-imriding-search-icon">🔍</span>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mobile-imriding-summary">
            {searchQuery ? (
              <p>
                {filteredRides.length} ride
                {filteredRides.length !== 1 ? "s" : ""} found for "{searchQuery}
                "
              </p>
            ) : (
              <p>
                {filteredRides.length} ride
                {filteredRides.length !== 1 ? "s" : ""} as rider
              </p>
            )}
          </div>

          {/* Rides List */}
          <div className="mobile-imriding-rides-container">
            {filteredRides.length === 0 ? (
              <div className="mobile-imriding-empty">
                <div className="mobile-imriding-empty-icon">🚗</div>
                <h3 className="mobile-imriding-empty-title">
                  {searchQuery ? "No rides found" : "No rides as rider"}
                </h3>
                <p className="mobile-imriding-empty-message">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Join a ride to get started"}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() =>
                      this.setState({ searchQuery: "" }, this.filterRides)
                    }
                    className="mobile-imriding-clear-search"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={this.handleJoinNewRide}
                    className="mobile-imriding-join-new-button"
                  >
                    Join a Ride
                  </button>
                )}
              </div>
            ) : (
              filteredRides.map((ride) => (
                <div key={ride._id} className="mobile-imriding-ride-wrapper">
                  <MobileRide ride={ride} />
                  <div className="mobile-imriding-additional-actions">
                    <button
                      onClick={() => this.handleContactDriver(ride.driver)}
                      className="mobile-imriding-contact-button"
                    >
                      Contact Driver
                    </button>
                    <button
                      onClick={() => this.handleLeaveRide(ride._id)}
                      className="mobile-imriding-leave-button"
                    >
                      Leave Ride
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <JoinRideModal
          open={joinRideModalOpen}
          onClose={this.handleJoinRideClose}
          prefillCode={prefillCode}
        />

        <style jsx>{`
          .mobile-imriding-container {
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

          .mobile-imriding-header {
            text-align: center;
            margin-bottom: 24px;
          }

          .mobile-imriding-title {
            font-size: 24px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.87);
            margin: 0 0 8px 0;
            letter-spacing: -0.3px;
          }

          .mobile-imriding-subtitle {
            font-size: 16px;
            color: rgba(100, 100, 100, 1);
            margin: 0;
            line-height: 1.4;
          }

          .mobile-imriding-search-section {
            margin-bottom: 20px;
          }

          .mobile-imriding-search-container {
            position: relative;
            max-width: 500px;
            margin: 0 auto;
          }

          .mobile-imriding-search-input {
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

          .mobile-imriding-search-input:focus {
            outline: none;
            border-color: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
          }

          .mobile-imriding-search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 16px;
            color: rgba(150, 150, 150, 1);
          }

          .mobile-imriding-summary {
            text-align: center;
            margin-bottom: 20px;
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
          }

          .mobile-imriding-rides-container {
            max-width: 600px;
            margin: 0 auto;
          }

          .mobile-imriding-ride-wrapper {
            margin-bottom: 16px;
          }

          .mobile-imriding-additional-actions {
            display: flex;
            gap: 12px;
            margin-top: 12px;
          }

          .mobile-imriding-contact-button {
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

          .mobile-imriding-contact-button:hover {
            background-color: rgba(40, 40, 40, 1);
            transform: translateY(-1px);
          }

          .mobile-imriding-leave-button {
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

          .mobile-imriding-leave-button:hover {
            background-color: rgba(211, 47, 47, 1);
            transform: translateY(-1px);
          }

          .mobile-imriding-empty {
            text-align: center;
            padding: 60px 20px;
            background-color: rgba(255, 255, 255, 1);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .mobile-imriding-empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .mobile-imriding-empty-title {
            font-size: 18px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            margin: 0 0 8px 0;
          }

          .mobile-imriding-empty-message {
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
            margin: 0 0 20px 0;
            line-height: 1.4;
          }

          .mobile-imriding-clear-search,
          .mobile-imriding-join-new-button {
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

          .mobile-imriding-clear-search:hover,
          .mobile-imriding-join-new-button:hover {
            background-color: rgba(40, 40, 40, 1);
          }

          .mobile-imriding-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 100px 20px;
            text-align: center;
          }

          .mobile-imriding-loading-spinner {
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

          .mobile-imriding-loading p {
            font-size: 16px;
            color: rgba(100, 100, 100, 1);
            margin: 0;
          }

          @media (max-width: 480px) {
            .mobile-imriding-container {
              padding: 16px;
            }

            .mobile-imriding-additional-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </>
    );
  }
}

MobileImRiding.propTypes = {
  rides: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(
  withTracker(() => {
    const subscription = Meteor.subscribe("Rides");
    return {
      rides: Rides.find({}).fetch(),
      ready: subscription.ready(),
    };
  })(MobileImRiding),
);
