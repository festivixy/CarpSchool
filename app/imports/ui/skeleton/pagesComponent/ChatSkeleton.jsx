import React from "react";
import PropTypes from "prop-types";
import {
  SkeletonContainer,
  SkeletonHeader,
  SkeletonTitle,
  SkeletonContent,
  SkeletonSidebar,
  SkeletonSidebarHeader,
  SkeletonChatList,
  SkeletonChatListItem,
  SkeletonChatItemContent,
  SkeletonChatItemName,
  SkeletonChatItemLast,
  SkeletonChatItemCount,
  SkeletonMain,
  SkeletonConversationHeader,
  SkeletonConversationInfo,
  SkeletonConversationName,
  SkeletonConversationParticipants,
  SkeletonMessages,
  SkeletonDateSeparator,
  SkeletonMessage,
  SkeletonMessageSender,
  SkeletonMessageContent,
  SkeletonMessageTime,
  SkeletonInputForm,
  SkeletonInput,
  SkeletonSendButton,
  SkeletonMobileOnly,
  SkeletonDesktopOnly,
  SkeletonPulse,
} from "../styles/ChatSkeleton";

/**
 * Skeleton loading component for Chat page
 * Mimics the desktop and mobile chat layouts
 */
const ChatSkeleton = ({ 
  numberOfChats = 4, 
  numberOfMessages = 8,
  showMobileLayout = false 
}) => {
  const renderChatListItems = () => (
    Array.from({ length: numberOfChats }).map((_, index) => (
      <SkeletonChatListItem key={index} active={index === 0}>
        <SkeletonChatItemContent>
          <SkeletonChatItemName>
            <SkeletonPulse />
          </SkeletonChatItemName>
          <SkeletonChatItemLast>
            <SkeletonPulse />
          </SkeletonChatItemLast>
        </SkeletonChatItemContent>
        <SkeletonChatItemCount>
          <SkeletonPulse />
        </SkeletonChatItemCount>
      </SkeletonChatListItem>
    ))
  );

  const renderMessages = () => (
    Array.from({ length: numberOfMessages }).map((_, index) => {
      const isOwnMessage = Math.random() > 0.5;
      const showDateSeparator = index === 0 || index === 3 || index === 6;
      const showSender = !isOwnMessage && Math.random() > 0.3;

      return (
        <React.Fragment key={index}>
          {showDateSeparator && (
            <SkeletonDateSeparator>
              <SkeletonPulse />
            </SkeletonDateSeparator>
          )}
          <SkeletonMessage own={isOwnMessage}>
            {showSender && (
              <SkeletonMessageSender>
                <SkeletonPulse />
              </SkeletonMessageSender>
            )}
            <SkeletonMessageContent 
              own={isOwnMessage}
              long={Math.random() > 0.4}
            >
              <SkeletonPulse />
            </SkeletonMessageContent>
            <SkeletonMessageTime>
              <SkeletonPulse />
            </SkeletonMessageTime>
          </SkeletonMessage>
        </React.Fragment>
      );
    })
  );

  if (showMobileLayout) {
    return (
      <SkeletonContainer>
        <SkeletonHeader>
          <SkeletonTitle>
            <SkeletonPulse />
          </SkeletonTitle>
        </SkeletonHeader>

        {/* Mobile chat list view */}
        <SkeletonContent>
          <SkeletonChatList mobile>
            {renderChatListItems()}
          </SkeletonChatList>
        </SkeletonContent>
      </SkeletonContainer>
    );
  }

  return (
    <SkeletonContainer>
      {/* Header */}
      <SkeletonHeader>
        <SkeletonTitle>
          <SkeletonPulse />
        </SkeletonTitle>
      </SkeletonHeader>

      {/* Desktop Layout */}
      <SkeletonDesktopOnly>
        <SkeletonContent>
          {/* Chat List Sidebar */}
          <SkeletonSidebar>
            <SkeletonSidebarHeader>
              <SkeletonPulse />
            </SkeletonSidebarHeader>
            <SkeletonChatList>
              {renderChatListItems()}
            </SkeletonChatList>
          </SkeletonSidebar>

          {/* Chat Messages Main Area */}
          <SkeletonMain>
            {/* Conversation Header */}
            <SkeletonConversationHeader>
              <SkeletonConversationInfo>
                <SkeletonConversationName>
                  <SkeletonPulse />
                </SkeletonConversationName>
                <SkeletonConversationParticipants>
                  <SkeletonPulse />
                </SkeletonConversationParticipants>
              </SkeletonConversationInfo>
            </SkeletonConversationHeader>

            {/* Messages */}
            <SkeletonMessages>
              {renderMessages()}
            </SkeletonMessages>

            {/* Message Input */}
            <SkeletonInputForm>
              <SkeletonInput>
                <SkeletonPulse />
              </SkeletonInput>
              <SkeletonSendButton>
                <SkeletonPulse />
              </SkeletonSendButton>
            </SkeletonInputForm>
          </SkeletonMain>
        </SkeletonContent>
      </SkeletonDesktopOnly>

      {/* Mobile Layout */}
      <SkeletonMobileOnly>
        {/* Conversation View */}
        <SkeletonContent>
          {/* Conversation Header */}
          <SkeletonConversationHeader>
            <SkeletonConversationInfo>
              <SkeletonConversationName>
                <SkeletonPulse />
              </SkeletonConversationName>
              <SkeletonConversationParticipants>
                <SkeletonPulse />
              </SkeletonConversationParticipants>
            </SkeletonConversationInfo>
          </SkeletonConversationHeader>

          {/* Messages */}
          <SkeletonMessages>
            {renderMessages()}
          </SkeletonMessages>

          {/* Message Input */}
          <SkeletonInputForm>
            <SkeletonInput>
              <SkeletonPulse />
            </SkeletonInput>
            <SkeletonSendButton>
              <SkeletonPulse />
            </SkeletonSendButton>
          </SkeletonInputForm>
        </SkeletonContent>
      </SkeletonMobileOnly>
    </SkeletonContainer>
  );
};

ChatSkeleton.propTypes = {
  numberOfChats: PropTypes.number,
  numberOfMessages: PropTypes.number,
  showMobileLayout: PropTypes.bool,
};

export default ChatSkeleton;
