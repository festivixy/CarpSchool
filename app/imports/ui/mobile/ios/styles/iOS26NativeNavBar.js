import styled from 'styled-components';

// Placeholder styles for the native navbar component
// The actual styling is handled by native iOS UITabBar

export const NativeNavBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  
  /* Standard iOS navbar height */
  height: 83px;
  
  /* Ensure proper layering */
  pointer-events: none;
  
  /* Only used when native navbar is not available */
  &.fallback {
    pointer-events: auto;
    background: rgba(249, 249, 249, 0.78);
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-top: 0.5px solid rgba(255, 255, 255, 0.2);
    
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-bottom: env(safe-area-inset-bottom, 20px);
    padding-top: 8px;
    padding-left: env(safe-area-inset-left, 16px);
    padding-right: env(safe-area-inset-right, 16px);
  }
`;

export const LoadingIndicator = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 83px;
  z-index: 999;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  background: rgba(249, 249, 249, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  font-size: 14px;
  color: #666;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
`;

export const NativeIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  
  font-size: 10px;
  color: rgba(0, 0, 0, 0.3);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-weight: 500;
  
  user-select: none;
  pointer-events: none;
  
  @media (prefers-color-scheme: dark) {
    color: rgba(255, 255, 255, 0.3);
  }
`;
