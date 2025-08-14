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
    #f0f0f0 25%,
    #e0e0e0 37%,
    #f0f0f0 63%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: inherit;
`;

// Main container
export const SkeletonContainer = styled.div`
  background-color: #f8f9fa;
  width: 100%;
  min-height: 100vh;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  display: flex;
  flex-direction: column;
`;

// Header
export const SkeletonHeader = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
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
  background-color: #f0f0f0;
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
  background: #ffffff;
  border-right: 1px solid #e9ecef;
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
  background-color: #f0f0f0;
  overflow: hidden;
`;

// Chat list
export const SkeletonChatList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.mobile ? '16px' : '0 0 20px 0'};
`;

export const SkeletonChatListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f8f9fa;
  background: ${props => props.active ? '#f8f9fa' : 'transparent'};
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
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
  background-color: #f0f0f0;
  overflow: hidden;
`;

export const SkeletonChatItemLast = styled.div`
  height: 14px;
  width: 180px;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
`;

export const SkeletonChatItemCount = styled.div`
  height: 16px;
  width: 16px;
  border-radius: 8px;
  background-color: #f0f0f0;
  overflow: hidden;
  margin-left: 12px;
  flex-shrink: 0;
`;

// Main chat area
export const SkeletonMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
`;

// Conversation header
export const SkeletonConversationHeader = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
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
  background-color: #f0f0f0;
  overflow: hidden;
`;

export const SkeletonConversationParticipants = styled.div`
  height: 14px;
  width: 200px;
  border-radius: 4px;
  background-color: #f0f0f0;
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
  background: #fafbfc;
  
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
  background-color: #f0f0f0;
  overflow: hidden;
`;

// Message
export const SkeletonMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.own ? 'flex-end' : 'flex-start'};
  max-width: 70%;
  align-self: ${props => props.own ? 'flex-end' : 'flex-start'};
  gap: 4px;
`;

export const SkeletonMessageSender = styled.div`
  height: 12px;
  width: 60px;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
  margin-bottom: 4px;
`;

export const SkeletonMessageContent = styled.div`
  height: 36px;
  width: ${props => props.long ? '200px' : '120px'};
  border-radius: 18px;
  background-color: ${props => props.own ? '#e3f2fd' : '#f0f0f0'};
  overflow: hidden;
  padding: 8px 16px;
  
  ${SkeletonPulse} {
    background: ${props => props.own 
      ? 'linear-gradient(90deg, #d1e7dd 25%, #c3e6cb 37%, #d1e7dd 63%)'
      : 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)'
    };
  }
`;

export const SkeletonMessageTime = styled.div`
  height: 10px;
  width: 40px;
  border-radius: 4px;
  background-color: #f0f0f0;
  overflow: hidden;
  margin-top: 2px;
`;

// Input form
export const SkeletonInputForm = styled.div`
  background: #ffffff;
  border-top: 1px solid #e9ecef;
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
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  overflow: hidden;
`;

export const SkeletonSendButton = styled.div`
  height: 40px;
  width: 60px;
  border-radius: 20px;
  background-color: #f0f0f0;
  overflow: hidden;
`;
