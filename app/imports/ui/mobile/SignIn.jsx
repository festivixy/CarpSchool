import React from "react";
import PropTypes from "prop-types";
import { Link, Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Button } from "semantic-ui-react";

/**
 * Mobile SignIn component with modern design and full functionality including CAPTCHA
 */
export default class MobileSignIn extends React.Component {
  /** Initialize component state with properties for login and redirection. */
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      captchaInput: "",
      captchaSvg: "",
      captchaSessionId: "",
      error: "",
      redirectToReferer: false,
      isLoadingCaptcha: false,
      showCaptchaErrorModal: false,
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

  /** Close the CAPTCHA error modal */
  closeCaptchaErrorModal = () => {
    this.setState({ showCaptchaErrorModal: false });
  };

  /** Handle form submission */
  handleSubmit = (e) => {
    e.preventDefault();
    this.submit();
  };

  /** Handle Signin submission using Meteor's account mechanism. */
  submit = () => {
    const { email, password, captchaInput, captchaSessionId } = this.state;

    // First verify CAPTCHA
    Meteor.call(
      "captcha.verify",
      captchaSessionId,
      captchaInput,
      (captchaError, isValidCaptcha) => {
        if (captchaError || !isValidCaptcha) {
          this.setState({ showCaptchaErrorModal: true });
          this.generateNewCaptcha(); // Generate new CAPTCHA
          return;
        }

        // CAPTCHA is valid, proceed with login
        Meteor.loginWithPassword(email, password, (err) => {
          if (err) {
            this.setState({ error: err.reason });
            this.generateNewCaptcha(); // Generate new CAPTCHA on error
          } else {
            this.setState({ error: "", redirectToReferer: true });
          }
        });
      },
    );
  };

