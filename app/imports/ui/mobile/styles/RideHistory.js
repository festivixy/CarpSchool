import styled from "styled-components";
import { eyebrow } from "../../styles/tokens";

/* Keep styled-only props off the DOM. */
const block = (...names) => ({
  shouldForwardProp: (prop) => !names.includes(prop),
});

export const Container = styled.div`
  background: var(--cream-0);
  min-height: 100vh;
  font-family: var(--font-ui);
  color: var(--ink-1);
  padding: 24px 20px 96px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 20px 16px 96px;
  }
`;

export const Header = styled.div`
  margin-bottom: 24px;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-3);
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 10px;
  font-weight: 500;

  &:hover {
    color: var(--ink-1);
  }
`;

export const Title = styled.h1`
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--ink-1);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
  font-size: 15px;
  color: var(--ink-3);
  margin: 0;
  line-height: 1.45;
  letter-spacing: -0.005em;
`;

export const HistoryContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

export const HistorySection = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const HistorySectionTitle = styled.h3`
  ${eyebrow}
  margin: 0 0 14px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--cream-3);
`;

export const TimelineItem = styled.div.withConfig(block("completed"))`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-left: 2px solid ${props => (props.completed ? "var(--leaf)" : "var(--cream-3)")};
  padding-left: 16px;
  margin-left: 12px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -7px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => (props.completed ? "var(--leaf)" : "var(--cream-3)")};
    border: 2px solid var(--cream-0);
  }
`;

export const TimelineInfo = styled.div`
  flex: 1;
`;

export const TimelineTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink-1);
  margin-bottom: 3px;
`;

export const TimelineTime = styled.div`
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-4);
`;

export const RiderProgressItem = styled.div`
  padding: 16px;
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  margin-bottom: 12px;
  background: var(--cream-1);
  transition: box-shadow 0.12s ease;

  &:hover {
    box-shadow: var(--glass-shadow);
  }
`;

export const RiderProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

export const RiderProgressName = styled.div`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink-1);
`;

export const RiderProgressStatus = styled.div.withConfig(block("completed"))`
  font-size: 11.5px;
  font-weight: 600;
  flex-shrink: 0;
  color: ${props => (props.completed ? "var(--leaf)" : "var(--ink-2)")};
  padding: 4px 9px;
  border-radius: var(--r-pill);
  background: ${props => (props.completed ? "var(--leaf-soft)" : "var(--signal-yellow-soft)")};
`;

export const RiderProgressDetails = styled.div`
  font-size: 13.5px;
  color: var(--ink-3);
  line-height: 1.5;

  div {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const EventItem = styled.div`
  padding: 12px 16px;
  border-left: 3px solid var(--signal-yellow);
  margin-bottom: 12px;
  background: var(--cream-1);
  border-radius: 0 var(--r-md) var(--r-md) 0;
  transition: background 0.12s ease;

  &:hover {
    background: var(--cream-2);
  }
`;

export const EventTitle = styled.div`
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink-1);
  margin-bottom: 5px;
`;

export const EventDetails = styled.div`
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-3);
  line-height: 1.45;

  div {
    margin-bottom: 2px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SessionRow = styled.button`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  padding: 16px;
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  background: var(--cream-1);
  cursor: pointer;
  font-family: var(--font-ui);
  transition: box-shadow 0.12s ease;

  &:hover {
    box-shadow: var(--glass-shadow);
  }
`;

export const SessionRoute = styled.div`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink-1);
`;

export const SessionMeta = styled.div`
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-3);
`;

export const NotFound = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  margin-top: 40px;
`;

export const NotFoundIcon = styled.div`
  font-size: 56px;
  margin-bottom: 18px;
  opacity: 0.35;
`;

export const NotFoundTitle = styled.h2`
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink-1);
  margin: 0 0 10px 0;
`;

export const NotFoundMessage = styled.p`
  font-size: 15px;
  color: var(--ink-3);
  margin: 0;
  line-height: 1.5;
  letter-spacing: -0.005em;
  max-width: 400px;
`;
