import styled from "styled-components";

const getSizeConfig = (size) => {
  switch (size) {
    case "small":
      return {
        width: "32px",
        height: "32px",
        fontSize: "14px",
        iconSize: "16px",
      };
    case "large":
      return {
        width: "56px",
        height: "56px",
        fontSize: "20px",
        iconSize: "24px",
      };
    case "xlarge":
      return {
        width: "72px",
        height: "72px",
        fontSize: "24px",
        iconSize: "28px",
      };
    default: // medium
      return {
        width: "44px",
        height: "44px",
        fontSize: "16px",
        iconSize: "20px",
      };
  }
};

const getColorConfig = (color) => {
  const colors = {
    default: "#000",
    primary: "#007bff",
    secondary: "#6c757d",
    success: "#28a745",
    warning: "#ffc107",
    danger: "#dc3545",
  };
  return colors[color] || colors.default;
};

export const IconButtonContainer = styled.button`
  display: inline-flex;
  padding: 0;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  position: relative;
  width: ${(props) => getSizeConfig(props.$size).width};
  height: ${(props) => getSizeConfig(props.$size).height};
  border: none;
  outline: none;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? "0.6" : "1")};
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  transform: translateY(0px) translateX(0px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  background: transparent;
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;

  /* Active state styles */
  ${(props) => props.$active &&
    `
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3), 0 1px 3px rgba(0, 0, 0, 0.03);
  `}

  &:hover {
    transform: ${(props) => (props.$disabled ? "translateY(0px) translateX(0px)" : "translateY(-1px) translateX(0px)")};
    box-shadow: ${(props) => (props.$disabled
        ? "0 1px 3px rgba(0, 0, 0, 0.03)"
        : props.$active
          ? "0 0 0 2px rgba(0, 123, 255, 0.4), 0 6px 16px rgba(0, 0, 0, 0.15)"
          : "0 6px 16px rgba(0, 0, 0, 0.15)")};
  }

  &:active {
    transform: ${(props) => (props.$disabled ? "translateY(0px) translateX(0px)" : "translateY(0px) translateX(0px)")};
    box-shadow: ${(props) => (props.$disabled
        ? "0 1px 3px rgba(0, 0, 0, 0.03)"
        : "0 2px 8px rgba(0, 0, 0, 0.1)")};
  }

  /* Focus styles for accessibility */
  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.4), 0 1px 3px rgba(0, 0, 0, 0.03);
  }
`;

export const Background = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  overflow: hidden;
`;

export const BlurContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.08);
  will-change: transform;
  transform: translateZ(0);

  /* Single subtle chromatic aberration effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    mix-blend-mode: overlay;
    opacity: 0.4;
    pointer-events: none;
  }
`;

export const MaskContainer = styled.div`
  display: none;
`;

export const MaskShape = styled.div`
  display: none;
`;

export const BlurEffect = styled.div`
  display: none;
`;

export const FillLayer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 100%
  );
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset -1px -1px 2px rgba(0, 0, 0, 0.05);
  will-change: transform;
  transform: translateZ(0);
`;

export const GlassEffectLayer = styled.div`
  display: none;
`;

export const LabelContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 10;
  pointer-events: none;
  transform: translateX(0px);

  .spinner {
    width: ${(props) => getSizeConfig(props.$size).iconSize};
    height: ${(props) => getSizeConfig(props.$size).iconSize};
    border: 2px solid rgba(102, 102, 102, 0.2);
    border-top: 2px solid #666;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const LabelSymbol = styled.div`
  width: 100%;
  text-align: center;
  position: relative;
`;

export const LabelText = styled.div`
  color: ${(props) => getColorConfig(props.$color)};
  font-weight: 500;
  font-size: ${(props) => getSizeConfig(props.$size).fontSize};
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  transform: translateX(0px);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  line-height: 1;
  text-align: center;

  /* Handle emoji and text centering */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Ensure single character/emoji is properly centered */
  & > * {
    display: block;
    line-height: 1;
  }

  @media (max-width: 991px) {
    font-size: ${(props) => {
      const baseSize = parseInt(getSizeConfig(props.$size).fontSize);
      return `${baseSize - 1}px`;
    }};
  }
  @media (max-width: 640px) {
    font-size: ${(props) => {
      const baseSize = parseInt(getSizeConfig(props.$size).fontSize);
      return `${baseSize - 2}px`;
    }};
  }
`;

export const IconButtonBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  z-index: 15;
  animation: pulse 2s infinite;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
`;
