import styled from "styled-components";

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: ${(props) => props.width || "100%"};
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
`;

export const InputLabel = styled.label`
  font-size: ${(props) => {
    if (props.isFocused || props.hasValue) return "12px";
    return "14px";
  }};
  font-weight: 500;
  color: ${(props) => {
    if (props.hasError) return "#ff4444";
    if (props.isFocused) return "#000";
    return "#333";
  }};
  margin-bottom: 6px;
  transition: all 0.2s ease;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  transform: ${(props) =>
    props.isFocused || props.hasValue ? "translateY(0)" : "translateY(2px)"};
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: ${(props) => {
    switch (props.size) {
      case "small":
        return "8px";
      case "large":
        return "16px";
      default:
        return "12px";
    }
  }};
  height: ${(props) => {
    switch (props.size) {
      case "small":
        return "36px";
      case "large":
        return "56px";
      default:
        return "48px";
    }
  }};
  overflow: hidden;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "text")};
  opacity: ${(props) => (props.disabled ? "0.6" : "1")};
  transition: all 0.2s ease;
  transform: translateY(0px);
  box-shadow: ${(props) => {
    if (props.hasError) return "0 0 0 2px rgba(255, 68, 68, 0.3)";
    if (props.isFocused) return "0 0 0 2px rgba(0, 123, 255, 0.3)";
    return "0 1px 3px rgba(0, 0, 0, 0.03)";
  }};

  &:hover {
    transform: ${(props) => (props.disabled ? "translateY(0px)" : "translateY(-1px)")};
    box-shadow: ${(props) => {
      if (props.disabled) return "0 1px 3px rgba(0, 0, 0, 0.03)";
      if (props.hasError) return "0 0 0 2px rgba(255, 68, 68, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)";
      if (props.isFocused) return "0 0 0 2px rgba(0, 123, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)";
      return "0 4px 12px rgba(0, 0, 0, 0.1)";
    }};
  }
`;

export const InputBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  overflow: hidden;
`;

export const InputBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: inherit;

  /* Chromatic aberration color-bending effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
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
    border-radius: inherit;
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

export const InputGlass = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background:
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

export const StyledInput = styled.input`
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: ${(props) => {
    const verticalPadding = props.size === "small" ? "8px" : props.size === "large" ? "16px" : "12px";
    const leftPadding = props.hasIcon && props.iconPosition === "left" ? 
      (props.size === "small" ? "36px" : props.size === "large" ? "52px" : "44px") : "16px";
    const rightPadding = props.hasIcon && props.iconPosition === "right" ? 
      (props.size === "small" ? "36px" : props.size === "large" ? "52px" : "44px") : "16px";
    return `${verticalPadding} ${rightPadding} ${verticalPadding} ${leftPadding}`;
  }};
  border: none;
  outline: none;
  background: transparent;
  font-size: ${(props) => {
    switch (props.size) {
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
  cursor: ${(props) => (props.disabled ? "not-allowed" : "text")};

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
`;

export const InputIcon = styled.div`
  position: absolute;
  ${(props) => (props.position === "right" ? "right: 12px;" : "left: 12px;")}
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => {
    switch (props.size) {
      case "small":
        return "16px";
      case "large":
        return "24px";
      default:
        return "20px";
    }
  }};
  height: ${(props) => {
    switch (props.size) {
      case "small":
        return "16px";
      case "large":
        return "24px";
      default:
        return "20px";
    }
  }};
  font-size: ${(props) => {
    switch (props.size) {
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
  color: ${(props) => (props.isOverLimit ? "#ff4444" : "#999")};
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  flex-shrink: 0;
`;
