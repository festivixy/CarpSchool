import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const RouteMapContainer = styled.div`
  width: 100%;
  background: #fafcff;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    border-radius: 4px;
  }
`;

export const RouteMapWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 300px;

  .leaflet-container {
    border-radius: 8px;
  }

  /* Custom marker styles */
  .custom-start-marker,
  .custom-end-marker {
    background: transparent !important;
    border: none !important;
  }

  @media (max-width: 768px) {
    .leaflet-container {
      border-radius: 4px;
    }
  }
`;

export const RefreshButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1000;
  color: #333;
  font-weight: bold;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Spinning animation for refresh state */
  &:disabled:first-child {
    animation: ${spin} 1s linear infinite;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 16px;
    top: 8px;
    right: 8px;
  }
`;
