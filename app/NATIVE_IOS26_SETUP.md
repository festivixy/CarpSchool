# iOS 26 Native Support Setup Guide

This guide covers setting up and testing the native iOS 26 Liquid Glass features in the Carp.School Meteor app.

## 📋 Prerequisites

### Required Software
- **macOS** with Xcode 15+ (for iOS 26 support)
- **Meteor** (already installed in project)
- **iOS Simulator** or physical iOS device (iOS 13+)
- **Valid Apple Developer Account** (for device testing)

### Platform Setup
The iOS platform is already configured in this project. If you need to reinstall:

```bash
meteor remove-platform ios
meteor add-platform ios
```

## 🔧 Installation Steps

### 1. Install Plugin Dependencies

The plugins are included in the project but need Swift support:

```bash
# Add Swift support plugin (if not already installed)
meteor add cordova:cordova-plugin-add-swift-support@2.0.2
```

### 2. Install Local Plugins

#### Option A: Use Installation Script (Recommended)

Run the provided installation script from the app directory:

```bash
./install-native-plugins.sh
```

#### Option B: Manual Installation

The native plugins are included in the `plugins/` directory. Install them using absolute paths:

```bash
# Add Swift support (required)
meteor add cordova:cordova-plugin-add-swift-support@2.0.2

# Get current directory
CURRENT_DIR=$(pwd)

# Install liquid blur plugin
meteor add cordova:cordova-plugin-liquid-blur@file://$CURRENT_DIR/plugins/cordova-plugin-liquid-blur

# Install floating toolbar plugin
meteor add cordova:cordova-plugin-floating-toolbar@file://$CURRENT_DIR/plugins/cordova-plugin-floating-toolbar
```

### 3. Configure Build Settings

The `mobile-config.js` is already configured with iOS 26 specific settings:

- Transparent WebView support
- Status bar overlay configuration
- WKWebView optimization settings

### 4. Build and Test

Build for iOS simulator:

```bash
meteor run ios --settings ../config/settings.development.json
```

Build for iOS device:

```bash
meteor run ios-device --settings ../config/settings.development.json --mobile-server=http://YOUR_LOCAL_IP:3000
```

## 🧪 Testing the Implementation

### Demo Page Access

1. **Build and run the app** on iOS simulator or device
2. **Sign in as an admin** user
3. **Navigate to**: `/_test/native-blur`
4. **Test features**:
   - Blur style switching
   - Intensity adjustment
   - Toolbar visibility toggle
   - Native vs CSS fallback

### Manual Testing Checklist

- [ ] **Native blur detection** - Check status indicator
- [ ] **Blur style switching** - Try different system materials
- [ ] **Intensity adjustment** - Verify smooth transitions
- [ ] **Floating toolbar** - Test button interactions
- [ ] **Auto-fallback** - Test on non-iOS platforms
- [ ] **Performance** - Verify smooth scrolling with blur

### Expected Behavior

#### On iOS Devices (iOS 13+)
- ✅ Status shows "Native Blur: ✅ Supported"
- ✅ Status shows "Native Toolbar: ✅ Supported"
- ✅ Blur effects use native UIVisualEffectView
- ✅ Toolbars float with true system blur
- ✅ Smooth 60fps performance

#### On Non-iOS Platforms
- ℹ️ Status shows "Native Blur: ❌ CSS Fallback"
- ℹ️ Status shows "Native Toolbar: ❌ CSS Fallback"
- ✅ CSS backdrop-filter used for blur
- ✅ Styled components used for toolbar
- ✅ Same visual appearance and functionality

## 🛠️ Development Workflow

### Making Plugin Changes

When modifying plugin code:

1. **Remove existing plugin**:
   ```bash
   meteor remove cordova:cordova-plugin-liquid-blur
   ```

2. **Make your changes** to files in `plugins/cordova-plugin-liquid-blur/`

3. **Reinstall plugin**:
   ```bash
   CURRENT_DIR=$(pwd)
   meteor add cordova:cordova-plugin-liquid-blur@file://$CURRENT_DIR/plugins/cordova-plugin-liquid-blur
   ```

4. **Rebuild platform**:
   ```bash
   meteor run ios
   ```

### Debugging Native Code

1. **Enable Xcode debugging**:
   ```bash
   meteor run ios-device --verbose
   ```

2. **Open project in Xcode**:
   - Navigate to `.meteor/local/cordova-build/platforms/ios/`
   - Open `carp.school.xcworkspace`

3. **Set breakpoints** in plugin Objective-C/Swift code

