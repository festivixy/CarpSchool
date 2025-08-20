# Push Notification Testing Guide

## 🚀 Quick Start Testing

### Option 1: Simple Browser Console Test (Easiest)

1. **Open your app in browser** (localhost:3000)
2. **Open Developer Console** (F12)
3. **Paste this test code:**

```javascript
// Test notification registration and sending
(async () => {
  try {
    // Register a fake token (for testing without Firebase)
    await Meteor.callAsync('notifications.registerPushToken', 
      'test-token-' + Date.now(), 
      'web', 
      { model: 'Browser Test' }
    );
    
    // Send yourself a test notification
    await Meteor.callAsync('notifications.send',
      [Meteor.userId()], // Send to yourself
      'Test Notification',
      'This is a test push notification!',
      {
        type: 'system',
        priority: 'normal',
        data: { test: true }
      }
    );
    
    console.log('✅ Test notification sent successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
})();
```

### Option 2: Using Admin Interface (Recommended)

1. **Make yourself admin:**
```javascript
// In browser console
Meteor.call('accounts.makeAdmin', Meteor.userId());
```

2. **Navigate to Admin Interface:**
   - Go to `/admin-notifications` (you may need to add this route)
   - Or create a test page that imports the AdminNotifications component

3. **Use the Test Form:**
   - Leave recipients empty (will send to yourself)
   - Add title: "Test Push"
   - Add body: "Testing push notifications"
   - Select type: "system"
   - Click "Send Test Notification"

### Option 3: Trigger from Ride Events (Integration Test)

1. **Create a test ride**
2. **Join/leave the ride** - should trigger notifications
3. **Cancel a ride** - should send cancellation notifications
4. **Send chat messages** - should notify offline users

## 🔧 Environment Configuration

### For Basic Testing (No Firebase needed)
```bash
# No environment variables needed for basic API testing
# The system will work without Firebase, just won't send actual push notifications
```

### For Full Firebase Testing
```bash
# Add to your .env or environment
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

### For Web Push Testing
```bash
# Add VAPID keys for web push
export VAPID_PUBLIC_KEY="your-vapid-public-key"
export VAPID_PRIVATE_KEY="your-vapid-private-key"
```

## 📱 Platform-Specific Testing

### Browser/Web Testing
1. **Enable notifications in browser settings**
2. **Open app in HTTPS** (required for web push)
3. **Check browser console** for registration logs
4. **Test service worker** in Application tab

### Cordova/Mobile Testing
1. **Install push plugin:**
```bash
meteor add cordova:phonegap-plugin-push@2.3.0
```

2. **Add platform:**
```bash
meteor add-platform ios
# or
meteor add-platform android
```

3. **Test on device/emulator**

### iOS Testing
1. **Configure APNs certificates**
2. **Test on physical device** (push notifications don't work in simulator)
3. **Check device console** for registration tokens

### Android Testing
1. **Configure Firebase project**
2. **Add google-services.json**
3. **Test on device or emulator**

## 🎯 Testing Scenarios

### Scenario 1: User Registration
```javascript
// Test user registration flow
await Meteor.callAsync('notifications.registerPushToken', 
  'test-token-123', 
  'ios', 
  { model: 'iPhone 12', version: '14.0' }
);
```

### Scenario 2: Ride Events
```javascript
// Test ride cancellation
await Meteor.callAsync('notifications.sendToRideParticipants',
  'your-ride-id',
  'Ride Cancelled',
  'Your ride has been cancelled by the driver',
  { type: 'ride_cancelled', priority: 'high' }
);
```

### Scenario 3: Emergency Notifications
```javascript
// Test emergency notification
await Meteor.callAsync('notifications.send',
  ['user-id-1', 'user-id-2'],
  '🚨 Emergency Alert',
  'Emergency situation detected in your ride',
  { 
    type: 'emergency', 
    priority: 'urgent',
    data: { rideId: 'emergency-ride-id' }
  }
);
```

### Scenario 4: Batch Notifications
```javascript
// Test sending to multiple users
const allUsers = Meteor.users.find({}, {fields: {_id: 1}}).fetch();
const userIds = allUsers.map(u => u._id);

await Meteor.callAsync('notifications.send',
  userIds,
  'System Maintenance',
  'Scheduled maintenance tonight at 2 AM',
  { type: 'system', priority: 'normal' }
);
```

## 🔍 Debugging & Monitoring

### Check Notification Status
```javascript
// Check your recent notifications
Notifications.find({userId: Meteor.userId()}, {sort: {createdAt: -1}}).fetch();

// Check notification statistics (admin only)
await Meteor.callAsync('notifications.getStats');
```

### Check Push Tokens
```javascript
// Check your registered tokens
PushTokens.find({userId: Meteor.userId()}).fetch();

// Check all active tokens (admin only)
PushTokens.find({isActive: true}).fetch();
```

### Monitor Server Logs
```bash
# Watch for notification logs
tail -f .meteor/local/log/meteor.log | grep -i "notification\|push"
```

### Browser Developer Tools
1. **Application Tab** → Service Workers
2. **Console Tab** → Filter for "Push" or "Notification"
3. **Network Tab** → Check Firebase API calls

## 🐛 Common Issues & Solutions

### Issue: "Service not initialized"
**Solution:** Check Firebase environment variables
```javascript
// Check service status
import { PushNotificationService } from '/imports/startup/server/PushNotificationService';
console.log(PushNotificationService.getStatus());
```

### Issue: "No active tokens found"
**Solution:** Register a push token first
```javascript
// Register token manually
await Meteor.callAsync('notifications.registerPushToken', 'test-token', 'web', {});
```

### Issue: Web push not working
**Solution:** 
- Ensure HTTPS
- Check browser permissions
- Verify service worker registration

### Issue: Firebase errors
**Solution:**
- Verify environment variables
- Check Firebase project configuration
- Install firebase-admin: `meteor npm install firebase-admin`

## 📊 Testing Checklist

### Basic API Testing
- [ ] Can register push tokens
- [ ] Can send notifications to specific users
- [ ] Can send ride-specific notifications
- [ ] Can mark notifications as read
- [ ] Admin can view statistics

### Integration Testing
- [ ] Ride join/leave triggers notifications
- [ ] Chat messages trigger notifications
- [ ] Ride cancellation sends notifications
- [ ] Emergency notifications work

### Platform Testing
- [ ] Web browser notifications
- [ ] Cordova mobile notifications
- [ ] Service worker handles notifications
- [ ] Notification clicks navigate correctly

### Performance Testing
- [ ] Batch notifications work
- [ ] Large user groups handle correctly
- [ ] Invalid tokens are cleaned up
- [ ] Rate limiting prevents spam

## 🎯 Quick Test Commands

```javascript
// Quick notification test
await Meteor.callAsync('notifications.send', [Meteor.userId()], 'Test', 'Hello!', {type: 'system'});

// Quick ride notification test (replace with real ride ID)
await Meteor.callAsync('notifications.sendToRideParticipants', 'RIDE_ID', 'Test Ride', 'Test message', {type: 'ride_update'});

// Check if you have notifications
Notifications.find({userId: Meteor.userId()}).count();

// Check unread count
Notifications.find({userId: Meteor.userId(), status: {$ne: 'read'}}).count();
```

## 🚀 Production Testing

1. **Start with staging environment**
2. **Test with small user group**
3. **Monitor Firebase quotas**
4. **Check notification delivery rates**
5. **Verify cross-platform compatibility**
6. **Test during peak usage times**

Remember: Push notifications require user permission and proper platform setup. Start with basic API testing before moving to full Firebase integration!
