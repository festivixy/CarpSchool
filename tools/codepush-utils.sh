#!/bin/bash

# CodePush utilities for Meteor Cordova builds
# Provides functions for CodePush integration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default CodePush server configuration
DEFAULT_CODEPUSH_SERVER="https://codepush.carp.school"

# Function to configure deployment keys for different environments
codepush_set_deployment_key() {
    local platform="$1"
    local environment="$2"
    local deployment_key="$3"

    if [ -z "$platform" ] || [ -z "$environment" ] || [ -z "$deployment_key" ]; then
        echo -e "${RED}❌ Usage: codepush_set_deployment_key <platform> <environment> <deployment_key>${NC}"
        return 1
    fi

    echo -e "${BLUE}🔑 Setting CodePush deployment key for ${platform} ${environment}${NC}"

    # Update mobile-config.js with the deployment key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/App.setPreference(\"CodePushDeploymentKey\", \".*\");/App.setPreference(\"CodePushDeploymentKey\", \"$deployment_key\");/" mobile-config.js
    else
        # Linux
        sed -i "s/App.setPreference(\"CodePushDeploymentKey\", \".*\");/App.setPreference(\"CodePushDeploymentKey\", \"$deployment_key\");/" mobile-config.js
    fi

    echo -e "${GREEN}✅ Deployment key configured${NC}"
}

# Function to build Meteor app for CodePush
codepush_build_meteor() {
    local platform="$1"
    local build_dir="$2"
    local server_url="$3"

    if [ -z "$platform" ] || [ -z "$build_dir" ]; then
        echo -e "${RED}❌ Usage: codepush_build_meteor <platform> <build_dir> [server_url]${NC}"
        return 1
    fi

    echo -e "${BLUE}📦 Building Meteor app for CodePush ($platform)${NC}"

    # Set server URL for mobile build
    local mobile_server="${server_url:-https://carp.school}"

    # Build the Cordova app
    if [ "$platform" = "ios" ]; then
        meteor build "$build_dir" --server="$mobile_server"
    elif [ "$platform" = "android" ]; then
        meteor build "$build_dir" --server="$mobile_server"
    else
        echo -e "${RED}❌ Unsupported platform: $platform${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Meteor build completed${NC}"
}

