import styled, { css } from "styled-components";
import {
  btnBase,
  btnGhost,
  btnCoral,
  btnIcon,
  chip,
  chipActive,
  eyebrow,
  glass,
  glassStrong,
  marker,
  scrollY,
} from "../../styles/tokens";

/* Matches the Find-a-ride breakpoint so the two map screens collapse
 * together. */
const BREAK = "900px";

/* TopNavAuto renders a 76px NavSpacer above /create (the route is not in its
 * FULL_BLEED_PREFIXES), so the map starts below the floating nav rather than
 * running under it as the design shows. Offsets are measured from there. */
const NAV_SPACER = "76px";

/* Design "Offer a ride" (V1 map-first): full-bleed map with a glass-strong
 * form panel floating over its right edge. */
export const Screen = styled.div`
  position: relative;
  min-height: calc(100vh - ${NAV_SPACER});
  overflow: hidden;
  background: var(--cream-0);

  @media (max-width: ${BREAK}) {
    display: flex;
    flex-direction: column;
    overflow: visible;
    padding-bottom: 96px;
  }
`;

/* Positioned, so the floating route chip resolves against the map in both
 * layouts. Leaflet needs a container with a resolved height. */
export const MapPane = styled.div`
  position: absolute;
  inset: 0;

  @media (max-width: ${BREAK}) {
    position: relative;
    inset: auto;
    height: 260px;
    flex-shrink: 0;
  }
`;

/* Distance/duration preview. left: 68px clears Leaflet's own zoom control,
 * which occupies the design's map-controls slot at the top-left. */
export const RouteChip = styled.div`
  ${glass}
  position: absolute;
  top: 24px;
  left: 68px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  border-radius: var(--r-pill);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-1);
  white-space: nowrap;

  @media (max-width: ${BREAK}) {
    top: 16px;
    left: 60px;
    max-width: calc(100% - 76px);
  }
`;

export const Panel = styled.form`
  ${glassStrong}
  position: absolute;
  top: 24px;
  right: 24px;
  bottom: 24px;
  z-index: 20;
  width: 440px;
  max-width: calc(100% - 48px);
  padding: 28px;
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: hidden;

  @media (max-width: ${BREAK}) {
    position: static;
    width: auto;
    max-width: none;
    margin: 16px;
    padding: 20px;
  }
`;

export const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const HeadText = styled.div`
  min-width: 0;
`;

export const Eyebrow = styled.div`
  ${eyebrow}
`;

export const PanelTitle = styled.h2`
  margin: 4px 0 0;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

export const Mark = styled.span`
  ${marker}
`;

export const CloseBtn = styled.button`
  ${btnBase}
  ${btnIcon}
  background: rgba(255, 255, 255, 0.5);
  color: var(--ink-1);
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }
`;

/* The panel is a fixed-height column in the design's 800px canvas. In a real
 * viewport the fields have to scroll while the header and CTA stay put. */
export const PanelBody = styled.div`
  ${scrollY}
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;

  @media (max-width: ${BREAK}) {
    overflow: visible;
  }
`;

export const RouteCard = styled.div`
  ${glass}
  background: rgba(255, 255, 255, 0.55);
  border-radius: 18px;
  padding: 14px;
`;

export const RouteRow = styled.div`
  display: flex;
  gap: 12px;
`;

export const Indicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding-top: 14px;
  flex-shrink: 0;
`;

export const OriginDot = styled.span`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--signal-yellow);
  border: 2.5px solid #fff;
  box-shadow: 0 0 0 1.5px var(--signal-yellow);
  box-sizing: border-box;
`;

export const IndicatorBar = styled.span`
  width: 2px;
  height: 20px;
  border-radius: 1px;
  background: var(--ink-4);
  opacity: 0.3;
`;

export const DestSquare = styled.span`
  width: 11px;
  height: 11px;
  border-radius: 2px;
  background: var(--ink-1);
`;

export const RouteFields = styled.div`
  flex: 1;
  min-width: 0;
`;

export const FieldRow = styled.div`
  padding: 8px 0;
  border-bottom: ${props => (props.$divided ? "1px solid var(--glass-stroke)" : "0")};
`;

