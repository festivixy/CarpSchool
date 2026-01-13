# CarpSchool REST API Documentation

## Authentication

Most API endpoints require authentication using an API key in the Authorization header:

```
Authorization: Bearer carp_[your-api-key]
```

You can obtain an API key through the authentication endpoints below or generate one using the Meteor method `apiKeys.generate()` from within the app.

### Authentication Endpoints

#### POST /auth/login
Login with username/email and password to get an API token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
OR
```json
{
  "username": "yourusername",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "carp_abc123...",
    "user": {
      "_id": "user_id",
      "username": "yourusername",
      "emails": [{"address": "user@example.com", "verified": true}]
    },
    "message": "Login successful"
  }
}
```

#### POST /auth/register
Register a new user account and get an API token.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "username": "newusername",
  "password": "newpassword",
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "carp_xyz789...",
    "user": {
      "_id": "new_user_id",
      "username": "newusername",
      "emails": [{"address": "newuser@example.com", "verified": false}]
    },
    "message": "Registration successful"
  }
}
```

#### POST /auth/logout
Logout and invalidate the current API token.

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Logout successful"
  }
}
```

#### POST /auth/logout-all
Logout from all sessions (revoke all API tokens).

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Logged out from all sessions",
    "tokensRevoked": 3
  }
}
```

#### POST /auth/refresh
Generate a new API token.

**Request Body:**
```json
{
  "revokeOld": false
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "carp_newtoken123...",
    "message": "Token refreshed successfully"
  }
}
```

#### POST /auth/forgot-password
Request password reset email (no authentication required).

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "If an account with that email exists, a password reset link has been sent."
  }
}
```

#### POST /auth/verify-email
Verify email address with token (no authentication required).

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Email verified successfully"
  }
}
```

#### POST /auth/resend-verification
Resend email verification (no authentication required).

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "If an account with that email exists, a verification email has been sent."
  }
}
```

#### GET /auth/check-availability
Check if email or username is available for registration (no authentication required).

**Query Parameters:**
- `email` - Email address to check
- `username` - Username to check

**Example:** `/api/v1/auth/check-availability?email=test@example.com&username=testuser`

**Response:**
```json
{
  "status": "success",
  "data": {
    "available": false,
    "email": false,
    "username": true
  }
}
```

#### POST /auth/change-password
Change current user's password (authentication required).

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Password changed successfully"
  }
}
```

## Base URL

```
https://your-domain.com/api/v1
```

## Endpoints

### Authentication & User Info

#### GET /me
Get current user information.

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "user_id",
    "username": "username",
    "profile": {},
    "emails": []
  }
}
```

#### POST /validate-key
Validate the current API key.

**Response:**
```json
{
  "status": "success",
  "data": {
    "valid": true,
    "userId": "user_id",
    "username": "username",
    "message": "API key is valid"
  }
}
```

#### GET /account/status
Get comprehensive account status information.

**Response:**
```json
{
  "status": "success",
  "data": {
    "userId": "user_id",
    "username": "username",
    "emailVerified": true,
    "hasProfile": true,
    "activeTokens": 2,
    "createdAt": "2024-01-01T08:00:00Z",
    "lastLogin": "2024-01-01T10:30:00Z"
  }
}
```

### Rides

#### GET /rides
List rides with filtering and pagination.

**Query Parameters:**
- `from` - Filter rides from this date (ISO 8601)
- `to` - Filter rides to this date (ISO 8601)
- `origin` - Filter by origin location (partial match)
- `destination` - Filter by destination location (partial match)
- `driver` - Filter by driver user ID
- `availableSeats` - Minimum available seats
- `limit` - Number of results (max 100, default 50)
- `skip` - Number of results to skip (pagination)

**Example:** `/api/v1/rides?from=2024-01-01&destination=Vancouver&limit=20`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "ride_id",
      "driver": "user_id",
      "riders": ["user_id"],
      "origin": "Origin Location",
      "destination": "Destination Location",
      "date": "2024-01-01T10:00:00Z",
      "seats": 3,
      "notes": "Any additional notes",
      "createdAt": "2024-01-01T08:00:00Z"
    }
  ],
  "meta": {
    "total": 156,
    "limit": 20,
    "skip": 0
  }
}
```

#### POST /rides
Create a new ride.

**Request Body:**
```json
{
  "origin": "Origin Location",
  "destination": "Destination Location",
  "date": "2024-01-01T10:00:00Z",
  "seats": 3,
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "rideId": "new_ride_id",
    "message": "Ride created successfully"
  }
}
```

#### GET /rides/:id
Get details of a specific ride.

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "ride_id",
    "driver": "user_id",
    "riders": ["user_id"],
    "origin": "Origin Location",
    "destination": "Destination Location",
    "date": "2024-01-01T10:00:00Z",
    "seats": 3,
    "notes": "Any additional notes",
    "createdAt": "2024-01-01T08:00:00Z"
  }
}
```

#### PUT /rides/:id
Update a ride (only by driver or admin).

