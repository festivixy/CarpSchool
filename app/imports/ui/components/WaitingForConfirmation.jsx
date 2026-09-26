import React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { useClerk } from "@clerk/clerk-react";
import { Profiles } from "../../api/profile/Profile";
import { fullSignOut } from "../utils/signOut";
import Glyph from "./Icon";
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
 * The holding screen, for an account that exists but cannot do anything yet.
 *
 * Three different situations land here and they need different answers. A
 * suspended account is the one that must not be dressed up as a wait: nothing
 * is coming, a person decided this, and the screen has to say so rather than
 * leave somebody refreshing a queue that does not exist. An
 * account that has asked to be approved is waiting on an administrator. A
 * guardian nobody has claimed is waiting on their student, and no
 * administrator has been asked anything -- telling them to sit tight would
 * leave them waiting for something that is never going to arrive.
 *
 * Nothing here promises an email: the platform does not send one on approval.
 * The previous copy promised one, named a one-to-two-day turnaround nobody
 * committed to, and congratulated people on a driver verification that no
 * longer exists.
 */
const HINT_UNCLAIMED = "Check that your student used the same address you "
  + "signed up with -- a different one will not match. If they have added you "
  + "and this has not changed, speak to an administrator at their school.";

const HINT_PENDING = "Approvals are done by a person at your school, not by "
  + "us, so there is no queue position to report. If it has been longer than "
  + "you expected, ask them directly.";

/*
 * Suspension is reversible and an administrator at the school is the only one
 * who can reverse it. No email address is offered here: the platform does not
 * send mail, and pointing somebody at an inbox nobody reads is worse than
 * pointing them at a person.
 */
const SuspendedScreen = ({ name, reason, onLogout }) => (
  <Container>
    <Content>
      <Icon><Glyph name="flame" size={30} /></Icon>

      <Title>Your account is suspended</Title>
      <Subtitle>
        An administrator at your school has suspended this account.
      </Subtitle>

      <StatusCard pending>
        <StatusIcon pending>
          <Glyph name="flame" size={16} strokeWidth={2} />
        </StatusIcon>
        <StatusText>
          {reason ? `Reason given: ${reason}` : "No reason was recorded."}
        </StatusText>
      </StatusCard>

      <Message>
        {`Hi ${name}. `}
        While this account is suspended you cannot see rides, people or
        messages, and you are not visible to anyone else at your school.
        <br />
        <br />
        Nothing has been deleted. Your rides and messages are still here, and
        they come back if the suspension is lifted.
      </Message>

      <InfoSection>
        <InfoTitle>If you think this is a mistake</InfoTitle>
        <InfoText>
          Speak to an administrator at your school. They are the only ones who
          can lift a suspension -- we cannot do it for them, and there is
          nothing to wait for on our side.
        </InfoText>
      </InfoSection>

      <Actions>
        <LogoutButton onClick={onLogout}>
          Sign Out
        </LogoutButton>
      </Actions>
    </Content>
  </Container>
);

SuspendedScreen.propTypes = {
  name: PropTypes.string.isRequired,
  reason: PropTypes.string,
  onLogout: PropTypes.func.isRequired,
};

SuspendedScreen.defaultProps = {
  reason: "",
};

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
          <Icon><Glyph name="clock" size={30} /></Icon>
          <Title>Checking your account</Title>
        </Content>
      </Container>
    );
  }

  const name = profile?.Name || "there";

  if (profile?.suspended) {
    return (
      <SuspendedScreen
        name={name}
        reason={profile.suspensionReason}
        onLogout={handleLogout}
      />
    );
  }

  const isGuardian = profile?.accountType === "parent";
  const unclaimed = isGuardian && (profile?.guardianOf || []).length === 0;

  const steps = [
    ["Email address", true],
    ["Profile", Boolean(profile?.Name)],
    ...(isGuardian ? [["Linked by your student", !unclaimed]] : []),
    ["Approved by an administrator", Boolean(profile?.verified)],
  ];

  return (
    <Container>
      <Content>
        <Icon><Glyph name="clock" size={30} /></Icon>

        <Title>{unclaimed ? "Waiting for your student" : "Waiting for approval"}</Title>
        <Subtitle>
          {unclaimed
            ? "Your account is set up, but it is not attached to a school yet."
            : "An administrator at your school is reviewing your account."}
        </Subtitle>

        {steps.map(([label, done]) => (
          <StatusCard key={label} pending={!done}>
            <StatusIcon verified={done} pending={!done}>
              <Glyph name={done ? "check" : "clock"} size={16} strokeWidth={done ? 2.6 : 2} />
            </StatusIcon>
            <StatusText>{label}</StatusText>
          </StatusCard>
        ))}

        <Message>
          {unclaimed ? (
            <>
              {`Hi ${name}. `}
              Ask your student to open their profile, find
              {" "}
              <strong>Parent or guardian</strong>
              , and add the email address you signed up with. That is what
              attaches you to their school.
              <br />
              <br />
              Until then this account cannot see rides, people or messages.
              Nobody has been asked to review it yet, so there is nothing to
              wait for on our side.
            </>
          ) : (
            <>
              {`Hi ${name}. `}
              Your account is with an administrator at your school. They decide
              who joins, so how long it takes is up to them.
              <br />
              <br />
              There is nothing else for you to do. Sign in again later to see
              whether it has been approved.
            </>
          )}
        </Message>

        <InfoSection>
          <InfoTitle>If it is taking a while</InfoTitle>
          <InfoText>
            {unclaimed ? HINT_UNCLAIMED : HINT_PENDING}
          </InfoText>
        </InfoSection>

        <Actions>
          <LogoutButton onClick={handleLogout}>
            Sign Out
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

WaitingForConfirmation.defaultProps = {
  profile: null,
};

export default withTracker(() => {
  const profileSubscription = Meteor.subscribe("userProfile");
  const profile = Profiles.findOne({ Owner: Meteor.userId() });

  return {
    profile,
    loading: !profileSubscription.ready(),
  };
})(WaitingForConfirmation);
