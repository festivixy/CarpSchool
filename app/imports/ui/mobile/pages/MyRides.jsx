import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { Rides } from "../../../api/ride/Rides";
import { Places } from "../../../api/places/Places";
import { Profiles } from "../../../api/profile/Profile";
import RideCard from "../../components/RideCard";
import MapBg from "../../components/MapBg";
import { MyRidesSkeleton } from "../../skeleton";
import { estimateRoute } from "../../../api/ride/routeEstimate";
import {
  Page,
  Inner,
  H1,
  Mark,
  FeaturedCard,
  FeatLeft,
  StatusPill,
  FeatRoute,
  FeatData,
  DataItem,
  DataLabel,
  DataValue,
  FeatActions,
  FeatBtn,
  FeatGhost,
  FeatMap,
  StatRow,
  StatCard,
  StatValue,
  StatLabel,
  StatUnit,
  Section,
  SectionTitle,
  Grid,
  Table,
  Row,
  Cell,
  Mono,
  Empty,
} from "../styles/MyRides";

/* Stat basis, stated so the numbers are auditable rather than magic:
 * EPA puts an average passenger vehicle at ~404 g CO2/mile (0.89 lb), and a
 * typical UberX runs about $1.75/mile in this market. Sharing a ride avoids
 * the rider's own solo trip, so miles shared drive both figures. */
const CO2_LB_PER_MILE = 0.89;
const RIDESHARE_USD_PER_MILE = 1.75;

const fmtDay = (date) => new Date(date)
  .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const fmtWhen = (date) => {
  const d = new Date(date);
  const day = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
};

