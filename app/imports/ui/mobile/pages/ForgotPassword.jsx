import React from "react";
import PropTypes from "prop-types";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
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
  CaptchaSection,
  CaptchaLabel,
  CaptchaContainer,
  CaptchaLoading,
  CaptchaDisplay,
  CaptchaRefreshIcon,
} from "../styles/ForgotPassword";

/**
 * Mobile ForgotPassword component with modern design and full functionality
 */
export default class MobileForgotPassword extends React.Component {
  /** Initialize component state with properties for password reset. */
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      captchaInput: "",
      captchaSvg: "",
      captchaSessionId: "",
      error: "",
      success: false,
      isSubmitting: false,
      isLoadingCaptcha: false,
    };
  }

  componentDidMount() {
    this.generateNewCaptcha();
  }

  /** Update the form controls each time the user interacts with them. */
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  /** Generate a new CAPTCHA */
  generateNewCaptcha = () => {
    this.setState({ isLoadingCaptcha: true });
    Meteor.call("captcha.generate", (error, result) => {
      if (error) {
        this.setState({
          error: "Failed to load CAPTCHA. Please try again.",
          isLoadingCaptcha: false,
        });
      } else {
        this.setState({
          captchaSvg: result.svg,
          captchaSessionId: result.sessionId,
          captchaInput: "",
          isLoadingCaptcha: false,
          error: "",
        });
      }
    });
  };

  /** Generate a new CAPTCHA without clearing existing error messages */
  generateNewCaptchaKeepError = () => {
    this.setState({ isLoadingCaptcha: true });
    Meteor.call("captcha.generate", (error, result) => {
      if (error) {
        this.setState({
          error: "Failed to load CAPTCHA. Please try again.",
          isLoadingCaptcha: false,
        });
      } else {
        this.setState({
          captchaSvg: result.svg,
          captchaSessionId: result.sessionId,
          captchaInput: "",
          isLoadingCaptcha: false,
        });
      }
    });
  };

  /** Handle form submission */
  handleSubmit = (e) => {
    e.preventDefault();
    this.submit();
  };

  /** Handle password reset submission using Meteor's Accounts.forgotPassword(). */
  submit = () => {
    const { email, captchaInput, captchaSessionId } = this.state;

    this.setState({ isSubmitting: true, error: "", success: false });

    // First verify CAPTCHA
    Meteor.call(
      "captcha.verify",
      captchaSessionId,
      captchaInput,
      (captchaError, isValidCaptcha) => {
        if (captchaError || !isValidCaptcha) {
          this.setState({
            error: "Invalid security code. Please try again.",
            isSubmitting: false,
          });
          this.generateNewCaptchaKeepError(); // Generate new CAPTCHA but keep any existing errors
          return;
        }

        // CAPTCHA is valid, proceed with password reset
        Accounts.forgotPassword({ email }, (error) => {
          this.setState({ isSubmitting: false });

          if (error) {
            this.setState({ error: error.message });
            this.generateNewCaptchaKeepError(); // Generate new CAPTCHA but keep error message
          } else {
            this.setState({
              success: true,
              email: "", // Clear the email field after success
              captchaInput: "", // Clear CAPTCHA input
            });
            this.generateNewCaptcha(); // Generate new CAPTCHA after success
          }
        });
      },
    );
  };

  /** Render the forgot password form. */
  render() {
    return (
      <Container>
        <Header>
          <AppName>Carpool App</AppName>
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
                <CaptchaSection>
                  <CaptchaLabel>Security Verification</CaptchaLabel>
                  <CaptchaContainer>
                    {this.state.isLoadingCaptcha ? (
                      <CaptchaLoading>Loading CAPTCHA...</CaptchaLoading>
                    ) : (
                      <CaptchaDisplay
                        dangerouslySetInnerHTML={{
                          __html: this.state.captchaSvg,
                        }}
                      />
                    )}
                    <CaptchaRefreshIcon
                      type="button"
                      onClick={this.generateNewCaptcha}
                      disabled={this.state.isLoadingCaptcha}
                      title="Refresh CAPTCHA"
                    >
                      <img src="/svg/refresh.svg" alt="Refresh" />
                    </CaptchaRefreshIcon>
                  </CaptchaContainer>
                </CaptchaSection>

                <Field>
                  <Input
                    type="text"
                    name="captchaInput"
                    placeholder="Enter the characters shown above"
                    value={this.state.captchaInput}
                    onChange={this.handleChange}
                    required
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
                onClick={() =>
                  this.setState({
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
