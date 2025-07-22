import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import swal from "sweetalert";
import {
  RideCard,
  Header,
  Route,
  RouteItem,
  RouteLabel,
  RouteLocation,
  RouteArrow,
  Status,
  StatusLooking,
  StatusMatched,
  Details,
  DetailItem,
  DetailIcon,
  DetailText,
  Notes,
  NotesLabel,
  NotesText,
  Actions,
  ShareButton,
  JoinButton,
  ShareIcon,
  JoinIcon,
  Spinner,
  ModalOverlay,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalIcon,
  ModalClose,
  ModalContent,
  ModalText,
  ShareCodeContainer,
  ShareCode,
  ModalNote,
  ModalActions,
  CopyButton,
  DoneButton,
} from "../styles/Ride";

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

  isCurrentUserDriver = () =>
    Meteor.user() && this.props.ride.driver === Meteor.user().username;

  canShareRide = () => {
    const { riders, seats } = this.props.ride;
    return this.isCurrentUserDriver() && riders.length < seats;
  };

  canJoinRide = () => {
    const { riders, seats } = this.props.ride;
    const currentUser = Meteor.user();
    return (
      !this.isCurrentUserDriver() &&
      riders.length < seats &&
      currentUser &&
      !riders.includes(currentUser.username)
    );
  };

  handleJoinRide = () => {
    const { ride } = this.props;

    this.setState({ isGenerating: true });
    Meteor.call("rides.join", ride._id, (error, result) => {
      this.setState({ isGenerating: false });
      if (error) {
        swal("Error", error.message, "error");
      } else {
        swal("Success", result.message, "success");
      }
    });
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

  formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
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
        <RideCard>
          <Header>
            <Route>
              <RouteItem>
                <RouteLabel>From</RouteLabel>
                <RouteLocation>{ride.origin}</RouteLocation>
              </RouteItem>
              <RouteArrow>→</RouteArrow>
              <RouteItem>
                <RouteLabel>To</RouteLabel>
                <RouteLocation>{ride.destination}</RouteLocation>
              </RouteItem>
            </Route>
            {/* Only show status if current user is not a rider */}
            {!(
              Meteor.user() && ride.riders.includes(Meteor.user().username)
            ) && (
              <Status>
                {ride.riders.length < ride.seats ? (
                  <StatusLooking>
                    {ride.seats - ride.riders.length} seat
                    {ride.seats - ride.riders.length !== 1 ? "s" : ""} available
                  </StatusLooking>
                ) : (
                  <StatusMatched>Ride full</StatusMatched>
                )}
              </Status>
            )}
          </Header>

          <Details>
            <DetailItem>
              <DetailIcon>📅</DetailIcon>
              <DetailText>{this.formatDate(ride.date)}</DetailText>
            </DetailItem>
            <DetailItem>
              <DetailIcon>🕒</DetailIcon>
              <DetailText>{this.formatTime(ride.date)}</DetailText>
            </DetailItem>
            <DetailItem>
              <DetailIcon>🚗</DetailIcon>
              <DetailText>{ride.driver}</DetailText>
            </DetailItem>
            <DetailItem>
              <DetailIcon>👥</DetailIcon>
              <DetailText>
                {ride.riders.length > 0
                  ? `${ride.riders.length}/${ride.seats} riders: ${ride.riders.join(", ")}`
                  : `0/${ride.seats} riders - None yet`}
              </DetailText>
            </DetailItem>
          </Details>

          {ride.notes && (
            <Notes>
              <NotesLabel>Notes:</NotesLabel>
              <NotesText>{ride.notes}</NotesText>
            </Notes>
          )}

          {(this.canShareRide() || this.canJoinRide()) && (
            <Actions>
              {this.canShareRide() && (
                <ShareButton
                  className={isGenerating ? "loading" : ""}
                  onClick={this.handleShareRide}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Spinner />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ShareIcon>🔗</ShareIcon>
                      {ride.shareCode ? "View Share Code" : "Share Ride"}
                    </>
                  )}
                </ShareButton>
              )}
              {this.canJoinRide() && (
                <JoinButton
                  className={isGenerating ? "loading" : ""}
                  onClick={this.handleJoinRide}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Spinner />
                      Joining...
                    </>
                  ) : (
                    <>
                      <JoinIcon>🚗</JoinIcon>
                      Request to Join
                    </>
                  )}
                </JoinButton>
              )}
            </Actions>
          )}
        </RideCard>

        {/* Modern Share Code Modal */}
        {shareModalOpen && (
          <ModalOverlay onClick={this.closeShareModal}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <ModalIcon>🔗</ModalIcon>
                  Share Your Ride
                </ModalTitle>
                <ModalClose onClick={this.closeShareModal}>✕</ModalClose>
              </ModalHeader>

              <ModalContent>
                <ModalText>
                  {isExistingCode ? (
                    <p>Here&apos;s your ride&apos;s existing share code:</p>
                  ) : (
                    <p>
                      Share this code with someone who wants to join your ride:
                    </p>
                  )}
                </ModalText>

                {shareCode && (
                  <ShareCodeContainer>
                    <ShareCode>{shareCode}</ShareCode>
                  </ShareCodeContainer>
                )}

                <ModalNote>
                  {isExistingCode
                    ? "This code was generated earlier and is still active."
                    : "This code is unique to your ride and will be removed once someone joins."}
                </ModalNote>
              </ModalContent>

              <ModalActions>
                <CopyButton onClick={this.generateInviteLink}>
                  📋 Copy Invite Link
                </CopyButton>
                <DoneButton onClick={this.closeShareModal}>✓ Done</DoneButton>
              </ModalActions>
            </Modal>
          </ModalOverlay>
        )}
      </>
    );
  }
}

MobileRide.propTypes = {
  ride: PropTypes.object.isRequired,
};

export default withRouter(MobileRide);
