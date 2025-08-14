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

// Page container
export const SkeletonPageContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
`;

// Header
export const SkeletonHeader = styled.div`
  text-align: center;
  padding: 60px 20px 20px;
`;

export const SkeletonHeaderTitle = styled.div`
  height: 28px;
  width: 150px;
  margin: 0 auto;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.3);
  overflow: hidden;
  
  ${SkeletonPulse} {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.2) 25%,
      rgba(255, 255, 255, 0.4) 37%,
      rgba(255, 255, 255, 0.2) 63%
    );
  }
`;

// Content
export const SkeletonContent = styled.div`
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  min-height: calc(100vh - 120px);
  padding: 32px 24px;
  
  @media (max-width: 480px) {
    padding: 24px 20px;
    border-radius: 20px 20px 0 0;
  }
`;

export const SkeletonContentHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

export const SkeletonContentTitle = styled.div`
  height: 24px;
  width: 160px;
  margin: 0 auto 12px;
  border-radius: 6px;
  background-color: #f0f0f0;
  overflow: hidden;
`;

export const SkeletonContentSubtitle = styled.div`
  height: 16px;
  width: 200px;
  margin: 0 auto;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
`;

// Form
export const SkeletonForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

// Section
export const SkeletonSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const SkeletonSectionTitle = styled.div`
  height: 20px;
  width: 80px;
  border-radius: 6px;
  background-color: #f0f0f0;
  overflow: hidden;
`;

// Field
export const SkeletonField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SkeletonLabel = styled.div`
  height: 16px;
  width: 60px;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
`;

// Dropdown
export const SkeletonDropdown = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const SkeletonDropdownInput = styled.div`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 12px 50px 12px 16px;
  overflow: hidden;
`;

export const SkeletonDropdownArrow = styled.div`
  position: absolute;
  right: 16px;
  height: 16px;
  width: 16px;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
`;

// Swap button
export const SkeletonSwapButton = styled.div`
  height: 40px;
  width: 40px;
  border-radius: 20px;
  background-color: #f0f0f0;
  overflow: hidden;
  margin: 12px auto;
`;

// DateTime row
export const SkeletonDateTimeRow = styled.div`
  display: flex;
  gap: 16px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 20px;
  }
`;

export const SkeletonFieldHalf = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Input
export const SkeletonInput = styled.div`
  height: 48px;
  border-radius: 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 12px 16px;
  overflow: hidden;
`;

// Textarea
export const SkeletonTextarea = styled.div`
  height: 96px;
  border-radius: 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 12px 16px;
  overflow: hidden;
`;

// Submit button
export const SkeletonSubmitButton = styled.div`
  height: 56px;
  border-radius: 28px;
  background-color: #f0f0f0;
  overflow: hidden;
  margin-top: 24px;
`;
