import styled from "styled-components";

export const PinWrap = styled.div`
  position: absolute;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  transform: translate(-50%, ${props => (props.$dot ? "-50%" : "-100%")});
`;

export const Dot = styled.div`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  background: ${props => props.$color};
  border: 2.5px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
`;

export const LabelBubble = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 7px;
  border-radius: var(--r-pill);
  background: ${props => props.$color};
  border: 3px solid #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  color: #fff;
  font-weight: 700;
  font-size: 11px;
  font-family: var(--font-mono);
`;

export const Tail = styled.div`
  width: 0;
  height: 0;
  margin: -2px auto 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #fff;
`;
