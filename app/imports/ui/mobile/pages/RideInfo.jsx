import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Chats } from "../../../api/chat/Chat";
import { Profiles } from "../../../api/profile/Profile";
import RouteMapView from "../../components/RouteMapView";
import MapBg from "../../components/MapBg";
import Avatar from "../../components/Avatar";
import Icon from "../../components/Icon";
import LoadingPage from "../../components/LoadingPage";
import BackButton from "../components/BackButton";
import {
  Page,
  Inner,
  HeroCard,
  MapWrap,
  HeroBody,
  Eyebrow,
  RouteTitle,
  Mark,
  MetaRow,
  MetaItem,
  MetaLabel,
  MetaValue,
  Seats,
  SeatDot,
  Actions,
  PrimaryBtn,
  GhostBtn,
  SideGrid,
  Card,
  CardTitle,
  PersonRow,
  PersonName,
  PersonSub,
  NotesCard,
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

const parseCoord = (value) => {
  if (!value) return null;
  const [lat, lng] = value.split(",").map(v => parseFloat(v.trim()));
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

const fmtWhen = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
};

const RideInfo = ({ match }) => {
  const rideId = match.params.rideId;
  const me = Meteor.userId();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [draft, setDraft] = useState("");

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

  const isParticipant = !!ride
    && (ride.driver === me || (ride.riders || []).includes(me));

  const { nameById, chat } = useTracker(() => {
    if (!ride) return { nameById: {}, chat: null };
    const ids = [ride.driver, ...(ride.riders || [])].filter(Boolean);
    Meteor.subscribe("profiles.displayNames", ids);
    const map = {};
    Profiles.find({ Owner: { $in: ids } }).forEach((p) => {
      map[p.Owner] = p.Name;
    });
    let doc = null;
    if (isParticipant) {
      Meteor.subscribe("chats.forRide", rideId);
      doc = Chats.findOne({ rideId });
    }
    return { nameById: map, chat: doc };
  }, [ride, rideId, isParticipant]);

  const handleJoin = async () => {
    setJoining(true);
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
  const seatsLeft = Math.max(0, totalSeats - (ride.riders ? ride.riders.length : 0));
  const from = ride.originText || ride.origin || "Unknown";
  const to = ride.destinationText || ride.destination || "Unknown";
  const driverName = nameById[ride.driver] || "Driver";
  const start = parseCoord(ride.originCoords);
  const end = parseCoord(ride.destinationCoords);
  const riders = ride.riders || [];

  let actionNode;
  if (isParticipant) {
    actionNode = (
      <GhostBtn type="button" onClick={() => setShowChat(s => !s)}>
        <Icon name="chat" size={16} />
        {showChat ? "Hide chat" : "Open chat"}
      </GhostBtn>
    );
  } else if (seatsLeft > 0) {
    actionNode = (
      <PrimaryBtn type="button" onClick={handleJoin} $disabled={joining}>
        <Icon name="check" size={16} color="var(--ink-1)" />
        {joining ? "Requesting..." : "Request a seat"}
      </PrimaryBtn>
    );
  } else {
    actionNode = <PrimaryBtn type="button" $disabled>Ride full</PrimaryBtn>;
  }

  let ridersNode;
  if (riders.length === 0) {
    ridersNode = <PersonSub>{`No riders yet — ${seatsLeft} open`}</PersonSub>;
  } else {
    ridersNode = riders.map(id => (
      <PersonRow key={id}>
        <Avatar user={{ name: nameById[id] || "Rider", hue: 200 }} size={28} />
        <PersonName>{nameById[id] || "Rider"}</PersonName>
      </PersonRow>
    ));
  }

  const messages = (chat && chat.Messages) || [];

  return (
    <Page>
      <Inner>
        <BackButton />

        <HeroCard>
          <MapWrap>
            {start && end ? (
              <RouteMapView startCoord={start} endCoord={end} height="100%" />
            ) : (
              <MapBg />
            )}
          </MapWrap>
          <HeroBody>
            <Eyebrow>{fmtWhen(ride.date)}</Eyebrow>
            <RouteTitle>
              {from} → <Mark>{to}</Mark>
            </RouteTitle>
            <MetaRow>
              <MetaItem>
                <MetaLabel>FARE</MetaLabel>
                <MetaValue>{ride.fare ? `$${ride.fare}` : "Free"}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>SEATS</MetaLabel>
                <Seats>
                  {Array.from({ length: totalSeats }).map((_, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <SeatDot key={i} $filled={i < seatsLeft}>
                      <Icon name="seat" size={18} />
                    </SeatDot>
                  ))}
                </Seats>
              </MetaItem>
              <MetaItem>
                <MetaLabel>DRIVER</MetaLabel>
                <MetaValue>{driverName}</MetaValue>
              </MetaItem>
            </MetaRow>
            <Actions>{actionNode}</Actions>
          </HeroBody>
        </HeroCard>

        <SideGrid>
          <Card>
            <CardTitle>DRIVER</CardTitle>
            <PersonRow>
              <Avatar user={{ name: driverName, hue: 38 }} size={36} />
              <div>
                <PersonName>{driverName}</PersonName>
                <PersonSub>Driving this ride</PersonSub>
              </div>
            </PersonRow>
          </Card>
          <Card>
            <CardTitle>{`RIDERS · ${riders.length}/${totalSeats}`}</CardTitle>
            {ridersNode}
          </Card>
        </SideGrid>

        {ride.notes ? <NotesCard>{ride.notes}</NotesCard> : null}

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
};

export default withRouter(RideInfo);
