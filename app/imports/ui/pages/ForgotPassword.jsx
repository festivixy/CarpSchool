import React from "react";
import PropTypes from "prop-types";
import { useSignIn } from "@clerk/clerk-react";
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
  Input,
  Button,
  Success,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  BackButton,
  ErrorMessage,
  Divider,
  DividerLine,
  DividerText,
  Links,
  StyledLink,
  Legal,
  LegalLink,
} from "../styles/ForgotPassword";

/**
 * Mobile ForgotPassword component using Clerk for password reset
 */
export default function MobileForgotPassword({ location }) {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded) return;

    setIsSubmitting(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset password email");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Header>
        <AppName>CarpSchool</AppName>
      </Header>

      <Content>
        <Copy>
          <Title>Forgot your password?</Title>
          <Subtitle>Enter your email address and we&apos;ll send you a link to reset your password</Subtitle>
        </Copy>

        {!success ? (
          <Form onSubmit={handleSubmit}>
            <InputSection>
              <Field>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleChange}
                  required
                  disabled={!isLoaded || isSubmitting}
                />
              </Field>

              <Button type="submit" disabled={!isLoaded || isSubmitting || !email}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </InputSection>
          </Form>
        ) : (
          <Success>
            <SuccessIcon>✓</SuccessIcon>
            <SuccessTitle>Email sent!</SuccessTitle>
            <SuccessMessage>
              Check your email for a link to reset your password. If it doesn&apos;t appear within a few minutes, check your spam folder.
            </SuccessMessage>
            <BackButton onClick={() => { setSuccess(false); setEmail(""); }}>
              Send another email
            </BackButton>
          </Success>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Divider>
          <DividerLine />
          <DividerText>or</DividerText>
          <DividerLine />
        </Divider>

        <Links>
          <StyledLink to="/login">Back to Sign In</StyledLink>
          <StyledLink to="/signup">Don&apos;t have an account? Sign up</StyledLink>
        </Links>

        <Legal>
          By using our service, you agree to our{" "}
          <LegalLink to="/terms">Terms of Service</LegalLink> and{" "}
          <LegalLink to="/privacy">Privacy Policy</LegalLink>
        </Legal>
      </Content>
    </Container>
  );
}

MobileForgotPassword.propTypes = {
  location: PropTypes.object,
};
