import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  InputContainer,
  InputWrapper,
  Background,
  BlurContainer,
  MaskContainer,
  MaskShape,
  BlurEffect,
  FillLayer,
  GlassEffectLayer,
  StyledInput,
  InputLabel,
  InputIcon,
  ErrorMessage,
  HelperText,
  CharacterCount,
} from "../styles/TextInput";

/**
 * LiquidGlass TextInput component with glass morphism effect
 */
function LiquidGlassTextInput({
  type = "text",
  placeholder,
  label,
  value = "",
  defaultValue,
  disabled = false,
  required = false,
  readOnly = false,
  autoFocus = false,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  spellCheck,
  icon,
  iconPosition = "left",
  error,
  helperText,
  showCharacterCount = false,
  width = "100%",
  size = "medium",
  variant = "default",
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyPress,
  onKeyUp,
  className,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value || !!defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setHasValue(!!newValue);
    onChange?.(e);
  };

  const handleKeyDown = (e) => {
    onKeyDown?.(e);
  };

  const handleKeyPress = (e) => {
    onKeyPress?.(e);
  };

  const handleKeyUp = (e) => {
    onKeyUp?.(e);
  };

  const characterCount = value?.length || 0;
  const isOverLimit = maxLength && characterCount > maxLength;

  return (
    <InputContainer
      className={className}
      width={width}
      size={size}
      hasError={!!error}
      {...props}
    >
      {label && (
        <InputLabel
          isFocused={isFocused}
          hasValue={hasValue}
          hasError={!!error}
          required={required}
        >
          {label}
          {required && <span style={{ color: "#ff4444" }}>*</span>}
        </InputLabel>
      )}

      <InputWrapper
        isFocused={isFocused}
        hasValue={hasValue}
        hasError={!!error}
        disabled={disabled}
        size={size}
        variant={variant}
      >
        <Background>
          <BlurContainer>
            <MaskContainer>
              <MaskShape />
            </MaskContainer>
            <BlurEffect />
          </BlurContainer>
          <FillLayer />
          <GlassEffectLayer />
        </Background>

        {icon && iconPosition === "left" && (
          <InputIcon position="left" size={size}>
            {icon}
          </InputIcon>
        )}

        <StyledInput
          ref={inputRef}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          hasIcon={!!icon}
          iconPosition={iconPosition}
          size={size}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyPress={handleKeyPress}
          onKeyUp={handleKeyUp}
        />

        {icon && iconPosition === "right" && (
          <InputIcon position="right" size={size}>
            {icon}
          </InputIcon>
        )}
      </InputWrapper>

      {(error || helperText || showCharacterCount) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginTop: "4px",
            gap: "8px",
          }}
        >
          <div style={{ flex: 1 }}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {!error && helperText && <HelperText>{helperText}</HelperText>}
          </div>

          {showCharacterCount && maxLength && (
            <CharacterCount isOverLimit={isOverLimit}>
              {characterCount}/{maxLength}
            </CharacterCount>
          )}
        </div>
      )}
    </InputContainer>
  );
}

LiquidGlassTextInput.propTypes = {
  type: PropTypes.oneOf([
    "text",
    "email",
    "password",
    "tel",
    "url",
    "search",
    "number",
  ]),
  placeholder: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
  autoComplete: PropTypes.string,
  spellCheck: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  error: PropTypes.string,
  helperText: PropTypes.string,
  showCharacterCount: PropTypes.bool,
  width: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["default", "filled", "outlined"]),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyPress: PropTypes.func,
  onKeyUp: PropTypes.func,
  className: PropTypes.string,
};

export default LiquidGlassTextInput;
