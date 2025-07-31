import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

// Mobile breakpoint - matches common mobile device widths
const MOBILE_BREAKPOINT = 768;

// Styled components for CSS-only solution (more performant)
const MobileOnlyWrapper = styled.div`
  display: block;

  @media (min-width: ${MOBILE_BREAKPOINT}px) {
    display: none;
  }
`;

const DesktopOnlyWrapper = styled.div`
  display: none;

  @media (min-width: ${MOBILE_BREAKPOINT}px) {
    display: block;
  }
`;

// User agent detection for JavaScript fallback
const isMobileUserAgent = () => {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry',
    'windows phone', 'mobile', 'opera mini', 'iemobile'
  ];

  return mobileKeywords.some(keyword => userAgent.includes(keyword));
};

/**
 * MobileOnly - Renders children only on mobile devices (screen width < 768px)
 * Uses CSS media queries for optimal performance
 */
const MobileOnly = ({ children, fallbackToJS = false }) => {
  // Use user agent detection if fallback is enabled
  if (fallbackToJS) {
    return isMobileUserAgent() ? children : null;
  }

  // Use CSS-only solution for better performance
  return <MobileOnlyWrapper>{children}</MobileOnlyWrapper>;
};

/**
 * DesktopOnly - Renders children only on desktop devices (screen width >= 768px)
 * Uses CSS media queries for optimal performance
 */
const DesktopOnly = ({ children, fallbackToJS = false }) => {
  // Use user agent detection if fallback is enabled
  if (fallbackToJS) {
    return !isMobileUserAgent() ? children : null;
  }

  // Use CSS-only solution for better performance
  return <DesktopOnlyWrapper>{children}</DesktopOnlyWrapper>;
};

// PropTypes
MobileOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackToJS: PropTypes.bool,
};

DesktopOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackToJS: PropTypes.bool,
};

export { MobileOnly, DesktopOnly, isMobileUserAgent, MOBILE_BREAKPOINT };
