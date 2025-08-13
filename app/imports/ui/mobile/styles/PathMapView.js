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
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
`;

export const RouteValue = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 600;
`;

export const ControlsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: stretch;
  }
`;

export const ControlButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
  }

  &:active {
    background: #e9ecef;
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 12px 16px;
  }
`;
