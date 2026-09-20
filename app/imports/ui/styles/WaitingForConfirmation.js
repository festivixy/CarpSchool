import styled from "styled-components";
import { btnBase, btnGhost, eyebrow } from "./tokens";

/* Keep styled-only props off the DOM. */
const block = (...names) => ({
  shouldForwardProp: (prop) => !names.includes(prop),
});

export const Container = styled.div`
  min-height: 100vh;
  background: var(--cream-1);
  font-family: var(--font-ui);
  color: var(--ink-1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

export const Content = styled.div`
  background: var(--cream-0);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-xl);
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: var(--glass-shadow);

  @media (max-width: 768px) {
    padding: 30px 20px;
    margin: 20px;
  }
`;

export const Icon = styled.div`
  font-size: 56px;
  margin-bottom: 18px;
  opacity: 0.5;

  @media (max-width: 768px) {
    font-size: 44px;
  }
`;

export const Title = styled.h1`
  font-family: var(--font-display);
  color: var(--ink-1);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 10px 0;

  @media (max-width: 768px) {
    font-size: 25px;
  }
`;

export const Subtitle = styled.p`
  color: var(--ink-3);
  font-size: 15px;
  letter-spacing: -0.005em;
  margin: 0 0 28px 0;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const StatusCard = styled.div.withConfig(block("pending"))`
  display: flex;
  align-items: center;
  padding: 14px 15px;
  margin: 10px 0;
  border-radius: var(--r-md);
  /* The step still outstanding is the point of the screen; the ones already
   * done are context. They used to be the other way round -- three loud green
   * cards above the one thing the reader was actually waiting on. */
  background: ${props => (props.pending ? "var(--accent-soft)" : "var(--cream-1)")};
  border: 1px solid ${props => (props.pending ? "var(--accent)" : "var(--cream-2)")};
  text-align: left;
`;

export const StatusIcon = styled.div.withConfig(block("pending"))`
  font-size: 20px;
  margin-right: 14px;
  color: ${props => (props.pending ? "var(--accent)" : "var(--leaf)")};
`;

export const StatusText = styled.div.withConfig(block("pending"))`
  color: ${props => (props.pending ? "var(--ink-1)" : "var(--ink-3)")};
  font-weight: ${props => (props.pending ? 600 : 400)};
  font-size: 13.5px;
  flex: 1;
`;

export const Message = styled.div`
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-md);
  padding: 24px;
  margin: 28px 0;
  color: var(--ink-2);
  font-size: 15px;
  line-height: 1.6;
  letter-spacing: -0.005em;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 20px;
  }
`;

export const InfoSection = styled.div`
  background: var(--signal-yellow-soft);
  border: 1px solid var(--signal-yellow-deep);
  border-radius: var(--r-md);
  padding: 20px;
  margin: 24px 0;
  text-align: left;
`;

export const InfoTitle = styled.h3`
  ${eyebrow}
  color: var(--ink-1);
  margin: 0 0 8px 0;
`;

export const InfoText = styled.p`
  color: var(--ink-2);
  font-size: 13.5px;
  margin: 0;
  line-height: 1.5;
`;

export const Actions = styled.div`
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--glass-stroke);
`;

export const LogoutButton = styled.button`
  ${btnBase}
  ${btnGhost}
  padding: 12px 22px;
  font-size: 13.5px;
`;
