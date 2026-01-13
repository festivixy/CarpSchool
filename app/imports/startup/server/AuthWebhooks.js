import { Meteor } from "meteor/meteor";

// Simple in-memory webhook registry
// In production, this might be stored in the database
const webhookEndpoints = new Map();

// Webhook event types
export const WEBHOOK_EVENTS = {
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login', 
  USER_LOGOUT: 'user.logout',
  PASSWORD_CHANGED: 'user.password_changed',
  TOKEN_CREATED: 'token.created',
  TOKEN_REVOKED: 'token.revoked',
  EMAIL_VERIFIED: 'user.email_verified'
};

// Register a webhook endpoint
export function registerWebhook(event, url, options = {}) {
  if (!webhookEndpoints.has(event)) {
    webhookEndpoints.set(event, []);
  }
  
  webhookEndpoints.get(event).push({
    url,
    secret: options.secret,
    active: options.active !== false,
    createdAt: new Date()
  });
  
  console.log(`Webhook registered for ${event}: ${url}`);
}

// Send webhook notification
export async function triggerWebhook(event, data, options = {}) {
  const endpoints = webhookEndpoints.get(event);
  
  if (!endpoints || endpoints.length === 0) {
    return; // No webhooks registered for this event
  }
  
  const payload = {
    event,
    data,
    timestamp: new Date(),
    id: `wh_${Math.random().toString(36).substr(2, 9)}`
  };
  
  // Send to all registered endpoints for this event
  for (const endpoint of endpoints) {
    if (!endpoint.active) continue;
    
    try {
      await sendWebhookRequest(endpoint, payload);
    } catch (error) {
      console.error(`Webhook delivery failed for ${endpoint.url}:`, error.message);
    }
  }
}

// Send HTTP request to webhook endpoint
async function sendWebhookRequest(endpoint, payload) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'CarpSchool-Webhooks/1.0'
  };
  
  // Add signature if secret is provided
  if (endpoint.secret) {
    const crypto = await import('crypto');
    const signature = crypto
      .createHmac('sha256', endpoint.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    headers['X-CarpSchool-Signature'] = `sha256=${signature}`;
  }
  
  const response = await fetch(endpoint.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    timeout: 10000 // 10 second timeout
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  console.log(`Webhook delivered to ${endpoint.url} for event ${payload.event}`);
}

// Webhook management functions for API
export function listWebhooks() {
  const result = {};
  for (const [event, endpoints] of webhookEndpoints.entries()) {
    result[event] = endpoints.map(endpoint => ({
      url: endpoint.url,
      active: endpoint.active,
      hasSecret: !!endpoint.secret,
      createdAt: endpoint.createdAt
    }));
  }
  return result;
}

export function removeWebhook(event, url) {
  const endpoints = webhookEndpoints.get(event);
  if (endpoints) {
    const filtered = endpoints.filter(endpoint => endpoint.url !== url);
    webhookEndpoints.set(event, filtered);
    return true;
  }
  return false;
}

export function clearWebhooks(event) {
  if (event) {
    webhookEndpoints.delete(event);
  } else {
    webhookEndpoints.clear();
  }
}

// Example webhook registrations for development
if (Meteor.isDevelopment) {
  // Register example webhooks for testing
  // registerWebhook(WEBHOOK_EVENTS.USER_REGISTERED, 'http://localhost:3002/webhook/user-registered');
  // registerWebhook(WEBHOOK_EVENTS.USER_LOGIN, 'http://localhost:3002/webhook/user-login');
}
