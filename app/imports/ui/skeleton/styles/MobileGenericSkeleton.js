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
  background-color: #f8f9fa;
  width: 100%;
  min-height: 100vh;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  display: flex;
  flex-direction: column;
`;

// Top bar
export const SkeletonTopBar = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  position: relative;
  min-height: 60px;

  @media (max-width: 480px) {
    padding: 12px 16px;
    min-height: 56px;
  }
`;

// Back button
export const SkeletonBackButton = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #f0f0f0;
  overflow: hidden;
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);

  @media (max-width: 480px) {
    left: 16px;
    width: 28px;
    height: 28px;
    border-radius: 14px;
  }
`;

// Title skeleton
export const SkeletonTitle = styled.div`
  height: 20px;
  width: 140px;
  border-radius: 10px;
  background-color: #f0f0f0;
  overflow: hidden;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  @media (max-width: 480px) {
    height: 18px;
    width: 120px;
    border-radius: 9px;
  }
`;

// Content area
export const SkeletonContent = styled.div`
  flex: 1;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 480px) {
    padding: 20px 16px;
    gap: 14px;
  }
`;

// Content lines
export const SkeletonLine = styled.div`
  height: 16px;
  width: ${props => props.width || "90%"};
  border-radius: 8px;
  background-color: #f0f0f0;
  overflow: hidden;

  &:nth-child(4n) {
    margin-bottom: 8px; /* Add extra spacing after some lines to simulate paragraphs */
  }

  @media (max-width: 480px) {
    height: 14px;
    border-radius: 7px;
  }
`;
