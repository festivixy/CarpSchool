import React from "react";
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
  StatusCard,
  StatusIcon,
  StatusText,
  InfoSection,
  InfoTitle,
  InfoText,
  Actions,
  LogoutButton,
} from "../styles/WaitingForConfirmation";

/**
 * WaitingForConfirmation component - Shows pending admin approval status
 */
const WaitingForConfirmation = ({ profile, loading }) => {
  const handleLogout = () => {
    Meteor.logout((error) => {
      if (error) {
        console.error("Logout error:", error);
      } else {
        window.location.href = "/";
      }
    });
  };

  if (loading) {
    return (
      <Container>
        <Content>
          <Icon>⏳</Icon>
          <Title>Loading...</Title>
        </Content>
      </Container>
    );
  }

  const userType = profile?.UserType || "User";
  const userName = profile?.Name || "there";

  return (
    <Container>
      <Content>
        <Icon>⏳</Icon>
        <Title>Verification Under Review</Title>
        <Subtitle>Your {userType.toLowerCase()} verification is pending approval</Subtitle>

        <StatusCard>
          <StatusIcon verified>✅</StatusIcon>
          <StatusText>
            <strong>Step 1:</strong> Account Verification - Complete
          </StatusText>
        </StatusCard>

        <StatusCard>
          <StatusIcon verified>✅</StatusIcon>
          <StatusText>
            <strong>Step 2:</strong> Profile Setup - Complete
          </StatusText>
        </StatusCard>

        <StatusCard>
          <StatusIcon verified>✅</StatusIcon>
          <StatusText>
            <strong>Step 3:</strong> {userType} Verification - Complete
          </StatusText>
        </StatusCard>

        <StatusCard pending>
          <StatusIcon pending>⏳</StatusIcon>
          <StatusText>
            <strong>Step 4:</strong> Admin Approval - Pending
          </StatusText>
        </StatusCard>

        <Message>
          Hi {userName}! 👋
          <br /><br />
          Great news! You&apos;ve successfully completed your {userType.toLowerCase()} verification. 
          Your profile is now under review by our administrators.
          <br /><br />
          <strong>What happens next?</strong>
          <br />
          • Our admins will review your verification details
          <br />
          • You&apos;ll receive access once approved
          <br />
          • This typically takes 1-2 business days
        </Message>

        <InfoSection>
          <InfoTitle>📧 Need Help?</InfoTitle>
          <InfoText>
            If you have questions about your verification status, please contact your school administrator 
            or our support team. We&apos;re here to help!
          </InfoText>
        </InfoSection>

        <Actions>
          <LogoutButton onClick={handleLogout}>
            🚪 Sign Out
          </LogoutButton>
        </Actions>
      </Content>
    </Container>
  );
};

WaitingForConfirmation.propTypes = {
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
})(WaitingForConfirmation);
