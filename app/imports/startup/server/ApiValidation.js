import Joi from "joi";

// Common validation schemas
export const schemas = {
  rideCreate: Joi.object({
    origin: Joi.string().min(1).max(200).required(),
    destination: Joi.string().min(1).max(200).required(),
    date: Joi.date().greater('now').required(),
    seats: Joi.number().integer().min(1).max(8).required(),
    notes: Joi.string().max(500).allow('').optional()
  }),

  rideUpdate: Joi.object({
    origin: Joi.string().min(1).max(200).optional(),
    destination: Joi.string().min(1).max(200).optional(),
    date: Joi.date().greater('now').optional(),
    seats: Joi.number().integer().min(1).max(8).optional(),
    notes: Joi.string().max(500).allow('').optional()
  }).min(1), // At least one field must be present

  profileUpdate: Joi.object({
    Name: Joi.string().min(1).max(100).optional(),
    Location: Joi.string().min(1).max(200).optional(),
    Phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,20}$/).optional(),
    Other: Joi.string().max(500).allow('').optional(),
    UserType: Joi.string().valid('Driver', 'Rider').optional(),
    major: Joi.string().max(100).optional()
  }).min(1),

  chatMessage: Joi.object({
    text: Joi.string().min(1).max(1000).required()
  }),

  login: Joi.object({
    email: Joi.string().email().optional(),
    username: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).min(3).max(30).optional(),
    password: Joi.string().min(6).required()
  }).xor('email', 'username'), // Must have either email or username, but not both

  register: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).min(3).max(30).required(),
    password: Joi.string().min(6).max(128).required(),
    profile: Joi.object({
      firstName: Joi.string().max(50).optional(),
      lastName: Joi.string().max(50).optional()
    }).optional()
  }),

  tokenRefresh: Joi.object({
    revokeOld: Joi.boolean().default(false)
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required()
  }),

  resendVerification: Joi.object({
    email: Joi.string().email().required()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required()
  }),

  deleteAccount: Joi.object({
    password: Joi.string().required(),
    confirmDelete: Joi.string().valid('DELETE').required()
  }),

  queryParams: {
    pagination: Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(50),
      skip: Joi.number().integer().min(0).default(0)
    }),

    rideFilter: Joi.object({
      from: Joi.date().optional(),
      to: Joi.date().optional(),
      origin: Joi.string().max(200).optional(),
      destination: Joi.string().max(200).optional(),
      driver: Joi.string().optional(),
      availableSeats: Joi.number().integer().min(1).max(8).optional()
    }),

    userSearch: Joi.object({
      search: Joi.string().min(2).max(100).optional()
    })
  }
};

// Validation helper function
export function validateInput(data, schema, options = {}) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    ...options
  });

  if (error) {
    const messages = error.details.map(detail => detail.message);
    throw new Error(`Validation error: ${messages.join(', ')}`);
  }

  return value;
}

// Rate limiting store (simple in-memory implementation)
const rateLimitStore = new Map();

export function checkRateLimit(userId, endpoint, maxRequests = 100, windowMs = 60000) {
  const key = `${userId}:${endpoint}`;
  const now = Date.now();

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { requests: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  const data = rateLimitStore.get(key);

  // Reset window if expired
  if (now > data.resetTime) {
    rateLimitStore.set(key, { requests: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // Check if limit exceeded
  if (data.requests >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.resetTime,
      retryAfter: Math.ceil((data.resetTime - now) / 1000)
    };
  }

  // Increment counter
  data.requests++;
  rateLimitStore.set(key, data);

  return { allowed: true, remaining: maxRequests - data.requests };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute
