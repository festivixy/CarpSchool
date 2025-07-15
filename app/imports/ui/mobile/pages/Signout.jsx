import React from "react";
import { Meteor } from "meteor/meteor";
import { Link } from "react-router-dom";

/** Modern mobile signout page with clean design and user feedback */
export default class MobileSignout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSigningOut: true,
      signedOut: false,
    };
  }

  componentDidMount() {
    // Add a slight delay for better UX, then sign out
    setTimeout(() => {
      Meteor.logout(() => {
        this.setState({
          isSigningOut: false,
          signedOut: true,
        });
      });
    }, 800);
  }

  render() {
    const { isSigningOut, signedOut } = this.state;

    return (
      <>
        <div className="mobile-signout-container">
          <div className="mobile-signout-content">
            {isSigningOut ? (
              <div className="mobile-signout-loading">
                <div className="mobile-signout-spinner"></div>
                <h2 className="mobile-signout-loading-title">
                  Signing you out...
                </h2>
                <p className="mobile-signout-loading-message">
                  Please wait while we securely sign you out
                </p>
              </div>
            ) : (
              <div className="mobile-signout-success">
                <div className="mobile-signout-icon">👋</div>
                <h2 className="mobile-signout-title">You are signed out.</h2>

                <div className="mobile-signout-actions">
                  <Link to="/signin" className="mobile-signout-button-primary">
                    Sign In Again
                  </Link>
                  <Link to="/" className="mobile-signout-button-secondary">
                    Go to Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .mobile-signout-container {
            background: linear-gradient(
              135deg,
              rgba(248, 249, 250, 1) 0%,
              rgba(240, 242, 245, 1) 100%
            );
            min-height: 100vh;
            font-family:
              Inter,
              -apple-system,
              Roboto,
              Helvetica,
              sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
          }

          .mobile-signout-content {
            background-color: rgba(255, 255, 255, 1);
            border-radius: 16px;
            padding: 40px 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            text-align: center;
            max-width: 400px;
            width: 100%;
            border: 1px solid rgba(240, 240, 240, 1);
          }

          .mobile-signout-loading {
            animation: fadeIn 0.3s ease-out;
          }

          .mobile-signout-success {
            animation: slideUp 0.4s ease-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .mobile-signout-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(240, 240, 240, 1);
            border-top: 3px solid rgba(0, 0, 0, 1);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 24px;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          .mobile-signout-icon {
            font-size: 56px;
            margin-bottom: 24px;
            animation: wave 0.6s ease-out;
          }

          @keyframes wave {
            0%,
            100% {
              transform: rotate(0deg);
            }
            25% {
              transform: rotate(-10deg);
            }
            75% {
              transform: rotate(10deg);
            }
          }

          .mobile-signout-loading-title,
          .mobile-signout-title {
            font-size: 24px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.87);
            margin: 0 0 12px 0;
            letter-spacing: -0.3px;
          }

          .mobile-signout-loading-message,
          .mobile-signout-message {
            font-size: 16px;
            color: rgba(100, 100, 100, 1);
            line-height: 1.5;
            margin: 0 0 32px 0;
          }

          .mobile-signout-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .mobile-signout-button-primary,
          .mobile-signout-button-secondary {
            display: block;
            padding: 14px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
            font-family: inherit;
            text-align: center;
          }

          .mobile-signout-button-primary {
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .mobile-signout-button-primary:hover {
            background-color: rgba(40, 40, 40, 1);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            color: rgba(255, 255, 255, 1);
            text-decoration: none;
          }

          .mobile-signout-button-secondary {
            background-color: rgba(248, 249, 250, 1);
            color: rgba(0, 0, 0, 0.87);
            border: 1px solid rgba(224, 224, 224, 1);
          }

          .mobile-signout-button-secondary:hover {
            background-color: rgba(240, 240, 240, 1);
            transform: translateY(-1px);
            color: rgba(0, 0, 0, 0.87);
            text-decoration: none;
          }

          @media (max-width: 480px) {
            .mobile-signout-container {
              padding: 16px;
            }

            .mobile-signout-content {
              padding: 32px 20px;
            }

            .mobile-signout-loading-title,
            .mobile-signout-title {
              font-size: 20px;
            }

            .mobile-signout-loading-message,
            .mobile-signout-message {
              font-size: 14px;
            }

            .mobile-signout-icon {
              font-size: 48px;
            }
          }
        `}</style>
      </>
    );
  }
}
