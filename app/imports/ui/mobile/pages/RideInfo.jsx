import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Chats } from "../../../api/chat/Chat";
import { Profiles } from "../../../api/profile/Profile";
import RouteMapView from "../../components/RouteMapView";
import MapBg from "../../components/MapBg";
import { estimateRoute, formatDuration, formatDistance } from "../../../api/ride/routeEstimate";
import Avatar from "../../components/Avatar";
import Icon from "../../components/Icon";
import LoadingPage from "../../components/LoadingPage";
import BackButton from "../components/BackButton";
import {
  Page,
  Inner,
  Breadcrumb,
  Crumb,
  CrumbCurrent,
  HeroGrid,
  HeroCard,
  MapWrap,
  RoutePill,
  HeroBody,
  Eyebrow,
  RouteTitle,
  Mark,
  NoteText,
  DataRow,
  DataCell,
  MetaLabel,
  MonoValue,
  FareValue,
  Seats,
  SeatDot,
  Actions,
  PrimaryBtn,
  GhostBtn,
  ErrorNote,
  SideCol,
  Card,
  CardHead,
  CardTitle,
  SeatCount,
  DriverRow,
  DriverName,
  DriverMeta,
  StatRow,
  CredBox,
  CredRow,
  CredKey,
  CredValue,
  RiderList,
  PersonRow,
  PersonName,
  PersonSub,
  OpenSeatRow,
  OpenSeatIcon,
  OpenSeatLabel,
  HeadsUp,
  HeadsUpText,
  ItinCard,
  ItinRow,
  ItinStep,
  StepTile,
  StepTime,
  StepLabel,
  StepSub,
  StepConnector,
  ChatCard,
  ChatHead,
  Bubbles,
  Bubble,
  Composer,
  ComposerInput,
  SendBtn,
  Centered,
  ErrorTitle,
  ErrorBody,
} from "../styles/RideInfo";

const MS_PER_MINUTE = 60000;

const parseCoord = (value) => {
  if (!value) return null;
  const [lat, lng] = value.split(",").map(v => parseFloat(v.trim()));
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

/* Deterministic pastel hue from the driver/rider id, matching RideCard so a
 * person keeps one colour from the discovery card through to this screen. */
const hueFor = (seed) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  return h;
};

const fmtTime = date => date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** "DEPARTS IN 2 DAYS" / "DEPARTS IN 40 MIN" / "DEPARTED". */
const relativeDeparture = (d) => {
  const diffMinutes = Math.round((d.getTime() - Date.now()) / MS_PER_MINUTE);
  if (diffMinutes <= 0) return "departed";
  if (diffMinutes < 60) return `departs in ${diffMinutes} min`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `departs in ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `departs in ${days} day${days === 1 ? "" : "s"}`;
};

/** "FRIDAY · OCT 24 · DEPARTS IN 2 DAYS" */
const fmtEyebrow = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const dayMonth = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${weekday} · ${dayMonth} · ${relativeDeparture(d)}`.toUpperCase();
};

