import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { eyebrow } from "../../styles/tokens";

// Styled Components for NavBar
export const NavBarContainer = styled.nav`
  background: var(--ink-1);
  color: var(--cream-0);
  position: sticky;
  top: 0;
  z-index: 1000;
  font-family: var(--font-ui);
`;

export const NavBarInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  max-width: 1200px;
  margin: 0 auto;
`;

export const Logo = styled(NavLink)`
  text-decoration: none;
  display: flex;
  align-items: center;
`;

export const LogoImg = styled.img`
  height: 40px;
  width: auto;
  border-radius: var(--r-sm);
`;

export const DesktopNav = styled.div`
  display: none;
  align-items: center;
  gap: 20px;
  flex: 1;
  margin-left: 40px;

  @media (min-width: 768px) {
    display: flex;
  }
`;

export const UserSection = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

export const Dropdown = styled.div`
  position: relative;
`;

export const DropdownTrigger = styled.button`
  background: none;
  border: none;
  color: var(--cream-0);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  transition: background 0.12s ease, color 0.12s ease;
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--accent-on-dark);
  }
`;

/* $open drives visibility. The menu previously had none, so it was always
 * rendered: the `open`/`onToggle` props the navbar passes land on a plain
 * div, where they do nothing. That is why the menu never closed. */
export const DropdownMenu = styled.div`
  display: ${props => (props.$open ? "block" : "none")};
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--cream-0);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-md);
  box-shadow: var(--glass-shadow);
  min-width: 190px;
  z-index: 1001;
  margin-top: 6px;
  overflow: hidden;

  &.right {
    left: auto;
    right: 0;
  }
`;

const dropdownItemStyles = `
  display: block;
  width: 100%;
  padding: 12px 16px;
  color: var(--ink-2);
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  border-bottom: 1px solid var(--glass-stroke);
  border-left: none;
  border-right: none;
  border-top: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
  font-family: inherit;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--signal-yellow-soft);
    color: var(--ink-1);
  }

  &.active {
    background: var(--signal-yellow-soft);
    color: var(--ink-1);
  }
`;

export const DropdownItem = styled(NavLink)`
  ${dropdownItemStyles}
`;

export const DropdownButton = styled.button`
  ${dropdownItemStyles}
`;

export const NavItem = styled.div`
  display: inline-block;
`;

export const NavButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "primary",
})`
  background: ${props => (props.primary ? "var(--signal-yellow)" : "none")};
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: ${props => (props.primary ? "var(--on-accent)" : "var(--cream-0)")};
  text-decoration: none;
  font-size: 13.5px;
  font-weight: ${props => (props.primary ? "600" : "500")};
  letter-spacing: -0.005em;
  padding: 8px 14px;
  border-radius: var(--r-pill);
  transition: background 0.12s ease, color 0.12s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => (props.primary ? "var(--signal-yellow-deep)" : "rgba(255, 255, 255, 0.1)")};
    color: ${props => (props.primary ? "var(--on-accent)" : "var(--accent-on-dark)")};
  }
`;

export const MenuToggle = styled.button`
  display: block;
  background: none;
  border: none;
  color: var(--cream-0);
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: var(--r-sm);
  transition: background 0.12s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileMenu = styled.div`
  background: var(--ink-1);
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileSection = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;

  &:last-child {
    border-bottom: none;
  }
`;

export const MobileSectionTitle = styled.div`
  ${eyebrow}
  color: rgba(246, 245, 240, 0.55);
  margin-bottom: 8px;
`;

export const MobileItem = styled(NavLink)`
  display: block;
  color: var(--cream-0);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.005em;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: color 0.12s ease, transform 0.12s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    color: var(--accent-on-dark);
    transform: translateX(8px);
  }

  &.active {
    color: var(--accent-on-dark);
  }
`;

export const MobileButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "primary",
})`
  background: ${props => (props.primary ? "var(--signal-yellow)" : "none")};
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  display: block;
  color: ${props => (props.primary ? "var(--on-accent)" : "var(--cream-0)")};
  text-decoration: none;
  font-size: 15px;
  font-weight: ${props => (props.primary ? "600" : "500")};
  letter-spacing: -0.005em;
  padding: ${props => (props.primary ? "12px 14px" : "12px 0")};
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.12s ease, color 0.12s ease, transform 0.12s ease;
  border-radius: ${props => (props.primary ? "var(--r-pill)" : "0")};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    color: ${props => (props.primary ? "var(--on-accent)" : "var(--accent-on-dark)")};
    transform: ${props => (props.primary ? "none" : "translateX(8px)")};
    background: ${props => (props.primary ? "var(--signal-yellow-deep)" : "transparent")};
  }
`;