# Function to extract www folder for CodePush
codepush_extract_www() {
    local platform="$1"
    local build_dir="$2"
    local output_dir="$3"

    if [ -z "$platform" ] || [ -z "$build_dir" ] || [ -z "$output_dir" ]; then
        echo -e "${RED}❌ Usage: codepush_extract_www <platform> <build_dir> <output_dir>${NC}"
        return 1
    fi

    echo -e "${BLUE}📁 Extracting www folder for CodePush${NC}"

    # Find the www folder in the build output
    local www_source=""
    if [ "$platform" = "ios" ]; then
        www_source="$build_dir/ios/project/www"
    elif [ "$platform" = "android" ]; then
        www_source="$build_dir/android/project/app/src/main/assets/www"
    fi

    if [ ! -d "$www_source" ]; then
        echo -e "${RED}❌ www folder not found at: $www_source${NC}"
        return 1
    fi

    # Create output directory
    mkdir -p "$output_dir"

    # Copy www contents
    cp -r "$www_source"/* "$output_dir/"

    echo -e "${GREEN}✅ www folder extracted to: $output_dir${NC}"
}

# Function to configure CodePush CLI for custom server
codepush_configure_cli() {
    local server_url="${1:-$DEFAULT_CODEPUSH_SERVER}"

    echo -e "${BLUE}🔧 Configuring CodePush CLI for server: $server_url${NC}"

    # Set the server URL for CodePush CLI
    export CODE_PUSH_SERVER_URL="$server_url"

    # Check if logged in
    if ! code-push whoami &>/dev/null; then
        echo -e "${YELLOW}⚠️  Not logged in to CodePush server${NC}"
        echo -e "${YELLOW}💡 Please run: code-push login $server_url${NC}"
        echo -e "${YELLOW}💡 Use credentials - Username: admin, Password: 123456${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ CLI configured and authenticated${NC}"
}

# Function to release update to CodePush server
codepush_release_update() {
    local app_name="$1"
    local platform="$2"
    local www_dir="$3"
    local deployment="$4"
    local description="$5"
    local server_url="$6"

    if [ -z "$app_name" ] || [ -z "$platform" ] || [ -z "$www_dir" ] || [ -z "$deployment" ]; then
        echo -e "${RED}❌ Usage: codepush_release_update <app_name> <platform> <www_dir> <deployment> [description] [server_url]${NC}"
        return 1
    fi

    local codepush_server="${server_url:-$DEFAULT_CODEPUSH_SERVER}"
    local update_description="${description:-Meteor app update}"

    echo -e "${BLUE}🚀 Releasing update to CodePush server${NC}"
    echo -e "${YELLOW}📱 App: $app_name${NC}"
    echo -e "${YELLOW}🔧 Platform: $platform${NC}"
    echo -e "${YELLOW}📁 Source: $www_dir${NC}"
    echo -e "${YELLOW}🎯 Deployment: $deployment${NC}"
    echo -e "${YELLOW}🌐 Server: $codepush_server${NC}"

    # Configure CLI for custom server
    codepush_configure_cli "$codepush_server" || return 1

    # Use code-push CLI to release the update for Cordova apps
    code-push release-cordova "$app_name" "$platform" \
        --deploymentName "$deployment" \
        --description "$update_description" \
        --mandatory false \
        --targetBinaryVersion "*"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Update released successfully${NC}"
        echo -e "${YELLOW}📊 Check deployment status: code-push deployment history $app_name $deployment${NC}"
    else
        echo -e "${RED}❌ Failed to release update${NC}"
        return 1
    fi
}

# Function to build and release in one command
codepush_build_and_release() {
    local platform="$1"
    local app_name="$2"
    local deployment="$3"
    local build_dir="$4"
    local server_url="$5"
    local deployment_key="$6"
    local description="$7"

    if [ -z "$platform" ] || [ -z "$app_name" ] || [ -z "$deployment" ] || [ -z "$build_dir" ]; then
        echo -e "${RED}❌ Usage: codepush_build_and_release <platform> <app_name> <deployment> <build_dir> [server_url] [deployment_key] [description]${NC}"
        return 1
    fi

    local codepush_server="${server_url:-$DEFAULT_CODEPUSH_SERVER}"
    local update_description="${description:-Meteor app update from build script}"

    echo -e "${BLUE}🔄 Building and releasing Meteor app for CodePush${NC}"
    echo -e "${YELLOW}📱 App: $app_name${NC}"
    echo -e "${YELLOW}🔧 Platform: $platform${NC}"
    echo -e "${YELLOW}🎯 Deployment: $deployment${NC}"
    echo -e "${YELLOW}🌐 Server: $codepush_server${NC}"

    # Set deployment key if provided
    if [ -n "$deployment_key" ]; then
        codepush_set_deployment_key "$platform" "$deployment" "$deployment_key"
    fi

    # Configure CLI for custom server
    codepush_configure_cli "$codepush_server" || return 1

    # Release to CodePush (this will build automatically)
    code-push release-cordova "$app_name" "$platform" \
        --deploymentName "$deployment" \
        --description "$update_description" \
        --mandatory false \
        --targetBinaryVersion "*"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build and release completed successfully${NC}"
        echo -e "${YELLOW}📊 Check deployment status: code-push deployment history $app_name $deployment${NC}"
        echo -e "${YELLOW}🎯 Admin panel: $codepush_server:40065${NC}"
    else
        echo -e "${RED}❌ Failed to build and release${NC}"
        return 1
    fi
}

# Function to show CodePush status
codepush_show_status() {
    echo -e "${BLUE}📊 CodePush Configuration Status${NC}"
    echo ""

    # Check if CodePush plugin is installed
    if grep -q "cordova-plugin-code-push" .meteor/cordova-plugins 2>/dev/null; then
        echo -e "${GREEN}✅ CodePush plugin installed${NC}"
    else
        echo -e "${RED}❌ CodePush plugin not installed${NC}"
        echo -e "${YELLOW}💡 Run: meteor add cordova:cordova-plugin-code-push${NC}"
    fi

    # Check mobile-config.js configuration
    if [ -f "mobile-config.js" ] && grep -q "CodePushDeploymentKey" mobile-config.js; then
        echo -e "${GREEN}✅ CodePush configured in mobile-config.js${NC}"
        local deployment_key=$(grep "CodePushDeploymentKey" mobile-config.js | sed 's/.*"\(.*\)".*/\1/')
        if [ -z "$deployment_key" ]; then
            echo -e "${YELLOW}⚠️  Deployment key is empty${NC}"
        else
            echo -e "${GREEN}🔑 Deployment key: $deployment_key${NC}"
        fi

        # Check server URL configuration
        if grep -q "CodePushServerURL" mobile-config.js; then
            local server_url=$(grep "CodePushServerURL" mobile-config.js | sed 's/.*"\(.*\)".*/\1/')
            echo -e "${GREEN}🌐 Server URL: $server_url${NC}"
        fi
    else
        echo -e "${RED}❌ CodePush not configured in mobile-config.js${NC}"
        echo -e "${YELLOW}💡 Add CodePush configuration to mobile-config.js${NC}"
    fi

    # Check if code-push CLI is installed
    if command -v code-push &> /dev/null; then
        echo -e "${GREEN}✅ CodePush CLI installed${NC}"
        local cli_version=$(code-push --version 2>/dev/null || echo "unknown")
        echo -e "${GREEN}📦 CLI Version: $cli_version${NC}"

        # Check if logged in
        if code-push whoami &>/dev/null; then
            local whoami_output=$(code-push whoami 2>/dev/null)
            echo -e "${GREEN}✅ Logged in as: $whoami_output${NC}"

            # Try to list apps
            echo ""
            echo -e "${BLUE}📱 Available Apps:${NC}"
            if code-push app list &>/dev/null; then
                code-push app list
            else
                echo -e "${YELLOW}⚠️  Unable to list apps (check server connection)${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Not logged in to CodePush server${NC}"
            echo -e "${YELLOW}💡 Run: code-push login $DEFAULT_CODEPUSH_SERVER${NC}"
            echo -e "${YELLOW}💡 Use credentials - Username: admin, Password: 123456${NC}"
        fi
    else
        echo -e "${RED}❌ CodePush CLI not installed${NC}"
        echo -e "${YELLOW}💡 Run: npm install -g code-push-cli${NC}"
    fi

    echo ""
    echo -e "${BLUE}🎯 Quick Commands:${NC}"
    echo -e "${YELLOW}📱 iOS release: ./build-app.sh codepush-ios${NC}"
    echo -e "${YELLOW}🤖 Android release: ./build-app.sh codepush-android${NC}"
    echo -e "${YELLOW}🌐 Admin panel: $DEFAULT_CODEPUSH_SERVER:40065${NC}"
    echo ""
}