const MobileMyRides = ({ history }) => {
  const {
    ready, rides, placeName, placeCoords, userName, me,
  } = useTracker(() => {
    const uid = Meteor.userId();
    const subs = [
      Meteor.subscribe("Rides"),
      Meteor.subscribe("places.options"),
      Meteor.subscribe("profiles.interacted"),
    ];
    const placeMap = {};
    const coordMap = {};
    Places.find({}).forEach((p) => {
      placeMap[p._id] = p.text;
      coordMap[p._id] = p.value;
    });
    const nameMap = {};
    Profiles.find({}).forEach((p) => {
      nameMap[p.Owner] = p.Name;
    });
    return {
      ready: subs.every(s => s.ready()),
      rides: Rides.find({}, { sort: { date: 1 } }).fetch(),
      placeName: placeMap,
      placeCoords: coordMap,
      userName: nameMap,
      me: uid,
    };
  }, []);

  const handleCancel = (rideId) => {
    swal({
      title: "Cancel this ride?",
      text: "This notifies all riders and can't be undone.",
      icon: "warning",
      buttons: ["Keep", "Cancel ride"],
      dangerMode: true,
    }).then((yes) => {
      if (yes) Meteor.call("rides.remove", rideId);
    });
  };

  const handleLeave = (rideId) => {
    swal({
      title: "Leave this ride?",
      text: "The driver will be notified.",
      icon: "warning",
      buttons: ["Stay", "Leave"],
      dangerMode: true,
    }).then((yes) => {
      if (yes) Meteor.call("rides.leave", rideId);
    });
  };

  if (!ready) return <MyRidesSkeleton numberOfRides={3} />;

  const now = new Date();
  const withNames = rides.map((r) => {
    // Rides created before distanceMi existed carry no stored figure, so
    // estimate from the place coordinates exactly as rides.forMySchool does.
    const fallback = r.distanceMi === undefined
      ? estimateRoute(placeCoords[r.origin], placeCoords[r.destination])
      : null;
    return {
      ...r,
      originText: placeName[r.origin],
      destinationText: placeName[r.destination],
      distanceMi: r.distanceMi ?? fallback?.distanceMi,
      durationMin: r.durationMin ?? fallback?.durationMin,
    };
  });
  const upcoming = withNames
    .filter(r => new Date(r.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = withNames
    .filter(r => new Date(r.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const featured = upcoming[0];
  const alsoUpcoming = upcoming.slice(1);
  const milesShared = past.reduce((sum, r) => sum + (r.distanceMi || 0), 0);
  const co2AvoidedLb = Math.round(milesShared * CO2_LB_PER_MILE);
  const faresPaid = past.reduce((sum, r) => sum + (r.fare || 0), 0);
  const savedUsd = Math.max(
    0,
    Math.round(milesShared * RIDESHARE_USD_PER_MILE - faresPaid),
  );

  let featuredNode = null;
  if (featured) {
    const iDrive = featured.driver === me;
    const seatsLeft = Math.max(0, (featured.seats || 0) - (featured.riders ? featured.riders.length : 0));
    featuredNode = (
      <FeaturedCard>
        <FeatLeft>
          <StatusPill>{iDrive ? "YOU'RE DRIVING" : "YOU'RE RIDING"}</StatusPill>
          <FeatRoute>
            {(featured.originText || featured.origin || "Unknown")}
            {" → "}
            {(featured.destinationText || featured.destination || "Unknown")}
          </FeatRoute>
          <FeatData>
            <DataItem>
              <DataLabel>WHEN</DataLabel>
              <DataValue>{fmtWhen(featured.date)}</DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>SEATS LEFT</DataLabel>
              <DataValue>{seatsLeft}</DataValue>
            </DataItem>
            <DataItem>
              <DataLabel>FARE</DataLabel>
              <DataValue>{featured.fare ? `$${featured.fare}` : "Free"}</DataValue>
            </DataItem>
          </FeatData>
          <FeatActions>
            <FeatBtn type="button" onClick={() => history.push(`/ride/${featured._id}`)}>
              View ride
            </FeatBtn>
            {iDrive ? (
              <FeatGhost type="button" onClick={() => handleCancel(featured._id)}>
                Cancel
              </FeatGhost>
            ) : (
              <FeatGhost type="button" onClick={() => handleLeave(featured._id)}>
                Leave
              </FeatGhost>
            )}
          </FeatActions>
        </FeatLeft>
        <FeatMap>
          <MapBg />
        </FeatMap>
      </FeaturedCard>
    );
  }

  return (
    <Page>
      <Inner>
        <H1>
          {upcoming.length > 0
            ? <>{`${upcoming.length} trip${upcoming.length === 1 ? "" : "s"} `}<Mark>coming up.</Mark></>
            : <>No upcoming trips <Mark>yet.</Mark></>}
        </H1>

        {featuredNode}

        <StatRow>
          <StatCard>
            <StatLabel>RIDES TAKEN</StatLabel>
            <StatValue $accent="var(--signal-yellow-deep)">{past.length}</StatValue>
            <StatUnit>this semester</StatUnit>
          </StatCard>
          <StatCard>
            <StatLabel>MILES SHARED</StatLabel>
            <StatValue $accent="var(--sky)">{Math.round(milesShared)}</StatValue>
            <StatUnit>with classmates</StatUnit>
          </StatCard>
          <StatCard>
            <StatLabel>CO&#8322; AVOIDED</StatLabel>
            <StatValue $accent="var(--leaf)">{co2AvoidedLb}</StatValue>
            <StatUnit>lb vs. solo trips</StatUnit>
          </StatCard>
          <StatCard>
            <StatLabel>SAVED</StatLabel>
            <StatValue $accent="var(--amber)">{`$${savedUsd}`}</StatValue>
            <StatUnit>vs. rideshare</StatUnit>
          </StatCard>
        </StatRow>

        {alsoUpcoming.length > 0 && (
          <Section>
            <SectionTitle>Also coming up</SectionTitle>
            <Grid>
              {alsoUpcoming.map(r => (
                <RideCard
                  key={r._id}
                  ride={r}
                  compact
                  driverName={userName[r.driver]}
                  onClick={ride => history.push(`/ride/${ride._id}`)}
                  onRequest={ride => history.push(`/ride/${ride._id}`)}
                />
              ))}
            </Grid>
          </Section>
        )}

        <Section>
          <SectionTitle>History</SectionTitle>
          {past.length === 0 ? (
            <Empty>No past rides yet.</Empty>
          ) : (
            <Table>
              <Row $head>
                <Cell>Date</Cell>
                <Cell>Route</Cell>
                <Cell>With</Cell>
                <Cell>Fare</Cell>
              </Row>
              {past.map((r) => {
                const route = `${r.originText || r.origin || "?"} → ${r.destinationText || r.destination || "?"}`;
                const withWho = r.driver === me
                  ? `${(r.riders || []).length} rider${(r.riders || []).length === 1 ? "" : "s"}`
                  : (userName[r.driver] || "Driver");
                return (
                  <Row key={r._id}>
                    <Cell><Mono>{fmtDay(r.date)}</Mono></Cell>
                    <Cell>{route}</Cell>
                    <Cell>{withWho}</Cell>
                    <Cell>{r.fare ? `$${r.fare}` : "—"}</Cell>
                  </Row>
                );
              })}
            </Table>
          )}
        </Section>
      </Inner>
    </Page>
  );
};

MobileMyRides.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default withRouter(MobileMyRides);
