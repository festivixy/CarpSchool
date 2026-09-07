import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

/**
 * Small error boundary wrapped around a single routed screen's content.
 * Keeps the nav/chrome alive when a page crashes; the top-level ErrorBoundary
 * in the render tree remains the last resort for errors outside a route.
 */
class RouteBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("RouteBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <p style={{ color: "var(--ink-1)" }}>This screen hit an error.</p>
          <Link to="/my-rides">Return to My Rides</Link>
        </div>
      );
    }

    return this.props.children;
  }
}

RouteBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RouteBoundary;
