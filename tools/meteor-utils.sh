#!/bin/bash

# Meteor utilities for Carpool app
# Provides reusable Meteor-related functions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to update browserslist database
meteor_update_browserslist() {
    echo -e "${YELLOW}🔄 Updating browserslist database...${NC}"
    meteor npm install caniuse-lite --save --legacy-peer-deps
    npx update-browserslist-db@latest
}

# Function to build Meteor bundle
meteor_build_bundle() {
    local build_dir=${1:-"../build"}
    local architecture=${2:-"os.linux.x86_64"}

    echo -e "${YELLOW}🚀 Building Meteor bundle...${NC}"
    meteor build "$build_dir" --architecture "$architecture" --server-only
}

# Function to build iOS app
meteor_build_ios() {
    local build_dir=${1:-"../build"}
    local server_url=${2:-"https://carp.school"}

    echo -e "${YELLOW}📱 Building Meteor iOS app...${NC}"
    echo -e "${YELLOW}📁 Build directory: $build_dir${NC}"
    echo -e "${YELLOW}🌐 Server URL: $server_url${NC}"

    # Check if we're in the right directory
    if [ ! -f "app/.meteor/release" ]; then
        echo -e "${RED}❌ Not in Carpool root directory or app/.meteor/release not found${NC}"
        return 1
    fi

    # Check iOS prerequisites
    echo -e "${YELLOW}🔍 Checking iOS prerequisites...${NC}"

    # Check for Xcode
    if ! command -v xcodebuild &> /dev/null; then
        echo -e "${RED}❌ Xcode not found. Please install Xcode from the App Store.${NC}"
        return 1
    fi

    # Check for CocoaPods
    if ! command -v pod &> /dev/null; then
        echo -e "${RED}❌ CocoaPods not found. Installing via Homebrew...${NC}"
        if command -v brew &> /dev/null; then
            brew install cocoapods
        else
            echo -e "${RED}❌ Homebrew not found. Please install CocoaPods manually:${NC}"
            echo "sudo gem install cocoapods"
            return 1
        fi
    fi

    cd app
    echo -e "${YELLOW}🚀 Starting iOS build process...${NC}"
    meteor build "$build_dir" --platforms ios --server "$server_url" --mobile-settings "../config/settings.prod.json"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ iOS build completed successfully!${NC}"
        echo -e "${GREEN}📁 Build output available at: $build_dir${NC}"
    else
        echo -e "${RED}❌ iOS build failed${NC}"
        return 1
    fi
}

# Function to build Android app
meteor_build_android() {
    local build_dir=${1:-"../build"}
    local server_url=${2:-"https://carp.school"}

    echo -e "${YELLOW}🤖 Building Meteor Android app...${NC}"
    echo -e "${YELLOW}📁 Build directory: $build_dir${NC}"
    echo -e "${YELLOW}🌐 Server URL: $server_url${NC}"

    # Check if we're in the right directory
    if [ ! -f "app/.meteor/release" ]; then
        echo -e "${RED}❌ Not in Carpool root directory or app/.meteor/release not found${NC}"
        return 1
    fi

    # Check Android prerequisites
    echo -e "${YELLOW}🔍 Checking Android prerequisites...${NC}"

    # Check for Android SDK
    if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
        echo -e "${RED}❌ Android SDK not found. Please install Android Studio and set ANDROID_HOME.${NC}"
        echo -e "${YELLOW}💡 Instructions:${NC}"
        echo "1. Install Android Studio from https://developer.android.com/studio"
        echo "2. Set ANDROID_HOME in your shell profile (~/.zshrc or ~/.bash_profile):"
        echo "   export ANDROID_HOME=\$HOME/Library/Android/sdk"
        echo "   export PATH=\$PATH:\$ANDROID_HOME/emulator:\$ANDROID_HOME/tools:\$ANDROID_HOME/tools/bin:\$ANDROID_HOME/platform-tools"
        echo "3. Restart your terminal"
        return 1
    fi

    # Check for required tools
    if ! command -v avdmanager &> /dev/null; then
        echo -e "${RED}❌ avdmanager not found. Please ensure Android SDK command-line tools are installed.${NC}"
        echo -e "${YELLOW}💡 In Android Studio: SDK Manager > SDK Tools > Android SDK Command-line Tools${NC}"
        return 1
    fi

    # Clean Cordova build cache to prevent Gradle issues
    echo -e "${YELLOW}🧹 Cleaning Cordova build cache...${NC}"
    rm -rf app/.meteor/local/cordova-build

    cd app
    echo -e "${YELLOW}🚀 Starting Android build process...${NC}"
    meteor build "$build_dir" --platforms android --server "$server_url" --mobile-settings "../config/settings.prod.json"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Android build completed successfully!${NC}"
        echo -e "${GREEN}📁 Build output available at: $build_dir${NC}"
    else
        echo -e "${RED}❌ Android build failed${NC}"
        return 1
    fi
}

