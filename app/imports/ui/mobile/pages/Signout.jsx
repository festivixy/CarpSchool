import React from "react";
import { useClerk } from "@clerk/clerk-react";
import { fullSignOut } from "../../utils/signOut";
import {
  Container,
  Content,
  LoadingSection,
  SuccessSection,
  Spinner,
  Icon,
  LoadingTitle,
  Title,
  LoadingMessage,
  Actions,
  ButtonPrimary,
  ButtonSecondary,
} from "../styles/Signout";

/** Mobile signout page with Clerk authentication */
export default function MobileSignout() {
  // @clerk/clerk-react has no useSignOut hook; signOut lives on the Clerk
  // instance. `loaded` gates the call until Clerk has restored its session.
  const { signOut, loaded } = useClerk();
  const [isSigningOut, setIsSigningOut] = React.useState(true);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (!loaded || started.current) return undefined;
    started.current = true;

    const timer = setTimeout(async () => {
      try {
        await fullSignOut(signOut);
      } catch (error) {
        console.error("Sign out error:", error);
        setIsSigningOut(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [loaded, signOut]);

  return (
    <Container>
      <Content>
        {isSigningOut ? (
          <LoadingSection>
            <Spinner></Spinner>
            <LoadingTitle>Signing you out...</LoadingTitle>
            <LoadingMessage>Please wait while we securely sign you out</LoadingMessage>
          </LoadingSection>
        ) : (
          <SuccessSection>
            <Icon>👋</Icon>
            <Title>You are signed out.</Title>
            <Actions>
              <ButtonPrimary to="/login">Sign In Again</ButtonPrimary>
              <ButtonSecondary to="/">Go to Home</ButtonSecondary>
            </Actions>
          </SuccessSection>
        )}
      </Content>
    </Container>
  );
}
