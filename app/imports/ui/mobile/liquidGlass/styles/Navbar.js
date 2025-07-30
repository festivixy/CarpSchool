import styled from "styled-components";

export const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  z-index: 1000;
  transition: all 0.3s ease;
  backdrop-filter: blur(${(props) => (props.$isScrolled ? "8px" : "5px")});
  transform: translateY(0);
  overflow: visible;

  ${(props) => props.$isScrolled &&
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
  background: rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  will-change: transform;
  transform: translateZ(0);

  /* Single subtle glass effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 50%,
      rgba(255, 255, 255, 0.04) 100%
    );
    mix-blend-mode: overlay;
    opacity: 0.3;
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
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.02) 50%,
    rgba(255, 255, 255, 0.04) 100%
  );

  /* Simplified glass effect without expensive backdrop-filters */
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(0, 0, 0, 0.02);
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
  backdrop-filter: blur(5px);
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

    ${(props) => props.$isOpen &&
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
  transform: translateY(${(props) => (props.$isOpen ? "0" : "-100%")});
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transition: all 0.3s ease;
  max-height: 70vh;
  overflow-y: auto;
  z-index: 999;

  @media (min-width: 769px) {
    display: none;
  }
`;
