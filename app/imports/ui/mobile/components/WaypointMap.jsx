import React, { useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTileUrlTemplate } from "../../utils/mapConfig";
import { parsePlaceValue } from "../../utils/placeCoords";
import {
  MapShell,
  MapCanvas,
  Bar,
  BarHint,
  Count,
  EmptyNote,
} from "../styles/WaypointMap";

/**
 * Every waypoint on one map, with editing done on the map itself.
 *
 * Click empty map to place a new one, click a pin to edit it, drag a pin to
 * move it. Pins the viewer may not edit are shown but neither draggable nor
 * clickable, matching what places.update would allow -- see canEditPlace.
 *
 * Purely presentational: it reports intent through the callbacks and holds no
 * opinion about how a waypoint is created or saved.
 */

/* Falls back to the campus the rest of the app defaults to. */
const DEFAULT_CENTER = [49.345196, -123.149805];
const DEFAULT_ZOOM = 13;
const MAX_FIT_ZOOM = 16;

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
  selectedId,
  canEdit,
  onCreate,
  onSelect,
  onMove,
  height,
  readOnlyNote,
}) => {
  const canvasRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const didFitRef = useRef(false);

  /* Callbacks are read through a ref so that changing a handler does not tear
   * the map down and rebuild it on every render of the parent. */
  const handlersRef = useRef({ onCreate, onSelect, onMove, canEdit });
  handlersRef.current = { onCreate, onSelect, onMove, canEdit };

  // Create the map once.
  useEffect(() => {
    if (!canvasRef.current || mapRef.current) return undefined;

    const map = L.map(canvasRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer(getTileUrlTemplate(), {
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e) => {
      const { onCreate: create } = handlersRef.current;
      if (!handlersRef.current.canEdit || !create) return;
      create({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    /* The container is often laid out after this runs (inside a panel that is
     * still sizing), and Leaflet caches the size it saw at init. */
    const settle = setTimeout(() => map.invalidateSize(), 0);

    return () => {
      clearTimeout(settle);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

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

  // Redraw pins whenever the places or the selection change.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const points = [];
    places.forEach((place) => {
      const coords = parsePlaceValue(place.value);
      if (!coords) return; // legacy or malformed: leave it off the map
      markerFor(place, coords).addTo(layer);
      points.push([coords.lat, coords.lng]);
    });

    /* Fit once, on the first render that has anything to show. Refitting on
     * every change would yank the view out from under someone mid-edit. */
    if (!didFitRef.current && points.length > 0) {
      didFitRef.current = true;
      if (points.length === 1) {
        map.setView(points[0], DEFAULT_ZOOM);
      } else {
        map.fitBounds(points, { padding: [36, 36], maxZoom: MAX_FIT_ZOOM });
      }
    }
  }, [places, selectedId, markerFor]);

  const plotted = places.filter(place => parsePlaceValue(place.value)).length;
  const hidden = places.length - plotted;

  return (
    <MapShell>
      <Bar>
        <BarHint>
          <Count>{plotted}</Count>
          {plotted === 1 ? "waypoint" : "waypoints"}
          {hidden > 0 && ` (${hidden} without usable coordinates)`}
        </BarHint>
        <BarHint>
          {canEdit ? "Click the map to add · click a pin to edit" : readOnlyNote}
        </BarHint>
      </Bar>
      <MapCanvas ref={canvasRef} $height={height} />
      {plotted === 0 && canEdit && (
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
  selectedId: PropTypes.string,
  /** true/false for a blanket rule, or (place) => boolean for per-pin rights. */
  canEdit: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  onCreate: PropTypes.func,
  onSelect: PropTypes.func,
  onMove: PropTypes.func,
  height: PropTypes.number,
  readOnlyNote: PropTypes.string,
};

WaypointMap.defaultProps = {
  places: [],
  selectedId: null,
  canEdit: true,
  onCreate: null,
  onSelect: null,
  onMove: null,
  height: 340,
  readOnlyNote: "Read only",
};

export default WaypointMap;
