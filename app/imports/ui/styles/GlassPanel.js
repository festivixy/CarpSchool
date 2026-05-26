import styled from "styled-components";
import { glass, glassStrong } from "./tokens";

export const Panel = styled.div`
  ${props => (props.$strong ? glassStrong : glass)}
  border-radius: var(--r-lg);
`;