export const FieldLabel = styled.label`
  ${eyebrow}
  display: block;
  margin-bottom: 2px;
`;

/* Origin/destination are Places _ids, so the design's typed address becomes a
 * native select styled to read as the same plain 15px/600 value. */
export const FieldSelect = styled.select`
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  font-family: var(--font-ui);
  font-size: 15px;
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
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink-1);
  align-self: flex-start;
  margin-top: 12px;
  flex-shrink: 0;

  &:hover {
    background: #fff;
  }
`;

export const QuickChipRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

export const QuickChip = styled.button`
  ${chip}
  font-size: 11.5px;
  ${props => (props.$active ? chipActive : "")}
`;

export const Group = styled.div`
  min-width: 0;
`;

export const GroupLabel = styled.div`
  ${eyebrow}
  margin-bottom: 8px;
`;

export const WhenRow = styled.div`
  display: flex;
  gap: 8px;
`;

/* The design's white "input button" treatment, shared by date and time. */
const whiteField = css`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-md);
  padding: 10px 12px;
  box-sizing: border-box;
`;

export const DateField = styled.div`
  ${whiteField}
  flex: 1;
  min-width: 0;
`;

export const TimeField = styled.div`
  ${whiteField}
  width: 130px;
  flex-shrink: 0;
`;

export const PlainInput = styled.input`
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  padding: 0;
  font-family: var(--font-ui);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink-1);
  outline: none;

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.45;
  }

  &:focus-visible {
    outline: 2px solid var(--ink-1);
    outline-offset: 2px;
    border-radius: var(--r-sm);
  }
`;

export const StepperRow = styled.div`
  display: flex;
  gap: 12px;
`;

export const StepperCol = styled.div`
  flex: 1;
  min-width: 0;
`;

export const StepperBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 14px;
  padding: 6px 8px;
  border: 1px solid var(--glass-stroke);
`;

export const StepBtn = styled.button`
  ${btnBase}
  ${btnIcon}
  width: 32px;
  height: 32px;
  background: var(--cream-2);
  color: var(--ink-1);
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;

  &:hover {
    background: var(--cream-3);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const StepCenter = styled.div`
  text-align: center;
  min-width: 0;
`;

export const StepValue = styled.div`
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.15;
`;

export const StepCaption = styled.div`
  font-size: 10px;
  color: var(--ink-3);
`;

/* Leaf green while the fare sits at or under the fair-gas-split reference,
 * neutral ink once it is above it. */
export const FairNote = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  color: ${props => (props.$fair ? "var(--leaf)" : "var(--ink-3)")};
`;

export const NoteBox = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 64px;
  background: #fff;
  border: 1px solid var(--glass-stroke);
  border-radius: 14px;
  padding: 12px;
  font-family: var(--font-ui);
  font-size: 13px;
  line-height: 1.4;
  color: var(--ink-2);
  resize: none;
  outline: none;

  &::placeholder {
    color: var(--ink-4);
  }

  &:focus {
    border-color: var(--ink-1);
    box-shadow: 0 0 0 4px var(--signal-yellow-soft);
  }
`;

export const Hint = styled.div`
  margin-top: 4px;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--ink-4);
`;

export const ErrorMessage = styled.div`
  padding: 10px 14px;
  border-radius: var(--r-md);
  background: var(--danger-soft);
  color: var(--danger-deep);
  font-size: 13px;
  line-height: 1.4;
`;

export const Footer = styled.div`
  display: flex;
  gap: 10px;
`;

export const PostBtn = styled.button`
  ${btnBase}
  ${btnCoral}
  flex: 1;
  font-size: 15px;
  padding: 13px 24px;

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`;

export const Notice = styled.div`
  padding: 16px;
  border-radius: var(--r-lg);
  background: var(--signal-yellow-soft);
  color: var(--ink-2);
  font-size: 14px;
  line-height: 1.5;
`;

export const NoticeBtn = styled.button`
  ${btnBase}
  ${btnGhost}
  align-self: flex-start;
`;
