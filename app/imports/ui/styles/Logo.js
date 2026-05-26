import styled from "styled-components";

export const LogoWrap = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 9px;
`;

export const Wordmark = styled.span`
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
  color: ${props => props.$color || "var(--ink-1)"};
  font-size: ${props => props.$size * 0.76}px;
`;
