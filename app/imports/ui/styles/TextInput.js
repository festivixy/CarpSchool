import styled, { css } from "styled-components";

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 8px;

  ${props => props.disabled && css`
    color: #8E8E93;
  `}

  ${props => props.required && css`
    position: relative;
  `}
`;

export const RequiredIndicator = styled.span`
  color: #FF3B30;
  margin-left: 4px;
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  background-color: #F2F2F7;
  border: 2px solid transparent;

  /* Size variants */
  ${props => props.size === "small" && css`
    min-height: 36px;
    border-radius: 6px;
  `}

  ${props => props.size === "medium" && css`
    min-height: 44px;
    border-radius: 8px;
  `}

  ${props => props.size === "large" && css`
    min-height: 52px;
    border-radius: 10px;
  `}

  /* Variant styles */
  ${props => props.variant === "outline" && css`
    background-color: transparent;
    border: 2px solid #D1D1D6;
  `}

  ${props => props.variant === "filled" && css`
    background-color: #E5E5EA;
  `}

  /* Focus state */
  ${props => props.isFocused && css`
    border-color: #007AFF;
    box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.3);
  `}

  /* Error state */
  ${props => props.hasError && css`
    border-color: #FF3B30;
    background-color: rgba(255, 59, 48, 0.05);

    ${props.isFocused && css`
      box-shadow: 0 0 0 1px rgba(255, 59, 48, 0.3);
    `}
  `}

  /* Disabled state */
  ${props => props.disabled && css`
    background-color: #F2F2F7;
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
    border-color: #1C1C1E;
  }
`;

export const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  font-family: inherit;
  color: #1C1C1E;

  /* Size-based padding */
  ${props => props.size === "small" && css`
    padding: 8px 12px;
    font-size: 14px;
  `}

  ${props => props.size === "medium" && css`
    padding: 12px 16px;
    font-size: 16px;
  `}

  ${props => props.size === "large" && css`
    padding: 16px 20px;
    font-size: 18px;
  `}

  /* Icon spacing adjustments */
  ${props => props.hasIcon && props.iconPosition === "left" && css`
    padding-left: 8px;
  `}

  ${props => props.hasIcon && props.iconPosition === "right" && css`
    padding-right: 8px;
  `}

  /* Placeholder styles */
  &::placeholder {
    color: #8E8E93;
    opacity: 1;
  }

  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
    color: #8E8E93;
  }

  /* Remove default browser styling */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #F2F2F7 inset;
    -webkit-text-fill-color: #1C1C1E;
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

export const InputIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8E8E93;
  font-size: 16px;

  ${props => props.position === "left" && css`
    margin-right: 8px;
  `}

  ${props => props.position === "right" && css`
    margin-left: 8px;
  `}

  /* Size adjustments */
  ${InputWrapper}[data-size="small"] & {
    font-size: 14px;
  }

  ${InputWrapper}[data-size="large"] & {
    font-size: 18px;
  }
`;

export const ErrorMessage = styled.div`
  font-size: 14px;
  color: #FF3B30;
  margin-top: 4px;
  font-weight: 500;
  display: flex;
  align-items: flex-start;

  &:before {
    content: "⚠️";
    margin-right: 4px;
    font-size: 12px;
  }
`;

export const HelperText = styled.div`
  font-size: 14px;
  color: #8E8E93;
  margin-top: 4px;
  line-height: 1.4;
`;

export const CharacterCount = styled.div`
  font-size: 12px;
  color: #8E8E93;
  margin-top: 4px;
  text-align: right;

  ${props => props.isOverLimit && css`
    color: #FF3B30;
    font-weight: 600;
  `}
`;

export const MessageContainer = styled.div`
  /* Container for error, helper text and character count */
`;
