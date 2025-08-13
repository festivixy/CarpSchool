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
    meteor build "$build_dir" --architecture "$architecture" --server-only --verbose
}

meteor_install_cordova_plugins() {
    local pathpwd=$(pwd)
    if [ ! -f ".meteor/release" ]; then
        if [ -f "app/.meteor/release" ]; then
            cd app
        else
            echo -e "${RED}❌ Not in Carpool app directory or .meteor/release not found${NC}"
            return 1
        fi
    fi
    echo -e "${YELLOW}🔄 Installing Cordova plugins...${NC}"
    meteor add "cordova:cordova-plugin-native-navbar@file://$(pwd)/plugins/cordova-plugin-native-navbar"
    meteor add "cordova:cordova-plugin-transport-security@file://$(pwd)/plugins/cordova-plugin-transport-security"
    cd "$pathpwd"
}

xcode_copy_cordova_plugins() {
    # check if pbxproj is installed
    if ! command -v pbxproj &> /dev/null; then
        echo -e "${RED}❌ pbxproj not found. Please install it using pip:${NC}"
        echo "pip install pbxproj"
        return 1
    fi

    local pathpwd=$(pwd)

    # here, make sure that we are in app. (check if ./.meteor/release exists)
    # if not, check if ./app/.meteor/release exists. if yes, cd app
    if [ ! -f ".meteor/release" ]; then
        if [ -f "app/.meteor/release" ]; then
            cd app
        else
            echo -e "${RED}❌ Not in Carpool app directory or .meteor/release not found${NC}"
            return 1
        fi
    fi

    # cp plugins/cordova-plugin-native-navbar/src/ios/* ../build/ios/project/CarpSchool/Plugins/
    pbxproj file ../build/ios/project/CarpSchool.xcodeproj ../build/ios/project/CarpSchool/Plugins/cordova-plugin-native-navbar/NativeNavBar.swift
    pbxproj file ../build/ios/project/CarpSchool.xcodeproj ../build/ios/project/CarpSchool/Plugins/cordova-plugin-native-navbar/NativeNavBar.m
    pbxproj file ../build/ios/project/CarpSchool.xcodeproj ../build/ios/project/CarpSchool/Plugins/cordova-plugin-native-navbar/NativeNavBar.h
    cd "$pathpwd"
}

# Function to build iOS app
meteor_build_ios() {
    local pathpwd=$(pwd)
    meteor_clean_ios
    meteor_install_cordova_plugins
    local build_dir=${1:-"../build"}
    local server_url=${2:-"https://carp.school"}

    echo -e "${YELLOW}📱 Building Meteor iOS app...${NC}"
    echo -e "${YELLOW}📁 Build directory: $build_dir${NC}"
    echo -e "${YELLOW}🌐 Server URL: $server_url${NC}"

    # Check if we're in the right directory
    if [ ! -f "app/.meteor/release" ]; then
        if [ -f "./.meteor/release" ]; then
            cd ..
        else
            echo -e "${RED}❌ Not in Carpool root directory or app/.meteor/release not found${NC}"
            return 1
        fi
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
    meteor build "$build_dir" --platforms ios --server "$server_url" --mobile-settings "../config/settings.prod.json" --verbose

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ iOS build completed successfully!${NC}"
        echo -e "${GREEN}📁 Build output available at: $build_dir${NC}"

        # Copy Cordova plugin files to Xcode project
        echo -e "${YELLOW}🔌 Copying Cordova plugin files to Xcode project...${NC}"
        cd ..
        xcode_copy_cordova_plugins
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Plugin files copied and added to Xcode project!${NC}"
        else
            echo -e "${RED}❌ Failed to copy plugin files${NC}"
        fi
    else
        echo -e "${RED}❌ iOS build failed${NC}"
        return 1
    fi

    cd "$pathpwd"
}

# Function to build Android app
meteor_build_android() {
    meteor_install_cordova_plugins
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
    meteor_install_cordova_plugins
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
    meteor run ios --port "$port" --verbose --no-release-check --settings "$settings_file" --mobile-server "127.0.0.1:$port"
}

