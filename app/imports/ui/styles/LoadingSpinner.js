import styled, { css, keyframes } from "styled-components";

// Animation keyframes
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.8);
  }
`;

const dotBounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

const ringDash = keyframes`
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
`;

// Size mixins
const getSizeStyles = (size) => {
  switch (size) {
    case "small":
      return css`
        width: 16px;
        height: 16px;
      `;
    case "medium":
      return css`
        width: 24px;
        height: 24px;
      `;
    case "large":
      return css`
        width: 32px;
        height: 32px;
      `;
    case "xlarge":
      return css`
        width: 48px;
        height: 48px;
      `;
    default:
      return css`
        width: 24px;
        height: 24px;
      `;
  }
};

// Color mixins
const getColorStyles = (color) => {
  switch (color) {
    case "primary":
      return css`
        color: #007AFF;
        border-color: #007AFF;
      `;
    case "secondary":
      return css`
        color: #8E8E93;
        border-color: #8E8E93;
      `;
    case "white":
      return css`
        color: white;
        border-color: white;
      `;
    case "dark":
      return css`
        color: #1C1C1E;
        border-color: #1C1C1E;
      `;
    default:
      return css`
        color: #007AFF;
        border-color: #007AFF;
      `;
  }
};

export const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  ${props => props.centered && css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `}

  ${props => props.overlay && css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 9999;
    backdrop-filter: blur(2px);
  `}

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

export const SpinnerElement = styled.div`
  ${props => getSizeStyles(props.size)}
  ${props => getColorStyles(props.color)}

  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;

  /* Ensure visibility */
  min-width: inherit;
  min-height: inherit;
`;

export const DotsSpinner = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  ${props => getColorStyles(props.color)}

  span {
    ${props => {
      const baseSize = props.size === "small" ? "6px" :
                     props.size === "large" ? "10px" :
                     props.size === "xlarge" ? "12px" : "8px";
      return css`
        width: ${baseSize};
        height: ${baseSize};
      `;
    }}

    background-color: currentColor;
    border-radius: 50%;
    animation: ${dotBounce} 1.4s ease-in-out infinite both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }

    &:nth-child(3) {
      animation-delay: 0s;
    }
  }
`;

export const PulseSpinner = styled.div`
  ${props => getSizeStyles(props.size)}
  ${props => getColorStyles(props.color)}

  background-color: currentColor;
  border-radius: 50%;
  animation: ${pulse} 1s ease-in-out infinite;
`;

export const RingSpinner = styled.div`
  ${props => getSizeStyles(props.size)}
  display: inline-block;

  svg {
    width: 100%;
    height: 100%;
    animation: ${spin} 2s linear infinite;
  }

  circle {
    fill: none;
    stroke: ${props => {
      switch (props.color) {
        case "primary": return "#007AFF";
        case "secondary": return "#8E8E93";
        case "white": return "white";
        case "dark": return "#1C1C1E";
        default: return "#007AFF";
      }
    }};
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 90, 150;
    stroke-dashoffset: 0;
    animation: ${ringDash} 1.5s ease-in-out infinite;
  }
`;

export const SpinnerText = styled.div`
  color: #1C1C1E;
  font-weight: 500;
  text-align: center;

  ${props => props.size === "small" && css`
    font-size: 12px;
  `}

  ${props => props.size === "medium" && css`
    font-size: 14px;
  `}

  ${props => props.size === "large" && css`
    font-size: 16px;
  `}

  ${props => props.size === "xlarge" && css`
    font-size: 18px;
  `}

  ${props => props.inline && css`
    margin: 0;
    white-space: nowrap;
  `}

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    color: #F2F2F7;
  }
`;
