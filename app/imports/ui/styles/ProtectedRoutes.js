import styled from "styled-components";

export const RouteContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

export const AuthOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;
