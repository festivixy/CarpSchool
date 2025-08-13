// This section sets up some basic app metadata, the entire section is optional.
App.info({
    id: "carp.school.app",
    name: "CarpSchool",
    description: "Get CarpSchool power in one button click",
    author: "carp.school team",
    email: "contact@carp.school",
    website: "https://carp.school",
});

// Set PhoneGap/Cordova preferences
App.setPreference("BackupWebStorage", "cloud");
App.setPreference("SplashScreen", "none");
App.setPreference("SplashScreenDelay", "0");
App.setPreference("AutoHideSplashScreen", "true");
App.setPreference("FadeSplashScreen", "false");
App.setPreference("FadeSplashScreenDuration", "0");
App.setPreference("ShowSplashScreenSpinner", "false");

// iOS specific preferences
App.setPreference("Orientation", "portrait", "ios");
App.setPreference("EnableViewportScale", "true", "ios");
App.setPreference("MediaPlaybackRequiresUserAction", "false", "ios");
App.setPreference("AllowInlineMediaPlaybook", "true", "ios");
App.setPreference("BackupWebStorage", "cloud", "ios");
App.setPreference("TopActivityIndicator", "gray", "ios");
App.setPreference("GapBetweenPages", "0", "ios");
App.setPreference("PageLength", "0", "ios");
App.setPreference("PaginationBreakingMode", "page", "ios");
App.setPreference("PaginationMode", "unpaginated", "ios");

// Set iOS deployment target to support iOS 13+ features (systemBackground, etc.)
App.setPreference("deployment-target", "15.0", "ios");

// iOS 26 Liquid Glass specific preferences
App.setPreference("StatusBarOverlaysWebView", "true", "ios");
App.setPreference("WKWebViewOnly", "true", "ios");
App.setPreference("StatusBarBackgroundColor", "transparent", "ios");
App.setPreference("WKWebViewDecelerationRate", "normal", "ios");
App.setPreference("DisallowOverscroll", "false", "ios");
App.setPreference("EnableViewportScale", "true", "ios");
App.setPreference("KeyboardDisplayRequiresUserAction", "false", "ios");
App.setPreference("SuppressesIncrementalRendering", "false", "ios");

// Android specific preferences
App.setPreference("android-minSdkVersion", "21");
App.setPreference("android-targetSdkVersion", "35");
App.setPreference("android-installLocation", "auto");

// Android signing preferences for release builds
App.setPreference("android-signed", "true");
App.setPreference("android-versionCode", "1");

// CodePush configuration
App.setPreference("CodePushDeploymentKey", ""); // Will be set during build
App.setPreference("CodePushServerURL", "https://codepush.carp.school"); // Your self-hosted server
App.setPreference("CodePushPublicKeyURL", "https://codepush.carp.school/updateCheck");
App.setPreference("AutoHideSplashScreen", "true", "android");
App.setPreference("SplashMaintainAspectRatio", "true", "android");

// Access origins for external resources
App.accessRule("*");
App.accessRule("https://carp.school/*");
App.accessRule("https://*.carp.school/*");

// iOS App Transport Security (ATS) - Individual domain preferences
// Note: Meteor/Cordova has limited support for complex ATS configurations
// Using individual preferences for better compatibility

// Allow arbitrary loads globally (for development/testing)
App.setPreference("NSAppTransportSecurity", `
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>carp.school</key>
    <dict>
      <key>NSIncludesSubdomains</key>
      <true/>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <true/>
    </dict>
    <key>tileserver.carp.school</key>
    <dict>
      <key>NSExceptionMinimumTLSVersion</key>
      <string>TLSv1.2</string>
    </dict>
    <key>nominatim.carp.school</key>
    <dict>
      <key>NSExceptionMinimumTLSVersion</key>
      <string>TLSv1.2</string>
    </dict>
    <key>osrm.carp.school</key>
    <dict>
      <key>NSExceptionMinimumTLSVersion</key>
      <string>TLSv1.2</string>
    </dict>
    <key>codepush.carp.school</key>
    <dict>
      <key>NSExceptionMinimumTLSVersion</key>
      <string>TLSv1.2</string>
    </dict>
    <key>localhost</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <true/>
    </dict>
    <key>127.0.0.1</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <true/>
    </dict>
    <key>dev.carp.school</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <true/>
    </dict>
  </dict>
</dict>
`, "ios");

// Set up resources such as icons and launch screens.
App.icons({
    app_store: "resources/icons/app_store.png", // 1024x1024 pixels
    iphone_2x: "resources/icons/iphone_2x.png", // 120x120 pixels
    iphone_3x: "resources/icons/iphone_3x.png", // 180x180 pixels
    ipad_2x: "resources/icons/ipad_2x.png", // 152x152 pixels
    ipad_pro: "resources/icons/ipad_pro.png", // 167x167 pixels
    ios_settings_2x: "resources/icons/ios_settings_2x.png", // 58x58 pixels
    ios_settings_3x: "resources/icons/ios_settings_3x.png", // 87x87 pixels
    ios_spotlight_2x: "resources/icons/ios_spotlight_2x.png", // 80x80 pixels
    ios_spotlight_3x: "resources/icons/ios_spotlight_3x.png", // 120x120 pixels
    ios_notification_2x: "resources/icons/ios_notification_2x.png", // 40x40 pixels
    ios_notification_3x: "resources/icons/ios_notification_3x.png", // 60x60 pixels
    ipad: "resources/icons/ipad.png", // 76x76 pixels
    ios_settings: "resources/icons/ios_settings.png", // 29x29 pixels
    ios_spotlight: "resources/icons/ios_spotlight.png", // 40x40 pixels
    ios_notification: "resources/icons/ios_notification.png", // 20x20 pixels
    iphone_legacy: "resources/icons/iphone_legacy.png", // 57x57 pixels
    iphone_legacy_2x: "resources/icons/iphone_legacy_2x.png", // 114x114 pixels
    ipad_spotlight_legacy: "resources/icons/ipad_spotlight_legacy.png", // 50x50 pixels
    ipad_spotlight_legacy_2x: "resources/icons/ipad_spotlight_legacy_2x.png", // 100x100 pixels
    ipad_app_legacy: "resources/icons/ipad_app_legacy.png", // 72x72 pixels
    ipad_app_legacy_2x: "resources/icons/ipad_app_legacy_2x.png", // 144x144 pixels
    android_mdpi: "resources/icons/android_mdpi.png", // 48x48 pixels
    android_hdpi: "resources/icons/android_hdpi.png", // 72x72 pixels
    android_xhdpi: "resources/icons/android_xhdpi.png", // 96x96 pixels
    android_xxhdpi: "resources/icons/android_xxhdpi.png", // 144x144 pixels
    android_xxxhdpi: "resources/icons/android_xxxhdpi.png", // 192x192 pixels
});

// Splash screen disabled - no launch screens configured
