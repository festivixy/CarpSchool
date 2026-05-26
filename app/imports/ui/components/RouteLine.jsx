import React from "react";
import PropTypes from "prop-types";

const overlayStyle = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
};

/**
 * Curved A->B route overlay drawn in container % coordinates (white halo +
 * animated dashed accent stroke).
 */
const RouteLine = ({ from, to, color }) => {
  const cx = (from.x + to.x) / 2 + 8;
  const cy = Math.min(from.y, to.y) - 12;
  const d = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={overlayStyle}>
      <path d={d} stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path
        d={d}
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="3 1.6"
        className="route-dash"
      />
    </svg>
  );
};

RouteLine.propTypes = {
  from: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
  to: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
  color: PropTypes.string,
};

RouteLine.defaultProps = {
  from: { x: 18, y: 70 },
  to: { x: 78, y: 28 },
  color: "var(--signal-yellow-deep)",
};

export default RouteLine;
