import React, { useEffect, useMemo, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Places } from "../../../api/places/Places";
import {
  parseCoords,
  estimateRoute,
  estimateRouteVia,
  formatDuration,
  formatDistance,
} from "../../../api/ride/routeEstimate";
import Icon from "../../components/Icon";
import MapView from "../../components/MapView";
import LoadingPage from "../../components/LoadingPage";
import {
  Screen,
  MapPane,
  RouteChip,
  Panel,
  PanelHead,
  HeadText,
  Eyebrow,
  PanelTitle,
  Mark,
  CloseBtn,
  PanelBody,
  RouteCard,
  RouteRow,
  Indicator,
  OriginDot,
  IndicatorBar,
  DestSquare,
  RouteFields,
  FieldRow,
  FieldLabel,
  FieldSelect,
  SwapBtn,
  QuickChipRow,
  QuickChip,
  StopList,
  StopRow,
  StopIndex,
  StopName,
  StopBtn,
  Group,
  GroupLabel,
  WhenRow,
  DateField,
  TimeField,
  PlainInput,
  StepperRow,
  StepperCol,
  StepperBox,
  StepBtn,
  StepCenter,
  StepValue,
  StepCaption,
  FairNote,
  NoteBox,
  Hint,
  ErrorMessage,
  Footer,
  PostBtn,
  Notice,
  NoticeBtn,
} from "../styles/CreateRide";

/* RidesSchema bounds. Keeping the UI inside them means the stepper can never
 * build a payload the server will reject. */
const MIN_SEATS = 1;
const MAX_SEATS = 7;
const MIN_FARE = 0;
const MAX_FARE = 100;
const MAX_NOTES = 200;

/* Cost-share reference: a per-seat contribution at or below this per-mile
 * rate is labelled a fair split of trip costs. Not a fare (Terms s.10). */
const FAIR_RATE_PER_MI = 0.33;

/* Saved-place shortcut chips shown under the route card. */
const MAX_QUICK_PLACES = 3;

const pointOf = (place) => {
  if (!place) return null;
  const coords = parseCoords(place.value);
  return coords ? { ...coords, label: place.text } : null;
};

/**
 * Offer a ride — map-first create screen (design handoff "Offer a ride" V1).
 * A real Leaflet map fills the screen behind a glass form panel; origin and
 * destination come from the user's places (places.options) and the route
 * preview uses the same estimator rides.create denormalises onto the ride.
 */
