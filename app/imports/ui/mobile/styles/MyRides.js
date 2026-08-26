import styled from "styled-components";
import {
  btnBase,
  btnCoral,
  btnGhost,
  chip,
  chipActive,
  eyebrow,
  glassStrong,
  marker,
} from "../../styles/tokens";

/* Design handoff — "My rides", V1 Dashboard.
 *
 * Two elements of the mock ship omitted rather than faked: the featured
 * driver's star rating and the history table's per-ride star column. The app
 * has no ratings or reviews model to read from, and inventing numbers would
 * be worse than leaving them out — the same call the Profile screen made for
 * its RATING and STREAK stats (see styles/Profile.js). */

export const Page = styled.div`
  min-height: 100vh;
  background: var(--cream-0);
  font-family: var(--font-ui);
  color: var(--ink-1);
`;

/* The design offsets content 88px below the floating nav; TopNavAuto already
 * renders NavSpacer for this route, so only the design's own padding is set
 * here. */
export const Inner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 48px 40px;
  display: flex;
  flex-direction: column;

  @media (max-width: 900px) {
    padding: 24px 16px 96px;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: ${props => (props.$tight ? "14px" : "22px")};

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Eyebrow = styled.div`
  ${eyebrow}
`;

export const H1 = styled.h1`
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 700;
  letter-spacing: -0.015em;

  @media (max-width: 720px) {
    font-size: 32px;
  }
`;

export const Mark = styled.span`
  ${marker}
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

export const GhostBtn = styled.button`
  ${btnBase}
  ${btnGhost}
`;

export const CoralBtn = styled.button`
  ${btnBase}
  ${btnCoral}
`;

/* Revealed by the header's Filter button. The one axis this screen genuinely
 * has is the caller's role on each ride, so that is what it filters on. */
export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
`;

export const FilterChip = styled.button`
  ${chip}
  ${props => (props.$active ? chipActive : "")}
`;

export const FeaturedCard = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  min-height: 280px;
  margin-bottom: 26px;
  background: var(--ink-1);
  color: var(--cream-0);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 24px 60px -20px rgba(60, 40, 20, 0.3);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const FeatLeft = styled.div`
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
`;

export const PillRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
`;

export const NextUpPill = styled.span`
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border-radius: var(--r-pill);
  background: rgba(255, 255, 255, 0.12);
  color: var(--signal-yellow-soft);
`;

export const PillTime = styled.span`
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: rgba(246, 245, 240, 0.62);
`;

export const RouteRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: ${props => (props.$last ? "20px" : "8px")};

  > svg {
    flex-shrink: 0;
  }
`;

export const OriginDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--signal-yellow);
  flex-shrink: 0;
`;

export const RouteBar = styled.span`
  display: block;
  width: 2px;
  height: 18px;
  margin-left: 4px;
  background: rgba(246, 245, 240, 0.5);
`;

export const PlaceName = styled.div`
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;

  @media (max-width: 720px) {
    font-size: 24px;
  }
`;

export const FeatData = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  margin-bottom: 24px;
`;

export const DataItem = styled.div``;

export const DataLabel = styled.div`
  ${eyebrow}
  color: rgba(246, 245, 240, 0.7);
`;

export const DataValue = styled.div`
  font-family: var(--font-mono);
  font-size: 18px;
  margin-top: 4px;
`;

export const FeatFooter = styled.div`
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
`;

export const DriverBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const DriverName = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

export const DriverRole = styled.span`
  font-weight: 400;
  color: rgba(246, 245, 240, 0.7);
`;

export const DriverMeta = styled.div`
  font-size: 12px;
  color: rgba(246, 245, 240, 0.7);
`;

export const FeatActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const FeatGhost = styled.button`
  ${btnBase}
  background: rgba(255, 255, 255, 0.1);
  color: var(--cream-0);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const FeatBtn = styled.button`
  ${btnBase}
  ${btnCoral}
