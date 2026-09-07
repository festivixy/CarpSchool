import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import styled from "styled-components";

/**
 * Tells the user when the DDP connection is down.
 *
 * Without this, a dropped connection left every screen looking live while
 * nothing updated, and taps queued up to replay minutes later on reconnect.
 */
const Banner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  padding: 8px 16px;
  text-align: center;
  font-family: var(--font-ui, inherit);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-1, #1a1815);
  background: var(--signal-yellow, #ffd400);
  border-bottom: 1px solid var(--ink-1, #1a1815);
`;

const LABELS = {
  connecting: "Connecting…",
  waiting: "Offline — reconnecting…",
  failed: "Connection failed — reload to try again",
  offline: "Offline",
};

const ConnectionBanner = () => {
  const status = useTracker(() => Meteor.status(), []);

  if (!status || status.connected) return null;

  return (
    <Banner role="status" aria-live="polite">
      {LABELS[status.status] || LABELS.waiting}
    </Banner>
  );
};

export default ConnectionBanner;