4. **Use Safari Web Inspector** for JavaScript debugging:
   - Connect iOS device
   - Open Safari > Develop > [Device] > [App]

### Testing on Different iOS Versions

- **iOS 13-15**: Basic system blur materials
- **iOS 16+**: Enhanced Liquid Glass effects
- **iOS 26**: Full feature support with latest materials

## 📱 Component Integration

### Using Native Blur in Components

```javascript
import LiquidGlassBlur from '../liquidGlass/components/LiquidGlassBlur';

const MyComponent = () => (
  <LiquidGlassBlur
    blurStyle="systemMaterial"
    intensity={1.0}
    floating={true}
    onBlurReady={({ blurId, useNative }) => {
      console.log('Blur ready:', useNative ? 'Native' : 'CSS');
    }}
  >
    <div>Content over blur</div>
  </LiquidGlassBlur>
);
```

### Using Floating Toolbar

```javascript
import LiquidGlassToolbar from '../liquidGlass/components/LiquidGlassToolbar';

const MyPage = () => {
  const toolbarItems = [
    { type: 'button', icon: '🏠', title: 'Home', action: 'home' },
    { type: 'flexibleSpace' },
    { type: 'button', icon: '⚙️', title: 'Settings', action: 'settings' }
  ];

  return (
    <div>
      <div>Page content</div>
      <LiquidGlassToolbar
        items={toolbarItems}
        position="bottom"
        floating={true}
        onItemPress={(item, index) => console.log('Pressed:', item)}
      />
    </div>
  );
};
```

### Using React Hooks

```javascript
import { useNativeBlur, useFloatingToolbar } from '../hooks/useNativeBlur';

const MyComponent = () => {
  const {
    isSupported,
    createBlurView,
    removeBlurView
  } = useNativeBlur();

  const {
    isSupported: toolbarSupported,
    createToolbar
  } = useFloatingToolbar();

  // Use hooks for programmatic control
};
```

## 🚨 Troubleshooting

### Common Issues

#### Plugin Not Found
```bash
Error: Cannot find plugin cordova-plugin-liquid-blur
```
**Solution**: Ensure plugins are installed with correct path syntax:
```bash
CURRENT_DIR=$(pwd)
meteor add cordova:cordova-plugin-liquid-blur@file://$CURRENT_DIR/plugins/cordova-plugin-liquid-blur
```

#### Swift Compilation Errors
```bash
Error: Swift compilation failed
```
**Solution**: Install Swift support plugin:
```bash
meteor add cordova:cordova-plugin-add-swift-support@2.0.2
```

#### WebView Not Transparent
Native blur not visible behind content.

**Solution**: Verify mobile-config.js settings:
- `StatusBarOverlaysWebView: true`
- `WKWebViewOnly: true`

#### Performance Issues
Blur effects causing frame drops.

**Solution**:
- Reduce blur intensity for older devices
- Use CSS fallback on low-memory devices
- Limit number of simultaneous blur views

### Debug Commands

```bash
# Check plugin installation
meteor list --tree

# Verbose iOS build
meteor run ios --verbose

# Check native logs
meteor run ios-device --verbose | grep -i blur

# Reset Cordova build
rm -rf .meteor/local/cordova-build
meteor run ios
```

## 📊 Performance Monitoring

### Key Metrics
- **Frame rate**: Should maintain 60fps during scroll
- **Memory usage**: Native blur views should cleanup properly
- **Battery impact**: Minimal additional drain
- **Launch time**: No significant increase

### Monitoring Tools
- Xcode Instruments (for native performance)
- Safari Web Inspector (for JavaScript performance)
- React DevTools (for component performance)

## 🎯 Next Steps

1. **Test thoroughly** on various iOS devices and versions
2. **Integrate components** into existing LiquidGlass components
3. **Optimize performance** for older devices
4. **Add unit tests** for plugin functionality
5. **Create TypeScript definitions** for better development experience

## 📚 References

- [iOS Human Interface Guidelines - Blur Effects](https://developer.apple.com/design/human-interface-guidelines/components/presentation/blur-effects/)
- [UIVisualEffectView Documentation](https://developer.apple.com/documentation/uikit/uivisualeffectview)
- [Cordova Plugin Development](https://cordova.apache.org/docs/en/latest/guide/hybrid/plugins/)
- [Meteor Mobile Guide](https://guide.meteor.com/mobile.html)

---

**Status**: ✅ Phase 1-5 Complete
**Last Updated**: Implementation commit 4af21d4
**Next Phase**: Performance optimization and component integration
