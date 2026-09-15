import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import Icon from "../../components/Icon";
import { getImageUrl } from "../utils/imageUtils";
import {
  Screen,
  Wrap,
  Head,
  Eyebrow,
  Title,
  Lede,
  Section,
  Actions,
  GhostBtn,
  Empty,
  ErrorText,
  DriverGrid,
  DriverCard,
  DriverHead,
  Avatar,
  DriverName,
  Badge,
  DriverRoute,
  DriverMeta,
} from "../styles/Availability";

/**
 * Drivers available at your school right now.
 *
 * The server decides what "now" means, resolving weekly slots against the
 * school's own time zone, and returns only display fields.
 */
const Drivers = ({ history }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Meteor.call("availability.openNow", (err, result) => {
      setLoading(false);
      if (err) {
        setError(err.reason || err.message);
        return;
      }
      setEntries(result || []);
    });
  }, []);

  useEffect(load, [load]);

  const initialOf = name => (name || "?").trim().charAt(0).toUpperCase();

  return (
    <Screen>
      <Wrap>
        <Head>
          <Eyebrow>Available now</Eyebrow>
          <Title>Drivers on the road</Title>
          <Lede>
            People at your school who said they can take someone right now. Message a
            driver to agree on where to meet.
          </Lede>
        </Head>

        <Actions>
          <GhostBtn type="button" onClick={load} disabled={loading}>
            <Icon name="arrow" size={14} />
            {loading ? "Refreshing…" : "Refresh"}
          </GhostBtn>
        </Actions>

        <Section>
          {loading && entries.length === 0 && <Empty>Looking for drivers…</Empty>}

          {!loading && entries.length === 0 && !error && (
            <Empty>
              Nobody is available at the moment. Check the ride list instead, or come
              back closer to when you need to travel.
            </Empty>
          )}

          {entries.length > 0 && (
            <DriverGrid>
              {entries.map(entry => (
                <DriverCard key={entry._id}>
                  <DriverHead>
                    <Avatar
                      style={entry.driverImage
                        ? { backgroundImage: `url(${getImageUrl(entry.driverImage)})` }
                        : undefined}
                      aria-hidden="true"
                    >
                      {!entry.driverImage && initialOf(entry.driverName)}
                    </Avatar>
                    <div>
                      <DriverName>{entry.driverName}</DriverName>
                      <Badge $now={entry.kind === "now"}>
                        {entry.kind === "now" ? "Available now" : "On schedule"}
                      </Badge>
                    </div>
                  </DriverHead>

                  <DriverRoute>
                    {`${entry.originText || "—"} → ${entry.destinationText || "—"}`}
                  </DriverRoute>

                  <DriverMeta>
                    <span>{`${entry.seats} seat${entry.seats === 1 ? "" : "s"}`}</span>
                    {entry.note && <span>{entry.note}</span>}
                  </DriverMeta>

                  {!entry.isMine && (
                    <GhostBtn type="button" onClick={() => history.push("/chat")}>
                      <Icon name="chat" size={14} />
                      Message
                    </GhostBtn>
                  )}
                </DriverCard>
              ))}
            </DriverGrid>
          )}

          {error && <ErrorText role="alert">{error}</ErrorText>}
        </Section>
      </Wrap>
    </Screen>
  );
};

Drivers.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(Drivers);
