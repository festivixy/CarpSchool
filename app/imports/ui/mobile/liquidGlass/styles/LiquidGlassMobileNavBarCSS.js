import styled from "styled-components";

// iOS 26 Liquid Glass color system
const liquidGlassColors = {
  systemMaterial: {
    background: "rgba(249, 249, 249, 0.78)",
    backdropFilter: "blur(20px) saturate(1.8)",
    border: "rgba(255, 255, 255, 0.2)",
  },
  systemThinMaterial: {
    background: "rgba(249, 249, 249, 0.6)",
    backdropFilter: "blur(12px) saturate(1.4)",
    border: "rgba(255, 255, 255, 0.15)",
  },
  systemUltraThinMaterial: {
    background: "rgba(249, 249, 249, 0.4)",
    backdropFilter: "blur(8px) saturate(1.2)",
    border: "rgba(255, 255, 255, 0.1)",
  },
  systemThickMaterial: {
    background: "rgba(249, 249, 249, 0.9)",
    backdropFilter: "blur(24px) saturate(2.0)",
    border: "rgba(255, 255, 255, 0.3)",
  },
};

export const NavBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  
  display: flex;
  align-items: center;
  justify-content: space-around;
  
  height: 83px; /* Standard iOS navbar height */
  ${props => (props.safeArea ? "padding-bottom: env(safe-area-inset-bottom, 20px);" : "")}
  padding-top: 8px;
  padding-left: env(safe-area-inset-left, 16px);
  padding-right: env(safe-area-inset-right, 16px);
  
  /* iOS 26 Liquid Glass Effect */
  background: ${props => liquidGlassColors[props.blurStyle]?.background || liquidGlassColors.systemMaterial.background};
  backdrop-filter: ${props => liquidGlassColors[props.blurStyle]?.backdropFilter || liquidGlassColors.systemMaterial.backdropFilter};
  -webkit-backdrop-filter: ${props => liquidGlassColors[props.blurStyle]?.backdropFilter || liquidGlassColors.systemMaterial.backdropFilter};
  
  /* Subtle border for depth */
  border-top: 0.5px solid ${props => liquidGlassColors[props.blurStyle]?.border || liquidGlassColors.systemMaterial.border};
  
  /* Floating glass shadow */
  box-shadow: 
    0 -1px 0 rgba(255, 255, 255, 0.1) inset,
    0 1px 20px rgba(0, 0, 0, 0.08),
    0 4px 40px rgba(0, 0, 0, 0.04);
  
  /* iOS smooth animations */
  transition: ${props => (props.animated ? "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none")};
  
  /* Ensure proper rendering */
  will-change: transform, opacity;
  transform: translateZ(0);
  
  @media (prefers-color-scheme: dark) {
    background: rgba(28, 28, 30, 0.78);
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-top-color: rgba(84, 84, 88, 0.3);
  }
`;

export const NavBarItem = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* iOS navigation item sizing */
  min-height: 44px;
  max-width: 80px;
  
  /* Touch target enhancement */
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    bottom: -8px;
    left: -8px;
    right: -8px;
    /* Invisible touch area expansion */
  }
`;

export const NavBarButton = styled.button`
  background: none;
  border: none;
  padding: 4px 8px;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  
  /* iOS standard touch target */
  min-width: 44px;
  min-height: 44px;
  
  /* Remove browser button styles */
  appearance: none;
  -webkit-appearance: none;
  outline: none;
  cursor: pointer;
  
  /* Smooth state transitions */
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Active/pressed state */
  &:active {
    transform: scale(0.95);
    opacity: 0.7;
  }
  
  /* iOS haptic feedback simulation */
  &:active {
    transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
`;

export const NavBarIcon = styled.div`
  width: 24px;
  height: 24px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* SF Symbols style sizing */
  font-size: 22px;
  line-height: 1;
  
  /* iOS icon colors */
  color: ${props => (props.isActive ? "#007AFF" : "#8E8E93")};
  
  /* Smooth color transitions */
  transition: color 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Image handling */
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: ${props => (props.isActive ? "none" : "grayscale(1) opacity(0.6)")};
    transition: filter 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  /* SVG handling */
  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
  
  @media (prefers-color-scheme: dark) {
    color: ${props => (props.isActive ? "#0A84FF" : "#8E8E93")};
  }
`;

export const NavBarLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
  line-height: 12px;
  
  /* iOS system font */
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
  
  /* iOS label colors */
  color: ${props => (props.isActive ? "#007AFF" : "#8E8E93")};
  
  /* Smooth color transitions */
  transition: color 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Text rendering optimization */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  /* Prevent text selection */
  user-select: none;
  -webkit-user-select: none;
  
  /* Multi-line support with ellipsis */
  text-align: center;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  
  @media (prefers-color-scheme: dark) {
    color: ${props => (props.isActive ? "#0A84FF" : "#8E8E93")};
  }
`;
