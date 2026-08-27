import React, { useMemo, useState } from "react";
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
import Pin from "../../components/Pin";
import RouteLine from "../../components/RouteLine";
import RouteMapView from "../../components/RouteMapView";
import Avatar from "../../components/Avatar";
import Icon from "../../components/Icon";
import LoadingPage from "../../components/LoadingPage";
import {
  estimateRoute,
  formatDistance,
  formatDuration,
  parseCoords,
} from "../../../api/ride/routeEstimate";
import {
  Page,
  Inner,
  Header,
  Eyebrow,
  H1,
  Mark,
  HeaderActions,
  GhostBtn,
  CoralBtn,
  ChipRow,
  FilterChip,
  FeaturedCard,
  FeatLeft,
  PillRow,
  NextUpPill,
  PillTime,
  RouteRow,
  OriginDot,
  RouteBar,
  PlaceName,
  FeatData,
  DataItem,
  DataLabel,
  DataValue,
  FeatFooter,
  DriverBlock,
  DriverName,
  DriverRole,
  DriverMeta,
  FeatActions,
  FeatGhost,
  FeatBtn,
  FeatQuiet,
  FeatMap,
  MapPane,
  MapScrim,
  DecorOverlay,
  GlassPill,
  GlassPillText,
  GlassPillLead,
  StatRow,
  StatCard,
  StatLabel,
  StatValue,
  StatUnit,
  SectionHead,
  SectionTitle,
  SectionCount,
  LinkBtn,
  Grid,
  Table,
  Row,
  DateCell,
  RouteCell,
  WithCell,
  FareCell,
  Empty,
} from "../styles/MyRides";

/* The design shows four history rows with a "see all" affordance beside the
 * heading; the rest expand in place. */
const HISTORY_PREVIEW_ROWS = 4;

const MS_PER_DAY = 86400000;

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const ROLE_FILTERS = [
  { id: "all", label: "All" },
  { id: "driving", label: "Driving" },
  { id: "riding", label: "Riding" },
];

/* The stat row's unit lines claim "this semester", so the figures have to be
 * scoped to one rather than to all time. Academic calendar in month terms:
 * Fall runs Aug-Dec, Spring Jan-May, Summer Jun-Jul. */
const semesterStart = (now) => {
  const month = now.getMonth();
  if (month >= 7) return new Date(now.getFullYear(), 7, 1);
  if (month >= 5) return new Date(now.getFullYear(), 5, 1);
  return new Date(now.getFullYear(), 0, 1);
};

/* Same seed function RideCard uses, so one person keeps one avatar colour
 * across the featured card and the cards beneath it. */
const hueFor = (seed) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  return h;
};

const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/* "OCT 18" — the design's history date column. */
const fmtDay = date => new Date(date)
  .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
  .toUpperCase();

