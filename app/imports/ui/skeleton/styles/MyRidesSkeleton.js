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
    var(--cream-1) 25%,
    var(--cream-2) 37%,
    var(--cream-1) 63%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: inherit;
`;

// Main container
export const SkeletonContainer = styled.div`
  background-color: var(--cream-0);
  width: 100%;
  min-height: 100vh;
  font-family: var(--font-ui);
  padding: 20px;
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

// Header section
export const SkeletonHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  @media (max-width: 480px) {
    margin-bottom: 24px;
  }
`;

export const SkeletonTitle = styled.div`
  height: 32px;
  width: 120px;
  margin: 0 auto 12px;
  border-radius: 6px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

export const SkeletonSubtitle = styled.div`
  height: 20px;
  width: 220px;
  margin: 0 auto;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

// Tabs section
export const SkeletonTabsContainer = styled.div`
  display: flex;
  background-color: var(--cream-1);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  gap: 4px;
`;

export const SkeletonTab = styled.div`
  flex: 1;
  height: 48px;
  border-radius: 8px;
  background-color: ${props => (props.active ? "var(--cream-0)" : "transparent")};
  box-shadow: ${props => (props.active ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none")};
  padding: 12px 16px;
  overflow: hidden;
  
  ${SkeletonPulse} {
    border-radius: 4px;
    background: ${props => (props.active
      ? "linear-gradient(90deg, var(--cream-2) 25%, var(--cream-3) 37%, var(--cream-2) 63%)"
      : "linear-gradient(90deg, var(--cream-1) 25%, var(--cream-2) 37%, var(--cream-1) 63%)")
    };
  }
`;

// Search section
export const SkeletonSearchSection = styled.div`
  margin-bottom: 24px;
`;

export const SkeletonSearchContainer = styled.div`
  position: relative;
  max-width: 400px;
  margin: 0 auto;
`;

export const SkeletonSearchInput = styled.div`
  height: 48px;
  border-radius: 24px;
  background-color: var(--cream-1);
  border: 1px solid var(--cream-2);
  padding: 12px 50px 12px 20px;
  overflow: hidden;
`;

// Tab content
export const SkeletonTabContent = styled.div`
  width: 100%;
`;

export const SkeletonSummary = styled.div`
  height: 20px;
  width: 180px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

// Rides container
export const SkeletonRidesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Individual ride card
export const SkeletonRideCard = styled.div`
  background: var(--cream-0);
  border-radius: 16px;
  border: 1px solid var(--cream-2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 20px;
  transition: all 0.2s ease;
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

export const SkeletonRideHeader = styled.div`
  height: 24px;
  width: 100px;
  margin-bottom: 16px;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

// Route section
export const SkeletonRoute = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

export const SkeletonRouteItem = styled.div`
  flex: 1;
`;

export const SkeletonRouteLocation = styled.div`
  height: 20px;
  width: 100%;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

export const SkeletonRouteArrow = styled.div`
  height: 16px;
  width: 24px;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
  flex-shrink: 0;
`;

// Status
export const SkeletonStatus = styled.div`
  height: 28px;
  width: 120px;
  margin-bottom: 16px;
  border-radius: 14px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

// Details section
export const SkeletonDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

export const SkeletonDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
`;

export const SkeletonDetailIcon = styled.div`
  height: 16px;
  width: 16px;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
  flex-shrink: 0;
`;

export const SkeletonDetailText = styled.div`
  height: 16px;
  width: 80px;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

// Actions section
export const SkeletonActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

export const SkeletonActionButton = styled.div`
  height: 36px;
  width: 80px;
  border-radius: 18px;
  background-color: var(--cream-1);
  overflow: hidden;
`;
