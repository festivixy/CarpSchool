import React from "react";
import { Link } from "react-router-dom";

/**
 * Mobile Footer component with modern design
 */
export default function MobileFooter() {
  return (
    <div className="mobile-footer">
      <div className="mobile-footer-content">
        <div className="mobile-footer-logo">
          <span className="mobile-footer-app-name">Carpool</span>
        </div>
        <div className="mobile-footer-links">
          <Link to="/tos" className="mobile-footer-link">
            Terms
          </Link>
          <Link to="/privacy" className="mobile-footer-link">
            Privacy
          </Link>
          <a href="mailto:support@carpool.edu" className="mobile-footer-link">
            Support
          </a>
        </div>
        <div className="mobile-footer-copyright">
          © 2024 Carpool. All rights reserved.
        </div>
      </div>

      <style jsx>{`
        .mobile-footer {
          padding: 40px 20px 20px;
          background-color: rgba(0, 0, 0, 1);
        }

        .mobile-footer-content {
          text-align: center;
          color: rgba(255, 255, 255, 1);
        }

        .mobile-footer-logo {
          margin-bottom: 20px;
        }

        .mobile-footer-app-name {
          font-size: 18px;
          font-weight: 600;
        }

        .mobile-footer-links {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 20px;
        }

        .mobile-footer-link {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 400;
          text-decoration: none;
        }

        .mobile-footer-link:hover {
          color: rgba(255, 255, 255, 1);
          text-decoration: underline;
        }

        .mobile-footer-copyright {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
