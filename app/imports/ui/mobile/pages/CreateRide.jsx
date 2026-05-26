import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Places } from "../../../api/places/Places";
import LoadingPage from "../../components/LoadingPage";
import {
  Page,
  Inner,
  Title,
  Mark,
  Form,
  Section,
  SectionTitle,
  Row,
  Row2,
  Field,
  Label,
  Input,
  Select,
  Textarea,
  SwapBtn,
  Stepper,
  StepBtn,
  StepValue,
  Hint,
  Footer,
  PostBtn,
  ErrorMessage,
  Notice,
} from "../styles/CreateRide";

/**
 * Offer a ride — web create form wired to the rides.create method.
 * Origin/destination are picked from the user's saved places (places.options).
 */
const CreateRide = ({ history }) => {
  const { ready, places } = useTracker(() => {
    const sub = Meteor.subscribe("places.options");
    return {
      ready: sub.ready(),
      places: Places.find({}, { sort: { text: 1 } }).fetch(),
    };
  }, []);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(3);
  const [fare, setFare] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
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

  if (places.length === 0) {
    return (
      <Page>
        <Inner>
          <Title>Offer a <Mark>ride.</Mark></Title>
          <Notice>
            You have no saved places yet. Add your pickup and drop-off spots in
            Places first, then come back to post a ride.
          </Notice>
        </Inner>
      </Page>
    );
  }

  return (
    <Page>
      <Inner>
        <Title>Offer a <Mark>ride.</Mark></Title>
        <Form onSubmit={submit}>
          <Section>
            <SectionTitle>01 · ROUTE</SectionTitle>
            <Row>
              <Field>
                <Label>From</Label>
                <Select value={origin} onChange={e => setOrigin(e.target.value)}>
                  <option value="">Select origin…</option>
                  {places.map(p => (
                    <option key={p._id} value={p._id}>{p.text}</option>
                  ))}
                </Select>
              </Field>
              <SwapBtn type="button" onClick={swap} title="Swap locations">⇅</SwapBtn>
              <Field>
                <Label>To</Label>
                <Select value={destination} onChange={e => setDestination(e.target.value)}>
                  <option value="">Select destination…</option>
                  {places.map(p => (
                    <option key={p._id} value={p._id}>{p.text}</option>
                  ))}
                </Select>
              </Field>
            </Row>
          </Section>

          <Section>
            <SectionTitle>02 · WHEN</SectionTitle>
            <Row2>
              <Field>
                <Label>Date</Label>
                <Input type="date" min={today} value={date} onChange={e => setDate(e.target.value)} />
              </Field>
              <Field>
                <Label>Time</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </Field>
            </Row2>
          </Section>

          <Section>
            <SectionTitle>03 · SEATS &amp; FARE</SectionTitle>
            <Row2>
              <Field>
                <Label>Seats</Label>
                <Stepper>
                  <StepBtn type="button" onClick={() => setSeats(s => Math.max(1, s - 1))}>−</StepBtn>
                  <StepValue>{seats}</StepValue>
                  <StepBtn type="button" onClick={() => setSeats(s => Math.min(7, s + 1))}>+</StepBtn>
                </Stepper>
              </Field>
              <Field>
                <Label>Fare per seat ($)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={fare}
                  onChange={e => setFare(e.target.value)}
                />
                <Hint>A fair gas split is roughly $0.33 / mile.</Hint>
              </Field>
            </Row2>
          </Section>

          <Section>
            <SectionTitle>04 · NOTE</SectionTitle>
            <Field>
              <Textarea
                placeholder="Anything riders should know (luggage, stops, music)…"
                maxLength="200"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
              <Hint>{`${notes.length}/200`}</Hint>
            </Field>
          </Section>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Footer>
            <PostBtn type="submit" disabled={submitting}>
              {submitting ? "Posting…" : "Post ride"}
            </PostBtn>
          </Footer>
        </Form>
      </Inner>
    </Page>
  );
};

CreateRide.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default withRouter(CreateRide);
