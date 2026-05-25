import { css } from "styled-components";

/**
 * Shared styled-components mixins for the "paper x ink x signal-yellow"
 * design language. Token values live as CSS variables in client/style.css;
 * these compose them into reusable component fragments.
 */

// Liquid-glass floating panel (over maps / imagery).
export const glass = css`
  background: var(--glass-tint);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid var(--glass-stroke);
  box-shadow: var(--glass-shadow);
`;

export const glassStrong = css`
  background: var(--glass-tint-strong);
  backdrop-filter: blur(36px) saturate(180%);
  -webkit-backdrop-filter: blur(36px) saturate(180%);
  border: 1px solid var(--glass-stroke);
  box-shadow: var(--glass-shadow);
`;

// Monospace uppercase label.
export const eyebrow = css`
  font-family: var(--font-mono);
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--ink-3);
  font-weight: 500;
`;

// Stabilo-Boss highlight underlay. Use at most once per heading.
export const marker = css`
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 38%,
    var(--signal-yellow) 38%,
    var(--signal-yellow) 92%,
    transparent 92%
  );
  padding: 0 0.08em;
  font-style: normal;
  color: var(--ink-1);
`;

// Button base + variants.
export const btnBase = css`
  font-family: var(--font-ui);
  font-weight: 600;
  font-size: 13.5px;
  border: 0;
  border-radius: var(--r-pill);
  padding: 11px 18px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  white-space: nowrap;
  letter-spacing: -0.005em;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;

  &:active {
    transform: translateY(1px);
  }
`;

export const btnPrimary = css`
  background: var(--ink-1);
  color: var(--cream-0);

  &:hover {
    background: #000;
  }
`;

export const btnCoral = css`
  background: var(--signal-yellow);
  color: var(--ink-1);
  box-shadow: 0 4px 0 0 var(--signal-yellow-deep), inset 0 1px 0 rgba(255, 255, 255, 0.4);

  &:hover {
    background: var(--signal-yellow-deep);
    color: var(--ink-1);
    box-shadow: 0 2px 0 0 var(--ink-1);
    transform: translateY(2px);
  }
`;

export const btnGhost = css`
  background: rgba(255, 255, 255, 0.5);
  color: var(--ink-1);
  border: 1px solid var(--glass-stroke);
  backdrop-filter: blur(20px);

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }
`;

// Chip / filter pill.
export const chip = css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: var(--r-pill);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--glass-stroke);
  backdrop-filter: blur(16px);
  color: var(--ink-2);
  cursor: pointer;
  letter-spacing: -0.005em;
  transition: all 0.12s;

  &:hover {
    background: rgba(255, 255, 255, 0.95);
  }
`;

// Text input.
export const inputBase = css`
  font-family: var(--font-ui);
  font-size: 15px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-md);
  padding: 12px 14px;
  color: var(--ink-1);
  outline: none;
  width: 100%;
  letter-spacing: -0.005em;
  transition: border 0.12s, background 0.12s;

  &:focus {
    border-color: var(--ink-1);
    background: #fff;
    box-shadow: 0 0 0 4px var(--signal-yellow-soft);
  }

  &::placeholder {
    color: var(--ink-4);
  }
`;
