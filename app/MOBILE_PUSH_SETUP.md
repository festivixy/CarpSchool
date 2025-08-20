# Mobile Push Notifications Setup Guide

## 📱 Complete Native iOS/Android Push Notification Support

This guide covers setting up native push notifications for your Meteor Cordova mobile apps with both Firebase and OneSignal backends.

## 🚀 Quick Setup (Choose Your Backend)

### Option 1: Firebase Mobile Push (Most Common)

#### 1. Install Firebase Cordova Plugin
```bash
# Install Firebase FCM plugin using Meteor
meteor add cordova:cordova-plugin-fcm-with-dependecy-updated@7.8.0

# Alternative: Use standard push plugin
meteor add cordova:phonegap-plugin-push@2.3.0
```

#### 2. Configure Firebase
```bash
# Set environment variables
export NOTIFICATION_BACKEND="firebase"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
```

#### 3. Add Meteor Settings
```json
{
  "public": {
    "notifications": {
      "backend": "firebase"
    },
    "firebase": {
      "senderId": "your-sender-id-here"
    }
  }
}
```

#### 4. iOS Configuration
```bash
# Add iOS platform
meteor add-platform ios

# Configure iOS app in Firebase Console:
# 1. Add iOS app to Firebase project
# 2. Download GoogleService-Info.plist
# 3. Add to mobile-config.js
```

Add to `mobile-config.js`:
```javascript
App.appendToConfig(`
  <platform name="ios">
    <resource-file src="GoogleService-Info.plist" />
  </platform>
`);
```

#### 5. Android Configuration
```bash
# Add Android platform  
meteor add-platform android

# Configure Android app in Firebase Console:
# 1. Add Android app to Firebase project
# 2. Download google-services.json
# 3. Add to mobile-config.js
```

Add to `mobile-config.js`:
```javascript
App.appendToConfig(`
  <platform name="android">
    <resource-file src="google-services.json" target="app/google-services.json" />
  </platform>
`);
```

### Option 2: OneSignal Mobile Push (Easier Setup)

#### 1. Install OneSignal Cordova Plugin
```bash
# Install OneSignal plugin using Meteor
meteor add onesignal-cordova-plugin@3.0.1
```

#### 2. Configure OneSignal
```bash
# Set environment variables
export NOTIFICATION_BACKEND="onesignal"
export ONESIGNAL_APP_ID="your-app-id-here"
export ONESIGNAL_API_KEY="your-api-key-here"
```

#### 3. Add Meteor Settings
```json
{
  "public": {
    "notifications": {
      "backend": "onesignal"
    },
    "oneSignal": {
      "appId": "your-app-id-here"
    }
  }
}
```

#### 4. iOS Configuration
OneSignal handles iOS configuration automatically, but you need:
```bash
# Add iOS platform
meteor add-platform ios

# In OneSignal dashboard:
# 1. Configure iOS platform
# 2. Upload APNs certificates or use APNs Auth Key
```

#### 5. Android Configuration
```bash
# Add Android platform
meteor add-platform android

# OneSignal handles Android automatically
# No additional configuration needed!
```

## 🔧 Build Configuration

### Update mobile-config.js
```javascript
App.info({
  id: 'school.carp.rideshare',
  name: 'Carp School',
  description: 'Ride sharing for students',
  author: 'Carp School',
  email: 'support@carp.school',
  website: 'https://carp.school'
});

// Enable push notifications
App.setPreference('BackgroundMode', 'true');
App.setPreference('BackgroundFetch', '1');

// OneSignal configuration (if using OneSignal)
App.appendToConfig(`
  <platform name="ios">
    <config-file target="*-Info.plist" parent="UIBackgroundModes">
      <array>
        <string>remote-notification</string>
      </array>
    </config-file>
  </platform>
`);

// Firebase configuration files (if using Firebase)
// Add GoogleService-Info.plist and google-services.json as shown above
```

## 🧪 Testing Mobile Push Notifications

### 1. Build and Deploy to Device
```bash
# Build for iOS (requires Mac with Xcode)
meteor build ../output --server=http://localhost:3000
cd ../output/ios
open Carp\ School.xcworkspace

# Build for Android
meteor build ../output --server=http://localhost:3000
# Install .apk from ../output/android/
```

### 2. Test Push Registration
```javascript
// In mobile app console or test page
import { MobilePushHelpers } from '/imports/ui/mobile/utils/MobilePushNotifications';

// Check status
console.log(MobilePushHelpers.getStatus());

// Request permission (iOS)
await MobilePushHelpers.requestPermission();

// Set test tags
await MobilePushHelpers.setRideTags('test-ride-123');
```

