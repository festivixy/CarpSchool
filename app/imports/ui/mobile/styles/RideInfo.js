import styled, { css } from "styled-components";
import {
  glass,
  eyebrow,
  marker,
  btnBase,
  btnCoral,
  btnGhost,
  inputBase,
} from "../../styles/tokens";

/* The design's RideDetailFocus root is cream-1 so the #fff hero and sidecards
 * read as paper laid on paper. */
export const Page = styled.div`
  min-height: 100vh;
  background: var(--cream-1);
  font-family: var(--font-ui);
  color: var(--ink-1);
  padding: 24px 48px 40px;

  /* Below the app's mobile breakpoint the fixed bottom nav needs clearance. */
  @media (max-width: 767px) {
    padding: 16px 16px 96px;
  }
`;

export const Inner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ink-3);

  /* The fixed mobile BackButton owns this corner below the mobile breakpoint. */
  @media (max-width: 767px) {
    display: none;
  }
`;

export const Crumb = styled.button`
  background: none;
  border: 0;
  padding: 0;
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--ink-3);
  cursor: pointer;

  &:hover {
    color: var(--ink-1);
  }
`;

export const CrumbCurrent = styled.span`
  color: var(--ink-1);
`;

export const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const HeroCard = styled.div`
  border-radius: 24px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--glass-stroke);
`;

export const MapWrap = styled.div`
  position: relative;
  height: 280px;
  width: 100%;

  /* Only the map fills the frame. The rule used to target every child, which
   * stretched the absolutely-positioned route pill to the full map. */
  > *:first-child {
    height: 100%;
    width: 100%;
  }

  @media (max-width: 720px) {
    height: 220px;
  }
`;

export const HeroBody = styled.div`
  padding: 22px;
`;

export const Eyebrow = styled.div`
  ${eyebrow}
`;

export const RouteTitle = styled.h1`
  margin: 8px 0 6px;
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.08;

  @media (max-width: 720px) {
    font-size: 28px;
  }
`;

export const Mark = styled.span`
  ${marker}
`;

export const NoteText = styled.p`
  font-family: var(--font-ui);
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink-2);
  max-width: 580px;
  margin: 0 0 16px;
`;

export const DataRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid var(--glass-stroke);
  border-bottom: 1px solid var(--glass-stroke);

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const DataCell = styled.div``;

export const MetaLabel = styled.div`
  ${eyebrow}
`;

export const MonoValue = styled.div`
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  margin-top: 4px;
`;

export const FareValue = styled.div`
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  margin-top: 2px;
`;

export const Seats = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 4px;
`;

export const SeatDot = styled.div`
  color: ${props => (props.$filled ? "var(--signal-yellow-deep)" : "var(--cream-3)")};
  display: inline-flex;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 16px;
  flex-wrap: wrap;
`;

export const PrimaryBtn = styled.button`
  ${btnBase}
  ${btnCoral}
  flex: 1;
  ${props => props.$disabled && css`
    opacity: 0.5;
    pointer-events: none;
  `}
`;

export const GhostBtn = styled.button`
  ${btnBase}
  ${btnGhost}
`;

export const ErrorNote = styled.div`
  margin-top: 8px;
  font-size: 13px;
  color: var(--danger);
`;

export const SuccessNote = styled.div`
  margin-top: 8px;
  font-size: 13px;
  color: var(--leaf);
`;

export const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--cream-1);
  color: var(--ink-3);
  margin-left: 8px;
`;

export const SideCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

/* Sidecards are solid paper — glass is reserved for panels over the map. */
export const Card = styled.div`
  background: #fff;
  border: 1px solid var(--glass-stroke);
  border-radius: 20px;
  padding: 18px;
`;

export const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const CardTitle = styled.div`
  ${eyebrow}
`;

export const SeatCount = styled.div`
  font-size: 11px;
  color: var(--ink-3);
`;

export const DriverRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
`;

export const DriverName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-1);
`;

export const DriverMeta = styled.div`
  font-size: 12.5px;
  color: var(--ink-3);
`;

export const StatRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--ink-3);
`;

export const CredBox = styled.div`
  background: var(--cream-1);
  border-radius: 12px;
  padding: 12px;
  font-size: 12.5px;
`;

