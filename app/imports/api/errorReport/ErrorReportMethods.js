import { Meteor } from "meteor/meteor";
import Joi from "joi";
import { check } from "meteor/check";
import { Random } from "meteor/random";
import { ErrorReports, ErrorReportSchema } from "./ErrorReport";

/**
 * Generate a unique error ID for tracking
 */
function generateErrorId() {
  return `ERR_${Date.now()}_${Random.id(6)}`;
}

/**
 * Sanitize sensitive data from props/state before storing
 */
function sanitizeData(data) {
  if (!data || typeof data !== "object") {
    return {};
  }

  const sanitized = { ...data };

  // Remove sensitive fields
  const sensitiveKeys = [
    "password", "token", "secret", "key", "auth", "session",
    "credit", "card", "ssn", "social", "phone", "email",
  ];

  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = "[REDACTED]";
    }
  });

  // Truncate large objects
  const jsonString = JSON.stringify(sanitized);
  if (jsonString.length > 5000) {
    return { _truncated: true, _size: jsonString.length };
  }

  return sanitized;
}

/**
 * Determine error severity based on error details
 */
function determineErrorSeverity(errorData) {
  const { message, name, componentStack } = errorData;

  // Critical errors
  if (name === "ChunkLoadError" ||
      message?.includes("Loading chunk") ||
      message?.includes("ChunkLoadError")) {
    return "critical";
  }

  // High severity errors
  if (message?.includes("Network Error") ||
      message?.includes("Failed to fetch") ||
      name === "TypeError" ||
      componentStack?.includes("App")) {
    return "high";
  }

  // Medium severity (default)
  return "medium";
}

/**
 * Categorize error based on error details
 */
function categorizeError(errorData) {
  const { message, name, stack } = errorData;

  if (name === "ChunkLoadError" || message?.includes("Loading chunk")) {
    return "network";
  }

  if (message?.includes("Network Error") || message?.includes("Failed to fetch")) {
    return "network";
  }

  if (message?.includes("Authentication") || message?.includes("Unauthorized")) {
    return "auth";
  }

  if (stack?.includes("Meteor.call") || stack?.includes("Mongo")) {
    return "database";
  }

  if (name?.includes("Error") && (name !== "Error")) {
    return "javascript";
  }

  return "component";
}

Meteor.methods({
  /**
   * Report a client-side error
   */
  async "report.client.error"(errorData) {
    // Meteor audit-argument-checks validation
    check(errorData, Object);

    // Validate input
    const schema = Joi.object({
      message: Joi.string().required().max(1000),
      stack: Joi.string().optional().max(10000),
      name: Joi.string().optional().max(100),
      componentStack: Joi.string().optional().max(5000),
      component: Joi.string().optional().max(200),
      userAgent: Joi.string().optional().max(500),
      url: Joi.string().optional().max(1000),
      platform: Joi.string().optional().max(50),
      route: Joi.string().optional().max(200),
      props: Joi.object().optional(),
      state: Joi.object().optional(),
    });

    const { error, value } = schema.validate(errorData);
    if (error) {
      throw new Meteor.Error("validation-error", `Invalid error data: ${error.details[0].message}`);
    }

    const currentUser = this.userId ? await Meteor.users.findOneAsync(this.userId) : null;

    // Create error report document
    const errorReport = {
      errorId: generateErrorId(),
      userId: this.userId || undefined,
      username: currentUser?.username || undefined,
      timestamp: new Date(),

      // Error details
      message: value.message,
      stack: value.stack || undefined,
      name: value.name || "Error",

      // Component context
      componentStack: value.componentStack || undefined,
      component: value.component || undefined,

      // Environment info
      userAgent: value.userAgent || undefined,
      url: value.url || undefined,
      platform: value.platform || "Web",

      // App context
      route: value.route || undefined,
      props: sanitizeData(value.props),
      state: sanitizeData(value.state),

      // Auto-categorization
      severity: determineErrorSeverity(value),
      category: categorizeError(value),
      resolved: false,
      notes: undefined,
    };

    // Validate against schema
    const { error: schemaError } = ErrorReportSchema.validate(errorReport);
    if (schemaError) {
      throw new Meteor.Error(
        "schema-error",
        `Error report schema validation failed: ${schemaError.details[0].message}`,
      );
    }

    // Insert error report
    const errorId = await ErrorReports.insertAsync(errorReport);

    // Log to server console for immediate attention
    console.error(`[ERROR REPORT ${errorReport.errorId}] ${errorReport.message}`, {
      user: errorReport.username || "anonymous",
      component: errorReport.component,
      route: errorReport.route,
      severity: errorReport.severity,
      category: errorReport.category,
    });

    return {
      errorId: errorReport.errorId,
      reportId: errorId,
      severity: errorReport.severity,
      category: errorReport.category,
    };
  },

  /**
   * Update error report (admin only)
   */
  async "errorReports.update"(reportId, updates) {
    check(reportId, String);
    check(updates, Object);

    // Check system admin permissions
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    const { isSystemAdmin } = await import("../accounts/RoleUtils");
    if (!await isSystemAdmin(this.userId)) {
      throw new Meteor.Error("access-denied", "Only system administrators can update error reports.");
    }

    // Validate updates
    const allowedFields = ["resolved", "notes", "severity", "category"];
    const sanitizedUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = updates[key];
      }
    });

    if (Object.keys(sanitizedUpdates).length === 0) {
      throw new Meteor.Error("invalid-update", "No valid fields to update.");
    }

    // Add update timestamp
    sanitizedUpdates.updatedAt = new Date();
    sanitizedUpdates.updatedBy = currentUser._id;

    const result = await ErrorReports.updateAsync(reportId, { $set: sanitizedUpdates });

    if (result === 0) {
      throw new Meteor.Error("not-found", "Error report not found.");
    }

    return true;
  },

  /**
   * Delete error report (admin only)
   */
  async "errorReports.remove"(reportId) {
    check(reportId, String);

    // Check system admin permissions
    const { isSystemAdmin } = await import("../accounts/RoleUtils");
    if (!await isSystemAdmin(this.userId)) {
      throw new Meteor.Error("access-denied", "Only system administrators can delete error reports.");
    }

    const result = await ErrorReports.removeAsync(reportId);

    if (result === 0) {
      throw new Meteor.Error("not-found", "Error report not found.");
    }

    return true;
  },

  /**
   * Get error statistics (admin only)
   */
  async "errorReports.getStats"() {
    // Check system admin permissions
    const { isSystemAdmin } = await import("../accounts/RoleUtils");
    if (!await isSystemAdmin(this.userId)) {
      throw new Meteor.Error("access-denied", "Only system administrators can view error statistics.");
    }

    const totalErrors = await ErrorReports.find({}).countAsync();
    const unresolvedErrors = await ErrorReports.find({ resolved: false }).countAsync();
    const criticalErrors = await ErrorReports.find({ severity: "critical", resolved: false }).countAsync();
    const last24Hours = await ErrorReports.find({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).countAsync();

    // Get error counts by category
    const categoryCounts = await ErrorReports.rawCollection().aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]).toArray();

    // Get error counts by severity
    const severityCounts = await ErrorReports.rawCollection().aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]).toArray();

    return {
      totalErrors,
      unresolvedErrors,
      criticalErrors,
      last24Hours,
      categoryCounts,
      severityCounts,
    };
  },
});
