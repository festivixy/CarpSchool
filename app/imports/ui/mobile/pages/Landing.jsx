import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Modern Mobile Landing page with comprehensive features and modern design
 */
export default class MobileLanding extends React.Component {
  render() {
    return (
      <>
        <div className="mobile-landing-container">
          {/* Hero Section */}
          <div className="mobile-landing-hero">
            <div className="mobile-landing-hero-content">
              <div className="mobile-landing-logo-section">
                <h1 className="mobile-landing-app-name">Carpool</h1>
              </div>

              <div className="mobile-landing-cta-section">
                <Link to="/signup" className="mobile-landing-cta-primary">
                  Get Started
                </Link>
                <Link to="/signin" className="mobile-landing-cta-secondary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* What is Carpool Section */}
          <div className="mobile-landing-features">
            <div className="mobile-landing-section-header">
              <h2 className="mobile-landing-section-title">What is Carpool?</h2>
            </div>

            <div className="mobile-landing-content">
              <p className="mobile-landing-paragraph">
                The Carpool website provides a space for students traveling
                to/from the school campus to easily coordinate carpools.
              </p>

              <p className="mobile-landing-paragraph">
                The use of school email/school ID numbers ensures that each user
                is a verified school student; this system also prohibits banned
                users from continuing to use the Carpool website.
              </p>
            </div>
          </div>

          {/* How to Use Carpool Section */}
          <div className="mobile-landing-how-it-works">
            <div className="mobile-landing-section-header">
              <h2 className="mobile-landing-section-title">
                How to Use Carpool
              </h2>
            </div>

            <div className="mobile-landing-content">
              <p className="mobile-landing-paragraph">
                After signing up for Carpool with your school email, users can
                sign in to look through a list of future rides or create a new
                ride. After creating a new ride or signing up for a ride, users
                can view their scheduled rides on their calendar.
              </p>

              <p className="mobile-landing-paragraph">
                The user profile can be edited to set your information,
                including: contact info, address/location, user type (driver,
                rider, or both), and car picture.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mobile-landing-final-cta">
            <div className="mobile-landing-cta-content">
              <h2 className="mobile-landing-cta-title">
                Ready to Start Carpooling?
              </h2>
              <div className="mobile-landing-cta-buttons">
                <Link to="/signup" className="mobile-landing-cta-primary">
                  Create Account
                </Link>
                <Link to="/signin" className="mobile-landing-cta-secondary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          <style jsx>{`
            .mobile-landing-container {
              background-color: rgba(255, 255, 255, 1);
              width: 100%;
              font-family:
                Inter,
                -apple-system,
                Roboto,
                Helvetica,
                sans-serif;
              overflow-x: hidden;
            }

            /* Hero Section */
            .mobile-landing-hero {
              background: linear-gradient(
                135deg,
                rgba(0, 0, 0, 0.9) 0%,
                rgba(40, 40, 40, 0.8) 100%
              );
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              position: relative;
            }

            .mobile-landing-hero-content {
              text-align: center;
              color: white;
              max-width: 400px;
              width: 100%;
            }

            .mobile-landing-logo-section {
              margin-bottom: 40px;
            }

            .mobile-landing-app-icon {
              font-size: 60px;
              margin-bottom: 16px;
            }

            .mobile-landing-app-name {
              font-size: 32px;
              font-weight: 700;
              margin: 0 0 8px 0;
              letter-spacing: -0.5px;
              color: rgba(255, 255, 255, 1) !important;
            }

            .mobile-landing-cta-section {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .mobile-landing-cta-primary {
              background-color: rgba(255, 255, 255, 1);
              color: rgba(0, 0, 0, 1);
              padding: 14px 24px;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 600;
              text-decoration: none;
              transition: all 0.2s ease;
            }

            .mobile-landing-cta-primary:hover {
              background-color: rgba(240, 240, 240, 1);
              color: rgba(0, 0, 0, 1);
              transform: translateY(-1px);
            }

            .mobile-landing-cta-secondary {
              color: rgba(255, 255, 255, 1);
              padding: 14px 24px;
              border: 2px solid rgba(255, 255, 255, 0.3);
              border-radius: 12px;
              font-size: 16px;
              font-weight: 500;
              text-decoration: none;
              transition: all 0.2s ease;
            }

            .mobile-landing-cta-secondary:hover {
              background-color: rgba(255, 255, 255, 0.1);
              border-color: rgba(255, 255, 255, 0.5);
              color: rgba(255, 255, 255, 1);
            }

            /* Features Section */
            .mobile-landing-features {
              padding: 60px 20px;
              background-color: rgba(250, 250, 250, 1);
            }

            .mobile-landing-section-header {
              text-align: center;
              margin-bottom: 40px;
            }

            .mobile-landing-section-title {
              font-size: 24px;
              font-weight: 700;
              color: rgba(0, 0, 0, 0.87);
              margin: 0 0 8px 0;
              letter-spacing: -0.3px;
            }

            .mobile-landing-section-title::selection {
              background-color: rgba(0, 0, 0, 0.1);
              color: inherit;
            }

            .mobile-landing-section-subtitle {
              font-size: 16px;
              font-weight: 400;
              color: rgba(100, 100, 100, 1);
              margin: 0;
              line-height: 1.4;
            }

            .mobile-landing-content {
              max-width: 400px;
              margin: 0 auto;
              padding: 0 20px;
            }

            .mobile-landing-paragraph {
              font-size: 16px;
              font-weight: 400;
              color: rgba(60, 60, 60, 1);
              margin: 0 0 20px 0;
              line-height: 1.6;
              text-align: left;
            }

            /* How It Works Section */
            .mobile-landing-how-it-works {
              padding: 60px 20px;
              background-color: rgba(255, 255, 255, 1);
            }

            /* Final CTA Section */
            .mobile-landing-final-cta {
              padding: 60px 20px;
              background: linear-gradient(
                135deg,
                rgba(0, 0, 0, 0.9) 0%,
                rgba(40, 40, 40, 0.8) 100%
              );
              text-align: center;
            }

            .mobile-landing-cta-content {
              color: rgba(255, 255, 255, 1);
              max-width: 400px;
              margin: 0 auto;
            }

            .mobile-landing-cta-title {
              font-size: 24px;
              font-weight: 700;
              margin: 0 0 8px 0;
              letter-spacing: -0.3px;
              color: rgba(255, 255, 255, 1) !important;
              padding-bottom: 16px;
            }

            .mobile-landing-cta-subtitle {
              font-size: 16px;
              font-weight: 400;
              color: rgba(255, 255, 255, 0.8);
              margin: 0 0 32px 0;
              line-height: 1.4;
            }

            .mobile-landing-cta-buttons {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            @media (max-width: 480px) {
              .mobile-landing-hero {
                padding: 40px 20px;
              }

              .mobile-landing-app-name {
                font-size: 28px;
              }

              .mobile-landing-section-title {
                font-size: 20px;
              }

              .mobile-landing-stats-grid {
                gap: 16px;
              }

              .mobile-landing-stat-number {
                font-size: 20px;
              }

              .mobile-landing-cta-title {
                font-size: 20px;
              }
            }
          `}</style>
        </div>
      </>
    );
  }
}
