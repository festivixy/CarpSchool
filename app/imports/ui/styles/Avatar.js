import styled from "styled-components";

export const AvatarCircle = styled.div`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: var(--font-ui);
  font-weight: 700;
  font-size: ${props => props.$size * 0.38}px;
  background: oklch(0.82 0.1 ${props => props.$hue});
  color: oklch(0.32 0.13 ${props => props.$hue});
  box-shadow: ${props => (props.$ring
    ? `0 0 0 2.5px ${props.$ring}`
    : "inset 0 0 0 1px rgba(60, 40, 20, 0.08)")};
`;

export const StackWrap = styled.div`
  display: flex;
  align-items: center;
`;

export const StackItem = styled.div`
  margin-left: ${props => (props.$first ? 0 : props.$size * -0.32)}px;
`;

export const StackMore = styled.div`
  margin-left: ${props => props.$size * -0.32}px;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream-2);
  color: var(--ink-2);
  font-weight: 600;
  font-size: ${props => props.$size * 0.38}px;
  box-shadow: 0 0 0 2.5px var(--cream-0);
`;
