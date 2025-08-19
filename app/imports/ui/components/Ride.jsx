import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import swal from "sweetalert";
import { Places } from "../../api/places/Places";
import { RideSessions } from "../../api/rideSession/RideSession";
import RouteMapView from "./RouteMapView";
import { getCurrentLocation } from "../utils/geolocation";
import { MobileOnly, DesktopOnly } from "../layouts/Devices";
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
  ChatButton,
  StartRideButton,
  ConfirmPickupButton,
  ShowCodeButton,
  MapButton,
  ShareIcon,
  JoinIcon,
  ChatIcon,
  StartRideIcon,
  ConfirmPickupIcon,
  ShowCodeIcon,
  MapIcon,
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
  PickupOverlay,
  PickupModal,
  PickupModalHeader,
  PickupModalTitle,
  RiderList,
  RiderItem,
  RiderName,
  RiderStatus,
  CodeInputSection,
  CodeDisplay,
  CodeDigit,
  CodeInput,
  VerifyButton,
  CodeModalContent,
  FullCodeDisplay,
  CodeInstructions,
} from "../styles/Ride";

/** Ride component with clean design and join functionality */
class Ride extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shareModalOpen: false,
      shareCode: null,
      isGenerating: false,
      isExistingCode: false,
      mapModalOpen: false,
      pickupModalOpen: false,
      codeModalOpen: false,
      selectedRiderId: null,
      codeInput: "",
      verifyingCode: false,
      riderCodes: {}, // Store code hints for riders
      fullCode: null, // For rider's code display
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
      const inviteLink = `${window.location.origin}/#/myRides?code=${shareCode.replace("-", "")}`;

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

  getPlaceName = (placeId) => {
    const place = this.props.places.find((p) => p._id === placeId);
    return place ? place.text : placeId; // Fallback to ID if place not found
  };

  canShareRide = () => {
    const { riders, seats, rider } = this.props.ride;
    // Handle new schema
    if (riders !== undefined && seats !== undefined) {
      return this.isCurrentUserDriver() && riders.length < seats;
    }
    // Handle legacy schema
    return this.isCurrentUserDriver() && rider === "TBD";
  };

  canJoinRide = () => {
    const { riders, seats, rider } = this.props.ride;
    const currentUser = Meteor.user();
    // Handle new schema
    if (riders !== undefined && seats !== undefined) {
      return (
        !this.isCurrentUserDriver() &&
        riders.length < seats &&
        currentUser &&
        !riders.includes(currentUser.username)
      );
    }
    // Handle legacy schema
    return !this.isCurrentUserDriver() && rider === "TBD";
  };

  canAccessChat = () => {
    const { riders, rider } = this.props.ride;
    const currentUser = Meteor.user();
    if (!currentUser) return false;

    // Driver can always access chat
    if (this.isCurrentUserDriver()) {
      return true;
    }

    // Handle new schema - check if user is a rider
    if (riders !== undefined) {
      return riders.includes(currentUser.username);
    }

    // Handle legacy schema - check if user is the rider
    return rider === currentUser.username;
  };

  canStartRide = () => {
    const { ride, rideSessions } = this.props;
    const currentUser = Meteor.user();

    // Must be the driver
    if (!this.isCurrentUserDriver()) {
      return false;
    }

    // Check if ride already has a session
    const existingSession = rideSessions.find(session => session.rideId === ride._id);
    if (existingSession) {
      return false;
    }

    // Check if ride is in the future (upcoming ride)
    const now = new Date();
    const rideDate = new Date(ride.date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const rideDateOnly = new Date(rideDate.getFullYear(), rideDate.getMonth(), rideDate.getDate());

    return rideDateOnly >= today;
  };

  handleStartRide = () => {
    const { ride } = this.props;

    this.setState({ isGenerating: true });

    // Get riders for the session
    const riders = ride.riders && Array.isArray(ride.riders) ? ride.riders : [];

    Meteor.call("rideSessions.create", ride._id, Meteor.userId(), riders, (error, sessionId) => {
      this.setState({ isGenerating: false });
      if (error) {
        swal("Error", error.reason || error.message, "error");
      } else {
        swal("Success", "Ride session created successfully! You can now start tracking your ride.", "success");
      }
    });
  };

  canStartActiveRide = () => {
    const { ride, rideSessions } = this.props;

    // Must be the driver
    if (!this.isCurrentUserDriver()) {
      return false;
    }

    // Find the session for this ride
    const session = rideSessions.find(session =>
      session.rideId === ride._id &&
      !session.finished
    );

    if (!session) {
      return false;
    }

    // Can start if session is created but not yet started
    return session.status === "created" && !session.timeline.started;
  };

  canConfirmPickup = () => {
    const { ride, rideSessions } = this.props;

    // Must be the driver
    if (!this.isCurrentUserDriver()) {
      return false;
    }

    // Find the active session for this ride
    const session = rideSessions.find(session =>
      session.rideId === ride._id &&
      session.status === "active" &&
      !session.finished
    );

    if (!session) {
      return false;
    }

    // Check if there are unpicked riders
    const unpickedRiders = session.riders.filter(riderId => {
      const progress = session.progress[riderId];
      return progress && !progress.pickedUp && !progress.codeError;
    });

    return unpickedRiders.length > 0;
  };

  canShowCode = () => {
    const { ride, rideSessions } = this.props;
    const currentUser = Meteor.user();

    if (!currentUser) return false;

    // Find the active session for this ride
    const session = rideSessions.find(session =>
      session.rideId === ride._id &&
      (session.status === "active" || session.status === "created") &&
      !session.finished
    );

    if (!session) {
      return false;
    }

    // User must be a rider in this session
    return session.riders.includes(currentUser._id);
  };

  handleStartActiveRide = async () => {
    const sessionId = this.getSessionId();
    if (!sessionId) return;

    this.setState({ isGenerating: true });

    try {
      // Get current location
      const location = await getCurrentLocation();

      // Start the ride session
      Meteor.call("rideSessions.start", sessionId, location, (error) => {
        this.setState({ isGenerating: false });
        if (error) {
          swal("Error", error.reason || error.message, "error");
        } else {
          swal("Success!", "Ride started successfully! You can now confirm rider pickups.", "success");
        }
      });
    } catch (error) {
      this.setState({ isGenerating: false });
      swal("Error", "Failed to get location: " + error.message, "error");
    }
  };

  handleShowCode = () => {
    const { ride } = this.props;
    const currentUser = Meteor.user();

    if (!currentUser) return;

    Meteor.call("rideSessions.getPickupCodeHint", this.getSessionId(), currentUser._id, (error, result) => {
      if (error) {
        swal("Error", error.reason || error.message, "error");
      } else {
        this.setState({
          codeModalOpen: true,
          fullCode: result.fullCode
        });
      }
    });
  };

  getSessionId = () => {
    const { ride, rideSessions } = this.props;
    const session = rideSessions.find(session =>
      session.rideId === ride._id &&
      !session.finished
    );
    return session ? session._id : null;
  };

  getUsernameFromId = (userId) => {
    // This would ideally come from a subscription, but for now we'll use the current user
    // In a real app, you'd want to subscribe to user data or have usernames in the session
    if (userId === Meteor.userId()) {
      return Meteor.user()?.username || userId;
    }
    return userId; // Fallback to ID if username not available
  };



  handleConfirmPickup = () => {
    this.setState({ pickupModalOpen: true });
    this.loadRiderCodes();
  };

  loadRiderCodes = () => {
    const sessionId = this.getSessionId();
    if (!sessionId) return;

    const { rideSessions } = this.props;
    const session = rideSessions.find(s => s._id === sessionId);
    if (!session) return;

    const riderCodes = {};
    session.riders.forEach(riderId => {
      Meteor.call("rideSessions.getPickupCodeHint", sessionId, riderId, (error, result) => {
        if (!error && result) {
          this.setState(prev => ({
            riderCodes: {
              ...prev.riderCodes,
              [riderId]: result
            }
          }));
        }
      });
    });
  };

  handleRiderSelect = (riderId) => {
    this.setState({
      selectedRiderId: riderId,
      codeInput: ""
    });
  };

  handleCodeVerification = () => {
    const { selectedRiderId, codeInput } = this.state;
    const sessionId = this.getSessionId();

    if (!sessionId || !selectedRiderId || codeInput.length !== 2) return;

    this.setState({ verifyingCode: true });

    Meteor.call("rideSessions.verifyPickupCode", sessionId, selectedRiderId, codeInput, (error, result) => {
      this.setState({ verifyingCode: false });

      if (error) {
        swal("Verification Failed", error.reason || error.message, "error");
        // Reload rider codes to get updated attempt count
        this.loadRiderCodes();
      } else {
        swal("Success!", result.message, "success");
        this.setState({
          pickupModalOpen: false,
          selectedRiderId: null,
          codeInput: "",
          riderCodes: {}
        });
      }
    });
  };

  closePickupModal = () => {
    this.setState({
      pickupModalOpen: false,
      selectedRiderId: null,
      codeInput: "",
      riderCodes: {}
    });
  };

  closeCodeModal = () => {
    this.setState({
      codeModalOpen: false,
      fullCode: null
    });
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

  handleOpenChat = () => {
    // Navigate to chat page with ride ID
    this.props.history.push(`/chat?rideId=${this.props.ride._id}`);
  };

  handleOpenMap = () => {
    this.setState({ mapModalOpen: true });
  };

  closeMapModal = () => {
    this.setState({ mapModalOpen: false });
  };

  handleViewRideInfo = () => {
    // Navigate to RideInfo page for mobile
    this.props.history.push(`/ride/${this.props.ride._id}`);
  };

  parseCoordinates = (coordinateString) => {
    if (!coordinateString) return null;
    const [lat, lng] = coordinateString.split(",").map(coord => parseFloat(coord.trim()));
    return { lat, lng };
  };

  getPlaceCoordinates = (placeId) => {
    const place = this.props.places.find((p) => p._id === placeId);
    return place ? this.parseCoordinates(place.value) : null;
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
        <RideCard>
          <Header>
            <Route>
              <RouteItem>
                <RouteLabel>From</RouteLabel>
                <RouteLocation>{this.getPlaceName(ride.origin)}</RouteLocation>
              </RouteItem>
              <RouteArrow>→</RouteArrow>
              <RouteItem>
                <RouteLabel>To</RouteLabel>
                <RouteLocation>
                  {this.getPlaceName(ride.destination)}
                </RouteLocation>
              </RouteItem>
            </Route>
            {/* Only show status if current user is not a rider */}
            {!(
              Meteor.user() &&
              ((ride.riders && ride.riders.includes(Meteor.user().username)) ||
                ride.rider === Meteor.user().username)
            ) && (
              <Status>
                {/* Handle new schema */}
                {ride.riders !== undefined && ride.seats !== undefined ? ( // eslint-disable-line no-nested-ternary
                  ride.riders.length < ride.seats ? (
                    <StatusLooking>
                      {ride.seats - ride.riders.length} seat
                      {ride.seats - ride.riders.length !== 1 ? "s" : ""}{" "}
                      available
                    </StatusLooking>
                  ) : (
                    <StatusMatched>Ride full</StatusMatched>
                  )
                ) : /* Handle legacy schema */
                ride.rider === "TBD" ? (
                  <StatusLooking>Looking for rider</StatusLooking>
                ) : (
                  <StatusMatched>Rider found</StatusMatched>
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
                {/* Handle new schema */}
                {ride.riders !== undefined && ride.seats !== undefined // eslint-disable-line no-nested-ternary
                  ? ride.riders.length > 0
                    ? `${ride.riders.length}/${ride.seats} riders: ${ride.riders.join(", ")}`
                    : `0/${ride.seats} riders - None yet`
                  : /* Handle legacy schema */
                    ride.rider === "TBD"
                    ? "No rider yet"
                    : ride.rider}
              </DetailText>
            </DetailItem>
          </Details>

          {ride.notes && (
            <Notes>
              <NotesLabel>Notes:</NotesLabel>
              <NotesText>{ride.notes}</NotesText>
            </Notes>
          )}

          {(this.canShareRide() ||
            this.canJoinRide() ||
            this.canStartRide() ||
            this.canStartActiveRide() ||
            this.canConfirmPickup() ||
            this.canShowCode() ||
            this.canAccessChat() ||
            (this.getPlaceCoordinates(ride.origin) &&
             this.getPlaceCoordinates(ride.destination))) && (
            <Actions>
              {this.canShareRide() && (
                <ShareButton
                  className={isGenerating ? "loading" : ""}
                  onClick={this.handleShareRide}
                  disabled={isGenerating}
                  title={ride.shareCode ? "View Share Code" : "Share Ride"}
                >
                  {isGenerating ? (
                    <Spinner />
                  ) : (
                    <ShareIcon>🔗</ShareIcon>
                  )}
                </ShareButton>
              )}
              {this.canJoinRide() && (
                <JoinButton
                  className={isGenerating ? "loading" : ""}
                  onClick={this.handleJoinRide}
                  disabled={isGenerating}
                  title="Request to Join"
                >
                  {isGenerating ? (
                    <Spinner />
                  ) : (
                    <JoinIcon>🚗</JoinIcon>
                  )}
                </JoinButton>
              )}
              {this.canStartRide() && (
                <StartRideButton
                  className={isGenerating ? "loading" : ""}
                  onClick={this.handleStartRide}
                  disabled={isGenerating}
                  title="Start Ride Session"
                >
                  {isGenerating ? (
                    <Spinner />
                  ) : (
                    <StartRideIcon>🚀</StartRideIcon>
                  )}
                </StartRideButton>
              )}
              {this.canStartActiveRide() && (
                <StartRideButton
                  className={isGenerating ? "loading" : ""}
                  onClick={this.handleStartActiveRide}
                  disabled={isGenerating}
                  title="Start Active Ride"
                >
                  {isGenerating ? (
                    <Spinner />
                  ) : (
                    <StartRideIcon>▶️</StartRideIcon>
                  )}
                </StartRideButton>
              )}
              {this.canConfirmPickup() && (
                <ConfirmPickupButton
                  onClick={this.handleConfirmPickup}
                  title="Confirm Pickup"
                >
                  <ConfirmPickupIcon>✅</ConfirmPickupIcon>
                </ConfirmPickupButton>
              )}
              {this.canShowCode() && (
                <ShowCodeButton
                  onClick={this.handleShowCode}
                  title="Show Pickup Code"
                >
                  <ShowCodeIcon>🔢</ShowCodeIcon>
                </ShowCodeButton>
              )}
              {this.canAccessChat() && (
                <ChatButton
                  onClick={this.handleOpenChat}
                  title="Open Chat"
                >
                  <ChatIcon>💬</ChatIcon>
                </ChatButton>
              )}
              {this.getPlaceCoordinates(ride.origin) && this.getPlaceCoordinates(ride.destination) && (
                <>
                  <MobileOnly>
                    <MapButton
                      onClick={this.handleViewRideInfo}
                      title="View Details"
                    >
                      <MapIcon>📱</MapIcon>
                    </MapButton>
                  </MobileOnly>
                  <DesktopOnly>
                    <MapButton
                      onClick={this.handleOpenMap}
                      title="Open Map"
                    >
                      <MapIcon>🗺️</MapIcon>
                    </MapButton>
                  </DesktopOnly>
                </>
              )}
            </Actions>
          )}
        </RideCard>

        {/* Modern Share Code Modal - Rendered via Portal */}
        {shareModalOpen &&
          ReactDOM.createPortal(
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
            </ModalOverlay>,
            document.body,
          )}

        {/* Map Modal - Rendered via Portal */}
        {this.state.mapModalOpen &&
          ReactDOM.createPortal(
            <ModalOverlay onClick={this.closeMapModal}>
              <Modal onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
                <ModalHeader>
                  <ModalTitle>
                    <ModalIcon>🗺️</ModalIcon>
                    Route Map
                  </ModalTitle>
                  <ModalClose onClick={this.closeMapModal}>✕</ModalClose>
                </ModalHeader>

                <ModalContent style={{ padding: "0", height: "calc(90vh - 140px)", minHeight: "500px" }}>
                  <RouteMapView
                    startCoord={this.getPlaceCoordinates(ride.origin)}
                    endCoord={this.getPlaceCoordinates(ride.destination)}
                    height="100%"
                  />
                </ModalContent>

                <ModalActions>
                  <DoneButton onClick={this.closeMapModal}>��� Close</DoneButton>
                </ModalActions>
              </Modal>
            </ModalOverlay>,
            document.body,
          )}

        {/* Pickup Confirmation Modal - Rendered via Portal */}
        {this.state.pickupModalOpen &&
          ReactDOM.createPortal(
            <PickupOverlay onClick={this.closePickupModal}>
              <PickupModal onClick={(e) => e.stopPropagation()}>
                <PickupModalHeader>
                  <PickupModalTitle>
                    ✅ Confirm Pickup
                  </PickupModalTitle>
                  <ModalClose onClick={this.closePickupModal}>✕</ModalClose>
                </PickupModalHeader>

                <RiderList>
                  {this.props.rideSessions
                    .find(session => session.rideId === ride._id && !session.finished)
                    ?.riders
                    .filter(riderId => {
                      const session = this.props.rideSessions.find(s => s.rideId === ride._id && !s.finished);
                      const progress = session?.progress[riderId];
                      return progress && !progress.pickedUp;
                    })
                    .map(riderId => {
                      const session = this.props.rideSessions.find(s => s.rideId === ride._id && !s.finished);
                      const progress = session?.progress[riderId];
                      const riderCodeData = this.state.riderCodes[riderId];
                      const isSelected = this.state.selectedRiderId === riderId;
                      const isDisabled = progress?.codeError;

                      return (
                        <RiderItem
                          key={riderId}
                          error={isDisabled}
                          disabled={isDisabled}
                          onClick={() => !isDisabled && this.handleRiderSelect(riderId)}
                        >
                          <RiderName>{this.getUsernameFromId(riderId)}</RiderName>
                          <RiderStatus error={isDisabled}>
                            {isDisabled
                              ? "Code verification disabled (too many attempts)"
                              : `Attempts remaining: ${riderCodeData?.attemptsRemaining ?? 5}`
                            }
                          </RiderStatus>

                          {isSelected && !isDisabled && riderCodeData && (
                            <CodeInputSection>
                              <CodeDisplay>
                                <CodeDigit filled>{riderCodeData.hint?.[0] || "?"}</CodeDigit>
                                <CodeDigit filled>{riderCodeData.hint?.[1] || "?"}</CodeDigit>
                                <CodeDigit>_</CodeDigit>
                                <CodeDigit>_</CodeDigit>
                              </CodeDisplay>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <CodeInput
                                  type="text"
                                  maxLength="2"
                                  placeholder="??"
                                  value={this.state.codeInput}
                                  onChange={(e) => this.setState({ codeInput: e.target.value.replace(/\D/g, '') })}
                                  disabled={this.state.verifyingCode}
                                />
                                <VerifyButton
                                  onClick={this.handleCodeVerification}
                                  disabled={this.state.verifyingCode || this.state.codeInput.length !== 2}
                                >
                                  {this.state.verifyingCode ? "..." : "Verify"}
                                </VerifyButton>
                              </div>
                            </CodeInputSection>
                          )}
                        </RiderItem>
                      );
                    })}
                </RiderList>
              </PickupModal>
            </PickupOverlay>,
            document.body,
          )}

        {/* Pickup Confirmation Modal - Rendered via Portal */}
        {this.state.pickupModalOpen &&
          ReactDOM.createPortal(
            <PickupOverlay onClick={this.closePickupModal}>
              <PickupModal onClick={(e) => e.stopPropagation()}>
                <PickupModalHeader>
                  <PickupModalTitle>
                    ✅ Confirm Pickup
                  </PickupModalTitle>
                  <ModalClose onClick={this.closePickupModal}>✕</ModalClose>
                </PickupModalHeader>

                <RiderList>
                  {this.props.rideSessions
                    .find(session => session.rideId === ride._id && !session.finished)
                    ?.riders
                    .filter(riderId => {
                      const session = this.props.rideSessions.find(s => s.rideId === ride._id && !s.finished);
                      const progress = session?.progress[riderId];
                      return progress && !progress.pickedUp;
                    })
                    .map(riderId => {
                      const session = this.props.rideSessions.find(s => s.rideId === ride._id && !s.finished);
                      const progress = session?.progress[riderId];
                      const riderCodeData = this.state.riderCodes[riderId];
                      const isSelected = this.state.selectedRiderId === riderId;
                      const isDisabled = progress?.codeError;

                      return (
                        <RiderItem
                          key={riderId}
                          error={isDisabled}
                          disabled={isDisabled}
                          onClick={() => !isDisabled && this.handleRiderSelect(riderId)}
                        >
                          <RiderName>{this.getUsernameFromId(riderId)}</RiderName>
                          <RiderStatus error={isDisabled}>
                            {isDisabled
                              ? "Code verification disabled (too many attempts)"
                              : `Attempts remaining: ${riderCodeData?.attemptsRemaining ?? 5}`
                            }
                          </RiderStatus>

                          {isSelected && !isDisabled && riderCodeData && (
                            <CodeInputSection>
                              <CodeDisplay>
                                <CodeDigit filled>{riderCodeData.hint?.[0] || "?"}</CodeDigit>
                                <CodeDigit filled>{riderCodeData.hint?.[1] || "?"}</CodeDigit>
                                <CodeDigit>_</CodeDigit>
                                <CodeDigit>_</CodeDigit>
                              </CodeDisplay>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <CodeInput
                                  type="text"
                                  maxLength="2"
                                  placeholder="??"
                                  value={this.state.codeInput}
                                  onChange={(e) => this.setState({ codeInput: e.target.value.replace(/\D/g, '') })}
                                  disabled={this.state.verifyingCode}
                                />
                                <VerifyButton
                                  onClick={this.handleCodeVerification}
                                  disabled={this.state.verifyingCode || this.state.codeInput.length !== 2}
                                >
                                  {this.state.verifyingCode ? "..." : "Verify"}
                                </VerifyButton>
                              </div>
                            </CodeInputSection>
                          )}
                        </RiderItem>
                      );
                    })}
                </RiderList>
              </PickupModal>
            </PickupOverlay>,
            document.body,
          )}

        {/* Code Display Modal for Riders - Rendered via Portal */}
        {this.state.codeModalOpen &&
          ReactDOM.createPortal(
            <ModalOverlay onClick={this.closeCodeModal}>
              <Modal onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>
                    <ModalIcon>🔢</ModalIcon>
                    Your Pickup Code
                  </ModalTitle>
                  <ModalClose onClick={this.closeCodeModal}>✕</ModalClose>
                </ModalHeader>

                <CodeModalContent>
                  <CodeInstructions>
                    Show this code to your driver for pickup verification:
                  </CodeInstructions>
                  <FullCodeDisplay>
                    {this.state.fullCode}
                  </FullCodeDisplay>
                  <CodeInstructions>
                    The driver will ask for the last 2 digits only.
                  </CodeInstructions>
                </CodeModalContent>

                <ModalActions>
                  <DoneButton onClick={this.closeCodeModal}>✓ Got it</DoneButton>
                </ModalActions>
              </Modal>
            </ModalOverlay>,
            document.body,
          )}
      </>
    );
  }
}

Ride.propTypes = {
  ride: PropTypes.object.isRequired,
  places: PropTypes.array.isRequired,
  rideSessions: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(
  withTracker(() => {
    Meteor.subscribe("places.options");
    Meteor.subscribe("rideSessions");
    return {
      places: Places.find({}).fetch(),
      rideSessions: RideSessions.find({}).fetch(),
    };
  })(Ride),
);
