import styled from "styled-components";
import { eyebrow, btnBase, btnCoral } from "./tokens";

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
  background: var(--ink-1);
  color: var(--cream-0);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 820px) {
    flex-direction: row;
    overflow-x: auto;
    padding: 12px;
  }
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px 16px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

export const Tag = styled.span`
  ${eyebrow}
  background: var(--signal-yellow);
  color: var(--ink-1);
  padding: 2px 6px;
  border-radius: var(--r-sm);
`;

export const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: 0;
  border-left: 2px solid ${props => (props.$active ? "var(--signal-yellow)" : "transparent")};
  border-radius: var(--r-md);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 14px;
  white-space: nowrap;
  background: ${props => (props.$active ? "rgba(255, 212, 0, 0.15)" : "transparent")};
  color: ${props => (props.$active ? "var(--signal-yellow)" : "rgba(246, 245, 240, 0.8)")};

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

export const Main = styled.main`
  padding: 32px 28px 80px;
  overflow: auto;
`;

export const Header = styled.div`
  margin-bottom: 24px;
`;

export const Eyebrow = styled.div`
  ${eyebrow}
`;

export const Title = styled.h1`
  margin: 4px 0 0;
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

export const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const StatCard = styled.div`
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  padding: 16px;
  cursor: ${props => (props.$link ? "pointer" : "default")};
`;

export const StatValue = styled.div`
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.$accent || "var(--ink-1)"};
`;

export const StatLabel = styled.div`
  ${eyebrow}
  margin-top: 4px;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  padding: 18px;
`;

export const CardTitle = styled.div`
  ${eyebrow}
  margin-bottom: 12px;
`;

export const QueueItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--glass-stroke);

  &:last-child {
    border-bottom: 0;
  }
`;

export const QName = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

export const ReviewBtn = styled.button`
  ${btnBase}
  ${btnCoral}
  padding: 6px 12px;
  font-size: 12px;
`;

export const ServiceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--glass-stroke);

  &:last-child {
    border-bottom: 0;
  }
`;

export const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--leaf);
`;

export const Mono = styled.span`
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-3);
`;

export const Empty = styled.div`
  padding: 8px 0;
  color: var(--ink-3);
  font-size: 14px;
`;
