import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";

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
          resendError: "",
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
      <>
        <div className="mobile-verify-container">
          <div className="mobile-verify-header">
            <div className="mobile-verify-app-name">Carpool App</div>
          </div>

          <div className="mobile-verify-content">
            <div className="mobile-verify-icon">📧</div>

            <div className="mobile-verify-copy">
              <div className="mobile-verify-title">
                Please verify your email
              </div>
              <div className="mobile-verify-subtitle">
                We&apos;ve sent a verification link to your email address.
                Please check your inbox and click the link to activate your
                account.
              </div>
            </div>

            <div className="mobile-verify-actions">
              <Link to="/signin" className="mobile-verify-link">
                Back to Sign In
              </Link>
              <Link to="/signout" className="mobile-verify-link">
                Sign Out
              </Link>
            </div>

            <div className="mobile-verify-help">
              <p>Didn&apos;t receive the email?</p>
              <ul>
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes and try again</li>
              </ul>

              {/* CAPTCHA Section */}
              <div className="mobile-verify-captcha-section">
                <label className="mobile-verify-captcha-label">
                  Security Verification
                </label>
                <div className="mobile-verify-captcha-container">
                  {this.state.isLoadingCaptcha ? (
                    <div className="mobile-verify-captcha-loading">
                      Loading CAPTCHA...
                    </div>
                  ) : (
                    <div
                      className="mobile-verify-captcha-display"
                      dangerouslySetInnerHTML={{
                        __html: this.state.captchaSvg,
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={this.generateNewCaptcha}
                    disabled={this.state.isLoadingCaptcha}
                    className="mobile-verify-captcha-refresh-icon"
                    title="Refresh CAPTCHA"
                  >
                    <img src="/svg/refresh.svg" alt="Refresh" />
                  </button>
                </div>
              </div>

              <div className="mobile-verify-captcha-input">
                <input
                  type="text"
                  name="captchaInput"
                  placeholder="Enter the characters shown above"
                  value={this.state.captchaInput}
                  onChange={this.handleChange}
                  className="mobile-verify-input"
                  required
                />
              </div>

              <button
                className="mobile-verify-resend-btn"
                onClick={this.handleResendVerification}
                disabled={
                  this.state.isResending || !this.state.captchaInput.trim()
                }
              >
                {this.state.isResending
                  ? "Sending..."
                  : "Resend Verification Email"}
              </button>

              {this.state.resendMessage && (
                <div className="mobile-verify-success-message">
                  {this.state.resendMessage}
                </div>
              )}

              {this.state.resendError && (
                <div className="mobile-verify-error-message">
                  {this.state.resendError}
                </div>
              )}
            </div>

            <div className="mobile-verify-legal">
              By using our service, you agree to our{" "}
              <Link to="/tos" className="mobile-verify-legal-link">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="mobile-verify-legal-link">
                Privacy Policy
              </Link>
            </div>
          </div>

          <style jsx>{`
            .mobile-verify-container {
              background-color: rgba(255, 255, 255, 1);
              display: flex;
              width: 100%;
              flex-direction: column;
              align-items: center;
              font-family:
                Inter,
                -apple-system,
                Roboto,
                Helvetica,
                sans-serif;
              margin: 0 auto;
              padding: 10px 0;
              min-height: 100vh;
              box-sizing: border-box;
            }

            .mobile-verify-header {
              display: flex;
              width: 224px;
              max-width: 100%;
              flex-direction: column;
              font-size: 24px;
              color: rgba(0, 0, 0, 1);
              font-weight: 600;
              text-align: center;
              letter-spacing: -0.24px;
              align-items: center;
            }

            .mobile-verify-app-name {
              margin-top: 75px;
            }

            .mobile-verify-content {
              display: flex;
              margin-top: 74px;
              width: 100%;
              flex-direction: column;
              align-items: center;
              justify-content: start;
              padding: 0 24px;
              max-width: 400px;
            }

            .mobile-verify-icon {
              font-size: 64px;
              margin-bottom: 24px;
              opacity: 0.8;
            }

            .mobile-verify-copy {
              display: flex;
              flex-direction: column;
              align-items: center;
              color: rgba(0, 0, 0, 1);
              text-align: center;
              justify-content: start;
              margin-bottom: 32px;
            }

            .mobile-verify-title {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 12px;
            }

            .mobile-verify-subtitle {
              font-size: 16px;
              font-weight: 400;
              line-height: 1.5;
              color: rgba(100, 100, 100, 1);
            }

            .mobile-verify-actions {
              margin-bottom: 32px;
            }

            .mobile-verify-link {
              background-color: rgba(0, 0, 0, 1);
              color: rgba(255, 255, 255, 1);
              text-decoration: none;
              border-radius: 8px;
              padding: 12px 24px;
              font-size: 16px;
              font-weight: 500;
              transition: all 0.2s ease;
              display: inline-block;
            }

            .mobile-verify-link:hover {
              background-color: rgba(40, 40, 40, 1);
              color: rgba(255, 255, 255, 1);
              transform: translateY(-1px);
            }

            .mobile-verify-help {
              background-color: rgba(248, 249, 250, 1);
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 32px;
              width: 100%;
              box-sizing: border-box;
            }

            .mobile-verify-help p {
              font-size: 14px;
              font-weight: 600;
              color: rgba(0, 0, 0, 1);
              margin: 0 0 12px 0;
            }

            .mobile-verify-help ul {
              margin: 0;
              padding-left: 16px;
              font-size: 14px;
              color: rgba(100, 100, 100, 1);
              line-height: 1.5;
            }

            .mobile-verify-help li {
              margin-bottom: 4px;
            }

            .mobile-verify-help li:last-child {
              margin-bottom: 0;
            }

            .mobile-verify-resend-btn {
              background-color: rgba(0, 122, 255, 1);
              color: rgba(255, 255, 255, 1);
              border: none;
              border-radius: 8px;
              padding: 12px 20px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
              margin-top: 16px;
              width: 100%;
              box-sizing: border-box;
            }

            .mobile-verify-resend-btn:hover:not(:disabled) {
              background-color: rgba(0, 100, 220, 1);
              transform: translateY(-1px);
            }

            .mobile-verify-resend-btn:disabled {
              background-color: rgba(150, 150, 150, 1);
              cursor: not-allowed;
              transform: none;
            }

            .mobile-verify-success-message {
              background-color: rgba(46, 160, 67, 0.1);
              color: rgba(46, 160, 67, 1);
              border: 1px solid rgba(46, 160, 67, 0.2);
              border-radius: 6px;
              padding: 8px 12px;
              font-size: 14px;
              margin-top: 12px;
              text-align: center;
            }

            .mobile-verify-error-message {
              background-color: rgba(255, 59, 48, 0.1);
              color: rgba(255, 59, 48, 1);
              border: 1px solid rgba(255, 59, 48, 0.2);
              border-radius: 6px;
              padding: 8px 12px;
              font-size: 14px;
              margin-top: 12px;
              text-align: center;
            }

            .mobile-verify-captcha-section {
              margin: 20px 0 16px 0;
              text-align: center;
            }

            .mobile-verify-captcha-label {
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
              font-size: 14px;
              color: rgba(0, 0, 0, 1);
            }

            .mobile-verify-captcha-container {
              border: 1px solid rgba(224, 224, 224, 1);
              border-radius: 8px;
              padding: 10px;
              margin-bottom: 8px;
              background-color: rgba(249, 249, 249, 1);
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 50px;
              position: relative;
            }

            .mobile-verify-captcha-loading {
              color: rgba(130, 130, 130, 1);
              font-size: 14px;
            }

            .mobile-verify-captcha-display {
              line-height: 1;
            }

            .mobile-verify-captcha-refresh-icon {
              position: absolute;
              bottom: 4px;
              right: 4px;
              background-color: rgba(255, 255, 255, 0.9);
              border: 1px solid rgba(200, 200, 200, 1);
              border-radius: 50%;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s ease;
              backdrop-filter: blur(2px);
              padding: 0;
            }

            .mobile-verify-captcha-refresh-icon img {
              width: 14px;
              height: 14px;
              opacity: 0.7;
            }

            .mobile-verify-captcha-refresh-icon:hover:not(:disabled) {
              background-color: rgba(255, 255, 255, 1);
              border-color: rgba(0, 0, 0, 0.3);
              transform: scale(1.1);
            }

            .mobile-verify-captcha-refresh-icon:hover:not(:disabled) img {
              opacity: 1;
            }

            .mobile-verify-captcha-refresh-icon:disabled {
              background-color: rgba(245, 245, 245, 0.8);
              cursor: not-allowed;
              transform: none;
            }

            .mobile-verify-captcha-refresh-icon:disabled img {
              opacity: 0.3;
            }

            .mobile-verify-captcha-input {
              margin-bottom: 16px;
            }

            .mobile-verify-input {
              border-radius: 8px;
              background-color: rgba(255, 255, 255, 1);
              display: flex;
              min-height: 40px;
              width: 100%;
              color: rgba(130, 130, 130, 1);
              font-weight: 400;
              padding: 10px 16px;
              border: 1px solid rgba(224, 224, 224, 1);
              font-size: 14px;
              font-family: inherit;
              outline: none;
              box-sizing: border-box;
            }

            .mobile-verify-input:focus {
              border-color: rgba(0, 0, 0, 0.3);
              color: rgba(0, 0, 0, 1);
            }

            .mobile-verify-input::placeholder {
              color: rgba(130, 130, 130, 1);
            }

            .mobile-verify-legal {
              color: rgba(130, 130, 130, 1);
              font-size: 12px;
              font-weight: 400;
              line-height: 18px;
              text-align: center;
              max-width: 327px;
            }

            .mobile-verify-legal-link {
              color: rgba(0, 0, 0, 1);
              text-decoration: none;
            }

            .mobile-verify-legal-link:hover {
              text-decoration: underline;
            }

            @media (max-width: 480px) {
              .mobile-verify-container {
                padding: 20px;
              }

              .mobile-verify-content {
                padding: 0 16px;
              }

              .mobile-verify-icon {
                font-size: 48px;
              }

              .mobile-verify-title {
                font-size: 18px;
              }

              .mobile-verify-subtitle {
                font-size: 14px;
              }
            }
          `}</style>
        </div>
      </>
    );
  }
}

/** Ensure that the React Router location object is available in case we need to redirect. */
MobileVerifyEmail.propTypes = {
  location: PropTypes.object,
};
