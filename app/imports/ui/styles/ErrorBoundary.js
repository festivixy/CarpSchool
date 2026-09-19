import styled, { css } from "styled-components";
import { btnBase, btnPrimary } from "./tokens";

/* This file predates the token layer but already shipped dark-mode support.
 * The light path is on tokens; the dark path keeps literal values because the
 * palette has no dark ramp yet. When a dark token set lands, replace the
 * prefers-color-scheme blocks below. */
const DARK_SURFACE = "#17171a";
const DARK_SURFACE_2 = "#212125";
const DARK_STROKE = "#31313a";
const DARK_TEXT = "#ecebe4";
const DARK_TEXT_DIM = "#a6a49c";

export const ErrorContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "variant",
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  font-family: var(--font-ui);
  color: var(--ink-1);
  background: var(--cream-0);
  border-radius: var(--r-lg);
  border: 1px solid var(--glass-stroke);
  margin: 20px;
  min-height: 200px;

  /* Variant styles */
  ${props => props.variant === "minimal" && css`
    padding: 20px;
    min-height: auto;
    background: transparent;
    border: none;
    margin: 0;
  `}

  ${props => props.variant === "detailed" && css`
    padding: 60px 40px;
    max-width: 600px;
    margin: 40px auto;
    box-shadow: var(--glass-shadow);
  `}

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background: ${DARK_SURFACE};
    border-color: ${DARK_STROKE};
    color: ${DARK_TEXT};
  }
`;

export const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;

  ${ErrorContainer}[data-variant="minimal"] & {
    font-size: 24px;
    margin-bottom: 8px;
  }
`;

export const ErrorTitle = styled.h2`
  font-family: var(--font-display);
  color: var(--ink-1);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 14px 0;
  line-height: 1.2;

  ${ErrorContainer}[data-variant="minimal"] & {
    font-size: 18px;
    margin: 0 0 8px 0;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    color: ${DARK_TEXT};
  }
`;

export const ErrorMessage = styled.p`
  color: var(--ink-3);
  font-size: 15px;
  line-height: 1.5;
  letter-spacing: -0.005em;
  margin: 0 0 24px 0;
  max-width: 400px;

  ${ErrorContainer}[data-variant="minimal"] & {
    font-size: 14px;
    margin: 0 0 16px 0;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    color: ${DARK_TEXT_DIM};
  }
`;

export const ErrorDetails = styled.details`
  margin: 16px 0 24px 0;
  padding: 16px;
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-md);
  text-align: left;
  max-width: 100%;
  overflow: auto;

  summary {
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    color: var(--ink-1);
    margin-bottom: 12px;
    outline: none;

    &:hover {
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid var(--ink-1);
      outline-offset: 2px;
      border-radius: var(--r-sm);
    }
  }

  pre {
    font-family: var(--font-mono);
    font-size: 11.5px;
    line-height: 1.45;
    color: var(--ink-3);
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    padding: 0;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background: ${DARK_SURFACE_2};
    border-color: ${DARK_STROKE};

    summary {
      color: ${DARK_TEXT};
    }

    pre {
      color: ${DARK_TEXT_DIM};
    }
  }
`;

export const ErrorActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;

  ${ErrorContainer}[data-variant="minimal"] & {
    margin-bottom: 8px;
  }
`;

export const RetryButton = styled.button`
  ${btnBase}
  ${btnPrimary}
  padding: 12px 22px;
  font-size: 14px;

  &:focus-visible {
    outline: 2px solid var(--ink-1);
    outline-offset: 2px;
  }

  ${ErrorContainer}[data-variant="minimal"] & {
    padding: 8px 16px;
    font-size: 13px;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background: var(--signal-yellow);
    color: var(--on-accent);

    &:hover {
      background: var(--signal-yellow-deep);
    }
  }
`;

export const ReportButton = styled.button`
  ${btnBase}
  background: transparent;
  color: var(--ink-1);
  border: 1.5px solid var(--ink-1);
  padding: 11px 20px;
  font-size: 14px;

  &:hover {
    background: var(--ink-1);
    color: var(--cream-0);
  }

  &:focus-visible {
    outline: 2px solid var(--ink-1);
    outline-offset: 2px;
  }

  ${ErrorContainer}[data-variant="minimal"] & {
    padding: 6px 14px;
    font-size: 13px;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    color: ${DARK_TEXT};
    border-color: ${DARK_STROKE};

    &:hover {
      background: ${DARK_TEXT};
      color: ${DARK_SURFACE};
    }
  }
`;

export const ErrorCode = styled.div`
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-4);
  background: var(--cream-1);
  padding: 8px 12px;
  border-radius: var(--r-sm);
  border: 1px solid var(--glass-stroke);
  user-select: all;
  cursor: text;

  ${ErrorContainer}[data-variant="minimal"] & {
    font-size: 11px;
    padding: 4px 8px;
  }

  small {
    font-size: 10px;
    color: var(--ink-4);
    display: block;
    margin-top: 4px;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background: ${DARK_SURFACE_2};
    border-color: ${DARK_STROKE};
    color: ${DARK_TEXT_DIM};

    small {
      color: ${DARK_TEXT_DIM};
    }
  }
`;

export const ReportStatus = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "status",
})`
  font-size: 13px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  text-align: center;
  margin: 12px 0;

  ${props => {
    switch (props.status) {
      case "reporting":
        return css`
          background: var(--signal-yellow-soft);
          color: var(--ink-2);
          border: 1px solid var(--signal-yellow-deep);
        `;
      case "success":
        return css`
          background: var(--leaf-soft);
          color: var(--leaf);
          border: 1px solid var(--leaf);
        `;
      case "failed":
        return css`
          background: var(--danger-soft);
          color: var(--danger-deep);
          border: 1px solid var(--danger);
        `;
      default:
        return css`
          background: var(--cream-1);
          color: var(--ink-3);
          border: 1px solid var(--glass-stroke);
        `;
    }
  }}

  ${ErrorContainer}[data-variant="minimal"] & {
    font-size: 12px;
    padding: 6px 10px;
    margin: 8px 0;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background: ${DARK_SURFACE_2};
    color: ${DARK_TEXT_DIM};
    border-color: ${DARK_STROKE};
  }
`;
