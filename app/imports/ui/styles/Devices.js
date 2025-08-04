import styled from "styled-components";

// Mobile breakpoint - matches common mobile device widths
export const MOBILE_BREAKPOINT = 768;

// Styled components for CSS-only solution (more performant)
export const MobileOnlyWrapper = styled.div`
  display: block;

  @media (min-width: ${MOBILE_BREAKPOINT}px) {
    display: none;
  }
`;

export const DesktopOnlyWrapper = styled.div`
  display: none;

  @media (min-width: ${MOBILE_BREAKPOINT}px) {
    display: block;
  }
`;
