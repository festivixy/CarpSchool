import React, { useState, useEffect, useMemo } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Profiles } from "../../../api/profile/Profile";
import Icon from "../../components/Icon";
import MapBg from "../../components/MapBg";
import Pin from "../../components/Pin";
import RideCard from "../../components/RideCard";
import LoadingPage from "../../components/LoadingPage";
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
  MapControls,
  ControlBtn,
  ControlDivider,
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

// Decorative pin placements on the stylized map (not geographic).
const PIN_SPOTS = [
  { x: 22, y: 68, color: "var(--signal-yellow)" },
  { x: 48, y: 36, color: "var(--sky)" },
  { x: 72, y: 58, color: "var(--leaf)" },
  { x: 36, y: 20, color: "var(--plum)" },
  { x: 62, y: 78, color: "var(--amber)" },
];

const ANY = "";
const MAX_FARE = 10;

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

  if (loading) return <LoadingPage message="Finding rides..." />;

  const swap = () => {
    setFromPlace(toPlace);
    setToPlace(fromPlace);
  };

  const routeTitle = fromPlace || toPlace
    ? `${fromPlace || "Anywhere"} → ${toPlace || "Anywhere"}`
    : "Find a ride";

  let body;
  if (error) {
    body = <EmptyState>{error}</EmptyState>;
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
            driverName={nameById[r.driver]}
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
        <MapBg>
          {filtered.slice(0, PIN_SPOTS.length).map((r, i) => (
            <Pin
              key={r._id}
              x={PIN_SPOTS[i].x}
              y={PIN_SPOTS[i].y}
              type="label"
              color={r._id === selectedId ? "var(--ink-1)" : PIN_SPOTS[i].color}
              label={fmtTime(r.date)}
            />
          ))}
          {/* Highlighted route. Shares MapBg's viewBox and slice behaviour so
              the path stays registered with the streets beneath it. */}
          <svg
            viewBox="0 0 1280 800"
            preserveAspectRatio="xMidYMid slice"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <path
              d="M 130 460 Q 280 380 360 320 T 540 240"
              stroke="#fff"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              opacity="0.95"
            />
            <path
              d="M 130 460 Q 280 380 360 320 T 540 240"
              stroke="var(--signal-yellow-deep)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </MapBg>

        <SearchPanel className="glass-strong">
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

        <MapControls className="glass">
          <ControlBtn type="button" aria-label="Zoom in">
            <Icon name="plus" size={16} />
          </ControlBtn>
          <ControlDivider />
          <ControlBtn type="button" aria-label="Zoom out">
            &minus;
          </ControlBtn>
        </MapControls>

        <CenterPill type="button" className="glass">
          <PulseDot className="pulse" />
          Center on me
        </CenterPill>
      </MapPane>

      <ListPane>
        <ListHeader>
          <Eyebrow>
            {`RESULTS · ${filtered.length} RIDE${filtered.length === 1 ? "" : "S"}`}
          </Eyebrow>
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