# Function to run Android development server
meteor_run_android() {
    meteor_install_cordova_plugins
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

meteor_clean_ios() {
    local pathpwd=$(pwd)
    # here, make sure that we are in app. (check if ./.meteor/release exists)
    # if not, check if ./app/.meteor/release exists. if yes, cd app
    if [ ! -f ".meteor/release" ]; then
        if [ -f "app/.meteor/release" ]; then
            cd app
        else
            echo -e "${RED}❌ Not in Carpool app directory or .meteor/release not found${NC}"
            return 1
        fi
    fi

    echo -e "${YELLOW}🔄 Resetting Meteor project...${NC}"
    meteor reset
    echo -e "${YELLOW}🗑️  Removing Meteor local directory...${NC}"
    rm -rf ./.meteor/local
    echo -e "${YELLOW}🗑️  Removing build directory...${NC}"
    rm -rf ../build
    echo -e "${YELLOW}📱 Removing iOS platform...${NC}"
    meteor remove-platform ios
    echo -e "${YELLOW}📱 Adding iOS platform...${NC}"
    meteor add-platform ios
    echo -e "${GREEN}✅ iOS cleanup completed!${NC}"

    cd "$pathpwd"
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


# Helper function to add common domains for CarpSchool app
ios_add_carpschool_domains() {
    echo -e "${YELLOW}🚗 Adding CarpSchool-specific ATS domains...${NC}"

    local plist_path="../build/ios/project/CarpSchool/CarpSchool-Info.plist"

    # Check if plist file exists
    if [ ! -f "$plist_path" ]; then
        echo -e "${RED}❌ Info.plist not found at: $plist_path${NC}"
        echo -e "${YELLOW}💡 Make sure to build the iOS app first using: meteor_build_ios${NC}"
        return 1
    fi

    echo -e "${YELLOW}🔧 Adding CarpSchool domains with specific ATS configurations...${NC}"

    # Create a backup
    local backup_path="${plist_path}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$plist_path" "$backup_path"
    echo -e "${GREEN}✅ Created backup: $backup_path${NC}"

    # Ensure NSAppTransportSecurity structure exists
    if ! plutil -extract "NSAppTransportSecurity" raw "$plist_path" &> /dev/null; then
        plutil -insert "NSAppTransportSecurity" -dictionary "$plist_path"
        echo -e "${GREEN}✅ Created NSAppTransportSecurity structure${NC}"
    fi

    # Ensure NSExceptionDomains exists
    if ! plutil -extract "NSAppTransportSecurity.NSExceptionDomains" raw "$plist_path" &> /dev/null; then
        plutil -insert "NSAppTransportSecurity.NSExceptionDomains" -dictionary "$plist_path"
        echo -e "${GREEN}✅ Created NSExceptionDomains structure${NC}"
    fi

    # Set NSAllowsArbitraryLoads to false for better security
    plutil -replace "NSAppTransportSecurity.NSAllowsArbitraryLoads" -bool false "$plist_path"
    echo -e "${GREEN}✅ Set NSAllowsArbitraryLoads to false${NC}"

    # Domain configurations from plugin.xml (using arrays for compatibility)
    local domains=(
        "carp.school"
        "tileserver.carp.school"
        "nominatim.carp.school"
        "osrm.carp.school"
        "codepush.carp.school"
        "localhost"
        "127.0.0.1"
        "dev.carp.school"
    )

    local configs=(
        "subdomains,insecure,tls=1.0,forward_secrecy=false"
        "tls=1.2,forward_secrecy=true"
        "tls=1.2,forward_secrecy=true"
        "tls=1.2,forward_secrecy=true"
        "tls=1.2,forward_secrecy=true"
        "insecure,tls=1.0,forward_secrecy=false"
        "insecure,tls=1.0,forward_secrecy=false"
        "insecure,tls=1.0,forward_secrecy=false"
    )

    # Process each domain with its specific configuration
    local total_domains=${#domains[@]}
    for ((i=0; i<total_domains; i++)); do
        local domain="${domains[$i]}"
        local config="${configs[$i]}"
        echo -e "${YELLOW}🌐 Configuring domain: $domain${NC}"

        # Create domain entry (always create fresh entry)
        plutil -insert "NSAppTransportSecurity.NSExceptionDomains.$domain" -dictionary "$plist_path" 2>/dev/null || \
        plutil -remove "NSAppTransportSecurity.NSExceptionDomains.$domain" "$plist_path" 2>/dev/null && \
        plutil -insert "NSAppTransportSecurity.NSExceptionDomains.$domain" -dictionary "$plist_path"

        # Parse and apply configuration
        if [[ "$config" == *"subdomains"* ]]; then
            plutil -insert "NSAppTransportSecurity.NSExceptionDomains.$domain.NSIncludesSubdomains" -bool true "$plist_path"
            echo -e "${GREEN}   ✓ NSIncludesSubdomains: true${NC}"
        fi

        if [[ "$config" == *"insecure"* ]]; then
            plutil -insert "NSAppTransportSecurity.NSExceptionDomains.$domain.NSExceptionAllowsInsecureHTTPLoads" -bool true "$plist_path"
            echo -e "${GREEN}   ✓ NSExceptionAllowsInsecureHTTPLoads: true${NC}"
        fi

        if [[ "$config" == *"tls="* ]]; then
            local tls_version=$(echo "$config" | grep -o 'tls=[^,]*' | cut -d'=' -f2)
            plutil -insert "NSAppTransportSecurity.NSExceptionDomains.$domain.NSExceptionMinimumTLSVersion" -string "TLSv$tls_version" "$plist_path"
            echo -e "${GREEN}   ✓ NSExceptionMinimumTLSVersion: TLSv$tls_version${NC}"
        fi

        if [[ "$config" == *"forward_secrecy="* ]]; then
            local forward_secrecy=$(echo "$config" | grep -o 'forward_secrecy=[^,]*' | cut -d'=' -f2)
            plutil -insert "NSAppTransportSecurity.NSExceptionDomains.$domain.NSExceptionRequiresForwardSecrecy" -bool "$forward_secrecy" "$plist_path"
            echo -e "${GREEN}   ✓ NSExceptionRequiresForwardSecrecy: $forward_secrecy${NC}"
        fi

        echo -e "${GREEN}   ✅ Domain $domain configured successfully${NC}"
    done

    # Validate the resulting plist
    if plutil -lint "$plist_path" &> /dev/null; then
        echo -e "${GREEN}✅ Info.plist updated successfully with ${#domains[@]} CarpSchool domain(s)${NC}"

        # Show the current ATS configuration
        echo -e "${YELLOW}📋 Current ATS Exception Domains:${NC}"
        plutil -extract "NSAppTransportSecurity.NSExceptionDomains" xml1 "$plist_path" | grep -E "<key>|<string>|<true/>|<false/>" | sed 's/^[[:space:]]*/  /'

        # Remove backup since operation was successful
        rm -f "$backup_path"
        echo -e "${GREEN}🗑️  Backup removed (operation successful)${NC}"
    else
        echo -e "${RED}❌ Failed to update Info.plist - restoring backup${NC}"
        cp "$backup_path" "$plist_path"
        return 1
    fi
}
