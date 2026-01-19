import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { getUserDisplayName } from "../utils/userDisplay";
import {
  Message,
  MessageSender,
  MessageContent,
  MessageTime,
} from "../styles/Chat";

/**
 * Memoized Chat Message component for optimal performance
 * Only re-renders when message content actually changes
 */
const ChatMessage = memo(({
  message,
  isCurrentUser,
  showSender = true,
  timeFormat = "short",
}) => {
  // Memoize expensive time formatting
  const formattedTime = useMemo(() => {
    const date = new Date(message.Timestamp);

    if (timeFormat === "short") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleTimeString();
  }, [message.Timestamp, timeFormat]);

  // Memoize sender display - resolve user ID to display name
  const senderDisplay = useMemo(() => {
    if (!showSender) return null;
    return getUserDisplayName(message.Sender);
  }, [message.Sender, showSender]);

  const isSystem = message.Sender === "System";

  return (
    <Message own={isCurrentUser} system={isSystem}>
      {showSender && !isCurrentUser && !isSystem && (
        <MessageSender>{senderDisplay}</MessageSender>
      )}
      <MessageContent own={isCurrentUser} system={isSystem}>
        {message.Content}
      </MessageContent>
      <MessageTime>{formattedTime}</MessageTime>
    </Message>
  );
}, (prevProps, nextProps) =>
  // Custom comparison for optimal memoization
   (
    prevProps.message._id === nextProps.message._id &&
    prevProps.message.Content === nextProps.message.Content &&
    prevProps.message.Timestamp === nextProps.message.Timestamp &&
    prevProps.isCurrentUser === nextProps.isCurrentUser &&
    prevProps.showSender === nextProps.showSender &&
    prevProps.timeFormat === nextProps.timeFormat
  ));

ChatMessage.propTypes = {
  message: PropTypes.shape({
    _id: PropTypes.string,
    Sender: PropTypes.string.isRequired,
    Content: PropTypes.string.isRequired,
    Timestamp: PropTypes.instanceOf(Date).isRequired,
  }).isRequired,
  isCurrentUser: PropTypes.bool,
  showSender: PropTypes.bool,
  timeFormat: PropTypes.oneOf(["short", "long"]),
};

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
