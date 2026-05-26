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

export const Page = styled.div`
  min-height: 100vh;
  background: var(--cream-0);
  font-family: var(--font-ui);
  color: var(--ink-1);
  padding: 16px 16px 96px;
`;

export const Inner = styled.div`
  max-width: 920px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const HeroCard = styled.div`
  border-radius: var(--r-xl);
  overflow: hidden;
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
`;

export const MapWrap = styled.div`
  position: relative;
  height: 260px;
  width: 100%;

  > * {
    height: 100%;
    width: 100%;
  }
`;

export const HeroBody = styled.div`
  padding: 20px;
`;

export const Eyebrow = styled.div`
  ${eyebrow}
`;

export const RouteTitle = styled.h1`
  margin: 6px 0 12px;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

export const Mark = styled.span`
  ${marker}
`;

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
`;

export const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const MetaLabel = styled.div`
  ${eyebrow}
`;

export const MetaValue = styled.div`
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
`;

export const Seats = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const SeatDot = styled.div`
  color: ${props => (props.$filled ? "var(--signal-yellow-deep)" : "var(--cream-3)")};
  display: inline-flex;
`;

export const Actions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
  flex-wrap: wrap;
`;

export const PrimaryBtn = styled.button`
  ${btnBase}
  ${btnCoral}
  ${props => props.$disabled && css`
    opacity: 0.5;
    pointer-events: none;
  `}
`;

export const GhostBtn = styled.button`
  ${btnBase}
  ${btnGhost}
`;

export const SideGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  ${glass}
  border-radius: var(--r-lg);
  padding: 18px;
`;

export const CardTitle = styled.div`
  ${eyebrow}
  margin-bottom: 12px;
`;

export const PersonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
`;

export const PersonName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-1);
`;

export const PersonSub = styled.div`
  font-size: 12px;
  color: var(--ink-3);
`;

export const NotesCard = styled.div`
  background: var(--signal-yellow-soft);
  border-radius: var(--r-lg);
  padding: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink-2);
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
