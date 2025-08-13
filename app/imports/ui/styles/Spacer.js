import styled from "styled-components";

export const SpacerContainer = styled.div`
  height: ${(props) => 
    typeof props.height === "number" ? `${props.height}px` : props.height};
  width: 100%;
  flex-shrink: 0;
`;
