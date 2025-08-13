import styled from "styled-components";

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #ffffff;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  overflow: hidden;
`;

export const MapSection = styled.div`
  height: 50%;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
  flex-shrink: 0;
`;

export const RideInfoSection = styled.div`
  height: 40%;
  width: 100%;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
`;

export const RideInfoContainer = styled.div`
  height: 100%;
  width: 100%;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
`;

export const NavbarClearance = styled.div`
  height: 10%;
  width: 100%;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
`;

export const RideHeader = styled.div`
  margin-bottom: 16px;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  margin-bottom: 12px;
  transition: color 0.2s ease;

  &:hover {
    color: #0056b3;
  }

  &:active {
    color: #004085;
  }
`;

export const RouteDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const RouteItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const RouteLabel = styled.span`
  font-size: 10px;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const RouteLocation = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #000;
  line-height: 1.2;
`;

export const RouteArrow = styled.div`
  font-size: 16px;
  color: #666;
  margin: 0 4px;
`;

export const StatusBadge = styled.div`
  display: flex;
  justify-content: center;
`;

export const StatusLooking = styled.span`
  background-color: rgba(255, 193, 7, 0.1);
  color: #ff851b;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const StatusMatched = styled.span`
  background-color: rgba(76, 175, 80, 0.1);
  color: #388e3c;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const RideDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
`;

export const DetailLabel = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const DetailValue = styled.span`
  font-size: 13px;
  color: #000;
  font-weight: 500;
  text-align: right;
  flex: 1;
  margin-left: 8px;
`;

export const NotesSection = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

export const NotesLabel = styled.div`
  font-size: 12px;
  color: #666;
  font-weight: 600;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const NotesText = styled.div`
  font-size: 13px;
  color: #333;
  line-height: 1.4;
`;

export const RidersSection = styled.div`
  margin-bottom: 16px;
`;

export const RidersLabel = styled.div`
  font-size: 12px;
  color: #666;
  font-weight: 600;
  margin-bottom: 8px;
`;

export const RidersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const RiderItem = styled.div`
  font-size: 12px;
  color: #333;
  padding: 4px 8px;
  background-color: #f0f8ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  text-align: center;
`;

export const ErrorTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
`;

export const ErrorMessage = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 24px 0;
  max-width: 300px;
`;
