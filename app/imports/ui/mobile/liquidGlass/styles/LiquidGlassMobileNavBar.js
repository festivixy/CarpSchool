import styled from "styled-components";

export const NavBarContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* Fixed to bottom of viewport */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  /* Ensure navbar stays above bottom safe area (home indicator) */
  padding-bottom: max(env(safe-area-inset-bottom), 8px);

  /* Hide navbar when chat overlay is open */
  .chat-overlay-open & {
    display: none;
  }
`;

export const TabBarInner = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.1);
  width: 100%;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.08) 100%
    );
    pointer-events: none;
  }
`;

export const TabsContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  overflow: hidden;
  justify-content: space-around;
  position: relative;
  z-index: 1;
`;

export const TabBarItem = styled.div`
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  width: 76px;
  margin: auto 0;
  padding: 12px 8px 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  position: relative;
  background: rgba(255, 255, 255, 0.9);

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    background: rgba(255, 255, 255, 0.7);
  }
`;

export const TabWithBadge = styled.div`
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  color: rgba(255, 255, 255, 1);
  white-space: nowrap;
  text-align: center;
  margin: auto 0;
  padding: 12px 8px 8px;
  font: 600 10px/1.2 Inter, -apple-system, Roboto, Helvetica, sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  position: relative;
  background: rgba(255, 255, 255, 0.9);

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    background: rgba(255, 255, 255, 0.7);
  }
`;

export const NotificationBadge = styled.div`
  border-radius: 10px;
  background-color: rgba(254, 44, 85, 1);
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  justify-content: center;
  padding: 2px 6px;
  border: 2px solid rgba(255, 255, 255, 1);
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(254, 44, 85, 0.3);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export const BadgeText = styled.div`
  align-self: stretch;
  margin: auto 0;
  font-weight: 600;
  font-size: 10px;
  line-height: 1.2;
`;

export const TabLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: #666;
  text-align: center;
  margin-top: 2px;
  opacity: 0.8;
  transition: all 0.2s ease;

  ${TabBarItem}:hover &,
  ${TabWithBadge}:hover & {
    color: #333;
    opacity: 1;
  }
`;

// Dropdown styles for upward-opening menus
export const DropdownContainer = styled.div`
  position: fixed;
  bottom: calc(70px + max(env(safe-area-inset-bottom), 8px) + 10px);
  right: 10px;
  z-index: 1001;
  max-width: 300px;
`;

export const DropdownMenu = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.25);
  min-width: 180px;
  overflow: hidden;
  transform: translateY(${(props) => (props.$isOpen ? "0" : "10px")});
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transition: all 0.2s ease;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    bottom: -10px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid rgba(255, 255, 255, 0.9);
    z-index: 1002;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -12px;
    right: 18px;
    width: 0;
    height: 0;
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-top: 12px solid rgba(0, 0, 0, 0.1);
    z-index: 1001;
  }
`;

export const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.9);

  &:hover {
    background: rgba(0, 123, 255, 0.8);
    color: #0056b3;
  }

  &:active {
    background: rgba(0, 123, 255, 0.7);
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }

  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;