### 3. Send Test Notification
```javascript
// From server or browser console
await Meteor.callAsync('notifications.send',
  [Meteor.userId()],
  'Mobile Test 📱',
  'This notification should appear on your mobile device!',
  {
    type: 'system',
    priority: 'normal',
    data: { test: true, action: 'open_app' }
  }
);
```

## 📋 Platform-Specific Features

### iOS Features
- **Rich Notifications**: Images, action buttons
- **Critical Alerts**: For emergency notifications
- **Notification Groups**: Group related notifications
- **Badge Management**: App icon badge counts
- **Sound Customization**: Custom notification sounds

### Android Features  
- **Custom Icons**: Notification and status bar icons
- **LED Colors**: Notification LED customization
- **Vibration Patterns**: Custom vibration
- **Channel Management**: Notification categories
- **Heads-up Notifications**: Priority notifications

## 🔄 Backend Switching

### Runtime Backend Selection
```javascript
// The mobile manager automatically detects backend from Meteor settings
{
  "public": {
    "notifications": {
      "backend": "onesignal"  // or "firebase"
    }
  }
}
```

### Hybrid Setup (Advanced)
```javascript
// Use different backends for different features
// Server can send via both Firebase and OneSignal
// Mobile app connects to the one specified in settings
```

## 🚗 Carp School Specific Integration

### Automatic Integration
The mobile push manager automatically integrates with your existing notification system:

```javascript
// These existing server calls now work on mobile!
await Meteor.callAsync('notifications.sendToRideParticipants',
  rideId,
  'Driver Arriving 🚗',
  'Your driver will arrive in 5 minutes',
  {
    type: 'ride_update',
    priority: 'high',
    data: { rideId, action: 'track_driver' }
  }
);
```

### Mobile-Specific Features
```javascript
// Set location tags for city-based notifications
await MobilePushHelpers.setLocationTags('San Francisco', 'CA');

// Set ride tags when user joins ride
await MobilePushHelpers.setRideTags(rideId);

// Clear tags when ride ends
await MobilePushHelpers.clearRideTags();
```

### Navigation Integration
Notifications automatically navigate to the correct screen:
- **Ride notifications** → `/mobile/ride-info/{rideId}`
- **Chat notifications** → `/chat?chatId={chatId}`
- **Emergency notifications** → Ride details with emergency UI

## 📊 Analytics and Monitoring

### OneSignal Analytics
- Delivery rates per platform
- Open rates and engagement
- A/B testing results
- User segmentation analytics

### Firebase Analytics
- Message delivery confirmation
- User engagement tracking
- Platform performance metrics
- Error rate monitoring

## 🐛 Troubleshooting

### Common Issues

#### "Plugin not found" errors
```bash
# Make sure plugins are installed
meteor list --tree | grep cordova
meteor list --tree | grep onesignal
```

#### iOS notifications not working
1. Check Apple Developer certificates
2. Verify APNs configuration in Firebase/OneSignal
3. Test on physical device (not simulator)
4. Check iOS app permissions

#### Android notifications not working
1. Check FCM/OneSignal Android configuration
2. Verify app package name matches configuration
3. Check Android notification settings
4. Test with different Android versions

#### Token registration failing
```javascript
// Check mobile push manager status
import { mobilePushManager } from '/imports/ui/mobile/utils/MobilePushNotifications';
console.log(mobilePushManager.getStatus());
```

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'push*');

// Check device console logs
// Use Safari Web Inspector (iOS) or Chrome DevTools (Android)
```

## 🚀 Production Deployment

### iOS Production
1. **Apple Developer Account** required
2. **APNs Production Certificates** or Auth Keys
3. **App Store submission** with push notification entitlement
4. **Test with TestFlight** before public release

### Android Production
1. **Google Play Console** account
2. **Firebase/OneSignal production configuration**
3. **Signed APK** for Play Store
4. **Test with internal testing** track

### Environment Configuration
```bash
# Production environment variables
NOTIFICATION_BACKEND=onesignal
ONESIGNAL_APP_ID=production-app-id
ONESIGNAL_API_KEY=production-api-key

# Or for Firebase
NOTIFICATION_BACKEND=firebase
FIREBASE_PROJECT_ID=production-project
FIREBASE_CLIENT_EMAIL=production-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="production-private-key"
```

## 📚 Additional Resources

- [Meteor Cordova Guide](https://docs.meteor.com/packages/meteor-platform.html#Cordova)
- [Firebase iOS Setup](https://firebase.google.com/docs/ios/setup)
- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [OneSignal Cordova Setup](https://documentation.onesignal.com/docs/cordova-sdk-setup)
- [Apple Push Notifications](https://developer.apple.com/documentation/usernotifications)
- [Android Notifications](https://developer.android.com/guide/topics/ui/notifiers/notifications)

Your mobile apps now have **complete native push notification support**! 🎉📱
