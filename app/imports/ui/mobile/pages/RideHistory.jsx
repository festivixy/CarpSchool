import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { isAdminRole } from "../../desktop/components/NavBarRoleUtils";
import { RideSessions } from "../../../api/rideSession/RideSession";
import { Rides } from "../../../api/ride/Rides";
import { getUserDisplayName } from "../../utils/userDisplay";
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
  SessionList,
  SessionRow,
  SessionRoute,
  SessionMeta,
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
    // Use the centralized userDisplay utility
    return getUserDisplayName(userId);
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
    const isAdmin = isAdminRole(user);
    const isDriver = session.driverId === currentUser._id;
    const isRider = session.riders.includes(currentUser._id);

    return isDriver || isRider || isAdmin;
  };

  /**
   * `/ride-history/me` lands here with match.params.id === "me" - there is no
   * single session to show, so this renders the current user's completed
   * ride sessions as a list instead of the permission error a missing
   * session id would otherwise produce.
   */
  renderMyHistory = () => {
    const { sessions, rides, history } = this.props;
    const rideById = {};
    (rides || []).forEach((r) => {
      rideById[r._id] = r;
    });

    return (
      <Container>
        <Header>
          <BackButton onClick={this.handleBack}>← Back</BackButton>
          <Title>Ride History</Title>
          <Subtitle>Your completed rides</Subtitle>
        </Header>

        <HistoryContent>
          <HistorySection>
            <HistorySectionTitle>Completed rides</HistorySectionTitle>
            {sessions.length === 0 ? (
              <RiderProgressDetails>No completed rides yet.</RiderProgressDetails>
            ) : (
              <SessionList>
                {sessions.map((s) => {
                  const ride = rideById[s.rideId];
                  const isDriver = s.driverId === Meteor.userId();
                  return (
                    <SessionRow
                      key={s._id}
                      type="button"
                      onClick={() => history.push(`/ride-history/${s._id}`)}
                    >
                      <SessionRoute>
                        {ride ? `${ride.origin} → ${ride.destination}` : "Ride"}
                      </SessionRoute>
                      <SessionMeta>
                        {isDriver ? "Drove" : "Rode"}
                        {s.timeline && s.timeline.ended
                          ? ` · ${new Date(s.timeline.ended).toLocaleDateString()}`
                          : ""}
                      </SessionMeta>
                    </SessionRow>
                  );
                })}
              </SessionList>
            )}
          </HistorySection>
        </HistoryContent>

        <Spacer />
      </Container>
    );
  };

  render() {
    const {
      ready, isMe, session, ride,
    } = this.props;

    if (!ready) {
      return <MobileGenericSkeleton />;
    }

    if (isMe) {
      return this.renderMyHistory();
    }

    if (!session || !this.canViewSession()) {
      return (
        <Container>
          <Header>
            <BackButton onClick={this.handleBack}>← Back</BackButton>
            <Title>Ride History</Title>
          </Header>

          <NotFound>
            <NotFoundIcon></NotFoundIcon>
            <NotFoundTitle>History Not Available</NotFoundTitle>
            <NotFoundMessage>
              This ride history is not available or you don&apos;t have permission to view it.
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
                    "Not available"
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
                      {progress?.droppedOff ? "Completed" : progress?.pickedUp ? "Picked Up" : "Not Picked"} {/* eslint-disable-line no-nested-ternary */}

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
                      <div style={{ color: "rgba(244, 67, 54, 1)" }}>Code verification disabled</div>
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
                .sort(([, a], [, b]) => new Date(a.time) - new Date(b.time))
                .map(([eventKey, event]) => (
                  <EventItem key={eventKey}>
                    <EventTitle>
                      {eventKey.replace(/_\d+$/, "").replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
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
  isMe: PropTypes.bool,
  session: PropTypes.object,
  ride: PropTypes.object,
  sessions: PropTypes.array,
  rides: PropTypes.array,
  users: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

RideHistory.defaultProps = {
  isMe: false,
  session: null,
  ride: null,
  sessions: [],
  rides: [],
};

export default withRouter(
  withTracker(({ match }) => {
    const sessionId = match.params.id;

    if (sessionId === "me") {
      // No single session to show here - list the current user's completed
      // sessions instead. "rideSessions" already scopes to sessions where the
      // caller is driver or rider; this narrows further to finished ones.
      const sessionsSubscription = Meteor.subscribe("rideSessions");
      const ridesSubscription = Meteor.subscribe("Rides");
      const sessions = RideSessions.find(
        { status: "completed" },
        { sort: { "timeline.ended": -1 } },
      ).fetch();

      return {
        ready: sessionsSubscription.ready() && ridesSubscription.ready(),
        isMe: true,
        sessions,
        rides: Rides.find({}).fetch(),
        session: null,
        ride: null,
        users: Meteor.users.find({}).fetch(),
      };
    }

    const sessionsSubscription = Meteor.subscribe("rideSession", sessionId);
    const ridesSubscription = Meteor.subscribe("Rides");

    const session = RideSessions.findOne(sessionId);
    const ride = session ? Rides.findOne(session.rideId) : null;

    // Subscribe to user data for all participants in the session
    let usersSubscription = { ready: () => true };
    if (session) {
      const allUserIds = [
        session.driverId,
        session.createdBy,
        ...session.riders,
        // Get user IDs from events
        ...Object.values(session.events || {}).map(event => event.by).filter(Boolean),
      ].filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates

      if (allUserIds.length > 0) {
        usersSubscription = Meteor.subscribe("users.byIds", allUserIds);
      }
    }

    return {
      ready: sessionsSubscription.ready() && ridesSubscription.ready() && usersSubscription.ready(),
      isMe: false,
      session,
      ride,
      users: Meteor.users.find({}).fetch(), // Users already filtered by publication
    };
  })(RideHistory),
);
