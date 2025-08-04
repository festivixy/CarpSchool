import styled, { css } from "styled-components";

// Main toolbar container with iOS 26 Liquid Glass styling
export const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${props => props.height || 60}px;

  /* iOS 26 Liquid Glass Background */
  background: ${props => {
    switch (props.blurStyle) {
      case 'systemThinMaterial':
        return 'rgba(242, 242, 247, 0.8)';
      case 'systemThickMaterial':
        return 'rgba(242, 242, 247, 0.95)';
      case 'dark':
        return 'rgba(28, 28, 30, 0.8)';
      case 'light':
        return 'rgba(255, 255, 255, 0.8)';
      default: // systemMaterial
        return 'rgba(242, 242, 247, 0.85)';
    }
  }};

  /* CSS backdrop-filter for glass effect */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  /* iOS 26 border styling */
  border: 0.5px solid rgba(255, 255, 255, 0.2);

  ${props => props.position === "bottom" && css`
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding-bottom: ${props.safeArea ? "env(safe-area-inset-bottom)" : "0"};
  `}

  ${props => props.position === "top" && css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding-top: ${props.safeArea ? "env(safe-area-inset-top)" : "0"};
  `}

  ${props => props.floating && css`
    position: fixed;
    bottom: 16px;
    left: 16px;
    right: 16px;
    border-radius: 24px; /* iOS 26 uses larger radius */
    padding-bottom: 0;

    /* Enhanced iOS 26 shadow */
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.15),
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  `}

  /* Visibility and animation */
  opacity: ${props => (props.visible ? 1 : 0)};
  transform: ${props => {
    if (!props.visible) {
      if (props.position === "bottom") return "translateY(100%)";
      if (props.position === "top") return "translateY(-100%)";
      return "scale(0.95)";
    }
    return "translateY(0) scale(1)";
  }};

  ${props => props.animated && css`
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  `}

  /* Ensure toolbar is above other content */
  z-index: 1000;

  /* iOS 26 Liquid Glass shimmer effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.1) 100%
    );
    border-radius: inherit;
    pointer-events: none;
    opacity: 0.6;
  }

  /* Fallback for browsers without backdrop-filter */
  @supports not (backdrop-filter: blur(1px)) {
    background: ${props => {
      switch (props.blurStyle) {
        case 'dark':
          return 'rgba(28, 28, 30, 0.95)';
        case 'light':
          return 'rgba(255, 255, 255, 0.95)';
        default:
          return 'rgba(242, 242, 247, 0.95)';
      }
    }};
  }
`;

// Individual toolbar item wrapper
export const ToolbarItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => props.type === "space" && css`
    flex: none;
  `}

  ${props => props.type === "flexibleSpace" && css`
    flex: 1;
  `}

  ${props => (props.type === "button" || !props.type) && css`
    flex: none;
  `}
`;

// Toolbar button component
export const ToolbarButton = styled.button`
  display: flex;
  flex-direction: ${props => (props.icon && props.title ? "column" : "row")};
  align-items: center;
  justify-content: center;

  min-width: 44px;
  min-height: 44px;
  padding: 8px 12px;
  margin: 0 4px;

  background: ${props => {
    if (props.primary) {
      return "rgba(0, 122, 255, 0.8)";
    }
    return "transparent";
  }};

  border: none;
  border-radius: 12px;
  cursor: pointer;

  color: ${props => {
    if (props.primary) {
      return "rgba(255, 255, 255, 0.95)";
    }
    return "rgba(0, 0, 0, 0.8)";
  }};

  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;

  transition: all 0.2s ease;

  /* Icon styling */
  .toolbar-icon {
    font-size: 20px;
    line-height: 1;
    margin-bottom: ${props => (props.title ? "2px" : "0")};
  }

  .toolbar-title {
    font-size: 11px;
    font-weight: 500;
    opacity: 0.9;
  }

  /* Hover effects */
  &:hover {
    background: ${props => {
      if (props.primary) {
        return "rgba(0, 122, 255, 1)";
      }
      return "rgba(0, 0, 0, 0.05)";
    }};

    transform: scale(1.05);
  }

  /* Active state */
  &:active {
    transform: scale(0.95);
    background: ${props => {
      if (props.primary) {
        return "rgba(0, 122, 255, 0.7)";
      }
      return "rgba(0, 0, 0, 0.1)";
    }};
  }

  /* Disabled state */
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;

    &:hover, &:active {
      background: transparent;
      transform: none;
    }
  }

  /* Focus styles for accessibility */
  &:focus {
    outline: 2px solid rgba(0, 122, 255, 0.6);
    outline-offset: 2px;
  }

  /* Touch target sizing for mobile */
  @media (pointer: coarse) {
    min-width: 48px;
    min-height: 48px;
  }