export const CredRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
`;

export const CredKey = styled.span`
  color: var(--ink-3);
`;

export const CredValue = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--leaf);
  font-weight: 600;
`;

export const RiderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const PersonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const PersonName = styled.div`
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink-1);
`;

export const PersonSub = styled.div`
  font-size: 11.5px;
  color: var(--ink-3);
`;

/* Pushed to the far end of PersonRow's flex layout via margin-left, so the
 * two-avatar rows keep their existing look when no remove control renders. */
export const RemoveBtn = styled.button`
  ${btnBase}
  margin-left: auto;
  padding: 5px 10px;
  font-size: 11px;
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`;

/* The share code needs to be selectable/copyable even if a global reset sets
 * user-select: none elsewhere in the app. */
export const ShareCodeValue = styled.span`
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 6px 10px;
  background: var(--cream-1);
  border-radius: 8px;
  user-select: text;
`;

export const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
`;

export const EditField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const EditInput = styled.input`
  ${inputBase}
`;

export const EditTextarea = styled.textarea`
  ${inputBase}
  min-height: 70px;
  resize: vertical;
`;

export const OpenSeatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.5;
`;

export const OpenSeatIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--cream-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const OpenSeatLabel = styled.div`
  font-size: 13px;
  color: var(--ink-3);
`;

export const HeadsUp = styled.div`
  background: var(--signal-yellow-soft);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  > svg {
    flex-shrink: 0;
  }
`;

/* Deviation from the handoff: it sets this copy in --signal-yellow-deep on
 * --signal-yellow-soft (~1.9:1). Ink-2 keeps the yellow as an icon accent. */
export const HeadsUpText = styled.div`
  flex: 1;
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--ink-2);
`;

export const ItinCard = styled.div`
  background: #fff;
  border: 1px solid var(--glass-stroke);
  border-radius: 20px;
  padding: 22px;
`;

export const ItinRow = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 720px) {
    flex-direction: column;
    gap: 14px;
  }
`;

export const ItinStep = styled.div`
  flex: 1;
  min-width: 0;
`;

export const StepTile = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  color: var(--ink-1);
  background: ${props => (props.$first ? "var(--signal-yellow)" : "var(--cream-1)")};
`;

export const StepTime = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--ink-3);
`;

export const StepLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-top: 2px;
`;

export const StepSub = styled.div`
  font-size: 12px;
  color: var(--ink-3);
  margin-top: 2px;
`;

export const StepConnector = styled.div`
  flex: 0 0 28px;
  height: 1px;
  background: var(--cream-3);
  align-self: center;
  margin-top: 22px;

  @media (max-width: 720px) {
    display: none;
  }
`;

export const ChatCard = styled.div`
  ${glass}
  border-radius: var(--r-lg);
  display: flex;
  flex-direction: column;
  height: 420px;
  overflow: hidden;
`;

export const ChatHead = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid var(--glass-stroke);
`;

export const Bubbles = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Bubble = styled.div`
  max-width: 78%;
  padding: 9px 13px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.35;
  ${props => (props.$mine
    ? css`
        align-self: flex-end;
        background: var(--signal-yellow);
        color: var(--ink-1);
        box-shadow: 0 2px 8px -2px rgba(224, 168, 0, 0.4);
      `
    : css`
        align-self: flex-start;
        background: #fff;
        color: var(--ink-1);
        border: 1px solid var(--glass-stroke);
      `)}
  ${props => props.$system && css`
    align-self: center;
    background: transparent;
    border: 0;
    color: var(--ink-4);
    font-size: 12px;
  `}
`;

export const Composer = styled.form`
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--glass-stroke);
`;

export const ComposerInput = styled.input`
  ${inputBase}
`;

export const SendBtn = styled.button`
  ${btnBase}
  ${btnCoral}
  padding: 0 14px;
`;

export const Centered = styled.div`
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: 40px 20px;
`;

export const ErrorTitle = styled.h2`
  font-family: var(--font-display);
  font-size: 22px;
  margin: 0;
`;

export const ErrorBody = styled.p`
  color: var(--ink-3);
  margin: 0;
  max-width: 320px;
`;

/* Design handoff: glass pill over the hero map carrying the routed figures. */
export const RoutePill = styled.div`
  ${glass}
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--r-pill);
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-1);
`;
