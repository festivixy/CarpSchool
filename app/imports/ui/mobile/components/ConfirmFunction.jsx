import React from "react";
import PropTypes from "prop-types";
import {
  ModalOverlay,
  Modal,
  Header,
  CloseButton,
  Title,
  Subtitle,
  Content,
  Actions,
  ButtonPrimary,
  ButtonSecondary,
  LoadingSpinner,
  ErrorMessage,
} from "../styles/ConfirmFunction";

/**
 * ConfirmFunction - A reusable confirmation modal component
 *
 * Displays a modal overlay with customizable title and subtitle,
 * executes an async function when confirmed, and returns boolean result.
 */
class ConfirmFunction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExecuting: false,
      error: null,
    };
  }

  componentDidMount() {
    // Add event listener for escape key
    document.addEventListener("keydown", this.handleEscapeKey);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleEscapeKey);
    // Restore body scroll
    document.body.style.overflow = "unset";
  }

  handleEscapeKey = (event) => {
    if (event.key === "Escape") {
      this.handleCancel();
    }
  };

  handleCancel = () => {
    const { onResult, onClose } = this.props;

    // Return false when cancelled
    if (onResult) {
      onResult(false);
    }

    if (onClose) {
      onClose();
    }
  };

  handleConfirm = async () => {
    const { asyncFunction, onResult, onClose } = this.props;

    if (!asyncFunction) {
      // If no function provided, just return true
      if (onResult) {
        onResult(true);
      }
      if (onClose) {
        onClose();
      }
      return;
    }

    this.setState({ isExecuting: true, error: null });

    try {
      // Execute the async function
      const result = await asyncFunction();

      // Return the boolean result (ensure it's always a boolean)
      const booleanResult = Boolean(result);

      if (onResult) {
        onResult(booleanResult);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      // Handle error case
      this.setState({
        error: error.message || error.reason || "An error occurred",
        isExecuting: false,
      });

      // Don't close modal on error, let user retry or cancel
      console.error("ConfirmFunction async execution failed:", error);
    }
  };

  handleOverlayClick = (event) => {
    // Close modal if clicking on overlay (not modal content)
    if (event.target === event.currentTarget) {
      this.handleCancel();
    }
  };

  render() {
    const { title, subtitle, confirmText, cancelText, isDestructive } = this.props;
    const { isExecuting, error } = this.state;

    return (
      <ModalOverlay onClick={this.handleOverlayClick}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <Header>
            <CloseButton
              onClick={this.handleCancel}
              disabled={isExecuting}
              aria-label="Close"
            >
              ✕
            </CloseButton>
            <Title>{title}</Title>
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </Header>

          <Content>
            {error && (
              <ErrorMessage>
                {error}
              </ErrorMessage>
            )}
          </Content>

          <Actions>
            <ButtonSecondary
              onClick={this.handleCancel}
              disabled={isExecuting}
            >
              {cancelText || "Cancel"}
            </ButtonSecondary>

            <ButtonPrimary
              onClick={this.handleConfirm}
              disabled={isExecuting}
              destructive={isDestructive}
            >
              {isExecuting ? (
                <>
                  <LoadingSpinner />
                  Processing...
                </>
              ) : (
                confirmText || "Confirm"
              )}
            </ButtonPrimary>
          </Actions>
        </Modal>
      </ModalOverlay>
    );
  }
}

ConfirmFunction.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isDestructive: PropTypes.bool, // Changes confirm button to red for destructive actions
  asyncFunction: PropTypes.func, // The async function to execute on confirm
  onResult: PropTypes.func, // Callback with boolean result (true/false)
  onClose: PropTypes.func, // Callback when modal closes
};

ConfirmFunction.defaultProps = {
  subtitle: null,
  confirmText: "Confirm",
  cancelText: "Cancel",
  isDestructive: false,
  asyncFunction: null,
  onResult: null,
  onClose: null,
};

export default ConfirmFunction;
