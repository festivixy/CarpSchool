import styled, { css } from "styled-components";
import { inputBase } from "./tokens";

/* Keep styled-only props off the DOM (note: `size` is a real but numeric
 * input attribute, so our string sizes must never reach it). */
const block = (...names) => ({
  shouldForwardProp: (prop) => !names.includes(prop),
});

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const InputLabel = styled.label.withConfig(block("disabled", "required"))`
  display: block;
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink-1);
  margin-bottom: 7px;

  ${props => props.disabled && css`
    color: var(--ink-4);
  `}

  ${props => props.required && css`
    position: relative;
  `}
`;

export const RequiredIndicator = styled.span`
  color: var(--danger);
  margin-left: 4px;
`;

export const InputWrapper = styled.div.withConfig(
  block("size", "variant", "isFocused", "hasError", "hasIcon", "iconPosition", "disabled"),
)`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: var(--r-md);
  transition: border 0.12s, background 0.12s, box-shadow 0.12s;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--glass-stroke);

  /* Size variants */
  ${props => props.size === "small" && css`
    min-height: 36px;
    border-radius: var(--r-sm);
  `}

  ${props => props.size === "medium" && css`
    min-height: 44px;
  `}

  ${props => props.size === "large" && css`
    min-height: 52px;
    border-radius: var(--r-lg);
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
  ${props => props.isFocused && css`
    border-color: var(--ink-1);
    background: #fff;
    box-shadow: 0 0 0 4px var(--signal-yellow-soft);
  `}

  /* Error state */
  ${props => props.hasError && css`
    border-color: var(--danger);
    background: var(--danger-soft);

    ${props.isFocused && css`
      box-shadow: 0 0 0 4px rgba(194, 50, 28, 0.14);
    `}
  `}

  /* Disabled state */
  ${props => props.disabled && css`
    background: var(--cream-1);
    opacity: 0.6;
    cursor: not-allowed;
  `}

  /* Icon padding adjustments */
  ${props => props.hasIcon && props.iconPosition === "left" && css`
    padding-left: 12px;
  `}

  ${props => props.hasIcon && props.iconPosition === "right" && css`
    padding-right: 12px;
  `}

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 2px;
    border-style: solid;
    border-color: var(--ink-1);
  }
`;

export const StyledInput = styled.input.withConfig(
  block("size", "hasIcon", "iconPosition"),
)`
  ${inputBase}
  flex: 1;
  border: none;
  background: transparent;
  border-radius: 0;
  transition: none;

  &:focus {
    border: none;
    background: transparent;
    box-shadow: none;
  }

  /* Size-based padding */
  ${props => props.size === "small" && css`
    padding: 8px 12px;
    font-size: 14px;
  `}

  ${props => props.size === "medium" && css`
    padding: 12px 14px;
  `}

  ${props => props.size === "large" && css`
    padding: 15px 18px;
    font-size: 16px;
  `}

  /* Icon spacing adjustments */
  ${props => props.hasIcon && props.iconPosition === "left" && css`
    padding-left: 8px;
  `}

  ${props => props.hasIcon && props.iconPosition === "right" && css`
    padding-right: 8px;
  `}

  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
    color: var(--ink-4);
  }

  /* Remove default browser styling */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px var(--cream-0) inset;
    -webkit-text-fill-color: var(--ink-1);
    transition: background-color 5000s ease-in-out 0s;
  }

  /* Remove number input spinners */
  &[type="number"]::-webkit-outer-spin-button,
  &[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }

  /* Search input styling */
  &[type="search"]::-webkit-search-decoration,
  &[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

export const InputIcon = styled.span.withConfig(block("position"))`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-4);
  font-size: 16px;

  ${props => props.position === "left" && css`
    margin-right: 8px;
  `}

  ${props => props.position === "right" && css`
    margin-left: 8px;
  `}
`;

export const ErrorMessage = styled.div`
  font-family: var(--font-ui);
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
  font-family: var(--font-ui);
  font-size: 12.5px;
  color: var(--ink-4);
  margin-top: 6px;
  line-height: 1.4;
`;

export const CharacterCount = styled.div.withConfig(block("isOverLimit"))`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-4);
  margin-top: 6px;
  text-align: right;

  ${props => props.isOverLimit && css`
    color: var(--danger);
    font-weight: 600;
  `}
`;

export const MessageContainer = styled.div`
  /* Container for error, helper text and character count */
`;
