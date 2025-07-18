import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";

/**
 * Modern Mobile JoinRideModal component with clean design and smooth interactions
 */
class MobileJoinRideModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      codeInputs: ["", "", "", "", "", "", "", ""], // 8 separate inputs
      isJoining: false,
      error: null,
      success: false,
    };
    this.inputRefs = [];
  }

  componentDidMount() {
    this.prefillCodeIfProvided();
    // Add event listener for escape key
    document.addEventListener("keydown", this.handleEscapeKey);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleEscapeKey);
  }

  componentDidUpdate(prevProps) {
    // If prefillCode prop changed, update the inputs
    if (prevProps.prefillCode !== this.props.prefillCode) {
      this.prefillCodeIfProvided();
    }

    // Focus first input when modal opens
    if (!prevProps.open && this.props.open) {
      setTimeout(() => {
        if (this.inputRefs[0]) {
          this.inputRefs[0].focus();
        }
      }, 100);
    }
  }

  handleEscapeKey = (e) => {
    if (e.key === "Escape" && this.props.open) {
      this.handleClose();
    }
  };

  prefillCodeIfProvided = () => {
    const { prefillCode } = this.props;
    if (prefillCode && prefillCode.length >= 8) {
      // Remove dash and take first 8 characters
      const cleanCode = prefillCode.replace(/-/g, "").slice(0, 8);
      const newInputs = ["", "", "", "", "", "", "", ""];

      for (let i = 0; i < cleanCode.length && i < 8; i++) {
        newInputs[i] = cleanCode[i].toUpperCase();
      }

      this.setState({ codeInputs: newInputs, error: null });
    }
  };

  handleInputChange = (index, e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (value.length <= 1) {
      const newInputs = [...this.state.codeInputs];
      newInputs[index] = value;
      this.setState({ codeInputs: newInputs, error: null });

      // Auto-advance to next input if character was entered
      if (value.length === 1 && index < 7) {
        setTimeout(() => {
          if (this.inputRefs[index + 1]) {
            this.inputRefs[index + 1].focus();
          }
        }, 50);
      }
    }
  };

  handleKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (
      e.key === "Backspace" &&
      this.state.codeInputs[index] === "" &&
      index > 0
    ) {
      setTimeout(() => {
        if (this.inputRefs[index - 1]) {
          this.inputRefs[index - 1].focus();
        }
      }, 50);
    }
  };

  handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (pastedText.length <= 8) {
      const newInputs = ["", "", "", "", "", "", "", ""];
      for (let i = 0; i < pastedText.length; i++) {
        newInputs[i] = pastedText[i];
      }
      this.setState({ codeInputs: newInputs, error: null });

      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedText.length, 7);
      setTimeout(() => {
        if (this.inputRefs[nextIndex]) {
          this.inputRefs[nextIndex].focus();
        }
      }, 50);
    }
  };

  handleJoinRide = () => {
    const shareCode = this.state.codeInputs.join("");

    if (shareCode.length !== 8) {
      this.setState({ error: "Please enter all 8 characters of the code" });
      return;
    }

    // Format as XXXX-XXXX for server
    const formattedCode = `${shareCode.slice(0, 4)}-${shareCode.slice(4)}`;

    this.setState({ isJoining: true, error: null });

    Meteor.call("rides.joinWithCode", formattedCode, (error, result) => {
      this.setState({ isJoining: false });

      if (error) {
        this.setState({ error: error.message });
      } else {
        this.setState({
          success: true,
          error: null,
        });

        // Show success for 2 seconds then close
        setTimeout(() => {
          this.handleClose();
        }, 2000);
      }
    });
  };

  handleClose = () => {
    this.setState({
      codeInputs: ["", "", "", "", "", "", "", ""],
      error: null,
      success: false,
      isJoining: false,
    });
    this.props.onClose();
  };

  handleTryAgain = () => {
    this.setState({
      success: false,
      error: null,
      codeInputs: ["", "", "", "", "", "", "", ""],
    });
    setTimeout(() => {
      if (this.inputRefs[0]) {
        this.inputRefs[0].focus();
      }
    }, 100);
  };

  render() {
    const { open } = this.props;
    const { codeInputs, isJoining, error, success } = this.state;

    if (!open) return null;

    const isComplete = codeInputs.every((input) => input.length === 1);

    return (
      <div className="mobile-join-modal-overlay" onClick={this.handleClose}>
        <div className="mobile-join-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="mobile-join-modal-header">
            <button
              className="mobile-join-modal-close"
              onClick={this.handleClose}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="mobile-join-modal-title">Join a Ride</h2>
            <div className="mobile-join-modal-subtitle">
              Enter the 8-character code shared by the driver
            </div>
          </div>

          {/* Content */}
          <div className="mobile-join-modal-content">
            {success ? (
              <div className="mobile-join-modal-success">
                <div className="mobile-join-modal-success-icon">✓</div>
                <h3 className="mobile-join-modal-success-title">
                  Successfully Joined!
                </h3>
                <p className="mobile-join-modal-success-message">
                  You have been added to the ride. Check your rides page for
                  details.
                </p>
              </div>
            ) : (
              <>
                {/* Code Input Section */}
                <div className="mobile-join-modal-input-section">
                  <div className="mobile-join-modal-code-inputs">
                    {codeInputs.map((value, index) => (
                      <React.Fragment key={index}>
                        <input
                          ref={(ref) => {
                            this.inputRefs[index] = ref;
                          }}
                          value={value}
                          onChange={(e) => this.handleInputChange(index, e)}
                          onKeyDown={(e) => this.handleKeyDown(index, e)}
                          onPaste={index === 0 ? this.handlePaste : undefined}
                          className="mobile-join-modal-code-input"
                          maxLength={1}
                          type="text"
                          inputMode="alphanumeric"
                          autoCapitalize="characters"
                          autoComplete="off"
                          spellCheck="false"
                        />
                        {index === 3 && (
                          <span className="mobile-join-modal-dash">-</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {error && (
                    <div className="mobile-join-modal-error">{error}</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mobile-join-modal-actions">
                  <button
                    className="mobile-join-modal-button-secondary"
                    onClick={this.handleClose}
                    disabled={isJoining}
                  >
                    Cancel
                  </button>
                  <button
                    className="mobile-join-modal-button-primary"
                    onClick={this.handleJoinRide}
                    disabled={isJoining || !isComplete}
                  >
                    {isJoining ? "Joining..." : "Join Ride"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <style jsx>{`
          .mobile-join-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
            backdrop-filter: blur(4px);
          }

          .mobile-join-modal {
            background-color: rgba(255, 255, 255, 1);
            border-radius: 16px;
            max-width: 400px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            font-family:
              Inter,
              -apple-system,
              Roboto,
              Helvetica,
              sans-serif;
            animation: modalSlideIn 0.3s ease-out;
          }

          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .mobile-join-modal-header {
            padding: 24px 24px 16px 24px;
            border-bottom: 1px solid rgba(240, 240, 240, 1);
            position: relative;
            text-align: center;
          }

          .mobile-join-modal-close {
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
          }

          .mobile-join-modal-close:hover {
            background-color: rgba(240, 240, 240, 1);
            color: rgba(0, 0, 0, 1);
          }

          .mobile-join-modal-title {
            font-size: 20px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            margin: 0 0 8px 0;
            letter-spacing: -0.3px;
          }

          .mobile-join-modal-subtitle {
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
            margin: 0;
            line-height: 1.4;
          }

          .mobile-join-modal-content {
            padding: 24px;
          }

          .mobile-join-modal-input-section {
            margin-bottom: 32px;
          }

          .mobile-join-modal-code-inputs {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
          }

          .mobile-join-modal-code-input {
            width: 32px;
            height: 48px;
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

          .mobile-join-modal-code-input:focus {
            border-color: rgba(0, 0, 0, 1);
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
          }

          .mobile-join-modal-code-input:not(:placeholder-shown) {
            border-color: rgba(0, 150, 0, 1);
            background-color: rgba(240, 255, 240, 1);
          }

          .mobile-join-modal-dash {
            font-size: 20px;
            font-weight: 600;
            color: rgba(150, 150, 150, 1);
            margin: 0 4px;
            font-family: "SF Mono", "Monaco", "Consolas", monospace;
          }

          .mobile-join-modal-error {
            background-color: rgba(255, 240, 240, 1);
            border: 1px solid rgba(255, 200, 200, 1);
            border-radius: 8px;
            padding: 12px 16px;
            color: rgba(200, 0, 0, 1);
            font-size: 14px;
            text-align: center;
            margin-top: 16px;
          }

          .mobile-join-modal-success {
            text-align: center;
            padding: 20px 0;
          }

          .mobile-join-modal-success-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background-color: rgba(0, 200, 0, 1);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin: 0 auto 20px auto;
            animation: successPulse 0.6s ease-out;
          }

          @keyframes successPulse {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          .mobile-join-modal-success-title {
            font-size: 18px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            margin: 0 0 8px 0;
          }

          .mobile-join-modal-success-message {
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
            line-height: 1.4;
            margin: 0;
          }

          .mobile-join-modal-actions {
            display: flex;
            gap: 12px;
            margin-top: 8px;
          }

          .mobile-join-modal-button-primary {
            flex: 1;
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 12px;
            padding: 14px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          .mobile-join-modal-button-primary:hover:not(:disabled) {
            background-color: rgba(40, 40, 40, 1);
            transform: translateY(-1px);
          }

          .mobile-join-modal-button-primary:disabled {
            background-color: rgba(200, 200, 200, 1);
            color: rgba(150, 150, 150, 1);
            cursor: not-allowed;
            transform: none;
          }

          .mobile-join-modal-button-secondary {
            flex: 1;
            background-color: rgba(245, 245, 245, 1);
            color: rgba(100, 100, 100, 1);
            border: none;
            border-radius: 12px;
            padding: 14px 24px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          .mobile-join-modal-button-secondary:hover:not(:disabled) {
            background-color: rgba(230, 230, 230, 1);
            color: rgba(0, 0, 0, 1);
          }

          .mobile-join-modal-button-secondary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          @media (max-width: 480px) {
            .mobile-join-modal {
              margin: 10px;
              border-radius: 12px;
            }

            .mobile-join-modal-code-input {
              width: 28px;
              height: 44px;
              font-size: 16px;
            }

            .mobile-join-modal-code-inputs {
              gap: 6px;
            }

            .mobile-join-modal-actions {
              flex-direction: column;
            }

            .mobile-join-modal-button-primary,
            .mobile-join-modal-button-secondary {
              flex: none;
            }
          }
        `}</style>
      </div>
    );
  }
}

MobileJoinRideModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  prefillCode: PropTypes.string,
};

export default MobileJoinRideModal;
