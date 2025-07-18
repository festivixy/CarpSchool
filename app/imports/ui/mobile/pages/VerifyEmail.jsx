import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import {
  Container,
  Header,
  AppName,
  Content,
  Icon,
  Copy,
  Title,
  Subtitle,
  Actions,
  ActionLink,
  Help,
  CaptchaSection,
  CaptchaLabel,
  CaptchaContainer,
  CaptchaLoading,
  CaptchaDisplay,
  CaptchaRefreshIcon,
  CaptchaInputWrapper,
  Input,
  ResendButton,
  SuccessMessage,
  ErrorMessage,
  Legal,
  LegalLink,
} from "../styles/VerifyEmail";

/**
 * Mobile VerifyEmail component with modern design
 */
export default class MobileVerifyEmail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isResending: false,
      resendMessage: "",
      resendError: "",
      captchaInput: "",
      captchaSvg: "",
      captchaSessionId: "",
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
          resendError: "Failed to load CAPTCHA. Please try again.",
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

  handleResendVerification = () => {
    const { captchaInput, captchaSessionId } = this.state;

    if (!captchaInput.trim()) {
      this.setState({ resendError: "Please enter the security code." });
      return;
    }

    this.setState({ isResending: true, resendMessage: "", resendError: "" });

    // First verify CAPTCHA
    Meteor.call(
      "captcha.verify",
      captchaSessionId,
      captchaInput,
      (captchaError, isValidCaptcha) => {
        if (captchaError || !isValidCaptcha) {
          this.setState({
            resendError: "Invalid security code. Please try again.",
            isResending: false,
          });
          this.generateNewCaptcha();
          return;
        }

        // CAPTCHA is valid, proceed with sending verification email
        Meteor.call(
          "accounts.email.send.verification",
          captchaSessionId,
          (error) => {
            this.setState({ isResending: false });
            if (error) {
              this.setState({
                resendError:
                  "Failed to send verification email. Please try again.",
              });
              this.generateNewCaptcha();
            } else {
              this.setState({
                resendMessage: "Verification email sent successfully!",
                captchaInput: "",
              });
              this.generateNewCaptcha();
            }
          },
        );
      },
    );
  };

  render() {
    return (
      <Container>
        <Header>
          <AppName>Carpool App</AppName>
        </Header>

        <Content>
          <Icon>📧</Icon>

          <Copy>
            <Title>Please verify your email</Title>
            <Subtitle>
              We&apos;ve sent a verification link to your email address. Please
              check your inbox and click the link to activate your account.
            </Subtitle>
          </Copy>

          <Actions>
            <ActionLink to="/signin">Back to Sign In</ActionLink>
            <ActionLink to="/signout">Sign Out</ActionLink>
          </Actions>

          <Help>
            <p>Didn&apos;t receive the email?</p>
            <ul>
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and try again</li>
            </ul>

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

            <CaptchaInputWrapper>
              <Input
                type="text"
                name="captchaInput"
                placeholder="Enter the characters shown above"
                value={this.state.captchaInput}
                onChange={this.handleChange}
                required
              />
            </CaptchaInputWrapper>

            <ResendButton
              onClick={this.handleResendVerification}
              disabled={
                this.state.isResending || !this.state.captchaInput.trim()
              }
            >
              {this.state.isResending
                ? "Sending..."
                : "Resend Verification Email"}
            </ResendButton>

            {this.state.resendMessage && (
              <SuccessMessage>{this.state.resendMessage}</SuccessMessage>
            )}

            {this.state.resendError && (
              <ErrorMessage>{this.state.resendError}</ErrorMessage>
            )}
          </Help>

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
MobileVerifyEmail.propTypes = {
  location: PropTypes.object,
};
