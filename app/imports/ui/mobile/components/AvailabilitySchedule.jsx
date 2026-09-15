import React, { useCallback, useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Places } from "../../../api/places/Places";
import Icon from "../../components/Icon";
import {
  DAY_LABELS,
  formatMinutes,
  slotRangeError,
} from "../../../api/availability/availabilityTime";
import {
  Section,
  SectionTitle,
  Card,
  CardRow,
  Field,
  FieldLabel,
  Select,
  Input,
  FormGrid,
  Actions,
  PrimaryBtn,
  GoBtn,
  GhostBtn,
  SlotList,
  SlotRow,
  SlotWhen,
  SlotRoute,
  RemoveBtn,
  Empty,
  Note,
  ErrorText,
} from "../styles/Availability";

/**
 * A driver's own availability: a weekly schedule, and an instant
 * "available now" that lapses on its own.
 *
 * Slots are read through a method rather than a publication because the list
 * is small, changes only when this screen changes it, and the server already
 * exposes availability.mine.
 */

/* "08:30" <-> 510. The native time input speaks HH:MM. */
const toMinutes = (value) => {
  const [h, m] = String(value || "").split(":");
  if (h === undefined || m === undefined) return NaN;
  return (Number(h) * 60) + Number(m);
};

const toTimeValue = minutes => formatMinutes(minutes);

const DEFAULT_START = 8 * 60;
const DEFAULT_END = 9 * 60;

