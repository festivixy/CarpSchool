import styled, { keyframes } from "styled-components";

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
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

// Styled Components for Chat
export const Container = styled.div`
  background-color: rgba(248, 249, 250, 1);
  min-height: 100vh;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  background-color: rgba(255, 255, 255, 1);
  padding: 20px;
  border-bottom: 1px solid rgba(240, 240, 240, 1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
`;

export const HeaderButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const CreateButton = styled.button`
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(40, 40, 40, 1);
    transform: translateY(-1px);
  }
`;

export const JoinButton = styled.button`
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(40, 40, 40, 1);
    transform: translateY(-1px);
  }
`;

export const ErrorMessage = styled.div`
  background-color: rgba(244, 67, 54, 0.1);
  color: rgba(244, 67, 54, 1);
  padding: 12px 20px;
  border-left: 4px solid rgba(244, 67, 54, 1);
`;

export const SuccessMessage = styled.div`
  background-color: rgba(76, 175, 80, 0.1);
  color: rgba(56, 142, 60, 1);
  padding: 12px 20px;
  border-left: 4px solid rgba(76, 175, 80, 1);
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
  background-color: rgba(255, 255, 255, 1);
  border-right: 1px solid rgba(240, 240, 240, 1);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

export const SidebarHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(240, 240, 240, 1);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.87);
  }
`;

export const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const ChatListItem = styled.div`
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid rgba(245, 245, 245, 1);
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => (props.active ? "rgba(0, 0, 0, 0.05)" : "transparent")};
  border-right: ${(props) => (props.active ? "3px solid rgba(0, 0, 0, 1)" : "none")};

  &:hover {
    background-color: rgba(245, 245, 245, 1);
  }
`;

export const ChatListItemContent = styled.div`
  flex: 1;
`;

export const ChatListItemName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 4px;
`;

export const ChatListItemLast = styled.div`
  font-size: 12px;
  color: rgba(100, 100, 100, 1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
`;

export const ChatListItemCount = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
`;

export const ChatListEmpty = styled.div`
  padding: 40px 20px;
  text-align: center;

  p {
    color: rgba(100, 100, 100, 1);
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
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 140px;
`;

export const JoinFirstButton = styled.button`
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 140px;
`;

export const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const ConversationHeader = styled.div`
  background-color: rgba(255, 255, 255, 1);
  padding: 16px 20px;
  border-bottom: 1px solid rgba(240, 240, 240, 1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ConversationInfo = styled.div``;

export const ConversationName = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
`;

export const ConversationParticipants = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(100, 100, 100, 1);
`;

export const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: rgba(248, 249, 250, 1);
`;

export const DateSeparator = styled.div`
  text-align: center;
  margin: 16px 0;
  font-size: 12px;
  color: rgba(100, 100, 100, 1);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: rgba(224, 224, 224, 1);
    z-index: 1;
  }

  &::after {
    content: attr(data-date);
    background-color: rgba(248, 249, 250, 1);
    padding: 0 12px;
    position: relative;
    z-index: 2;
  }
`;

export const Message = styled.div`
  margin-bottom: 12px;
  max-width: 70%;
  margin-left: ${(props) => (props.own ? "auto" : "0")};
  text-align: ${(props) => (props.own ? "right" : "left")};

  ${(props) => props.system &&
    `
    margin: 8px auto;
    text-align: center;
    max-width: 80%;
  `}
`;

export const MessageSender = styled.div`
  font-size: 11px;
  color: rgba(100, 100, 100, 1);
  margin-bottom: 2px;
  font-weight: 600;
`;

export const MessageContent = styled.div`
  background-color: rgba(255, 255, 255, 1);
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  ${(props) => props.own &&
    `
    background-color: rgba(0, 0, 0, 1);
    color: rgba(255, 255, 255, 1);
  `}

  ${(props) => props.system &&
    `
    background-color: rgba(240, 240, 240, 1);
    color: rgba(100, 100, 100, 1);
    font-style: italic;
    font-size: 12px;
  `}
`;

export const MessageTime = styled.div`
  font-size: 10px;
  color: rgba(150, 150, 150, 1);
  margin-top: 4px;
`;

export const InputForm = styled.form`
  background-color: rgba(255, 255, 255, 1);
  padding: 16px 20px;
  border-top: 1px solid rgba(240, 240, 240, 1);
  display: flex;
  gap: 12px;
`;

export const Input = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: rgba(0, 0, 0, 0.3);
  }
`;

export const SendButton = styled.button`
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: rgba(40, 40, 40, 1);
  }

  &:disabled {
    background-color: rgba(200, 200, 200, 1);
    cursor: not-allowed;
  }
`;

export const NoSelection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(248, 249, 250, 1);
`;

export const NoSelectionContent = styled.div`
  text-align: center;

  h3 {
    margin: 0 0 8px 0;
    color: rgba(0, 0, 0, 0.87);
  }

  p {
    margin: 0;
    color: rgba(100, 100, 100, 1);
  }
`;

export const NoSelectionIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;

  p {
    font-size: 16px;
    color: rgba(100, 100, 100, 1);
    margin: 0;
  }
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(240, 240, 240, 1);
  border-top: 3px solid rgba(0, 0, 0, 1);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 16px;
`;

// Modal Components
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

export const Modal = styled.div`
  background-color: rgba(255, 255, 255, 1);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  animation: ${modalSlideIn} 0.3s ease-out;

  @media (max-width: 768px) {
    margin: 0;
    border-radius: 12px;
  }
`;

export const ModalHeader = styled.div`
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid rgba(240, 240, 240, 1);
  position: relative;
  text-align: center;
`;

export const ModalClose = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 18px;
  color: rgba(100, 100, 100, 1);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(240, 240, 240, 1);
    color: rgba(0, 0, 0, 1);
  }
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
`;

export const ModalSubtitle = styled.div`
  font-size: 14px;
  color: rgba(100, 100, 100, 1);
  margin: 0;
  line-height: 1.4;
`;

export const ModalContent = styled.div`
  padding: 20px;
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.87);
  }

  input {
    width: 100%;
    border: 1px solid rgba(224, 224, 224, 1);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
  }
`;

export const FormHint = styled.p`
  font-size: 12px;
  color: rgba(100, 100, 100, 1);
  margin-top: 8px;
  line-height: 1.4;
`;
