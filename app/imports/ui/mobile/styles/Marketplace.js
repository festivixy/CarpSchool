import styled from "styled-components";
import {
  eyebrow,
  inputBase,
  btnBase,
  btnIcon,
  chip,
  chipActive,
  hr,
} from "../../styles/tokens";

const BREAK = "900px";

export const Screen = styled.div`
  display: grid;
  grid-template-columns: 1fr 440px;
  min-height: calc(100vh - 64px);
  background: var(--cream-0);

  @media (max-width: ${BREAK}) {
    grid-template-columns: 1fr;
  }
`;

/* Leaflet needs a container with a resolved height, so give the pane one
 * rather than relying on the grid row alone. */
export const MapPane = styled.div`
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 64px);

  @media (max-width: ${BREAK}) {
    height: 240px;
    min-height: 240px;
  }
`;

export const ListPane = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--cream-0);
  border-left: 1px solid var(--glass-stroke);

  @media (max-width: ${BREAK}) {
    border-left: 0;
  }
`;

/* top: 92 clears the floating TopNav, which overlays this pane. */
export const SearchPanel = styled.div`
  position: absolute;
  top: 92px;
  left: 24px;
  z-index: 20;
  width: min(360px, calc(100% - 48px));
  padding: 14px;
  border-radius: 24px;

  @media (max-width: ${BREAK}) {
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

export const MapControls = styled.div`
  position: absolute;
  top: 92px;
  right: 24px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border-radius: var(--r-lg);

  @media (max-width: ${BREAK}) {
    top: 16px;
    right: 16px;
  }
`;

export const ControlDivider = styled.span`
  ${hr}
  margin: 0 4px;
`;

/* Bottom-right "Center on me" pill. The dot carries the shared .pulse
 * animation from client/style.css. */
export const CenterPill = styled.button`
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 0;
  border-radius: var(--r-pill);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-1);
  cursor: pointer;

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

export const ControlBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--ink-1);
  font-size: 18px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }
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

export const RidesScroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 24px 32px;
  overflow-y: auto;
`;

export const EmptyState = styled.div`
  padding: 32px 24px;
  color: var(--ink-3);
  font-size: 14px;
  line-height: 1.5;
`;
