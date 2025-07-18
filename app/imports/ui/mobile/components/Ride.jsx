import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import swal from "sweetalert";

/** Modern mobile Ride component with clean design and join functionality */
class MobileRide extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shareModalOpen: false,
      shareCode: null,
      isGenerating: false,
      isExistingCode: false,
    };
  }

  handleShareRide = () => {
    this.setState({ isGenerating: true });

    // Check if ride already has a share code
    const existingCode = this.props.ride.shareCode;

    Meteor.call(
      "rides.generateShareCode",
      this.props.ride._id,
      (error, result) => {
        this.setState({ isGenerating: false });
        if (error) {
          swal("Error", error.message, "error");
        } else {
          this.setState({
            shareCode: result,
            shareModalOpen: true,
            isExistingCode: !!existingCode && existingCode === result,
          });
        }
      },
    );
  };

  closeShareModal = () => {
    this.setState({
      shareModalOpen: false,
      shareCode: null,
      isExistingCode: false,
    });
  };

  generateInviteLink = () => {
    const { shareCode } = this.state;
    if (shareCode) {
      // eslint-disable-next-line no-undef
      const inviteLink = `${window.location.origin}/#/imRiding?code=${shareCode.replace("-", "")}`;

      // Copy to clipboard
      // eslint-disable-next-line no-undef
      if (navigator.clipboard) {
        // eslint-disable-next-line no-undef
        navigator.clipboard
          .writeText(inviteLink)
          .then(() => {
            swal(
              "Link Copied!",
              "The invite link has been copied to your clipboard.",
              "success",
            );
          })
          .catch(() => {
            // Fallback if clipboard API fails
            this.fallbackCopyToClipboard(inviteLink);
          });
      } else {
        // Fallback for older browsers
        this.fallbackCopyToClipboard(inviteLink);
      }
    }
  };

  fallbackCopyToClipboard = (text) => {
    // eslint-disable-next-line no-undef
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    // eslint-disable-next-line no-undef
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      // eslint-disable-next-line no-undef
      document.execCommand("copy");
      swal(
        "Link Copied!",
        "The invite link has been copied to your clipboard.",
        "success",
      );
    } catch (err) {
      swal("Copy Failed", `Please manually copy the link: ${text}`, "error");
    }

    // eslint-disable-next-line no-undef
    document.body.removeChild(textArea);
  };

  isCurrentUserDriver = () => Meteor.user() && this.props.ride.driver === Meteor.user().username;

  canShareRide = () => {
    const rider = this.props.ride.rider;
    return this.isCurrentUserDriver() && rider === "TBD";
  };

  canJoinRide = () => {
    const rider = this.props.ride.rider;
    return !this.isCurrentUserDriver() && rider === "TBD";
  };

  handleJoinRide = () => {
    const { ride } = this.props;
    if (ride.shareCode) {
      // If ride already has a share code, use it to join
      this.joinWithCode(ride.shareCode);
    } else {
      // Generate a share code first, then join
      this.setState({ isGenerating: true });
      Meteor.call("rides.generateShareCode", ride._id, (error, result) => {
        this.setState({ isGenerating: false });
        if (error) {
          swal("Error", error.message, "error");
        } else {
          this.joinWithCode(result);
        }
      });
    }
  };

  joinWithCode = (shareCode) => {
    // Call the join ride method
    Meteor.call("rides.joinRide", shareCode, (error) => {
      if (error) {
        swal("Error", error.reason || error.message, "error");
      } else {
        swal("Success!", "You have successfully joined the ride!", "success");
      }
    });
  };

  formatDate = (date) => new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  formatTime = (date) => new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  render() {
    const { shareModalOpen, shareCode, isGenerating, isExistingCode } =
      this.state;
    const { ride } = this.props;

    return (
      <>
        <div className="mobile-ride-card">
          <div className="mobile-ride-header">
            <div className="mobile-ride-route">
              <div className="mobile-ride-route-item">
                <span className="mobile-ride-route-label">From</span>
                <span className="mobile-ride-route-location">
                  {ride.origin}
                </span>
              </div>
              <div className="mobile-ride-route-arrow">→</div>
              <div className="mobile-ride-route-item">
                <span className="mobile-ride-route-label">To</span>
                <span className="mobile-ride-route-location">
                  {ride.destination}
                </span>
              </div>
            </div>
            {/* Only show status if current user is not the rider */}
            {!(Meteor.user() && ride.rider === Meteor.user().username) && (
              <div className="mobile-ride-status">
                {ride.rider === "TBD" ? (
                  <span className="mobile-ride-status-looking">
                    Looking for rider
                  </span>
                ) : (
                  <span className="mobile-ride-status-matched">
                    Rider found
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mobile-ride-details">
            <div className="mobile-ride-detail-item">
              <span className="mobile-ride-detail-icon">📅</span>
              <span className="mobile-ride-detail-text">
                {this.formatDate(ride.date)}
              </span>
            </div>
            <div className="mobile-ride-detail-item">
              <span className="mobile-ride-detail-icon">🕒</span>
              <span className="mobile-ride-detail-text">
                {this.formatTime(ride.date)}
              </span>
            </div>
            <div className="mobile-ride-detail-item">
              <span className="mobile-ride-detail-icon">🚗</span>
              <span className="mobile-ride-detail-text">{ride.driver}</span>
            </div>
            <div className="mobile-ride-detail-item">
              <span className="mobile-ride-detail-icon">👤</span>
              <span className="mobile-ride-detail-text">
                {ride.rider === "TBD" ? "No rider yet" : ride.rider}
              </span>
            </div>
          </div>

          {ride.notes && (
            <div className="mobile-ride-notes">
              <span className="mobile-ride-notes-label">Notes:</span>
              <span className="mobile-ride-notes-text">{ride.notes}</span>
            </div>
          )}

          {(this.canShareRide() || this.canJoinRide()) && (
            <div className="mobile-ride-actions">
              {this.canShareRide() && (
                <button
                  className={`mobile-ride-share-button ${isGenerating ? "loading" : ""}`}
                  onClick={this.handleShareRide}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="mobile-ride-spinner"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="mobile-ride-share-icon">🔗</span>
                      {ride.shareCode ? "View Share Code" : "Share Ride"}
                    </>
                  )}
                </button>
              )}
              {this.canJoinRide() && (
                <button
                  className={`mobile-ride-join-button ${isGenerating ? "loading" : ""}`}
                  onClick={this.handleJoinRide}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="mobile-ride-spinner"></span>
                      Joining...
                    </>
                  ) : (
                    <>
                      <span className="mobile-ride-join-icon">🚗</span>
                      Request to Join
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modern Share Code Modal */}
        {shareModalOpen && (
          <div
            className="mobile-share-modal-overlay"
            onClick={this.closeShareModal}
          >
            <div
              className="mobile-share-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-share-modal-header">
                <h2 className="mobile-share-modal-title">
                  <span className="mobile-share-modal-icon">🔗</span>
                  Share Your Ride
                </h2>
                <button
                  className="mobile-share-modal-close"
                  onClick={this.closeShareModal}
                >
                  ✕
                </button>
              </div>

              <div className="mobile-share-modal-content">
                <div className="mobile-share-modal-text">
                  {isExistingCode ? (
                    <p>Here&apos;s your ride&apos;s existing share code:</p>
                  ) : (
                    <p>
                      Share this code with someone who wants to join your ride:
                    </p>
                  )}
                </div>

                {shareCode && (
                  <div className="mobile-share-code-container">
                    <div className="mobile-share-code">{shareCode}</div>
                  </div>
                )}

                <div className="mobile-share-modal-note">
                  {isExistingCode
                    ? "This code was generated earlier and is still active."
                    : "This code is unique to your ride and will be removed once someone joins."}
                </div>
              </div>

              <div className="mobile-share-modal-actions">
                <button
                  className="mobile-share-copy-button"
                  onClick={this.generateInviteLink}
                >
                  📋 Copy Invite Link
                </button>
                <button
                  className="mobile-share-done-button"
                  onClick={this.closeShareModal}
                >
                  ✓ Done
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .mobile-ride-card {
            background-color: rgba(255, 255, 255, 1);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(240, 240, 240, 1);
            transition: all 0.2s ease;
            font-family:
              Inter,
              -apple-system,
              Roboto,
              Helvetica,
              sans-serif;
            max-width: 400px;
            margin: 0 auto;
          }

          .mobile-ride-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
          }

          .mobile-ride-header {
            margin-bottom: 16px;
          }

          .mobile-ride-route {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
          }

          .mobile-ride-route-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .mobile-ride-route-label {
            font-size: 12px;
            color: rgba(150, 150, 150, 1);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .mobile-ride-route-location {
            font-size: 16px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
          }

          .mobile-ride-route-arrow {
            font-size: 20px;
            color: rgba(0, 0, 0, 0.6);
            margin: 0 8px;
          }

          .mobile-ride-status {
            text-align: center;
          }

          .mobile-ride-status-looking {
            background-color: rgba(255, 193, 7, 0.1);
            color: rgba(255, 133, 27, 1);
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .mobile-ride-status-matched {
            background-color: rgba(76, 175, 80, 0.1);
            color: rgba(56, 142, 60, 1);
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .mobile-ride-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }

          .mobile-ride-detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .mobile-ride-detail-icon {
            font-size: 16px;
            width: 20px;
            text-align: center;
          }

          .mobile-ride-detail-text {
            font-size: 14px;
            color: rgba(60, 60, 60, 1);
          }

          .mobile-ride-notes {
            background-color: rgba(248, 249, 250, 1);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
          }

          .mobile-ride-notes-label {
            font-size: 12px;
            font-weight: 600;
            color: rgba(100, 100, 100, 1);
            display: block;
            margin-bottom: 4px;
          }

          .mobile-ride-notes-text {
            font-size: 14px;
            color: rgba(60, 60, 60, 1);
            line-height: 1.4;
          }

          .mobile-ride-actions {
            display: flex;
            gap: 12px;
          }

          .mobile-ride-share-button,
          .mobile-ride-join-button {
            flex: 1;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .mobile-ride-share-button {
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
          }

          .mobile-ride-join-button {
            background-color: rgba(76, 175, 80, 1);
            color: rgba(255, 255, 255, 1);
          }

          .mobile-ride-share-button:hover:not(:disabled) {
            background-color: rgba(40, 40, 40, 1);
            transform: translateY(-1px);
          }

          .mobile-ride-join-button:hover:not(:disabled) {
            background-color: rgba(56, 142, 60, 1);
            transform: translateY(-1px);
          }

          .mobile-ride-share-button:disabled,
          .mobile-ride-join-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .mobile-ride-share-button.loading,
          .mobile-ride-join-button.loading {
            opacity: 0.8;
          }

          .mobile-ride-share-icon,
          .mobile-ride-join-icon {
            font-size: 16px;
          }

          .mobile-ride-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid rgba(255, 255, 255, 1);
            border-radius: 50%;
            animation: spin 1s linear infinite;
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
          .mobile-share-modal-overlay {
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
            box-sizing: border-box;
          }

          .mobile-share-modal {
            background-color: rgba(255, 255, 255, 1);
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideIn 0.3s ease-out;
          }

          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .mobile-share-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 24px 16px;
            border-bottom: 1px solid rgba(240, 240, 240, 1);
          }

          .mobile-share-modal-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 20px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            margin: 0;
          }

          .mobile-share-modal-icon {
            font-size: 24px;
          }

          .mobile-share-modal-close {
            background: none;
            border: none;
            font-size: 24px;
            color: rgba(150, 150, 150, 1);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
          }

          .mobile-share-modal-close:hover {
            background-color: rgba(240, 240, 240, 1);
            color: rgba(0, 0, 0, 1);
          }

          .mobile-share-modal-content {
            padding: 24px;
            text-align: center;
          }

          .mobile-share-modal-text {
            margin-bottom: 24px;
          }

          .mobile-share-modal-text p {
            font-size: 16px;
            color: rgba(60, 60, 60, 1);
            margin: 0;
            line-height: 1.5;
          }

          .mobile-share-code-container {
            background-color: rgba(248, 249, 250, 1);
            border: 2px solid rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 16px;
          }

          .mobile-share-code {
            font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
            font-size: 32px;
            font-weight: 700;
            color: rgba(0, 0, 0, 1);
            letter-spacing: 4px;
            text-align: center;
          }

          .mobile-share-modal-note {
            font-size: 14px;
            color: rgba(100, 100, 100, 1);
            line-height: 1.4;
            margin-bottom: 24px;
          }

          .mobile-share-modal-actions {
            display: flex;
            gap: 12px;
            padding: 16px 24px 24px;
          }

          .mobile-share-copy-button,
          .mobile-share-done-button {
            flex: 1;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          .mobile-share-copy-button {
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
          }

          .mobile-share-copy-button:hover {
            background-color: rgba(40, 40, 40, 1);
            transform: translateY(-1px);
          }

          .mobile-share-done-button {
            background-color: rgba(248, 249, 250, 1);
            color: rgba(0, 0, 0, 1);
            border: 1px solid rgba(224, 224, 224, 1);
          }

          .mobile-share-done-button:hover {
            background-color: rgba(240, 240, 240, 1);
            transform: translateY(-1px);
          }

          @media (max-width: 480px) {
            .mobile-ride-details {
              grid-template-columns: 1fr;
              gap: 8px;
            }

            .mobile-ride-route {
              flex-direction: column;
              align-items: stretch;
              gap: 8px;
            }

            .mobile-ride-route-arrow {
              align-self: center;
              transform: rotate(90deg);
              margin: 4px 0;
            }

            .mobile-share-modal {
              margin: 0;
              border-radius: 12px;
            }

            .mobile-share-modal-actions {
              flex-direction: column;
            }

            .mobile-share-code {
              font-size: 24px;
              letter-spacing: 2px;
            }
          }
        `}</style>
      </>
    );
  }
}

MobileRide.propTypes = {
  ride: PropTypes.object.isRequired,
};

export default withRouter(MobileRide);
