import React from "react";
import PropTypes from "prop-types";
import { LogoWrap, Wordmark } from "../styles/Logo";

/*
 * The CarpSchool mark, drawn rather than loaded as an image so it stays sharp
 * at any size and can take the page's colours.
 *
 * The geometry is traced from the artwork in public/staticimages. A circle of
 * radius 13 sits at (15.67, 16) of the 32-unit box; the C is that circle with
 * a 80-degree aperture on the right. A vertical chord at x = 14.15 is the C's
 * stem and also the flat side of the faceted block, whose two facets run from
 * the left corners to the midpoint of that chord.
 *
 * `color` sets the line colour for mark and wordmark alike, so the one
 * component serves the pale page and the navy onboarding ground.
 */

const R = 13;

// Faceted block: top vertex, upper-left, lower-left, bottom vertex, closed
// back up the stem.
const BLOCK = "M14.15 3.05 L3.35 9.3 L3.35 22.7 L14.15 28.95 Z";
const FACETS = "M3.35 9.3 L14.15 16 L3.35 22.7";
// The C picks up at the block's top and bottom vertices, which sit on the
// circle, and breaks either side of 3 o'clock.
const ARC_TOP = `M14.15 3.05 A ${R} ${R} 0 0 1 25.63 7.65`;
const ARC_BOTTOM = `M25.63 24.35 A ${R} ${R} 0 0 1 14.15 28.95`;

/* The artwork's hairline is 0.66 units, which disappears at nav sizes, so the
 * stroke thickens once the mark is drawn smaller than about 46px. */
const strokeFor = size => Math.max(0.66, 30.4 / size).toFixed(2);

const Logo = ({
  size, color, mark, wordmark,
}) => (
  <LogoWrap>
    {mark && (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        stroke={color || "var(--brand-navy)"}
        strokeWidth={strokeFor(size)}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, display: "block" }}
        role="img"
        aria-label="CarpSchool"
      >
        <path d={BLOCK} fill="var(--brand-blue)" />
        <path d={FACETS} />
        <path d={ARC_TOP} />
        <path d={ARC_BOTTOM} />
      </svg>
    )}
    {wordmark && (
      <Wordmark $size={size} $color={color}>
        CarpSchool
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
