import styled from "styled-components";
import { Link } from "react-router-dom";

export const Container = styled.div`
  padding: 20px;
  padding-bottom: 80px; /* Space for navbar */
  min-height: 100vh;
  background-color: #f8f9fa;
`;

export const Header = styled.div`
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  margin-bottom: 8px;
  font-family: 'Outfit', sans-serif;
`;

export const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

export const SearchSection = styled.div`
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SearchRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #f8f9fa;
  font-size: 15px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    background: white;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }
`;

export const FilterButton = styled.button`
  background: ${props => props.active ? "#e3f2fd" : "#f8f9fa"};
  color: ${props => props.active ? "#4a90e2" : "#666"};
  border: 1px solid ${props => props.active ? "#4a90e2" : "#eee"};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
`;

export const ResultsCount = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 16px;
  padding-left: 4px;
`;

export const RidesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const RideCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }
`;

export const RideHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

export const RideTime = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Time = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
`;

export const DateLabel = styled.span`
  font-size: 13px;
  color: #666;
`;

export const PriceTag = styled.div`
  background: #e3f2fd;
  color: #4a90e2;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
`;

export const RouteInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 2px solid #eee;
`;

export const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const LocationText = styled.span`
  font-size: 15px;
  color: #333;
  font-weight: 500;
`;

export const DriverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
`;

export const DriverAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

export const DriverName = styled.span`
  font-size: 14px;
  color: #444;
  font-weight: 500;
  flex: 1;
`;

export const RequestButton = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #888;
`;
