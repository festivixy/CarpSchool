import React from "react";
import PropTypes from "prop-types";
import { Accounts } from "meteor/accounts-base";
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
import Captcha from "../components/Captcha";

/**
 * Mobile ForgotPassword component with modern design and full functionality
 */
export default class MobileForgotPassword extends React.Component {
  /** Initialize component state with properties for password reset. */
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      error: "",
      success: false,
      isSubmitting: false,
    };
    this.captchaRef = React.createRef();
  }

  /** Update the form controls each time the user interacts with them. */
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  /** Handle form submission */
  handleSubmit = (e) => {
    e.preventDefault();
    this.submit();
  };

  /** Handle password reset submission using Meteor's Accounts.forgotPassword(). */
  submit = () => {
    const { email } = this.state;

    if (!this.captchaRef.current) {
      this.setState({ error: "Captcha component not available." });
      return;
    }

    this.setState({ isSubmitting: true, error: "", success: false });

    // First verify CAPTCHA using centralized component
    this.captchaRef.current.verify((captchaError, isValid) => {
      if (captchaError || !isValid) {
        this.setState({
          error: captchaError || "Invalid security code. Please try again.",
          isSubmitting: false,
        });
        return;
      }

      // CAPTCHA is valid, proceed with password reset
      Accounts.forgotPassword({ email }, (error) => {
        this.setState({ isSubmitting: false });

        if (error) {
          this.setState({ error: error.message });
        } else {
          this.setState({
            success: true,
            email: "", // Clear the email field after success
          });
          // Reset captcha after success
          this.captchaRef.current.reset();
        }
      });
    });
  };

  /** Render the forgot password form. */
  render() {
    return (
      <Container>
        <Header>
          <AppName>carp.school</AppName>
        </Header>

        <Content>
          <Copy>
            <Title>Forgot your password?</Title>
            <Subtitle>
              Enter your email address and we&apos;ll send you a link to reset
              your password
            </Subtitle>
          </Copy>

          {!this.state.success ? (
            <Form onSubmit={this.handleSubmit}>
              <InputSection>
                <Field>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={this.state.email}
                    onChange={this.handleChange}
                    required
                  />
                </Field>

                {/* CAPTCHA Section */}
                <Field>
                  <Captcha
                    ref={this.captchaRef}
                    autoGenerate={true}
                    disabled={this.state.isSubmitting}
                  />
                </Field>

                <Button type="submit" disabled={this.state.isSubmitting}>
                  {this.state.isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </InputSection>
            </Form>
          ) : (
            <Success>
              <SuccessIcon>✓</SuccessIcon>
              <SuccessTitle>Email sent!</SuccessTitle>
              <SuccessMessage>
                Check your email for a link to reset your password. If it
                doesn&apos;t appear within a few minutes, check your spam
                folder.
              </SuccessMessage>
              <BackButton
                onClick={() => this.setState({
                    success: false,
                    email: "",
                    captchaInput: "",
                  })
                }
              >
                Send another email
              </BackButton>
            </Success>
          )}

          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}

          <Divider>
            <DividerLine />
            <DividerText>or</DividerText>
            <DividerLine />
          </Divider>

          <Links>
            <StyledLink to="/signin">Back to Sign In</StyledLink>
            <StyledLink to="/signup">
              Don&apos;t have an account? Sign up
            </StyledLink>
          </Links>

          <Legal>
            By using our service, you agree to our{" "}
            <LegalLink to="/tos">Terms of Service</LegalLink> and{" "}
            <LegalLink to="/privacy">Privacy Policy</LegalLink>
          </Legal>
        </Content>
      </Container>
    );
  }
}

/** Ensure that the React Router location object is available in case we need to redirect. */
MobileForgotPassword.propTypes = {
  location: PropTypes.object,
};
