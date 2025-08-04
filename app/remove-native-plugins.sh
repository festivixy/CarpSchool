#!/bin/bash

# iOS 26 Native Plugins Removal Script
# Run this from the app directory to clean up plugins

set -e

echo "🧹 Removing iOS 26 Native Support Plugins..."

# Check if we're in the right directory
if [ ! -f "mobile-config.js" ]; then
    echo "❌ Error: mobile-config.js not found. Please run this script from the app directory."
    exit 1
fi

echo "🛠️ Removing cordova-plugin-floating-toolbar..."
meteor remove cordova:cordova-plugin-floating-toolbar || echo "Plugin not found, skipping..."

echo "🌀 Removing cordova-plugin-liquid-blur..."
meteor remove cordova:cordova-plugin-liquid-blur || echo "Plugin not found, skipping..."

echo "📦 Removing cordova-plugin-add-swift-support..."
meteor remove cordova:cordova-plugin-add-swift-support || echo "Plugin not found, skipping..."

echo "✅ All native plugins removed!"
echo ""
echo "📱 You can now run: meteor run ios to test without native features"
echo "🔄 To reinstall: ./install-native-plugins.sh"