**Request Body:**
```json
{
  "origin": "New Origin",
  "destination": "New Destination",
  "date": "2024-01-02T10:00:00Z",
  "seats": 4,
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Ride updated successfully"
  }
}
```

#### DELETE /rides/:id
Delete a ride (only by driver or admin).

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Ride deleted successfully"
  }
}
```

#### POST /rides/:id/join
Join a ride as a rider.

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Successfully joined ride"
  }
}
```

#### POST /rides/:id/leave
Leave a ride you're currently riding.

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Successfully left ride"
  }
}
```

### Profile

#### GET /profile
Get current user's profile.

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "profile_id",
    "Owner": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "User bio",
    "phone": "+1234567890",
    "school": "school_id"
  }
}
```

#### PUT /profile
Update current user's profile.

**Request Body:**
```json
{
  "Name": "John Doe",
  "Location": "Vancouver, BC",
  "Phone": "+1234567890",
  "Other": "Additional information",
  "UserType": "Driver",
  "major": "Computer Science"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Profile updated successfully"
  }
}
```

### Schools

#### GET /schools
List all schools.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "school_id",
      "name": "School Name",
      "domain": "school.edu",
      "location": "City, State"
    }
  ]
}
```

### Notifications

#### GET /notifications
Get user's notifications.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "notification_id",
      "userId": "user_id",
      "type": "ride_request",
      "message": "Someone wants to join your ride",
      "read": false,
      "createdAt": "2024-01-01T08:00:00Z"
    }
  ]
}
```

#### PUT /notifications/:id/read
Mark a notification as read.

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Notification marked as read"
  }
}
```

### Chat

#### GET /chats
Get user's chat channels.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "chat_id",
      "participants": ["user_id1", "user_id2"],
      "lastActivity": "2024-01-01T08:00:00Z",
      "rideId": "ride_id"
    }
  ]
}
```

#### GET /chats/:id/messages
Get messages from a chat channel.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "message_id",
      "channelId": "chat_id",
      "userId": "user_id",
      "text": "Hello!",
      "createdAt": "2024-01-01T08:00:00Z"
    }
  ]
}
```

#### POST /chats/:id/messages
Send a message to a chat channel.

**Request Body:**
```json
{
  "text": "Hello there!"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "messageId": "new_message_id",
    "message": "Message sent successfully"
  }
}
```

### Admin

#### GET /users
Search and list users (admin only).

**Query Parameters:**
- `search` - Search by username or email
- `limit` - Number of results (max 100, default 50)
- `skip` - Number of results to skip (pagination)

**Example:** `/api/v1/users?search=john&limit=20`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "user_id",
      "username": "johndoe",
      "emails": [{"address": "john@example.com", "verified": true}],
      "profile": {},
      "createdAt": "2024-01-01T08:00:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "limit": 20,
    "skip": 0
  }
}
```

#### GET /stats
Get system statistics (admin only).

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalUsers": 150,
    "totalProfiles": 148,
    "totalRides": 45,
    "activeRides": 12,
    "timestamp": "2024-01-01T08:00:00Z"
  }
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Common Error Codes

- `400` - Bad Request (missing required fields, invalid data)
- `401` - Unauthorized (missing or invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## API Key Management

### Via REST API

#### POST /api-keys
Generate a new API key.

**Response:**
```json
{
  "status": "success",
  "data": {
    "apiKey": "carp_abc123...",
    "message": "API key generated successfully"
  }
}
```

#### GET /api-keys
List current user's API keys (truncated for security).

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "key_id",
      "createdAt": "2024-01-01T08:00:00Z",
      "lastUsed": "2024-01-01T10:30:00Z",
      "loginBased": true,
      "key": "carp_abc12..."
    }
  ]
}
```

#### GET /api-keys/current
Get information about the current API key being used.

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "key_id",
    "createdAt": "2024-01-01T08:00:00Z",
    "lastUsed": "2024-01-01T10:30:00Z",
    "loginBased": true,
    "key": "carp_abc12..."
  }
}
```

#### DELETE /api-keys/:id
Revoke an API key.

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "API key revoked successfully"
  }
}
```

#### DELETE /api-keys/login-based
Revoke all login-based tokens (keeps manually generated ones).

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "All login-based tokens revoked",
    "tokensRevoked": 2
  }
}
```

#### DELETE /account
Delete user account permanently (requires password confirmation).

**Request Body:**
```json
{
  "password": "currentpassword",
  "confirmDelete": "DELETE"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Account deleted successfully"
  }
}
```

### Via Meteor Methods

You can also manage API keys using these Meteor methods from within the app:

```javascript
// Generate a new API key
const apiKey = await Meteor.callAsync('apiKeys.generate');

// List user's API keys
const keys = await Meteor.callAsync('apiKeys.list');

// Revoke an API key
await Meteor.callAsync('apiKeys.revoke', keyId);
```

## Health Check

#### GET /health
Check API health status (no authentication required).

**Response:**
```json
{
  "status": "success",
  "data": {
    "service": "CarpSchool API",
    "version": "1.0.0",
    "timestamp": "2024-01-01T08:00:00Z",
    "uptime": 3600,
    "environment": "production"
  }
}
```

