import React, { useState, useEffect, useMemo } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Profiles } from "../../../api/profile/Profile";
import Icon from "../../components/Icon";
import MapView from "../../components/MapView";
import RideCard from "../../components/RideCard";
import LoadingPage from "../../components/LoadingPage";
import {
  Screen,
  MapPane,
  ListPane,
  SearchPanel,
  SearchBox,
  SearchInput,
  MapControls,
  ControlBtn,
  ListHeader,
  Eyebrow,
  TitleRow,
  ListTitle,
  SortBtn,
  RidesScroll,
  EmptyState,
} from "../styles/Marketplace";

/* "lat,lng" (as stored on a Place) -> a MapView marker. */
const parseCoord = (value, label) => {
  if (typeof value !== "string") return null;
  const [latRaw, lngRaw] = value.split(",");
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label };
};

const fmtTime = (date) => new Date(date)
  .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/**
 * Find a ride — split discovery screen. Pulls future rides at the user's
 * school via the rides.forMySchool method (place names resolved server-side),
 * resolves driver names via profiles.displayNames, and filters to joinable
 * rides (not yours, seats available).
 */
const Marketplace = ({ history }) => {
  const [allRides, setAllRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let active = true;
    Meteor.callAsync("rides.forMySchool", {})
      .then((rides) => {
        if (!active) return;
        const me = Meteor.userId();
        const joinable = (rides || []).filter((r) => {
          const seatsLeft = (r.seats || 0) - (r.riders ? r.riders.length : 0);
          const notMine = r.driver !== me;
          const notRider = !r.riders || !r.riders.includes(me);
          return notMine && notRider && seatsLeft > 0;
        });
        setAllRides(joinable);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.reason || err.message || "Could not load rides.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const driverIds = useMemo(
    () => [...new Set(allRides.map(r => r.driver).filter(Boolean))],
    [allRides],
  );

  const { nameById } = useTracker(() => {
    if (driverIds.length === 0) return { nameById: {} };
    Meteor.subscribe("profiles.displayNames", driverIds);
    const map = {};
    Profiles.find({ Owner: { $in: driverIds } }).forEach((p) => {
      map[p.Owner] = p.Name;
    });
    return { nameById: map };
  }, [driverIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? allRides.filter((r) => {
        const from = (r.originText || r.origin || "").toLowerCase();
        const to = (r.destinationText || r.destination || "").toLowerCase();
        return from.includes(q) || to.includes(q);
      })
      : allRides;
    return [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allRides, query]);

  if (loading) return <LoadingPage message="Finding rides..." />;

  const selected = filtered.find(r => r._id === selectedId);

  let body;
  if (error) {
    body = <EmptyState>{error}</EmptyState>;
  } else if (filtered.length === 0) {
    body = (
      <EmptyState>
        No rides at your school match yet. Check back later, or offer your own.
      </EmptyState>
    );
  } else {
    body = (
      <RidesScroll>
        {filtered.map(r => (
          <RideCard
            key={r._id}
            ride={r}
            driverName={nameById[r.driver]}
            active={r._id === selectedId}
            onClick={ride => setSelectedId(ride._id)}
            onRequest={ride => history.push(`/ride/${ride._id}`)}
          />
        ))}
      </RidesScroll>
    );
  }

  // Plot the endpoints of whatever is currently in the list; the selected
  // ride goes first so MapView centres on it.
  const mapPoints = (selected ? [selected, ...filtered.filter(r => r !== selected)] : filtered)
    .flatMap(r => [
      parseCoord(r.originCoords, `${r.originText || r.origin || ""} · ${fmtTime(r.date)}`),
      parseCoord(r.destinationCoords, r.destinationText || r.destination || ""),
    ])
    .filter(Boolean);

  return (
    <Screen>
      <MapPane>
        {/* Real map tiles. MapBg was a decorative SVG whose pins sat at fixed
            percentages unrelated to any real place; these markers are the
            rides' actual pickup and drop-off points. Selection, filtering and
            search behaviour are unchanged. */}
        <MapView coordinates={mapPoints} />

        <SearchPanel className="glass-strong">
          <SearchBox>
            <Icon name="search" size={16} color="var(--ink-3)" />
            <SearchInput
              type="text"
              placeholder="Search origin or destination"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </SearchBox>
        </SearchPanel>

        <MapControls className="glass">
          <ControlBtn type="button" aria-label="Zoom in">
            <Icon name="plus" size={16} />
          </ControlBtn>
          <ControlBtn type="button" aria-label="Zoom out">
            &minus;
          </ControlBtn>
        </MapControls>
      </MapPane>

      <ListPane>
        <ListHeader>
          <Eyebrow>
            {`RESULTS · ${filtered.length} RIDE${filtered.length === 1 ? "" : "S"}`}
          </Eyebrow>
          <TitleRow>
            <ListTitle>Find a ride</ListTitle>
            <SortBtn type="button">Soonest ↓</SortBtn>
          </TitleRow>
        </ListHeader>
        {body}
      </ListPane>
    </Screen>
  );
};

Marketplace.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default withRouter(Marketplace);
