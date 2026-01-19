import React from "react";
import PropTypes from "prop-types";
import { useSignUp } from "@clerk/clerk-react";
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
} from "../styles/Signup";
import { Meteor } from "meteor/meteor";

/**
 * Mobile Signup component using Clerk for authentication
 * After Clerk auth, creates new Meteor user linked to Clerk
 */
export default function ClerkSignup({ location }) {
  const { signUp, isLoaded } = useSignUp();
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const from = location?.state?.from?.pathname || "/onboarding";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      await signUp.create({
        redirectUrl: window.location.origin + from,
      });
    } catch (err) {
      setError(err.message || "Failed to start sign up");
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <AppName>CarpSchool</AppName>
      </Header>

      <Content>
        <Copy>
          <Title>Create an account</Title>
          <Subtitle>Enter your information to sign up for this app</Subtitle>
        </Copy>

        <Form onSubmit={handleSubmit}>
          <InputSection>
            <Field>
              <SubmitButton type="submit" disabled={!isLoaded || loading}>
                {loading ? "Creating account..." : "Continue with Email"}
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
          <StyledLink to="/login">
            Already have an account? Sign in
          </StyledLink>
        </Links>

        <Legal>
          By creating an account, you agree to our{" "}
          <LegalLink to="/terms">Terms of Service</LegalLink> and{" "}
          <LegalLink to="/privacy">Privacy Policy</LegalLink>
        </Legal>
      </Content>
    </Container>
  );
}

ClerkSignup.propTypes = {
  location: PropTypes.object,
};
