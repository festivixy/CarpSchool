import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import Icon from "./Icon";
import {
  GuardianForm,
  GuardianRow,
  GuardianInput,
  GuardianButton,
  GuardianNote,
  GuardianError,
  GuardianDone,
} from "../styles/AddGuardian";

/**
 * A student attaching their parent or guardian to the school.
 *
 * This is the step that replaced the school-email check for parents. The
 * guardian signs up with whatever address they have and waits; naming that
 * address here is what attaches them to this student's school and puts them
 * in front of an administrator. Without it their account stays inert.
 */
const AddGuardian = ({ onLinked }) => {
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState("");

  const submit = (event) => {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;

    setBusy(true);
    setError("");
    setDone("");
    Meteor.call("profiles.claimGuardian", address, (callError, result) => {
      setBusy(false);
      if (callError) {
        setError(callError.reason || "Could not add that guardian.");
        return;
      }
      setEmail("");
      setDone(result?.alreadyLinked
        ? "That guardian is already linked to you."
        : "Added. An administrator reviews their account next.");
      if (onLinked) onLinked();
    });
  };

  return (
    <GuardianForm onSubmit={submit}>
      <GuardianNote>
        Ask them to sign up first and choose &ldquo;I&rsquo;m a parent or
        guardian&rdquo;, then enter the address they used.
      </GuardianNote>
      <GuardianRow>
        <GuardianInput
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="their email address"
          aria-label="Guardian's email address"
          disabled={busy}
        />
        <GuardianButton type="submit" disabled={busy || !email.trim()}>
          <Icon name="plus" size={15} color="currentColor" />
          {busy ? "Adding" : "Add"}
        </GuardianButton>
      </GuardianRow>
      {error && <GuardianError role="alert">{error}</GuardianError>}
      {done && <GuardianDone role="status">{done}</GuardianDone>}
    </GuardianForm>
  );
};

AddGuardian.propTypes = {
  onLinked: PropTypes.func,
};

AddGuardian.defaultProps = {
  onLinked: null,
};

export default AddGuardian;
