import React from "react";
import PropTypes from "prop-types";
import { SpacerContainer } from "../styles/Spacer";

/**
 * Spacer component for consistent spacing between elements
 * Provides clean visual separation with customizable height
 */
const Spacer = ({ height }) => <SpacerContainer height={height} />;

Spacer.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Spacer.defaultProps = {
  height: 72, // 72px default height as requested
};

export default Spacer;
