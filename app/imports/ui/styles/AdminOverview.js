import styled, { css } from "styled-components";
import { eyebrow, btnBase, btnPrimary, btnGhost, btnIcon, chip, chipActive, inputBase } from "./tokens";

/**
 * Admin operations dashboard — "paper × ink × signal-yellow".
 *
 * The design is a full-bleed two-pane console. On desktop the legacy NavBar is
 * still mounted above every /admin route, so the shell uses flow layout rather
 * than the prototype's `position:absolute; inset:0`: the ink rail sticks to the
 * top of the scroll container instead of overlapping the site nav.
 */

/* Shared row template for the rides table, so header and body can never drift. */
const rowGrid = css`
  display: grid;
  grid-template-columns: 110px 1fr 100px 80px 110px 60px;
  gap: 12px;
  padding: 12px 20px;
  align-items: center;
`;

const toneMap = {
  live: { bg: "var(--leaf-soft)", fg: "var(--leaf)", dot: "var(--leaf)" },
  completed: { bg: "var(--cream-2)", fg: "var(--ink-3)", dot: "var(--ink-4)" },
  pending: { bg: "var(--signal-yellow-soft)", fg: "var(--signal-yellow-deep)", dot: "var(--signal-yellow)" },
  flagged: { bg: "var(--danger-soft)", fg: "var(--danger)", dot: "var(--danger)" },
  cancelled: { bg: "var(--cream-2)", fg: "var(--ink-3)", dot: "var(--ink-4)" },
  healthy: { bg: "var(--leaf-soft)", fg: "var(--leaf)", dot: "var(--leaf)" },
  degraded: { bg: "rgba(255, 138, 0, 0.16)", fg: "#9a5400", dot: "var(--amber)" },
  down: { bg: "var(--danger-soft)", fg: "var(--danger)", dot: "var(--danger)" },
  unknown: { bg: "var(--cream-2)", fg: "var(--ink-3)", dot: "var(--ink-4)" },
  driver: { bg: "var(--signal-yellow-soft)", fg: "var(--signal-yellow-deep)", dot: "var(--signal-yellow)" },
  rider: { bg: "rgba(37, 71, 216, 0.12)", fg: "var(--sky)", dot: "var(--sky)" },
  both: { bg: "var(--cream-2)", fg: "var(--ink-3)", dot: "var(--ink-4)" },
};

const tone = (key, part) => (toneMap[key] || toneMap.unknown)[part];

/* ── Shell ─────────────────────────────────────────────────────────── */

export const Shell = styled.div`
  display: grid;
  grid-template-columns: 256px 1fr;
  min-height: 100vh;
  background: var(--cream-0);
  color: var(--ink-1);
  font-family: var(--font-ui);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled.aside`
  position: sticky;
  top: 0;
  align-self: start;
  max-height: 100vh;
  overflow-y: auto;
  background: var(--ink-1);
  color: var(--cream-0);
  padding: 22px 14px;
  display: flex;
  flex-direction: column;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 820px) {
    position: static;
    max-height: none;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
    padding: 12px;
  }
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 820px) {
    padding: 0 12px 0 4px;
    border-bottom: 0;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
  }
`;

export const Tag = styled.span`
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  padding: 3px 7px;
  border-radius: var(--r-sm);
  background: var(--signal-yellow);
  color: var(--ink-1);
`;

export const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 14px;
  flex: 1;

  @media (max-width: 820px) {
    flex-direction: row;
    margin-top: 0;
    margin-left: 10px;
  }
`;

export const NavItem = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  text-align: left;
  padding: 9px 11px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  background: ${props => (props.$active ? "rgba(255, 212, 0, 0.12)" : "transparent")};
  color: ${props => (props.$active ? "var(--signal-yellow)" : "rgba(226, 223, 213, 0.82)")};
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: ${props => (props.$active ? "rgba(255, 212, 0, 0.18)" : "rgba(255, 255, 255, 0.06)")};
  }

  @media (max-width: 820px) {
    width: auto;
  }
`;

/* Yellow rail in the sidebar gutter, not a border on the item itself. */
export const Rail = styled.span`
  position: absolute;
  left: -14px;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 2px;
  background: var(--signal-yellow);

  @media (max-width: 820px) {
    display: none;
  }
`;

export const NavLabel = styled.span`
  flex: 1;
