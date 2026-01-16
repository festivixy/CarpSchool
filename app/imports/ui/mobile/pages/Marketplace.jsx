import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { Rides } from "../../../api/ride/Rides";
import { Profiles } from "../../../api/profile/Profile";
import { Spacer } from "../../components";
import {
  Container,
  Header,
  Title,
  Subtitle,
  SearchSection,
  SearchRow,
  SearchInput,
  ResultsCount,
  RidesList,
  RideCard,
  RideHeader,
  RideTime,
  Time,
  DateLabel,
  PriceTag,
  RouteInfo,
  LocationRow,
  LocationText,
  DriverInfo,
  DriverAvatar,
  DriverName,
  RequestButton,
  EmptyState,
} from "../styles/Marketplace";

/**
 * Marketplace Page
 * Allows users to browse and search for public rides.
 */
class Marketplace extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      filteredRides: [],
    };
  }

  componentDidMount() {
    this.filterRides();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.rides !== this.props.rides || prevProps.ready !== this.props.ready) {
      this.filterRides();
    }
  }

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value }, this.filterRides);
  };

  filterRides = () => {
    if (!this.props.ready || !this.props.rides) return;

    const { rides } = this.props;
    const { searchQuery } = this.state;
    const now = new Date();
    const currentUser = Meteor.userId();

    // Filter: Future rides, not created by me, and I'm not already a rider
    let validRides = rides.filter((ride) => {
      const rideDate = new Date(ride.date);
      const isFuture = rideDate > now;
      const isNotMe = ride.driver !== currentUser;
      const isNotRider = !ride.riders || !ride.riders.includes(currentUser); // Assuming riders stores IDs or Usernames. If generic 'riders' field exists.
      
      // Check legacy 'rider' field too if it exists
      const isNotLegacyRider = ride.rider !== currentUser;

      return isFuture && isNotMe && isNotRider && isNotLegacyRider;
    });

    // Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      validRides = validRides.filter(
        (ride) =>
          ride.origin.toLowerCase().includes(query) ||
          ride.destination.toLowerCase().includes(query)
      );
    }

    // Sort by Date (soonest first)
    validRides.sort((a, b) => new Date(a.date) - new Date(b.date));

    this.setState({ filteredRides: validRides });
  };

  handleRequestJoin = async (ride) => {
    // Open chat with driver to request join
    try {
      const driver = ride.driver;
      
      // Confirm with user
      const willContact = await swal({
        title: "Request to Join",
        text: "This will open a chat with the driver so you can ask for the ride code.",
        icon: "info",
        buttons: ["Cancel", "Chat with Driver"],
      });

      if (willContact) {
         // Create or find existing chat with the driver
         const chatId = await Meteor.callAsync("chats.create", [driver]);
         // Pre-fill message idea (optional, if router supports passing state to chat)
         this.props.history.push("/chat", { 
           selectedChatId: chatId,
           initialMessage: `Hi! I'd like to join your ride to ${ride.destination} on ${new Date(ride.date).toLocaleDateString()}.` 
         });
      }

    } catch (error) {
      console.error("Error starting chat:", error);
      swal("Error", "Could not start chat with driver.", "error");
    }
  };

  getParams(ride) {
    const dateObj = new Date(ride.date);
    return {
      time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      seatsLeft: ride.seats - (ride.riders?.length || 0)
    };
  }

  render() {
    const { ready } = this.props;
    const { filteredRides, searchQuery } = this.state;

    if (!ready) {
      // Basic loading state
      return (
        <Container>
          <Header>
            <Title>Find a Ride</Title>
            <Subtitle>Loading marketplace...</Subtitle>
          </Header>
        </Container>
      );
    }

    return (
      <Container>
        <Header>
          <Title>Find a Ride</Title>
          <Subtitle>Discover upcoming rides from your school</Subtitle>
        </Header>

        <SearchSection>
          <SearchRow>
            <SearchInput
              type="text"
              placeholder="Search destination or origin..."
              value={searchQuery}
              onChange={this.handleSearchChange}
            />
          </SearchRow>
        </SearchSection>

        <ResultsCount>
          {filteredRides.length} ride{filteredRides.length !== 1 ? "s" : ""} available
        </ResultsCount>

        <RidesList>
          {filteredRides.length === 0 ? (
            <EmptyState>
              <p>No rides found matching your search.</p>
              <p>Check back later or create your own ride!</p>
            </EmptyState>
          ) : (
            filteredRides.map((ride) => {
              const { time, date, seatsLeft } = this.getParams(ride);
              return (
                <RideCard key={ride._id}>
                  <RideHeader>
                    <RideTime>
                      <Time>{time}</Time>
                      <DateLabel>{date}</DateLabel>
                    </RideTime>
                    <PriceTag>{seatsLeft} seats left</PriceTag>
                  </RideHeader>

                  <RouteInfo>
                    <LocationRow>
                      <LocationText>🟢 {ride.origin}</LocationText>
                    </LocationRow>
                    <LocationRow>
                      <LocationText>📍 {ride.destination}</LocationText>
                    </LocationRow>
                  </RouteInfo>

                  <DriverInfo>
                    {/* Placeholder Avatar - real app would fetch profile pic */}
                    <DriverAvatar src={`https://ui-avatars.com/api/?name=${ride.driver}&background=random`} />
                    <DriverName>Driver (ID: {ride.driver.substring(0, 6)}...)</DriverName>
                    <RequestButton onClick={() => this.handleRequestJoin(ride)}>
                      Request to Join
                    </RequestButton>
                  </DriverInfo>
                </RideCard>
              );
            })
          )}
        </RidesList>
        
        <Spacer />
      </Container>
    );
  }
}

Marketplace.propTypes = {
  rides: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(
  withTracker(() => {
    const ridesSub = Meteor.subscribe("Rides");
    const profilesSub = Meteor.subscribe("Profiles");
    
    return {
      rides: Rides.find({}).fetch(),
      ready: ridesSub.ready() && profilesSub.ready(),
    };
  })(Marketplace)
);
