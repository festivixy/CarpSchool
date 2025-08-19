import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { RideSessions } from "../../../api/rideSession/RideSession";
import { Rides } from "../../../api/ride/Rides";
import { Spacer } from "../../components";
import { MobileGenericSkeleton } from "../../skeleton";
import {
  Container,
  Header,
  Title,
  Subtitle,
  BackButton,
  HistoryContent,
  HistorySection,
  HistorySectionTitle,
  TimelineItem,
  TimelineInfo,
  TimelineTitle,
  TimelineTime,
  RiderProgressItem,
  RiderProgressHeader,
  RiderProgressName,
  RiderProgressStatus,
  RiderProgressDetails,
  EventItem,
  EventTitle,
  EventDetails,
  NotFound,
  NotFoundIcon,
  NotFoundTitle,
  NotFoundMessage,
} from "../styles/RideHistory";

/**
 * RideHistory component displaying comprehensive session details
 */
class RideHistory extends React.Component {
  getUsernameFromId = (userId) => {
    // This would ideally come from a subscription, but for now we'll use the current user
    // In a real app, you'd want to subscribe to user data or have usernames in the session
    if (userId === Meteor.userId()) {
      return Meteor.user()?.username || userId;
    }
    return userId; // Fallback to ID if username not available
  };

  handleBack = () => {
    this.props.history.goBack();
  };

  canViewSession = () => {
    const { session } = this.props;
    const currentUser = Meteor.user();
    
    if (!currentUser || !session) return false;

    // User must be driver, rider, or admin
    const user = Meteor.users.findOne(currentUser._id);
    const isAdmin = user?.roles?.includes("admin");
    const isDriver = session.driverId === currentUser._id;
    const isRider = session.riders.includes(currentUser._id);

    return isDriver || isRider || isAdmin;
  };

