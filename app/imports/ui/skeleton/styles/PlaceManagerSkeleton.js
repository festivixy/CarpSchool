import styled, { keyframes } from "styled-components";

// Skeleton animation
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Base skeleton pulse component
export const SkeletonPulse = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 37%,
    #f0f0f0 63%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: inherit;
`;

// Main container
export const SkeletonContainer = styled.div`
  background-color: #ffffff;
  width: 100%;
  min-height: 100vh;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  padding: 20px;
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

// Header section
export const SkeletonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
  
  @media (max-width: 480px) {
    margin-bottom: 20px;
    flex-direction: column;
    gap: 16px;
  }
`;

export const SkeletonTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SkeletonTitleIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
`;

export const SkeletonTitleText = styled.div`
  width: 120px;
  height: 32px;
  border-radius: 6px;
`;

export const SkeletonAddButton = styled.div`
  width: 100px;
  height: 36px;
  border-radius: 8px;
  
  @media (max-width: 480px) {
    width: 120px;
  }
`;

// Content section
export const SkeletonContent = styled.div`
  width: 100%;
`;

export const SkeletonPlacesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

// Place card skeleton
export const SkeletonPlaceCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

export const SkeletonPlaceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const SkeletonPlaceInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SkeletonPlaceName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SkeletonPlaceIcon = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
`;

export const SkeletonPlaceNameText = styled.div`
  width: 140px;
  height: 20px;
  border-radius: 4px;
  
  @media (max-width: 480px) {
    width: 120px;
  }
`;

export const SkeletonPlaceCoordinates = styled.div`
  width: 180px;
  height: 16px;
  border-radius: 3px;
  
  @media (max-width: 480px) {
    width: 150px;
  }
`;

export const SkeletonPlaceDate = styled.div`
  width: 100px;
  height: 14px;
  border-radius: 3px;
`;

export const SkeletonPlaceCreator = styled.div`
  width: 80px;
  height: 14px;
  border-radius: 3px;
`;

// Action buttons
export const SkeletonActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 12px;
`;

export const SkeletonActionButton = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
`;