const AvailabilitySchedule = () => {
  const { placesReady, places } = useTracker(() => {
    const sub = Meteor.subscribe("places.options");
    return {
      placesReady: sub.ready(),
      places: Places.find({}, { sort: { text: 1 } }).fetch(),
    };
  }, []);

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [start, setStart] = useState(toTimeValue(DEFAULT_START));
  const [end, setEnd] = useState(toTimeValue(DEFAULT_END));
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [seats, setSeats] = useState(1);

  const [nowOrigin, setNowOrigin] = useState("");
  const [nowDestination, setNowDestination] = useState("");
  const [nowMinutes, setNowMinutes] = useState(90);

  const load = useCallback(() => {
    setLoading(true);
    Meteor.call("availability.mine", (err, result) => {
      setLoading(false);
      if (err) {
        setError(err.reason || err.message);
        return;
      }
      setSlots(result || []);
    });
  }, []);

  useEffect(load, [load]);

  const weekly = slots.filter(s => s.kind === "weekly");
  const live = slots.find(s => s.kind === "now" && new Date(s.expiresAt) > new Date());

  const placeName = id => (places.find(p => p._id === id) || {}).text || "Unknown place";

  const run = (method, args, onDone) => {
    setBusy(true);
    setError("");
    Meteor.call(method, ...args, (err) => {
      setBusy(false);
      if (err) {
        setError(err.reason || err.message);
        return;
      }
      if (onDone) onDone();
      load();
    });
  };

  const addSlot = () => {
    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);

    /* Checked here as well as on the server, using the same rule module, so
     * the message appears before a round trip. */
    const rangeError = slotRangeError(startMinutes, endMinutes);
    if (rangeError) {
      setError(rangeError);
      return;
    }
    if (!origin || !destination) {
      setError("Choose where you are setting off from and where you are going.");
      return;
    }
    if (origin === destination) {
      setError("Pick two different places.");
      return;
    }

    run("availability.addWeekly", [{
      dayOfWeek: Number(dayOfWeek),
      startMinutes,
      endMinutes,
      origin,
      destination,
      seats: Number(seats) || 1,
    }]);
  };

  const goNow = () => {
    if (!nowOrigin || !nowDestination) {
      setError("Choose where you are setting off from and where you are going.");
      return;
    }
    if (nowOrigin === nowDestination) {
      setError("Pick two different places.");
      return;
    }
    run("availability.goNow", [{
      origin: nowOrigin,
      destination: nowDestination,
      seats: Number(seats) || 1,
      minutes: Number(nowMinutes) || 90,
    }]);
  };

  const placeOptions = places.map(p => (
    <option key={p._id} value={p._id}>{p.text}</option>
  ));

  return (
    <>
      <Section>
        <SectionTitle>Available now</SectionTitle>

        {live ? (
          <Card $live>
            <CardRow>
              <div>
                <strong>
                  {`You're listed until ${new Date(live.expiresAt)
                    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                </strong>
                <Note>
                  {`${placeName(live.origin)} → ${placeName(live.destination)}`}
                </Note>
              </div>
              <GhostBtn type="button" disabled={busy} onClick={() => run("availability.stopNow", [])}>
                Stop
              </GhostBtn>
            </CardRow>
          </Card>
        ) : (
          <Card>
            <FormGrid>
              <Field>
                <FieldLabel>Setting off from</FieldLabel>
                <Select value={nowOrigin} onChange={e => setNowOrigin(e.target.value)}>
                  <option value="">Choose a place</option>
                  {placeOptions}
                </Select>
              </Field>
              <Field>
                <FieldLabel>Going to</FieldLabel>
                <Select value={nowDestination} onChange={e => setNowDestination(e.target.value)}>
                  <option value="">Choose a place</option>
                  {placeOptions}
                </Select>
              </Field>
              <Field>
                <FieldLabel>For how long</FieldLabel>
                <Select value={nowMinutes} onChange={e => setNowMinutes(e.target.value)}>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={180}>3 hours</option>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Seats</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={seats}
                  onChange={e => setSeats(e.target.value)}
                />
              </Field>
            </FormGrid>
            <Actions>
              <GoBtn type="button" disabled={busy || !placesReady} onClick={goNow}>
                <Icon name="car" size={15} />
                Go available now
              </GoBtn>
            </Actions>
            <Note>
              You&apos;ll appear to riders at your school straight away, and drop off the
              list on your own when the time is up.
            </Note>
          </Card>
        )}
      </Section>

      <Section>
        <SectionTitle>Weekly schedule</SectionTitle>

        {loading && <Empty>Loading your schedule…</Empty>}

        {!loading && weekly.length === 0 && (
          <Empty>
            No weekly slots yet. Add the runs you usually do and riders will see you
            during those times.
          </Empty>
        )}

        {!loading && weekly.length > 0 && (
          <SlotList>
            {weekly.map(slot => (
              <SlotRow key={slot._id}>
                <SlotWhen>
                  {`${DAY_LABELS[slot.dayOfWeek].slice(0, 3)} `
                    + `${formatMinutes(slot.startMinutes)}–${formatMinutes(slot.endMinutes)}`}
                </SlotWhen>
                <SlotRoute>
                  {`${placeName(slot.origin)} → ${placeName(slot.destination)}`}
                </SlotRoute>
                <RemoveBtn
                  type="button"
                  disabled={busy}
                  aria-label={`Remove ${DAY_LABELS[slot.dayOfWeek]} slot`}
                  onClick={() => run("availability.remove", [slot._id])}
                >
                  Remove
                </RemoveBtn>
              </SlotRow>
            ))}
          </SlotList>
        )}
      </Section>

      <Section>
        <SectionTitle>Add a slot</SectionTitle>
        <Card>
          <FormGrid>
            <Field>
              <FieldLabel>Day</FieldLabel>
              <Select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}>
                {DAY_LABELS.map((label, index) => (
                  <option key={label} value={index}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field>
              <FieldLabel>Seats</FieldLabel>
              <Input
                type="number"
                min="1"
                max="7"
                value={seats}
                onChange={e => setSeats(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>From</FieldLabel>
              <Input type="time" value={start} onChange={e => setStart(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Until</FieldLabel>
              <Input type="time" value={end} onChange={e => setEnd(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Setting off from</FieldLabel>
              <Select value={origin} onChange={e => setOrigin(e.target.value)}>
                <option value="">Choose a place</option>
                {placeOptions}
              </Select>
            </Field>
            <Field>
              <FieldLabel>Going to</FieldLabel>
              <Select value={destination} onChange={e => setDestination(e.target.value)}>
                <option value="">Choose a place</option>
                {placeOptions}
              </Select>
            </Field>
          </FormGrid>

          <Actions>
            <PrimaryBtn type="button" disabled={busy || !placesReady} onClick={addSlot}>
              <Icon name="plus" size={15} />
              Add to my week
            </PrimaryBtn>
          </Actions>

          {places.length === 0 && placesReady && (
            <Note>
              You have no saved places yet. Add them under Saved places first, so you
              can say where a run starts and ends.
            </Note>
          )}
        </Card>
      </Section>

      {error && <ErrorText role="alert">{error}</ErrorText>}
    </>
  );
};

export default AvailabilitySchedule;
