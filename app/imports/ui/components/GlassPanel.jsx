import React from "react";
import PropTypes from "prop-types";
import { Panel } from "../styles/GlassPanel";

/**
 * Frosted floating panel used over maps / imagery. `strong` is the
 * higher-opacity variant for denser content (search bars, request modals).
 */
const GlassPanel = ({ strong, children, className }) => (
  <Panel $strong={strong} className={className}>
    {children}
  </Panel>
);

GlassPanel.propTypes = {
  strong: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

GlassPanel.defaultProps = {
  strong: false,
  children: null,
  className: undefined,
};

export default GlassPanel;
