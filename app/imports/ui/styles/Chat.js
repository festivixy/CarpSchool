import styled, { keyframes, css } from "styled-components";
import { btnBase, btnPrimary, btnCoral, eyebrow, inputBase } from "./tokens";

/* Keep styled-only props off the DOM. */
const block = (...names) => ({
  shouldForwardProp: (prop) => !names.includes(prop),
});

// Animations
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const modalSlideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.96) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

// Styled Components for Chat
export const Container = styled.div`
  background: var(--cream-0);
  height: 100%;
  font-family: var(--font-ui);
  color: var(--ink-1);
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  background: var(--cream-0);
  padding: 20px;
  border-bottom: 1px solid var(--glass-stroke);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.h1`
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink-1);
  margin: 0;
`;

export const HeaderButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const CreateButton = styled.button`
  ${btnBase}
  ${btnCoral}
  padding: 9px 16px;
  font-size: 13px;
`;

export const JoinButton = styled.button`
  ${btnBase}
  ${btnPrimary}
  padding: 9px 16px;
  font-size: 13px;
`;

export const ErrorMessage = styled.div`
  background: var(--danger-soft);
  color: var(--danger-deep);
  padding: 12px 20px;
  font-size: 13.5px;
  border-left: 3px solid var(--danger);
`;

export const SuccessMessage = styled.div`
  background: var(--leaf-soft);
  color: var(--leaf);
  padding: 12px 20px;
  font-size: 13.5px;
  border-left: 3px solid var(--leaf);
`;

export const Content = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const Sidebar = styled.div`
  width: 300px;
  background: var(--cream-1);
  border-right: 1px solid var(--glass-stroke);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

export const SidebarHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-stroke);

  h3 {
    ${eyebrow}
    margin: 0;
  }
`;

export const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const ChatListItem = styled.div.withConfig(block("active"))`
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--glass-stroke);
  transition: background 0.12s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => (props.active ? "var(--signal-yellow-soft)" : "transparent")};
  border-right: ${props => (props.active ? "3px solid var(--signal-yellow)" : "none")};

  &:hover {
    background: ${props => (props.active ? "var(--signal-yellow-soft)" : "var(--cream-2)")};
  }
`;

export const ChatListItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ChatListItemName = styled.div`
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink-1);
  margin-bottom: 3px;
`;

export const ChatListItemLast = styled.div`
  font-size: 12px;
  color: var(--ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
`;

export const ChatListItemCount = styled.div`
  background: var(--ink-1);
  color: var(--accent-on-dark);
  border-radius: var(--r-pill);
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
`;

export const ChatListEmpty = styled.div`
  padding: 40px 20px;
  text-align: center;

  p {
    color: var(--ink-3);
    font-size: 14px;
    margin-bottom: 16px;
  }
`;

export const EmptyButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

export const CreateFirstButton = styled.button`
  ${btnBase}
  ${btnCoral}
  width: 150px;
  font-size: 13px;
`;

export const JoinFirstButton = styled.button`
  ${btnBase}
  ${btnPrimary}
  width: 150px;
  font-size: 13px;
`;

export const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const ConversationHeader = styled.div`
  background: var(--cream-0);
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-stroke);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ConversationInfo = styled.div``;

export const ConversationName = styled.h3`
  font-family: var(--font-display);
  margin: 0 0 3px 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--ink-1);
`;

export const ConversationParticipants = styled.p`
  ${eyebrow}
  margin: 0;
`;

export const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--cream-1);
`;

export const DateSeparator = styled.div`
  text-align: center;
  margin: 18px 0;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--cream-3);
    z-index: 1;
  }

  &::after {
    content: attr(data-date);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-4);
    background: var(--cream-1);
    padding: 0 12px;
    position: relative;
    z-index: 2;
  }
`;

export const Message = styled.div.withConfig(block("own", "system"))`
  margin-bottom: 12px;
  max-width: 70%;
  margin-left: ${props => (props.own ? "auto" : "0")};
  text-align: ${props => (props.own ? "right" : "left")};

  ${props => props.system && css`
    margin: 10px auto;
    text-align: center;
    max-width: 80%;
  `}
`;

export const MessageSender = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-4);
  margin-bottom: 3px;
`;

