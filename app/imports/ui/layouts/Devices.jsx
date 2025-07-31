import React, { useState, useEffect } from "react";
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

// Hook for JavaScript-based detection (fallback)
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

/**
 * MobileOnly - Renders children only on mobile devices (screen width < 768px)
 * Uses CSS media queries for optimal performance
 */
const MobileOnly = ({ children, fallbackToJS = false }) => {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  
  // Use JavaScript detection if fallback is enabled
  if (fallbackToJS) {
    return isMobile ? children : null;
  }
  
  // Use CSS-only solution for better performance
  return <MobileOnlyWrapper>{children}</MobileOnlyWrapper>;
};

/**
 * DesktopOnly - Renders children only on desktop devices (screen width >= 768px)
 * Uses CSS media queries for optimal performance
 */
const DesktopOnly = ({ children, fallbackToJS = false }) => {
  const isDesktop = useMediaQuery(`(min-width: ${MOBILE_BREAKPOINT}px)`);
  
  // Use JavaScript detection if fallback is enabled
  if (fallbackToJS) {
    return isDesktop ? children : null;
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

export { MobileOnly, DesktopOnly, useMediaQuery, MOBILE_BREAKPOINT };
