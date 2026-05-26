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
  Section,
  SectionTitle,
  Grid,
  Table,
  Row,
  Cell,
  Mono,
  Empty,
} from "../styles/MyRides";

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
    ready, rides, placeName, userName, me,
  } = useTracker(() => {
    const uid = Meteor.userId();
    const subs = [
      Meteor.subscribe("Rides"),
      Meteor.subscribe("places.options"),
      Meteor.subscribe("profiles.interacted"),
    ];
    const placeMap = {};
    Places.find({}).forEach((p) => {
      placeMap[p._id] = p.text;
    });
    const nameMap = {};
    Profiles.find({}).forEach((p) => {
      nameMap[p.Owner] = p.Name;
    });
    return {
      ready: subs.every(s => s.ready()),
      rides: Rides.find({}, { sort: { date: 1 } }).fetch(),
      placeName: placeMap,
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
  const withNames = rides.map(r => ({
    ...r,
    originText: placeName[r.origin],
    destinationText: placeName[r.destination],
  }));
  const upcoming = withNames
    .filter(r => new Date(r.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = withNames
    .filter(r => new Date(r.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const featured = upcoming[0];
  const alsoUpcoming = upcoming.slice(1);
  const asDriver = rides.filter(r => r.driver === me).length;
  const asRider = rides.filter(r => (r.riders || []).includes(me)).length;

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
            <StatValue $accent="var(--signal-yellow-deep)">{upcoming.length}</StatValue>
            <StatLabel>UPCOMING</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{asDriver}</StatValue>
            <StatLabel>AS DRIVER</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{asRider}</StatValue>
            <StatLabel>AS RIDER</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue $accent="var(--leaf)">{past.length}</StatValue>
            <StatLabel>COMPLETED</StatLabel>
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
