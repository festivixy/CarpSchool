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
  ResendButton,
  SuccessMessage,
  ErrorMessage,
  Legal,
  LegalLink,
} from "../../../styles/VerifyEmail";
import Captcha from "../../../components/Captcha";

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
    };
    this.captchaRef = React.createRef();
  }

  /** Update the form controls each time the user interacts with them. */
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleResendVerification = () => {
    if (!this.captchaRef.current) {
      this.setState({ resendError: "Captcha component not available." });
      return;
    }

    this.setState({ isResending: true, resendMessage: "", resendError: "" });

    // First verify CAPTCHA using centralized component
    this.captchaRef.current.verify((captchaError, isValid) => {
      if (captchaError || !isValid) {
        this.setState({
          resendError: captchaError || "Invalid security code. Please try again.",
          isResending: false,
        });
        return;
      }

      const captchaData = this.captchaRef.current.getCaptchaData();

      // CAPTCHA is valid, proceed with sending verification email
      Meteor.call(
        "accounts.email.send.verification",
        captchaData.sessionId,
        (error) => {
          this.setState({ isResending: false });
          if (error) {
            this.setState({
              resendError:
                "Failed to send verification email. Please try again.",
            });
          } else {
            this.setState({
              resendMessage: "Verification email sent successfully!",
            });
            // Reset captcha after success
            this.captchaRef.current.reset();
          }
        },
      );
    });
  };

  render() {
    return (
      <Container>
        <Header>
          <AppName>CarpSchool</AppName>
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
            <ActionLink to="/login">Back to Sign In</ActionLink>
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
            <Captcha
              ref={this.captchaRef}
              autoGenerate={true}
              disabled={this.state.isResending}
            />

            <ResendButton
              onClick={this.handleResendVerification}
              disabled={this.state.isResending}
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
            <LegalLink to="/terms">Terms of Service</LegalLink> and{" "}
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
