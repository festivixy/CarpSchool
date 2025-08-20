# Mobile Push Notification Plugin Installation

## 🚀 Quick Plugin Installation Commands

Use these **Meteor commands** to install the required Cordova plugins for native mobile push notifications:

### Option 1: Firebase Mobile Push (Most Common)

#### Install Firebase FCM Plugin
```bash
# Primary recommendation - FCM with dependency updates
meteor add cordova:cordova-plugin-fcm-with-dependecy-updated@7.8.0

# Alternative - Standard push notification plugin
meteor add cordova:phonegap-plugin-push@2.3.0
```

#### Required Platforms
```bash
# Add mobile platforms
meteor add-platform ios
meteor add-platform android
```

### Option 2: OneSignal Mobile Push (Easier Setup)

#### Install OneSignal Plugin
```bash
# OneSignal Cordova plugin
meteor add onesignal-cordova-plugin@3.0.1

# Alternative version if above doesn't work
meteor add cordova:onesignal-cordova-plugin@2.11.0
```

#### Required Platforms
```bash
# Add mobile platforms (same as Firebase)
meteor add-platform ios
meteor add-platform android
```

### Option 3: Both (Maximum Compatibility)

```bash
# Install both plugins for maximum flexibility
meteor add cordova:cordova-plugin-fcm-with-dependecy-updated@7.8.0
meteor add onesignal-cordova-plugin@3.0.1

# Add platforms
meteor add-platform ios
meteor add-platform android
```

## 🔧 Verify Installation

```bash
# Check installed Cordova plugins
meteor list --tree | grep cordova

# Should show something like:
# cordova:cordova-plugin-fcm-with-dependecy-updated@7.8.0
# or
# onesignal-cordova-plugin@3.0.1
```

## 📱 Platform-Specific Setup

### iOS Requirements
- **macOS** with Xcode installed
- **Apple Developer Account** for push notifications
- **APNs certificates** or Auth Key

### Android Requirements
- **Android SDK** installed
- **Firebase project** (for Firebase backend)
- **OneSignal account** (for OneSignal backend)

## 🚀 Build and Test

```bash
# Build for iOS (Mac only)
meteor build ../output --server=http://your-server.com
cd ../output/ios
open "Carp School.xcworkspace"

# Build for Android
meteor build ../output --server=http://your-server.com
# Install the APK from ../output/android/
```

## 🧪 Test Installation

After installing plugins and building the app:

1. **Open the mobile app** on a device
2. **Navigate to** `/test-notifications` or `/mobile-push-test`
3. **Click "Check Support"** - should show plugin is available
4. **Click "Request Permission"** - should prompt for notification permission
5. **Click "Send Mobile Test"** - should receive native push notification

## 🐛 Troubleshooting

### Plugin not found errors
```bash
# Remove and re-add plugins
meteor remove cordova:cordova-plugin-fcm-with-dependecy-updated
meteor add cordova:cordova-plugin-fcm-with-dependecy-updated@7.8.0

# Clean build
meteor reset
meteor add-platform ios
meteor add-platform android
```

### iOS build issues
```bash
# Update Xcode and iOS simulator
# Check Apple Developer account status
# Verify APNs certificates in Firebase/OneSignal
```

### Android build issues
```bash
# Check Android SDK installation
# Verify google-services.json placement
# Check Firebase/OneSignal Android configuration
```

## 📋 Plugin Versions

### Recommended Versions (Latest Tested)
- **Firebase FCM**: `cordova-plugin-fcm-with-dependecy-updated@7.8.0`
- **OneSignal**: `onesignal-cordova-plugin@3.0.1`
- **Push Plugin**: `phonegap-plugin-push@2.3.0`

### Alternative Versions (If above fail)
- **Firebase FCM**: `cordova-plugin-fcm@2.1.2`
- **OneSignal**: `onesignal-cordova-plugin@2.11.0`
- **Push Plugin**: `phonegap-plugin-push@2.2.3`

## ✅ Success Checklist

- [ ] Plugin installed via `meteor add`
- [ ] Platforms added via `meteor add-platform`
- [ ] App builds without errors
- [ ] Device receives test notifications
- [ ] Notification tapping opens correct app screen
- [ ] Token registration works with server
- [ ] Analytics show delivery confirmation

Your mobile apps now have **complete native push notification support**! 🎉📱
