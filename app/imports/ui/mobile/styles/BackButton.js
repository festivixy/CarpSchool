import styled from "styled-components";

export const BackButtonContainer = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  
  /* Ensure it doesn't interfere with touch events */
  touch-action: manipulation;
  
  /* Smooth transitions */
  transition: transform 0.2s ease, opacity 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
    opacity: 0.8;
  }
  
  /* Accessibility */
  &:focus {
    outline: 2px solid #007AFF;
    outline-offset: 2px;
  }
  
  @media (max-width: 480px) {
    top: 16px;
    left: 16px;
  }
`;

export const BackButtonCircle = styled.div`
  width: 44px;
  height: 44px;
  background-color: rgba(60, 60, 67, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  /* Ensure proper sizing on all devices */
  min-width: 44px;
  min-height: 44px;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
  }
`;

export const BackIcon = styled.img`
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1); /* Makes the icon white */
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  
  @media (max-width: 480px) {
    width: 18px;
    height: 18px;
  }
`;
