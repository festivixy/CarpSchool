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
  display: flex;
  flex-direction: column;
  
  @media (max-width: 480px) {
    min-height: 100vh;
  }
`;

// Header section
export const SkeletonHeader = styled.div`
  position: relative;
  background-color: white;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const SkeletonBackButton = styled.div`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;

  @media (max-width: 480px) {
    left: 16px;
    width: 28px;
    height: 28px;
  }
`;

export const SkeletonTitle = styled.div`
  width: 120px;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 100px;
    height: 20px;
  }
`;

// Content area
export const SkeletonContent = styled.div`
  flex: 1;
  padding: 24px 20px 100px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 20px 16px 80px;
  }
`;

// Copy section
export const SkeletonCopy = styled.div`
  margin-bottom: 32px;
  text-align: center;

  @media (max-width: 480px) {
    margin-bottom: 24px;
  }
`;

export const SkeletonMainTitle = styled.div`
  width: 200px;
  height: 28px;
  margin: 0 auto 12px;
  border-radius: 4px;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 160px;
    height: 24px;
    margin-bottom: 8px;
  }
`;

export const SkeletonSubtitle = styled.div`
  width: 280px;
  height: 16px;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 240px;
    height: 14px;
  }
`;

// Form section
export const SkeletonForm = styled.div`
  width: 100%;
`;

export const SkeletonSection = styled.div`
  margin-bottom: 32px;
  padding: 24px;
  background-color: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;

  @media (max-width: 480px) {
    margin-bottom: 24px;
    padding: 20px 16px;
  }
`;

export const SkeletonSectionTitle = styled.div`
  width: 140px;
  height: 18px;
  margin-bottom: 20px;
  border-radius: 4px;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 120px;
    height: 16px;
    margin-bottom: 16px;
  }
`;

export const SkeletonField = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

export const SkeletonLabel = styled.div`
  width: 80px;
  height: 14px;
  margin-bottom: 8px;
  border-radius: 3px;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 70px;
    height: 12px;
    margin-bottom: 6px;
  }
`;

export const SkeletonInput = styled.div`
  width: 100%;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 480px) {
    height: 44px;
  }
`;

export const SkeletonSelect = styled.div`
  width: 100%;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 480px) {
    height: 44px;
  }
`;

// Image upload section
export const SkeletonImagePreview = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
    margin-bottom: 16px;
  }
`;

export const SkeletonFileInput = styled.div`
  width: 100%;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 6px;

  @media (max-width: 480px) {
    height: 36px;
  }
`;

export const SkeletonFileInfo = styled.div`
  width: 220px;
  height: 12px;
  border-radius: 3px;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 180px;
    height: 10px;
  }
`;

// Captcha and upload section
export const SkeletonCaptchaArea = styled.div`
  width: 100%;
  height: 100px;
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 480px) {
    height: 80px;
    margin: 12px 0;
  }
`;

export const SkeletonUploadButton = styled.div`
  width: 160px;
  height: 44px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 140px;
    height: 40px;
  }
`;

// Submit button
export const SkeletonSubmitButton = styled.div`
  width: 200px;
  height: 52px;
  margin: 32px auto 0;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 180px;
    height: 48px;
    margin-top: 24px;
  }
`;

// Links
export const SkeletonLink = styled.div`
  width: 140px;
  height: 16px;
  margin: 24px auto 0;
  border-radius: 4px;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 120px;
    height: 14px;
    margin-top: 20px;
  }
`;
