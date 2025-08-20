import { Mongo } from "meteor/mongo";
import Joi from "joi";

// Create the Notifications collection
export const Notifications = new Mongo.Collection("notifications");

// Notification types enum
export const NOTIFICATION_TYPES = {
  RIDE_UPDATE: "ride_update",
  RIDE_CANCELLED: "ride_cancelled",
  RIDER_JOINED: "rider_joined",
  RIDER_LEFT: "rider_left",
  CHAT_MESSAGE: "chat_message",
  RIDE_STARTING: "ride_starting",
  RIDE_COMPLETED: "ride_completed",
  EMERGENCY: "emergency",
  SYSTEM: "system"
};

// Notification priority levels
export const NOTIFICATION_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent"
};

// Notification status
export const NOTIFICATION_STATUS = {
  PENDING: "pending",
  SENT: "sent",
  DELIVERED: "delivered",
  FAILED: "failed",
  READ: "read"
};

// JOI Schema for Notifications
export const NotificationsSchema = Joi.object({
  _id: Joi.string().optional(),

  // Recipient information
  userId: Joi.string().required()
    .description("User ID of the notification recipient"),

  // Notification content
  title: Joi.string().min(1).max(100).required()
    .description("Notification title"),

  body: Joi.string().min(1).max(500).required()
    .description("Notification body text"),

  // Notification metadata
  type: Joi.string().valid(...Object.values(NOTIFICATION_TYPES)).required()
    .description("Type of notification"),

  priority: Joi.string().valid(...Object.values(NOTIFICATION_PRIORITY)).default(NOTIFICATION_PRIORITY.NORMAL)
    .description("Notification priority level"),

  status: Joi.string().valid(...Object.values(NOTIFICATION_STATUS)).default(NOTIFICATION_STATUS.PENDING)
    .description("Current notification status"),

  // Data payload for app navigation/actions
  data: Joi.object({
    rideId: Joi.string().optional(),
    chatId: Joi.string().optional(),
    sessionId: Joi.string().optional(),
    action: Joi.string().optional(),
    url: Joi.string().optional()
  }).unknown(true).optional().description("Additional data for notification handling"),

  // Push notification specific fields
  pushPayload: Joi.object({
    badge: Joi.number().integer().min(0).optional(),
    sound: Joi.string().optional(),
    category: Joi.string().optional(),
    threadId: Joi.string().optional()
  }).optional().description("Platform-specific push notification data"),

  // Scheduling and delivery
  scheduledAt: Joi.date().optional()
    .description("When to send the notification (for scheduled notifications)"),

  sentAt: Joi.date().optional()
    .description("When the notification was sent"),

  deliveredAt: Joi.date().optional()
    .description("When the notification was delivered to device"),

  readAt: Joi.date().optional()
    .description("When the user read/opened the notification"),

  expiresAt: Joi.date().optional()
    .description("When the notification expires and should be removed"),

  // Tracking and analytics
  attempts: Joi.number().integer().min(0).default(0)
    .description("Number of delivery attempts"),

  lastAttemptAt: Joi.date().optional()
    .description("Last delivery attempt timestamp"),

  errorMessage: Joi.string().optional()
    .description("Error message if delivery failed"),

  // Grouping and batching
  groupKey: Joi.string().optional()
    .description("Key for grouping related notifications"),

  batchId: Joi.string().optional()
    .description("Batch ID for bulk operations"),

  // User interaction
  actionTaken: Joi.string().optional()
    .description("Action taken by user (tapped, dismissed, etc.)"),

  // Metadata
  createdAt: Joi.date().default(() => new Date())
    .description("Notification creation timestamp"),

  createdBy: Joi.string().optional()
    .description("User ID who triggered the notification"),

  deviceTokens: Joi.array().items(Joi.string()).optional()
    .description("Device tokens used for this notification"),

  platform: Joi.string().valid("ios", "android", "web").optional()
    .description("Target platform for the notification")
});

// Push Token Schema for user devices
export const PushTokenSchema = Joi.object({
  _id: Joi.string().optional(),

  userId: Joi.string().required()
    .description("User ID who owns this device"),

  token: Joi.string().required()
    .description("Push notification token from device"),

  platform: Joi.string().valid("ios", "android", "web").required()
    .description("Device platform"),

  deviceInfo: Joi.object({
    model: Joi.string().optional(),
    version: Joi.string().optional(),
    appVersion: Joi.string().optional(),
    isSimulator: Joi.boolean().optional()
  }).optional().description("Device information"),

  isActive: Joi.boolean().default(true)
    .description("Whether this token is currently active"),

  lastUsedAt: Joi.date().default(() => new Date())
    .description("Last time this token was used"),

  createdAt: Joi.date().default(() => new Date())
    .description("Token registration timestamp"),

  expiresAt: Joi.date().optional()
    .description("Token expiration date (if known)")
});

// Create PushTokens collection
export const PushTokens = new Mongo.Collection("pushTokens");

// Indexes for better performance
if (Meteor.isServer) {
  // Notifications indexes
  Notifications.createIndex({ userId: 1, createdAt: -1 });
  Notifications.createIndex({ status: 1, scheduledAt: 1 });
  Notifications.createIndex({ type: 1, createdAt: -1 });
  Notifications.createIndex({ groupKey: 1, createdAt: -1 });
  Notifications.createIndex({ batchId: 1 });
  Notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // PushTokens indexes
  PushTokens.createIndex({ userId: 1, platform: 1 });
  PushTokens.createIndex({ token: 1 }, { unique: true });
  PushTokens.createIndex({ isActive: 1, lastUsedAt: -1 });
  PushTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

// Helper functions
export const NotificationHelpers = {
  /**
   * Create a notification object with default values
   */
  createNotification: (data) => {
    const { error, value } = NotificationsSchema.validate(data);
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }
    return value;
  },

  /**
   * Create a push token object with default values
   */
  createPushToken: (data) => {
    const { error, value } = PushTokenSchema.validate(data);
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }
    return value;
  },

  /**
   * Get notification expiry time based on type
   */
  getDefaultExpiry: (type) => {
    const expiryHours = {
      [NOTIFICATION_TYPES.EMERGENCY]: 1,      // 1 hour
      [NOTIFICATION_TYPES.RIDE_STARTING]: 2,  // 2 hours
      [NOTIFICATION_TYPES.CHAT_MESSAGE]: 24,  // 24 hours
      [NOTIFICATION_TYPES.RIDE_UPDATE]: 6,    // 6 hours
      [NOTIFICATION_TYPES.SYSTEM]: 72         // 72 hours
    };

    const hours = expiryHours[type] || 24; // Default 24 hours
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  },

  /**
   * Generate group key for related notifications
   */
  generateGroupKey: (type, rideId) => {
    return `${type}_${rideId}_${new Date().toISOString().split('T')[0]}`;
  },

  /**
   * Check if notification should be batched
   */
  shouldBatch: (type) => {
    const batchableTypes = [
      NOTIFICATION_TYPES.CHAT_MESSAGE,
      NOTIFICATION_TYPES.SYSTEM
    ];
    return batchableTypes.includes(type);
  }
};
