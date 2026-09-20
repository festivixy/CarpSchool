import styled, { css } from "styled-components";
import { glassStrong } from "./tokens";

export const Bar = styled.nav`
  position: fixed;
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

export const Brand = styled.button`
  display: flex;
  align-items: center;
  padding: 4px 12px 4px 8px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-family: var(--font-ui);
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
  overflow-x: auto;
`;

export const NavItem = styled.button`
  border: 0;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--r-pill);
  font-family: var(--font-ui);
  font-size: 13.5px;
  white-space: nowrap;
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

/* The bar is position:absolute per the design (it is meant to float over a
 * full-bleed map). On pages without a map underneath it would overlap the
 * page heading, so callers render this spacer to reserve its height. */
export const NavSpacer = styled.div`
  height: var(--nav-h);
  flex-shrink: 0;
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
  color: var(--on-accent);
`;

/* User menu hung off the avatar. TopNav shipped with a decorative avatar and
 * no menu, which left signed-in desktop users unable to reach their profile,
 * places, ride history, admin or sign-out. */
export const UserWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const AvatarBtn = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  border-radius: 50%;

  &:focus-visible {
    outline: 2px solid var(--ink-1);
    outline-offset: 2px;
  }
`;

export const UserMenu = styled.div`
  ${glassStrong}
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 196px;
  border-radius: var(--r-md);
  overflow: hidden;
  z-index: 40;
`;

export const UserMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  padding: 11px 14px;
  font-family: var(--font-ui);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: ${props => (props.$danger ? "var(--danger)" : "var(--ink-2)")};

  &:not(:last-child) {
    border-bottom: 1px solid var(--glass-stroke);
  }

  &:hover {
    background: ${props => (props.$danger ? "var(--danger-soft)" : "var(--signal-yellow-soft)")};
    color: ${props => (props.$danger ? "var(--danger-deep)" : "var(--ink-1)")};
  }
`;
