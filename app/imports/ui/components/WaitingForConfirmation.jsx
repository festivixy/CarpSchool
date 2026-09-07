import React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { useClerk } from "@clerk/clerk-react";
import { Profiles } from "../../api/profile/Profile";
import { fullSignOut } from "../utils/signOut";
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
  const { signOut } = useClerk();

  // Meteor.logout() alone left the Clerk session alive, so the bridge signed
  // the user straight back in on reload; fullSignOut ends both.
  const handleLogout = () => {
    fullSignOut(signOut).catch((error) => {
      console.error("Logout error:", error);
    });
  };

  if (loading) {
    return (
      <Container>
        <Content>
          <Icon>🔍</Icon>
          <Title>Admin Verification in Progress</Title>
          <Subtitle>Our administrators are reviewing your profile verification</Subtitle>

          <Message>
            Please check back soon! You'll receive an email notification once your account has been approved and you can access the full application.
          </Message>
        </Content>
      </Container>
    );
  }

  const userType = profile?.UserType || "User";
  const userName = profile?.Name || "there";

  return (
    <Container>
      <Content>
        <Icon>🔍</Icon>
        <Title>Admin Verification in Progress</Title>
        <Subtitle>Our administrators are reviewing your {userType.toLowerCase()} profile verification</Subtitle>

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
          Our administrators are now reviewing your profile to ensure everything is in order.
          <br /><br />
          <strong>What happens next?</strong>
          <br />
          • Our admins are currently verifying your profile details
          <br />
          • You&apos;ll receive an email notification once approved
          <br />
          • Check back soon - this typically takes 1-2 business days
          <br />
          • No further action is needed from you at this time
        </Message>

        <InfoSection>
          <InfoTitle>📧 What to Expect</InfoTitle>
          <InfoText>
            You'll receive an email notification as soon as your profile is approved by our administrators.
            In the meantime, feel free to check back here periodically. If you have questions about your
            verification status, please contact your school administrator or our support team.
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
  const profileSubscription = Meteor.subscribe("userProfile");
  const profile = Profiles.findOne({ Owner: Meteor.userId() });

  return {
    profile,
    loading: !profileSubscription.ready(),
  };
})(WaitingForConfirmation);
