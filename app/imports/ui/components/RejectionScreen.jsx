import React, { useState } from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Profiles } from "../../api/profile/Profile";
import {
  Container,
  Content,
  Icon,
  Title,
  Subtitle,
  Message,
  ReasonSection,
  ReasonTitle,
  ReasonText,
  StatusCard,
  StatusIcon,
  StatusText,
  Actions,
  ReVerifyButton,
  LogoutButton,
  LoadingState,
  ErrorMessage,
  SuccessMessage,
} from "../styles/RejectionScreen";

/**
 * RejectionScreen component - Shows rejection message with re-verification option
 */
const RejectionScreen = ({ profile, loading }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleReVerify = () => {
    if (processing) return;

    setProcessing(true);
    setError("");
    setSuccess("");

    Meteor.call("profile.reVerify", (err, result) => {
      setProcessing(false);
      if (err) {
        setError(err.reason || "Failed to start re-verification process");
      } else {
        setSuccess("Re-verification started! Redirecting to verification page...");
        
        // Redirect to verification page after a brief delay
        setTimeout(() => {
          window.location.href = "/verify";
        }, 2000);
      }
    });
  };

  const handleLogout = () => {
    Meteor.logout((error) => {
      if (error) {
        console.error("Logout error:", error);
      } else {
        window.location.href = "/";
      }
    });
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Container>
        <Content>
          <LoadingState>
            <div>Loading your verification status...</div>
          </LoadingState>
        </Content>
      </Container>
    );
  }

  if (!profile || !profile.rejected) {
    return (
      <Container>
        <Content>
          <Icon>❓</Icon>
          <Title>Page Not Found</Title>
          <Message>
            You don't have access to this page. Please check your verification status.
          </Message>
          <Actions>
            <LogoutButton onClick={handleLogout}>
              🚪 Sign Out
            </LogoutButton>
          </Actions>
        </Content>
      </Container>
    );
  }

  const userType = profile.UserType || "User";
  const userName = profile.Name || "there";

  return (
    <Container>
      <Content>
        <Icon>❌</Icon>
        <Title>Verification Rejected</Title>
        <Subtitle>Your {userType.toLowerCase()} verification was not approved</Subtitle>

        <StatusCard rejected>
          <StatusIcon rejected>❌</StatusIcon>
          <StatusText>
            <strong>Status:</strong> Verification Rejected
            {profile.rejectedAt && (
              <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.7 }}>
                Rejected on {formatDate(profile.rejectedAt)}
              </div>
            )}
          </StatusText>
        </StatusCard>

        <Message>
          Hi {userName}, 👋
          <br /><br />
          Unfortunately, your {userType.toLowerCase()} verification was not approved by our administrators.
          This could be due to incomplete information, unclear verification documents, or other issues
          that need to be addressed.
          <br /><br />
          <strong>Don't worry!</strong> You can re-verify your profile by providing updated information
          or correcting any issues that may have caused the rejection.
        </Message>

        {profile.rejectionReason && (
          <ReasonSection>
            <ReasonTitle>📝 Reason for Rejection</ReasonTitle>
            <ReasonText>{profile.rejectionReason}</ReasonText>
          </ReasonSection>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Actions>
          <ReVerifyButton
            onClick={handleReVerify}
            disabled={processing}
          >
            {processing ? "Starting Re-verification..." : "🔄 Re-Verify Profile"}
          </ReVerifyButton>
          
          <LogoutButton onClick={handleLogout} disabled={processing}>
            🚪 Sign Out
          </LogoutButton>
        </Actions>

        <Message style={{ fontSize: "14px", marginTop: "24px", opacity: 0.8 }}>
          <strong>What happens next?</strong>
          <br />
          • Click "Re-Verify Profile" to start the verification process again
          <br />
          • Make sure to provide clear, accurate information
          <br />
          • Upload high-quality verification documents
          <br />
          • Contact support if you need assistance with the verification process
        </Message>
      </Content>
    </Container>
  );
};

RejectionScreen.propTypes = {
  profile: PropTypes.object,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const profileSubscription = Meteor.subscribe("profiles.mine");
  const profile = Profiles.findOne({ Owner: Meteor.userId() });

  return {
    profile,
    loading: !profileSubscription.ready(),
  };
})(RejectionScreen);
