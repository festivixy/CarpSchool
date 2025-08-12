import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  InputContainer,
  InputWrapper,
  StyledInput,
  InputLabel,
  InputIcon,
  ErrorMessage,
  HelperText,
  CharacterCount,
  RequiredIndicator,
  MessageContainer,
} from "../styles/TextInput";

/**
 * Base TextInput component for use across desktop and mobile platforms
 * Provides comprehensive form input functionality with validation and accessibility
 */
const TextInput = ({
  type = "text",
  placeholder,
  label,
  value,
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
  size = "medium",
  variant = "default",
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyPress,
  onKeyUp,
  className,
  id,
  name,
  "aria-describedby": ariaDescribedBy,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Use controlled or uncontrolled pattern
  const inputValue = value !== undefined ? value : internalValue;
  const isControlled = value !== undefined;

  // Generate unique IDs for accessibility
  const inputId = id || `textinput-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(" ");

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (event) => {
    const newValue = event.target.value;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    if (onChange) {
      onChange(event);
    }
  };

  const handleFocus = (event) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(event);
    }
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(event);
    }
  };

  const characterCount = inputValue ? inputValue.length : 0;
  const isOverLimit = maxLength && characterCount > maxLength;

  return (
    <InputContainer className={className} hasError={!!error}>
      {label && (
        <InputLabel htmlFor={inputId} required={required} disabled={disabled}>
          {label}
          {required && <RequiredIndicator>*</RequiredIndicator>}
        </InputLabel>
      )}

      <InputWrapper
        size={size}
        variant={variant}
        hasError={!!error}
        isFocused={isFocused}
        hasIcon={!!icon}
        iconPosition={iconPosition}
        disabled={disabled}
      >
        {icon && iconPosition === "left" && (
          <InputIcon position="left">{icon}</InputIcon>
        )}

        <StyledInput
          ref={inputRef}
          id={inputId}
          name={name}
          type={type}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          onKeyPress={onKeyPress}
          onKeyUp={onKeyUp}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          size={size}
          hasIcon={!!icon}
          iconPosition={iconPosition}
          {...props}
        />

        {icon && iconPosition === "right" && (
          <InputIcon position="right">{icon}</InputIcon>
        )}
      </InputWrapper>

      {(error || helperText || showCharacterCount) && (
        <MessageContainer>
          {error && (
            <ErrorMessage id={errorId} role="alert">
              {error}
            </ErrorMessage>
          )}

          {helperText && !error && (
            <HelperText id={helperId}>
              {helperText}
            </HelperText>
          )}

          {showCharacterCount && maxLength && (
            <CharacterCount isOverLimit={isOverLimit}>
              {characterCount}/{maxLength}
            </CharacterCount>
          )}
        </MessageContainer>
      )}
    </InputContainer>
  );
};

TextInput.propTypes = {
  type: PropTypes.string,
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
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["default", "outline", "filled"]),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyPress: PropTypes.func,
  onKeyUp: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  "aria-describedby": PropTypes.string,
};

export default TextInput;
