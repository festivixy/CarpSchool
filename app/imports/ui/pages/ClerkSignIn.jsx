import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { useSignIn, useSignUp, useAuth } from "@clerk/clerk-react";
import {
  Container,
  Header,
  AppName,
  Content,
  Copy,
  Title,
  Subtitle,
  Form,
  InputSection,
  Field,
  SubmitButton,
  ErrorMessage,
  Divider,
  DividerLine,
  DividerText,
  Links,
  StyledLink,
  Legal,
  LegalLink,
} from "../styles/SignIn";
import { Meteor } from "meteor/meteor";

/**
 * Mobile SignIn component using Clerk for authentication
 * After Clerk auth, links to existing Meteor user or creates new one
 */
export default function ClerkSignIn({ location }) {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignIn();
  const { isSignedIn, userId } = useAuth();
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const from = location?.state?.from?.pathname || "/my-rides";

  React.useEffect(() => {
    if (isSignedIn && userId && !loading) {
      linkClerkUser();
    }
  }, [isSignedIn, userId]);

  const linkClerkUser = () => {
    setLoading(true);
    Meteor.call("clerk.linkUser", userId, (err, result) => {
      setLoading(false);
      if (err) {
        setError(err.reason || "Failed to sign in");
      } else {
        window.location.href = from;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signInLoaded || !signUpLoaded) return;

    setError("");
    setLoading(true);

    try {
      await signIn.create({
        redirectUrl: window.location.href,
      });
    } catch (err) {
      setError(err.message || "Failed to start sign in");
      setLoading(false);
    }
  };

  if (isSignedIn) {
    return (
      <Container>
        <Content>
          <Copy>
            <Title>Signing in...</Title>
            <Subtitle>Please wait while we complete your sign in</Subtitle>
          </Copy>
          {loading && <SubmitButton disabled>Loading...</SubmitButton>}
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <AppName>CarpSchool</AppName>
      </Header>

      <Content>
        <Copy>
          <Title>Sign in to your account</Title>
          <Subtitle>Enter your credentials to access your account</Subtitle>
        </Copy>

        <Form onSubmit={handleSubmit}>
          <InputSection>
            <Field>
              <SubmitButton type="submit" disabled={!signInLoaded || loading}>
                {loading ? "Signing in..." : "Continue with Email"}
              </SubmitButton>
            </Field>
          </InputSection>
        </Form>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Divider>
          <DividerLine></DividerLine>
          <DividerText>or</DividerText>
          <DividerLine></DividerLine>
        </Divider>

        <Links>
          <StyledLink to="/signup">
            Don&apos;t have an account? Sign up
          </StyledLink>
        </Links>

        <Legal>
          By signing in, you agree to our{" "}
          <LegalLink to="/terms">Terms of Service</LegalLink> and{" "}
          <LegalLink to="/privacy">Privacy Policy</LegalLink>
        </Legal>
      </Content>
    </Container>
  );
}

ClerkSignIn.propTypes = {
  location: PropTypes.object,
};
