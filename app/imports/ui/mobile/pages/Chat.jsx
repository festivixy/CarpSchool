import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Chats } from "../../../api/chat/Chat";
import "../../../api/chat/ChatMethods";

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
        messageToSend
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
        chatId
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

  formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  getCurrentUser = () => {
    return Meteor.user()?.username;
  };

  getSelectedChat = () => {
    return this.props.chats?.find(
      (chat) => chat._id === this.state.selectedChatId
    );
  };

  getChatDisplayName = (chat) => {
    const currentUser = this.getCurrentUser();
    const otherParticipants = chat.Participants.filter(
      (p) => p !== currentUser
    );

    if (otherParticipants.length === 0) {
      return chat.shareCode ? "Waiting for someone to join..." : "Empty Chat";
    } else {
      return otherParticipants[0];
    }
  };

  getChatStatus = (chat) => {
    return chat.Participants.length === 1
      ? "Waiting for participant"
      : "Active";
  };

  render() {
    if (!this.props.ready) {
      return (
        <div className="mobile-chat-container">
          <div className="mobile-chat-loading">
            <div className="mobile-chat-loading-spinner"></div>
            <p>Loading chats...</p>
          </div>
        </div>
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
        <div className="mobile-chat-container">
          {/* Header */}
          <div className="mobile-chat-header">
            <h1 className="mobile-chat-title">Messages</h1>
            <div className="mobile-chat-header-buttons">
              <button
                className="mobile-chat-create-button"
                onClick={this.handleCreateChat}
              >
                Create Chat
              </button>
              <button
                className="mobile-chat-join-button"
                onClick={() => this.setState({ showJoinChatModal: true })}
              >
                Join Chat
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && <div className="mobile-chat-error">{error}</div>}
          {success && <div className="mobile-chat-success">{success}</div>}

          <div className="mobile-chat-content">
            {/* Chat List Sidebar */}
            <div className="mobile-chat-sidebar">
              <div className="mobile-chat-sidebar-header">
                <h3>Chats</h3>
              </div>
              <div className="mobile-chat-list">
                {this.props.chats && this.props.chats.length > 0 ? (
                  this.props.chats.map((chat) => (
                    <div
                      key={chat._id}
                      className={`mobile-chat-list-item ${
                        selectedChatId === chat._id ? "active" : ""
                      }`}
                      onClick={() =>
                        this.setState({ selectedChatId: chat._id })
                      }
                    >
                      <div className="mobile-chat-list-item-content">
                        <div className="mobile-chat-list-item-name">
                          {this.getChatDisplayName(chat)}
                        </div>
                        <div className="mobile-chat-list-item-last">
                          {chat.Messages.length > 0
                            ? chat.Messages[chat.Messages.length - 1].Content
                            : "No messages yet"}
                        </div>
                      </div>
                      <div className="mobile-chat-list-item-count">
                        {chat.Participants.length}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="mobile-chat-list-empty">
                    <p>No chats yet</p>
                    <div className="mobile-chat-empty-buttons">
                      <button
                        className="mobile-chat-create-first-button"
                        onClick={this.handleCreateChat}
                      >
                        Create Chat
                      </button>
                      <button
                        className="mobile-chat-join-first-button"
                        onClick={() =>
                          this.setState({ showJoinChatModal: true })
                        }
                      >
                        Join Chat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="mobile-chat-main">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="mobile-chat-conversation-header">
                    <div className="mobile-chat-conversation-info">
                      <h3 className="mobile-chat-conversation-name">
                        {this.getChatDisplayName(selectedChat)}
                      </h3>
                      <p className="mobile-chat-conversation-participants">
                        {selectedChat.Participants.join(", ")}
                      </p>
                    </div>
                    {selectedChat.Participants.length === 1 && (
                      <button
                        className="mobile-chat-share-button"
                        onClick={() =>
                          this.handleShowShareCode(selectedChat._id)
                        }
                      >
                        Share Code
                      </button>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="mobile-chat-messages">
                    {selectedChat.Messages.map((message, index) => {
                      const isCurrentUser = message.Sender === currentUser;
                      const isSystem = message.Sender === "System";
                      const showDateSeparator =
                        index === 0 ||
                        this.formatDate(message.Timestamp) !==
                          this.formatDate(
                            selectedChat.Messages[index - 1].Timestamp
                          );

                      return (
                        <React.Fragment
                          key={`${
                            message.Timestamp?.getTime() || Date.now()
                          }-${index}`}
                        >
                          {showDateSeparator && (
                            <div className="mobile-chat-date-separator">
                              {this.formatDate(message.Timestamp)}
                            </div>
                          )}
                          <div
                            className={`mobile-chat-message ${
                              isCurrentUser
                                ? "own"
                                : isSystem
                                ? "system"
                                : "other"
                            }`}
                          >
                            {!isCurrentUser && !isSystem && (
                              <div className="mobile-chat-message-sender">
                                {message.Sender}
                              </div>
                            )}
                            <div className="mobile-chat-message-content">
                              {message.Content}
                            </div>
                            <div className="mobile-chat-message-time">
                              {this.formatTime(message.Timestamp)}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <form
                    className="mobile-chat-input-form"
                    onSubmit={this.handleSendMessage}
                  >
                    <input
                      type="text"
                      className="mobile-chat-input"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) =>
                        this.setState({ messageInput: e.target.value })
                      }
                    />
                    <button
                      type="submit"
                      className="mobile-chat-send-button"
                      disabled={!messageInput.trim()}
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="mobile-chat-no-selection">
                  <div className="mobile-chat-no-selection-content">
                    <div className="mobile-chat-no-selection-icon">💬</div>
                    <h3>Select a chat to start messaging</h3>
                    <p>
                      Choose a conversation from the list or create a new one
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Join Chat Modal */}
        {showJoinChatModal && (
          <div
            className="mobile-chat-modal-overlay"
            onClick={() =>
              this.setState({
                showJoinChatModal: false,
                error: "",
                codeInputs: ["", "", "", "", "", "", "", ""],
              })
            }
          >
            <div
              className="mobile-chat-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-chat-modal-header">
                <h2>Join Chat</h2>
                <button
                  className="mobile-chat-modal-close"
                  onClick={() =>
                    this.setState({
                      showJoinChatModal: false,
                      error: "",
                      codeInputs: ["", "", "", "", "", "", "", ""],
                    })
                  }
                >
                  ✕
                </button>
              </div>
              <div className="mobile-chat-modal-content">
                <div className="mobile-chat-form-group">
                  <label>Enter Chat Code</label>
                  <div className="mobile-chat-code-inputs">
                    {this.state.codeInputs.map((value, index) => (
                      <React.Fragment key={index}>
                        <input
                          ref={(ref) => {
                            this.codeInputRefs[index] = ref;
                          }}
                          value={value}
                          onChange={(e) => this.handleCodeInputChange(index, e)}
                          onKeyDown={(e) => this.handleCodeKeyDown(index, e)}
                          onPaste={
                            index === 0 ? this.handleCodePaste : undefined
                          }
                          className="mobile-chat-code-input"
                          maxLength={1}
                          type="text"
                          inputMode="alphanumeric"
                          autoCapitalize="characters"
                          autoComplete="off"
                          spellCheck="false"
                        />
                        {index === 3 && (
                          <span className="mobile-chat-dash">-</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="mobile-chat-form-hint">
                    Ask someone to share their chat code with you
                  </p>
                </div>
              </div>
              <div className="mobile-chat-modal-actions">
                <button
                  className="mobile-chat-button-secondary"
                  onClick={() =>
                    this.setState({
                      showJoinChatModal: false,
                      error: "",
                      codeInputs: ["", "", "", "", "", "", "", ""],
                    })
                  }
                >
                  Cancel
                </button>
                <button
                  className="mobile-chat-button-primary"
                  onClick={this.handleJoinChat}
                  disabled={this.state.codeInputs.some((input) => input === "")}
                >
                  Join Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Code Modal */}
        {showShareCodeModal && (
          <div
            className="mobile-chat-modal-overlay"
            onClick={() => this.setState({ showShareCodeModal: false })}
          >
            <div
              className="mobile-chat-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-chat-modal-header">
                <h2>Share Chat Code</h2>
                <button
                  className="mobile-chat-modal-close"
                  onClick={() => this.setState({ showShareCodeModal: false })}
                >
                  ✕
                </button>
              </div>
              <div className="mobile-chat-modal-content">
                <div className="mobile-chat-share-code-display">
                  <label>Share this code with someone to join your chat:</label>
                  <div className="mobile-chat-code-container">
                    <div className="mobile-chat-code">
                      {selectedChatShareCode}
                    </div>
                  </div>
                  <p className="mobile-chat-form-hint">
                    This code will be removed once someone joins the chat
                  </p>
                </div>
              </div>
              <div className="mobile-chat-modal-actions">
                <button
                  className="mobile-chat-button-primary"
                  onClick={this.copyShareCode}
                >
                  📋 Copy Code
                </button>
                <button
                  className="mobile-chat-button-secondary"
                  onClick={() => this.setState({ showShareCodeModal: false })}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Chat Success Modal */}
        {showCreateChatModal && (
          <div
            className="mobile-chat-modal-overlay"
            onClick={() => this.setState({ showCreateChatModal: false })}
          >
            <div
              className="mobile-chat-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-chat-modal-header">
                <h2>Chat Created!</h2>
                <button
                  className="mobile-chat-modal-close"
                  onClick={() => this.setState({ showCreateChatModal: false })}
                >
                  ✕
                </button>
              </div>
              <div className="mobile-chat-modal-content">
                <div className="mobile-chat-share-code-display">
                  <label>Your chat code is ready! Share it with someone:</label>
                  <div className="mobile-chat-code-container">
                    <div className="mobile-chat-code">{newChatShareCode}</div>
                  </div>
                  <p className="mobile-chat-form-hint">
                    Send this code to someone so they can join your chat
                  </p>
                </div>
              </div>
              <div className="mobile-chat-modal-actions">
                <button
                  className="mobile-chat-button-primary"
                  onClick={this.copyNewChatCode}
                >
                  📋 Copy Code
                </button>
                <button
                  className="mobile-chat-button-secondary"
                  onClick={() => this.setState({ showCreateChatModal: false })}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .mobile-chat-container {
            background-color: rgba(248, 249, 250, 1);
            min-height: 100vh;
            font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
            display: flex;
            flex-direction: column;
          }

          .mobile-chat-header {
            background-color: rgba(255, 255, 255, 1);
            padding: 20px;
            border-bottom: 1px solid rgba(240, 240, 240, 1);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .mobile-chat-title {
            font-size: 24px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.87);
            margin: 0;
          }

          .mobile-chat-header-buttons {
            display: flex;
            gap: 8px;
          }

          .mobile-chat-create-button,
          .mobile-chat-join-button {
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .mobile-chat-create-button:hover,
          .mobile-chat-join-button:hover {
            background-color: rgba(40, 40, 40, 1);
            transform: translateY(-1px);
          }

          .mobile-chat-error {
            background-color: rgba(244, 67, 54, 0.1);
            color: rgba(244, 67, 54, 1);
            padding: 12px 20px;
            border-left: 4px solid rgba(244, 67, 54, 1);
          }

          .mobile-chat-success {
            background-color: rgba(76, 175, 80, 0.1);
            color: rgba(56, 142, 60, 1);
            padding: 12px 20px;
            border-left: 4px solid rgba(76, 175, 80, 1);
          }

          .mobile-chat-content {
            display: flex;
            flex: 1;
            min-height: 0;
          }

          .mobile-chat-sidebar {
            width: 300px;
            background-color: rgba(255, 255, 255, 1);
            border-right: 1px solid rgba(240, 240, 240, 1);
            display: flex;
            flex-direction: column;
          }

          .mobile-chat-sidebar-header {
            padding: 16px 20px;
            border-bottom: 1px solid rgba(240, 240, 240, 1);
          }

          .mobile-chat-sidebar-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.87);
          }

          .mobile-chat-list {
            flex: 1;
            overflow-y: auto;
          }

          .mobile-chat-list-item {
            padding: 16px 20px;
            cursor: pointer;
            border-bottom: 1px solid rgba(245, 245, 245, 1);
            transition: background-color 0.2s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .mobile-chat-list-item:hover {
            background-color: rgba(245, 245, 245, 1);
          }

          .mobile-chat-list-item.active {
            background-color: rgba(0, 0, 0, 0.05);
            border-right: 3px solid rgba(0, 0, 0, 1);
          }

          .mobile-chat-list-item-content {
            flex: 1;
          }

          .mobile-chat-list-item-name {
            font-size: 14px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.87);
            margin-bottom: 4px;
          }

          .mobile-chat-list-item-last {
            font-size: 12px;
            color: rgba(100, 100, 100, 1);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 200px;
          }

          .mobile-chat-list-item-count {
            background-color: rgba(0, 0, 0, 0.1);
            color: rgba(0, 0, 0, 0.7);
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 10px;
            font-weight: 600;
          }

          .mobile-chat-list-empty {
            padding: 40px 20px;
            text-align: center;
          }

          .mobile-chat-list-empty p {
            color: rgba(100, 100, 100, 1);
            margin-bottom: 16px;
          }

          .mobile-chat-empty-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
          }

          .mobile-chat-create-first-button,
          .mobile-chat-join-first-button {
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            width: 140px;
          }

          .mobile-chat-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
          }

          .mobile-chat-conversation-header {
            background-color: rgba(255, 255, 255, 1);
            padding: 16px 20px;
            border-bottom: 1px solid rgba(240, 240, 240, 1);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .mobile-chat-conversation-name {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.87);
          }

          .mobile-chat-conversation-participants {
            margin: 0;
            font-size: 12px;
            color: rgba(100, 100, 100, 1);
          }

          .mobile-chat-share-button {
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }

          .mobile-chat-form-hint {
            font-size: 12px;
            color: rgba(100, 100, 100, 1);
            margin-top: 8px;
            line-height: 1.4;
          }

          .mobile-chat-share-code-display {
            text-align: center;
          }

          .mobile-chat-code-container {
            background-color: rgba(248, 249, 250, 1);
            border: 2px solid rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            padding: 24px;
            margin: 16px 0;
          }

          .mobile-chat-code {
            font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
            font-size: 28px;
            font-weight: 700;
            color: rgba(0, 0, 0, 1);
            letter-spacing: 2px;
            text-align: center;
          }

          .mobile-chat-code-inputs {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
          }

          .mobile-chat-code-input {
            width: 32px !important;
            height: 48px !important;
            border: 2px solid rgba(224, 224, 224, 1);
            border-radius: 8px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
            font-family: "SF Mono", "Monaco", "Consolas", monospace;
            background-color: rgba(255, 255, 255, 1);
            transition: all 0.2s ease;
            outline: none;
            color: rgba(0, 0, 0, 1);
          }

          .mobile-chat-code-input:focus {
            border-color: rgba(0, 0, 0, 1);
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
          }

          .mobile-chat-code-input:not(:placeholder-shown) {
            border-color: rgba(0, 150, 0, 1);
            background-color: rgba(240, 255, 240, 1);
          }

          .mobile-chat-dash {
            font-size: 20px;
            font-weight: 600;
            color: rgba(150, 150, 150, 1);
            margin: 0 4px;
            font-family: "SF Mono", "Monaco", "Consolas", monospace;
          }

          .mobile-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background-color: rgba(248, 249, 250, 1);
          }

          .mobile-chat-date-separator {
            text-align: center;
            margin: 16px 0;
            font-size: 12px;
            color: rgba(100, 100, 100, 1);
            position: relative;
          }

          .mobile-chat-date-separator::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background-color: rgba(224, 224, 224, 1);
            z-index: 1;
          }

          .mobile-chat-date-separator::after {
            content: attr(data-date);
            background-color: rgba(248, 249, 250, 1);
            padding: 0 12px;
            position: relative;
            z-index: 2;
          }

          .mobile-chat-message {
            margin-bottom: 12px;
            max-width: 70%;
          }

          .mobile-chat-message.own {
            margin-left: auto;
            text-align: right;
          }

          .mobile-chat-message.system {
            margin: 8px auto;
            text-align: center;
            max-width: 80%;
          }

          .mobile-chat-message-sender {
            font-size: 11px;
            color: rgba(100, 100, 100, 1);
            margin-bottom: 2px;
            font-weight: 600;
          }

          .mobile-chat-message-content {
            background-color: rgba(255, 255, 255, 1);
            padding: 10px 12px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }

          .mobile-chat-message.own .mobile-chat-message-content {
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
          }

          .mobile-chat-message.system .mobile-chat-message-content {
            background-color: rgba(240, 240, 240, 1);
            color: rgba(100, 100, 100, 1);
            font-style: italic;
            font-size: 12px;
          }

          .mobile-chat-message-time {
            font-size: 10px;
            color: rgba(150, 150, 150, 1);
            margin-top: 4px;
          }

          .mobile-chat-input-form {
            background-color: rgba(255, 255, 255, 1);
            padding: 16px 20px;
            border-top: 1px solid rgba(240, 240, 240, 1);
            display: flex;
            gap: 12px;
          }

          .mobile-chat-input {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid rgba(224, 224, 224, 1);
            border-radius: 20px;
            font-size: 14px;
            outline: none;
            font-family: inherit;
          }

          .mobile-chat-input:focus {
            border-color: rgba(0, 0, 0, 0.3);
          }

          .mobile-chat-send-button {
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 20px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .mobile-chat-send-button:hover:not(:disabled) {
            background-color: rgba(40, 40, 40, 1);
          }

          .mobile-chat-send-button:disabled {
            background-color: rgba(200, 200, 200, 1);
            cursor: not-allowed;
          }

          .mobile-chat-no-selection {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(248, 249, 250, 1);
          }

          .mobile-chat-no-selection-content {
            text-align: center;
          }

          .mobile-chat-no-selection-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .mobile-chat-no-selection-content h3 {
            margin: 0 0 8px 0;
            color: rgba(0, 0, 0, 0.87);
          }

          .mobile-chat-no-selection-content p {
            margin: 0;
            color: rgba(100, 100, 100, 1);
          }

          .mobile-chat-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 200px;
          }

          .mobile-chat-loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(240, 240, 240, 1);
            border-top: 3px solid rgba(0, 0, 0, 1);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          /* Modal Styles */
          .mobile-chat-modal-overlay {
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
          }

          .mobile-chat-modal {
            background-color: rgba(255, 255, 255, 1);
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            max-width: 500px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
          }

          .mobile-chat-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid rgba(240, 240, 240, 1);
          }

          .mobile-chat-modal-header h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
          }

          .mobile-chat-modal-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: rgba(150, 150, 150, 1);
          }

          .mobile-chat-modal-content {
            padding: 20px;
          }

          .mobile-chat-form-group {
            margin-bottom: 16px;
          }

          .mobile-chat-form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.87);
          }

          .mobile-chat-form-group input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid rgba(224, 224, 224, 1);
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            box-sizing: border-box;
          }

          .mobile-chat-add-participant {
            display: flex;
            gap: 8px;
          }

          .mobile-chat-add-participant input {
            flex: 1;
          }

          .mobile-chat-add-participant button {
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 14px;
            cursor: pointer;
          }

          .mobile-chat-participants-list {
            margin-top: 16px;
          }

          .mobile-chat-participants-list h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.87);
          }

          .mobile-chat-participant-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            background-color: rgba(248, 249, 250, 1);
            border-radius: 6px;
            margin-bottom: 4px;
          }

          .mobile-chat-remove-participant {
            background: none;
            border: none;
            color: rgba(244, 67, 54, 1);
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            width: 20px;
            height: 20px;
          }

          .mobile-chat-modal-actions {
            display: flex;
            gap: 12px;
            padding: 20px;
            border-top: 1px solid rgba(240, 240, 240, 1);
          }

          .mobile-chat-button-secondary {
            flex: 1;
            background-color: rgba(248, 249, 250, 1);
            color: rgba(0, 0, 0, 0.87);
            border: 1px solid rgba(224, 224, 224, 1);
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 14px;
            cursor: pointer;
          }

          .mobile-chat-button-primary {
            flex: 1;
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 14px;
            cursor: pointer;
          }

          .mobile-chat-button-primary:disabled {
            background-color: rgba(200, 200, 200, 1);
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .mobile-chat-content {
              flex-direction: column;
            }

            .mobile-chat-sidebar {
              width: 100%;
              height: 200px;
            }

            .mobile-chat-main {
              flex: 1;
            }

            .mobile-chat-modal {
              margin: 0;
              border-radius: 12px;
            }
          }

        `}</style>
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
  })(MobileChat)
);
