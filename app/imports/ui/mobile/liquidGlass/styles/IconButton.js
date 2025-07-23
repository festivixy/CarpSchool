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

const getColorConfig = (color, variant) => {
  const colors = {
    default: {
      text: "#333",
      background: "rgba(255, 255, 255, 0.08)",
      border: "rgba(255, 255, 255, 0.15)",
      hoverBackground: "rgba(255, 255, 255, 0.12)",
      activeBackground: "rgba(255, 255, 255, 0.18)",
    },
    primary: {
      text: "#007bff",
      background: "rgba(0, 123, 255, 0.1)",
      border: "rgba(0, 123, 255, 0.2)",
      hoverBackground: "rgba(0, 123, 255, 0.15)",
      activeBackground: "rgba(0, 123, 255, 0.25)",
    },
    secondary: {
      text: "#6c757d",
      background: "rgba(108, 117, 125, 0.1)",
      border: "rgba(108, 117, 125, 0.2)",
      hoverBackground: "rgba(108, 117, 125, 0.15)",
      activeBackground: "rgba(108, 117, 125, 0.25)",
    },
    success: {
      text: "#28a745",
      background: "rgba(40, 167, 69, 0.1)",
      border: "rgba(40, 167, 69, 0.2)",
      hoverBackground: "rgba(40, 167, 69, 0.15)",
      activeBackground: "rgba(40, 167, 69, 0.25)",
    },
    warning: {
      text: "#ffc107",
      background: "rgba(255, 193, 7, 0.1)",
      border: "rgba(255, 193, 7, 0.2)",
      hoverBackground: "rgba(255, 193, 7, 0.15)",
      activeBackground: "rgba(255, 193, 7, 0.25)",
    },
    danger: {
      text: "#dc3545",
      background: "rgba(220, 53, 69, 0.1)",
      border: "rgba(220, 53, 69, 0.2)",
      hoverBackground: "rgba(220, 53, 69, 0.15)",
      activeBackground: "rgba(220, 53, 69, 0.25)",
    },
  };

  return colors[color] || colors.default;
};

export const IconButtonContainer = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => getSizeConfig(props.size).width};
  height: ${(props) => getSizeConfig(props.size).height};
  border-radius: 50%;
  border: none;
  outline: none;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? "0.6" : "1")};
  transition: all 0.2s ease;
  transform: translateY(0px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  background: transparent;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;

  /* Active state styles */
  ${(props) =>
    props.active &&
    `
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.12);
  `}

  &:hover {
    transform: ${(props) => (props.disabled ? "translateY(0px)" : "translateY(-2px)")};
    box-shadow: ${(props) =>
      props.disabled
        ? "0 2px 8px rgba(0, 0, 0, 0.08)"
        : props.active
          ? "0 0 0 2px rgba(0, 123, 255, 0.4), 0 6px 20px rgba(0, 0, 0, 0.15)"
          : "0 6px 20px rgba(0, 0, 0, 0.15)"};
  }

  &:active {
    transform: ${(props) => (props.disabled ? "translateY(0px)" : "translateY(-1px)")};
    box-shadow: ${(props) =>
      props.disabled
        ? "0 2px 8px rgba(0, 0, 0, 0.08)"
        : "0 3px 12px rgba(0, 0, 0, 0.12)"};
  }

  /* Focus styles for accessibility */
  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

export const IconButtonBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  overflow: hidden;
`;

export const IconButtonBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(8px);
  background: ${(props) => getColorConfig(props.color, props.variant).background};
  border: 1px solid ${(props) => getColorConfig(props.color, props.variant).border};
  border-radius: 50%;

  /* Chromatic aberration color-bending effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    backdrop-filter: hue-rotate(6deg) saturate(1.1);
    mix-blend-mode: color-dodge;
    opacity: 0.25;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    backdrop-filter: hue-rotate(-6deg) saturate(1.15) contrast(1.03);
    mix-blend-mode: soft-light;
    opacity: 0.2;
    pointer-events: none;
  }

  /* Color shift box shadows */
  box-shadow:
    /* Red channel shift */
    inset 1px 0 3px rgba(255, 0, 0, 0.06),
    inset -1px 0 3px rgba(0, 255, 255, 0.06),
    /* Green channel shift */
    inset 0 1px 3px rgba(0, 255, 0, 0.05),
    inset 0 -1px 3px rgba(255, 0, 255, 0.05),
    /* Blue channel shift */
    inset 1px 1px 3px rgba(0, 0, 255, 0.06),
    inset -1px -1px 3px rgba(255, 255, 0, 0.06);
`;

export const IconButtonGlass = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background:
    radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.1) 40%,
      transparent 70%
    ),
    radial-gradient(
      ellipse at center,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.12) 70%,
      rgba(255, 255, 255, 0.2) 100%
    ),
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.08) 100%
    );
  box-shadow:
    inset 2px 2px 4px rgba(255, 255, 255, 0.3),
    inset -1px -1px 2px rgba(0, 0, 0, 0.05);
`;

export const IconButtonContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 10;

  .spinner {
    width: ${(props) => getSizeConfig(props.size).iconSize};
    height: ${(props) => getSizeConfig(props.size).iconSize};
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

export const IconButtonIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => getSizeConfig(props.size).iconSize};
  height: ${(props) => getSizeConfig(props.size).iconSize};
  font-size: ${(props) => getSizeConfig(props.size).fontSize};
  color: ${(props) => getColorConfig(props.color, props.variant).text};
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  line-height: 1;
  transition: all 0.2s ease;

  /* Handle emoji and text centering */
  text-align: center;
  
  /* Ensure single character/emoji is properly centered */
  & > * {
    display: block;
    line-height: 1;
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