  render() {
    const { ready, session, ride } = this.props;

    if (!ready) {
      return <MobileGenericSkeleton />;
    }

    if (!session || !this.canViewSession()) {
      return (
        <Container>
          <Header>
            <BackButton onClick={this.handleBack}>← Back</BackButton>
            <Title>Ride History</Title>
          </Header>

          <NotFound>
            <NotFoundIcon>📋</NotFoundIcon>
            <NotFoundTitle>History Not Available</NotFoundTitle>
            <NotFoundMessage>
              This ride history is not available or you don't have permission to view it.
            </NotFoundMessage>
          </NotFound>

          <Spacer />
        </Container>
      );
    }

    return (
      <Container>
        <Header>
          <BackButton onClick={this.handleBack}>← Back</BackButton>
          <Title>Ride History</Title>
          {ride && (
            <Subtitle>
              {ride.origin} → {ride.destination} • {new Date(ride.date).toLocaleDateString()}
            </Subtitle>
          )}
        </Header>

        <HistoryContent>
          {/* Timeline Section */}
          <HistorySection>
            <HistorySectionTitle>Timeline</HistorySectionTitle>
            <TimelineItem completed={true}>
              <TimelineInfo>
                <TimelineTitle>Ride Session Created</TimelineTitle>
                <TimelineTime>
                  {session.timeline.created ? 
                    new Date(session.timeline.created).toLocaleString() : 
                    'Not available'
                  }
                </TimelineTime>
              </TimelineInfo>
            </TimelineItem>
            
            {session.timeline.started && (
              <TimelineItem completed={true}>
                <TimelineInfo>
                  <TimelineTitle>Ride Started</TimelineTitle>
                  <TimelineTime>
                    {new Date(session.timeline.started).toLocaleString()}
                  </TimelineTime>
                </TimelineInfo>
              </TimelineItem>
            )}
            
            {session.timeline.arrived && (
              <TimelineItem completed={true}>
                <TimelineInfo>
                  <TimelineTitle>Driver Arrived</TimelineTitle>
                  <TimelineTime>
                    {new Date(session.timeline.arrived).toLocaleString()}
                  </TimelineTime>
                </TimelineInfo>
              </TimelineItem>
            )}
            
            {session.timeline.ended && (
              <TimelineItem completed={true}>
                <TimelineInfo>
                  <TimelineTitle>
                    {session.status === "cancelled" ? "Ride Cancelled" : "Ride Completed"}
                  </TimelineTitle>
                  <TimelineTime>
                    {new Date(session.timeline.ended).toLocaleString()}
                  </TimelineTime>
                </TimelineInfo>
              </TimelineItem>
            )}
          </HistorySection>

          {/* Rider Progress Section */}
          <HistorySection>
            <HistorySectionTitle>Rider Progress</HistorySectionTitle>
            {session.riders.map(riderId => {
              const progress = session.progress[riderId];
              return (
                <RiderProgressItem key={riderId}>
                  <RiderProgressHeader>
                    <RiderProgressName>{this.getUsernameFromId(riderId)}</RiderProgressName>
                    <RiderProgressStatus completed={progress?.droppedOff}>
                      {progress?.droppedOff ? "Completed" : progress?.pickedUp ? "Picked Up" : "Not Picked"}
                    </RiderProgressStatus>
                  </RiderProgressHeader>
                  <RiderProgressDetails>
                    {progress?.pickupTime && (
                      <div>Pickup: {new Date(progress.pickupTime).toLocaleString()}</div>
                    )}
                    {progress?.dropoffTime && (
                      <div>Dropoff: {new Date(progress.dropoffTime).toLocaleString()}</div>
                    )}
                    {progress?.codeAttempts > 0 && (
                      <div>Code attempts: {progress.codeAttempts}</div>
                    )}
                    {progress?.codeError && (
                      <div style={{ color: 'rgba(244, 67, 54, 1)' }}>Code verification disabled</div>
                    )}
                  </RiderProgressDetails>
                </RiderProgressItem>
              );
            })}
          </HistorySection>

          {/* Events Section */}
          {session.events && Object.keys(session.events).length > 0 && (
            <HistorySection>
              <HistorySectionTitle>Events</HistorySectionTitle>
              {Object.entries(session.events)
                .sort(([,a], [,b]) => new Date(a.time) - new Date(b.time))
                .map(([eventKey, event]) => (
                  <EventItem key={eventKey}>
                    <EventTitle>
                      {eventKey.replace(/_\d+$/, '').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </EventTitle>
                    <EventDetails>
                      <div>Time: {new Date(event.time).toLocaleString()}</div>
                      <div>By: {this.getUsernameFromId(event.by)}</div>
                      {event.riderId && <div>Rider: {this.getUsernameFromId(event.riderId)}</div>}
                      {event.reason && <div>Reason: {event.reason}</div>}
                      {event.location && (
                        <div>Location: {event.location.lat.toFixed(6)}, {event.location.lng.toFixed(6)}</div>
                      )}
                    </EventDetails>
                  </EventItem>
                ))}
            </HistorySection>
          )}

          {/* Session Info */}
          <HistorySection>
            <HistorySectionTitle>Session Info</HistorySectionTitle>
            <RiderProgressItem>
              <RiderProgressDetails>
                <div>Session ID: {session._id}</div>
                <div>Status: {session.status}</div>
                <div>Finished: {session.finished ? "Yes" : "No"}</div>
                <div>Driver: {this.getUsernameFromId(session.driverId)}</div>
                <div>Created by: {this.getUsernameFromId(session.createdBy)}</div>
                <div>Total riders: {session.riders.length}</div>
                <div>Active riders: {session.activeRiders?.length || 0}</div>
              </RiderProgressDetails>
            </RiderProgressItem>
          </HistorySection>
        </HistoryContent>

        <Spacer />
      </Container>
    );
  }
}

RideHistory.propTypes = {
  ready: PropTypes.bool.isRequired,
  session: PropTypes.object,
  ride: PropTypes.object,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default withRouter(
  withTracker(({ match }) => {
    const sessionId = match.params.id;
    const sessionsSubscription = Meteor.subscribe("rideSession", sessionId);
    const ridesSubscription = Meteor.subscribe("Rides");
    
    const session = RideSessions.findOne(sessionId);
    const ride = session ? Rides.findOne(session.rideId) : null;
    
    return {
      ready: sessionsSubscription.ready() && ridesSubscription.ready(),
      session,
      ride,
    };
  })(RideHistory),
);
