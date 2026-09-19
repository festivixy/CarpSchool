import React, {
  useState, useEffect, useMemo,
} from "react";
import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import swal from "sweetalert";
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
  Seats,
  SeatDot,
  Actions,
  PrimaryBtn,
  GhostBtn,
  ErrorNote,
  SuccessNote,
  StatusPill,
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
  RemoveBtn,
  ShareCodeValue,
  EditForm,
  EditField,
  EditInput,
  EditTextarea,
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
import { hueFor } from "../../utils/avatarHue";

const MS_PER_MINUTE = 60000;

const parseCoord = (value) => {
  if (!value) return null;
  const [lat, lng] = value.split(",").map(v => parseFloat(v.trim()));
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
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

/* Ride.status display text, when the schema carries a status field. */
const STATUS_LABELS = {
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

/* "YYYY-MM-DDTHH:mm" for a datetime-local input, in local time. */
const toDatetimeLocal = (d) => {
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const RideInfo = ({ match, history }) => {
  const rideId = match.params.rideId;
  const me = Meteor.userId();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [draft, setDraft] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [removingRiderId, setRemovingRiderId] = useState(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const fetchRide = () => Meteor.callAsync("rides.getById", rideId);

  // Reset stale state from the previous ride before loading the new one, so a
  // navigation from one ride detail to another never flashes the old ride's
  // data, loading state, or error under the new route param.
  useEffect(() => {
    let active = true;
    setRide(null);
    setLoading(true);
    setError(null);
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

  const { profileById, myMajor, chat, chatReady } = useTracker(() => {
    Meteor.subscribe("userProfile");
    const mine = Profiles.findOne({ Owner: me });
    const major = (mine && mine.major) || "";
    if (!ride) return { profileById: {}, myMajor: major, chat: null, chatReady: false };

    const ids = [ride.driver, ...(ride.riders || [])].filter(Boolean);
    Meteor.subscribe("profiles.displayNames", ids);
    const map = {};
    Profiles.find({ Owner: { $in: ids } }).forEach((p) => {
      map[p.Owner] = { name: p.Name, year: p.year, major: p.major };
    });
    let doc = null;
    let ready = false;
    if (isParticipant) {
      const sub = Meteor.subscribe("chats.forRide", rideId);
      ready = sub.ready();
      doc = Chats.findOne({ rideId });
    }
    return {
      profileById: map, myMajor: major, chat: doc, chatReady: ready,
    };
  }, [ride, rideId, isParticipant, me]);

  // Coordinate objects for the map. parseCoord builds a new object on every
  // call, so these are keyed on the raw "lat,lng" strings rather than on
  // `ride` itself - typing in the edit form re-renders this component, but it
  // does not change the ride's coordinates, so the map must not rebuild.
  const start = useMemo(
    () => parseCoord(ride && ride.originCoords),
    [ride && ride.originCoords],
  );
  const end = useMemo(
    () => parseCoord(ride && ride.destinationCoords),
    [ride && ride.destinationCoords],
  );

  const handleJoin = async () => {
    if (joining) return;
    setJoining(true);
    setError(null);
    try {
      await Meteor.callAsync("rides.join", rideId);
      const r = await fetchRide();
      setRide(r);
      setShowChat(true);
      setJoinSuccess(true);
    } catch (err) {
      setError(err.reason || err.message || "Could not join ride.");
      try {
        const r = await fetchRide();
        setRide(r);
      } catch (refreshErr) {
        // The join error already surfaced above; a failed refresh just
        // leaves the previous ride state in place.
      }
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (leaving) return;
    setLeaving(true);
    setError(null);
    try {
      await Meteor.callAsync("rides.leave", rideId);
      const r = await fetchRide();
      setRide(r);
    } catch (err) {
      setError(err.reason || err.message || "Could not leave ride.");
    } finally {
      setLeaving(false);
    }
  };

  const handleCancel = () => {
    swal({
      title: "Cancel this ride?",
      text: "This notifies all riders and can't be undone.",
      icon: "warning",
      buttons: ["Keep", "Cancel ride"],
      dangerMode: true,
    }).then(async (yes) => {
      if (!yes) return;
      setCancelling(true);
      setError(null);
      try {
        await Meteor.callAsync("rides.cancel", rideId);
        const r = await fetchRide();
        setRide(r);
      } catch (err) {
        setError(err.reason || err.message || "Could not cancel ride.");
      } finally {
        setCancelling(false);
      }
    });
  };

  const handleRemoveRider = async (riderUserId) => {
    if (removingRiderId) return;
    setRemovingRiderId(riderUserId);
    setError(null);
    try {
      await Meteor.callAsync("rides.removeRider", rideId, riderUserId);
      const r = await fetchRide();
      setRide(r);
    } catch (err) {
      setError(err.reason || err.message || "Could not remove rider.");
    } finally {
      setRemovingRiderId(null);
    }
  };

  const handleGenerateShareCode = async () => {
    if (generatingCode) return;
    setGeneratingCode(true);
    setError(null);
    try {
      await Meteor.callAsync("rides.generateShareCode", rideId);
      const r = await fetchRide();
      setRide(r);
    } catch (err) {
      setError(err.reason || err.message || "Could not generate share code.");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (!ride || !ride.shareCode) return;
    try {
      await navigator.clipboard.writeText(ride.shareCode);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy"), 1500);
    } catch (err) {
      setError("Could not copy code.");
    }
  };

  const openEdit = () => {
    if (!ride) return;
    const d = new Date(ride.date);
    setEditForm({
      date: Number.isNaN(d.getTime()) ? "" : toDatetimeLocal(d),
      seats: ride.seats != null ? String(ride.seats) : "",
      notes: ride.notes || "",
    });
    setEditing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (savingEdit) return;
    setSavingEdit(true);
    setError(null);
    try {
      const patch = {
        date: new Date(editForm.date),
        seats: parseInt(editForm.seats, 10),
        notes: editForm.notes,
      };
      await Meteor.callAsync("rides.edit", rideId, patch);
      const r = await fetchRide();
      setRide(r);
      setEditing(false);
    } catch (err) {
      setError(err.reason || err.message || "Could not save changes.");
    } finally {
      setSavingEdit(false);
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
      const messageId = Random.id();
      await Meteor.callAsync("chats.sendMessage", chatId, text, messageId);
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

  const driver = profileById[ride.driver] || {};
  const driverName = driver.name || "Driver";
  const driverSub = [driver.year, driver.major].filter(Boolean).join(" · ");
  const iDrive = ride.driver === me;

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

  // Prefer an explicit ride.status field; fall back to a date/seat-derived
  // read when the ride carries none.
  let statusText = "";
  if (ride.status && STATUS_LABELS[ride.status]) {
    statusText = STATUS_LABELS[ride.status];
  } else if (departValid) {
    if (seatsLeft <= 0 && totalSeats > 0) statusText = "Full";
    else if (departAt.getTime() <= Date.now()) statusText = "Departed";
    else statusText = "Upcoming";
  }

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
      <PrimaryBtn type="button" onClick={handleJoin} $disabled={joining} disabled={joining}>
        {joining ? "Joining..." : "Join this ride"}
        <Icon name="arrow" size={15} color="var(--ink-1)" />
      </PrimaryBtn>
    );
  } else {
    actionNode = <PrimaryBtn type="button" $disabled disabled>Ride full</PrimaryBtn>;
  }

  const messages = (chat && chat.Messages) || [];

  /* Built from what the schema carries: pickup, the drive, any stops the
   * driver added along the way, then drop-off. */
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
  /* Stops are resolved server-side by rides.getById, in the driver's order. */
  (ride.waypointStops || []).forEach((stop, index) => {
    steps.push({
      icon: "pin",
      time: "",
      label: stop.text,
      sub: `Stop ${index + 1} of ${ride.waypointStops.length}`,
    });
  });
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
              <Eyebrow>
                {fmtEyebrow(ride.date)}
                {statusText ? <StatusPill>{statusText}</StatusPill> : null}
              </Eyebrow>
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
              {joinSuccess ? <SuccessNote>You&apos;re in — seat confirmed.</SuccessNote> : null}
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
                      {iDrive ? (
                        <RemoveBtn
                          type="button"
                          onClick={() => handleRemoveRider(id)}
                          disabled={removingRiderId === id}
                        >
                          {removingRiderId === id ? "Removing..." : "Remove"}
                        </RemoveBtn>
                      ) : null}
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

            {isParticipant ? (
              <Card>
                <CardHead>
                  <CardTitle>MANAGE</CardTitle>
                </CardHead>
                {iDrive ? (
                  <React.Fragment>
                    <Actions>
                      <GhostBtn type="button" onClick={handleCancel} disabled={cancelling}>
                        {cancelling ? "Cancelling..." : "Cancel ride"}
                      </GhostBtn>
                      <GhostBtn
                        type="button"
                        onClick={editing ? () => setEditing(false) : openEdit}
                      >
                        {editing ? "Close edit" : "Edit"}
                      </GhostBtn>
                    </Actions>

                    <Actions>
                      <GhostBtn
                        type="button"
                        onClick={handleGenerateShareCode}
                        disabled={generatingCode}
                      >
                        {generatingCode ? "Generating..." : "Share code"}
                      </GhostBtn>
                      {ride.shareCode ? (
                        <React.Fragment>
                          <ShareCodeValue>{ride.shareCode}</ShareCodeValue>
                          <GhostBtn type="button" onClick={handleCopyCode}>{copyLabel}</GhostBtn>
                        </React.Fragment>
                      ) : null}
                    </Actions>

                    {editing && editForm ? (
                      <EditForm onSubmit={handleEditSubmit}>
                        <EditField>
                          <MetaLabel>DATE &amp; TIME</MetaLabel>
                          <EditInput
                            type="datetime-local"
                            value={editForm.date}
                            onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                          />
                        </EditField>
                        <EditField>
                          <MetaLabel>SEATS</MetaLabel>
                          <EditInput
                            type="number"
                            min="1"
                            max="7"
                            value={editForm.seats}
                            onChange={e => setEditForm(f => ({ ...f, seats: e.target.value }))}
                          />
                        </EditField>
                        <EditField>
                          <MetaLabel>NOTES</MetaLabel>
                          <EditTextarea
                            value={editForm.notes}
                            onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                          />
                        </EditField>
                        <Actions>
                          <PrimaryBtn
                            type="submit"
                            $disabled={savingEdit}
                            disabled={savingEdit}
                          >
                            {savingEdit ? "Saving..." : "Save changes"}
                          </PrimaryBtn>
                        </Actions>
                      </EditForm>
                    ) : null}
                  </React.Fragment>
                ) : (
                  <Actions>
                    <GhostBtn type="button" onClick={handleLeave} disabled={leaving}>
                      {leaving ? "Leaving..." : "Leave ride"}
                    </GhostBtn>
                  </Actions>
                )}
              </Card>
            ) : null}

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

        {isParticipant && showChat && chatReady ? (
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