# Function to run development server
meteor_run_dev() {
    local settings_file=${1:-"../config/settings.development.json"}
    local port=${2:-"3001"}

    echo -e "${YELLOW}🚀 Starting Meteor development server...${NC}"
    cd app
    meteor --no-release-check --settings "$settings_file" --port "$port" --verbose
}

# Function to run iOS development server
meteor_run_ios() {
    local settings_file=${1:-"../config/settings.development.json"}
    local port=${2:-"3001"}

    echo -e "${YELLOW}📱 Starting Meteor iOS development server...${NC}"

    # Check if we're in the right directory
    if [ ! -f "app/.meteor/release" ]; then
        echo -e "${RED}❌ Not in Carpool root directory or app/.meteor/release not found${NC}"
        return 1
    fi

    # Check iOS prerequisites
    echo -e "${YELLOW}🔍 Checking iOS prerequisites...${NC}"

    # Check for Xcode
    if ! command -v xcodebuild &> /dev/null; then
        echo -e "${RED}❌ Xcode not found. Please install Xcode from the App Store.${NC}"
        return 1
    fi

    # Check for CocoaPods
    if ! command -v pod &> /dev/null; then
        echo -e "${RED}❌ CocoaPods not found. Installing via Homebrew...${NC}"
        if command -v brew &> /dev/null; then
            brew install cocoapods
        else
            echo -e "${RED}❌ Homebrew not found. Please install CocoaPods manually:${NC}"
            echo "sudo gem install cocoapods"
            return 1
        fi
    fi

    cd app
    meteor run ios --port "$port" --verbose --no-release-check --settings "$settings_file"
}

# Function to run Android development server
meteor_run_android() {
    local settings_file=${1:-"../config/settings.development.json"}
    local port=${2:-"3001"}

    echo -e "${YELLOW}🤖 Starting Meteor Android development server...${NC}"

    # Check if we're in the right directory
    if [ ! -f "app/.meteor/release" ]; then
        echo -e "${RED}❌ Not in Carpool root directory or app/.meteor/release not found${NC}"
        return 1
    fi

    # Check Android prerequisites
    echo -e "${YELLOW}🔍 Checking Android prerequisites...${NC}"

    # Check for Android SDK
    if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
        echo -e "${RED}❌ Android SDK not found. Please install Android Studio and set ANDROID_HOME.${NC}"
        echo -e "${YELLOW}💡 Instructions:${NC}"
        echo "1. Install Android Studio from https://developer.android.com/studio"
        echo "2. Set ANDROID_HOME in your shell profile (~/.zshrc or ~/.bash_profile):"
        echo "   export ANDROID_HOME=\$HOME/Library/Android/sdk"
        echo "   export PATH=\$PATH:\$ANDROID_HOME/emulator:\$ANDROID_HOME/tools:\$ANDROID_HOME/tools/bin:\$ANDROID_HOME/platform-tools"
        echo "3. Restart your terminal"
        return 1
    fi

    # Check for avdmanager
    if ! command -v avdmanager &> /dev/null; then
        echo -e "${RED}❌ avdmanager not found. Please ensure Android SDK command-line tools are installed.${NC}"
        echo -e "${YELLOW}💡 In Android Studio: SDK Manager > SDK Tools > Android SDK Command-line Tools${NC}"
        return 1
    fi

    # Clean Cordova build cache to prevent Gradle issues
    echo -e "${YELLOW}🧹 Cleaning Cordova build cache...${NC}"
    rm -rf app/.meteor/local/cordova-build

    cd app
    meteor run android --port "$port" --verbose --no-release-check --settings "$settings_file"
}

# Function to clean Meteor local directory
meteor_clean_local() {
    local app_dir=${1:-"app"}
    local clean_type=${2:-"db"}  # "db" or "all"

    case $clean_type in
        "db")
            echo -e "${YELLOW}🗑️  Removing Meteor local database...${NC}"
            rm -rf "$app_dir/.meteor/local/db"
            echo -e "${GREEN}   Removed $app_dir/.meteor/local/db${NC}"
            ;;
        "all")
            echo -e "${YELLOW}🗑️  Removing entire Meteor local directory...${NC}"
            rm -rf "$app_dir/.meteor/local"
            echo -e "${GREEN}   Removed $app_dir/.meteor/local${NC}"
            ;;
        *)
            echo -e "${RED}❌ Invalid clean type: $clean_type${NC}"
            echo "Valid types: 'db', 'all'"
            return 1
            ;;
    esac
}

