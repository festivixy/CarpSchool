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
  height: 300px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    height: 250px;
    margin-bottom: 16px;
  }
`;

export const RouteInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 16px;
  }
`;

export const RoutePoint = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 10px;
    gap: 10px;
  }
`;

export const PointIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;

  &.origin {
    background-color: #28a745;
  }

  &.destination {
    background-color: #dc3545;
  }
`;

export const PointDetails = styled.div`
  flex: 1;
`;

export const PointLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const PointName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  line-height: 1.3;
`;

export const RouteStats = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    margin-bottom: 16px;
  }
`;

export const StatItem = styled.div`
  flex: 1;
  text-align: center;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

export const StatValue = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

export const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;

  &::before {
    content: "🗺️";
    font-size: 48px;
    margin-bottom: 16px;
  }

  @media (max-width: 768px) {
    padding: 32px 16px;

    &::before {
      font-size: 40px;
      margin-bottom: 12px;
    }
  }
`;

export const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;

  &::before {
    content: "⚠️";
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 13px;
  }
`;

export const MapViewContainer = styled.div`
  width: 100%;
  height: 100%;
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
