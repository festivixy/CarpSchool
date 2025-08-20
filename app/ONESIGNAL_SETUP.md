# OneSignal Setup Guide for Carp School

## 🚀 Quick Setup (5 minutes)

### 1. Create OneSignal Account
1. Go to [https://onesignal.com](https://onesignal.com)
2. Sign up for free account
3. Click "Add a new app"
4. Enter app name: "Carp School"
5. Choose "Web Push" platform

### 2. Get Credentials
1. In OneSignal dashboard, go to **Settings** → **Keys & IDs**
2. Copy your **App ID** (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
3. Copy your **REST API Key** (looks like: `YWFhYWFhYWEtYWFhYS1hYWFhLWFhYWEtYWFhYWFhYWFhYWFh`)

### 3. Configure Environment
```bash
# Add to your environment variables (.env file or system env)
export NOTIFICATION_BACKEND="onesignal"
export ONESIGNAL_APP_ID="your-app-id-here"
export ONESIGNAL_API_KEY="your-rest-api-key-here"
```

### 4. Install OneSignal Package
```bash
meteor npm install onesignal-node
```

### 5. Configure Meteor Settings
Add to your `settings.json`:
```json
{
  "public": {
    "oneSignal": {
      "appId": "your-app-id-here"
    }
  }
}
```

Start meteor with: `meteor --settings settings.json`

### 6. Test the Setup
1. Go to `/test-notifications` in your app
2. Click "OneSignal Setup" button
3. Grant notification permission
4. Click "OneSignal Test" button
5. You should receive a test notification!

## 🔧 Advanced Configuration

### Web Push Setup
1. In OneSignal dashboard → **Settings** → **Web Configuration**
2. Add your site URL: `https://yourdomain.com`
3. For localhost development, add: `http://localhost:3000`
4. Upload app icons (optional but recommended)

### Mobile App Setup (iOS/Android)
1. In OneSignal dashboard → **Settings** → **Platforms**
2. **For iOS**: Add iOS platform, upload APNs certificates
3. **For Android**: Add Android platform, configure Firebase
4. Install Cordova plugin: `meteor add cordova:phonegap-plugin-push`

## 🎯 Environment Configuration Options

### Option 1: Use OneSignal Only
```bash
export NOTIFICATION_BACKEND="onesignal"
export ONESIGNAL_APP_ID="your-app-id"
export ONESIGNAL_API_KEY="your-api-key"
```

### Option 2: Use Firebase Only (default)
```bash
export NOTIFICATION_BACKEND="firebase"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_CLIENT_EMAIL="your-service-account@project.com"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
```

### Option 3: Switch Dynamically
The system automatically detects which backend to use based on environment variables.

## 🧪 Testing Different Scenarios

### Test Basic Notifications
```javascript
// In browser console
await Meteor.callAsync('notifications.send', 
  [Meteor.userId()], 
  'OneSignal Test', 
  'This notification is sent via OneSignal!',
  { type: 'system' }
);
```

### Test Ride Notifications
```javascript
// Test ride-specific notification
await Meteor.callAsync('notifications.sendToRideParticipants',
  'your-ride-id',
  'Driver Arriving',
  'Your driver will arrive in 5 minutes',
  { type: 'ride_update', priority: 'high' }
);
```

### Test User Segmentation
```javascript
// Send to all users in a city (admin only)
await Meteor.callAsync('notifications.sendToSegment',
  [{ field: 'tag', key: 'city', relation: '=', value: 'San Francisco' }],
  'City Update',
  'New ride-sharing zones available in SF!',
  { type: 'system' }
);
```

## 📊 OneSignal Dashboard Features

### Real-time Analytics
- Delivery rates
- Click-through rates  
- User engagement metrics
- Platform breakdown (iOS/Android/Web)

### A/B Testing
- Test different message content
- Optimize send times
- Improve user engagement

### Advanced Targeting
- User tags and segments
- Location-based targeting
- Behavioral targeting
- Custom audiences

## 🚗 Carp School Specific Features

### Automatic Ride Tagging
When users join rides, they automatically get tagged:
```javascript
// Automatically set when user joins ride
tags: {
  currentRide: 'ride-123',
  hasActiveRide: 'true',
  city: 'San Francisco'
}
```

### Smart Notifications
- **Driver Arriving**: Only sent to specific rider
- **Ride Cancelled**: Sent to all ride participants
- **Chat Messages**: Only sent to offline users
- **Emergency Alerts**: High priority with action buttons

### Rich Notifications
- **Action Buttons**: "Track Driver", "Call Driver", "Reply"
- **Images**: Driver photos, route maps
- **Deep Linking**: Direct navigation to specific app screens

## 💰 Pricing Comparison

### OneSignal Free Tier
- ✅ **10,000 users** forever free
- ✅ **Unlimited notifications**
- ✅ **All features** included
- ✅ **No message limits**

### Firebase Free Tier
- ✅ **Unlimited users**
- ✅ **10M messages/month** free
- ✅ **All features** included

### Recommendation for Carp School
- **Under 10K users**: OneSignal (better features, free)
- **Over 10K users**: Consider costs vs features
- **High message volume**: Firebase might be cheaper

## 🔄 Migration Between Services

The notification system supports easy switching:

```javascript
// Change environment variable
NOTIFICATION_BACKEND="onesignal"  // or "firebase"

// Everything else works the same!
await Meteor.callAsync('notifications.send', ...);
```

## 🐛 Troubleshooting

### OneSignal not working?
1. Check browser console for errors
2. Verify App ID in Meteor settings
3. Ensure OneSignal SDK is loaded
4. Check notification permissions

### Notifications not received?
1. Check OneSignal dashboard delivery stats
2. Verify user has granted permission
3. Test with OneSignal test notification feature
4. Check browser's notification settings

### Development issues?
1. Use `/test-notifications` page for debugging
2. Check server logs for OneSignal errors
3. Verify environment variables are set
4. Test with curl to OneSignal API directly

## 📚 Additional Resources

- [OneSignal Documentation](https://documentation.onesignal.com/)
- [Web Push API Guide](https://documentation.onesignal.com/docs/web-push-quickstart)
- [OneSignal Node.js SDK](https://github.com/OneSignal/node-onesignal)
- [Testing Tools](https://onesignal.com/demo)

## 🎯 Next Steps

1. **Set up OneSignal account** (5 minutes)
2. **Configure environment** variables
3. **Test basic functionality** with test page
4. **Set up mobile apps** (iOS/Android) if needed
5. **Customize notification** content and styling
6. **Monitor analytics** and optimize engagement

Your notification system is now ready for production with OneSignal! 🚀
