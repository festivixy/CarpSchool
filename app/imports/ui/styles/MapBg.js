import styled from "styled-components";

/* Fills its (positioned) parent. The only child is an absolutely positioned
 * SVG, so a relative wrapper with no height of its own collapsed to zero and
 * the map pane rendered blank. Every caller already wraps this in a
 * position:relative box that has height. */
export const MapWrap = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--map-bg);

  > svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
`;
