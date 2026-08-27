import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Profiles } from "../../../api/profile/Profile";
import Icon from "../../components/Icon";
import MapView from "../../components/MapView";
import RideCard from "../../components/RideCard";
import {
  Screen,
  MapPane,
  ListPane,
  SearchPanel,
  RouteRow,
  RouteIndicator,
  OriginDot,
  IndicatorBar,
  RouteFields,
  FieldRow,
  FieldLabel,
  FieldSelect,
  SwapBtn,
  ChipRow,
  FilterChip,
  SearchBox,
  SearchInput,
  CenterPill,
  PulseDot,
  ListHeader,
  Eyebrow,
  TitleRow,
  ListTitle,
  SortBtn,
  SortValue,
  RidesScroll,
  EmptyState,
} from "../styles/Marketplace";

const ANY = "";
const MAX_FARE = 10;
const GEO_TIMEOUT_MS = 10000;

const fmtTime = (date) => new Date(date)
  .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const originOf = r => r.originText || r.origin || "";
const destinationOf = r => r.destinationText || r.destination || "";

const isToday = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d.getDate() === now.getDate()
    && d.getMonth() === now.getMonth()
    && d.getFullYear() === now.getFullYear();
};

const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

const parseCoord = (value, label) => {
  if (typeof value !== "string") return null;
  const [latRaw, lngRaw] = value.split(",");
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label };
};

const uniqueSorted = list => [...new Set(list.filter(Boolean))].sort();

/**
 * Find a ride — split discovery screen (design handoff V1 Split). Pulls
 * future rides at the user's school via rides.forMySchool, resolves driver
 * names via profiles.displayNames, and filters to joinable rides.
 */
