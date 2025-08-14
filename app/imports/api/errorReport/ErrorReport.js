import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold error report data. */
const ErrorReports = new Mongo.Collection("ErrorReport");

/** Define a Joi schema to specify the structure of each document in the collection. */
const ErrorReportSchema = Joi.object({
  _id: Joi.string().optional(),
  errorId: Joi.string().required(), // Unique identifier for this error instance
  userId: Joi.string().allow(null).optional(), // User who encountered the error (if logged in)
  username: Joi.string().allow(null).optional(), // Username who encountered the error (if logged in)
  timestamp: Joi.date().required(), // When the error occurred

  // Error details
  message: Joi.string().required(), // Error message
  stack: Joi.string().allow(null).optional(), // Error stack trace
  name: Joi.string().optional(), // Error name/type

  // Component context
  componentStack: Joi.string().allow(null).optional(), // React component stack trace
  component: Joi.string().allow(null).optional(), // Component where error occurred

  // Browser/Environment info
  userAgent: Joi.string().allow(null).optional(), // Browser user agent
  url: Joi.string().allow(null).optional(), // Current page URL
  platform: Joi.string().optional(), // Device platform (iOS, Android, Web)

  // App context
  route: Joi.string().allow(null).optional(), // Current route
  props: Joi.object().optional(), // Component props (sanitized)
  state: Joi.object().optional(), // Component state (sanitized)

  // Additional metadata
  severity: Joi.string().valid("low", "medium", "high", "critical").default("medium"),
  category: Joi.string().valid(
    "javascript",
    "component",
    "network",
    "auth",
    "database",
    "unknown",
  ).default("unknown"),
  resolved: Joi.boolean().default(false), // Admin can mark as resolved
  notes: Joi.string().allow(null).optional(), // Admin notes about the error
});

/** Make the collection and schema available to other code. */
export { ErrorReports, ErrorReportSchema };
