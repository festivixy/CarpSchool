import styled from "styled-components";

export const MapContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: #fafcff;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    border-radius: 4px;
    margin: 0 -16px;
  }
`;

export const MapWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 300px;

  .leaflet-container {
    border-radius: 8px 8px 0 0;
  }

  /* Custom marker styles */
  .custom-start-marker,
  .custom-end-marker {
    background: transparent !important;
    border: none !important;
  }
`;

export const ControlsContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
`;

export const ControlButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

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

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
`;

export const RouteInfo = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 8px 8px;

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

export const RouteLabel = styled.div`
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1b2228;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

export const RouteValue = styled.div`
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const LoadingMessage = styled.div`
  padding: 16px;
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  border-radius: 0 0 8px 8px;
  color: #1976d2;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "🔄";
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 13px;
  }
`;

export const ErrorMessage = styled.div`
  padding: 16px;
  background: #ffebee;
  border-left: 4px solid #f44336;
  border-radius: 0 0 8px 8px;
  color: #c62828;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "⚠️";
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 13px;
  }
`;
