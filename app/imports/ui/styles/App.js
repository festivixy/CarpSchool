import styled from "styled-components";

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Ensure app takes at least full viewport height */
  /* Account for safe areas on mobile devices (only sides, not top) */
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  /* Ensure we don't exceed viewport bounds */
  box-sizing: border-box;
`;
