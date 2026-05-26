import styled from "styled-components";

export const MapWrap = styled.div`
  position: relative;
  overflow: hidden;
  background: var(--map-bg);

  > svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
`;
