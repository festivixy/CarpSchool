import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { Profiles } from "../../../api/profile/Profile";
import { Places } from "../../../api/places/Places";
import Icon from "../../components/Icon";
import WaypointMap from "../components/WaypointMap";
import { formatPlaceValue, canEditPlace } from "../../utils/placeCoords";
import { useDebounce } from "../../utils/geolocation";
import { useGeolocation } from "../../utils/useGeolocation";
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
  RidesScroll,
  EmptyState,
} from "../styles/Marketplace";

const ANY = "";
const RIDES_POLL_MS = 60000;

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

/* Every place a ride calls at, in travel order: origin, stops, destination.
 * Riders can board and alight at a stop, so discovery matches the whole
 * sequence rather than just the endpoints. */
const routeOf = r => [
  originOf(r),
  ...(r.waypointStops || []).map(stop => stop.text),
  destinationOf(r),
].filter(Boolean);

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
  const [showText, setShowText] = useState(false);
  const [queryInput, setQueryInput] = useState("");
  const query = useDebounce(queryInput, 300);
  const [refreshing, setRefreshing] = useState(false);

  // Viewer's own position, only ever set from a real geolocation fix.
  const [myPosition, setMyPosition] = useState(null);
  const geo = useGeolocation();

  useEffect(() => {
    if (geo.status === "granted" && geo.position) {
      setMyPosition({ ...geo.position, label: "You are here" });
    }
  }, [geo.status, geo.position]);

  const fetchRides = useCallback((isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    return Meteor.callAsync("rides.forMySchool", {})
      .then((rides) => {
        const me = Meteor.userId();
        const joinable = (rides || []).filter((r) => {
          const seatsLeft = (r.seats || 0) - (r.riders ? r.riders.length : 0);
          const notMine = r.driver !== me;
          const notRider = !r.riders || !r.riders.includes(me);
          return notMine && notRider && seatsLeft > 0;
        });
        setAllRides(joinable);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError(err.reason || err.message || "Could not load rides.");
        setLoading(false);
      })
      .finally(() => {
        if (isManualRefresh) setRefreshing(false);
      });
  }, []);

  // Refresh on a timer, and whenever the tab regains attention -- results
  // seats fill up while the tab is backgrounded otherwise.
  useEffect(() => {
    fetchRides();
    const interval = setInterval(() => fetchRides(), RIDES_POLL_MS);
    const onFocus = () => fetchRides();
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchRides();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchRides]);

  const driverIds = useMemo(
    () => [...new Set(allRides.map(r => r.driver).filter(Boolean))],
    [allRides],
  );

  /* Waypoints are edited straight from this map, so the page needs the
   * school's places as well as the rides. */
  const { myPlaces } = useTracker(() => {
    const sub = Meteor.subscribe("places.options");
    return {
      myPlaces: sub.ready() ? Places.find({}, { sort: { text: 1 } }).fetch() : [],
    };
  }, []);

  const { driverById } = useTracker(() => {
    if (driverIds.length === 0) return { driverById: {} };
    Meteor.subscribe("profiles.displayNames", driverIds);
    const map = {};
    Profiles.find({ Owner: { $in: driverIds } }).forEach((p) => {
      map[p.Owner] = { name: p.Name, year: p.year, dept: p.major };
    });
    return { driverById: map };
  }, [driverIds]);

  /* You can board anywhere except the last place, and get off anywhere except
   * the first, so each list is the route minus the end you cannot use. */
  const origins = useMemo(
    () => uniqueSorted(allRides.flatMap(r => routeOf(r).slice(0, -1))),
    [allRides],
  );
  const destinations = useMemo(
    () => uniqueSorted(allRides.flatMap(r => routeOf(r).slice(1))),
    [allRides],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = allRides.filter((r) => {
      const route = routeOf(r);

      /* Board as early as possible and alight as late as possible, then
       * require that the two happen in that order: a ride passing B then A
       * is no use to someone travelling A to B. */
      const fromIndex = fromPlace ? route.indexOf(fromPlace) : -1;
      const toIndex = toPlace ? route.lastIndexOf(toPlace) : -1;

      // Boarding at the final stop would go nowhere.
      if (fromPlace && (fromIndex === -1 || fromIndex === route.length - 1)) return false;
      // Alighting at the origin likewise.
      if (toPlace && toIndex <= 0) return false;
      if (fromPlace && toPlace && fromIndex >= toIndex) return false;

      if (when === "today" && !isToday(r.date)) return false;
      if (when === "weekend" && !isWeekend(r.date)) return false;
      if (q && !route.some(name => name.toLowerCase().includes(q))) return false;
      return true;
    });
    return [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allRides, query, fromPlace, toPlace, when]);

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
  // the way -- plus the viewer's own fix once they ask for it. The map fits
  // its bounds to these and to the waypoints drawn over them.
  const mapPoints = useMemo(() => {
    const points = filtered.flatMap(r => [
      parseCoord(r.originCoords, `${originOf(r)} — ${fmtTime(r.date)}`),
      ...(r.waypointStops || []).map(stop => parseCoord(stop.value, `${stop.text} (stop)`)),
      parseCoord(r.destinationCoords, destinationOf(r)),
    ]).filter(Boolean);
    return myPosition ? [myPosition, ...points] : points;
  }, [filtered, myPosition]);

  /* Name is asked for up front: a waypoint with no name is useless in the
   * origin and destination pickers, which is where these end up. */
  const addWaypointAt = useCallback((coords) => {
    swal({
      title: "New waypoint",
      text: "What should this place be called?",
      content: { element: "input", attributes: { placeholder: "e.g. Cedar Ave & 4th" } },
      buttons: { cancel: "Cancel", confirm: { text: "Add" } },
    }).then((name) => {
      const trimmed = (name || "").trim();
      if (!trimmed) return;
      Meteor.call(
        "places.insert",
        { text: trimmed, value: formatPlaceValue(coords.lat, coords.lng) },
        (err) => {
          if (err) swal("Could not add waypoint", err.reason || err.message, "error");
        },
      );
    });
  }, []);

  const editWaypoint = useCallback((place) => {
    swal({
      title: place.text,
      text: "Rename this waypoint, or remove it.",
      content: { element: "input", attributes: { value: place.text } },
      buttons: {
        cancel: "Cancel",
        remove: { text: "Remove", className: "swal-button--danger", value: "remove" },
        confirm: { text: "Save" },
      },
    }).then((result) => {
      if (!result) return;
      if (result === "remove") {
        Meteor.call("places.remove", place._id, (err) => {
          if (err) swal("Could not remove", err.reason || err.message, "error");
        });
        return;
      }
      const trimmed = String(result).trim();
      if (!trimmed || trimmed === place.text) return;
      Meteor.call("places.update", place._id, { text: trimmed }, (err) => {
        if (err) swal("Could not rename", err.reason || err.message, "error");
      });
    });
  }, []);

  const moveWaypoint = useCallback((place, coords) => {
    Meteor.call(
      "places.update",
      place._id,
      { value: formatPlaceValue(coords.lat, coords.lng) },
      (err) => {
        if (err) swal("Could not move", err.reason || err.message, "error");
      },
    );
  }, []);

  const geoBlocked = geo.status === "denied";

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
        <WaypointMap
          places={myPlaces}
          markers={mapPoints}
          canEdit={place => canEditPlace(place, Meteor.userId())}
          onCreate={addWaypointAt}
          onSelect={editWaypoint}
          onMove={moveWaypoint}
          centerOn={geo.status === "granted" ? geo.position : null}
          fill
        />

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
                placeholder="Search origin, stops or destination"
                value={queryInput}
                onChange={e => setQueryInput(e.target.value)}
              />
            </SearchBox>
          )}
        </SearchPanel>

        <CenterPill
          type="button"
          onClick={geo.request}
          disabled={geoBlocked || geo.status === "locating"}
          title={geoBlocked ? "Location is unavailable in this browser" : undefined}
        >
          <PulseDot className="pulse" />
          {geo.status === "locating" ? "Locating…" : "Center on me"}
        </CenterPill>
      </MapPane>

      <ListPane>
        <ListHeader>
          <Eyebrow>{resultsLabel}</Eyebrow>
          <TitleRow>
            <ListTitle>{routeTitle}</ListTitle>
            <SortBtn
              type="button"
              onClick={() => fetchRides(true)}
              disabled={refreshing}
              title="Refresh results"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
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
