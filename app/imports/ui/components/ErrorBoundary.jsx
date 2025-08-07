import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  ErrorContainer,
  ErrorIcon,
  ErrorTitle,
  ErrorMessage,
  ErrorDetails,
  ErrorActions,
  RetryButton,
  ReportButton,
  ErrorCode,
} from "../styles/ErrorBoundary";

/**
 * ErrorBoundary component for catching and displaying React errors gracefully
 * Provides fallback UI, error reporting, and retry functionality
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    this.setState({
      error,
      errorInfo,
    });

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Report error to external service if configured
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.state.errorId);
    }

    // Report to Meteor if available
    if (typeof Meteor !== "undefined" && Meteor.call) {
      try {
        Meteor.call("reportClientError", {
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }, (meteorError) => {
          if (meteorError) {
            console.warn("Failed to report error to server:", meteorError);
          }
        });
      } catch (meteorError) {
        console.warn("Failed to report error to Meteor:", meteorError);
      }
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReport = () => {
    const { error, errorInfo, errorId } = this.state;

    // Create error report
    const errorReport = {
      errorId,
      message: error ? error.toString() : "Unknown error",
      stack: error ? error.stack : "No stack trace available",
      componentStack: errorInfo ? errorInfo.componentStack : "No component stack",
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Copy to clipboard for manual reporting
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => {
          alert("Error details copied to clipboard. Please share with support.");
        })
        .catch(() => {
          // Fallback: show error details in alert
          alert(`Error ID: ${errorId}\n\nPlease report this error ID to support.`);
        });
    } else {
      // Fallback for older browsers
      alert(`Error ID: ${errorId}\n\nPlease report this error ID to support.`);
    }

    // Call custom report handler if provided
    if (this.props.onReport) {
      this.props.onReport(errorReport);
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      const {
        fallback,
        title,
        message,
        showDetails,
        showRetry,
        showReport,
        variant,
        children,
      } = this.props;

      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === "function") {
          return fallback(error, this.handleRetry, errorId);
        }
        return fallback;
      }

      const errorMessage = error ? error.message : "An unexpected error occurred";
      const isProduction = process.env.NODE_ENV === "production";

      return (
        <ErrorContainer variant={variant}>
          <ErrorIcon>⚠️</ErrorIcon>

          <ErrorTitle>
            {title || "Something went wrong"}
          </ErrorTitle>

          <ErrorMessage>
            {message || (isProduction
              ? "We apologize for the inconvenience. Please try refreshing the page."
              : errorMessage
            )}
          </ErrorMessage>

          {showDetails && !isProduction && error && (
            <ErrorDetails>
              <summary>Technical Details</summary>
              <pre>{error.stack}</pre>
            </ErrorDetails>
          )}

          <ErrorActions>
            {showRetry && (
              <RetryButton onClick={this.handleRetry}>
                Try Again
              </RetryButton>
            )}

            {showReport && (
              <ReportButton onClick={this.handleReport}>
                Report Issue
              </ReportButton>
            )}
          </ErrorActions>

          {errorId && (
            <ErrorCode>
              Error ID: {errorId}
            </ErrorCode>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  title: PropTypes.string,
  message: PropTypes.string,
  showDetails: PropTypes.bool,
  showRetry: PropTypes.bool,
  showReport: PropTypes.bool,
  variant: PropTypes.oneOf(["default", "minimal", "detailed"]),
  onError: PropTypes.func,
  onRetry: PropTypes.func,
  onReport: PropTypes.func,
};

ErrorBoundary.defaultProps = {
  showDetails: false,
  showRetry: true,
  showReport: true,
  variant: "default",
};

export default ErrorBoundary;
