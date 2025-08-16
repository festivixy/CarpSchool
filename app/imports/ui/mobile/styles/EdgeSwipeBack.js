import styled, { keyframes, css } from 'styled-components';

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
  /* Position absolutely based on touch coordinates */
  position: fixed;
  left: 0;
  top: 0;

  /* Blob appearance - made extremely visible for testing */
  width: 80px;
  height: 80px;
  border-radius: 50%;

  /* Dynamic styling - solid bright colors for testing */
  background: ${props => {
    const progress = props.progress;
    if (progress >= 1) return '#00FF00'; // Solid green when complete
    if (progress >= 0.7) return '#FFA500'; // Solid orange when close
    return '#FF0000'; // Solid red for maximum visibility
  }};

  /* Add thick border for visibility testing */
  border: 4px solid #FFFFFF;
  box-shadow: 0 0 0 2px #000000; /* Black outline for contrast */

  /* Size based on progress - combine with position transform */
  transform: translate(${props => props.x - 30}px, ${props => props.y - 30}px) scale(${props => 0.5 + (props.progress * 0.5)});

  /* Visibility and animation */
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: opacity 0.1s ease-out;

  /* Force hardware acceleration */
  will-change: transform, opacity;

  /* Pointer events */
  pointer-events: none;
  user-select: none;

  /* Layer above everything to ensure visibility */
  z-index: 9999;

  /* Add subtle glow effect */
  box-shadow:
    0 0 20px ${props => {
      const progress = props.progress;
      if (progress >= 1) return 'rgba(0, 255, 0, 0.4)';
      if (progress >= 0.7) return 'rgba(255, 165, 0, 0.4)';
      return 'rgba(0, 122, 255, 0.4)';
    }},
    0 0 40px ${props => {
      const progress = props.progress;
      if (progress >= 1) return 'rgba(0, 255, 0, 0.2)';
      if (progress >= 0.7) return 'rgba(255, 165, 0, 0.2)';
      return 'rgba(0, 122, 255, 0.2)';
    }};

  /* Pulse animation when complete */
  ${props => props.progress >= 1 && css`
    animation: ${pulseAnimation} 0.3s ease-in-out;
  `}

  /* Add inner highlight for depth */
  &::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    pointer-events: none;
  }

  /* Add progress indicator around the edge */
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: ${props => {
      const progress = props.progress;
      if (progress >= 1) return 'rgba(0, 255, 0, 1)';
      if (progress >= 0.7) return 'rgba(255, 165, 0, 1)';
      return 'rgba(0, 122, 255, 1)';
    }};
    transform: rotate(${props => props.progress * 360}deg);
    transition: transform 0.1s ease-out;
    pointer-events: none;
  }
`;
