import styled, { css } from "styled-components";
import { btnBase, btnCoral } from "./tokens";

export const Card = styled.div`
  width: 100%;
  cursor: pointer;
  border-radius: var(--r-lg);
  padding: ${props => (props.$compact ? "14px" : "18px")};
  transition: all 0.15s;
  font-family: var(--font-ui);
  ${props => (props.$active
    ? css`
        background: var(--cream-0);
        border: 1.5px solid var(--signal-yellow);
        box-shadow: 0 8px 24px -8px rgba(224, 168, 0, 0.3);
      `
    : css`
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid var(--glass-stroke);
      `)}
`;

export const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

export const RouteCol = styled.div`
  flex: 1;
  min-width: 0;
`;

export const TimeLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--signal-yellow-deep);
  margin-bottom: 6px;
`;

export const Place = styled.div`
  font-family: var(--font-display);
  font-size: ${props => (props.$compact ? "19px" : "22px")};
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--ink-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ToRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  color: var(--ink-3);
  min-width: 0;
`;

export const Fare = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

export const FareValue = styled.div`
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--ink-1);
`;

export const FareUnit = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--ink-4);
`;

export const Rule = styled.div`
  height: 1px;
  background: var(--glass-stroke);
  margin: 12px 0;
`;

export const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const DriverRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

export const DriverName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SeatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

export const SeatPill = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: var(--r-pill);
  font-size: 11.5px;
  font-weight: 600;
  background: ${props => (props.$open ? "oklch(0.93 0.06 152)" : "var(--cream-2)")};
  color: ${props => (props.$open ? "oklch(0.4 0.13 152)" : "var(--ink-3)")};
`;

export const RequestBtn = styled.button`
  ${btnBase}
  ${btnCoral}
  padding: 7px 14px;
  font-size: 12px;
`;
