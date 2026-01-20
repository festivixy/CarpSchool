import React from "react";
import { useSignOut } from "@clerk/clerk-react";
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
  const { signOut, isLoaded } = useSignOut();
  const [isSigningOut, setIsSigningOut] = React.useState(true);
  const [signedOut, setSignedOut] = React.useState(false);

  React.useEffect(() => {
    if (!isLoaded) return;

    const handleSignOut = async () => {
      try {
        await signOut({ redirectUrl: "/" });
      } catch (error) {
        console.error("Sign out error:", error);
        setIsSigningOut(false);
        setSignedOut(true);
      }
    };

    setTimeout(() => {
      handleSignOut();
    }, 800);
  }, [isLoaded, signOut]);

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
