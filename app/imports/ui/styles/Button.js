import styled, { css } from "styled-components";

// Base button styles
export const StyledButton = styled.button`
  /* Reset and base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  outline: none;
  position: relative;
  overflow: hidden;

  /* Focus styles for accessibility */
  &:focus-visible {
    outline: 2px solid #007AFF;
    outline-offset: 2px;
  }

  /* Size variants */
  ${props => props.size === "small" && css`
    padding: 8px 16px;
    font-size: 14px;
    min-height: 32px;
    border-radius: 6px;
  `}

  ${props => props.size === "medium" && css`
    padding: 12px 24px;
    font-size: 16px;
    min-height: 44px;
    border-radius: 8px;
  `}

  ${props => props.size === "large" && css`
    padding: 16px 32px;
    font-size: 18px;
    min-height: 52px;
    border-radius: 10px;
  `}

  /* Primary variant */
  ${props => props.variant === "primary" && css`
    background-color: #007AFF;
    color: white;

    &:hover:not(:disabled) {
      background-color: #0051D0;
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: #003999;
      transform: translateY(0);
    }
  `}

  /* Secondary variant */
  ${props => props.variant === "secondary" && css`
    background-color: #F2F2F7;
    color: #1C1C1E;

    &:hover:not(:disabled) {
      background-color: #E5E5EA;
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: #D1D1D6;
      transform: translateY(0);
    }
  `}

  /* Danger variant */
  ${props => props.variant === "danger" && css`
    background-color: #FF3B30;
    color: white;

    &:hover:not(:disabled) {
      background-color: #D70015;
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: #A20000;
      transform: translateY(0);
    }
  `}

  /* Outline variant */
  ${props => props.variant === "outline" && css`
    background-color: transparent;
    color: #007AFF;
    border: 2px solid #007AFF;

    &:hover:not(:disabled) {
      background-color: #007AFF;
      color: white;
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: #0051D0;
      transform: translateY(0);
    }
  `}

  /* Ghost variant */
  ${props => props.variant === "ghost" && css`
    background-color: transparent;
    color: #007AFF;

    &:hover:not(:disabled) {
      background-color: rgba(0, 122, 255, 0.1);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: rgba(0, 122, 255, 0.2);
      transform: translateY(0);
    }
  `}

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Mobile touch optimizations */
  @media (max-width: 768px) {
    min-height: 44px; /* iOS minimum touch target */
    
    ${props => props.size === "small" && css`
      min-height: 36px;
      padding: 10px 20px;
    `}
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover:not(:disabled), &:active:not(:disabled) {
      transform: none;
    }
  }
`;

export const ButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.position === "left" && css`
    margin-right: 8px;
  `}
  
  ${props => props.position === "right" && css`
    margin-left: 8px;
  `}

  /* Adjust icon spacing for different sizes */
  ${StyledButton}[data-size="small"] & {
    ${props => props.position === "left" && css`
      margin-right: 6px;
    `}
    
    ${props => props.position === "right" && css`
      margin-left: 6px;
    `}
  }

  ${StyledButton}[data-size="large"] & {
    ${props => props.position === "left" && css`
      margin-right: 10px;
    `}
    
    ${props => props.position === "right" && css`
      margin-left: 10px;
    `}
  }
`;

export const ButtonText = styled.span`
  display: flex;
  align-items: center;
  white-space: nowrap;
  
  /* Ensure text doesn't break when there's an icon */
  ${props => props.hasIcon && css`
    min-width: 0;
  `}
`;
