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

// Selected filter chip — inverts to ink.
export const chipActive = css`
  background: var(--ink-1);
  color: var(--cream-0);
  border-color: var(--ink-1);
`;

// Soft yellow chip, for callouts rather than selection.
export const chipCoral = css`
  background: var(--signal-yellow-soft);
  color: var(--ink-1);
  border-color: var(--signal-yellow-deep);
`;

// Circular icon button. Compose after btnBase.
export const btnIcon = css`
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
`;

// Hairline divider.
export const hr = css`
  height: 1px;
  background: var(--glass-stroke);
  border: 0;
`;

// Scroll container with the scrollbar hidden.
export const scrollY = css`
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

// Long-form document typography. Applied to containers whose children are
// generated (e.g. ReactMarkdown output), so the elements cannot be styled
// individually.
export const prose = css`
  color: var(--ink-2);
  font-size: 15.5px;
  line-height: 1.6;
  letter-spacing: -0.005em;

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-display);
    color: var(--ink-1);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin: 1.6em 0 0.5em;
  }

  h1 {
    font-size: 32px;
    margin-top: 0;
  }

  h2 {
    font-size: 23px;
    padding-bottom: 0.3em;
    border-bottom: 1px solid var(--cream-3);
  }

  h3 {
    font-size: 17px;
  }

  h4 {
    ${eyebrow}
  }

  p {
    margin: 0 0 1em;
  }

  ul,
  ol {
    margin: 0 0 1em;
    padding-left: 1.35em;
  }

  li {
    margin-bottom: 0.4em;
  }

  li::marker {
    color: var(--ink-4);
  }

  strong {
    font-weight: 600;
    color: var(--ink-1);
  }

  em {
    color: var(--ink-3);
  }

  a {
    color: var(--ink-1);
    text-decoration: underline;
    text-decoration-color: var(--signal-yellow-deep);
    text-decoration-thickness: 2px;
    text-underline-offset: 2px;

    &:hover {
      background: var(--signal-yellow-soft);
    }
  }

  hr {
    border: 0;
    border-top: 1px solid var(--cream-3);
    margin: 2em 0;
  }

  blockquote {
    margin: 0 0 1em;
    padding: 2px 0 2px 14px;
    border-left: 3px solid var(--signal-yellow);
    color: var(--ink-3);
  }

  code {
    font-family: var(--font-mono);
    font-size: 0.88em;
    background: var(--cream-2);
    border-radius: var(--r-sm);
    padding: 0.15em 0.35em;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 1em;
    font-size: 14px;
  }

  th,
  td {
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid var(--cream-3);
  }

  th {
    ${eyebrow}
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
