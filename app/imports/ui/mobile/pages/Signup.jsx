import React from "react";
import PropTypes from "prop-types";
import { Link, Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

/**
 * Mobile Signup component with modern design and full functionality including CAPTCHA
 */
export default class MobileSignup extends React.Component {
  /** Initialize component state with properties for signup and redirection. */
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

  /** Handle Signup submission. Create user account and a profile entry, then redirect to the home page. */
  submit = () => {
    const { email, password, captchaInput, captchaSessionId } = this.state;

    // First verify CAPTCHA
    Meteor.call(
      "captcha.verify",
      captchaSessionId,
      captchaInput,
      (captchaError, isValidCaptcha) => {
        if (captchaError || !isValidCaptcha) {
          this.setState({ error: "Invalid security code. Please try again." });
          this.generateNewCaptchaKeepError(); // Generate new CAPTCHA but keep any existing errors
          return;
        }

        // CAPTCHA is valid, proceed with account creation
        Accounts.createUser(
          {
            email,
            username: email,
            password,
            profile: {
              captchaSessionId: captchaSessionId, // Pass captcha session ID for server-side validation
            },
          },
          (err) => {
            if (err) {
              this.setState({ error: err.reason });
              this.generateNewCaptchaKeepError(); // Generate new CAPTCHA but keep error message
            } else {
              this.setState({ error: "", redirectToReferer: true });
            }
          },
        );
      },
    );
  };

  /** Render the signup form. */
  render() {
    const { from } = this.props.location?.state || {
      from: { pathname: "/imDriving" },
    };
    // if correct authentication, redirect to from: page instead of signup screen
    if (this.state.redirectToReferer) {
      return <Redirect to={from} />;
    }

    return (
      <>
        <div className="mobile-signup-container">
          <div className="mobile-signup-header">
            <div className="mobile-signup-app-name">Carpool App</div>
          </div>

          <div className="mobile-signup-content">
            <div className="mobile-signup-copy">
              <div className="mobile-signup-title">Create an account</div>
              <div className="mobile-signup-subtitle">
                Enter your information to sign up for this app
              </div>
            </div>

            <form onSubmit={this.handleSubmit} className="mobile-signup-form">
              <div className="mobile-signup-input-section">
                <div className="mobile-signup-field">
                  <input
                    type="email"
                    name="email"
                    placeholder="UH E-mail address"
                    value={this.state.email}
                    onChange={this.handleChange}
                    className="mobile-signup-input"
                    required
                  />
                </div>

                <div className="mobile-signup-field">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.handleChange}
                    className="mobile-signup-input"
                    required
                  />
                </div>

                {/* CAPTCHA Section */}
                <div className="mobile-signup-captcha-section">
                  <label className="mobile-signup-captcha-label">
                    Security Verification
                  </label>
                  <div className="mobile-signup-captcha-container">
                    {this.state.isLoadingCaptcha ? (
                      <div className="mobile-signup-captcha-loading">
                        Loading CAPTCHA...
                      </div>
                    ) : (
                      <div
                        className="mobile-signup-captcha-display"
                        dangerouslySetInnerHTML={{
                          __html: this.state.captchaSvg,
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={this.generateNewCaptcha}
                      disabled={this.state.isLoadingCaptcha}
                      className="mobile-signup-captcha-refresh-icon"
                      title="Refresh CAPTCHA"
                    >
                      <img src="/svg/refresh.svg" alt="Refresh" />
                    </button>
                  </div>
                </div>

                <div className="mobile-signup-field">
                  <input
                    type="text"
                    name="captchaInput"
                    placeholder="Enter the characters shown above"
                    value={this.state.captchaInput}
                    onChange={this.handleChange}
                    className="mobile-signup-input"
                    required
                  />
                </div>

                <button type="submit" className="mobile-signup-button">
                  Create Account
                </button>
              </div>
            </form>

            {this.state.error && (
              <div className="mobile-signup-error">{this.state.error}</div>
            )}

            <div className="mobile-signup-divider">
              <div className="mobile-signup-divider-line"></div>
              <div className="mobile-signup-divider-text">or</div>
              <div className="mobile-signup-divider-line"></div>
            </div>

            <div className="mobile-signup-links">
              <Link to="/signin" className="mobile-signup-link">
                Already have an account? Sign in
              </Link>
            </div>

            <div className="mobile-signup-legal">
              By creating an account, you agree to our{" "}
              <Link to="/tos" className="mobile-signup-legal-link">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="mobile-signup-legal-link">
                Privacy Policy
              </Link>
            </div>
          </div>

          <style jsx>{`
            .mobile-signup-container {
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

            .mobile-signup-header {
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

            .mobile-signup-app-name {
              margin-top: 75px;
            }

            .mobile-signup-content {
              display: flex;
              margin-top: 74px;
              width: 100%;
              flex-direction: column;
              align-items: center;
              justify-content: start;
              padding: 0 24px;
            }

            .mobile-signup-copy {
              display: flex;
              flex-direction: column;
              align-items: center;
              color: rgba(0, 0, 0, 1);
              text-align: center;
              justify-content: start;
            }

            .mobile-signup-title {
              font-size: 16px;
              font-weight: 600;
            }

            .mobile-signup-subtitle {
              font-size: 14px;
              font-weight: 400;
              margin-top: 4px;
            }

            .mobile-signup-form {
              margin-top: 24px;
              width: 100%;
              max-width: 327px;
            }

            .mobile-signup-input-section {
              width: 100%;
              font-size: 14px;
              line-height: 1.4;
            }

            .mobile-signup-field {
              margin-bottom: 16px;
            }

            .mobile-signup-input {
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

            .mobile-signup-input:focus {
              border-color: rgba(0, 0, 0, 0.3);
              color: rgba(0, 0, 0, 1);
            }

            .mobile-signup-input::placeholder {
              color: rgba(130, 130, 130, 1);
            }

            .mobile-signup-captcha-section {
              margin: 20px 0;
              text-align: center;
            }

            .mobile-signup-captcha-label {
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
              font-size: 14px;
              color: rgba(0, 0, 0, 1);
            }

            .mobile-signup-captcha-container {
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

            .mobile-signup-captcha-loading {
              color: rgba(130, 130, 130, 1);
              font-size: 14px;
            }

            .mobile-signup-captcha-display {
              line-height: 1;
            }

            .mobile-signup-captcha-refresh-icon {
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

            .mobile-signup-captcha-refresh-icon img {
              width: 14px;
              height: 14px;
              opacity: 0.7;
            }

            .mobile-signup-captcha-refresh-icon:hover:not(:disabled) {
              background-color: rgba(255, 255, 255, 1);
              border-color: rgba(0, 0, 0, 0.3);
              transform: scale(1.1);
            }

            .mobile-signup-captcha-refresh-icon:hover:not(:disabled) img {
              opacity: 1;
            }

            .mobile-signup-captcha-refresh-icon:disabled {
              background-color: rgba(245, 245, 245, 0.8);
              cursor: not-allowed;
              transform: none;
            }

            .mobile-signup-captcha-refresh-icon:disabled img {
              opacity: 0.3;
            }

            .mobile-signup-button {
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

            .mobile-signup-button:hover {
              background-color: rgba(40, 40, 40, 1);
            }

            .mobile-signup-error {
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

            .mobile-signup-divider {
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

            .mobile-signup-divider-line {
              background-color: rgba(230, 230, 230, 1);
              height: 1px;
              flex: 1;
            }

            .mobile-signup-divider-text {
              padding: 0 8px;
            }

            .mobile-signup-links {
              margin-top: 24px;
              display: flex;
              flex-direction: column;
              gap: 8px;
              text-align: center;
            }

            .mobile-signup-link {
              color: rgba(0, 0, 0, 1);
              font-size: 14px;
              font-weight: 500;
              text-decoration: none;
              padding: 8px;
            }

            .mobile-signup-link:hover {
              text-decoration: underline;
              color: rgba(0, 0, 0, 1);
            }

            .mobile-signup-legal {
              color: rgba(130, 130, 130, 1);
              font-size: 12px;
              font-weight: 400;
              line-height: 18px;
              text-align: center;
              margin-top: 24px;
              max-width: 327px;
            }

            .mobile-signup-legal-link {
              color: rgba(0, 0, 0, 1);
              cursor: pointer;
            }

            .mobile-signup-legal-link:hover {
              text-decoration: underline;
            }

            @media (max-width: 480px) {
              .mobile-signup-container {
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
MobileSignup.propTypes = {
  location: PropTypes.object,
};
