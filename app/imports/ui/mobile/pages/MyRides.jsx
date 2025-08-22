import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { Rides } from "../../../api/ride/Rides";
import { RideSessions } from "../../../api/rideSession/RideSession";
import JoinRideModal from "../../components/JoinRideModal";
import Ride from "../../components/Ride";
import ConfirmFunction from "../../components/ConfirmFunction";
import { Spacer } from "../../components";
import { MyRidesSkeleton } from "../../skeleton";
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
  SectionHeader,
  SectionTitle,
  SectionSubtitle,
  SectionContainer,
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
      // Driving categories
      pastDrivingRides: [], // past rides with finished sessions
      activeDrivingRides: [], // rides with active sessions
      upcomingDrivingRides: [], // future rides without sessions
      missedDrivingRides: [], // past rides without sessions
      // Riding categories
      pastRidingRides: [], // past rides with finished sessions
      activeRidingRides: [], // rides with active sessions
      upcomingRidingRides: [], // future rides without sessions
      missedRidingRides: [], // past rides without sessions
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
    this.props.history.replace("/my-rides");
  };

  filterRides = () => {
    if (!this.props.ready || !this.props.rides || !this.props.rideSessions) return;

    const { rides, rideSessions } = this.props;
    const { searchQuery } = this.state;
    const currentUser = Meteor.user()?._id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Create a map of ride sessions by rideId for easy lookup
    const sessionMap = {};
    rideSessions.forEach(session => {
      sessionMap[session.rideId] = session;
    });

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

    // Categorize rides based on date and session status
    const categorizeRides = (rideList) => {
      const past = []; // past rides with finished sessions
      const active = []; // rides with active sessions
      const upcoming = []; // future rides without sessions
      const missed = []; // past rides without sessions

      rideList.forEach((ride) => {
        const rideDate = new Date(ride.date);
        const rideDateOnly = new Date(rideDate.getFullYear(), rideDate.getMonth(), rideDate.getDate());
        const session = sessionMap[ride._id];
        const isPastDate = rideDateOnly < today;
        const isFutureDate = rideDateOnly >= today;

        if (session) {
          // Ride has a session
          if (session.finished || session.status === "completed" || session.status === "cancelled") {
            // Session is finished
            past.push(ride);
          } else {
            // Session is active/ongoing
            active.push(ride);
          }
        } else {
          // Ride has no session
          if (isPastDate) {
            // Past ride without session (missed)
            missed.push(ride);
          } else {
            // Future ride without session (upcoming)
            upcoming.push(ride);
          }
        }
      });

      return { past, active, upcoming, missed };
    };

    const drivingCategories = categorizeRides(drivingRides);
    const ridingCategories = categorizeRides(ridingRides);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      const filterBySearch = (rideList) => rideList.filter(
        (ride) => ride.origin.toLowerCase().includes(query) ||
          ride.destination.toLowerCase().includes(query),
      );

      // Apply search filter to all categories
      Object.keys(drivingCategories).forEach(category => {
        drivingCategories[category] = filterBySearch(drivingCategories[category]);
      });

      Object.keys(ridingCategories).forEach(category => {
        ridingCategories[category] = filterBySearch(ridingCategories[category]);
      });
    }

    this.setState({
      filteredDrivingRides: [
        ...drivingCategories.active,
        ...drivingCategories.upcoming,
        ...drivingCategories.past,
        ...drivingCategories.missed
      ],
      filteredRidingRides: [
        ...ridingCategories.active,
        ...ridingCategories.upcoming,
        ...ridingCategories.past,
        ...ridingCategories.missed
      ],
      // Driving categories
      pastDrivingRides: drivingCategories.past,
      activeDrivingRides: drivingCategories.active,
      upcomingDrivingRides: drivingCategories.upcoming,
      missedDrivingRides: drivingCategories.missed,
      // Riding categories
      pastRidingRides: ridingCategories.past,
      activeRidingRides: ridingCategories.active,
      upcomingRidingRides: ridingCategories.upcoming,
      missedRidingRides: ridingCategories.missed,
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

  renderRideSection = (rides, sectionTitle, sectionSubtitle, isDriving = true) => {
    if (rides.length === 0) {
      return null;
    }

    return (
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>{sectionTitle}</SectionTitle>
          <SectionSubtitle>{sectionSubtitle}</SectionSubtitle>
        </SectionHeader>
        <RidesContainer>
          {rides.map((ride) => (
            <RideWrapper key={ride._id}>
              <Ride ride={ride} />
              <AdditionalActions>
                {isDriving ? (
                  <>
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
                              onClick={() => this.handleRemoveRider(ride._id, rider)}
                              style={{ backgroundColor: "#ff4757" }}
                            >
                              Remove {rider}
                            </ContactButton>
                          </div>
                        ))}
                      </div>
                    )}
                    <CancelButton onClick={() => this.handleCancelRide(ride._id)}>
                      Cancel Ride
                    </CancelButton>
                  </>
                ) : (
                  <>
                    <ContactButton
                      onClick={() => this.handleContactDriver(ride.driver)}
                    >
                      Contact Driver
                    </ContactButton>
                    <LeaveButton onClick={() => this.handleLeaveRide(ride._id)}>
                      Leave Ride
                    </LeaveButton>
                  </>
                )}
              </AdditionalActions>
            </RideWrapper>
          ))}
        </RidesContainer>
      </SectionContainer>
    );
  };

  renderDrivingRides = () => {
    const {
      filteredDrivingRides,
      activeDrivingRides,
      upcomingDrivingRides,
      pastDrivingRides,
      missedDrivingRides,
      searchQuery
    } = this.state;

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
                onClick={() => this.setState({ searchQuery: "" }, this.filterRides)}
              >
                Clear Search
              </ClearSearchButton>
            )}
          </Empty>
        ) : (
          <>
            {this.renderRideSection(
              activeDrivingRides,
              "Active Rides",
              `${activeDrivingRides.length} ongoing ride${activeDrivingRides.length !== 1 ? "s" : ""} with active sessions`,
              true
            )}
            {this.renderRideSection(
              upcomingDrivingRides,
              "Upcoming Rides",
              `${upcomingDrivingRides.length} scheduled ride${upcomingDrivingRides.length !== 1 ? "s" : ""} without sessions yet`,
              true
            )}
            {this.renderRideSection(
              pastDrivingRides,
              "Past Rides",
              `${pastDrivingRides.length} completed ride${pastDrivingRides.length !== 1 ? "s" : ""} with finished sessions`,
              true
            )}
            {this.renderRideSection(
              missedDrivingRides,
              "Missed Rides",
              `${missedDrivingRides.length} past ride${missedDrivingRides.length !== 1 ? "s" : ""} without sessions`,
              true
            )}
          </>
        )}
      </>
    );
  };

  renderRidingRides = () => {
    const {
      filteredRidingRides,
      activeRidingRides,
      upcomingRidingRides,
      pastRidingRides,
      missedRidingRides,
      searchQuery
    } = this.state;

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
                onClick={() => this.setState({ searchQuery: "" }, this.filterRides)}
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
          <>
            {this.renderRideSection(
              activeRidingRides,
              "Active Rides",
              `${activeRidingRides.length} ongoing ride${activeRidingRides.length !== 1 ? "s" : ""} with active sessions`,
              false
            )}
            {this.renderRideSection(
              upcomingRidingRides,
              "Upcoming Rides",
              `${upcomingRidingRides.length} scheduled ride${upcomingRidingRides.length !== 1 ? "s" : ""} without sessions yet`,
              false
            )}
            {this.renderRideSection(
              pastRidingRides,
              "Past Rides",
              `${pastRidingRides.length} completed ride${pastRidingRides.length !== 1 ? "s" : ""} with finished sessions`,
              false
            )}
            {this.renderRideSection(
              missedRidingRides,
              "Missed Rides",
              `${missedRidingRides.length} past ride${missedRidingRides.length !== 1 ? "s" : ""} without sessions`,
              false
            )}
          </>
        )}
      </>
    );
  };

  render() {
    if (!this.props.ready) {
      return <MyRidesSkeleton numberOfRides={3} />;
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
              🚗 I&apos;m Driving ({
                (this.state.activeDrivingRides?.length || 0) +
                (this.state.upcomingDrivingRides?.length || 0) +
                (this.state.pastDrivingRides?.length || 0) +
                (this.state.missedDrivingRides?.length || 0)
              })
            </Tab>
            <Tab
              active={activeTab === "riding"}
              onClick={() => this.handleTabChange("riding")}
            >
              🎒 I&apos;m Riding ({
                (this.state.activeRidingRides?.length || 0) +
                (this.state.upcomingRidingRides?.length || 0) +
                (this.state.pastRidingRides?.length || 0) +
                (this.state.missedRidingRides?.length || 0)
              })
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
  rideSessions: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(
  withTracker(() => {
    const ridesSubscription = Meteor.subscribe("Rides");
    const rideSessionsSubscription = Meteor.subscribe("rideSessions");
    return {
      rides: Rides.find({}).fetch(),
      rideSessions: RideSessions.find({}).fetch(),
      ready: ridesSubscription.ready() && rideSessionsSubscription.ready(),
    };
  })(MobileMyRides),
);