`;

/* Not in the mock's two-button footer. Kept because /ride/:rideId offers no
 * cancel or leave, which would leave the app with no path to either; styled
 * down to text weight so the design's pair still leads. */
export const FeatQuiet = styled.button`
  ${btnBase}
  padding: 11px 12px;
  background: transparent;
  color: rgba(246, 245, 240, 0.55);

  &:hover {
    color: var(--cream-0);
  }
`;

export const FeatMap = styled.div`
  position: relative;
  min-height: 280px;
  border-left: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 720px) {
    border-left: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    min-height: 220px;
  }
`;

/* The mock inverts its flat SVG map so it reads inside the dark card. Real
 * tiles cannot be inverted without producing hue garbage, so the live map is
 * desaturated and dimmed to land in the same place; the decorative fallback
 * keeps the mock's literal treatment.
 *
 * RouteMapView ships its own rounded, shadowed shell plus zoom and refresh
 * chrome, none of which this clean panel has. Reset and hidden here rather
 * than in the shared component, which other screens rely on. */
export const MapPane = styled.div`
  position: absolute;
  inset: 0;
  ${props => (props.$decorative
    ? "opacity: 0.4; filter: invert(0.85);"
    : "filter: grayscale(0.35) brightness(0.72) contrast(1.05);")}

  > * {
    width: 100%;
    height: 100%;
  }

  div {
    min-height: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .leaflet-control-container {
    display: none;
  }

  button {
    display: none;
  }
`;

/* Dissolves the map into the card's left edge, as the mock's does. */
export const MapScrim = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, var(--ink-1) 0%, transparent 22%);
`;

export const DecorOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

/* The mock's weather alert. No forecast source exists, so the surface is kept
 * and repointed at the driver's own ride note; it does not render at all when
 * the driver left none. */
export const GlassPill = styled.div`
  ${glassStrong}
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 18px;
  padding: 14px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--ink-1);
  font-size: 12.5px;
  line-height: 1.35;

  > svg {
    flex-shrink: 0;
  }
`;

export const GlassPillText = styled.div`
  flex: 1;
`;

export const GlassPillLead = styled.span`
  font-weight: 600;
`;

export const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 30px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const StatCard = styled.div`
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: 18px;
  padding: 18px;
`;

export const StatLabel = styled.div`
  ${eyebrow}
`;

export const StatValue = styled.div`
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
  margin: 8px 0 4px;
  color: ${props => props.$accent || "var(--ink-1)"};

  @media (max-width: 720px) {
    font-size: 32px;
  }
`;

export const StatUnit = styled.div`
  font-size: 12px;
  color: var(--ink-3);
`;

export const SectionHead = styled.div`
  display: flex;
  align-items: baseline;
  gap: 18px;
  justify-content: ${props => (props.$spread ? "space-between" : "flex-start")};
  margin-bottom: 14px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.025em;
`;

export const SectionCount = styled.span`
  font-size: 13px;
  color: var(--ink-3);
`;

export const LinkBtn = styled.button`
  padding: 0;
  background: transparent;
  border: 0;
  color: var(--ink-3);
  font-family: var(--font-ui);
  font-size: 13px;
  cursor: pointer;

  &:hover {
    color: var(--ink-1);
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 30px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const Table = styled.div`
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: 16px;
  overflow: hidden;
`;

/* Four columns, not the mock's five: the trailing star-rating column is the
 * omitted ratings element described at the top of this file. */
export const Row = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr 1fr 80px;
  gap: 16px;
  padding: 14px 20px;
  align-items: center;
  border-bottom: 1px solid var(--glass-stroke);

  &:last-child {
    border-bottom: 0;
  }

  @media (max-width: 540px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

export const DateCell = styled.div`
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: 0.1em;
  color: var(--ink-3);
`;

export const RouteCell = styled.div`
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const WithCell = styled.div`
  font-size: 13px;
  color: var(--ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const FareCell = styled.div`
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  text-align: right;

  @media (max-width: 540px) {
    text-align: left;
  }
`;

export const Empty = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: var(--ink-3);
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: 16px;
  margin-bottom: ${props => (props.$spaced ? "26px" : "0")};
`;
