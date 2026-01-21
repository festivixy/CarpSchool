import styled from "styled-components";
import { NavLink } from "react-router-dom";

// Styled Components for NavBar
export const NavBarContainer = styled.nav`
  background-color: rgba(0, 0, 0, 1);
  color: white;
  position: sticky;
  top: 0;
  z-index: 1000;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
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
  border-radius: 8px;
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
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1001;
  margin-top: 4px;

  &.right {
    left: auto;
    right: 0;
  }
`;

const dropdownItemStyles = `
  display: block;
  width: 100%;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid #f0f0f0;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8f9fa;
    color: #024731;
  }

  &.active {
    background-color: rgba(255, 255, 255, 0.15);
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
  shouldForwardProp: (prop) => prop !== 'primary',
})`
  background: ${props => props.primary ? '#007bff' : 'none'};
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${props => props.primary ? '#0056b3' : 'rgba(255, 255, 255, 0.1)'};
    color: white;
  }
`;

export const MenuToggle = styled.button`
  display: block;
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileMenu = styled.div`
  background-color: rgba(0, 0, 0, 1);
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
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

export const MobileItem = styled(NavLink)`
  display: block;
  color: white;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    padding-left: 8px;
  }

  &.active {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

export const MobileButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'primary',
})`
  background: ${props => props.primary ? '#007bff' : 'none'};
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  display: block;
  color: white;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  border-radius: ${props => props.primary ? '6px' : '0'};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    padding-left: 8px;
    background-color: ${props => props.primary ? '#0056b3' : 'transparent'};
  }
`;
