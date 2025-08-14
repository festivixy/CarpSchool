import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Rides } from "../../../api/ride/Rides";
import { Places } from "../../../api/places/Places";
import RouteMapView from "../../components/RouteMapView";
import LoadingPage from "../../components/LoadingPage";
import BackButton from "../components/BackButton";
import {
  Container,
  MapSection,
  RideInfoSection,
  RideInfoContainer,
  NavbarClearance,
  RideHeader,
  RouteDisplay,
  RouteItem,
  RouteLabel,
  RouteLocation,
  RouteArrow,
  RideDetails,
  DetailRow,
  DetailLabel,
  DetailValue,
  StatusBadge,
  StatusLooking,
  StatusMatched,
  NotesSection,
  NotesLabel,
  NotesText,
  RidersSection,
  RidersLabel,
  RidersList,
  RiderItem,
  ErrorContainer,
  ErrorTitle,
  ErrorMessage,
} from "../styles/RideInfo";

/**
 * RideInfo mobile page - displays detailed ride information with map
 * Layout: 60% map, 33% ride info, 7% navbar clearance
 */
class RideInfo extends React.Component {
  parseCoordinates = (coordinateString) => {
    if (!coordinateString) return null;
    const [lat, lng] = coordinateString.split(",").map(coord => parseFloat(coord.trim()));
    return { lat, lng };
  };

  getPlaceName = (placeId) => {
    const place = this.props.places.find((p) => p._id === placeId);
    return place ? place.text : placeId;
  };

  getPlaceCoordinates = (placeId) => {
    const place = this.props.places.find((p) => p._id === placeId);
    return place ? this.parseCoordinates(place.value) : null;
  };

  formatDate = (date) => new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  formatTime = (date) => new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  renderRideStatus = (ride) => {
    // Handle new schema with riders array
    if (ride.riders !== undefined && ride.seats !== undefined) {
      const availableSeats = ride.seats - ride.riders.length;
      if (availableSeats > 0) {
        return (
          <StatusLooking>
            {availableSeats} seat{availableSeats !== 1 ? "s" : ""} available
          </StatusLooking>
        );
      }
      return <StatusMatched>Ride full</StatusMatched>;
    }

    // Handle legacy schema
    if (ride.rider === "TBD") {
      return <StatusLooking>Looking for rider</StatusLooking>;
    }
    return <StatusMatched>Rider found</StatusMatched>;
  };

  renderRiders = (ride) => {
    // Handle new schema with riders array
    if (ride.riders !== undefined && ride.seats !== undefined) {
      if (ride.riders.length === 0) {
        return "No riders yet";
      }
      return `${ride.riders.length}/${ride.seats} riders: ${ride.riders.join(", ")}`;
    }

    // Handle legacy schema
    return ride.rider === "TBD" ? "No rider yet" : ride.rider;
  };

  render() {
    const { ready, ride } = this.props;

    if (!ready) {
      return (
        <LoadingPage
          message="Loading ride details..."
          subMessage="Getting route and ride information"
        />
      );
    }

    if (!ride) {
      return (
        <Container>
          <BackButton />
          <ErrorContainer>
            <ErrorTitle>Ride Not Found</ErrorTitle>
            <ErrorMessage>
              The ride you&apos;re looking for doesn&apos;t exist or has been removed.
            </ErrorMessage>
          </ErrorContainer>
          <NavbarClearance />
        </Container>
      );
    }

    const startCoord = this.getPlaceCoordinates(ride.origin);
    const endCoord = this.getPlaceCoordinates(ride.destination);

    return (
      <Container>
        <BackButton />

        {/* Map Section - 60% */}
        <MapSection>
          {startCoord && endCoord ? (
            <RouteMapView
              startCoord={startCoord}
              endCoord={endCoord}
              height="100%"
            />
          ) : (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              backgroundColor: "#f5f5f5",
              color: "#666",
            }}>
              Map unavailable - missing location coordinates
            </div>
          )}
        </MapSection>

        {/* Ride Info Section - 40% */}
        <RideInfoSection>
          <RideInfoContainer>
            <RideHeader>

              <RouteDisplay>
                <RouteItem>
                  <RouteLabel>From</RouteLabel>
                  <RouteLocation>{this.getPlaceName(ride.origin)}</RouteLocation>
                </RouteItem>
                <RouteArrow>→</RouteArrow>
                <RouteItem>
                  <RouteLabel>To</RouteLabel>
                  <RouteLocation>{this.getPlaceName(ride.destination)}</RouteLocation>
                </RouteItem>
              </RouteDisplay>

              <StatusBadge>
                {this.renderRideStatus(ride)}
              </StatusBadge>
            </RideHeader>

            <RideDetails>
              <DetailRow>
                <DetailLabel>📅 Date</DetailLabel>
                <DetailValue>{this.formatDate(ride.date)}</DetailValue>
              </DetailRow>

              <DetailRow>
                <DetailLabel>🕒 Time</DetailLabel>
                <DetailValue>{this.formatTime(ride.date)}</DetailValue>
              </DetailRow>

              <DetailRow>
                <DetailLabel>🚗 Driver</DetailLabel>
                <DetailValue>{ride.driver}</DetailValue>
              </DetailRow>

              <DetailRow>
                <DetailLabel>👥 Riders</DetailLabel>
                <DetailValue>{this.renderRiders(ride)}</DetailValue>
              </DetailRow>

              {ride.shareCode && (
                <DetailRow>
                  <DetailLabel>🔗 Share Code</DetailLabel>
                  <DetailValue style={{
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "#007bff",
                  }}>
                    {ride.shareCode}
                  </DetailValue>
                </DetailRow>
              )}
            </RideDetails>

            {ride.notes && (
              <NotesSection>
                <NotesLabel>📝 Notes</NotesLabel>
                <NotesText>{ride.notes}</NotesText>
              </NotesSection>
            )}

            {/* Show detailed riders list for new schema */}
            {ride.riders && ride.riders.length > 0 && (
              <RidersSection>
                <RidersLabel>Passengers ({ride.riders.length})</RidersLabel>
                <RidersList>
                  {ride.riders.map((rider, index) => (
                    <RiderItem key={index}>
                      👤 {rider}
                    </RiderItem>
                  ))}
                </RidersList>
              </RidersSection>
            )}
          </RideInfoContainer>
        </RideInfoSection>

        {/* Navbar Clearance - 7% */}
        <NavbarClearance />
      </Container>
    );
  }
}

RideInfo.propTypes = {
  ready: PropTypes.bool.isRequired,
  ride: PropTypes.object,
  places: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  rideId: PropTypes.string.isRequired,
};

export default withRouter(
  withTracker((props) => {
    const rideId = props.match.params.rideId;
    const ridesSubscription = Meteor.subscribe("Rides");
    const placesSubscription = Meteor.subscribe("places.options");

    const ready = ridesSubscription.ready() && placesSubscription.ready();
    const ride = Rides.findOne(rideId);
    const places = Places.find({}).fetch();

    return {
      ready,
      ride,
      places,
      rideId,
    };
  })(RideInfo),
);
