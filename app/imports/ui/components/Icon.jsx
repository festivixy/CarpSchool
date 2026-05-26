import React from "react";
import PropTypes from "prop-types";

/**
 * Minimal stroke-based icon set for the redesign. `name` selects a glyph;
 * unknown names fall back to the map pin.
 */
const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  home: (
    <>
      <path d="M3 12L12 3l9 9" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  car: (
    <>
      <path d="M5 17h14M3 17v-4l2-5h14l2 5v4M5 17v2h3v-2M16 17v2h3v-2" />
      <circle cx="7.5" cy="14.5" r="1.5" />
      <circle cx="16.5" cy="14.5" r="1.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" />
      <circle cx="12" cy="9" r="3" />
    </>
  ),
  arrow: <path d="M5 12h14M13 5l7 7-7 7" />,
  arrowDown: <path d="M12 5v14M5 12l7 7 7-7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M4 12l5 5L20 6" />,
  chevR: <path d="M9 6l6 6-6 6" />,
  chevL: <path d="M15 6l-6 6 6 6" />,
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </>
  ),
  seat: (
    <>
      <path d="M5 18h14M6 18l1-7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2l1 7" />
      <path d="M4 21h16" />
    </>
  ),
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  sparkle: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
    </>
  ),
  filter: <path d="M3 5h18M6 12h12M10 19h4" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  map: <path d="M9 3v15M15 6v15M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />,
  school: (
    <>
      <path d="M3 10l9-5 9 5-9 5-9-5z" />
      <path d="M7 12v5c0 1 2 3 5 3s5-2 5-3v-5" />
    </>
  ),
  edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />,
  dollar: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  star: <path d="M12 2l3 7 7 .8-5.3 4.7 1.6 7L12 17.7 5.7 21.5l1.6-7L2 9.8 9 9l3-7z" />,
  flame: <path d="M12 2c0 4-3 5-3 9a3 3 0 0 0 6 0c0-1-1-2-1-3 4 1 5 4 5 7a7 7 0 0 1-14 0c0-5 5-7 7-13z" />,
  leaf: (
    <>
      <path d="M3 21c0-9 7-16 18-18-2 11-9 18-18 18z" />
      <path d="M3 21c5-5 10-7 15-9" />
    </>
  ),
};

const Icon = ({ name, size, color, strokeWidth }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {PATHS[name] || PATHS.pin}
  </svg>
);

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string,
  strokeWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Icon.defaultProps = {
  size: 18,
  color: "currentColor",
  strokeWidth: 1.8,
};

export default Icon;
