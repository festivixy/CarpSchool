/**
 * Centralized validation utilities for input sanitization and XSS prevention
 *
 * This module provides reusable validation functions and Joi custom validators
 * to prevent XSS attacks and ensure input safety across the application.
 */

import Joi from "joi";

// Common XSS patterns to check against
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi, // onload, onclick, etc.
  /expression\s*\(/gi,
  /<\s*\/?\s*(script|iframe|object|embed|link|meta|style|form)\b/gi,
];

/**
 * XSS validation helper for Joi custom validators
 * @param {string} value - The value to validate
 * @param {object} helpers - Joi helpers object
 * @returns {string|Error} - The value if valid, or a Joi error
 */
export const validateXSS = (value, helpers) => {
  if (!value) return value; // Allow empty values where permitted

  for (const pattern of XSS_PATTERNS) { // eslint-disable-line no-restricted-syntax
    if (pattern.test(value)) {
      return helpers.error("string.xss", { value });
    }
  }

  return value;
};

/**
 * Common validation patterns for different types of user input
 */
export const VALIDATION_PATTERNS = {
  // Names: letters, spaces, hyphens, apostrophes, commas, periods
  name: /^[a-zA-Z\s\-'.,]+$/,

  // Location names: letters, numbers, spaces, basic punctuation
  location: /^[a-zA-Z0-9\s\-,.()&']+$/,

  // Phone numbers: digits, spaces, parentheses, plus, minus
  phone: /^[+\-0-9\s()]*$/,

  // General text with basic punctuation (notes, descriptions)
  generalText: /^[a-zA-Z0-9\s\-,.()&'!?;:]*$/,

  // Chat messages: includes more symbols for communication
  chatMessage: /^[a-zA-Z0-9\s\-,.()&'!?;:@#$%+=_[\]{}|\\/"~`*^]*$/,

  // Coordinates: lat,lng format
  coordinates: /^-?\d+\.?\d*,-?\d+\.?\d*$/,
};

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  xss: "Input contains potentially unsafe content",
  name: "Name can only contain letters, spaces, hyphens, apostrophes, commas, and periods",
  location: "Location can only contain letters, numbers, spaces, and basic punctuation",
  phone: "Phone number can only contain digits, spaces, parentheses, plus, and minus signs",
  generalText: "Text can only contain letters, numbers, spaces, and basic punctuation",
  chatMessage: "Message contains invalid characters",
  uri: "Must be a valid URL",
};

/**
 * Creates a Joi string schema with XSS protection and pattern validation
 * @param {object} options - Configuration options
 * @param {string} options.pattern - Pattern key from VALIDATION_PATTERNS
 * @param {number} options.min - Minimum length
 * @param {number} options.max - Maximum length
 * @param {boolean} options.required - Whether field is required
 * @param {boolean} options.allowEmpty - Whether to allow empty strings
 * @param {string} options.label - Field label for error messages
 * @param {string} options.patternMessage - Custom pattern validation message
 * @returns {object} - Joi schema object
 */
export const createSafeStringSchema = ({
  pattern,
  min = 1,
  max = 100,
  required = true,
  allowEmpty = false,
  label = "Input",
  patternMessage = null,
} = {}) => {
  let schema = Joi.string();

  if (required) {
    schema = schema.required();
  } else {
    schema = schema.optional();
  }

  if (allowEmpty) {
    schema = schema.allow("");
  }

  if (min !== null) {
    schema = schema.min(min);
  }

  if (max !== null) {
    schema = schema.max(max);
  }

  if (pattern && VALIDATION_PATTERNS[pattern]) {
    schema = schema.pattern(VALIDATION_PATTERNS[pattern]);
  }

  // Add XSS validation
  schema = schema.custom(validateXSS, "XSS validation");

  // Set custom messages
  const messages = {
    "string.xss": VALIDATION_MESSAGES.xss,
  };

  if (pattern && VALIDATION_MESSAGES[pattern]) {
    messages["string.pattern.base"] = patternMessage || VALIDATION_MESSAGES[pattern];
  }

  schema = schema.messages(messages);

  if (label) {
    schema = schema.label(label);
  }

  return schema;
};

/**
 * Creates a safe URI schema with XSS protection
 * @param {object} options - Configuration options
 * @param {array} options.schemes - Allowed URI schemes (default: ['http', 'https', 'data'])
 * @param {boolean} options.required - Whether field is required
 * @param {boolean} options.allowEmpty - Whether to allow empty strings
 * @param {number} options.max - Maximum length
 * @param {string} options.label - Field label for error messages
 * @returns {object} - Joi schema object
 */
export const createSafeUriSchema = ({
  schemes = ["http", "https", "data"],
  required = false,
  allowEmpty = true,
  max = 500,
  label = "URL",
} = {}) => {
  let schema = Joi.string();

  if (required) {
    schema = schema.required();
  } else {
    schema = schema.optional();
  }

  if (allowEmpty) {
    schema = schema.allow("");
  }

  if (max) {
    schema = schema.max(max);
  }

  schema = schema.uri({ scheme: schemes });
  schema = schema.custom(validateXSS, "XSS validation");

  schema = schema.messages({
    "string.uri": VALIDATION_MESSAGES.uri,
    "string.xss": VALIDATION_MESSAGES.xss,
  });

  if (label) {
    schema = schema.label(label);
  }

  return schema;
};

/**
 * Quick validation functions for common use cases
 */
export const validateInput = {
  /**
   * Validate a place/location name
   */
  placeName: (value) => createSafeStringSchema({
    pattern: "location",
    min: 1,
    max: 100,
    label: "Location Name",
  }).validate(value),

  /**
   * Validate a person's name
   */
  personName: (value) => createSafeStringSchema({
    pattern: "name",
    min: 1,
    max: 100,
    label: "Name",
  }).validate(value),

  /**
   * Validate a chat message
   */
  chatMessage: (value) => createSafeStringSchema({
    pattern: "chatMessage",
    min: 1,
    max: 1000,
    label: "Message Content",
    patternMessage: VALIDATION_MESSAGES.chatMessage,
  }).validate(value),

  /**
   * Validate ride notes
   */
  rideNotes: (value) => createSafeStringSchema({
    pattern: "generalText",
    min: 0,
    max: 500,
    required: false,
    allowEmpty: true,
    label: "Ride Notes",
  }).validate(value),

  /**
   * Validate phone number
   */
  phoneNumber: (value) => createSafeStringSchema({
    pattern: "phone",
    min: 0,
    max: 20,
    required: false,
    allowEmpty: true,
    label: "Phone Number",
  }).validate(value),
};