`;

export const Badge = styled.span`
  position: relative;
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--r-pill);
  background: ${props => {
    if (props.$danger) return "var(--danger)";
    if (props.$pulse) return "var(--signal-yellow)";
    return "rgba(255, 255, 255, 0.08)";
  }};
  color: ${props => {
    if (props.$danger) return "#fff";
    if (props.$pulse) return "var(--ink-1)";
    return "rgba(200, 197, 187, 0.9)";
  }};
`;

export const BadgePulse = styled.span`
  position: absolute;
  inset: 0;
  border-radius: var(--r-pill);
  background: var(--signal-yellow);
  color: var(--signal-yellow);
  opacity: 0.4;
`;

export const AccountCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: var(--r-md);
  background: rgba(255, 255, 255, 0.04);

  @media (max-width: 820px) {
    margin-left: auto;
    flex-shrink: 0;
  }
`;

export const AccountText = styled.div`
  flex: 1;
  min-width: 0;
`;

export const AccountName = styled.div`
  font-size: 12.5px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AccountSub = styled.div`
  font-size: 10.5px;
  color: rgba(200, 197, 187, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AccountBtn = styled.button`
  border: 0;
  background: transparent;
  color: rgba(200, 197, 187, 0.85);
  padding: 0;
  cursor: pointer;
  display: inline-flex;

  &:hover {
    color: var(--signal-yellow);
  }
`;

/* ── Main column ───────────────────────────────────────────────────── */

export const Main = styled.main`
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

export const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 28px;
  background: var(--cream-0);
  border-bottom: 1px solid var(--glass-stroke);

  @media (max-width: 820px) {
    position: static;
    flex-wrap: wrap;
    padding: 12px 16px;
  }
`;

export const SearchWrap = styled.div`
  flex: 1;
  max-width: 380px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-md);

  &:focus-within {
    border-color: var(--ink-1);
  }
`;

export const SearchInput = styled.input`
  ${inputBase}
  flex: 1;
  min-width: 0;
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;
  font-size: 13px;

  &:focus {
    background: transparent;
    box-shadow: none;
  }
`;

export const KeyHint = styled.span`
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--r-sm);
  background: var(--cream-2);
  color: var(--ink-3);
  flex-shrink: 0;
`;

export const TopSpacer = styled.div`
  flex: 1;
`;

export const Clock = styled.span`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-3);
  white-space: nowrap;
`;

export const HealthPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: var(--r-pill);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  background: ${props => tone(props.$tone, "bg")};
  color: ${props => tone(props.$tone, "fg")};
`;

export const PillDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
`;

export const BellWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

export const BellBtn = styled.button`
  ${btnBase}
  ${btnIcon}
  position: relative;
  background: var(--cream-1);
  color: var(--ink-1);

  &:hover {
    background: var(--cream-2);
  }
`;

export const BellDot = styled.span`
  position: absolute;
  top: 6px;
  right: 5px;
  min-width: 15px;
  height: 15px;
  padding: 0 3px;
  border-radius: var(--r-pill);
  background: var(--signal-yellow);
  color: var(--ink-1);
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  line-height: 15px;
  text-align: center;
`;

export const NotifPanel = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 300px;
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
  z-index: 20;
  background: #fff;
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-md);
  box-shadow: var(--glass-shadow);
`;

export const NotifRow = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 8px 10px;
  border-radius: var(--r-sm);
  cursor: pointer;
  font-family: var(--font-ui);

  &:hover {
    background: var(--cream-1);
  }
`;

export const NotifTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
`;

export const NotifDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--signal-yellow-deep);
  flex-shrink: 0;
`;

export const NotifBody = styled.div`
  font-size: 11.5px;
  color: var(--ink-3);
  line-height: 1.4;
`;

export const NotifTime = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-4);
  margin-top: 2px;
`;

export const NotifEmpty = styled.div`
  padding: 10px;
  font-size: 12px;
  color: var(--ink-3);
