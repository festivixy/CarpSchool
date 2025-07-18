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
  HeaderButtons,
  CreateButton,
  JoinButton,
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
  EmptyButtons,
  CreateFirstButton,
  JoinFirstButton,
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
  ModalSubtitle,
  ModalContent,
  FormGroup,
  FormHint,
  ShareCodeDisplay,
  CodeContainer,
  Code,
  CodeInputs,
  CodeInput,
  Dash,
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
      showJoinChatModal: false,
      showShareCodeModal: false,
      showCreateChatModal: false,
      codeInputs: ["", "", "", "", "", "", "", ""], // 8 separate inputs for join code
      selectedChatShareCode: "",
      newChatShareCode: "",
      error: "",
      success: "",
    };
    this.codeInputRefs = [];
    this.isSubmitting = false;
  }

  componentDidMount() {
    // Check if a specific chat was passed via navigation state
    const locationState = this.props.location?.state;
    if (locationState?.selectedChatId) {
      this.setState({ selectedChatId: locationState.selectedChatId });
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

  handleCreateChat = async () => {
    try {
      const result = await Meteor.callAsync("chats.createWithCode");
      this.setState({
        showCreateChatModal: true,
        newChatShareCode: result.shareCode,
        selectedChatId: result.chatId,
        success: "Chat created successfully!",
      });
      setTimeout(() => this.setState({ success: "" }), 3000);
    } catch (error) {
      this.setState({ error: error.reason || error.message });
    }
  };

  handleCodeInputChange = (index, e) => {
    const value = e.target.value.toUpperCase();

    if (value.length <= 1) {
      const newInputs = [...this.state.codeInputs];
      newInputs[index] = value;
      this.setState({ codeInputs: newInputs, error: "" });

      // Auto-advance to next input
      if (value.length === 1 && index < 7) {
        const nextInput = this.codeInputRefs[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  handleCodeKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (
      e.key === "Backspace" &&
      this.state.codeInputs[index] === "" &&
      index > 0
    ) {
      const prevInput = this.codeInputRefs[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  handleCodePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").toUpperCase();
    const cleanPaste = paste.replace(/[^A-Z0-9]/g, "");

    if (cleanPaste.length <= 8) {
      const newInputs = [...this.state.codeInputs];
      for (let i = 0; i < 8; i++) {
        newInputs[i] = cleanPaste[i] || "";
      }
      this.setState({ codeInputs: newInputs, error: "" });
    }
  };

  handleJoinChat = async () => {
    const shareCode = this.state.codeInputs.join("");

    if (shareCode.length !== 8) {
      this.setState({ error: "Please enter a complete 8-character code" });
      return;
    }

    // Format code with dash for API call
    const formattedCode = `${shareCode.slice(0, 4)}-${shareCode.slice(4)}`;

    try {
      const chatId = await Meteor.callAsync("chats.joinChat", formattedCode);
      this.setState({
        showJoinChatModal: false,
        codeInputs: ["", "", "", "", "", "", "", ""],
        selectedChatId: chatId,
        success: "Joined chat successfully!",
      });
      setTimeout(() => this.setState({ success: "" }), 3000);
    } catch (error) {
      this.setState({ error: error.reason || error.message });
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

  copyNewChatCode = () => {
    const { newChatShareCode } = this.state;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(newChatShareCode).then(() => {
        this.setState({ success: "Chat code copied to clipboard!" });
        setTimeout(() => this.setState({ success: "" }), 3000);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = newChatShareCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      this.setState({ success: "Chat code copied to clipboard!" });
      setTimeout(() => this.setState({ success: "" }), 3000);
    }
  };

  scrollToBottom = () => {
    const messagesContainer = document.querySelector(".mobile-chat-messages");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString("en-US", {
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

  getSelectedChat = () =>
    this.props.chats?.find((chat) => chat._id === this.state.selectedChatId);

  getChatDisplayName = (chat) => {
    const currentUser = this.getCurrentUser();
    const otherParticipants = chat.Participants.filter(
      (p) => p !== currentUser,
    );

    if (otherParticipants.length === 0) {
      return chat.shareCode ? "Waiting for someone to join..." : "Empty Chat";
    }
    return otherParticipants[0];
  };

  getChatStatus = (chat) =>
    chat.Participants.length === 1 ? "Waiting for participant" : "Active";

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
      showJoinChatModal,
      showShareCodeModal,
      showCreateChatModal,
      selectedChatShareCode,
      newChatShareCode,
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
            <HeaderButtons>
              <CreateButton onClick={this.handleCreateChat}>
                Create Chat
              </CreateButton>
              <JoinButton
                onClick={() => this.setState({ showJoinChatModal: true })}
              >
                Join Chat
              </JoinButton>
            </HeaderButtons>
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
                      onClick={() =>
                        this.setState({ selectedChatId: chat._id })
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
                    <p>No chats yet</p>
                    <EmptyButtons>
                      <CreateFirstButton onClick={this.handleCreateChat}>
                        Create Chat
                      </CreateFirstButton>
                      <JoinFirstButton
                        onClick={() =>
                          this.setState({ showJoinChatModal: true })
                        }
                      >
                        Join Chat
                      </JoinFirstButton>
                    </EmptyButtons>
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
                        onClick={() =>
                          this.handleShowShareCode(selectedChat._id)
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
                      onChange={(e) =>
                        this.setState({ messageInput: e.target.value })
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

        {/* Join Chat Modal */}
        {showJoinChatModal && (
          <ModalOverlay
            onClick={() =>
              this.setState({
                showJoinChatModal: false,
                error: "",
                codeInputs: ["", "", "", "", "", "", "", ""],
              })
            }
          >
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalClose
                  onClick={() =>
                    this.setState({
                      showJoinChatModal: false,
                      error: "",
                      codeInputs: ["", "", "", "", "", "", "", ""],
                    })
                  }
                  aria-label="Close"
                >
                  ✕
                </ModalClose>
                <ModalTitle>Join Chat</ModalTitle>
                <ModalSubtitle>
                  Enter the 8-character code shared with you
                </ModalSubtitle>
              </ModalHeader>
              <ModalContent>
                <FormGroup>
                  <CodeInputs>
                    {this.state.codeInputs.map((value, index) => (
                      <React.Fragment key={index}>
                        <CodeInput
                          ref={(ref) => {
                            this.codeInputRefs[index] = ref;
                          }}
                          value={value}
                          onChange={(e) => this.handleCodeInputChange(index, e)}
                          onKeyDown={(e) => this.handleCodeKeyDown(index, e)}
                          onPaste={
                            index === 0 ? this.handleCodePaste : undefined
                          }
                          maxLength={1}
                          type="text"
                          inputMode="alphanumeric"
                          autoCapitalize="characters"
                          autoComplete="off"
                          spellCheck="false"
                        />
                        {index === 3 && <Dash>-</Dash>}
                      </React.Fragment>
                    ))}
                  </CodeInputs>
                </FormGroup>
              </ModalContent>
              <ModalActions>
                <ButtonSecondary
                  onClick={() =>
                    this.setState({
                      showJoinChatModal: false,
                      error: "",
                      codeInputs: ["", "", "", "", "", "", "", ""],
                    })
                  }
                >
                  Cancel
                </ButtonSecondary>
                <ButtonPrimary
                  onClick={this.handleJoinChat}
                  disabled={this.state.codeInputs.some((input) => input === "")}
                >
                  Join Chat
                </ButtonPrimary>
              </ModalActions>
            </Modal>
          </ModalOverlay>
        )}

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

        {/* Create Chat Success Modal */}
        {showCreateChatModal && (
          <ModalOverlay
            onClick={() => this.setState({ showCreateChatModal: false })}
          >
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Chat Created!</ModalTitle>
                <ModalClose
                  onClick={() => this.setState({ showCreateChatModal: false })}
                >
                  ✕
                </ModalClose>
              </ModalHeader>
              <ModalContent>
                <ShareCodeDisplay>
                  <label>Your chat code is ready! Share it with someone:</label>
                  <CodeContainer>
                    <Code>{newChatShareCode}</Code>
                  </CodeContainer>
                  <FormHint>
                    Send this code to someone so they can join your chat
                  </FormHint>
                </ShareCodeDisplay>
              </ModalContent>
              <ModalActions>
                <ButtonPrimary onClick={this.copyNewChatCode}>
                  📋 Copy Code
                </ButtonPrimary>
                <ButtonSecondary
                  onClick={() => this.setState({ showCreateChatModal: false })}
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
  withTracker(() => {
    const subscription = Meteor.subscribe("chats");
    const ready = subscription.ready();

    return {
      chats: ready ? Chats.find({}).fetch() : [],
      ready: ready,
    };
  })(MobileChat),
);
