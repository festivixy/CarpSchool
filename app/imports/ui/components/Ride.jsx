import React from "react";
import { Card, Button, Modal, Header, Icon, Segment } from "semantic-ui-react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import swal from "sweetalert";

/* PROFILE NOT IMPLEMENTED YET
          <Card.Content extra>
            <div className='ui two buttons'>
              <Button basic color='green'>
              Take this ride!
            </Button>
              <Button basic color='blue'>
                Driver Info.
              </Button>
            </div>
          </Card.Content>
          */
/** Renders a single ride card. See pages/ListRides.jsx. */
class Ride extends React.Component {
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

    Meteor.call("rides.generateShareCode", this.props.ride._id, (error, result) => {
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
    });
  };

  closeShareModal = () => {
    this.setState({ shareModalOpen: false, shareCode: null, isExistingCode: false });
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
        navigator.clipboard.writeText(inviteLink).then(() => {
          swal("Link Copied!", "The invite link has been copied to your clipboard.", "success");
        }).catch(() => {
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
      swal("Link Copied!", "The invite link has been copied to your clipboard.", "success");
    } catch (err) {
      swal("Copy Failed", `Please manually copy the link: ${text}`, "error");
    }

    // eslint-disable-next-line no-undef
    document.body.removeChild(textArea);
  };

  isCurrentUserDriver = () => Meteor.user() && this.props.ride.driver === Meteor.user().username;

  canShareRide = () => {
    const rider = this.props.ride.rider;
    return this.isCurrentUserDriver() && (rider === "TBD");
  };

  render() {
    const { shareModalOpen, shareCode, isGenerating, isExistingCode } = this.state;
    const { ride } = this.props;

    return (
      <>
        <Card centered>
          <Card.Content>
            <Card.Header>{ride.origin} to {ride.destination}</Card.Header>
            <Card.Meta>
              {new Date(ride.date).toLocaleDateString("en-US")}
            </Card.Meta>
            <Card.Description>
              <strong>Driver:</strong> {ride.driver}
              <br />
              <strong>Rider:</strong> {ride.rider}
            </Card.Description>
          </Card.Content>
          {this.canShareRide() && (
            <Card.Content extra>
              <Button
                fluid
                color="blue"
                icon="share alternate"
                content={ride.shareCode ? "View Share Code" : "Share Ride"}
                loading={isGenerating}
                disabled={isGenerating}
                onClick={this.handleShareRide}
              />
            </Card.Content>
          )}
        </Card>

        {/* Share Code Modal */}
        <Modal
          open={shareModalOpen}
          onClose={this.closeShareModal}
          size="small"
        >
          <Header icon="share alternate" content="Share Your Ride" />
          <Modal.Content>
            <div style={{ textAlign: "center" }}>
              {isExistingCode ? (
                <p>Here&apos;s your ride&apos;s existing share code:</p>
              ) : (
                <p>Share this code with someone who wants to join your ride:</p>
              )}
              {shareCode && (
                <Segment>
                  <Header as="h2" style={{
                    fontFamily: "monospace",
                    letterSpacing: "2px",
                    color: "#2185d0",
                  }}>
                    {shareCode}
                  </Header>
                </Segment>
              )}
              <p style={{ fontSize: "0.9em", color: "#666" }}>
                {isExistingCode
                  ? "This code was generated earlier and is still active."
                  : "This code is unique to your ride and will be removed once someone joins."
                }
              </p>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" onClick={this.generateInviteLink}>
              <Icon name="linkify" /> Copy Invite Link
            </Button>
            <Button color="blue" onClick={this.closeShareModal}>
              <Icon name="check" /> Done
            </Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  }
}

/** Require a document to be passed to this component. */
Ride.propTypes = {
  ride: PropTypes.object.isRequired,
};

/** Wrap this component in withRouter since we use the <Link> React Router element. */
export default withRouter(Ride);