`;

export const Content = styled.div`
  flex: 1;
  padding: 24px 28px 40px;
  background: var(--cream-0);
  min-width: 0;

  @media (max-width: 820px) {
    padding: 16px 16px 40px;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
`;

export const Eyebrow = styled.div`
  ${eyebrow}
`;

export const Title = styled.h1`
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.03em;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const GhostBtn = styled.button`
  ${btnBase}
  ${btnGhost}
  padding: 9px 15px;
  font-size: 13px;
`;

export const PrimaryBtn = styled.button`
  ${btnBase}
  ${btnPrimary}
  padding: 9px 15px;
  font-size: 13px;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

/* ── Stat cards ────────────────────────────────────────────────────── */

export const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.$cols}, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 22px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const StatCard = styled.div`
  background: #fff;
  border: 1px solid var(--glass-stroke);
  border-radius: 12px;
  padding: 14px;
  min-width: 0;
`;

export const StatLabel = styled.div`
  ${eyebrow}
`;

export const StatTop = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 6px;
`;

export const StatValue = styled.div`
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: ${props => props.$tint || "var(--ink-1)"};
`;

export const StatDelta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: ${props => (props.$tone === "danger" ? "var(--danger)" : "var(--leaf)")};
`;

export const LiveDot = styled.span`
  position: relative;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
`;

export const Spark = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 18px;
  margin-top: 10px;
`;

export const SparkBar = styled.div`
  flex: 1;
  min-width: 2px;
  border-radius: 1px;
  height: ${props => Math.max(3, props.$pct)}%;
  background: ${props => (props.$active ? props.$tint || "var(--ink-1)" : "var(--cream-2)")};
`;

/* ── Body grid ─────────────────────────────────────────────────────── */

export const Body = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 18px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const TableCard = styled.section`
  background: #fff;
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  overflow: hidden;
  min-width: 0;
`;

export const TableHead = styled.div`
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--glass-stroke);
`;

export const CardH3 = styled.h3`
  margin: 0;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.025em;
`;

export const SubLine = styled.div`
  font-size: 12px;
  color: var(--ink-3);
  margin-top: 2px;
`;

export const ChipRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const FilterChip = styled.button`
  ${chip}
  font-size: 11px;
  padding: 5px 11px;
  ${props => props.$active && chipActive}
  ${props => props.$danger && !props.$active && css`
    background: var(--danger-soft);
    color: var(--danger);
    border-color: transparent;

    &:hover {
      background: var(--danger-soft);
    }
  `}
`;

export const HeadRow = styled.div`
  ${rowGrid}
  padding-top: 10px;
  padding-bottom: 10px;
  background: var(--cream-1);
  border-bottom: 1px solid var(--glass-stroke);
`;

export const HeadCell = styled.div`
  ${eyebrow}
  font-size: 10px;
  font-weight: 600;

  @media (max-width: 820px) {
    &:nth-child(4),
    &:nth-child(5) {
      display: none;
    }
  }
`;

export const BodyRow = styled.div`
  ${rowGrid}
  font-size: 13px;
  cursor: pointer;
  border-bottom: 1px solid var(--glass-stroke);
  background: transparent;
  transition: background 0.12s ease;

  &:last-of-type {
    border-bottom: 0;
  }

  &:hover {
    background: var(--cream-0);
  }

  &:focus-visible {
    outline: 2px solid var(--signal-yellow-deep);
    outline-offset: -2px;
  }
`;

/* Both header and body hide the same two columns on narrow viewports. */
export const HideSmall = styled.div`
  @media (max-width: 820px) {
    display: none;
  }
`;

export const IdCell = styled.div`
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink-2);
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RouteCell = styled.div`
  min-width: 0;
`;

export const RouteTop = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-weight: 500;
`;

export const RouteText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

export const FlagChip = styled.span`
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: var(--r-sm);
  font-size: 10px;
  font-weight: 600;
  background: ${props => tone(props.$tone, "bg")};
  color: ${props => tone(props.$tone, "fg")};
`;

export const DriverRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  min-width: 0;
`;

export const DriverName = styled.span`
  font-size: 11.5px;
  color: var(--ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  font-size: 11px;
  font-weight: 600;
  background: ${props => tone(props.$tone, "bg")};
  color: ${props => tone(props.$tone, "fg")};
`;

export const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${props => tone(props.$tone, "dot")};
`;

export const SeatCell = styled(HideSmall)`
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-2);
`;

export const WhenCell = styled(HideSmall)`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-3);
`;

export const ChevCell = styled.div`
  display: flex;
  justify-content: flex-end;
  color: var(--ink-3);
`;

export const TableFoot = styled.div`
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  border-top: 1px solid var(--glass-stroke);
  background: var(--cream-0);
`;

export const FootText = styled.span`
  font-size: 11.5px;
  color: var(--ink-3);
`;

export const Pager = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const PageBtn = styled.button`
  ${chip}
  font-size: 11px;
  padding: 5px 10px;
  ${props => props.$active && chipActive}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const PageGap = styled.span`
  padding: 0 4px;
  font-size: 11px;
  color: var(--ink-3);
`;

/* ── Side column ───────────────────────────────────────────────────── */

export const SideCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`;

export const Panel = styled.section`
  background: #fff;
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  padding: 18px;
`;

export const PanelHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
`;

export const PanelCount = styled.span`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--signal-yellow-deep);
`;

export const QueueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const QueueItem = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: var(--r-md);
  background: var(--cream-1);
`;

export const QueueBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const QueueTop = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
`;

export const QName = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const KindBadge = styled.span`
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 1px 5px;
  border-radius: 3px;
  flex-shrink: 0;
  background: ${props => tone(props.$tone, "bg")};
  color: ${props => tone(props.$tone, "fg")};
`;

export const QAge = styled.span`
  margin-left: auto;
  font-size: 10.5px;
  color: var(--ink-3);
  white-space: nowrap;
`;

export const QNote = styled.div`
  font-size: 12px;
  color: var(--ink-2);
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

export const QActions = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const smallBtn = css`
  ${btnBase}
  font-size: 11px;
  padding: 5px 11px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ApproveBtn = styled.button`
  ${smallBtn}
  background: var(--ink-1);
  color: var(--cream-0);

  &:hover:enabled {
    background: #000;
  }
`;

export const ReviewBtn = styled.button`
  ${smallBtn}
  background: #fff;
  color: var(--ink-1);
  border: 1px solid var(--glass-stroke);
`;

export const RejectBtn = styled.button`
  ${smallBtn}
  background: #fff;
  color: var(--danger);
  border: 1px solid var(--glass-stroke);
`;

export const RejectRow = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 8px;
`;

export const RejectInput = styled.input`
  ${inputBase}
  flex: 1;
  min-width: 0;
  font-size: 12px;
  padding: 5px 9px;
  background: #fff;
`;

export const QError = styled.div`
  margin-top: 6px;
  font-size: 11.5px;
  color: var(--danger);
`;

export const FullQueueBtn = styled.button`
  ${btnBase}
  ${btnGhost}
  width: 100%;
  margin-top: 10px;
  font-size: 12px;
  padding: 9px 14px;
`;

export const ServiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
`;

export const ServiceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
`;

export const ServiceDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${props => tone(props.$tone, "dot")};
`;

export const ServiceName = styled.span`
  flex: 1;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ServiceStatus = styled.span`
  font-size: 11px;
  color: var(--ink-3);
`;

export const ServiceLatency = styled.span`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-3);
  min-width: 50px;
  text-align: right;
`;

/* ── Live feed (terminal card) ─────────────────────────────────────── */

export const FeedCard = styled.section`
  background: var(--ink-1);
  color: var(--cream-0);
  border-radius: var(--r-lg);
  padding: 18px;
`;

export const FeedHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const FeedTitle = styled.h3`
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--cream-0);
`;

export const FeedPulse = styled.span`
  position: relative;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #35c27f;
  color: #35c27f;
`;

export const FeedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11.5px;
`;

export const FeedRow = styled.div`
  display: flex;
  gap: 10px;
  color: rgba(226, 223, 213, 0.88);
`;

export const FeedTime = styled.span`
  color: rgba(150, 147, 138, 0.9);
  flex-shrink: 0;
`;

export const FeedKind = styled.span`
  font-weight: 600;
  min-width: 88px;
  flex-shrink: 0;
  color: ${props => {
    if (props.$tone === "danger") return "#f08d7a";
    if (props.$tone === "good") return "#6fd6a4";
    return "var(--signal-yellow)";
  }};
`;

export const FeedText = styled.span`
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
`;

export const FeedEmpty = styled.div`
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: rgba(150, 147, 138, 0.9);
`;

/* ── States ────────────────────────────────────────────────────────── */

export const Empty = styled.div`
  padding: 14px 0;
  color: var(--ink-3);
  font-size: 13px;
`;

export const ErrorText = styled.div`
  padding: 10px 0;
  color: var(--ink-3);
  font-size: 12.5px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const RetryBtn = styled.button`
  ${chip}
  font-size: 11px;
  padding: 4px 10px;
`;

/* Skeletons sit at the real row heights so nothing reflows once data lands,
 * and read as "loading" rather than as a zero. */
export const Skeleton = styled.div`
  height: ${props => props.$h || 14}px;
  width: ${props => props.$w || "100%"};
  border-radius: var(--r-sm);
  background: var(--cream-2);
  opacity: 0.75;
`;

export const SkeletonStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0;
`;
