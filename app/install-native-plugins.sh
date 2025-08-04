#!/bin/bash

# iOS 26 Native Plugins Installation Script
# Run this from the app directory

set -e

echo "🚀 Installing iOS 26 Native Support Plugins..."

# Get the current directory
CURRENT_DIR=$(pwd)

echo "📍 Current directory: $CURRENT_DIR"

# Check if we're in the right directory
if [ ! -f "mobile-config.js" ]; then
    echo "❌ Error: mobile-config.js not found. Please run this script from the app directory."
    exit 1
fi

# Check if plugins directory exists
if [ ! -d "plugins" ]; then
    echo "❌ Error: plugins directory not found. Please ensure the plugins are in ./plugins/"
    exit 1
fi

# Check if plugin files exist
if [ ! -f "plugins/cordova-plugin-liquid-blur/package.json" ]; then
    echo "❌ Error: cordova-plugin-liquid-blur/package.json not found."
    exit 1
fi

if [ ! -f "plugins/cordova-plugin-floating-toolbar/package.json" ]; then
    echo "❌ Error: cordova-plugin-floating-toolbar/package.json not found."
    exit 1
fi

echo "📦 Installing cordova-plugin-add-swift-support..."
if meteor add cordova:cordova-plugin-add-swift-support@2.0.2; then
    echo "✅ Swift support plugin installed"
else
    echo "❌ Failed to install Swift support plugin"
    exit 1
fi

echo "🌀 Installing cordova-plugin-liquid-blur..."
if meteor add cordova:cordova-plugin-liquid-blur@file://$CURRENT_DIR/plugins/cordova-plugin-liquid-blur; then
    echo "✅ Liquid blur plugin installed"
else
    echo "❌ Failed to install liquid blur plugin"
    exit 1
fi

echo "🛠️ Installing cordova-plugin-floating-toolbar..."
if meteor add cordova:cordova-plugin-floating-toolbar@file://$CURRENT_DIR/plugins/cordova-plugin-floating-toolbar; then
    echo "✅ Floating toolbar plugin installed"
else
    echo "❌ Failed to install floating toolbar plugin"
    exit 1
fi

echo "✅ All plugins installed successfully!"
echo ""
echo "📱 Next steps:"
echo "1. Run: meteor run ios --settings ../config/settings.development.json"
echo "2. Navigate to /_test/native-blur to test the implementation"
echo ""
echo "📚 See NATIVE_IOS26_SETUP.md for detailed testing instructions"
