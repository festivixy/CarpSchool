import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTileUrlTemplate } from "../../utils/mapConfig";
import { parsePlaceValue } from "../../utils/placeCoords";
import { attachTileErrorTracking, TileFailureNotice } from "../../utils/leafletIcons";
import {
  MapShell,
  MapCanvas,
  Bar,
  BarHint,
  Count,
  BarButton,
  EmptyNote,
} from "../styles/WaypointMap";

/**
 * Every waypoint on one map, with editing done on the map itself.
 *
 * Click empty map to place a new one (once "Add waypoint" mode is switched
 * on), click a pin to edit it, drag a pin to move it. Pins the viewer may not
 * edit are shown but neither draggable nor clickable, matching what
 * places.update would allow -- see canEditPlace.
 *
 * Purely presentational: it reports intent through the callbacks and holds no
 * opinion about how a waypoint is created or saved.
 */

/* Falls back to the campus the rest of the app defaults to. */
const DEFAULT_CENTER = [49.345196, -123.149805];
const DEFAULT_ZOOM = 13;
const MAX_FIT_ZOOM = 16;
const DOUBLE_CLICK_GUARD_MS = 250;

/* Drawn as markup rather than an image so the pin needs no external asset and
 * can take its colours from the design tokens. */
const pinIcon = (state) => {
  const fill = {
    selected: "var(--signal-yellow, #ffd400)",
    editable: "var(--ink-1, #1a1815)",
    readonly: "var(--ink-3, #8a857c)",
  }[state] || "var(--ink-1, #1a1815)";

  return L.divIcon({
    className: "waypoint-pin",
    html: `<svg width="26" height="34" viewBox="0 0 26 34" fill="none"
             xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
             <path d="M13 33C13 33 25 21.5 25 13A12 12 0 1 0 1 13c0 8.5 12 20 12 20z"
                   fill="${fill}" stroke="var(--cream-0, #faf7f0)" stroke-width="2"/>
             <circle cx="13" cy="13" r="4.5" fill="var(--cream-0, #faf7f0)"/>
           </svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });
};

const WaypointMap = ({
  places,
  markers,
  selectedId,
  canEdit,
  onCreate,
  onSelect,
  onMove,
  height,
  fill,
  readOnlyNote,
  centerOn,
}) => {
  const canvasRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markerLayerRef = useRef(null);
  const didFitRef = useRef(false);
  const clickTimerRef = useRef(null);
  const [addMode, setAddMode] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);

  /* Callbacks are read through a ref so that changing a handler does not tear
   * the map down and rebuild it on every render of the parent. */
  const handlersRef = useRef({ onCreate, onSelect, onMove, canEdit });
  handlersRef.current = { onCreate, onSelect, onMove, canEdit };

  const addModeRef = useRef(addMode);
  addModeRef.current = addMode;

  // Create the map once.
  useEffect(() => {
    if (!canvasRef.current || mapRef.current) return undefined;

    const map = L.map(canvasRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    const tileLayer = L.tileLayer(getTileUrlTemplate(), {
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
      maxZoom: 19,
    });
    tileLayer.addTo(map);
    const detachTileTracking = attachTileErrorTracking(tileLayer, () => setTilesFailed(true));

    /* A plain click creates a waypoint, but only once we know it was not the
     * first half of a double-click (which zooms). Leaflet fires "click"
     * before "dblclick", so the create is delayed and cancelled if a
     * dblclick follows within the window. */
    map.on("click", (e) => {
      const { onCreate: create } = handlersRef.current;
      if (!addModeRef.current || !handlersRef.current.canEdit || !create) return;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      const { lat, lng } = e.latlng;
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        create({ lat, lng });
      }, DOUBLE_CLICK_GUARD_MS);
    });

    map.on("dblclick", () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
    });

    /* Context points sit under the waypoint pins, so a pin is never hidden
     * behind something the viewer cannot act on. */
    markerLayerRef.current = L.layerGroup().addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    /* The container is often laid out after this runs (inside a panel that is
     * still sizing), and Leaflet caches the size it saw at init. */
    const settle = setTimeout(() => map.invalidateSize(), 0);

    /* A filling map also changes size whenever its pane does -- window
     * resizes, the list column reflowing -- and Leaflet does not notice on
     * its own, leaving grey where tiles should be. */
    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(canvasRef.current);
    }

    return () => {
      clearTimeout(settle);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (observer) observer.disconnect();
      detachTileTracking();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  // Recenter on demand (e.g. "center on me").
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !centerOn) return;
    if (!Number.isFinite(centerOn.lat) || !Number.isFinite(centerOn.lng)) return;
    map.setView([centerOn.lat, centerOn.lng], 15);
  }, [centerOn]);

  const markerFor = useCallback((place, coords) => {
    const rule = handlersRef.current.canEdit;
    const editable = typeof rule === "function" ? Boolean(rule(place)) : Boolean(rule);

    let state = "readonly";
    if (place._id === selectedId) state = "selected";
    else if (editable) state = "editable";

    const marker = L.marker([coords.lat, coords.lng], {
      icon: pinIcon(state),
      draggable: editable,
      keyboard: true,
      title: place.text,
      alt: place.text,
      interactive: true,
      riseOnHover: true,
    });

    marker.bindTooltip(place.text, { direction: "top", offset: [0, -30] });

    marker.on("click", (e) => {
      /* Without this the click reaches the map and reads as "create here". */
      L.DomEvent.stopPropagation(e);
      const { onSelect: select } = handlersRef.current;
      if (select) select(place);
    });

    if (editable) {
      marker.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        const { onMove: move } = handlersRef.current;
        if (move) move(place, { lat, lng });
      });
    }

    return marker;
  }, [selectedId]);

  /* Read-only context supplied by the host screen -- on discovery these are
   * the pickup and drop-off points of the rides currently listed. Drawn as
   * dots rather than pins so they never read as something to edit. */
  useEffect(() => {
    const layer = markerLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    markers.forEach((point) => {
      if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return;
      const dot = L.circleMarker([point.lat, point.lng], {
        radius: 5,
        weight: 2,
        color: "var(--sky, #2f6fed)",
        fillColor: "var(--cream-0, #faf7f0)",
        fillOpacity: 1,
        interactive: Boolean(point.label),
      });
      if (point.label) dot.bindTooltip(point.label, { direction: "top" });
      dot.addTo(layer);
    });
  }, [markers]);

  // Redraw pins whenever the places or the selection change.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    layer.clearLayers();

    places.forEach((place) => {
      const coords = parsePlaceValue(place.value);
      if (!coords) return; // legacy or malformed: leave it off the map
      markerFor(place, coords).addTo(layer);
    });
  }, [places, selectedId, markerFor]);

  // Fit once, on the first render that has anything to show. Refitting on
  // every change would yank the view out from under someone mid-edit; use
  // the "Fit to results" button for that afterwards.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || didFitRef.current) return;

    const points = [];
    places.forEach((place) => {
      const coords = parsePlaceValue(place.value);
      if (coords) points.push([coords.lat, coords.lng]);
    });
    markers.forEach((point) => {
      if (Number.isFinite(point.lat) && Number.isFinite(point.lng)) {
        points.push([point.lat, point.lng]);
      }
    });

    if (points.length === 0) return;
    didFitRef.current = true;
    if (points.length === 1) {
      map.setView(points[0], DEFAULT_ZOOM);
    } else {
      map.fitBounds(points, { padding: [36, 36], maxZoom: MAX_FIT_ZOOM });
    }
  }, [places, markers]);

  const fitToResults = () => {
    const map = mapRef.current;
    if (!map) return;

    const points = [];
    places.forEach((place) => {
      const coords = parsePlaceValue(place.value);
      if (coords) points.push([coords.lat, coords.lng]);
    });
    markers.forEach((point) => {
      if (Number.isFinite(point.lat) && Number.isFinite(point.lng)) {
        points.push([point.lat, point.lng]);
      }
    });

    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], DEFAULT_ZOOM);
    } else {
      map.fitBounds(points, { padding: [36, 36], maxZoom: MAX_FIT_ZOOM });
    }
  };

  const plotted = places.filter(place => parsePlaceValue(place.value)).length;
  const hidden = places.length - plotted;

  return (
    <MapShell $fill={fill}>
      <Bar>
        <BarHint>
          <Count>{plotted}</Count>
          {plotted === 1 ? "waypoint" : "waypoints"}
          {hidden > 0 && ` (${hidden} without usable coordinates)`}
        </BarHint>
        <BarHint>
          {canEdit && (
            <BarButton type="button" $active={addMode} onClick={() => setAddMode((prev) => !prev)}>
              {addMode ? "Adding…" : "Add waypoint"}
            </BarButton>
          )}
          <BarButton type="button" onClick={fitToResults}>Fit to results</BarButton>
          {!canEdit && readOnlyNote}
        </BarHint>
      </Bar>
      <MapCanvas ref={canvasRef} $height={height} $fill={fill} data-add-mode={addMode}>
        {tilesFailed && <TileFailureNotice />}
      </MapCanvas>
      {plotted === 0 && canEdit && addMode && (
        <EmptyNote>Click anywhere on the map to add your first waypoint</EmptyNote>
      )}
    </MapShell>
  );
};

WaypointMap.propTypes = {
  places: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    text: PropTypes.string,
    value: PropTypes.string,
    createdBy: PropTypes.string,
  })),
  /** Read-only points for context, drawn as dots. */
  markers: PropTypes.arrayOf(PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
    label: PropTypes.string,
  })),
  selectedId: PropTypes.string,
  /** true/false for a blanket rule, or (place) => boolean for per-pin rights. */
  canEdit: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  onCreate: PropTypes.func,
  onSelect: PropTypes.func,
  onMove: PropTypes.func,
  height: PropTypes.number,
  /** Fill the containing element instead of using a fixed height. */
  fill: PropTypes.bool,
  readOnlyNote: PropTypes.string,
  /** Recenters the map on {lat, lng} when it changes, e.g. "center on me". */
  centerOn: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};

WaypointMap.defaultProps = {
  places: [],
  markers: [],
  selectedId: null,
  canEdit: true,
  onCreate: null,
  onSelect: null,
  onMove: null,
  height: 340,
  fill: false,
  readOnlyNote: "Read only",
  centerOn: null,
};

export default WaypointMap;
