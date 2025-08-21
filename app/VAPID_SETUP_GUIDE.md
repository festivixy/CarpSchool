# VAPID Configuration Guide

VAPID (Voluntary Application Server Identification) is required for browser-based web push notifications. This guide shows you how to configure VAPID keys for your Meteor.js rideshare application.

## 🔑 Quick Setup

### 1. Generate VAPID Keys

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

**Output example:**
```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa40HI0DLLuxazjBF_tCqvmHWTLGEtMiT4qTgtBcFGdOXm_-JXO8n5zrHdpMJ4

Private Key:
4OM3EtXb1HI0DLLuxazjBF_tCqvmHWTLGEtMiT4qTgtBcFGdOXm_-JXO8n5zrHdpMJ4
=======================================
```

### 2. Install Web Push Package

```bash
# In your Meteor project directory
meteor npm install web-push
```

### 3. Configure Environment Variables

Add to your `.env` file:

```env
# Web Push Configuration (VAPID keys)
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa40HI0DLLuxazjBF_tCqvmHWTLGEtMiT4qTgtBcFGdOXm_-JXO8n5zrHdpMJ4
VAPID_PRIVATE_KEY=4OM3EtXb1HI0DLLuxazjBF_tCqvmHWTLGEtMiT4qTgtBcFGdOXm_-JXO8n5zrHdpMJ4
VAPID_SUBJECT=mailto:your-email@carpschool.com
```

### 4. Configure Meteor Settings (Optional)

Create `settings.json`:

```json
{
  "public": {
    "vapid": {
      "publicKey": "BEl62iUYgUivxIkv69yViEuiBIa40HI0DLLuxazjBF_tCqvmHWTLGEtMiT4qTgtBcFGdOXm_-JXO8n5zrHdpMJ4"
    }
  },
  "private": {
    "vapid": {
      "privateKey": "4OM3EtXb1HI0DLLuxazjBF_tCqvmHWTLGEtMiT4qTgtBcFGdOXm_-JXO8n5zrHdpMJ4",
      "subject": "mailto:your-email@carpschool.com"
    }
  }
}
```

### 5. Start Meteor with Settings

```bash
# With settings file
meteor run --settings settings.json

# Or with environment variables only
meteor run
```

## 🧪 Testing VAPID Configuration

### 1. Check VAPID Status

In browser console:

```javascript
// Test VAPID key availability
Meteor.call('notifications.getVapidPublicKey', (error, result) => {
  if (error) {
    console.error('VAPID Error:', error);
  } else {
    console.log('VAPID Key:', result);
  }
});
```

### 2. Test Web Push Subscription

```javascript
// Test web push subscription
import { notificationManager } from '/imports/ui/utils/notifications';

// Check if web push is available
console.log('Web Push Status:', notificationManager.getStatus());

// Request permission and subscribe
notificationManager.requestPermission().then(granted => {
  console.log('Permission granted:', granted);
});
```

### 3. Use Notification Test Page

Visit `/test/notification` and:
1. Click "Check Permissions"
2. Click "Register Token" 
3. Look for VAPID-related logs

## 🔧 Configuration Methods

The application supports multiple configuration methods (in order of priority):

### Method 1: Environment Variables (Recommended)
```env
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:your-email@domain.com
```

### Method 2: Meteor Settings
```json
{
  "public": { "vapid": { "publicKey": "..." } },
  "private": { "vapid": { "privateKey": "...", "subject": "..." } }
}
```

### Method 3: Server-side Only
Set only environment variables, client will fetch public key from server.

## 🚨 Troubleshooting

### Common Issues

**1. "VAPID public key not configured"**
- Check environment variables are set
- Verify `.env` file is in project root
- Restart Meteor after adding environment variables

**2. "web-push package not installed"**
```bash
meteor npm install web-push
```

**3. "Invalid VAPID keys"**
- Regenerate keys with `web-push generate-vapid-keys`
- Ensure no extra whitespace in environment variables
- Check keys are base64url encoded (no padding)

**4. "Subscription failed"**
- Check browser supports push notifications
- Verify HTTPS in production (required for web push)
- Check browser console for detailed errors

### Debug Commands

```bash
# Check if web-push is installed
meteor npm list web-push

# Verify environment variables
echo $VAPID_PUBLIC_KEY

# Test VAPID key format
node -e "console.log(require('web-push').validateVapidKeys({ publicKey: 'YOUR_KEY', privateKey: 'YOUR_KEY' }))"
```

## 🔒 Security Notes

1. **Never expose private keys**: Keep `VAPID_PRIVATE_KEY` secret
2. **Use HTTPS**: Web push requires secure context in production
3. **Rotate keys**: Consider rotating VAPID keys periodically
4. **Validate subject**: Use a real email address for VAPID subject

## 📚 Additional Resources

- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [web-push Library](https://github.com/web-push-libs/web-push)
- [Push API MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

## 🎯 Next Steps

After configuring VAPID:

1. **Test notifications**: Use the notification test page
2. **Monitor logs**: Check server logs for VAPID initialization
3. **Test multiple browsers**: Verify cross-browser compatibility
4. **Production setup**: Ensure HTTPS and proper key management
