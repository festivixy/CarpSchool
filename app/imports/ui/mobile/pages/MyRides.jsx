import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Rides } from "../../../api/ride/Rides";
import JoinRideModal from "../../components/JoinRideModal";
import Ride from "../../components/Ride";
import ConfirmFunction from "../../components/ConfirmFunction";
import { Spacer } from "../../components";
import "../../../api/chat/ChatMethods";
import {
  Container,
  Header,
  Title,
  Subtitle,
  TabsContainer,
  Tab,
  TabContent,
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
  LeaveButton,
  Empty,
  EmptyIcon,
  EmptyTitle,
  EmptyMessage,
  ClearSearchButton,
  JoinNewButton,
  Loading,
  LoadingSpinner,
} from "../styles/MyRides";

/**
 * Modern Mobile MyRides component showing both driving and riding rides in a tabbed interface
 */
class MobileMyRides extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "driving", // 'driving' or 'riding'
      searchQuery: "",
      filteredDrivingRides: [],
      filteredRidingRides: [],
      joinRideModalOpen: false,
      prefillCode: "",
      showConfirmModal: false,
      confirmAction: null, // 'cancel' or 'leave'
      pendingRideId: null,
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
        activeTab: "riding", // Switch to riding tab when joining a ride
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
    this.props.history.replace("/myRides");
  };

  filterRides = () => {
    if (!this.props.ready || !this.props.rides) return;

    const { rides } = this.props;
    const { searchQuery } = this.state;
    const currentUser = Meteor.user()?.username;

    // Filter driving rides (where user is the driver)
    let drivingRides = rides.filter((ride) => ride.driver === currentUser);

    // Filter riding rides (where user is a passenger)
    let ridingRides = rides.filter((ride) => {
      // Handle new schema with riders array
      if (ride.riders && Array.isArray(ride.riders)) {
        return ride.riders.includes(currentUser);
      }
      // Handle legacy schema with single rider
      return ride.rider === currentUser;
    });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      // Filter driving rides
      drivingRides = drivingRides.filter(
        (ride) => ride.origin.toLowerCase().includes(query) ||
          ride.destination.toLowerCase().includes(query) ||
          (ride.riders &&
            ride.riders.length > 0 &&
            ride.riders.some((rider) => rider.toLowerCase().includes(query))) ||
          (ride.rider &&
            ride.rider !== "TBD" &&
            ride.rider.toLowerCase().includes(query)),
      );

      // Filter riding rides
      ridingRides = ridingRides.filter(
        (ride) => ride.origin.toLowerCase().includes(query) ||
          ride.destination.toLowerCase().includes(query) ||
          ride.driver.toLowerCase().includes(query),
      );
    }

    this.setState({
      filteredDrivingRides: drivingRides,
      filteredRidingRides: ridingRides,
    });
  };

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value }, this.filterRides);
  };

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab });
  };

  handleCancelRide = (rideId) => {
    this.setState({
      showConfirmModal: true,
      confirmAction: "cancel",
      pendingRideId: rideId,
    });
  };

  handleLeaveRide = (rideId) => {
    this.setState({
      showConfirmModal: true,
      confirmAction: "leave",
      pendingRideId: rideId,
    });
  };

  handleConfirmAction = async () => {
    const { confirmAction, pendingRideId } = this.state;

    return new Promise((resolve) => {
      if (confirmAction === "cancel") {
        Meteor.call("rides.remove", pendingRideId, (error) => {
          if (error) {
            alert(`Error canceling ride: ${error.reason}`);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else if (confirmAction === "leave") {
        Meteor.call("rides.leaveRide", pendingRideId, (error) => {
          if (error) {
            alert(`Error leaving ride: ${error.reason}`);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(false);
      }
    });
  };

  handleConfirmModalResult = (_success) => {
    this.setState({
      showConfirmModal: false,
      confirmAction: null,
      pendingRideId: null,
    });
  };

  handleContactDriver = async (driver) => {
    try {
      // Create or find existing chat with the driver
      const chatId = await Meteor.callAsync("chats.create", [driver]);
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

  handleJoinNewRide = () => {
    this.setState({ joinRideModalOpen: true, prefillCode: "" });
  };

  renderDrivingRides = () => {
    const { filteredDrivingRides, searchQuery } = this.state;

    return (
      <>
        <Summary>
          {searchQuery ? (
            <p>
              {filteredDrivingRides.length} ride
              {filteredDrivingRides.length !== 1 ? "s" : ""} found for &quot;
              {searchQuery}
              &quot;
            </p>
          ) : (
            <p>
              {filteredDrivingRides.length} ride
              {filteredDrivingRides.length !== 1 ? "s" : ""} as driver
            </p>
          )}
        </Summary>

        <RidesContainer>
          {filteredDrivingRides.length === 0 ? (
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
                  onClick={() => this.setState({ searchQuery: "" }, this.filterRides)
                  }
                >
                  Clear Search
                </ClearSearchButton>
              )}
            </Empty>
          ) : (
            filteredDrivingRides.map((ride) => (
              <RideWrapper key={ride._id}>
                <Ride ride={ride} />
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
                            onClick={() => this.handleRemoveRider(ride._id, rider)
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
      </>
    );
  };

  renderRidingRides = () => {
    const { filteredRidingRides, searchQuery } = this.state;

    return (
      <>
        <Summary>
          {searchQuery ? (
            <p>
              {filteredRidingRides.length} ride
              {filteredRidingRides.length !== 1 ? "s" : ""} found for &quot;
              {searchQuery}
              &quot;
            </p>
          ) : (
            <p>
              {filteredRidingRides.length} ride
              {filteredRidingRides.length !== 1 ? "s" : ""} as rider
            </p>
          )}
        </Summary>

        <RidesContainer>
          {filteredRidingRides.length === 0 ? (
            <Empty>
              <EmptyIcon>🚗</EmptyIcon>
              <EmptyTitle>
                {searchQuery ? "No rides found" : "No rides as rider"}
              </EmptyTitle>
              <EmptyMessage>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Join a ride to get started"}
              </EmptyMessage>
              {searchQuery ? (
                <ClearSearchButton
                  onClick={() => this.setState({ searchQuery: "" }, this.filterRides)
                  }
                >
                  Clear Search
                </ClearSearchButton>
              ) : (
                <JoinNewButton onClick={this.handleJoinNewRide}>
                  Join a Ride
                </JoinNewButton>
              )}
            </Empty>
          ) : (
            filteredRidingRides.map((ride) => (
              <RideWrapper key={ride._id}>
                <Ride ride={ride} />
                <AdditionalActions>
                  <ContactButton
                    onClick={() => this.handleContactDriver(ride.driver)}
                  >
                    Contact Driver
                  </ContactButton>
                  <LeaveButton onClick={() => this.handleLeaveRide(ride._id)}>
                    Leave Ride
                  </LeaveButton>
                </AdditionalActions>
              </RideWrapper>
            ))
          )}
        </RidesContainer>
      </>
    );
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

    const { activeTab, searchQuery, joinRideModalOpen, prefillCode } =
      this.state;

    return (
      <>
        <Container>
          <Header>
            <Title>My Rides</Title>
            <Subtitle>Manage all your rides in one place</Subtitle>
          </Header>

          {/* Tabs */}
          <TabsContainer>
            <Tab
              active={activeTab === "driving"}
              onClick={() => this.handleTabChange("driving")}
            >
              🚗 I&apos;m Driving ({this.state.filteredDrivingRides.length})
            </Tab>
            <Tab
              active={activeTab === "riding"}
              onClick={() => this.handleTabChange("riding")}
            >
              🎒 I&apos;m Riding ({this.state.filteredRidingRides.length})
            </Tab>
          </TabsContainer>

          {/* Search Section */}
          <SearchSection>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder={
                  activeTab === "driving"
                    ? "Search by location or rider..."
                    : "Search by location or driver..."
                }
                value={searchQuery}
                onChange={this.handleSearchChange}
              />
              <SearchIcon>🔍</SearchIcon>
            </SearchContainer>
          </SearchSection>

          {/* Tab Content */}
          <TabContent>
            {activeTab === "driving"
              ? this.renderDrivingRides()
              : this.renderRidingRides()}
          </TabContent>

          <Spacer />
        </Container>

        <JoinRideModal
          open={joinRideModalOpen}
          onClose={this.handleJoinRideClose}
          prefillCode={prefillCode}
        />

        {this.state.showConfirmModal && (
          <ConfirmFunction
            title={this.state.confirmAction === "cancel" ? "Cancel Ride" : "Leave Ride"}
            subtitle={
              this.state.confirmAction === "cancel"
                ? "Are you sure you want to cancel this ride? This action cannot be undone and will notify all riders."
                : "Are you sure you want to leave this ride? The driver will be notified."
            }
            confirmText={this.state.confirmAction === "cancel" ? "Cancel Ride" : "Leave Ride"}
            cancelText={this.state.confirmAction === "cancel" ? "Keep Ride" : "Stay in Ride"}
            isDestructive={true}
            asyncFunction={this.handleConfirmAction}
            onResult={this.handleConfirmModalResult}
            onClose={this.handleConfirmModalResult}
          />
        )}
      </>
    );
  }
}

MobileMyRides.propTypes = {
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
  })(MobileMyRides),
);
