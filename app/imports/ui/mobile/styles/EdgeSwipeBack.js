import styled, { keyframes, css } from "styled-components";

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

export const EdgeSwipeBackContainer = styled.div`
  /* Invisible overlay that covers the entire screen */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;

  /* Completely transparent and non-interactive - only capture events programmatically */
  background: transparent;
  pointer-events: none; /* Always none to not block app interactions */
  z-index: 1; /* Low z-index to not interfere with UI */

  /* Ensure children (blob) can be visible */
  overflow: visible;

  /* Ensure it doesn't interfere with scrolling or other interactions */
  touch-action: pan-x pan-y;
  user-select: none;

  /* Hide from screen readers and accessibility tools */
  opacity: 0;
  visibility: visible;

  /* Ensure it doesn't create layout shifts */
  margin: 0;
  padding: 0;
  border: none;
  outline: none;

  /* Debug mode - uncomment to see the overlay during development */
  /*
  background: rgba(255, 0, 0, 0.1);
  opacity: 1;
  border-left: 2px solid red;
  */
`;

export const SwipeBlob = styled.div`
  /* Independent overlay positioned on top of everything */
  position: fixed;
  left: 0;
  top: 0;

  /* Production blob appearance */
  width: 40px;
  height: 40px;
  border-radius: 50%;

  /* Always iOS blue */
  background: rgba(0, 122, 255, 0.9);

  /* Position and scale transform */
  transform: translate(${props => props.x - 20}px, ${props => props.y - 20}px)
    scale(${props => 0.6 + (props.progress * 0.4)});

  /* Visibility control */
  display: ${props => (props.visible ? "block" : "none")};
  opacity: ${props => (props.visible ? 1 : 0)};

  /* Smooth animations */
  transition: opacity 0.15s ease-out;

  /* Force hardware acceleration */
  will-change: transform, opacity;
  backface-visibility: hidden;

  /* Completely non-interactive overlay */
  pointer-events: none;
  user-select: none;
  touch-action: none;

  /* High z-index to ensure visibility */
  z-index: 9999;

  /* Subtle blue glow effect */
  box-shadow:
    0 2px 12px rgba(0, 122, 255, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.2);

  /* Pulse animation when complete */
  ${props => props.progress >= 1 && css`
    animation: ${pulseAnimation} 0.3s ease-in-out;
  `}

  /* Inner highlight for depth */
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.7);
    pointer-events: none;
  }

`;
