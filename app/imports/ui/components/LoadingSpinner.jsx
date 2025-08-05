import React from "react";
import PropTypes from "prop-types";
import {
  SpinnerContainer,
  SpinnerElement,
  SpinnerText,
  DotsSpinner,
  PulseSpinner,
  RingSpinner,
} from "../styles/LoadingSpinner";

/**
 * LoadingSpinner component for consistent loading states across platforms
 * Supports multiple animation types, sizes, and accessibility features
 */
const LoadingSpinner = ({
  size = "medium",
  color = "primary",
  variant = "spinner",
  text,
  centered = false,
  inline = false,
  overlay = false,
  className,
  "aria-label": ariaLabel,
  ...props
}) => {
  const accessibilityLabel = ariaLabel || (text ? `Loading: ${text}` : "Loading");

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <DotsSpinner
            size={size}
            color={color}
            role="status"
            aria-label={accessibilityLabel}
          >
            <span />
            <span />
            <span />
          </DotsSpinner>
        );

      case "pulse":
        return (
          <PulseSpinner
            size={size}
            color={color}
            role="status"
            aria-label={accessibilityLabel}
          />
        );

      case "ring":
        return (
          <RingSpinner
            size={size}
            color={color}
            role="status"
            aria-label={accessibilityLabel}
          >
            <svg viewBox="22 22 44 44">
              <circle cx="44" cy="44" r="20.2" />
            </svg>
          </RingSpinner>
        );

      default:
        return (
          <SpinnerElement
            size={size}
            color={color}
            role="status"
            aria-label={accessibilityLabel}
          />
        );
    }
  };

  if (overlay) {
    return (
      <SpinnerContainer
        centered={true}
        inline={false}
        overlay={true}
        className={className}
        {...props}
      >
        {renderSpinner()}
        {text && <SpinnerText size={size}>{text}</SpinnerText>}
      </SpinnerContainer>
    );
  }

  if (inline) {
    return (
      <span
        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        className={className}
        {...props}
      >
        {renderSpinner()}
        {text && <SpinnerText size={size} inline>{text}</SpinnerText>}
      </span>
    );
  }

  return (
    <SpinnerContainer
      centered={centered}
      inline={false}
      overlay={false}
      className={className}
      {...props}
    >
      {renderSpinner()}
      {text && <SpinnerText size={size}>{text}</SpinnerText>}
    </SpinnerContainer>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large", "xlarge"]),
  color: PropTypes.oneOf(["primary", "secondary", "white", "dark"]),
  variant: PropTypes.oneOf(["spinner", "dots", "pulse", "ring"]),
  text: PropTypes.string,
  centered: PropTypes.bool,
  inline: PropTypes.bool,
  overlay: PropTypes.bool,
  className: PropTypes.string,
  "aria-label": PropTypes.string,
};

export default LoadingSpinner;
