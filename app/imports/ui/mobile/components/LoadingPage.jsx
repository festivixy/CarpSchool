import React from "react";
import PropTypes from "prop-types";
import {
  LoadingContainer,
  LoadingSpinner,
  LoadingMessage,
  LoadingSubMessage,
  SpinnerCircle,
} from "../styles/LoadingPage";

/**
 * Loading page component with animated spinner and customizable message
 * Used for lazy-loaded components and async operations
 */
const LoadingPage = ({
  message = "Loading...",
  subMessage = "",
  size = "medium",
}) => (
    <LoadingContainer>
      <LoadingSpinner size={size}>
        <SpinnerCircle />
      </LoadingSpinner>
      <LoadingMessage>{message}</LoadingMessage>
      {subMessage && <LoadingSubMessage>{subMessage}</LoadingSubMessage>}
    </LoadingContainer>
  );

LoadingPage.propTypes = {
  message: PropTypes.string,
  subMessage: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
};

export default LoadingPage;
