import styled from "styled-components";

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: ${(props) => props.$width || "100%"};
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
`;

export const InputLabel = styled.label`
  font-size: ${(props) => {
    if (props.$isFocused || props.$hasValue) return "12px";
    return "14px";
  }};
  font-weight: 500;
  color: ${(props) => {
    if (props.$hasError) return "#ff4444";
    if (props.$isFocused) return "#000";
    return "#333";
  }};
  margin-bottom: 6px;
  transition: all 0.2s ease;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  transform: ${(props) =>
    props.$isFocused || props.$hasValue ? "translateY(0)" : "translateY(2px)"};
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: ${(props) => {
    switch (props.$size) {
      case "small":
        return "1000px";
      case "large":
        return "1000px";
      default:
        return "1000px";
    }
  }};
  height: ${(props) => {
    switch (props.$size) {
      case "small":
        return "36px";
      case "large":
        return "56px";
      default:
        return "48px";
    }
  }};
  overflow: hidden;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "text")};
  opacity: ${(props) => (props.$disabled ? "0.6" : "1")};
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  transform: translateY(0px) translateX(0px);
  box-shadow: ${(props) => {
    if (props.$hasError) return "0 0 0 2px rgba(255, 68, 68, 0.3), 0 1px 3px rgba(0, 0, 0, 0.03)";
    if (props.$isFocused) return "0 0 0 2px rgba(0, 123, 255, 0.3), 0 1px 3px rgba(0, 0, 0, 0.03)";
    return "0 1px 3px rgba(0, 0, 0, 0.03)";
  }};

  &:hover {
    transform: ${(props) => (props.$disabled ? "translateY(0px) translateX(0px)" : "translateY(-1px) translateX(0px)")};
    box-shadow: ${(props) => {
      if (props.$disabled) return "0 1px 3px rgba(0, 0, 0, 0.03)";
      if (props.$hasError) return "0 0 0 2px rgba(255, 68, 68, 0.4), 0 6px 16px rgba(0, 0, 0, 0.15)";
      if (props.$isFocused) return "0 0 0 2px rgba(0, 123, 255, 0.4), 0 6px 16px rgba(0, 0, 0, 0.15)";
      return "0 6px 16px rgba(0, 0, 0, 0.15)";
    }};
  }
`;

export const Background = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 1000px;
  overflow: hidden;
`;

export const BlurContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 1000px;
  backdrop-filter: blur(4px);
`;

export const MaskContainer = styled.div`
  display: none;
`;

export const MaskShape = styled.div`
  display: none;
`;

export const BlurEffect = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 1000px;
  position: absolute;
  top: 0;
  left: 0;
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;

  /* Chromatic aberration color-bending effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 1000px;
    backdrop-filter: hue-rotate(8deg) saturate(1.15);
    mix-blend-mode: color-dodge;
    opacity: 0.3;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 1000px;
    backdrop-filter: hue-rotate(-8deg) saturate(1.2) contrast(1.05);
    mix-blend-mode: soft-light;
    opacity: 0.25;
    pointer-events: none;
  }

  /* Additional color shift layers */
  box-shadow:
    /* Red channel shift */
    inset 2px 0 4px rgba(255, 0, 0, 0.08),
    inset -1px 0 4px rgba(0, 255, 255, 0.08),
    /* Green channel shift */ inset 0 2px 4px rgba(0, 255, 0, 0.06),
    inset 0 -1px 4px rgba(255, 0, 255, 0.06),
    /* Blue channel shift */ inset 1px 1px 4px rgba(0, 0, 255, 0.08),
    inset -2px -2px 4px rgba(255, 255, 0, 0.08);
`;

export const FillLayer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 1000px;
  position: absolute;
  top: 0;
  left: 0;
  background:
    radial-gradient(
      ellipse at center,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.08) 70%,
      rgba(255, 255, 255, 0.15) 100%
    ),
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
  box-shadow:
    inset 2px 2px 4px rgba(255, 255, 255, 0.25),
    inset -1px -1px 2px rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(0, 0, 0, 0.1);
`;

export const GlassEffectLayer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 1000px;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
`;

export const StyledInput = styled.input`
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: ${(props) => {
    const verticalPadding = props.$size === "small" ? "8px" : props.$size === "large" ? "16px" : "12px";
    const leftPadding = props.$hasIcon && props.$iconPosition === "left" ?
      (props.$size === "small" ? "36px" : props.$size === "large" ? "52px" : "44px") : "24px";
    const rightPadding = props.$hasIcon && props.$iconPosition === "right" ?
      (props.$size === "small" ? "36px" : props.$size === "large" ? "52px" : "44px") : "24px";
    return `${verticalPadding} ${rightPadding} ${verticalPadding} ${leftPadding}`;
  }};
  border: none;
  outline: none;
  background: transparent;
  font-size: ${(props) => {
    switch (props.$size) {
      case "small":
        return "13px";
      case "large":
        return "16px";
      default:
        return "14px";
    }
  }};
  font-weight: 500;
  color: #000;
  font-family: inherit;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  z-index: 10;
  transition: all 0.2s ease;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "text")};
  transform: translateX(0px);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;

  &::placeholder {
    color: #666;
    font-weight: 400;
    opacity: 0.8;
  }

  &:focus {
    &::placeholder {
      opacity: 0.6;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:read-only {
    cursor: default;
  }

  /* Remove default input styling */
  &[type="search"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }

  &[type="number"] {
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  @media (max-width: 991px) {
    font-size: ${(props) => {
      switch (props.$size) {
        case "small":
          return "12px";
        case "large":
          return "15px";
        default:
          return "13px";
      }
    }};
  }
  @media (max-width: 640px) {
    font-size: ${(props) => {
      switch (props.$size) {
        case "small":
          return "11px";
        case "large":
          return "14px";
        default:
          return "12px";
      }
    }};
  }
`;

export const InputIcon = styled.div`
  position: absolute;
  ${(props) => (props.$position === "right" ? "right: 16px;" : "left: 16px;")}
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => {
    switch (props.$size) {
      case "small":
        return "16px";
      case "large":
        return "24px";
      default:
        return "20px";
    }
  }};
  height: ${(props) => {
    switch (props.$size) {
      case "small":
        return "16px";
      case "large":
        return "24px";
      default:
        return "20px";
    }
  }};
  font-size: ${(props) => {
    switch (props.$size) {
      case "small":
        return "14px";
      case "large":
        return "18px";
      default:
        return "16px";
    }
  }};
  color: #666;
  z-index: 15;
  pointer-events: none;
`;

export const ErrorMessage = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #ff4444;
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  line-height: 1.4;
`;

export const HelperText = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: #666;
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  line-height: 1.4;
`;

export const CharacterCount = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${(props) => (props.$isOverLimit ? "#ff4444" : "#999")};
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  flex-shrink: 0;
`;