`;

// Toolbar spacer component
export const ToolbarSpace = styled.div`
  width: ${props => {
    if (props.flexible) return "auto";
    return `${props.size || 16}px`;
  }};

  ${props => props.flexible && css`
    flex: 1;
  `}
`;

// Toolbar separator
export const ToolbarSeparator = styled.div`
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 8px;
`;

// Toolbar group (for grouping related buttons)
export const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 4px;
  margin: 0 4px;

  ${ToolbarButton} {
    margin: 0 2px;
    border-radius: 8px;
  }
`;

// Badge component for toolbar buttons
export const ToolbarBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;

  min-width: 16px;
  height: 16px;
  padding: 0 4px;

  background: #ff3b30;
  color: white;

  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;

  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

// Styled button with badge support
export const ToolbarButtonWithBadge = styled.div`
  position: relative;
  display: inline-flex;
`;

// Toolbar text component
export const ToolbarText = styled.span`
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  font-weight: 500;
  padding: 0 12px;
  white-space: nowrap;
`;

// Progress indicator for toolbar
export const ToolbarProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: rgba(0, 122, 255, 0.8);
  border-radius: 1px;
  width: ${props => props.progress || 0}%;
  transition: width 0.3s ease;
`;

// Export utility functions for toolbar
export const ToolbarUtils = {
  // Create standard toolbar items
  createBackButton: (onPress) => ({
    type: "button",
    icon: "←",
    title: "Back",
    action: "back",
    onPress,
  }),

  createShareButton: (onPress) => ({
    type: "button",
    icon: "↗",
    title: "Share",
    action: "share",
    onPress,
  }),

  createMoreButton: (onPress) => ({
    type: "button",
    icon: "⋯",
    title: "More",
    action: "more",
    onPress,
  }),

  createFlexibleSpace: () => ({
    type: "flexibleSpace",
  }),

  createFixedSpace: (size = 16) => ({
    type: "space",
    size,
  }),

  // Validate toolbar items
  validateItems: (items) => items.filter(item => {
      if (!item.type) item.type = "button";

      if (item.type === "button" && !item.title && !item.icon) {
        console.warn("[ToolbarUtils] Button item missing title and icon");
        return false;
      }

      return true;
    }),

  // Calculate optimal button sizes
  calculateButtonSizes: (items, containerWidth, padding = 16) => {
    const availableWidth = containerWidth - (padding * 2);
    const buttonItems = items.filter(item => item.type === "button" || !item.type);
    const spaceItems = items.filter(item => item.type === "space");
    const flexibleSpaces = items.filter(item => item.type === "flexibleSpace");

    const fixedSpaceWidth = spaceItems.reduce((sum, item) => sum + (item.size || 16), 0);
    const minButtonWidth = 44;
    const totalMinButtonWidth = buttonItems.length * minButtonWidth;

    const remainingWidth = availableWidth - fixedSpaceWidth - totalMinButtonWidth;
    const flexibleSpaceWidth = flexibleSpaces.length > 0 ? remainingWidth / flexibleSpaces.length : 0;

    return {
      buttonWidth: minButtonWidth,
      flexibleSpaceWidth: Math.max(flexibleSpaceWidth, 0),
      totalWidth: totalMinButtonWidth + fixedSpaceWidth + (flexibleSpaceWidth * flexibleSpaces.length),
    };
  },
};

export default {
  ToolbarContainer,
  ToolbarItem,
  ToolbarButton,
  ToolbarSpace,
  ToolbarSeparator,
  ToolbarGroup,
  ToolbarBadge,
  ToolbarButtonWithBadge,
  ToolbarText,
  ToolbarProgress,
  ToolbarUtils,
};
