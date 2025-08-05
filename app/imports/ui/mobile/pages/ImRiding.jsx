import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Rides } from "../../../api/ride/Rides";
import JoinRideModal from "../../components/JoinRideModal";
import MobileRide from "../components/Ride";
import ConfirmFunction from "../../components/ConfirmFunction";
import "/imports/api/chat/ChatMethods";
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
  LeaveButton,
  Empty,
  EmptyIcon,
  EmptyTitle,
  EmptyMessage,
  ClearSearchButton,
  JoinNewButton,
  Loading,
  LoadingSpinner,
} from "../styles/ImRiding";

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
      showConfirmModal: false,
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

    let filteredRides = rides.filter((ride) => ride.rider === currentUser);

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

  handleLeaveRide = (rideId) => {
    this.setState({
      showConfirmModal: true,
      pendingRideId: rideId,
    });
  };

  handleConfirmLeaveRide = async () => {
    const { pendingRideId } = this.state;

    return new Promise((resolve) => {
      Meteor.call("rides.leaveRide", pendingRideId, (error) => {
        if (error) {
          alert(`Error leaving ride: ${error.reason}`);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  };

  handleConfirmModalResult = (_success) => {
    this.setState({
      showConfirmModal: false,
      pendingRideId: null,
    });
  };

  handleContactDriver = async (driver) => {
    try {
      // Create or find existing chat with the driver (chats.create returns existing chat if one exists)
      const chatId = await Meteor.callAsync("chats.create", [driver]);

      // Navigate to chat page with the specific chat ID
      this.props.history.push("/chat", { selectedChatId: chatId });
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
        <Container>
          <Loading>
            <LoadingSpinner />
            <p>Loading your rides...</p>
          </Loading>
        </Container>
      );
    }

    const { filteredRides, searchQuery, joinRideModalOpen, prefillCode } =
      this.state;

    return (
      <>
        <Container>
          <Header>
            <Title>My Rides as Rider</Title>
            <Subtitle>Manage rides where you&apos;re a passenger</Subtitle>
          </Header>

          {/* Search Section */}
          <SearchSection>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Search by location or driver..."
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
                {filteredRides.length !== 1 ? "s" : ""} as rider
              </p>
            )}
          </Summary>

          {/* Rides List */}
          <RidesContainer>
            {filteredRides.length === 0 ? (
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
              filteredRides.map((ride) => (
                <RideWrapper key={ride._id}>
                  <MobileRide ride={ride} />
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
        </Container>

        <JoinRideModal
          open={joinRideModalOpen}
          onClose={this.handleJoinRideClose}
          prefillCode={prefillCode}
        />

        {this.state.showConfirmModal && (
          <ConfirmFunction
            title="Leave Ride"
            subtitle="Are you sure you want to leave this ride? The driver will be notified."
            confirmText="Leave Ride"
            cancelText="Stay in Ride"
            isDestructive={true}
            asyncFunction={this.handleConfirmLeaveRide}
            onResult={this.handleConfirmModalResult}
            onClose={this.handleConfirmModalResult}
          />
        )}
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
