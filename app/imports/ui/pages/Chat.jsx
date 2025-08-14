import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Chats } from "../../api/chat/Chat";
import "../../api/chat/ChatMethods";
import { MobileOnly, DesktopOnly } from "../layouts/Devices";
import BackButton from "../mobile/components/BackButton";
import { ChatSkeleton } from "../skeleton";
import {
  Container,
  Header,
  Title,
  ErrorMessage,
  SuccessMessage,
  Content,
  Sidebar,
  SidebarHeader,
  ChatList,
  ChatListItem,
  ChatListItemContent,
  ChatListItemName,
  ChatListItemLast,
  ChatListItemCount,
  ChatListEmpty,
  Main,
  ConversationHeader,
  ConversationInfo,
  ConversationName,
  ConversationParticipants,
  Messages,
  DateSeparator,
  Message,
  MessageSender,
  MessageContent,
  MessageTime,
  InputForm,
  Input,
  SendButton,
  NoSelection,
  NoSelectionContent,
  NoSelectionIcon,
  ChatOverlay,
  OverlayHeader,
  OverlayTitle,
  MobileChatList,
  MobileChatListItem,
  EmptyStateSubtext,
} from "../styles/Chat";

/**
 * Modern Mobile Chat component
 */
class MobileChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedChatId: null,
      messageInput: "",
      error: "",
      success: "",
      showChatOverlay: false,
    };
    this.isSubmitting = false;
  }

  componentDidMount() {
    // Check for URL parameters
    const urlParams = new URLSearchParams(this.props.location.search);
    const rideId = urlParams.get("rideId");

    // Handle ride-specific chat
    if (rideId) {
      this.createOrJoinRideChat(rideId);
      return;
    }

    // Check if a specific chat was passed via navigation state
    const locationState = this.props.location?.state;
    if (locationState?.selectedChatId) {
      this.setState({ selectedChatId: locationState.selectedChatId });
    } else if (this.props.chats && this.props.chats.length > 0) {
      // Auto-select first chat if available and no specific chat requested
      this.setState({ selectedChatId: this.props.chats[0]._id });
    }
  }

  componentWillUnmount() {
    // Clean up body class when component unmounts
    document.body.classList.remove("chat-overlay-open");

    // Restore iOS navbars when component unmounts
    this.showIOSNavBars();
  }

  componentDidUpdate(prevProps) {
    // Check for navigation state changes
    const locationState = this.props.location?.state;
    const prevLocationState = prevProps.location?.state;

    if (
      locationState?.selectedChatId &&
      locationState.selectedChatId !== prevLocationState?.selectedChatId
    ) {
      this.setState({ selectedChatId: locationState.selectedChatId });
      return;
    }

    // Auto-select first chat when chats load (only if no specific chat selected)
    if (
      this.props.chats &&
      this.props.chats.length > 0 &&
      !this.state.selectedChatId &&
      (!prevProps.chats || prevProps.chats.length === 0)
    ) {
      this.setState({ selectedChatId: this.props.chats[0]._id });
    }
  }

  handleSendMessage = async (e) => {
    e.preventDefault();
    const { messageInput, selectedChatId } = this.state;

    if (!messageInput.trim() || !selectedChatId) return;

    // Prevent double submission
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    // Clear input immediately to show message was sent
    const messageToSend = messageInput.trim();
    this.setState({ messageInput: "" });

    try {
      await Meteor.callAsync(
        "chats.sendMessage",
        selectedChatId,
        messageToSend,
      );
      // Scroll to bottom after message is sent
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      this.setState({
        error: error.reason || error.message,
        messageInput: messageToSend, // Restore message on error
      });
    } finally {
      this.isSubmitting = false;
    }
  };

  createOrJoinRideChat = async (rideId) => {
    try {
      const chatId = await Meteor.callAsync("chats.createForRide", rideId);
      this.setState({
        selectedChatId: chatId,
        success: "Joined ride chat successfully!",
      });
      setTimeout(() => this.setState({ success: "" }), 3000);
    } catch (error) {
      this.setState({
        error: error.reason || error.message,
      });
    }
  };

  scrollToBottom = () => {
    const messagesContainer = document.querySelector(".mobile-chat-messages");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  getCurrentUser = () => Meteor.user()?.username;

  getSelectedChat = () => this.props.chats?.find((chat) => chat._id === this.state.selectedChatId);

  getChatDisplayName = (chat) => {
    const currentUser = this.getCurrentUser();

    // All chats are now ride-specific, show ride info
    if (chat.rideId) {
      return `Ride Chat (${chat.Participants.length} members)`;
    }

    // Fallback for any legacy data
    const otherParticipants = chat.Participants.filter(
      (p) => p !== currentUser,
    );

    if (otherParticipants.length === 0) {
      return "Empty Chat";
    }
    return otherParticipants[0];
  };

  getChatStatus = (chat) => (chat.Participants.length === 1 ? "Waiting for participant" : "Active");

  // Helper to hide/show iOS native navbars
  hideIOSNavBars = async () => {
    if (window.cordova?.plugins?.NativeNavBar) {
      try {
        // Call global hide function if available
        if (window.cordova.plugins.NativeNavBar.promise.hideAllNavBars) {
          await window.cordova.plugins.NativeNavBar.promise.hideAllNavBars();
          console.log("[Chat] 🙈 Hidden all iOS navbars");
        } else {
          // Fallback: try to hide common navbar IDs
          const commonNavBarIds = ["bottom-navbar", "top-navbar", "main-navbar"];
          for (const navBarId of commonNavBarIds) {
            try {
              await window.cordova.plugins.NativeNavBar.promise.hideNavBar(navBarId);
              console.log("[Chat] 🙈 Hidden iOS navbar:", navBarId);
            } catch (error) {
              // Silently fail - navbar might not exist
            }
          }
        }
      } catch (error) {
        console.warn("[Chat] ⚠️ Error hiding iOS navbars:", error);
      }
    }
  };

  showIOSNavBars = async () => {
    if (window.cordova?.plugins?.NativeNavBar) {
      try {
        // Call global show function if available
        if (window.cordova.plugins.NativeNavBar.promise.showAllNavBars) {
          await window.cordova.plugins.NativeNavBar.promise.showAllNavBars();
          console.log("[Chat] 👁️ Restored all iOS navbars");
        } else {
          // Fallback: try to show common navbar IDs
          const commonNavBarIds = ["bottom-navbar", "top-navbar", "main-navbar"];
          for (const navBarId of commonNavBarIds) {
            try {
              await window.cordova.plugins.NativeNavBar.promise.showNavBar(navBarId);
              console.log("[Chat] 👁️ Restored iOS navbar:", navBarId);
            } catch (error) {
              // Silently fail - navbar might not exist
            }
          }
        }
      } catch (error) {
        console.warn("[Chat] ⚠️ Error restoring iOS navbars:", error);
      }
    }
  };

  handleMobileChatSelect = (chatId) => {
    this.setState({
      selectedChatId: chatId,
      showChatOverlay: true,
    });

    // Hide CSS navbar when chat overlay opens
    document.body.classList.add("chat-overlay-open");

    // Hide iOS native navbars
    this.hideIOSNavBars();
  };

  handleCloseChatOverlay = () => {
    this.setState({
      showChatOverlay: false,
    });

    // Show CSS navbar when chat overlay closes
    document.body.classList.remove("chat-overlay-open");

    // Show iOS native navbars
    this.showIOSNavBars();
  };

  render() {
    if (!this.props.ready) {
      return (
        <>
          <MobileOnly>
            <ChatSkeleton numberOfChats={4} numberOfMessages={8} showMobileLayout={true} />
          </MobileOnly>
          <DesktopOnly>
            <ChatSkeleton numberOfChats={4} numberOfMessages={8} showMobileLayout={false} />
          </DesktopOnly>
        </>
      );
    }

    const {
      selectedChatId,
      messageInput,
      error,
      success,
      showChatOverlay,
    } = this.state;

    const selectedChat = this.getSelectedChat();
    const currentUser = this.getCurrentUser();

    return (
      <>
        <Container>
          {/* Header */}
          <Header>
            <Title>Messages</Title>
          </Header>

          {/* Error/Success Messages */}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          {/* Desktop Layout */}
          <DesktopOnly>
            <Content>
              {/* Chat List Sidebar */}
              <Sidebar>
                <SidebarHeader>
                  <h3>Chats</h3>
                </SidebarHeader>
                <ChatList>
                  {this.props.chats && this.props.chats.length > 0 ? (
                    this.props.chats.map((chat) => (
                      <ChatListItem
                        key={chat._id}
                        active={selectedChatId === chat._id}
                        onClick={() => this.setState({ selectedChatId: chat._id })
                        }
                      >
                        <ChatListItemContent>
                          <ChatListItemName>
                            {this.getChatDisplayName(chat)}
                          </ChatListItemName>
                          <ChatListItemLast>
                            {chat.Messages.length > 0
                              ? chat.Messages[chat.Messages.length - 1].Content
                              : "No messages yet"}
                          </ChatListItemLast>
                        </ChatListItemContent>
                        <ChatListItemCount>
                          {chat.Participants.length}
                        </ChatListItemCount>
                      </ChatListItem>
                    ))
                  ) : (
                    <ChatListEmpty>
                      <p>No ride chats available</p>
                      <EmptyStateSubtext>
                        Join a ride to start chatting with other members
                      </EmptyStateSubtext>
                    </ChatListEmpty>
                  )}
                </ChatList>
              </Sidebar>

              {/* Chat Messages */}
              <Main>
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <ConversationHeader>
                      <ConversationInfo>
                        <ConversationName>
                          {this.getChatDisplayName(selectedChat)}
                        </ConversationName>
                        <ConversationParticipants>
                          {selectedChat.Participants.join(", ")}
                        </ConversationParticipants>
                      </ConversationInfo>
                    </ConversationHeader>

                    {/* Messages */}
                    <Messages className="mobile-chat-messages">
                      {selectedChat.Messages.map((message, index) => {
                        const isCurrentUser = message.Sender === currentUser;
                        const isSystem = message.Sender === "System";
                        const showDateSeparator =
                          index === 0 ||
                          this.formatDate(message.Timestamp) !==
                            this.formatDate(
                              selectedChat.Messages[index - 1].Timestamp,
                            );

                        return (
                          <React.Fragment
                            key={`${
                              message.Timestamp?.getTime() || Date.now()
                            }-${index}`}
                          >
                            {showDateSeparator && (
                              <DateSeparator>
                                {this.formatDate(message.Timestamp)}
                              </DateSeparator>
                            )}
                            <Message own={isCurrentUser} system={isSystem}>
                              {!isCurrentUser && !isSystem && (
                                <MessageSender>{message.Sender}</MessageSender>
                              )}
                              <MessageContent
                                own={isCurrentUser}
                                system={isSystem}
                              >
                                {message.Content}
                              </MessageContent>
                              <MessageTime>
                                {this.formatTime(message.Timestamp)}
                              </MessageTime>
                            </Message>
                          </React.Fragment>
                        );
                      })}
                    </Messages>

                    {/* Message Input */}
                    <InputForm onSubmit={this.handleSendMessage}>
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => this.setState({ messageInput: e.target.value })
                        }
                      />
                      <SendButton type="submit" disabled={!messageInput.trim()}>
                        Send
                      </SendButton>
                    </InputForm>
                  </>
                ) : (
                  <NoSelection>
                    <NoSelectionContent>
                      <NoSelectionIcon>💬</NoSelectionIcon>
                      <h3>Select a chat to start messaging</h3>
                      <p>
                        Choose a conversation from the list or create a new one
                      </p>
                    </NoSelectionContent>
                  </NoSelection>
                )}
              </Main>
            </Content>
          </DesktopOnly>

          {/* Mobile Layout */}
          <MobileOnly>
            <MobileChatList>
              {this.props.chats && this.props.chats.length > 0 ? (
                this.props.chats.map((chat) => (
                  <MobileChatListItem
                    key={chat._id}
                    onClick={() => this.handleMobileChatSelect(chat._id)}
                  >
                    <ChatListItemContent>
                      <ChatListItemName>
                        {this.getChatDisplayName(chat)}
                      </ChatListItemName>
                      <ChatListItemLast>
                        {chat.Messages.length > 0
                          ? chat.Messages[chat.Messages.length - 1].Content
                          : "No messages yet"}
                      </ChatListItemLast>
                    </ChatListItemContent>
                    <ChatListItemCount>
                      {chat.Participants.length}
                    </ChatListItemCount>
                  </MobileChatListItem>
                ))
              ) : (
                <ChatListEmpty>
                  <p>No ride chats available</p>
                  <EmptyStateSubtext>
                    Join a ride to start chatting with other members
                  </EmptyStateSubtext>
                </ChatListEmpty>
              )}
            </MobileChatList>
          </MobileOnly>
        </Container>

        {/* Mobile Chat Overlay */}
        {showChatOverlay && selectedChat && (
          <ChatOverlay>
            <BackButton onClick={this.handleCloseChatOverlay} />
            <OverlayHeader>
              <OverlayTitle>
                {this.getChatDisplayName(selectedChat)}
              </OverlayTitle>
            </OverlayHeader>

            {/* Messages */}
            <Messages className="mobile-chat-messages">
              {selectedChat.Messages.map((message, index) => {
                const isCurrentUser = message.Sender === currentUser;
                const isSystem = message.Sender === "System";
                const showDateSeparator =
                  index === 0 ||
                  this.formatDate(message.Timestamp) !==
                    this.formatDate(
                      selectedChat.Messages[index - 1].Timestamp,
                    );

                return (
                  <React.Fragment
                    key={`${
                      message.Timestamp?.getTime() || Date.now()
                    }-${index}`}
                  >
                    {showDateSeparator && (
                      <DateSeparator>
                        {this.formatDate(message.Timestamp)}
                      </DateSeparator>
                    )}
                    <Message own={isCurrentUser} system={isSystem}>
                      {!isCurrentUser && !isSystem && (
                        <MessageSender>{message.Sender}</MessageSender>
                      )}
                      <MessageContent
                        own={isCurrentUser}
                        system={isSystem}
                      >
                        {message.Content}
                      </MessageContent>
                      <MessageTime>
                        {this.formatTime(message.Timestamp)}
                      </MessageTime>
                    </Message>
                  </React.Fragment>
                );
              })}
            </Messages>

            {/* Message Input */}
            <InputForm onSubmit={this.handleSendMessage}>
              <Input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => this.setState({ messageInput: e.target.value })
                }
              />
              <SendButton type="submit" disabled={!messageInput.trim()}>
                Send
              </SendButton>
            </InputForm>
          </ChatOverlay>
        )}
      </>
    );
  }
}

MobileChat.propTypes = {
  chats: PropTypes.array,
  ready: PropTypes.bool.isRequired,
  location: PropTypes.object,
};

export default withRouter(
  withTracker((props) => {
    // Check for URL parameters
    const urlParams = new URLSearchParams(props.location.search);
    const rideId = urlParams.get("rideId");

    // Subscribe to appropriate publication based on search parameters
    let subscription;
    if (rideId) {
      subscription = Meteor.subscribe("chats.forRide", rideId);
    } else {
      subscription = Meteor.subscribe("chats");
    }

    const ready = subscription.ready();

    return {
      chats: ready ? Chats.find({}).fetch() : [],
      ready: ready,
      rideId: rideId,
    };
  })(MobileChat),
);
