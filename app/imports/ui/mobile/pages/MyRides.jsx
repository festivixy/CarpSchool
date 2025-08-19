import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { Rides } from "../../../api/ride/Rides";
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
      activeDrivingRides: [],
      pastDrivingRides: [],
      activeRidingRides: [],
      pastRidingRides: [],
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
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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

    // Separate into active and past rides based on date
    const separateByDate = (rideList) => {
      const active = [];
      const past = [];

      rideList.forEach((ride) => {
        const rideDate = new Date(ride.date);
        const rideDateOnly = new Date(rideDate.getFullYear(), rideDate.getMonth(), rideDate.getDate());

        if (rideDateOnly >= today) {
          active.push(ride);
        } else {
          past.push(ride);
        }
      });

      return { active, past };
    };

    const drivingCategories = separateByDate(drivingRides);
    const ridingCategories = separateByDate(ridingRides);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      const filterBySearch = (rideList) => rideList.filter(
        (ride) => ride.origin.toLowerCase().includes(query) ||
          ride.destination.toLowerCase().includes(query) ||
          (ride.riders &&
            ride.riders.length > 0 &&
            ride.riders.some((rider) => rider.toLowerCase().includes(query))) ||
          (ride.rider &&
            ride.rider !== "TBD" &&
            ride.rider.toLowerCase().includes(query)) ||
          ride.driver.toLowerCase().includes(query),
      );

      // Filter driving rides
      drivingCategories.active = filterBySearch(drivingCategories.active);
      drivingCategories.past = filterBySearch(drivingCategories.past);

      // Filter riding rides
      ridingCategories.active = filterBySearch(ridingCategories.active);
      ridingCategories.past = filterBySearch(ridingCategories.past);
    }

    this.setState({
      filteredDrivingRides: [...drivingCategories.active, ...drivingCategories.past],
      filteredRidingRides: [...ridingCategories.active, ...ridingCategories.past],
      activeDrivingRides: drivingCategories.active,
      pastDrivingRides: drivingCategories.past,
      activeRidingRides: ridingCategories.active,
      pastRidingRides: ridingCategories.past,
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
      pastDrivingRides,
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
              `${activeDrivingRides.length} upcoming ride${activeDrivingRides.length !== 1 ? "s" : ""}`,
              true
            )}
            {this.renderRideSection(
              pastDrivingRides,
              "Past Rides",
              `${pastDrivingRides.length} completed ride${pastDrivingRides.length !== 1 ? "s" : ""}`,
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
      pastRidingRides,
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
              `${activeRidingRides.length} upcoming ride${activeRidingRides.length !== 1 ? "s" : ""}`,
              false
            )}
            {this.renderRideSection(
              pastRidingRides,
              "Past Rides",
              `${pastRidingRides.length} completed ride${pastRidingRides.length !== 1 ? "s" : ""}`,
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
              🚗 I&apos;m Driving ({(this.state.activeDrivingRides?.length || 0) + (this.state.pastDrivingRides?.length || 0)})
            </Tab>
            <Tab
              active={activeTab === "riding"}
              onClick={() => this.handleTabChange("riding")}
            >
              🎒 I&apos;m Riding ({(this.state.activeRidingRides?.length || 0) + (this.state.pastRidingRides?.length || 0)})
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
