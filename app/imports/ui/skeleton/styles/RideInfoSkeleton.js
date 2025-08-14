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

// Container matching RideInfo layout
export const SkeletonContainer = styled.div`
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

// Back Button
export const SkeletonBackButton = styled.div`
  position: absolute;
  top: 20px;
  left: 16px;
  width: 60px;
  height: 20px;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
  z-index: 10;
`;

// Map Section - 50%
export const SkeletonMapSection = styled.div`
  height: 50%;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
  flex-shrink: 0;
`;

export const SkeletonMapPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background-color: #e9ecef;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: "🗺️";
    font-size: 48px;
    opacity: 0.3;
  }
`;

// Ride Info Section - 40%
export const SkeletonRideInfoSection = styled.div`
  height: 40%;
  width: 100%;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
`;

export const SkeletonRideInfoContainer = styled.div`
  height: 100%;
  width: 100%;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
`;

// Ride Header
export const SkeletonRideHeader = styled.div`
  margin-bottom: 16px;
`;

export const SkeletonRouteDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const SkeletonRouteItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SkeletonRouteLabel = styled.div`
  height: 12px;
  width: 30px;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
`;

export const SkeletonRouteLocation = styled.div`
  height: 16px;
  width: 80%;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
`;

export const SkeletonRouteArrow = styled.div`
  height: 16px;
  width: 16px;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
  margin: 0 4px;
`;

export const SkeletonStatusBadge = styled.div`
  height: 24px;
  width: 120px;
  border-radius: 16px;
  background-color: #f0f0f0;
  overflow: hidden;
  margin: 0 auto;
`;

// Ride Details
export const SkeletonRideDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

export const SkeletonDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
`;

export const SkeletonDetailLabel = styled.div`
  height: 14px;
  width: 60px;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
`;

export const SkeletonDetailValue = styled.div`
  height: 14px;
  width: 80px;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
`;

// Notes Section
export const SkeletonNotesSection = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

export const SkeletonNotesLabel = styled.div`
  height: 14px;
  width: 50px;
  border-radius: 4px;
  background-color: #e9ecef;
  overflow: hidden;
  margin-bottom: 8px;
`;

export const SkeletonNotesText = styled.div`
  height: 40px;
  width: 100%;
  border-radius: 4px;
  background-color: #e9ecef;
  overflow: hidden;
`;

// Navbar Clearance - 10%
export const SkeletonNavbarClearance = styled.div`
  height: 10%;
  width: 100%;
  background-color: #f8f9fa;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
  overflow: hidden;
`;
