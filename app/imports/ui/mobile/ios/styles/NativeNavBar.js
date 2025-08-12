import styled from "styled-components";

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
    background: rgba(249, 249, 249, 0.9);
    border-top: 0.5px solid rgba(0, 0, 0, 0.2);

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

  background: rgba(249, 249, 249, 0.9);
  border-top: 0.5px solid rgba(0, 0, 0, 0.2);

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

export const StatusText = styled.div`
  font-size: 14px;
  color: #666;
`;

export const FallbackContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(249, 249, 249, 0.9);
  border-radius: 12px;
  margin: 16px;
`;

export const FallbackItemContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  min-width: 60px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &.active {
    background-color: rgba(0, 122, 255, 0.1);
  }
`;

export const FallbackItemIcon = styled.div`
  font-size: 20px;
  margin-bottom: 2px;
`;

export const FallbackItemText = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: #333;
  text-align: center;

  .active & {
    color: #007AFF;
  }
`;

export const StatusContainer = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;
