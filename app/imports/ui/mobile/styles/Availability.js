import styled, { css } from "styled-components";
import {
  btnBase, btnPrimary, btnGhost, btnCoral, eyebrow, inputBase,
} from "../../styles/tokens";

/* Shared shell for both availability screens. */

export const Screen = styled.div`
  min-height: 100vh;
  background: var(--cream-0);
  color: var(--ink-1);
  font-family: var(--font-ui);
`;

export const Wrap = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 28px 20px 96px;
`;

export const Head = styled.header`
  margin-bottom: 24px;
`;

export const Eyebrow = styled.div`
  ${eyebrow}
  margin-bottom: 8px;
`;

export const Title = styled.h1`
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: clamp(28px, 5vw, 36px);
  font-weight: 700;
  letter-spacing: -0.01em;
`;

export const Lede = styled.p`
  margin: 0;
  max-width: 56ch;
  font-size: 15.5px;
  line-height: 1.6;
  color: var(--ink-3);
`;

export const Section = styled.section`
  margin-top: 28px;
`;

export const SectionTitle = styled.h2`
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
`;

export const Card = styled.div`
  padding: 20px;
  border-radius: var(--r-lg);
  background: var(--cream-0);
  border: 1px solid var(--cream-2);

  /* $live marks the card as currently broadcasting, so a driver can tell at a
   * glance that they are listed right now. */
  ${props => props.$live && css`
    border-color: var(--signal-yellow-deep);
    background: var(--signal-yellow-soft);
  `}
`;

export const CardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 150px;
  min-width: 0;
`;

export const FieldLabel = styled.span`
  ${eyebrow}
`;

export const Select = styled.select`
  ${inputBase}
  appearance: none;
  background-image: none;
`;

export const Input = styled.input`
  ${inputBase}
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
`;

export const PrimaryBtn = styled.button`
  ${btnBase}
  ${btnPrimary}
`;

export const GoBtn = styled.button`
  ${btnBase}
  ${btnCoral}
`;

export const GhostBtn = styled.button`
  ${btnBase}
  ${btnGhost}
`;

export const SlotList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SlotRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-radius: var(--r-md);
  background: var(--cream-1);
  border: 1px solid var(--cream-2);
`;

export const SlotWhen = styled.div`
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-1);
  white-space: nowrap;
`;

export const SlotRoute = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 14.5px;
  color: var(--ink-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RemoveBtn = styled.button`
  border: 0;
  background: transparent;
  color: var(--ink-3);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: var(--r-sm);
  font-size: 13px;

  &:hover {
    background: var(--cream-2);
    color: var(--ink-1);
  }
`;

export const Empty = styled.div`
  padding: 28px 20px;
  text-align: center;
  border-radius: var(--r-lg);
  border: 1px dashed var(--cream-3);
  color: var(--ink-3);
  font-size: 14.5px;
`;

export const Note = styled.p`
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-4);
`;

export const ErrorText = styled.p`
  margin: 12px 0 0;
  font-size: 13.5px;
  color: #b3261e;
`;

/* ---- Driver list (the rider-facing screen) ------------------------------ */

export const DriverGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
`;

export const DriverCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: var(--r-lg);
  background: var(--cream-0);
  border: 1px solid var(--cream-2);
`;

export const DriverHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Avatar = styled.div`
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--cream-2);
  background-size: cover;
  background-position: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--ink-2);
`;

export const DriverName = styled.div`
  font-size: 15.5px;
  font-weight: 600;
  color: var(--ink-1);
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: ${props => (props.$now ? "var(--signal-yellow)" : "var(--cream-1)")};
  color: var(--ink-1);
`;

export const DriverRoute = styled.div`
  font-size: 14.5px;
  line-height: 1.5;
  color: var(--ink-2);
`;

export const DriverMeta = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--ink-3);
`;
