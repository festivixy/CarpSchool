import styled from "styled-components";
import {
  glass,
  glassStrong,
  eyebrow,
  inputBase,
  btnBase,
  btnIcon,
  chip,
  chipActive,
  scrollY,
} from "../../styles/tokens";

/* Below this the split collapses to a stacked map + list. */
const BREAK = "900px";

/* The floating TopNav only mounts on desktop (DesktopOnly, 768px), so the
 * overlays only need to clear it above that width. Tying the offsets to
 * BREAK made the nav pill and the search panel collide between 768 and 900. */
const NAV_BREAK = "767px";

export const Screen = styled.div`
  display: grid;
  grid-template-columns: 1fr 440px;
  /* Definite height: the map pane and the list scroller both resolve their
   * height from this, and the list scrolls internally rather than the page. */
  height: 100vh;
  background: var(--cream-0);

  @media (max-width: ${BREAK}) {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100vh;
  }
`;

/* Leaflet needs a container with a resolved height, so the pane takes the
 * full grid row rather than relying on a min-height. */
export const MapPane = styled.div`
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 0;

  /* Leaflet ships its own zoom control; rather than duplicate it with dead
   * buttons, it is repositioned and restyled into the design's glass cluster.
   * These are Leaflet's internal class names — re-check on a Leaflet upgrade. */
  .leaflet-top.leaflet-left {
    top: 92px;
    left: auto;
    right: 24px;
  }

  .leaflet-control-zoom.leaflet-bar {
    ${glass}
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 6px;
    border-radius: var(--r-lg);
  }

  /* Selectors carry the zoom-in / zoom-out classes so they out-specify
   * Leaflet's own .leaflet-bar a:first-child and .leaflet-touch rules. */
  .leaflet-control-zoom .leaflet-control-zoom-in,
  .leaflet-control-zoom .leaflet-control-zoom-out {
    width: 34px;
    height: 34px;
    line-height: 34px;
    border: 0;
    border-radius: var(--r-md);
    background: transparent;
    color: var(--ink-1);
    font-family: var(--font-ui);
    font-size: 18px;
    font-weight: 500;
  }

  .leaflet-control-zoom .leaflet-control-zoom-in:hover,
  .leaflet-control-zoom .leaflet-control-zoom-out:hover {
    background: rgba(255, 255, 255, 0.6);
    color: var(--ink-1);
  }

  /* Keep the at-max-zoom affordance Leaflet provides. */
  .leaflet-control-zoom .leaflet-control-zoom-in.leaflet-disabled,
  .leaflet-control-zoom .leaflet-control-zoom-out.leaflet-disabled {
    background: transparent;
    color: var(--ink-4);
    cursor: default;
  }

  /* Hairline between the two buttons, inset like the design's divider. */
  .leaflet-control-zoom a + a {
    position: relative;
  }

  .leaflet-control-zoom a + a::before {
    content: "";
    position: absolute;
    top: -2px;
    left: 4px;
    right: 4px;
    height: 1px;
    background: var(--glass-stroke);
  }

  /* Attribution is required, but bottom-right is where the Center-on-me pill
   * lives, so move it clear of it. */
  .leaflet-bottom.leaflet-right {
    right: auto;
    left: 0;
  }

  @media (max-width: ${NAV_BREAK}) {
    .leaflet-top.leaflet-left {
      top: 16px;
      right: 16px;
    }
  }

  @media (max-width: ${BREAK}) {
    height: 240px;
    min-height: 240px;
  }
`;

export const ListPane = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--cream-0);
  border-left: 1px solid var(--glass-stroke);

  @media (max-width: ${BREAK}) {
    border-left: 0;
  }
`;

/* top: 92 clears the floating TopNav, which overlays this pane. */
export const SearchPanel = styled.div`
  ${glassStrong}
  position: absolute;
  top: 92px;
  left: 24px;
  z-index: 20;
  width: min(360px, calc(100% - 48px));
  padding: 14px;
  border-radius: 24px;

  @media (max-width: ${NAV_BREAK}) {
    top: 16px;
    left: 16px;
    width: min(360px, calc(100% - 32px));
  }
`;

/* Route entry: indicator column, stacked FROM/TO fields, swap button. */
export const RouteRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
`;

export const RouteIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding-top: 6px;
  flex-shrink: 0;
`;

export const OriginDot = styled.span`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--signal-yellow);
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px var(--signal-yellow);
`;

export const IndicatorBar = styled.span`
  width: 2px;
  height: 16px;
  border-radius: 1px;
  background: var(--ink-4);
  opacity: 0.4;
`;

export const RouteFields = styled.div`
  flex: 1;
  min-width: 0;
`;

export const FieldRow = styled.div`
  padding: 6px 0;
  border-bottom: ${props => (props.$divided ? "1px solid var(--glass-stroke)" : "0")};
`;

export const FieldLabel = styled.label`
  ${eyebrow}
  display: block;
  margin-bottom: 1px;
`;

/* Native select styled to read as the design's plain 14.5px/600 value, so the
 * field genuinely filters without a bespoke combobox. */
export const FieldSelect = styled.select`
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  font-family: var(--font-ui);
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink-1);
  cursor: pointer;
  outline: none;
  text-overflow: ellipsis;

  &:focus-visible {
    outline: 2px solid var(--ink-1);
    outline-offset: 2px;
    border-radius: var(--r-sm);
  }
`;

export const SwapBtn = styled.button`
  ${btnBase}
  ${btnIcon}
  background: var(--cream-2);
  color: var(--ink-1);
  flex-shrink: 0;
  align-self: center;

  &:hover {
    background: var(--cream-3);
  }
`;

export const ChipRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
`;

export const FilterChip = styled.button`
  ${chip}
  ${props => (props.$active ? chipActive : "")}
`;

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 0;
`;

export const SearchInput = styled.input`
  ${inputBase}
  border: 0;
  background: transparent;
  padding: 6px 0;

  &:focus {
    box-shadow: none;
    background: transparent;
  }
`;

/* Bottom-right "Center on me" pill. The dot carries the shared .pulse
 * animation from client/style.css. */
export const CenterPill = styled.button`
  ${glass}
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--r-pill);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-1);
  cursor: pointer;

  &:disabled {
    cursor: default;
    color: var(--ink-3);
  }

  @media (max-width: ${BREAK}) {
    right: 16px;
    bottom: 16px;
  }
`;

export const PulseDot = styled.span`
  position: relative;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--sky);
  color: var(--sky);
  flex-shrink: 0;
`;

export const ListHeader = styled.div`
  padding: 24px 24px 16px;
`;

export const Eyebrow = styled.div`
  ${eyebrow}
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 4px;
  gap: 12px;
`;

export const ListTitle = styled.h2`
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

export const SortBtn = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-3);
  white-space: nowrap;
`;

export const SortValue = styled.span`
  color: var(--ink-1);
  font-weight: 600;
`;

/* flex-basis auto + min-height 0 so the column fills the pane and scrolls
 * inside it when the split is live, and simply sizes to content once the
 * layout collapses and the page scrolls instead. */
export const RidesScroll = styled.div`
  ${scrollY}
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 24px 24px;
`;

export const EmptyState = styled.div`
  padding: 32px 24px;
  color: var(--ink-3);
  font-size: 14px;
  line-height: 1.5;
`;