const RideInfo = ({ match, history }) => {
  const rideId = match.params.rideId;
  const me = Meteor.userId();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [draft, setDraft] = useState("");
  const [credentials, setCredentials] = useState(null);

  const fetchRide = () => Meteor.callAsync("rides.getById", rideId);

  useEffect(() => {
    let active = true;
    fetchRide()
      .then((r) => {
        if (!active) return;
        setRide(r);
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(e.reason || e.message || "Could not load ride.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [rideId]);

  // Verification flags + rides-driven count for the driver sidecard. These only
  // gate two optional rows, so a failure hides them instead of surfacing as a
  // page error, and the call never blocks the first paint.
  useEffect(() => {
    let active = true;
    Meteor.callAsync("rides.driverCredentials", rideId)
      .then((c) => {
        if (active) setCredentials(c);
      })
      .catch(() => {
        if (active) setCredentials(null);
      });
    return () => {
      active = false;
    };
  }, [rideId]);

  const isParticipant = !!ride
    && (ride.driver === me || (ride.riders || []).includes(me));

  const { profileById, myMajor, chat } = useTracker(() => {
    Meteor.subscribe("userProfile");
    const mine = Profiles.findOne({ Owner: me });
    const major = (mine && mine.major) || "";
    if (!ride) return { profileById: {}, myMajor: major, chat: null };

    const ids = [ride.driver, ...(ride.riders || [])].filter(Boolean);
    Meteor.subscribe("profiles.displayNames", ids);
    const map = {};
    Profiles.find({ Owner: { $in: ids } }).forEach((p) => {
      map[p.Owner] = { name: p.Name, year: p.year, major: p.major };
    });
    let doc = null;
    if (isParticipant) {
      Meteor.subscribe("chats.forRide", rideId);
      doc = Chats.findOne({ rideId });
    }
    return { profileById: map, myMajor: major, chat: doc };
  }, [ride, rideId, isParticipant, me]);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    try {
      await Meteor.callAsync("rides.join", rideId);
      const r = await fetchRide();
      setRide(r);
      setShowChat(true);
    } catch (err) {
      setError(err.reason || err.message || "Could not join ride.");
    } finally {
      setJoining(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    try {
      let chatId = chat && chat._id;
      if (!chatId) chatId = await Meteor.callAsync("chats.createForRide", rideId);
      await Meteor.callAsync("chats.sendMessage", chatId, text);
    } catch (err) {
      setError(err.reason || err.message || "Could not send message.");
      setDraft(text);
    }
  };

  if (loading) return <LoadingPage message="Loading ride..." />;

  if (!ride) {
    return (
      <Page>
        <Inner>
          <BackButton />
          <Centered>
            <ErrorTitle>Ride not found</ErrorTitle>
            <ErrorBody>{error || "This ride doesn't exist or isn't at your school."}</ErrorBody>
          </Centered>
        </Inner>
      </Page>
    );
  }

  const totalSeats = ride.seats || 0;
  const riders = ride.riders || [];
  const seatsLeft = Math.max(0, totalSeats - riders.length);
  const from = ride.originText || ride.origin || "Unknown";
  const to = ride.destinationText || ride.destination || "Unknown";
  const start = parseCoord(ride.originCoords);
  const end = parseCoord(ride.destinationCoords);

  const driver = profileById[ride.driver] || {};
  const driverName = driver.name || "Driver";
  const driverSub = [driver.year, driver.major].filter(Boolean).join(" · ");

  // The one affinity signal this app models: a shared major.
  const sharesMajor = Boolean(myMajor)
    && Boolean(driver.major)
    && ride.driver !== me
    && myMajor.trim().toLowerCase() === driver.major.trim().toLowerCase();

  const credLabel = credentials
    ? [credentials.verified ? ".edu" : null, credentials.identityVerified ? "ID" : null]
      .filter(Boolean)
      .join(" + ")
    : "";

  // Prefer the denormalised figures; fall back to the same estimate the
  // discovery query uses so older rides still show a route summary.
  const routeFallback = ride.distanceMi === undefined
    ? estimateRoute(ride.originCoords, ride.destinationCoords)
    : null;
  const durationMin = ride.durationMin ?? (routeFallback && routeFallback.durationMin);
  const distanceMi = ride.distanceMi ?? (routeFallback && routeFallback.distanceMi);
  const driveTime = formatDuration(durationMin);
  const driveDistance = formatDistance(distanceMi);
  const routeSummary = [driveTime, driveDistance].filter(Boolean).join(" · ");

  const departAt = new Date(ride.date);
  const departValid = !Number.isNaN(departAt.getTime());
  const arriveAt = departValid && Number.isFinite(durationMin)
    ? new Date(departAt.getTime() + durationMin * MS_PER_MINUTE)
    : null;

  let actionNode;
  if (isParticipant) {
    actionNode = (
      <GhostBtn type="button" onClick={() => setShowChat(s => !s)}>
        <Icon name="chat" size={14} />
        {showChat ? "Hide chat" : "Open chat"}
      </GhostBtn>
    );
  } else if (seatsLeft > 0) {
    actionNode = (
      <PrimaryBtn type="button" onClick={handleJoin} $disabled={joining}>
        {joining ? "Requesting..." : "Request a seat"}
        <Icon name="arrow" size={15} color="var(--ink-1)" />
      </PrimaryBtn>
    );
  } else {
    actionNode = <PrimaryBtn type="button" $disabled>Ride full</PrimaryBtn>;
  }

  const messages = (chat && chat.Messages) || [];

  /* Three steps built from what the schema actually carries: this app models a
   * single origin -> destination leg, with no intermediate stops. */
  const steps = [
    {
      icon: "pin",
      time: departValid ? fmtTime(departAt) : "",
      label: from,
      sub: "Meet your driver here",
    },
  ];
  if (driveTime || driveDistance) {
    steps.push({
      icon: "car",
      time: driveTime || "",
      label: driveDistance ? `${driveDistance} on the road` : "On the road",
      sub: ride.routeEstimated || routeFallback ? "Estimated drive time" : "Drive time",
    });
  }
  steps.push({
    icon: "check",
    time: arriveAt ? fmtTime(arriveAt) : "",
    label: to,
    sub: "Drop-off",
  });

  return (
    <Page>
      <Inner className="fade-in">
        <BackButton />

        <Breadcrumb aria-label="Breadcrumb">
          <Crumb type="button" onClick={() => history.push("/my-rides")}>My rides</Crumb>
          <Icon name="chevR" size={12} />
          <CrumbCurrent>{ride.shareCode ? `#${ride.shareCode}` : to}</CrumbCurrent>
        </Breadcrumb>

        <HeroGrid>
          <HeroCard>
            <MapWrap>
              {start && end ? (
                <RouteMapView startCoord={start} endCoord={end} height="100%" />
              ) : (
                <MapBg />
              )}
              {routeSummary && (
                <RoutePill>
                  <Icon name="car" size={13} />
                  {routeSummary}
                </RoutePill>
              )}
            </MapWrap>
            <HeroBody>
              <Eyebrow>{fmtEyebrow(ride.date)}</Eyebrow>
              <RouteTitle>
                {from} → <Mark>{to}</Mark>
              </RouteTitle>
              {ride.notes ? <NoteText>{`“${ride.notes}”`}</NoteText> : null}

              <DataRow>
                {departValid && (
                  <DataCell>
                    <MetaLabel>DEPART</MetaLabel>
                    <MonoValue>{fmtTime(departAt)}</MonoValue>
                  </DataCell>
                )}
                {arriveAt && (
                  <DataCell>
                    <MetaLabel>ARRIVE</MetaLabel>
                    <MonoValue>{fmtTime(arriveAt)}</MonoValue>
                  </DataCell>
                )}
                <DataCell>
                  <MetaLabel>FARE</MetaLabel>
                  <FareValue>{ride.fare ? `$${ride.fare} / seat` : "Free"}</FareValue>
                </DataCell>
                <DataCell>
                  <MetaLabel>SEATS LEFT</MetaLabel>
                  <Seats>
                    {Array.from({ length: totalSeats }).map((_, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <SeatDot key={i} $filled={i < seatsLeft}>
                        <Icon name="seat" size={18} />
                      </SeatDot>
                    ))}
                  </Seats>
                </DataCell>
              </DataRow>

              <Actions>{actionNode}</Actions>
              {error ? <ErrorNote>{error}</ErrorNote> : null}
            </HeroBody>
          </HeroCard>

          <SideCol>
            <Card>
              <CardHead>
                <CardTitle>YOUR DRIVER</CardTitle>
              </CardHead>
              <DriverRow>
                <Avatar user={{ name: driverName, hue: hueFor(ride.driver || driverName) }} size={54} />
                <div>
                  <DriverName>{driverName}</DriverName>
                  {driverSub ? <DriverMeta>{driverSub}</DriverMeta> : null}
                  {credentials && credentials.ridesDriven > 0 ? (
                    <StatRow>{`${credentials.ridesDriven} rides`}</StatRow>
                  ) : null}
                </div>
              </DriverRow>
              {credLabel ? (
                <CredBox>
                  <CredRow>
                    <CredKey>Verified</CredKey>
                    <CredValue>
                      <Icon name="check" size={12} color="var(--leaf)" strokeWidth={2.6} />
                      {credLabel}
                    </CredValue>
                  </CredRow>
                </CredBox>
              ) : null}
            </Card>

            <Card>
              <CardHead>
                <CardTitle>RIDING WITH</CardTitle>
                <SeatCount>{`${riders.length}/${totalSeats} seats`}</SeatCount>
              </CardHead>
              <RiderList>
                {riders.map((id) => {
                  const rider = profileById[id] || {};
                  const name = rider.name || "Rider";
                  const sub = [rider.year, rider.major].filter(Boolean).join(" · ");
                  return (
                    <PersonRow key={id}>
                      <Avatar user={{ name, hue: hueFor(id) }} size={32} />
                      <div>
                        <PersonName>{name}</PersonName>
                        {sub ? <PersonSub>{sub}</PersonSub> : null}
                      </div>
                    </PersonRow>
                  );
                })}
                {seatsLeft > 0 ? (
                  <OpenSeatRow>
                    <OpenSeatIcon>
                      <Icon name="plus" size={14} color="var(--ink-3)" />
                    </OpenSeatIcon>
                    <OpenSeatLabel>
                      {`${seatsLeft} open seat${seatsLeft === 1 ? "" : "s"}`}
                    </OpenSeatLabel>
                  </OpenSeatRow>
                ) : null}
              </RiderList>
            </Card>

            {sharesMajor ? (
              <HeadsUp>
                <Icon name="sparkle" size={18} color="var(--signal-yellow-deep)" />
                <HeadsUpText>
                  <strong>Heads-up:</strong>
                  {` ${driverName} is also in ${driver.major}.`}
                </HeadsUpText>
              </HeadsUp>
            ) : null}
          </SideCol>
        </HeroGrid>

        <ItinCard>
          <CardHead>
            <CardTitle>ITINERARY</CardTitle>
          </CardHead>
          <ItinRow>
            {steps.map((step, i) => (
              <React.Fragment key={step.icon}>
                <ItinStep>
                  <StepTile $first={i === 0}>
                    <Icon name={step.icon} size={18} color="var(--ink-1)" />
                  </StepTile>
                  {step.time ? <StepTime>{step.time}</StepTime> : null}
                  <StepLabel>{step.label}</StepLabel>
                  <StepSub>{step.sub}</StepSub>
                </ItinStep>
                {i < steps.length - 1 ? <StepConnector /> : null}
              </React.Fragment>
            ))}
          </ItinRow>
        </ItinCard>

        {isParticipant && showChat ? (
          <ChatCard>
            <ChatHead>
              <Eyebrow>{`RIDE CHAT · ${riders.length + 1} MEMBERS`}</Eyebrow>
            </ChatHead>
            <Bubbles>
              {messages.map((m, i) => (
                <Bubble
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  $mine={m.Sender === me}
                  $system={m.Sender === "System"}
                >
                  {m.Content}
                </Bubble>
              ))}
            </Bubbles>
            <Composer onSubmit={handleSend}>
              <ComposerInput
                type="text"
                placeholder="Message the ride..."
                value={draft}
                onChange={e => setDraft(e.target.value)}
              />
              <SendBtn type="submit" aria-label="Send">
                <Icon name="send" size={16} color="var(--ink-1)" />
              </SendBtn>
            </Composer>
          </ChatCard>
        ) : null}
      </Inner>
    </Page>
  );
};

RideInfo.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({ rideId: PropTypes.string }),
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default withRouter(RideInfo);
