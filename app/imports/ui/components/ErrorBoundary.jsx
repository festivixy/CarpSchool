import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
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
  ReportStatus,
} from "../styles/ErrorBoundary";

/**
 * ErrorBoundary component for catching and displaying React errors gracefully
 * Provides fallback UI, automatic error reporting, and retry functionality
 * Integrates with ErrorReport API for comprehensive error tracking
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      reportStatus: null, // null, 'reporting', 'success', 'failed'
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `CLIENT_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      reportStatus: null,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    this.setState({
      error,
      errorInfo,
    });

    // Log to console for debugging
    console.error("ErrorBoundary caught an error:", {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.state.errorId);
    }

    // Automatically report error to server
    this.reportErrorToServer(error, errorInfo);
  }

  /**
   * Report error to server using the ErrorReport API
   */
  reportErrorToServer = async (error, errorInfo) => {
    try {
      this.setState({ reportStatus: 'reporting' });

      // Gather comprehensive error data
      const errorData = {
        message: error?.message || error?.toString() || "Unknown error",
        stack: error?.stack || undefined,
        name: error?.name || "Error",
        componentStack: errorInfo?.componentStack || undefined,
        component: this.getComponentName() || undefined,
        userAgent: navigator.userAgent,
        url: window.location.href,
        platform: this.detectPlatform(),
        route: this.getCurrentRoute() || undefined,
        props: this.sanitizeProps(),
        state: this.sanitizeState(),
      };

      // Report to server using new API
      const result = await new Promise((resolve, reject) => {
        Meteor.call("report.client.error", errorData, (meteorError, response) => {
          if (meteorError) {
            reject(meteorError);
          } else {
            resolve(response);
          }
        });
      });

      this.setState({
        reportStatus: 'success',
        serverErrorId: result?.errorId,
      });

      console.log("Error reported successfully:", result);

    } catch (reportError) {
      console.warn("Failed to report error to server:", reportError);
      this.setState({ reportStatus: 'failed' });
    }
  };

  /**
   * Get the component name where the error occurred
   */
  getComponentName = () => {
    const { errorInfo } = this.state;
    if (!errorInfo?.componentStack) return undefined;

    // Extract component name from stack
    const stackLines = errorInfo.componentStack.split('\n');
    const firstLine = stackLines[1]; // Skip the first line which is usually the error boundary
    if (firstLine) {
      const match = firstLine.match(/in (\w+)/);
      return match ? match[1] : undefined;
    }
    return undefined;
  };

  /**
   * Detect the current platform
   */
  detectPlatform = () => {
    if (typeof window !== 'undefined' && window.cordova) {
      return window.device?.platform || "Cordova";
    }
    return "Web";
  };

  /**
   * Get the current route
   */
  getCurrentRoute = () => {
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return undefined;
  };

  /**
   * Sanitize component props for reporting
   */
  sanitizeProps = () => {
    try {
      const props = { ...this.props };

      // Remove functions and sensitive data
      Object.keys(props).forEach(key => {
        if (typeof props[key] === 'function') {
          props[key] = '[Function]';
        }
      });

      // Remove children as it can be large
      delete props.children;

      return props;
    } catch (e) {
      return { _error: "Failed to sanitize props" };
    }
  };

  /**
   * Sanitize component state for reporting
   */
  sanitizeState = () => {
    try {
      const state = { ...this.state };

      // Remove sensitive or large data
      delete state.error;
      delete state.errorInfo;

      return state;
    } catch (e) {
      return { _error: "Failed to sanitize state" };
    }
  };

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      serverErrorId: null,
      reportStatus: null,
      retryCount: newRetryCount,
    });

    console.log(`ErrorBoundary retry attempt #${newRetryCount}`);

    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry(newRetryCount);
    }
  };

  handleReport = async () => {
    const { errorId, serverErrorId } = this.state;
    const idToShare = serverErrorId || errorId;

    if (!idToShare) {
      console.error('No error ID available to copy');
      alert('❌ Error: No error ID available to copy. Please try refreshing the page.');
      return;
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(idToShare);
        console.log('✅ Error ID copied to clipboard:', idToShare);
        alert('✅ Error ID "' + idToShare + '" copied to clipboard. Please share with support.');
        return;
      }

      // Fallback: try legacy execCommand method
      const textArea = document.createElement('textarea');
      textArea.value = idToShare;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        console.log('✅ Error ID copied to clipboard:', idToShare);
        alert('✅ Error ID "' + idToShare + '" copied to clipboard. Please share with support.');
      } else {
        throw new Error('Copy command failed');
      }
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
      console.log('📋 Manual copy - Error ID:', idToShare);
      // Final fallback: show error ID for manual copying
      const message = '📋 Error ID: ' + idToShare + '\n\n' +
                     'Please manually copy this ID and report it to support.\n\n' +
                     'Tip: Select the ID above and use Ctrl+C (or Cmd+C on Mac) to copy.';
      alert(message);
    }

    // Call custom report handler if provided
    if (this.props.onReport) {
      this.props.onReport({ errorId: idToShare, clientErrorId: errorId, serverErrorId });
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId, serverErrorId, reportStatus, retryCount } = this.state;
      const {
        fallback,
        title,
        message,
        showDetails,
        showRetry,
        showReport,
        variant,
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
      const displayErrorId = serverErrorId || errorId;

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

          {/* Error reporting status */}
          {reportStatus && (
            <ReportStatus status={reportStatus}>
              {reportStatus === 'reporting' && "📤 Reporting error..."}
              {reportStatus === 'success' && "✅ Error reported successfully"}
              {reportStatus === 'failed' && "⚠️ Failed to report error"}
            </ReportStatus>
          )}

          {showDetails && !isProduction && error && (
            <ErrorDetails>
              <summary>Technical Details</summary>
              <pre>{error.stack}</pre>
              {retryCount > 0 && <p>Retry attempts: {retryCount}</p>}
            </ErrorDetails>
          )}

          <ErrorActions>
            {showRetry && (
              <RetryButton onClick={this.handleRetry}>
                {retryCount > 0 ? `Try Again (${retryCount + 1})` : "Try Again"}
              </RetryButton>
            )}

            {showReport && (
              <ReportButton onClick={this.handleReport}>
                {reportStatus === 'success' ? "Copy Error ID" : "Report Issue"}
              </ReportButton>
            )}
          </ErrorActions>

          {displayErrorId && (
            <ErrorCode>
              Error ID: {displayErrorId}
              {serverErrorId && serverErrorId !== errorId && (
                <small> (Client: {errorId})</small>
              )}
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
