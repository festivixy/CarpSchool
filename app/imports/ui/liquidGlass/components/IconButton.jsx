import React from "react";
import PropTypes from "prop-types";
import {
  IconButtonContainer,
  Background,
  BlurContainer,
  FillLayer,
  LabelContainer,
  LabelSymbol,
  LabelText,
  IconButtonBadge,
} from "../styles/IconButton";

/**
 * LiquidGlass IconButton component - circular button for single character or emoji
 */
function LiquidGlassIconButton({
  icon,
  badge,
  size = "medium",
  variant = "default",
  disabled = false,
  loading = false,
  active = false,
  color = "default",
  onClick,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  className,
  style,
  title,
  ariaLabel,
  ...props
}) {
  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e); // eslint-disable-line no-unused-expressions
  };

  const handleMouseDown = (e) => {
    if (disabled || loading) return;
    onMouseDown?.(e); // eslint-disable-line no-unused-expressions
  };

  const handleMouseUp = (e) => {
    if (disabled || loading) return;
    onMouseUp?.(e); // eslint-disable-line no-unused-expressions
  };

  const handleTouchStart = (e) => {
    if (disabled || loading) return;
    onTouchStart?.(e); // eslint-disable-line no-unused-expressions
  };

  const handleTouchEnd = (e) => {
    if (disabled || loading) return;
    onTouchEnd?.(e); // eslint-disable-line no-unused-expressions
  };

  return (
    <IconButtonContainer
      className={className}
      $size={size}
      $variant={variant}
      $disabled={disabled}
      $loading={loading}
      $active={active}
      $color={color}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={style}
      title={title}
      aria-label={ariaLabel || title}
      {...props}
    >
      <Background>
        <BlurContainer />
        <FillLayer />
      </Background>

      <LabelContainer $size={size}>
        <LabelSymbol>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <LabelText $size={size} $color={color}>
              {icon}
            </LabelText>
          )}
        </LabelSymbol>

        {badge && !loading && (
          <IconButtonBadge>
            {typeof badge === "number" && badge > 99 ? "99+" : badge}
          </IconButtonBadge>
        )}
      </LabelContainer>
    </IconButtonContainer>
  );
}

LiquidGlassIconButton.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.oneOf(["small", "medium", "large", "xlarge"]),
  variant: PropTypes.oneOf(["default", "primary", "secondary", "danger"]),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  active: PropTypes.bool,
  color: PropTypes.oneOf(["default", "primary", "secondary", "success", "warning", "danger"]),
  onClick: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onTouchStart: PropTypes.func,
  onTouchEnd: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default LiquidGlassIconButton;
