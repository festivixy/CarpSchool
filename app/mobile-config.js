// This section sets up some basic app metadata, the entire section is optional.
App.info({
    id: 'carp.school.app',
    name: 'carp.school',
    description: 'Get carp.school power in one button click',
    author: 'carp.school team',
    email: 'contact@carp.school',
    website: 'https://carp.school'
});

// Set up resources such as icons and launch screens.
App.icons({
    'app_store': 'resources/icons/app_store.png', // 1024x1024 pixels
    'iphone_2x': 'resources/icons/iphone_2x.png', // 120x120 pixels
    'iphone_3x': 'resources/icons/iphone_3x.png', // 180x180 pixels
    'ipad_2x': 'resources/icons/ipad_2x.png', // 152x152 pixels
    'ipad_pro': 'resources/icons/ipad_pro.png', // 167x167 pixels
    'ios_settings_2x': 'resources/icons/ios_settings_2x.png', // 58x58 pixels
    'ios_settings_3x': 'resources/icons/ios_settings_3x.png', // 87x87 pixels
    'ios_spotlight_2x': 'resources/icons/ios_spotlight_2x.png', // 80x80 pixels
    'ios_spotlight_3x': 'resources/icons/ios_spotlight_3x.png', // 120x120 pixels
    'ios_notification_2x': 'resources/icons/ios_notification_2x.png', // 40x40 pixels
    'ios_notification_3x': 'resources/icons/ios_notification_3x.png', // 60x60 pixels
    'ipad': 'resources/icons/ipad.png', // 76x76 pixels
    'ios_settings': 'resources/icons/ios_settings.png', // 29x29 pixels
    'ios_spotlight': 'resources/icons/ios_spotlight.png', // 40x40 pixels
    'ios_notification': 'resources/icons/ios_notification.png', // 20x20 pixels
    'iphone_legacy': 'resources/icons/iphone_legacy.png', // 57x57 pixels
    'iphone_legacy_2x': 'resources/icons/iphone_legacy_2x.png', // 114x114 pixels
    'ipad_spotlight_legacy': 'resources/icons/ipad_spotlight_legacy.png', // 50x50 pixels
    'ipad_spotlight_legacy_2x': 'resources/icons/ipad_spotlight_legacy_2x.png', // 100x100 pixels
    'ipad_app_legacy': 'resources/icons/ipad_app_legacy.png', // 72x72 pixels
    'ipad_app_legacy_2x': 'resources/icons/ipad_app_legacy_2x.png', // 144x144 pixels
    'android_mdpi': 'resources/icons/android_mdpi.png', // 48x48 pixels
    'android_hdpi': 'resources/icons/android_hdpi.png', // 72x72 pixels
    'android_xhdpi': 'resources/icons/android_xhdpi.png', // 96x96 pixels
    'android_xxhdpi': 'resources/icons/android_xxhdpi.png', // 144x144 pixels
    'android_xxxhdpi': 'resources/icons/android_xxxhdpi.png', // 192x192 pixels
});

// Before Meteor 2.6 we had to pass device specific splash screens for iOS, but this behavior was dropped in favor of story board images.
App.launchScreens({
    // iOS
    // For most cases you will only need to use the 'ios_universal' and 'ios_universal_3x'.
    'ios_universal': { src: 'resources/splash/ios_universal.png', srcDarkMode: 'resources/splash/ios_universal.png' }, // (2732x2732) - All @2x devices, if device/mode specific is not declared
    'ios_universal_3x': 'resources/splash/ios_universal_3x.png', // (2208x2208) - All @3x devices, if device/mode specific is not declared

    // Android
    'android_universal': 'resources/splash/android_universal.png', // (320x480)
});