# Function to clean Node.js dependencies
meteor_clean_dependencies() {
    local app_dir=${1:-"app"}

    echo -e "${YELLOW}🗑️  Removing Node.js dependencies...${NC}"
    rm -f "$app_dir/package-lock.json"
    rm -rf "$app_dir/node_modules"
    echo -e "${GREEN}   Removed package-lock.json and node_modules${NC}"
}

# Function to check and setup Android environment
meteor_setup_android() {
    echo -e "${YELLOW}🔍 Checking Android development environment...${NC}"

    # Check if Android Studio is installed
    if [ ! -d "/Applications/Android Studio.app" ] && [ ! -d "$HOME/Applications/Android Studio.app" ]; then
        echo -e "${RED}❌ Android Studio not found${NC}"
        echo -e "${YELLOW}💡 Please install Android Studio from: https://developer.android.com/studio${NC}"
        return 1
    fi

    # Check ANDROID_HOME
    if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
        echo -e "${RED}❌ ANDROID_HOME not set${NC}"
        echo -e "${YELLOW}💡 Add these lines to your ~/.zshrc:${NC}"
        echo "export ANDROID_HOME=\$HOME/Library/Android/sdk"
        echo "export PATH=\$PATH:\$ANDROID_HOME/emulator:\$ANDROID_HOME/tools:\$ANDROID_HOME/tools/bin:\$ANDROID_HOME/platform-tools"
        echo ""
        echo -e "${YELLOW}Then run: source ~/.zshrc${NC}"
        return 1
    fi

    # Check if SDK directory exists
    local sdk_path="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
    if [ ! -d "$sdk_path" ]; then
        echo -e "${RED}❌ Android SDK directory not found at: $sdk_path${NC}"
        return 1
    fi

    # Check for command-line tools
    if ! command -v avdmanager &> /dev/null; then
        echo -e "${RED}❌ Android SDK command-line tools not installed${NC}"
        echo -e "${YELLOW}💡 In Android Studio:${NC}"
        echo "1. Open SDK Manager (Tools > SDK Manager)"
        echo "2. Go to SDK Tools tab"
        echo "3. Check 'Android SDK Command-line Tools (latest)'"
        echo "4. Click Apply to install"
        return 1
    fi

    # Check for required Android platforms
    echo -e "${YELLOW}🔍 Checking required Android platforms...${NC}"

    # Check for Android API 34 (required by Meteor)
    if [ ! -d "$sdk_path/platforms/android-34" ]; then
        echo -e "${RED}❌ Android SDK Platform API 34 not installed${NC}"
        echo -e "${YELLOW}💡 Install using one of these methods:${NC}"
        echo ""
        echo -e "${YELLOW}Method 1 - Android Studio:${NC}"
        echo "1. Open SDK Manager (Tools > SDK Manager)"
        echo "2. Go to SDK Platforms tab"
        echo "3. Check 'Android 14 (API 34)'"
        echo "4. Click Apply to install"
        echo ""
        echo -e "${YELLOW}Method 2 - Command line:${NC}"
        echo "sdkmanager \"platforms;android-34\""
        echo ""
        return 1
    fi

    echo -e "${GREEN}✅ Android development environment is ready${NC}"
}

# Function to fix Gradle issues in Meteor Android builds
meteor_fix_gradle() {
    echo -e "${YELLOW}🔧 Fixing Gradle issues...${NC}"

    # Remove Cordova build cache
    echo -e "${YELLOW}🗑️  Removing Cordova build cache...${NC}"
    rm -rf app/.meteor/local/cordova-build

    # Remove Gradle cache
    echo -e "${YELLOW}🗑️  Removing Gradle cache...${NC}"
    rm -rf ~/.gradle/caches
    rm -rf ~/.gradle/wrapper

    # Clean Meteor local cache
    echo -e "${YELLOW}🗑️  Cleaning Meteor local cache...${NC}"
    rm -rf app/.meteor/local/build
    rm -rf app/.meteor/local/bundler-cache

    echo -e "${GREEN}✅ Gradle caches cleaned. Try running meteor run android again.${NC}"
}
