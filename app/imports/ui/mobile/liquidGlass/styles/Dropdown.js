import styled from "styled-components";

export const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  width: ${(props) => props.width || "200px"};
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
`;

export const DropdownTrigger = styled.div`
  display: inline-flex;
  padding: 12px 24px;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border-radius: 1000px;
  position: relative;
  width: 100%;
  height: 48px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? "0.6" : "1")};
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  transform: translateY(0px) translateX(0px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

  &:hover {
    transform: ${(props) =>
      props.disabled
        ? "translateY(0px) translateX(0px)"
        : "translateY(-1px) translateX(0px)"};
    box-shadow: ${(props) =>
      props.disabled
        ? "0 1px 3px rgba(0, 0, 0, 0.03)"
        : "0 6px 16px rgba(0, 0, 0, 0.15)"};
  }

  &:active {
    transform: translateY(0px) translateX(0px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const TriggerBackground = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 1000px;
  overflow: hidden;
`;

export const TriggerBlur = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1000px;
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

export const TriggerGlass = styled.div`
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

export const TriggerContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
  pointer-events: none;
  gap: 8px;
`;

export const TriggerText = styled.div`
  flex: 1;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  transform: translateX(0px);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;

  ${(props) =>
    !props.hasValue &&
    `
    color: #666;
    font-weight: 400;
  `}
`;

export const TriggerIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 12px;
  color: #666;
  transition: all 0.2s ease;
  cursor: ${(props) => (props.type === "clear" ? "pointer" : "inherit")};
  border-radius: 50%;
  pointer-events: ${(props) => (props.type === "clear" ? "all" : "none")};
  flex-shrink: 0;

  ${(props) =>
    props.type === "chevron" &&
    `
    transform: rotate(${props.isOpen ? "180deg" : "0deg"});
  `}

  ${(props) =>
    props.type === "clear" &&
    `
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #333;
    }
  `}
`;

export const DropdownMenu = styled.div`
  position: absolute;
  ${(props) =>
    props.position === "top"
      ? "bottom: calc(100% + 12px);"
      : "top: calc(100% + 12px);"}
  left: 0;
  right: 0;
  max-height: ${(props) => props.maxHeight || "300px"};
  background: transparent;
  border-radius: 16px;
  overflow: hidden;
  z-index: 1001;
  transform: translateY(
    ${(props) =>
      props.isOpen ? "0" : props.position === "top" ? "10px" : "-10px"}
  );
  opacity: ${(props) => (props.isOpen ? "1" : "0")};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
`;

export const MenuBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  overflow: hidden;
`;

export const MenuBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;

  /* Chromatic aberration color-bending effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
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
    border-radius: 16px;
    backdrop-filter: hue-rotate(-6deg) saturate(1.15) contrast(1.03);
    mix-blend-mode: soft-light;
    opacity: 0.2;
    pointer-events: none;
  }

  /* Additional color shift layers */
  box-shadow:
    /* Red channel shift */
    inset 3px 0 5px rgba(255, 0, 0, 0.06),
    inset -2px 0 5px rgba(0, 255, 255, 0.06),
    /* Green channel shift */ inset 0 3px 5px rgba(0, 255, 0, 0.05),
    inset 0 -2px 5px rgba(255, 0, 255, 0.05),
    /* Blue channel shift */ inset 2px 2px 5px rgba(0, 0, 255, 0.06),
    inset -3px -3px 5px rgba(255, 255, 0, 0.06);
`;

export const MenuGlass = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
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
    inset -1px -1px 2px rgba(0, 0, 0, 0.05);
`;

export const SearchInput = styled.input`
  position: relative;
  width: calc(100% - 16px);
  margin: 8px 8px 0 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 1000px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  font-size: 14px;
  font-weight: 500;
  color: #333;
  outline: none;
  z-index: 10;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);

  &::placeholder {
    color: #666;
    font-weight: 400;
  }

  &:focus {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }
`;

export const MenuList = styled.div`
  position: relative;
  max-height: ${(props) => props.maxHeight || "250px"};
  overflow-y: auto;
  z-index: 10;

  /* Webkit scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

export const MenuItem = styled.div`
  position: relative;
  margin: 6px 8px;
  border-radius: 1000px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? "0.5" : "1")};
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  overflow: hidden;

  /* Liquid glass background layers with chromatic aberration */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(6px) hue-rotate(4deg) saturate(1.05);
    background: rgba(255, 255, 255, 0.12);
    border-radius: 1000px;
    z-index: 1;
    transition: all 0.2s ease;
    mix-blend-mode: color-dodge;
    opacity: 0.8;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 1000px;
    backdrop-filter: hue-rotate(-4deg) saturate(1.1) contrast(1.02);
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
      /* Chromatic color shifts */
      inset 1px 0 3px rgba(255, 0, 0, 0.04),
      inset -1px 0 3px rgba(0, 255, 255, 0.04),
      inset 0 1px 3px rgba(0, 255, 0, 0.03),
      inset 0 -1px 3px rgba(255, 0, 255, 0.03),
      /* Original glass shadows */ inset 2px 2px 4px rgba(255, 255, 255, 0.3),
      inset -1px -1px 2px rgba(0, 0, 0, 0.08);
    z-index: 2;
    transition: all 0.2s ease;
    mix-blend-mode: soft-light;
    opacity: 0.9;
  }

  &:hover {
    transform: ${(props) => (props.disabled ? "none" : "translateY(-1px)")};
    box-shadow: ${(props) =>
      props.disabled
        ? "0 1px 3px rgba(0, 0, 0, 0.03)"
        : "0 4px 12px rgba(0, 0, 0, 0.1)"};

    &::before {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(6px) hue-rotate(6deg) saturate(1.1);
    }

    &::after {
      box-shadow:
        inset 2px 2px 4px rgba(255, 255, 255, 0.35),
        inset -1px -1px 2px rgba(0, 0, 0, 0.1);
    }
  }

  &:active {
    transform: ${(props) => (props.disabled ? "none" : "translateY(0)")};
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  ${(props) =>
    props.isSelected &&
    `
    &::before {
      background: rgba(0, 123, 255, 0.1);
      border: 1px solid rgba(0, 123, 255, 0.2);
    }
  `}

  ${(props) =>
    props.isFocused &&
    `
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3), 0 1px 3px rgba(0, 0, 0, 0.03);
  `}
`;

export const MenuItemContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  min-height: 40px;
  z-index: 10;
`;

export const MenuItemIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 14px;
  flex-shrink: 0;
`;

export const MenuItemText = styled.span`
  flex: 1;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  transform: translateX(0px);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MenuItemCheck = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 11px;
  font-weight: 600;
  color: #007bff;
  opacity: ${(props) => (props.isVisible ? "1" : "0")};
  transform: scale(${(props) => (props.isVisible ? "1" : "0.8")});
  transition: all 0.2s ease;
  flex-shrink: 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
`;

export const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  margin: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  text-align: center;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 16px;
  margin: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  text-align: center;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);

  .spinner {
    width: 16px;
    height: 16px;
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

export const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 8px 8px 0 8px;
  border-radius: 1px;
`;
