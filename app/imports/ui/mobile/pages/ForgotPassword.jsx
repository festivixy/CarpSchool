import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";

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
      <>
        <div className="mobile-forgot-container">
          <div className="mobile-forgot-header">
            <div className="mobile-forgot-app-name">Carpool App</div>
          </div>

          <div className="mobile-forgot-content">
            <div className="mobile-forgot-copy">
              <div className="mobile-forgot-title">Forgot your password?</div>
              <div className="mobile-forgot-subtitle">
                Enter your email address and we'll send you a link to reset your
                password
              </div>
            </div>

            {!this.state.success ? (
              <form onSubmit={this.handleSubmit} className="mobile-forgot-form">
                <div className="mobile-forgot-input-section">
                  <div className="mobile-forgot-field">
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={this.state.email}
                      onChange={this.handleChange}
                      className="mobile-forgot-input"
                      required
                    />
                  </div>

                  {/* CAPTCHA Section */}
                  <div className="mobile-forgot-captcha-section">
                    <label className="mobile-forgot-captcha-label">
                      Security Verification
                    </label>
                    <div className="mobile-forgot-captcha-container">
                      {this.state.isLoadingCaptcha ? (
                        <div className="mobile-forgot-captcha-loading">
                          Loading CAPTCHA...
                        </div>
                      ) : (
                        <div
                          className="mobile-forgot-captcha-display"
                          dangerouslySetInnerHTML={{
                            __html: this.state.captchaSvg,
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={this.generateNewCaptcha}
                        disabled={this.state.isLoadingCaptcha}
                        className="mobile-forgot-captcha-refresh-icon"
                        title="Refresh CAPTCHA"
                      >
                        <img src="/svg/refresh.svg" alt="Refresh" />
                      </button>
                    </div>
                  </div>

                  <div className="mobile-forgot-field">
                    <input
                      type="text"
                      name="captchaInput"
                      placeholder="Enter the characters shown above"
                      value={this.state.captchaInput}
                      onChange={this.handleChange}
                      className="mobile-forgot-input"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="mobile-forgot-button"
                    disabled={this.state.isSubmitting}
                  >
                    {this.state.isSubmitting ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mobile-forgot-success">
                <div className="mobile-forgot-success-icon">✓</div>
                <div className="mobile-forgot-success-title">Email sent!</div>
                <div className="mobile-forgot-success-message">
                  Check your email for a link to reset your password. If it
                  doesn't appear within a few minutes, check your spam folder.
                </div>
                <button
                  onClick={() =>
                    this.setState({
                      success: false,
                      email: "",
                      captchaInput: "",
                    })
                  }
                  className="mobile-forgot-back-button"
                >
                  Send another email
                </button>
              </div>
            )}

            {this.state.error && (
              <div className="mobile-forgot-error">{this.state.error}</div>
            )}

            <div className="mobile-forgot-divider">
              <div className="mobile-forgot-divider-line"></div>
              <div className="mobile-forgot-divider-text">or</div>
              <div className="mobile-forgot-divider-line"></div>
            </div>

            <div className="mobile-forgot-links">
              <Link to="/signin" className="mobile-forgot-link">
                Back to Sign In
              </Link>
              <Link to="/signup" className="mobile-forgot-link">
                Don't have an account? Sign up
              </Link>
            </div>

            <div className="mobile-forgot-legal">
              By using our service, you agree to our{" "}
              <Link to="/tos" className="mobile-forgot-legal-link">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="mobile-forgot-legal-link">
                Privacy Policy
              </Link>
            </div>
          </div>

          <style jsx>{`
            .mobile-forgot-container {
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

            .mobile-forgot-header {
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

            .mobile-forgot-app-name {
              margin-top: 75px;
            }

            .mobile-forgot-content {
              display: flex;
              margin-top: 74px;
              width: 100%;
              flex-direction: column;
              align-items: center;
              justify-content: start;
              padding: 0 24px;
            }

            .mobile-forgot-copy {
              display: flex;
              flex-direction: column;
              align-items: center;
              color: rgba(0, 0, 0, 1);
              text-align: center;
              justify-content: start;
              max-width: 327px;
            }

            .mobile-forgot-title {
              font-size: 16px;
              font-weight: 600;
            }

            .mobile-forgot-subtitle {
              font-size: 14px;
              font-weight: 400;
              margin-top: 8px;
              line-height: 1.4;
            }

            .mobile-forgot-form {
              margin-top: 24px;
              width: 100%;
              max-width: 327px;
            }

            .mobile-forgot-input-section {
              width: 100%;
              font-size: 14px;
              line-height: 1.4;
            }

            .mobile-forgot-field {
              margin-bottom: 16px;
            }

            .mobile-forgot-input {
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

            .mobile-forgot-input:focus {
              border-color: rgba(0, 0, 0, 0.3);
              color: rgba(0, 0, 0, 1);
            }

            .mobile-forgot-input::placeholder {
              color: rgba(130, 130, 130, 1);
            }

            .mobile-forgot-button {
              border-radius: 8px;
              background-color: rgba(0, 0, 0, 1);
              display: flex;
              min-height: 40px;
              width: 100%;
              align-items: center;
              color: rgba(255, 255, 255, 1);
              font-weight: 500;
              justify-content: center;
              padding: 0 16px;
              border: none;
              font-size: 14px;
              font-family: inherit;
              cursor: pointer;
            }

            .mobile-forgot-button:hover:not(:disabled) {
              background-color: rgba(40, 40, 40, 1);
            }

            .mobile-forgot-button:disabled {
              background-color: rgba(150, 150, 150, 1);
              cursor: not-allowed;
            }

            .mobile-forgot-success {
              margin-top: 24px;
              width: 100%;
              max-width: 327px;
              text-align: center;
              padding: 24px;
              border-radius: 12px;
              background-color: rgba(240, 255, 240, 1);
              border: 1px solid rgba(200, 255, 200, 1);
            }

            .mobile-forgot-success-icon {
              font-size: 48px;
              color: rgba(0, 150, 0, 1);
              margin-bottom: 16px;
            }

            .mobile-forgot-success-title {
              font-size: 18px;
              font-weight: 600;
              color: rgba(0, 0, 0, 1);
              margin-bottom: 8px;
            }

            .mobile-forgot-success-message {
              font-size: 14px;
              color: rgba(100, 100, 100, 1);
              line-height: 1.4;
              margin-bottom: 20px;
            }

            .mobile-forgot-back-button {
              border-radius: 8px;
              background-color: rgba(0, 150, 0, 1);
              color: rgba(255, 255, 255, 1);
              border: none;
              padding: 8px 16px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              font-family: inherit;
            }

            .mobile-forgot-back-button:hover {
              background-color: rgba(0, 120, 0, 1);
            }

            .mobile-forgot-error {
              background-color: rgba(255, 240, 240, 1);
              border: 1px solid rgba(255, 200, 200, 1);
              border-radius: 8px;
              padding: 12px 16px;
              margin-top: 16px;
              color: rgba(200, 0, 0, 1);
              font-size: 14px;
              text-align: center;
              width: 100%;
              max-width: 327px;
            }

            .mobile-forgot-divider {
              display: flex;
              margin-top: 24px;
              max-width: 100%;
              width: 327px;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              color: rgba(130, 130, 130, 1);
              font-weight: 400;
              text-align: center;
              line-height: 1.4;
              justify-content: center;
            }

            .mobile-forgot-divider-line {
              background-color: rgba(230, 230, 230, 1);
              height: 1px;
              flex: 1;
            }

            .mobile-forgot-divider-text {
              padding: 0 8px;
            }

            .mobile-forgot-links {
              margin-top: 24px;
              display: flex;
              flex-direction: column;
              gap: 8px;
              text-align: center;
            }

            .mobile-forgot-link {
              color: rgba(0, 0, 0, 1);
              font-size: 14px;
              font-weight: 500;
              text-decoration: none;
              padding: 8px;
            }

            .mobile-forgot-link:hover {
              text-decoration: underline;
              color: rgba(0, 0, 0, 1);
            }

            .mobile-forgot-legal {
              color: rgba(130, 130, 130, 1);
              font-size: 12px;
              font-weight: 400;
              line-height: 18px;
              text-align: center;
              margin-top: 24px;
              max-width: 327px;
            }

            .mobile-forgot-legal-link {
              color: rgba(0, 0, 0, 1);
              text-decoration: none;
            }

            .mobile-forgot-legal-link:hover {
              text-decoration: underline;
            }

            .mobile-forgot-captcha-section {
              margin: 20px 0;
              text-align: center;
            }

            .mobile-forgot-captcha-label {
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
              font-size: 14px;
              color: rgba(0, 0, 0, 1);
            }

            .mobile-forgot-captcha-container {
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

            .mobile-forgot-captcha-loading {
              color: rgba(130, 130, 130, 1);
              font-size: 14px;
            }

            .mobile-forgot-captcha-display {
              line-height: 1;
            }

            .mobile-forgot-captcha-refresh-icon {
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

            .mobile-forgot-captcha-refresh-icon img {
              width: 14px;
              height: 14px;
              opacity: 0.7;
            }

            .mobile-forgot-captcha-refresh-icon:hover:not(:disabled) {
              background-color: rgba(255, 255, 255, 1);
              border-color: rgba(0, 0, 0, 0.3);
              transform: scale(1.1);
            }

            .mobile-forgot-captcha-refresh-icon:hover:not(:disabled) img {
              opacity: 1;
            }

            .mobile-forgot-captcha-refresh-icon:disabled {
              background-color: rgba(245, 245, 245, 0.8);
              cursor: not-allowed;
              transform: none;
            }

            .mobile-forgot-captcha-refresh-icon:disabled img {
              opacity: 0.3;
            }

            @media (max-width: 480px) {
              .mobile-forgot-container {
                padding: 20px;
              }
            }
          `}</style>
        </div>
      </>
    );
  }
}

/** Ensure that the React Router location object is available in case we need to redirect. */
MobileForgotPassword.propTypes = {
  location: PropTypes.object,
};