const Marketplace = ({ history }) => {
  const [allRides, setAllRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // Filters
  const [fromPlace, setFromPlace] = useState(ANY);
  const [toPlace, setToPlace] = useState(ANY);
  const [when, setWhen] = useState("any");
  const [cheapOnly, setCheapOnly] = useState(false);
  const [showText, setShowText] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("soonest");

  // Viewer's own position, only ever set from a real geolocation fix.
  const [myPosition, setMyPosition] = useState(null);
  const [geoState, setGeoState] = useState("idle");

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

  const { driverById } = useTracker(() => {
    if (driverIds.length === 0) return { driverById: {} };
    Meteor.subscribe("profiles.displayNames", driverIds);
    const map = {};
    Profiles.find({ Owner: { $in: driverIds } }).forEach((p) => {
      map[p.Owner] = { name: p.Name, year: p.year, dept: p.major };
    });
    return { driverById: map };
  }, [driverIds]);

  const origins = useMemo(() => uniqueSorted(allRides.map(originOf)), [allRides]);
  const destinations = useMemo(
    () => uniqueSorted(allRides.map(destinationOf)),
    [allRides],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = allRides.filter((r) => {
      const from = originOf(r);
      const to = destinationOf(r);
      if (fromPlace && from !== fromPlace) return false;
      if (toPlace && to !== toPlace) return false;
      if (when === "today" && !isToday(r.date)) return false;
      if (when === "weekend" && !isWeekend(r.date)) return false;
      if (cheapOnly && (r.fare || 0) > MAX_FARE) return false;
      if (q && !from.toLowerCase().includes(q) && !to.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
    return [...list].sort((a, b) => (sort === "cheapest"
      ? (a.fare || 0) - (b.fare || 0)
      : new Date(a.date) - new Date(b.date)));
  }, [allRides, query, fromPlace, toPlace, when, cheapOnly, sort]);

  // The design ships one card outlined. Point that at the first real result
  // in the current sort order, and re-point it when the current pick is
  // filtered away, so the outline never dangles.
  useEffect(() => {
    if (filtered.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    if (!filtered.some(r => r._id === selectedId)) setSelectedId(filtered[0]._id);
  }, [filtered, selectedId]);

  // Every point each filtered ride calls at -- endpoints and any stops along
  // the way -- plus the viewer's own fix once they ask for it. MapView fits
  // its bounds to this set.
  const mapPoints = useMemo(() => {
    const points = filtered.flatMap(r => [
      parseCoord(r.originCoords, `${originOf(r)} — ${fmtTime(r.date)}`),
      ...(r.waypointStops || []).map(stop => parseCoord(stop.value, `${stop.text} (stop)`)),
      parseCoord(r.destinationCoords, destinationOf(r)),
    ]).filter(Boolean);
    return myPosition ? [myPosition, ...points] : points;
  }, [filtered, myPosition]);

  const locateMe = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("unsupported");
      return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "You are here",
        });
        setGeoState("ready");
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: true, timeout: GEO_TIMEOUT_MS },
    );
  }, []);

  const geoBlocked = geoState === "denied" || geoState === "unsupported";

  const swap = () => {
    setFromPlace(toPlace);
    setToPlace(fromPlace);
  };

  const routeTitle = fromPlace || toPlace
    ? `${fromPlace || "Anywhere"} → ${toPlace || "Anywhere"}`
    : "Find a ride";

  const resultsLabel = loading
    ? "FINDING RIDES"
    : `RESULTS · ${filtered.length} RIDE${filtered.length === 1 ? "" : "S"}`;

  let body;
  if (error) {
    body = <EmptyState>{error}</EmptyState>;
  } else if (loading) {
    body = <EmptyState>Finding rides…</EmptyState>;
  } else if (filtered.length === 0) {
    body = (
      <EmptyState>
        No rides match those filters yet. Try widening them, or offer your own.
      </EmptyState>
    );
  } else {
    body = (
      <RidesScroll>
        {filtered.map(r => (
          <RideCard
            key={r._id}
            ride={r}
            driverName={driverById[r.driver]?.name}
            driverYear={driverById[r.driver]?.year}
            driverDept={driverById[r.driver]?.dept}
            active={r._id === selectedId}
            onClick={ride => setSelectedId(ride._id)}
            onRequest={ride => history.push(`/ride/${ride._id}`)}
          />
        ))}
      </RidesScroll>
    );
  }

  return (
    <Screen>
      <MapPane>
        {/* Real Leaflet map. Markers are the actual pickup/drop-off places of
            the rides currently in the list, so the map reflects the query. */}
        <MapView coordinates={mapPoints} />

        <SearchPanel className="fade-in">
          <RouteRow>
            <RouteIndicator>
              <OriginDot />
              <IndicatorBar />
              <Icon name="pin" size={12} color="var(--ink-1)" />
            </RouteIndicator>
            <RouteFields>
              <FieldRow $divided>
                <FieldLabel htmlFor="find-from">FROM</FieldLabel>
                <FieldSelect
                  id="find-from"
                  value={fromPlace}
                  onChange={e => setFromPlace(e.target.value)}
                >
                  <option value={ANY}>Anywhere</option>
                  {origins.map(o => <option key={o} value={o}>{o}</option>)}
                </FieldSelect>
              </FieldRow>
              <FieldRow>
                <FieldLabel htmlFor="find-to">TO</FieldLabel>
                <FieldSelect
                  id="find-to"
                  value={toPlace}
                  onChange={e => setToPlace(e.target.value)}
                >
                  <option value={ANY}>Anywhere</option>
                  {destinations.map(d => <option key={d} value={d}>{d}</option>)}
                </FieldSelect>
              </FieldRow>
            </RouteFields>
            <SwapBtn type="button" onClick={swap} aria-label="Swap origin and destination">
              <Icon name="arrow" size={16} />
            </SwapBtn>
          </RouteRow>

          <ChipRow>
            <FilterChip type="button" $active={when === "any"} onClick={() => setWhen("any")}>
              Any time
            </FilterChip>
            <FilterChip type="button" $active={when === "today"} onClick={() => setWhen("today")}>
              Today
            </FilterChip>
            <FilterChip
              type="button"
              $active={when === "weekend"}
              onClick={() => setWhen("weekend")}
            >
              This weekend
            </FilterChip>
            <FilterChip
              type="button"
              $active={cheapOnly}
              onClick={() => setCheapOnly(v => !v)}
            >
              {`≤ $${MAX_FARE}`}
            </FilterChip>
            <FilterChip
              type="button"
              $active={showText}
              onClick={() => setShowText(v => !v)}
            >
              + filter
            </FilterChip>
          </ChipRow>

          {showText && (
            <SearchBox>
              <Icon name="search" size={16} color="var(--ink-3)" />
              <SearchInput
                type="text"
                placeholder="Search origin or destination"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </SearchBox>
          )}
        </SearchPanel>

        <CenterPill
          type="button"
          onClick={locateMe}
          disabled={geoBlocked || geoState === "locating"}
          title={geoBlocked ? "Location is unavailable in this browser" : undefined}
        >
          <PulseDot className="pulse" />
          {geoState === "locating" ? "Locating…" : "Center on me"}
        </CenterPill>
      </MapPane>

      <ListPane>
        <ListHeader>
          <Eyebrow>{resultsLabel}</Eyebrow>
          <TitleRow>
            <ListTitle>{routeTitle}</ListTitle>
            <SortBtn
              type="button"
              onClick={() => setSort(s => (s === "soonest" ? "cheapest" : "soonest"))}
            >
              {"Sort: "}
              <SortValue>
                {sort === "soonest" ? "Soonest ↓" : "Cheapest ↓"}
              </SortValue>
            </SortBtn>
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