const CreateRide = ({ history }) => {
  const { ready, places, userId } = useTracker(() => {
    const sub = Meteor.subscribe("places.options");
    return {
      ready: sub.ready(),
      places: Places.find({}, { sort: { text: 1 } }).fetch(),
      userId: Meteor.userId(),
    };
  }, []);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(3);
  const [fare, setFare] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Local date, not UTC -- toISOString() shifts the calendar day for anyone
   * west of UTC in the evening, letting them pick a "today" the server (and
   * everyone east of them) sees as tomorrow. */
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  /* Parsed once per places change instead of on every mapPoints/byId call. */
  const pointsByPlaceId = useMemo(() => {
    const map = new Map();
    places.forEach(p => map.set(p._id, pointOf(p)));
    return map;
  }, [places]);

  /* MapView re-adds its tile layer whenever this array's identity changes, so
   * it must not be rebuilt on every keystroke. */
  const mapPoints = useMemo(() => {
    const byId = id => pointsByPlaceId.get(id);
    const picked = [origin, ...waypoints, destination].map(byId).filter(Boolean);
    if (picked.length > 0) return picked;
    return [...pointsByPlaceId.values()].filter(Boolean);
  }, [origin, destination, waypoints, pointsByPlaceId]);

  const route = useMemo(() => {
    const from = places.find(p => p._id === origin);
    const to = places.find(p => p._id === destination);
    if (!from || !to || from._id === to._id) return null;
    if (waypoints.length === 0) return estimateRoute(from.value, to.value);

    /* Follow the stops in order, so the figure shown matches the one the
     * server will store. */
    const values = [from, ...waypoints.map(id => places.find(p => p._id === id)), to]
      .map(place => place && place.value);
    return estimateRouteVia(values) || estimateRoute(from.value, to.value);
  }, [origin, destination, waypoints, places]);

  /* A place cannot be both an end of the route and a stop on it, so picking it
   * as origin or destination drops it from the stops. */
  useEffect(() => {
    setWaypoints(prev => prev.filter(id => id !== origin && id !== destination));
  }, [origin, destination]);

  const stopOptions = useMemo(
    () => places.filter(p => p._id !== origin
      && p._id !== destination
      && !waypoints.includes(p._id)),
    [places, origin, destination, waypoints],
  );

  const addStop = (id) => {
    if (!id) return;
    setWaypoints(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeStop = id => setWaypoints(prev => prev.filter(stop => stop !== id));

  const moveStop = (index, delta) => setWaypoints((prev) => {
    const target = index + delta;
    if (target < 0 || target >= prev.length) return prev;
    const next = [...prev];
    next[index] = prev[target];
    next[target] = prev[index];
    return next;
  });

  const nameOf = id => (places.find(p => p._id === id) || {}).text || "Unknown place";

  /* places.options also carries places merely used in the user's rides; only
   * the ones they created are theirs to offer as shortcuts. */
  const quickPlaces = useMemo(
    () => places.filter(p => p.createdBy === userId).slice(0, MAX_QUICK_PLACES),
    [places, userId],
  );

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const applyQuickPlace = (id) => {
    if (origin === id) {
      setOrigin("");
    } else if (destination === id) {
      setDestination("");
    } else if (!origin) {
      setOrigin(id);
    } else {
      setDestination(id);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!origin || !destination) {
      setError("Pick an origin and a destination.");
      return;
    }
    if (origin === destination) {
      setError("Origin and destination must be different.");
      return;
    }
    if (!date || !time) {
      setError("Pick a date and time.");
      return;
    }
    const when = new Date(`${date}T${time}:00`);
    if (when <= new Date()) {
      setError("Pick a future date and time.");
      return;
    }
    const me = Meteor.userId();
    if (!me) {
      setError("You must be logged in to offer a ride.");
      return;
    }
    setSubmitting(true);
    Meteor.call("rides.create", {
      driver: me,
      riders: [],
      origin,
      destination,
      waypoints,
      date: when,
      seats: Number(seats),
      fare: Number(fare) || 0,
      notes: notes.trim(),
      createdAt: new Date(),
    }, (err) => {
      setSubmitting(false);
      if (err) {
        setError(err.reason || err.message || "Could not create the ride.");
      } else {
        history.push("/my-rides");
      }
    });
  };

  if (!ready) return <LoadingPage message="Loading..." />;

  const head = (
    <PanelHead>
      <HeadText>
        <Eyebrow>OFFER A RIDE</Eyebrow>
        <PanelTitle>
          <Mark>Where</Mark>
          {" are you headed?"}
        </PanelTitle>
      </HeadText>
      <CloseBtn type="button" aria-label="Close" onClick={() => history.goBack()}>
        <Icon name="close" size={16} />
      </CloseBtn>
    </PanelHead>
  );

  if (places.length === 0) {
    return (
      <Screen>
        <MapPane>
          <MapView coordinates={mapPoints} />
        </MapPane>
        <Panel as="div" className="fade-in">
          {head}
          <PanelBody>
            <Notice>
              You have no saved places yet. Add your pickup and drop-off spots in
              Places first, then come back to post a ride.
            </Notice>
            <NoticeBtn type="button" onClick={() => history.push("/places")}>
              Add a place
              <Icon name="arrow" size={14} />
            </NoticeBtn>
          </PanelBody>
        </Panel>
      </Screen>
    );
  }

  const ratePerMi = route && route.distanceMi > 0 ? fare / route.distanceMi : null;
  const isFairRate = ratePerMi !== null && ratePerMi <= FAIR_RATE_PER_MI;

  /* Both halves have to format, or the pill would advertise a blank figure. */
  const routeDuration = route && formatDuration(route.durationMin);
  const routeDistance = route && formatDistance(route.distanceMi);

  return (
    <Screen>
      <MapPane>
        {/* Real Leaflet map. Markers are the chosen pickup and drop-off places,
            or every saved place until both ends are picked. */}
        <MapView coordinates={mapPoints} />

        {routeDuration && routeDistance && (
          <RouteChip>
            <Icon name="car" size={16} color="var(--signal-yellow)" />
            {`Est. route — ${routeDuration} · ${routeDistance}`}
          </RouteChip>
        )}
      </MapPane>

      <Panel className="fade-in" onSubmit={submit}>
        {head}

        <PanelBody>
          <RouteCard>
            <RouteRow>
              <Indicator>
                <OriginDot />
                <IndicatorBar />
                <DestSquare />
              </Indicator>
              <RouteFields>
                <FieldRow $divided>
                  <FieldLabel htmlFor="create-from">FROM</FieldLabel>
                  <FieldSelect
                    id="create-from"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                  >
                    <option value="">Select origin</option>
                    {places.map(p => (
                      <option key={p._id} value={p._id}>{p.text}</option>
                    ))}
                  </FieldSelect>
                </FieldRow>
                <FieldRow>
                  <FieldLabel htmlFor="create-to">TO</FieldLabel>
                  <FieldSelect
                    id="create-to"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                  >
                    <option value="">Select destination</option>
                    {places.map(p => (
                      <option key={p._id} value={p._id}>{p.text}</option>
                    ))}
                  </FieldSelect>
                </FieldRow>
              </RouteFields>
              <SwapBtn
                type="button"
                onClick={swap}
                aria-label="Reverse origin and destination"
              >
                <Icon name="arrowDown" size={14} />
              </SwapBtn>
            </RouteRow>

            {quickPlaces.length > 0 && (
              <QuickChipRow>
                {quickPlaces.map(p => (
                  <QuickChip
                    key={p._id}
                    type="button"
                    $active={p._id === origin || p._id === destination}
                    onClick={() => applyQuickPlace(p._id)}
                  >
                    {`Saved · ${p.text}`}
                  </QuickChip>
                ))}
              </QuickChipRow>
            )}
          </RouteCard>

          <Group>
            <GroupLabel as="label" htmlFor="create-stop">STOPS ALONG THE WAY</GroupLabel>
            {waypoints.length > 0 && (
              <StopList>
                {waypoints.map((id, index) => (
                  <StopRow key={id}>
                    <StopIndex>{index + 1}</StopIndex>
                    <StopName>{nameOf(id)}</StopName>
                    <StopBtn
                      type="button"
                      onClick={() => moveStop(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${nameOf(id)} earlier`}
                    >
                      &#9650;
                    </StopBtn>
                    <StopBtn
                      type="button"
                      onClick={() => moveStop(index, 1)}
                      disabled={index === waypoints.length - 1}
                      aria-label={`Move ${nameOf(id)} later`}
                    >
                      &#9660;
                    </StopBtn>
                    <StopBtn
                      type="button"
                      $danger
                      onClick={() => removeStop(id)}
                      aria-label={`Remove ${nameOf(id)}`}
                    >
                      &#10005;
                    </StopBtn>
                  </StopRow>
                ))}
              </StopList>
            )}
            <FieldSelect
              id="create-stop"
              value=""
              onChange={e => addStop(e.target.value)}
              disabled={stopOptions.length === 0}
            >
              <option value="">
                {stopOptions.length > 0 ? "Add a stop…" : "No other places to stop at"}
              </option>
              {stopOptions.map(p => (
                <option key={p._id} value={p._id}>{p.text}</option>
              ))}
            </FieldSelect>
            <Hint>Optional. The estimate follows the stops in the order shown.</Hint>
          </Group>

          <Group>
            <GroupLabel as="label" htmlFor="create-date">WHEN</GroupLabel>
            <WhenRow>
              <DateField>
                <Icon name="clock" size={15} color="var(--ink-3)" />
                <PlainInput
                  id="create-date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </DateField>
              <TimeField>
                <PlainInput
                  type="time"
                  aria-label="Departure time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                />
              </TimeField>
            </WhenRow>
          </Group>

          <StepperRow>
            <StepperCol>
              <GroupLabel>SEATS</GroupLabel>
              <StepperBox>
                <StepBtn
                  type="button"
                  aria-label="One seat fewer"
                  disabled={seats <= MIN_SEATS}
                  onClick={() => setSeats(s => Math.max(MIN_SEATS, s - 1))}
                >
                  &minus;
                </StepBtn>
                <StepCenter>
                  <StepValue>{seats}</StepValue>
                  <StepCaption>OPEN SEATS</StepCaption>
                </StepCenter>
                <StepBtn
                  type="button"
                  aria-label="One seat more"
                  disabled={seats >= MAX_SEATS}
                  onClick={() => setSeats(s => Math.min(MAX_SEATS, s + 1))}
                >
                  <Icon name="plus" size={14} />
                </StepBtn>
              </StepperBox>
            </StepperCol>

            <StepperCol>
              <GroupLabel>COST SHARE / SEAT</GroupLabel>
              <StepperBox>
                <StepBtn
                  type="button"
                  aria-label="One dollar less"
                  disabled={fare <= MIN_FARE}
                  onClick={() => setFare(f => Math.max(MIN_FARE, f - 1))}
                >
                  &minus;
                </StepBtn>
                <StepCenter>
                  <StepValue>{`$${fare}`}</StepValue>
                  <StepCaption>FUEL SPLIT</StepCaption>
                </StepCenter>
                <StepBtn
                  type="button"
                  aria-label="One dollar more"
                  disabled={fare >= MAX_FARE}
                  onClick={() => setFare(f => Math.min(MAX_FARE, f + 1))}
                >
                  <Icon name="plus" size={14} />
                </StepBtn>
              </StepperBox>
              {ratePerMi !== null && (
                <FairNote $fair={isFairRate}>
                  <Icon name="leaf" size={11} />
                  {isFairRate
                    ? `Fair split — $${ratePerMi.toFixed(2)}/mi`
                    : `Above a fair split — $${ratePerMi.toFixed(2)}/mi`}
                </FairNote>
              )}
            </StepperCol>
          </StepperRow>

          <Group>
            <GroupLabel as="label" htmlFor="create-notes">
              NOTE TO RIDERS · OPTIONAL
            </GroupLabel>
            <NoteBox
              id="create-notes"
              rows="3"
              maxLength={MAX_NOTES}
              placeholder="Going home for fall break - happy to take 2 more, can swing by Allston."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <Hint>{`${notes.length}/${MAX_NOTES}`}</Hint>
          </Group>
        </PanelBody>

        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

        <Footer>
          <PostBtn type="submit" disabled={submitting}>
            {submitting
              ? "Posting…"
              : `Post ride · ${seats} seat${seats === 1 ? "" : "s"}`}
            <Icon name="arrow" size={15} color="var(--ink-1)" />
          </PostBtn>
        </Footer>
      </Panel>
    </Screen>
  );
};

CreateRide.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
    goBack: PropTypes.func,
  }).isRequired,
};

export default withRouter(CreateRide);
