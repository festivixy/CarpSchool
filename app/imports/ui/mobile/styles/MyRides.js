import styled from "styled-components";
import {
  btnBase,
  btnCoral,
  eyebrow,
  marker,
} from "../../styles/tokens";

export const Page = styled.div`
  min-height: 100vh;
  background: var(--cream-0);
  font-family: var(--font-ui);
  color: var(--ink-1);
  padding: 24px 16px 96px;
`;

export const Inner = styled.div`
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const H1 = styled.h1`
  margin: 0;
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

export const Mark = styled.span`
  ${marker}
`;

export const FeaturedCard = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background: var(--ink-1);
  color: var(--cream-0);
  border-radius: var(--r-xl);
  overflow: hidden;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const FeatLeft = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const StatusPill = styled.span`
  ${eyebrow}
  align-self: flex-start;
  color: var(--ink-1);
  background: var(--signal-yellow);
  padding: 4px 10px;
  border-radius: var(--r-pill);
`;

export const FeatRoute = styled.div`
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
`;

export const FeatData = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
`;

export const DataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const DataLabel = styled.div`
  ${eyebrow}
  color: var(--ink-4);
`;

export const DataValue = styled.div`
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
`;

export const FeatActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
  flex-wrap: wrap;
`;

export const FeatBtn = styled.button`
  ${btnBase}
  ${btnCoral}
`;

export const FeatGhost = styled.button`
  ${btnBase}
  background: rgba(255, 255, 255, 0.12);
  color: var(--cream-0);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const FeatMap = styled.div`
  position: relative;
  min-height: 200px;

  > * {
    height: 100%;
    width: 100%;
  }
`;

export const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const StatCard = styled.div`
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  padding: 16px;
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

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const Table = styled.div`
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  overflow: hidden;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 130px 1fr 140px 70px;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--glass-stroke);
  font-size: 13px;
  align-items: center;

  &:last-child {
    border-bottom: 0;
  }

  ${props => props.$head && `
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 10.5px;
    color: var(--ink-3);
  `}

  @media (max-width: 540px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const Cell = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Mono = styled.span`
  font-family: var(--font-mono);
`;

export const Empty = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: var(--ink-3);
  background: var(--cream-1);
  border-radius: var(--r-lg);
`;
