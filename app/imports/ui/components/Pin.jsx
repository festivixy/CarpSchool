import React from "react";
import PropTypes from "prop-types";
import { PinWrap, Dot, LabelBubble, Tail } from "../styles/Pin";

/**
 * Map marker positioned in container % coordinates. `dot` is a simple
 * point; `label` is a pill bubble with a tail (e.g. a departure time).
 */
const Pin = ({ x, y, color, label, type, size }) => {
  if (type === "dot") {
    return (
      <PinWrap $x={x} $y={y} $dot>
        <Dot $size={size} $color={color} />
      </PinWrap>
    );
  }
  return (
    <PinWrap $x={x} $y={y}>
      <LabelBubble $color={color}>{label}</LabelBubble>
      <Tail />
    </PinWrap>
  );
};

Pin.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  color: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.oneOf(["dot", "label"]),
  size: PropTypes.number,
};

Pin.defaultProps = {
  color: "var(--signal-yellow)",
  label: "",
  type: "dot",
  size: 14,
};

export default Pin;
