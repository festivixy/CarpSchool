import styled, { keyframes } from "styled-components";

// Spinner rotation animation
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Pulse animation for text
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

const sizeFor = (size) => {
  switch (size) {
    case "small": return "40px";
    case "large": return "80px";
    default: return "60px";
  }
};

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  padding: 40px 20px;
  text-align: center;
  background: var(--cream-0);
  font-family: var(--font-ui);
  z-index: 9999;

  @media (max-width: 768px) {
    padding: 30px 15px;
  }
`;

export const LoadingSpinner = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "size",
})`
  width: ${props => sizeFor(props.size)};
  height: ${props => sizeFor(props.size)};
  margin-bottom: 24px;
  position: relative;
`;

export const SpinnerCircle = styled.div`
  width: 100%;
  height: 100%;
  border: 3px solid var(--cream-2);
  /* impeccable-disable-next-line border-accent-on-rounded: spinner, not a card accent */
  border-top: 3px solid var(--signal-yellow);
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
`;

export const LoadingMessage = styled.h2`
  font-family: var(--font-display);
  color: var(--ink-1);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 8px 0;
  animation: ${pulse} 2s ease-in-out infinite;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const LoadingSubMessage = styled.p`
  color: var(--ink-3);
  font-size: 15px;
  font-weight: 400;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
  letter-spacing: -0.005em;

  @media (max-width: 768px) {
    font-size: 14px;
    max-width: 300px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    max-width: 250px;
  }
`;
