import styled, { css } from "styled-components";
import { glassStrong } from "./tokens";

export const Bar = styled.nav`
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: var(--r-pill);
  width: min(94%, 1140px);
  ${props => (props.$glass
    ? glassStrong
    : css`
        background: var(--cream-1);
      `)}
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 12px 4px 8px;
`;

export const Divider = styled.span`
  width: 1px;
  height: 22px;
  margin: 0 8px;
  background: var(--glass-stroke);
`;

export const NavItems = styled.div`
  display: flex;
  flex: 1;
  gap: 2px;
`;

export const NavItem = styled.button`
  border: 0;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--r-pill);
  font-family: var(--font-ui);
  font-size: 13.5px;
  background: ${props => (props.$active ? "var(--ink-1)" : "transparent")};
  color: ${props => (props.$active ? "var(--cream-0)" : "var(--ink-1)")};
  font-weight: ${props => (props.$active ? 600 : 500)};
`;

export const IconBtn = styled.button`
  display: inline-flex;
  background: transparent;
  border: 0;
  padding: 9px;
  border-radius: var(--r-pill);
  color: var(--ink-2);
  cursor: pointer;
`;

export const OfferBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--r-pill);
  font-weight: 600;
  font-size: 13.5px;
  background: var(--signal-yellow);
  color: var(--ink-1);
`;