## Rate Limiting

The API implements rate limiting:
- **General endpoints**: 100 requests per minute per user
- **Login attempts**: 5 attempts per 5 minutes per IP address
- **Registration**: 3 attempts per hour per IP address

Excessive requests may result in temporary throttling with `429 Too Many Requests` responses.

## CORS

The API supports CORS for cross-origin requests from authorized domains.

## Authentication Examples

### For Standalone Apps

#### Full Authentication Flow
```javascript
// 1. Register new user
const registerResponse = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'newuser',
    password: 'securepassword123',
    profile: { firstName: 'John', lastName: 'Doe' }
  })
});

const { data: registerData } = await registerResponse.json();
const token = registerData.token;

// 2. Use token for authenticated requests
const ridesResponse = await fetch('/api/v1/rides', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 3. Logout when done
await fetch('/api/v1/auth/logout', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### Login Existing User
```javascript
// Login with email
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'userpassword'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// Store token securely for subsequent requests
localStorage.setItem('carpschool_token', token);
```

#### Token Management
```javascript
// Check if token is still valid
const validateResponse = await fetch('/api/v1/validate-key', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

if (!validateResponse.ok) {
  // Token invalid, need to login again
  redirectToLogin();
}

// Refresh token (generate new one)
const refreshResponse = await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ revokeOld: true })
});

const { data: refreshData } = await refreshResponse.json();
const newToken = refreshData.token;
```

## Security Considerations

### For Production Use
- **HTTPS Only**: Ensure API is only accessible over HTTPS
- **Token Storage**: Store API tokens securely (secure storage on mobile, httpOnly cookies on web)
- **Token Rotation**: Regularly refresh tokens for long-lived sessions
- **Rate Limiting**: Monitor and adjust rate limits based on usage patterns
- **Input Validation**: All inputs are validated server-side
- **Error Handling**: Sensitive information is not exposed in error messages

### Error Response Format
```json
{
  "status": "error",
  "message": "Description of the error"
}
```

### Rate Limit Headers
When rate limited, responses include:
```
X-RateLimit-Remaining: 0
Retry-After: 60
X-RateLimit-Reset: 1704067200
```

## Webhook System

### Overview
The API supports webhooks for real-time notifications of authentication events. Webhooks are HTTP callbacks sent to your specified endpoints when events occur.

### Webhook Events
- `user.registered` - New user registration
- `user.login` - User login event
- `user.logout` - User logout event
- `user.password_changed` - Password change
- `user.email_verified` - Email verification
- `token.created` - New API token created
- `token.revoked` - API token revoked

### Webhook Payload Format
```json
{
  "event": "user.registered",
  "data": {
    "userId": "user_id",
    "username": "username",
    "email": "user@example.com",
    "timestamp": "2024-01-01T10:30:00Z"
  },
  "timestamp": "2024-01-01T10:30:00Z",
  "id": "wh_abc123"
}
```

### Webhook Management (Admin Only)

#### GET /webhooks
List all registered webhooks.

**Response:**
```json
{
  "status": "success",
  "data": {
    "user.registered": [
      {
        "url": "https://yourapp.com/webhook/user-registered",
        "active": true,
        "hasSecret": true,
        "createdAt": "2024-01-01T08:00:00Z"
      }
    ]
  }
}
```

#### POST /webhooks
Register a new webhook endpoint.

**Request Body:**
```json
{
  "event": "user.registered",
  "url": "https://yourapp.com/webhook/user-registered",
  "secret": "your_webhook_secret"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Webhook registered successfully"
  }
}
```

#### DELETE /webhooks
Remove a webhook endpoint.

**Request Body:**
```json
{
  "event": "user.registered",
  "url": "https://yourapp.com/webhook/user-registered"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Webhook removed successfully"
  }
}
```

### Webhook Security

#### Signature Verification
When a secret is provided, webhooks include an `X-CarpSchool-Signature` header:

```javascript
// Verify webhook signature
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Express.js example
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-carpschool-signature'];
  const payload = JSON.stringify(req.body);

  if (verifyWebhookSignature(payload, signature, 'your_secret')) {
    // Process webhook
    console.log('Webhook verified:', req.body);
    res.status(200).send('OK');
  } else {
    res.status(400).send('Invalid signature');
  }
});
```

## Analytics (Admin Only)

### GET /analytics/auth
Authentication analytics and metrics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "users": {
      "total": 150,
      "newToday": 5,
      "newThisWeek": 23,
      "verified": 142,
      "verificationRate": "94.67%"
    },
    "tokens": {
      "total": 89,
      "loginBased": 67,
      "manual": 22,
      "activeToday": 34
    }
  }
}
```

### GET /analytics/usage
API usage analytics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "activeUsers24h": 34,
    "totalApiKeys": 89,
    "avgTokensPerUser": "2.15",
    "systemUptime": 86400,
    "memoryUsage": {
      "rss": 45678912,
      "heapTotal": 23456789,
      "heapUsed": 12345678
    }
  }
}
```