export const MessageContent = styled.div.withConfig(block("own", "system"))`
  display: inline-block;
  text-align: left;
  background: var(--cream-0);
  border: 1px solid var(--glass-stroke);
  color: var(--ink-1);
  padding: 10px 13px;
  border-radius: var(--r-lg);
  font-size: 14px;
  line-height: 1.45;
  letter-spacing: -0.005em;
  word-wrap: break-word;

  ${props => props.own && css`
    background: var(--ink-1);
    border-color: var(--ink-1);
    color: var(--cream-0);
  `}

  ${props => props.system && css`
    background: var(--cream-2);
    border-color: transparent;
    color: var(--ink-3);
    font-family: var(--font-mono);
    font-size: 11.5px;
    text-align: center;
  `}
`;

export const MessageTime = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-4);
  margin-top: 4px;
`;

export const InputForm = styled.form`
  background: var(--cream-0);
  padding: 14px 20px;
  border-top: 1px solid var(--glass-stroke);
  display: flex;
  gap: 10px;
`;

export const Input = styled.input`
  ${inputBase}
  flex: 1;
  border-radius: var(--r-pill);
  padding: 11px 16px;
  font-size: 14px;
`;

export const SendButton = styled.button`
  ${btnBase}
  ${btnCoral}
  padding: 10px 20px;
  font-size: 13px;

  &:disabled {
    background: var(--cream-2);
    color: var(--ink-4);
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
`;

export const NoSelection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream-1);
`;

export const NoSelectionContent = styled.div`
  text-align: center;

  h3 {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.015em;
    margin: 0 0 8px 0;
    color: var(--ink-1);
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--ink-3);
  }
`;

export const NoSelectionIcon = styled.div`
  font-size: 44px;
  margin-bottom: 14px;
  opacity: 0.35;
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;

  p {
    font-size: 15px;
    color: var(--ink-3);
    margin: 0;
  }
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--cream-2);
  /* impeccable-disable-next-line border-accent-on-rounded: spinner, not a card accent */
  border-top: 3px solid var(--signal-yellow);
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
  margin-bottom: 16px;
`;

// Modal Components
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(12, 12, 10, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
`;

export const Modal = styled.div`
  background: var(--cream-0);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-xl);
  box-shadow: var(--glass-shadow);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  font-family: var(--font-ui);
  color: var(--ink-1);
  animation: ${modalSlideIn} 0.25s cubic-bezier(0.2, 0.7, 0.3, 1);
`;

export const ModalHeader = styled.div`
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid var(--glass-stroke);
  position: relative;
  text-align: center;
`;

export const ModalClose = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  font-size: 18px;
  color: var(--ink-3);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: var(--cream-2);
    color: var(--ink-1);
  }
`;

export const ModalTitle = styled.h2`
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 700;
  color: var(--ink-1);
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
`;

export const ModalSubtitle = styled.div`
  font-size: 13.5px;
  color: var(--ink-3);
  margin: 0;
  line-height: 1.45;
`;

export const ModalContent = styled.div`
  padding: 20px;
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 7px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.005em;
    color: var(--ink-1);
  }

  input {
    ${inputBase}
    box-sizing: border-box;
  }
`;

export const FormHint = styled.p`
  font-size: 12px;
  color: var(--ink-4);
  margin-top: 8px;
  line-height: 1.45;
`;

// Mobile-specific components
export const ChatOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--cream-0);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  font-family: var(--font-ui);
  color: var(--ink-1);
`;

export const OverlayHeader = styled.div`
  background: var(--cream-0);
  padding: 14px 20px;
  border-bottom: 1px solid var(--glass-stroke);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const overlayIconButton = `
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: var(--cream-2);
    color: var(--ink-1);
  }
`;

export const OverlayBackButton = styled.button`
  ${overlayIconButton}
  font-size: 20px;
  color: var(--ink-1);
`;

export const OverlayTitle = styled.h2`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--ink-1);
  text-align: center;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const OverlayCloseButton = styled.button`
  ${overlayIconButton}
  font-size: 18px;
  color: var(--ink-3);
`;

export const MobileChatList = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--cream-0);
`;

export const MobileChatListItem = styled.div`
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--glass-stroke);
  transition: background 0.12s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: var(--cream-1);
  }

  &:active {
    background: var(--cream-2);
  }
`;

export const EmptyStateSubtext = styled.p`
  font-size: 13.5px;
  color: var(--ink-3);
  margin-top: 8px;
`;
