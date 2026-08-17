import styled, { css } from "styled-components";

/* Keep styled-only props off the DOM (`size` in particular is a real numeric
 * HTML attribute that our string values would violate). */
const block = (...names) => ({
  shouldForwardProp: (prop) => !names.includes(prop),
});

export const DropdownContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;
  font-family: var(--font-ui);

  &:last-child {
    margin-bottom: 0;
  }
`;

export const DropdownLabel = styled.label.withConfig(block("disabled"))`
  display: block;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink-1);
  margin-bottom: 7px;

  ${props => props.disabled && css`
    color: var(--ink-4);
  `}
`;

export const RequiredIndicator = styled.span`
  color: var(--danger);
  margin-left: 4px;
`;

export const DropdownTrigger = styled.button.withConfig(
  block("size", "variant", "isOpen", "hasError"),
)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-md);
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: border 0.12s, background 0.12s, box-shadow 0.12s;
  text-align: left;
  font-family: inherit;
  letter-spacing: -0.005em;
  outline: none;

  /* Size variants */
  ${props => props.size === "small" && css`
    min-height: 36px;
    padding: 8px 12px;
    border-radius: var(--r-sm);
    font-size: 14px;
  `}

  ${props => props.size === "medium" && css`
    min-height: 44px;
    padding: 12px 14px;
    font-size: 15px;
  `}

  ${props => props.size === "large" && css`
    min-height: 52px;
    padding: 15px 18px;
    border-radius: var(--r-lg);
    font-size: 16px;
  `}

  /* Variant styles */
  ${props => props.variant === "outline" && css`
    background: transparent;
    border: 1px solid var(--cream-3);
  `}

  ${props => props.variant === "filled" && css`
    background: var(--cream-1);
  `}

  /* Focus state */
  &:focus {
    border-color: var(--ink-1);
    background: #fff;
    box-shadow: 0 0 0 4px var(--signal-yellow-soft);
  }

  /* Open state */
  ${props => props.isOpen && css`
    border-color: var(--ink-1);
    background: #fff;
    box-shadow: 0 0 0 4px var(--signal-yellow-soft);
  `}

  /* Error state */
  ${props => props.hasError && css`
    border-color: var(--danger);
    background: var(--danger-soft);

    &:focus {
      box-shadow: 0 0 0 4px rgba(194, 50, 28, 0.14);
    }
  `}

  /* Disabled state */
  ${props => props.disabled && css`
    background: var(--cream-1);
    opacity: 0.6;
    cursor: not-allowed;

    &:focus {
      border-color: var(--glass-stroke);
      box-shadow: none;
    }
  `}

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 2px;
    border-style: solid;
    border-color: var(--ink-1);
  }
`;

export const TriggerContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const TriggerValue = styled.span`
  color: var(--ink-1);
  font-weight: 500;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TriggerPlaceholder = styled.span`
  color: var(--ink-4);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TriggerIcon = styled.span.withConfig(block("isOpen"))`
  color: var(--ink-3);
  margin-left: 8px;
  transition: transform 0.16s ease-in-out;
  font-size: 12px;
  display: flex;
  align-items: center;

  ${props => props.isOpen && css`
    transform: rotate(180deg);
  `}
`;

export const DropdownMenu = styled.div.withConfig(block("maxHeight"))`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--cream-0);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-md);
  box-shadow: var(--glass-shadow);
  margin-top: 5px;
  overflow: hidden;
  max-height: ${props => props.maxHeight};
  overflow-y: auto;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--cream-1);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--cream-3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--ink-4);
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--glass-stroke);
  padding: 12px 14px;
  font-size: 15px;
  font-family: inherit;
  letter-spacing: -0.005em;
  color: var(--ink-1);
  outline: none;
  background: var(--cream-1);

  &::placeholder {
    color: var(--ink-4);
  }

  &:focus {
    background: #fff;
    border-bottom-color: var(--ink-1);
  }
`;

export const MenuItem = styled.div.withConfig(
  block("isFocused", "isSelected", "disabled"),
)`
  display: flex;
  align-items: center;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
  color: var(--ink-2);
  font-size: 15px;
  letter-spacing: -0.005em;
  border: none;
  text-align: left;
  width: 100%;

  &:hover {
    background: var(--cream-1);
    color: var(--ink-1);
  }

  ${props => props.isFocused && css`
    background: var(--cream-1);
    color: var(--ink-1);
  `}

  ${props => props.isSelected && css`
    background: var(--signal-yellow-soft);
    color: var(--ink-1);
    font-weight: 600;
  `}

  ${props => props.disabled && css`
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background: transparent;
    }
  `}

  /* Active state */
  &:active:not(:disabled) {
    background: var(--cream-2);
  }
`;

export const MenuItemIcon = styled.span`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  min-width: 20px;
`;

export const MenuItemText = styled.span`
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NoResults = styled.div`
  padding: 16px;
  text-align: center;
  color: var(--ink-4);
  font-size: 14px;
`;

export const ErrorMessage = styled.div`
  font-size: 12.5px;
  color: var(--danger);
  margin-top: 6px;
  font-weight: 500;
  display: flex;
  align-items: flex-start;
  gap: 5px;

  &:before {
    content: "—";
    color: var(--danger);
  }
`;

export const HelperText = styled.div`
  font-size: 12.5px;
  color: var(--ink-4);
  margin-top: 6px;
  line-height: 1.4;
`;

export const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const MessageContainer = styled.div`
  /* Container for error and helper text messages */
`;
