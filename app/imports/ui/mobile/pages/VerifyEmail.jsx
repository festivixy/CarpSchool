import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Mobile VerifyEmail component with modern design
 */
export default class MobileVerifyEmail extends React.Component {
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
                We&apos;ve sent a verification link to your email address. Please
                check your inbox and click the link to activate your account.
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
            </div>

            <div className="mobile-verify-legal">
              By using our service, you agree to our{' '}
              <Link to="/tos" className="mobile-verify-legal-link">
                Terms of Service
              </Link>{' '}
              and{' '}
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
