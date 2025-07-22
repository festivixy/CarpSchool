import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Rides } from "../../../api/ride/Rides";
import MobileRide from "../components/Ride";
import "../../../api/chat/ChatMethods";
import {
  Container,
  Header,
  Title,
  Subtitle,
  SearchSection,
  SearchContainer,
  SearchInput,
  SearchIcon,
  Summary,
  RidesContainer,
  RideWrapper,
  AdditionalActions,
  ContactButton,
  CancelButton,
  Empty,
  EmptyIcon,
  EmptyTitle,
  EmptyMessage,
  ClearSearchButton,
  Loading,
  LoadingSpinner,
} from "../styles/ImDriving";

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
          (ride.riders &&
            ride.riders.length > 0 &&
            ride.riders.some((rider) => rider.toLowerCase().includes(query))) ||
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
      // eslint-disable-line
      Meteor.call("rides.remove", rideId, (error) => {
        if (error) {
          alert(`Error canceling ride: ${error.reason}`);
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

  handleRemoveRider = (rideId, riderUsername) => {
    swal({
      title: "Remove Rider?",
      text: `Are you sure you want to remove ${riderUsername} from this ride?`,
      icon: "warning",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Remove",
          className: "swal-button--danger",
        },
      },
    }).then((willRemove) => {
      if (willRemove) {
        Meteor.call("rides.removeRider", rideId, riderUsername, (error) => {
          if (error) {
            swal("Error", error.message, "error");
          } else {
            swal("Removed", "Rider removed successfully!", "success");
          }
        });
      }
    });
  };

  render() {
    if (!this.props.ready) {
      return (
        <Container>
          <Loading>
            <LoadingSpinner />
            <p>Loading your rides...</p>
          </Loading>
        </Container>
      );
    }

    const { filteredRides, searchQuery } = this.state;

    return (
      <Container>
        <Header>
          <Title>My Rides as Driver</Title>
          <Subtitle>Manage rides where you&apos;re the driver</Subtitle>
        </Header>

        {/* Search Section */}
        <SearchSection>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search by location or rider..."
              value={searchQuery}
              onChange={this.handleSearchChange}
            />
            <SearchIcon>🔍</SearchIcon>
          </SearchContainer>
        </SearchSection>

        {/* Results Summary */}
        <Summary>
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
              {filteredRides.length !== 1 ? "s" : ""} as driver
            </p>
          )}
        </Summary>

        {/* Rides List */}
        <RidesContainer>
          {filteredRides.length === 0 ? (
            <Empty>
              <EmptyIcon>🚗</EmptyIcon>
              <EmptyTitle>
                {searchQuery ? "No rides found" : "No rides as driver"}
              </EmptyTitle>
              <EmptyMessage>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create a new ride to start driving other students"}
              </EmptyMessage>
              {searchQuery && (
                <ClearSearchButton
                  onClick={() =>
                    this.setState({ searchQuery: "" }, this.filterRides)
                  }
                >
                  Clear Search
                </ClearSearchButton>
              )}
            </Empty>
          ) : (
            filteredRides.map((ride) => (
              <RideWrapper key={ride._id}>
                <MobileRide ride={ride} />
                <AdditionalActions>
                  {/* Handle new schema with riders array */}
                  {ride.riders && ride.riders.length > 0 && (
                    <div>
                      {ride.riders.map((rider) => (
                        <div
                          key={rider}
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <ContactButton
                            onClick={() => this.handleContactRider(rider)}
                          >
                            Contact {rider}
                          </ContactButton>
                          <ContactButton
                            onClick={() =>
                              this.handleRemoveRider(ride._id, rider)
                            }
                            style={{ backgroundColor: "#ff4757" }}
                          >
                            Remove
                          </ContactButton>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Handle legacy schema with single rider */}
                  {!ride.riders && ride.rider && ride.rider !== "TBD" && (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <ContactButton
                        onClick={() => this.handleContactRider(ride.rider)}
                      >
                        Contact {ride.rider}
                      </ContactButton>
                    </div>
                  )}
                  <CancelButton onClick={() => this.handleCancelRide(ride._id)}>
                    Cancel Ride
                  </CancelButton>
                </AdditionalActions>
              </RideWrapper>
            ))
          )}
        </RidesContainer>
      </Container>
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
