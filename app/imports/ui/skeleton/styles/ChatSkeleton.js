import styled, { keyframes } from "styled-components";

// Skeleton animation
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Base skeleton pulse component
export const SkeletonPulse = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--cream-1) 25%,
    var(--cream-2) 37%,
    var(--cream-1) 63%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: inherit;
`;

// Main container
export const SkeletonContainer = styled.div`
  background-color: var(--cream-1);
  width: 100%;
  min-height: 100vh;
  font-family: var(--font-ui);
  display: flex;
  flex-direction: column;
`;

// Header
export const SkeletonHeader = styled.div`
  background: var(--cream-0);
  border-bottom: 1px solid var(--cream-2);
  padding: 20px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const SkeletonTitle = styled.div`
  height: 28px;
  width: 120px;
  margin: 0 auto;
  border-radius: 6px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

// Content area
export const SkeletonContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

// Device-specific containers
export const SkeletonDesktopOnly = styled.div`
  display: flex;
  flex: 1;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const SkeletonMobileOnly = styled.div`
  display: none;
  flex: 1;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

// Sidebar (desktop)
export const SkeletonSidebar = styled.div`
  width: 300px;
  background: var(--cream-0);
  border-right: 1px solid var(--cream-2);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1024px) {
    width: 250px;
  }
`;

export const SkeletonSidebarHeader = styled.div`
  height: 24px;
  margin: 20px;
  border-radius: 6px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

// Chat list
export const SkeletonChatList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => (props.mobile ? "16px" : "0 0 20px 0")};
`;

export const SkeletonChatListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--cream-1);
  background: ${props => (props.active ? "var(--cream-1)" : "transparent")};
  cursor: pointer;
  
  &:hover {
    background: var(--cream-1);
  }
`;

export const SkeletonChatItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SkeletonChatItemName = styled.div`
  height: 18px;
  width: 120px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

export const SkeletonChatItemLast = styled.div`
  height: 14px;
  width: 180px;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

export const SkeletonChatItemCount = styled.div`
  height: 16px;
  width: 16px;
  border-radius: 8px;
  background-color: var(--cream-1);
  overflow: hidden;
  margin-left: 12px;
  flex-shrink: 0;
`;

// Main chat area
export const SkeletonMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--cream-0);
`;

// Conversation header
export const SkeletonConversationHeader = styled.div`
  background: var(--cream-0);
  border-bottom: 1px solid var(--cream-2);
  padding: 20px;
`;

export const SkeletonConversationInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SkeletonConversationName = styled.div`
  height: 20px;
  width: 160px;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

export const SkeletonConversationParticipants = styled.div`
  height: 14px;
  width: 200px;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

// Messages area
export const SkeletonMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--cream-1);
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

// Date separator
export const SkeletonDateSeparator = styled.div`
  height: 16px;
  width: 80px;
  margin: 8px auto;
  border-radius: 8px;
  background-color: var(--cream-1);
  overflow: hidden;
`;

// Message
export const SkeletonMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.own ? "flex-end" : "flex-start")};
  max-width: 70%;
  align-self: ${props => (props.own ? "flex-end" : "flex-start")};
  gap: 4px;
`;

export const SkeletonMessageSender = styled.div`
  height: 12px;
  width: 60px;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
  margin-bottom: 4px;
`;

export const SkeletonMessageContent = styled.div`
  height: 36px;
  width: ${props => (props.long ? "200px" : "120px")};
  border-radius: 18px;
  background-color: ${props => (props.own ? "var(--signal-yellow-soft)" : "var(--cream-1)")};
  overflow: hidden;
  padding: 8px 16px;
  
  ${SkeletonPulse} {
    background: ${props => (props.own
      ? "linear-gradient(90deg, var(--leaf-soft) 25%, var(--leaf-soft) 37%, var(--leaf-soft) 63%)"
      : "linear-gradient(90deg, var(--cream-1) 25%, var(--cream-2) 37%, var(--cream-1) 63%)")
    };
  }
`;

export const SkeletonMessageTime = styled.div`
  height: 10px;
  width: 40px;
  border-radius: 4px;
  background-color: var(--cream-1);
  overflow: hidden;
  margin-top: 2px;
`;

// Input form
export const SkeletonInputForm = styled.div`
  background: var(--cream-0);
  border-top: 1px solid var(--cream-2);
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

export const SkeletonInput = styled.div`
  flex: 1;
  height: 40px;
  border-radius: 20px;
  background-color: var(--cream-1);
  border: 1px solid var(--cream-2);
  overflow: hidden;
`;

export const SkeletonSendButton = styled.div`
  height: 40px;
  width: 60px;
  border-radius: 20px;
  background-color: var(--cream-1);
  overflow: hidden;
`;
