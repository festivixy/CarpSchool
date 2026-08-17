import styled, { css } from "styled-components";
import { btnBase } from "./tokens";

/* Custom props consumed by the styled layer — never forward these to the DOM. */
const CUSTOM_PROPS = ["variant", "size", "hasIcon", "position"];
const forwardProp = (prop) => !CUSTOM_PROPS.includes(prop);

// Base button styles
export const StyledButton = styled.button.withConfig({
  shouldForwardProp: forwardProp,
})`
  ${btnBase}
  text-decoration: none;
  outline: none;
  position: relative;

  /* Focus styles for accessibility */
  &:focus-visible {
    outline: 2px solid var(--ink-1);
    outline-offset: 2px;
  }

  /* Size variants */
  ${props => props.size === "small" && css`
    padding: 8px 14px;
    font-size: 12.5px;
    min-height: 32px;
  `}

  ${props => props.size === "medium" && css`
    padding: 12px 20px;
    font-size: 14px;
    min-height: 44px;
  `}

  ${props => props.size === "large" && css`
    padding: 15px 28px;
    font-size: 16px;
    min-height: 52px;
  `}

  /* Primary variant — ink on paper, the default call to action */
  ${props => props.variant === "primary" && css`
    background: var(--ink-1);
    color: var(--cream-0);

    &:hover:not(:disabled) {
      background: #000;
    }
  `}

  /* Secondary variant */
  ${props => props.variant === "secondary" && css`
    background: var(--cream-2);
    color: var(--ink-1);

    &:hover:not(:disabled) {
      background: var(--cream-3);
    }
  `}

  /* Danger variant */
  ${props => props.variant === "danger" && css`
    background: var(--danger);
    color: var(--cream-0);

    &:hover:not(:disabled) {
      background: var(--danger-deep);
    }
  `}

  /* Outline variant */
  ${props => props.variant === "outline" && css`
    background: transparent;
    color: var(--ink-1);
    border: 1.5px solid var(--ink-1);

    &:hover:not(:disabled) {
      background: var(--ink-1);
      color: var(--cream-0);
    }
  `}

  /* Ghost variant */
  ${props => props.variant === "ghost" && css`
    background: rgba(255, 255, 255, 0.5);
    color: var(--ink-1);
    border: 1px solid var(--glass-stroke);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.9);
    }
  `}

  /* Disabled state */
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Mobile touch optimizations */
  @media (max-width: 768px) {
    min-height: 44px; /* iOS minimum touch target */

    ${props => props.size === "small" && css`
      min-height: 36px;
      padding: 10px 18px;
    `}
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:active:not(:disabled) {
      transform: none;
    }
  }
`;

export const ButtonIcon = styled.span.withConfig({
  shouldForwardProp: forwardProp,
})`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ButtonText = styled.span.withConfig({
  shouldForwardProp: forwardProp,
})`
  display: flex;
  align-items: center;
  white-space: nowrap;

  /* Ensure text doesn't break when there's an icon */
  ${props => props.hasIcon && css`
    min-width: 0;
  `}
`;