  /** Render the signin form. */
  render() {
    // if correct authentication, redirect to page instead of login screen
    if (this.state.redirectToReferer) {
      return <Redirect to={"/listMyRides"} />;
    }

    return (
      <div className="mobile-signin-container">
        <div className="mobile-signin-header">
          <img
            src="/images/Carpool.png"
            alt="App Logo"
            className="mobile-signin-logo"
          />
          <div className="mobile-signin-app-name">Carpool App</div>
        </div>

        <div className="mobile-signin-content">
          <div className="mobile-signin-copy">
            <div className="mobile-signin-title">Sign in to your account</div>
            <div className="mobile-signin-subtitle">
              Enter your credentials to access your account
            </div>
          </div>

          <form onSubmit={this.handleSubmit} className="mobile-signin-form">
            <div className="mobile-signin-input-section">
              <div className="mobile-signin-field">
                <input
                  type="email"
                  name="email"
                  placeholder="email@domain.com"
                  value={this.state.email}
                  onChange={this.handleChange}
                  className="mobile-signin-input"
                  required
                />
              </div>

              <div className="mobile-signin-field">
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={this.state.password}
                  onChange={this.handleChange}
                  className="mobile-signin-input"
                  required
                />
              </div>

              {/* CAPTCHA Section */}
              <div className="mobile-signin-captcha-section">
                <label className="mobile-signin-captcha-label">
                  Security Verification
                </label>
                <div className="mobile-signin-captcha-container">
                  {this.state.isLoadingCaptcha ? (
                    <div className="mobile-signin-captcha-loading">
                      Loading CAPTCHA...
                    </div>
                  ) : (
                    <div
                      className="mobile-signin-captcha-display"
                      dangerouslySetInnerHTML={{
                        __html: this.state.captchaSvg,
                      }}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={this.generateNewCaptcha}
                  disabled={this.state.isLoadingCaptcha}
                  className="mobile-signin-captcha-refresh"
                >
                  {this.state.isLoadingCaptcha
                    ? "Loading..."
                    : "Refresh CAPTCHA"}
                </button>
              </div>

              <div className="mobile-signin-field">
                <input
                  type="text"
                  name="captchaInput"
                  placeholder="Enter the characters shown above"
                  value={this.state.captchaInput}
                  onChange={this.handleChange}
                  className="mobile-signin-input"
                  required
                />
              </div>

              <button type="submit" className="mobile-signin-button">
                Sign In
              </button>
            </div>
          </form>

          {this.state.error && (
            <div className="mobile-signin-error">{this.state.error}</div>
          )}

          <div className="mobile-signin-divider">
            <div className="mobile-signin-divider-line"></div>
            <div className="mobile-signin-divider-text">or</div>
            <div className="mobile-signin-divider-line"></div>
          </div>

          <div className="mobile-signin-links">
            <Link to="/signup" className="mobile-signin-link">
              Don't have an account? Sign up
            </Link>
            <Link to="/forgot" className="mobile-signin-link">
              Forgot your password?
            </Link>
          </div>

          <div className="mobile-signin-legal">
            By signing in, you agree to our{" "}
            <span className="mobile-signin-legal-link">Terms of Service</span>{" "}
            and <span className="mobile-signin-legal-link">Privacy Policy</span>
          </div>
        </div>

        {/* CAPTCHA Error Modal */}
        {this.state.showCaptchaErrorModal && (
          <div className="mobile-signin-modal-overlay">
            <div className="mobile-signin-modal">
              <div className="mobile-signin-modal-header">Invalid CAPTCHA</div>
              <div className="mobile-signin-modal-content">
                The security verification code you entered is incorrect. Please
                try again with the new code that has been generated.
              </div>
              <div className="mobile-signin-modal-actions">
                <button
                  onClick={this.closeCaptchaErrorModal}
                  className="mobile-signin-modal-button"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .mobile-signin-container {
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

          .mobile-signin-header {
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

          .mobile-signin-logo {
            aspect-ratio: 2.57;
            object-fit: contain;
            object-position: center;
            width: 54px;
            border-radius: 32px;
            align-self: flex-start;
          }

          .mobile-signin-app-name {
            margin-top: 75px;
          }

          .mobile-signin-content {
            display: flex;
            margin-top: 74px;
            width: 100%;
            flex-direction: column;
            align-items: center;
            justify-content: start;
            padding: 0 24px;
          }

          .mobile-signin-copy {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: rgba(0, 0, 0, 1);
            text-align: center;
            justify-content: start;
          }

          .mobile-signin-title {
            font-size: 16px;
            font-weight: 600;
          }

          .mobile-signin-subtitle {
            font-size: 14px;
            font-weight: 400;
            margin-top: 4px;
          }

          .mobile-signin-form {
            margin-top: 24px;
            width: 100%;
            max-width: 327px;
          }

          .mobile-signin-input-section {
            width: 100%;
            font-size: 14px;
            line-height: 1.4;
          }

          .mobile-signin-field {
            margin-bottom: 16px;
          }

          .mobile-signin-input {
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
          }

          .mobile-signin-input:focus {
            border-color: rgba(0, 0, 0, 0.3);
            color: rgba(0, 0, 0, 1);
          }

          .mobile-signin-input::placeholder {
            color: rgba(130, 130, 130, 1);
          }

          .mobile-signin-captcha-section {
            margin: 20px 0;
            text-align: center;
          }

          .mobile-signin-captcha-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            font-size: 14px;
            color: rgba(0, 0, 0, 1);
          }

          .mobile-signin-captcha-container {
            border: 1px solid rgba(224, 224, 224, 1);
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 8px;
            background-color: rgba(249, 249, 249, 1);
            display: inline-block;
            min-height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-signin-captcha-loading {
            color: rgba(130, 130, 130, 1);
            font-size: 14px;
          }

          .mobile-signin-captcha-display {
            line-height: 1;
          }

          .mobile-signin-captcha-refresh {
            background-color: rgba(238, 238, 238, 1);
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 12px;
            color: rgba(0, 0, 0, 1);
            cursor: pointer;
            font-family: inherit;
          }

          .mobile-signin-captcha-refresh:hover {
            background-color: rgba(220, 220, 220, 1);
          }

          .mobile-signin-captcha-refresh:disabled {
            background-color: rgba(245, 245, 245, 1);
            color: rgba(150, 150, 150, 1);
            cursor: not-allowed;
          }

          .mobile-signin-button {
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

          .mobile-signin-button:hover {
            background-color: rgba(40, 40, 40, 1);
          }

          .mobile-signin-error {
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

          .mobile-signin-divider {
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

          .mobile-signin-divider-line {
            background-color: rgba(230, 230, 230, 1);
            height: 1px;
            flex: 1;
          }

          .mobile-signin-divider-text {
            padding: 0 8px;
          }

          .mobile-signin-links {
            margin-top: 24px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }

          .mobile-signin-link {
            color: rgba(0, 0, 0, 1);
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            padding: 8px;
          }

          .mobile-signin-link:hover {
            text-decoration: underline;
            color: rgba(0, 0, 0, 1);
          }

          .mobile-signin-legal {
            color: rgba(130, 130, 130, 1);
            font-size: 12px;
            font-weight: 400;
            line-height: 18px;
            text-align: center;
            margin-top: 24px;
            max-width: 327px;
          }

          .mobile-signin-legal-link {
            color: rgba(0, 0, 0, 1);
            cursor: pointer;
          }

          .mobile-signin-legal-link:hover {
            text-decoration: underline;
          }

          .mobile-signin-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .mobile-signin-modal {
            background-color: rgba(255, 255, 255, 1);
            border-radius: 12px;
            max-width: 400px;
            width: 100%;
            box-shadow:
              0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
            font-family:
              Inter,
              -apple-system,
              Roboto,
              Helvetica,
              sans-serif;
          }

          .mobile-signin-modal-header {
            padding: 24px 24px 16px 24px;
            font-size: 18px;
            font-weight: 600;
            color: rgba(0, 0, 0, 1);
            border-bottom: 1px solid rgba(240, 240, 240, 1);
          }

          .mobile-signin-modal-content {
            padding: 16px 24px 24px 24px;
            font-size: 14px;
            line-height: 1.5;
            color: rgba(100, 100, 100, 1);
          }

          .mobile-signin-modal-actions {
            padding: 0 24px 24px 24px;
            display: flex;
            justify-content: flex-end;
          }

          .mobile-signin-modal-button {
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            border: none;
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            font-family: inherit;
            min-width: 60px;
          }

          .mobile-signin-modal-button:hover {
            background-color: rgba(40, 40, 40, 1);
          }

          @media (max-width: 480px) {
            .mobile-signin-container {
              padding: 20px;
            }
          }
        `}</style>
      </div>
    );
  }
}

/** Ensure that the React Router location object is available in case we need to redirect. */
MobileSignIn.propTypes = {
  location: PropTypes.object,
};
