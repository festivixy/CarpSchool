import React from "react";
import PropTypes from "prop-types";
import { LogoWrap, Wordmark } from "../styles/Logo";

/**
 * carp.school wayfinding mark: a yellow rounded-square "C." badge + wordmark.
 */
const Logo = ({ size, color, mark, wordmark }) => (
  <LogoWrap>
    {mark && (
      <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="9"
          fill="var(--signal-yellow)"
          stroke="var(--ink-1)"
          strokeWidth="2"
        />
        <text
          x="9"
          y="23.5"
          fontFamily="Geist, sans-serif"
          fontSize="20"
          fontWeight="800"
          fill="var(--ink-1)"
        >
          C
        </text>
        <circle cx="24" cy="22" r="2" fill="var(--ink-1)" />
      </svg>
    )}
    {wordmark && (
      <Wordmark $size={size} $color={color}>
        carp.school
      </Wordmark>
    )}
  </LogoWrap>
);

Logo.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  mark: PropTypes.bool,
  wordmark: PropTypes.bool,
};

Logo.defaultProps = {
  size: 28,
  color: undefined,
  mark: true,
  wordmark: true,
};

export default Logo;
