import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Chats } from "../../../api/chat/Chat";
import "../../../api/chat/ChatMethods";
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
  ShareButton,
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
  Loading,
  LoadingSpinner,
  ModalOverlay,
  Modal,
  ModalHeader,
  ModalClose,
  ModalTitle,
  ModalContent,
  FormHint,
  ShareCodeDisplay,
  CodeContainer,
  Code,
  ModalActions,
  ButtonSecondary,
  ButtonPrimary,
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
      showShareCodeModal: false,
      selectedChatShareCode: "",
      error: "",
      success: "",
    };
    this.isSubmitting = false;
  }

  componentDidMount() {
    // Check for URL parameters
    const urlParams = new URLSearchParams(this.props.location.search);
    const searchEmail = urlParams.get("email");
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
    } else if (searchEmail && this.props.chats && this.props.chats.length > 0) {
      // If searching by email, auto-select first matching chat
      this.setState({ selectedChatId: this.props.chats[0]._id });
    } else if (this.props.chats && this.props.chats.length > 0) {
      // Auto-select first chat if available and no specific chat requested
      this.setState({ selectedChatId: this.props.chats[0]._id });
    }
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





  handleShowShareCode = async (chatId) => {
    try {
      const shareCode = await Meteor.callAsync(
        "chats.generateShareCode",
        chatId,
      );
      this.setState({
        showShareCodeModal: true,
        selectedChatShareCode: shareCode,
      });
    } catch (error) {
      this.setState({ error: error.reason || error.message });
    }
  };

  copyShareCode = () => {
    const { selectedChatShareCode } = this.state;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(selectedChatShareCode).then(() => {
        this.setState({ success: "Share code copied to clipboard!" });
        setTimeout(() => this.setState({ success: "" }), 3000);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = selectedChatShareCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      this.setState({ success: "Share code copied to clipboard!" });
      setTimeout(() => this.setState({ success: "" }), 3000);
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

    // For ride-specific chats, show ride info
    if (chat.rideId) {
      const otherParticipants = chat.Participants.filter(
        (p) => p !== currentUser,
      );
      return `Ride Chat (${chat.Participants.length} members)`;
    }

    // For general chats, show other participant
    const otherParticipants = chat.Participants.filter(
      (p) => p !== currentUser,
    );

    if (otherParticipants.length === 0) {
      return chat.shareCode ? "Waiting for someone to join..." : "Empty Chat";
    }
    return otherParticipants[0];
  };

  getChatStatus = (chat) => (chat.Participants.length === 1 ? "Waiting for participant" : "Active");

  render() {
    if (!this.props.ready) {
      return (
        <Container>
          <Loading>
            <LoadingSpinner />
            <p>Loading chats...</p>
          </Loading>
        </Container>
      );
    }

    const {
      selectedChatId,
      messageInput,
      showShareCodeModal,
      selectedChatShareCode,
      error,
      success,
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
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                      Join a ride to start chatting with other members
                    </p>
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
                    {selectedChat.Participants.length === 1 && (
                      <ShareButton
                        onClick={() => this.handleShowShareCode(selectedChat._id)
                        }
                      >
                        Share Code
                      </ShareButton>
                    )}
                  </ConversationHeader>

                  {/* Messages */}
                  <Messages>
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
        </Container>



        {/* Share Code Modal */}
        {showShareCodeModal && (
          <ModalOverlay
            onClick={() => this.setState({ showShareCodeModal: false })}
          >
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Share Chat Code</ModalTitle>
                <ModalClose
                  onClick={() => this.setState({ showShareCodeModal: false })}
                >
                  ✕
                </ModalClose>
              </ModalHeader>
              <ModalContent>
                <ShareCodeDisplay>
                  <label>Share this code with someone to join your chat:</label>
                  <CodeContainer>
                    <Code>{selectedChatShareCode}</Code>
                  </CodeContainer>
                  <FormHint>
                    This code will be removed once someone joins the chat
                  </FormHint>
                </ShareCodeDisplay>
              </ModalContent>
              <ModalActions>
                <ButtonPrimary onClick={this.copyShareCode}>
                  📋 Copy Code
                </ButtonPrimary>
                <ButtonSecondary
                  onClick={() => this.setState({ showShareCodeModal: false })}
                >
                  Done
                </ButtonSecondary>
              </ModalActions>
            </Modal>
          </ModalOverlay>
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
    const searchEmail = urlParams.get("email");
    const rideId = urlParams.get("rideId");

    // Subscribe to appropriate publication based on search parameters
    let subscription;
    if (rideId) {
      subscription = Meteor.subscribe("chats.forRide", rideId);
    } else if (searchEmail) {
      subscription = Meteor.subscribe("chats.withEmail", searchEmail);
    } else {
      subscription = Meteor.subscribe("chats");
    }

    const ready = subscription.ready();

    return {
      chats: ready ? Chats.find({}).fetch() : [],
      ready: ready,
      searchEmail: searchEmail,
      rideId: rideId,
    };
  })(MobileChat),
);