/* "FRI · 3:40 PM" — matches RideCard's eyebrow, so the two agree. */
const fmtDepart = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${WEEKDAYS[d.getDay()]} · ${time}`.toUpperCase();
};

/* "NEXT UP · IN 2 DAYS", derived from the real departure time. */
const countdownLabel = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "NEXT UP";
  const minutes = Math.round((d.getTime() - Date.now()) / 60000);
  if (minutes <= 0) return "NEXT UP · NOW";
  if (minutes < 60) return `NEXT UP · IN ${minutes} MIN`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `NEXT UP · IN ${hours} HOUR${hours === 1 ? "" : "S"}`;
  const days = Math.round((startOfDay(d) - startOfDay(new Date())) / MS_PER_DAY);
  if (days <= 1) return "NEXT UP · TOMORROW";
  return `NEXT UP · IN ${days} DAYS`;
};

const MobileMyRides = ({ history }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAllHistory, setShowAllHistory] = useState(false);

  const {
    ready, rides, placeName, placeCoords, myProfile, me,
  } = useTracker(() => {
    const uid = Meteor.userId();
    const subs = [
      Meteor.subscribe("Rides"),
      Meteor.subscribe("places.options"),
      Meteor.subscribe("profiles.mineWithApprovalStatus"),
    ];
    const placeMap = {};
    const coordMap = {};
    Places.find({}).forEach((p) => {
      placeMap[p._id] = p.text;
      coordMap[p._id] = p.value;
    });
    return {
      ready: subs.every(s => s.ready()),
      rides: Rides.find({}, { sort: { date: 1 } }).fetch(),
      placeName: placeMap,
      placeCoords: coordMap,
      myProfile: uid ? Profiles.findOne({ Owner: uid }) : null,
      me: uid,
    };
  }, []);

  /* Only driver identities are rendered by name, so the subscription set stays
   * small and well inside profiles.displayNames' 50-id cap. Memoised through a
   * stable string key so the subscription does not churn on every recompute. */
  const driverKey = useMemo(
    () => [...new Set(rides.map(r => r.driver).filter(Boolean))].sort().join(","),
    [rides],
  );
  const driverIds = useMemo(() => (driverKey ? driverKey.split(",") : []), [driverKey]);

  /* profiles.interacted publishes only { Name, Owner }; displayNames adds the
   * year/major sub-line the featured card and the ride cards both show. */
  const driverById = useTracker(() => {
    if (driverIds.length === 0) return {};
    Meteor.subscribe("profiles.displayNames", driverIds);
    const map = {};
    Profiles.find({ Owner: { $in: driverIds } }).forEach((p) => {
      map[p.Owner] = { name: p.Name, year: p.year, dept: p.major };
    });
    return map;
  }, [driverIds]);

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

  if (!ready) return <LoadingPage message="Loading your rides..." />;

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
      /* Resolved locally, in the driver's order, so these cards can show the
       * stops the same way the discovery feed's do. */
      waypointStops: (r.waypoints || [])
        .filter(id => placeName[id])
        .map(id => ({ _id: id, text: placeName[id], value: placeCoords[id] })),
      distanceMi: r.distanceMi ?? fallback?.distanceMi,
      durationMin: r.durationMin ?? fallback?.durationMin,
    };
  });

  const matchesRole = (r) => {
    if (roleFilter === "driving") return r.driver === me;
    if (roleFilter === "riding") return r.driver !== me;
    return true;
  };
  const upcoming = withNames
    .filter(r => new Date(r.date) >= now && matchesRole(r))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = withNames
    .filter(r => new Date(r.date) < now && matchesRole(r))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const featured = upcoming[0];
  const alsoUpcoming = upcoming.slice(1);
  const historyRows = showAllHistory ? past : past.slice(0, HISTORY_PREVIEW_ROWS);

  const termPast = past.filter(r => new Date(r.date) >= semesterStart(now));
  const milesShared = termPast.reduce((sum, r) => sum + (r.distanceMi || 0), 0);

  const firstName = myProfile && myProfile.Name ? myProfile.Name.trim().split(" ")[0] : "";
  const canDrive = Boolean(myProfile) && myProfile.UserType !== "Rider";
  const tripPhrase = upcoming.length > 0
    ? `${upcoming.length} trip${upcoming.length === 1 ? "" : "s"} coming up.`
    : "No trips coming up yet.";

  let featuredNode = null;
  if (featured) {
    const iDrive = featured.driver === me;
    const driver = driverById[featured.driver] || {};
    const driverLabel = driver.name || "Driver";
    const driverSub = [driver.year, driver.dept].filter(Boolean).join(" · ");
    const durationText = formatDuration(featured.durationMin);
    const distanceText = formatDistance(featured.distanceMi);
    const start = parseCoords(placeCoords[featured.origin]);
    const end = parseCoords(placeCoords[featured.destination]);
    const noteLead = iDrive ? "Your note." : `${driverLabel.split(" ")[0]}'s note.`;

    featuredNode = (
      <FeaturedCard>
        <FeatLeft>
          <PillRow>
            <NextUpPill>{countdownLabel(featured.date)}</NextUpPill>
            <PillTime>{fmtDepart(featured.date)}</PillTime>
          </PillRow>

          <RouteRow>
            <OriginDot />
            <PlaceName>{featured.originText || featured.origin || "Unknown"}</PlaceName>
          </RouteRow>
          <RouteBar />
          <RouteRow $last>
            <Icon name="pin" size={16} color="var(--cream-0)" />
            <PlaceName>{featured.destinationText || featured.destination || "Unknown"}</PlaceName>
          </RouteRow>

          <FeatData>
            {durationText ? (
              <DataItem>
                <DataLabel>DURATION</DataLabel>
                <DataValue>{durationText}</DataValue>
              </DataItem>
            ) : null}
            {distanceText ? (
              <DataItem>
                <DataLabel>DISTANCE</DataLabel>
                <DataValue>{distanceText}</DataValue>
              </DataItem>
            ) : null}
            <DataItem>
              <DataLabel>YOUR SEAT</DataLabel>
              <DataValue>{featured.fare ? `$${featured.fare}` : "Free"}</DataValue>
            </DataItem>
          </FeatData>

          <FeatFooter>
            <DriverBlock>
              <Avatar
                user={{ name: driverLabel, hue: hueFor(featured.driver || driverLabel) }}
                size={42}
                ring="rgba(255,255,255,0.2)"
              />
              <div>
                <DriverName>
                  {iDrive ? "You" : driverLabel}
                  <DriverRole>{iDrive ? " · driving" : " · driver"}</DriverRole>
                </DriverName>
                {driverSub ? <DriverMeta>{driverSub}</DriverMeta> : null}
              </div>
            </DriverBlock>
            <FeatActions>
              <FeatGhost
                type="button"
                onClick={() => history.push(`/chat?rideId=${featured._id}`)}
              >
                <Icon name="chat" size={14} color="var(--cream-0)" />
                Message
              </FeatGhost>
              <FeatBtn type="button" onClick={() => history.push(`/ride/${featured._id}`)}>
                View ride
                <Icon name="arrow" size={14} color="var(--ink-1)" />
              </FeatBtn>
              {iDrive ? (
                <FeatQuiet type="button" onClick={() => handleCancel(featured._id)}>
                  Cancel
                </FeatQuiet>
              ) : (
                <FeatQuiet type="button" onClick={() => handleLeave(featured._id)}>
                  Leave
                </FeatQuiet>
              )}
            </FeatActions>
          </FeatFooter>
        </FeatLeft>

        <FeatMap>
          {start && end ? (
            <MapPane>
              <RouteMapView startCoord={start} endCoord={end} height="100%" />
            </MapPane>
          ) : (
            <React.Fragment>
              <MapPane $decorative>
                <MapBg />
              </MapPane>
              <DecorOverlay>
                <RouteLine
                  from={{ x: 18, y: 75 }}
                  to={{ x: 78, y: 28 }}
                  color="var(--signal-yellow)"
                />
                <Pin x={18} y={75} type="dot" color="var(--signal-yellow)" size={14} />
                <Pin x={78} y={28} type="dot" color="var(--cream-0)" size={14} />
              </DecorOverlay>
            </React.Fragment>
          )}
          <MapScrim />
          {featured.notes ? (
            <GlassPill>
              <Icon name="chat" size={16} color="var(--ink-1)" />
              <GlassPillText>
                <GlassPillLead>{noteLead}</GlassPillLead>
                {` ${featured.notes}`}
              </GlassPillText>
            </GlassPill>
          ) : null}
        </FeatMap>
      </FeaturedCard>
    );
  }

  return (
    <Page>
      <Inner>
        <Header $tight={showFilters}>
          <div>
            <Eyebrow>YOUR RIDES</Eyebrow>
            <H1>
              {firstName ? `Hey ${firstName} — ` : ""}
              <Mark>{tripPhrase}</Mark>
            </H1>
          </div>
          <HeaderActions>
            <GhostBtn type="button" onClick={() => setShowFilters(v => !v)}>
              <Icon name="filter" size={15} />
              Filter
            </GhostBtn>
            {canDrive && (
              <CoralBtn type="button" onClick={() => history.push("/create")}>
                <Icon name="plus" size={16} color="var(--ink-1)" />
                Offer ride
              </CoralBtn>
            )}
          </HeaderActions>
        </Header>

        {showFilters && (
          <ChipRow>
            {ROLE_FILTERS.map(f => (
              <FilterChip
                key={f.id}
                type="button"
                $active={roleFilter === f.id}
                onClick={() => setRoleFilter(f.id)}
              >
                {f.label}
              </FilterChip>
            ))}
          </ChipRow>
        )}

        {featuredNode}

        {!featured && roleFilter !== "all" && (
          <Empty $spaced>
            {roleFilter === "driving"
              ? "No upcoming rides you're driving."
              : "No upcoming rides you're riding in."}
          </Empty>
        )}

        <StatRow>
          <StatCard>
            <StatLabel>RIDES TAKEN</StatLabel>
            <StatValue $accent="var(--signal-yellow-deep)">{termPast.length}</StatValue>
            <StatUnit>this semester</StatUnit>
          </StatCard>
          <StatCard>
            <StatLabel>MILES SHARED</StatLabel>
            <StatValue $accent="var(--sky)">{Math.round(milesShared)}</StatValue>
            <StatUnit>with classmates</StatUnit>
          </StatCard>
        </StatRow>

        {alsoUpcoming.length > 0 && (
          <React.Fragment>
            <SectionHead>
              <SectionTitle>Also coming up</SectionTitle>
              <SectionCount>
                {`${alsoUpcoming.length} more ride${alsoUpcoming.length === 1 ? "" : "s"}`}
              </SectionCount>
            </SectionHead>
            <Grid>
              {alsoUpcoming.map((r) => {
                const d = driverById[r.driver] || {};
                return (
                  <RideCard
                    key={r._id}
                    ride={r}
                    compact
                    driverName={d.name}
                    driverYear={d.year}
                    driverDept={d.dept}
                    onClick={ride => history.push(`/ride/${ride._id}`)}
                    onRequest={ride => history.push(`/ride/${ride._id}`)}
                  />
                );
              })}
            </Grid>
          </React.Fragment>
        )}

        <SectionHead $spread>
          <SectionTitle>History</SectionTitle>
          {past.length > HISTORY_PREVIEW_ROWS && (
            <LinkBtn type="button" onClick={() => setShowAllHistory(v => !v)}>
              {showAllHistory ? "Show fewer" : `See all ${past.length} →`}
            </LinkBtn>
          )}
        </SectionHead>

        {past.length === 0 ? (
          <Empty>No past rides yet.</Empty>
        ) : (
          <Table>
            {historyRows.map((r) => {
              const riders = r.riders || [];
              const from = r.originText || r.origin || "?";
              const to = r.destinationText || r.destination || "?";
              let withWho;
              if (r.driver === me) {
                withWho = `${riders.length} rider${riders.length === 1 ? "" : "s"}`;
              } else {
                const name = (driverById[r.driver] || {}).name || "Driver";
                const others = Math.max(0, riders.length - 1);
                withWho = others > 0 ? `with ${name} + ${others}` : `with ${name}`;
              }
              return (
                <Row key={r._id}>
                  <DateCell>{fmtDay(r.date)}</DateCell>
                  <RouteCell>{`${from} → ${to}`}</RouteCell>
                  <WithCell>{withWho}</WithCell>
                  <FareCell>{r.fare ? `$${r.fare}` : "—"}</FareCell>
                </Row>
              );
            })}
          </Table>
        )}
      </Inner>
    </Page>
  );
};

MobileMyRides.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default withRouter(MobileMyRides);
