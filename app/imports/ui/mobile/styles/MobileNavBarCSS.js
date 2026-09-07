import styled from "styled-components";
import { glassStrong, eyebrow } from "../../styles/tokens";

export const NavBarContainer = styled.div`
  ${glassStrong}
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  border-radius: var(--r-xl);
  z-index: 1000;
  font-family: var(--font-ui);

  /* Hide navbar when chat overlay is open */
  .chat-overlay-open & {
    display: none;
  }
`;

export const TabBarInner = styled.div`
  width: 100%;
  position: relative;
`;

export const TabsContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: stretch;
  justify-content: space-around;
  padding: 6px;
  gap: 2px;
`;

const tabBase = `
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 3px;
  padding: 8px 4px 7px;
  border: 0;
  cursor: pointer;
  border-radius: var(--r-lg);
  position: relative;
  background: transparent;
  font: inherit;
  color: inherit;
  text-decoration: none;
  transition: background 0.12s ease, color 0.12s ease;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: translateY(1px);
  }
`;

export const TabBarItem = styled.div`
  ${tabBase}
  color: ${(props) => (props.$active ? "var(--ink-1)" : "var(--ink-3)")};
  background: ${(props) => (props.$active ? "var(--signal-yellow-soft)" : "transparent")};

  &:hover {
    background: ${(props) => (props.$active ? "var(--signal-yellow-soft)" : "rgba(255, 255, 255, 0.55)")};
    color: var(--ink-1);
  }
`;

export const TabWithBadge = styled.button`
  ${tabBase}
  color: ${(props) => (props.$active ? "var(--ink-1)" : "var(--ink-3)")};
  background: ${(props) => (props.$active ? "var(--signal-yellow-soft)" : "transparent")};

  &:hover {
    background: ${(props) => (props.$active ? "var(--signal-yellow-soft)" : "rgba(255, 255, 255, 0.55)")};
    color: var(--ink-1);
  }
`;

/* The "Join" tab is the one primary action in the bar. */
export const TabPrimary = styled.div`
  ${tabBase}
  background: var(--signal-yellow);
  color: var(--ink-1);
  box-shadow: 0 3px 0 0 var(--signal-yellow-deep);

  &:hover {
    background: var(--signal-yellow-deep);
  }

  &:active {
    box-shadow: 0 1px 0 0 var(--signal-yellow-deep);
  }
`;

export const NotificationBadge = styled.div`
  border-radius: var(--r-pill);
  background: var(--ink-1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  padding: 1px 5px;
  border: 2px solid var(--cream-0);
  position: absolute;
  top: 4px;
  right: 50%;
  margin-right: -20px;
  z-index: 10;
`;

export const BadgeText = styled.div`
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 9.5px;
  line-height: 1.2;
  color: var(--signal-yellow);
`;

export const TabLabel = styled.span`
  ${eyebrow}
  font-size: 9px;
  letter-spacing: 0.1em;
  color: currentColor;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Dropdown styles for upward-opening menus
export const DropdownContainer = styled.div`
  position: fixed;
  bottom: calc(84px + env(safe-area-inset-bottom, 0px));
  right: 12px;
  z-index: 1001;
  max-width: 300px;
`;

export const DropdownMenu = styled.div`
  ${glassStrong}
  border-radius: var(--r-lg);
  min-width: 190px;
  overflow: hidden;
  transform: translateY(${(props) => (props.$isOpen ? "0" : "8px")});
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transition: transform 0.16s ease, opacity 0.16s ease;
`;

export const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 13px 16px;
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--ink-2);
  cursor: pointer;
  text-decoration: none;
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: var(--signal-yellow-soft);
    color: var(--ink-1);
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--glass-stroke);
  }
`;

export const RelativeContainer = styled.div`
  position: relative;
`;
