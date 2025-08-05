import React from "react";
import PropTypes from "prop-types";
import { StyledButton, ButtonIcon, ButtonText } from "../styles/Button";

/**
 * Base Button component for use across desktop and mobile platforms
 * Provides consistent API and behavior while allowing platform-specific styling
 */
const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  onClick,
  type = "button",
  className,
  ariaLabel,
  ...props
}) => {
  const handleClick = (event) => {
    if (!disabled && !loading && onClick) {
      onClick(event);
    }
  };

  return (
    <StyledButton
      type={type}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <ButtonIcon position="left">{icon}</ButtonIcon>
      )}
      
      <ButtonText hasIcon={!!icon}>
        {loading ? "Loading..." : children}
      </ButtonText>
      
      {icon && iconPosition === "right" && (
        <ButtonIcon position="right">{icon}</ButtonIcon>
      )}
    </StyledButton>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "outline", "ghost"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default Button;
