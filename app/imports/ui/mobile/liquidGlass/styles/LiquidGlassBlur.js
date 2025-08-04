import styled, { css, keyframes } from 'styled-components';

// Animation keyframes for floating effect
const floatingAnimation = keyframes`
  0% { transform: translateY(0px); }
  25% { transform: translateY(-2px); }
  50% { transform: translateY(0px); }
  75% { transform: translateY(2px); }
  100% { transform: translateY(0px); }
`;

// Fade in animation for blur appearance
const fadeInBlur = keyframes`
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(var(--blur-intensity));
    -webkit-backdrop-filter: blur(var(--blur-intensity));
  }
`;

// Glass shimmer effect for iOS 26 style
const glassShimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Base blur container styles
export const BlurContainer = styled.div`
  position: ${props => props.position || 'relative'};
  overflow: hidden;

  ${props => props.animated && css`
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `}

  ${props => props.floating && css`
    border-radius: 20px;
    margin: 16px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);

    /* iOS 26 Liquid Glass border */
    border: 0.5px solid rgba(255, 255, 255, 0.2);

    /* Subtle floating animation */
    animation: ${floatingAnimation} 4s ease-in-out infinite;
  `}
`;

// Native blur styles (transparent container over native UIVisualEffectView)
export const NativeBlurContainer = styled(BlurContainer)`
  background: transparent;
  z-index: 10;

  /* Ensure content is properly positioned over native blur */
  > * {
    position: relative;
    z-index: 1;
  }
`;

// CSS fallback blur styles
export const CSSBlurContainer = styled(BlurContainer)`
  --blur-intensity: ${props => (props.intensity || 1) * 20}px;

  background: ${props => getBlurBackground(props.blurStyle, props.intensity)};
  backdrop-filter: blur(var(--blur-intensity));
  -webkit-backdrop-filter: blur(var(--blur-intensity));

  ${props => props.animated && css`
    animation: ${fadeInBlur} 0.4s ease-out;
  `}

  /* iOS 26 style glass effect */
  ${props => props.iosStyle && css`
    background: linear-gradient(
      135deg,
      ${getBlurBackground(props.blurStyle, props.intensity * 0.8)} 0%,
      ${getBlurBackground(props.blurStyle, props.intensity * 1.2)} 100%
    );

    /* Glass shimmer overlay */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      background-size: 200% 100%;
      animation: ${glassShimmer} 3s ease-in-out infinite;
      pointer-events: none;
    }
  `}

  /* Fallback for browsers without backdrop-filter */
  @supports not (backdrop-filter: blur(1px)) {
    background: ${props => getBlurBackground(props.blurStyle, Math.min(props.intensity * 0.95, 0.98))};

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: inherit;
      filter: blur(2px);
      z-index: -1;
    }
  }
`;

// Loading state container
export const LoadingContainer = styled(BlurContainer)`
  background: rgba(255, 255, 255, 0.1);
  opacity: 0.6;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

// Toolbar blur container (specialized for toolbars)
export const ToolbarBlurContainer = styled(BlurContainer)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${props => props.height || '80px'};
  padding-bottom: env(safe-area-inset-bottom);

  ${props => props.floating && css`
    bottom: 16px;
    left: 16px;
    right: 16px;
    border-radius: 24px;
    height: ${props.height || '60px'};
  `}

  /* Ensure toolbar is above other content */
  z-index: 1000;
`;

// Content wrapper for blur containers
export const BlurContent = styled.div`
  position: relative;
  z-index: 2;
  padding: ${props => props.padding || '16px'};

  /* Ensure text is readable over blur */
  color: ${props => {
    switch (props.blurStyle) {
      case 'dark':
        return 'rgba(255, 255, 255, 0.9)';
      case 'light':
      case 'extraLight':
        return 'rgba(0, 0, 0, 0.9)';
      default:
        return 'var(--text-primary, rgba(0, 0, 0, 0.9))';
    }
  }};

  /* Text shadow for better readability */
  text-shadow: ${props => {
    switch (props.blurStyle) {
      case 'dark':
        return '0 1px 2px rgba(0, 0, 0, 0.5)';
      default:
        return '0 1px 2px rgba(255, 255, 255, 0.5)';
    }
  }};
`;

// Helper function to get blur background color
function getBlurBackground(blurStyle, intensity) {
  const alpha = Math.min(intensity * 0.7, 0.9);

  switch (blurStyle) {
    case 'dark':
      return `rgba(0, 0, 0, ${alpha})`;
    case 'light':
      return `rgba(255, 255, 255, ${alpha})`;
    case 'extraLight':
      return `rgba(255, 255, 255, ${alpha * 0.8})`;
    case 'tinted':
      return `rgba(120, 120, 128, ${alpha})`;
    default:
      // System material approximation
      return `rgba(242, 242, 247, ${alpha})`;
  }
}

// Export utility functions
export const BlurUtils = {
  getBlurBackground,

  // Get appropriate text color for blur style
  getTextColor: (blurStyle) => {
    switch (blurStyle) {
      case 'dark':
        return 'rgba(255, 255, 255, 0.9)';
      case 'light':
      case 'extraLight':
        return 'rgba(0, 0, 0, 0.9)';
      default:
        return 'rgba(0, 0, 0, 0.9)';
    }
  },

  // Check if backdrop-filter is supported
  supportsBackdropFilter: () => {
    return CSS.supports('backdrop-filter', 'blur(1px)') ||
           CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  },

  // Get optimal blur intensity for device
  getOptimalIntensity: (baseIntensity = 1.0) => {
    // Reduce intensity on older/slower devices
    const performanceMemory = navigator.deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;

    if (performanceMemory < 4 || hardwareConcurrency < 4) {
      return baseIntensity * 0.7;
    }

    return baseIntensity;
  }
};

// Additional containers for component variants
export const SimpleLoadingContainer = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0.6;
`;

export const SimpleNativeBlurContainer = styled.div`
  position: ${props => props.position};
  background: transparent;
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.3s ease;

  /* Ensure content is visible over native blur */
  z-index: 10;
`;

export const SimpleCSSBlurContainer = styled.div`
  position: ${props => props.position};
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: ${props => props.animated ? 'all 0.3s ease' : 'none'};

  /* CSS backdrop-filter fallback */
  background: ${props => {
    const alpha = props.intensity * 0.7;
    switch (props.blurStyle) {
      case 'dark':
        return `rgba(0, 0, 0, ${alpha})`;
      case 'tinted':
        return `rgba(120, 120, 128, ${alpha})`;
      default:
        return `rgba(255, 255, 255, ${alpha})`;
    }
  }};

  backdrop-filter: blur(${props => props.intensity * 20}px);
  -webkit-backdrop-filter: blur(${props => props.intensity * 20}px);

  ${props => props.floating && `
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    margin: 8px;
  `}

  /* Fallback for browsers without backdrop-filter support */
  @supports not (backdrop-filter: blur(1px)) {
    background: ${props => {
      const alpha = Math.min(props.intensity * 0.9, 0.95);
      switch (props.blurStyle) {
        case 'dark':
          return `rgba(0, 0, 0, ${alpha})`;
        case 'tinted':
          return `rgba(120, 120, 128, ${alpha})`;
        default:
          return `rgba(255, 255, 255, ${alpha})`;
      }
    }};
  }
`;

export default {
  BlurContainer,
  NativeBlurContainer,
  CSSBlurContainer,
  LoadingContainer,
  ToolbarBlurContainer,
  BlurContent,
  BlurUtils,
  SimpleLoadingContainer,
  SimpleNativeBlurContainer,
  SimpleCSSBlurContainer
};
