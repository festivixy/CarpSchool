import styled from "styled-components";

export const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  z-index: 1000;
  transition: all 0.3s ease;
  backdrop-filter: blur(${(props) => (props.isScrolled ? "15px" : "10px")});
  transform: translateY(0);
  overflow: visible;

  ${(props) =>
    props.isScrolled &&
    `
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  `}
`;

export const NavbarBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0;
`;

export const BlurLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  /* Chromatic aberration color-bending effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: hue-rotate(5deg) saturate(1.1);
    mix-blend-mode: color-dodge;
    opacity: 0.2;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: hue-rotate(-5deg) saturate(1.15) contrast(1.02);
    mix-blend-mode: soft-light;
    opacity: 0.15;
    pointer-events: none;
  }
`;

export const GlassLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.02) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  box-shadow:
    /* RGB channel shifts for chromatic aberration */
    inset 2px 0 4px rgba(255, 0, 0, 0.04),
    inset -1px 0 4px rgba(0, 255, 255, 0.04),
    inset 0 2px 4px rgba(0, 255, 0, 0.03),
    inset 0 -1px 4px rgba(255, 0, 255, 0.03),
    inset 1px 1px 4px rgba(0, 0, 255, 0.04),
    inset -2px -2px 4px rgba(255, 255, 0, 0.04),
    /* Subtle refraction highlights */ inset 0 0.5px 1px
      rgba(255, 255, 255, 0.06),
    inset 0 -0.5px 0.5px rgba(0, 0, 0, 0.01);
  filter: contrast(1.05) brightness(1.01);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: hue-rotate(3deg) saturate(1.05);
    mix-blend-mode: color-dodge;
    opacity: 0.15;
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: hue-rotate(-3deg) saturate(1.1) contrast(1.01);
    mix-blend-mode: soft-light;
    opacity: 0.1;
    pointer-events: none;
    z-index: 1;
  }
`;

export const NavbarContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

export const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px 12px;
  border-radius: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const LogoImage = styled.img`
  height: 36px;
  width: auto;
  border-radius: 8px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

export const LogoText = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);

  @media (max-width: 768px) {
    display: none;
  }
`;

export const NavSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const NavList = styled.ul`
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const NavItem = styled.li`
  position: relative;
  margin: 0;
`;

export const NavLink = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.isActive ? "rgba(255, 255, 255, 0.15)" : "transparent"};
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  white-space: nowrap;

  .nav-icon {
    font-size: 16px;
    line-height: 1;
  }

  .dropdown-arrow {
    margin-left: 4px;
    font-size: 12px;
    transition: transform 0.2s ease;
    transform: ${(props) =>
      props.isActive ? "rotate(180deg)" : "rotate(0deg)"};
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;

  .desktop-user-menu {
    display: flex;
    align-items: center;
    gap: 8px;

    @media (max-width: 768px) {
      display: none;
    }
  }
`;

export const UserAvatar = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    font-weight: 600;
    color: #333;
    font-size: 14px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const UserName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);

  @media (max-width: 880px) {
    display: none;
  }
`;

export const MobileMenuButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  span {
    display: block;
    width: 18px;
    height: 2px;
    background: #333;
    margin: 2px 0;
    transition: all 0.3s ease;
    border-radius: 1px;

    ${(props) =>
      props.isOpen &&
      `
      &:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }
      &:nth-child(2) {
        opacity: 0;
      }
      &:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
      }
    `}
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

export const MobileMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  transform: translateY(${(props) => (props.isOpen ? "0" : "-100%")});
  opacity: ${(props) => (props.isOpen ? "1" : "0")};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  transition: all 0.3s ease;
  max-height: 70vh;
  overflow-y: auto;
  z-index: 999;

  @media (min-width: 769px) {
    display: none;
  }
`;

export const MobileNavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .nav-icon {
    font-size: 18px;
    line-height: 1;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:active {
    background: rgba(255, 255, 255, 0.3);
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  ${(props) => (props.align === "right" ? "right: 0;" : "left: 0;")}
  min-width: 200px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transform: translateY(${(props) => (props.isOpen ? "0" : "-10px")});
  opacity: ${(props) => (props.isOpen ? "1" : "0")};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  transition: all 0.2s ease;
  z-index: 1000;
  overflow: hidden;
`;

export const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:active {
    background: rgba(255, 255, 255, 0.4);
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

export const Badge = styled.span`
  position: absolute;
  top: -6px;
  right: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  animation: pulse 2s infinite;
  z-index: 10;

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
`;
