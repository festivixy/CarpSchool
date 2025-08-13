import styled from "styled-components";

export const TestPageHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
`;

export const TestPageTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

export const FlexContainer = styled.div`
  display: flex;
  gap: 8px;
`;

export const MarginContainer = styled.div`
  margin-top: 8px;
`;

export const DynamicMapContainer = styled.div`
  height: ${props => props.$height || "400px"};
`;
