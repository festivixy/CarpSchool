#!/bin/bash

# Build script for Carpool app
# Provides unified interface for building different platform targets
#
# Usage: ./build.sh [command] [options]
# Commands:
#   server  - Build the server bundle only
#   ios     - Build the iOS mobile app
#   android - Build the Android mobile app
#   all     - Build all platforms (server, iOS, and Android)
#
# Options:
#   --build-dir [path]    - Specify custom build directory (default: ../build)
#   --server-url [url]    - Specify server URL for mobile builds (default: https://carp.school)
#
# Environment Variables:
#   READ_TIMEOUT           - Input timeout in seconds (default: 10s)
#   CARPOOL_NONINTERACTIVE - Set to '1' for non-interactive mode
#
# Examples:
#   ./build.sh server                                    # Build server bundle
#   ./build.sh ios --server-url https://staging.carp.school  # Build iOS with custom server
#   ./build.sh android --build-dir ../dist              # Build Android with custom directory
#   ./build.sh all --build-dir ../production            # Build all platforms
#   CARPOOL_NONINTERACTIVE=1 ./build.sh server          # Non-interactive server build

set -e  # Exit on any error

# Source utility modules
source "./tools/meteor-utils.sh"
source "./tools/ui-utils.sh"
source "./tools/codepush-utils.sh"

# Default values
DEFAULT_BUILD_DIR="../build"
DEFAULT_SERVER_URL="https://carp.school"

# Function to display usage
show_usage() {
    local commands="  ${GREEN}server${NC}  - Build the server bundle only
  ${GREEN}ios${NC}     - Build the iOS mobile app
  ${GREEN}android${NC} - Build the Android mobile app
  ${GREEN}all${NC}     - Build all platforms (server, iOS, and Android)
  ${GREEN}codepush-ios${NC} - Build and release iOS update to CodePush
  ${GREEN}codepush-android${NC} - Build and release Android update to CodePush
  ${GREEN}codepush-status${NC} - Show CodePush configuration status"

Options:
  ${YELLOW}--build-dir [path]${NC}    - Specify custom build directory (default: ../build)
  ${YELLOW}--server-url [url]${NC}    - Specify server URL for mobile builds (default: https://carp.school)

Examples:
  ./build.sh server
  ./build.sh ios --server-url https://staging.carp.school
  ./build.sh android --build-dir ../dist
  ./build.sh all --build-dir ../production"

    ui_show_usage "build.sh" "$commands"
}

# Parse command line arguments
COMMAND=""
BUILD_DIR="$DEFAULT_BUILD_DIR"
SERVER_URL="$DEFAULT_SERVER_URL"

while [[ $# -gt 0 ]]; do
    case $1 in
        server|ios|android|all|codepush-ios|codepush-android|codepush-status)
            if [ -z "$COMMAND" ]; then
                COMMAND="$1"
            else
                ui_error_exit "Multiple commands specified. Please provide only one command." 1
            fi
            shift
            ;;
        --build-dir)
            if [ -n "$2" ]; then
                BUILD_DIR="$2"
                shift 2
            else
                ui_error_exit "--build-dir requires a path argument" 1
            fi
            ;;
        --server-url)
            if [ -n "$2" ]; then
                SERVER_URL="$2"
                shift 2
            else
                ui_error_exit "--server-url requires a URL argument" 1
            fi
            ;;
        help|-h|--help)
            show_usage
            exit 0
            ;;
        *)
            ui_error_exit "Unknown option or command: $1" 1
            ;;
    esac
done

# If no command provided, show usage
if [ -z "$COMMAND" ]; then
    echo -e "${RED}❌ No command specified${NC}"
    echo ""
    show_usage
    exit 1
fi

# Display build configuration
echo -e "${BLUE}🔨 Build Configuration${NC}"
echo -e "${YELLOW}📁 Build directory: $BUILD_DIR${NC}"
echo -e "${YELLOW}🌐 Server URL: $SERVER_URL${NC}"
echo -e "${YELLOW}🎯 Target: $COMMAND${NC}"
echo ""

# Execute the appropriate build command
case $COMMAND in
    "server")
        echo -e "${YELLOW}🚀 Building server bundle...${NC}"
        meteor_build_bundle "$BUILD_DIR" "os.linux.x86_64"
        ui_show_completion "Server build" "Bundle available at: $BUILD_DIR"
        ;;
    "ios")
        echo -e "${YELLOW}📱 Building iOS application...${NC}"
        meteor_build_ios "$BUILD_DIR" "$SERVER_URL"
        ui_show_completion "iOS build" "App available at: $BUILD_DIR/ios"
        ;;
    "android")
        echo -e "${YELLOW}🤖 Building Android application...${NC}"
        meteor_build_android "$BUILD_DIR" "$SERVER_URL"
        ui_show_completion "Android build" "APK available at: $BUILD_DIR/android"
        ;;
    "all")
        echo -e "${YELLOW}🚀 Building all platforms...${NC}"
        echo ""

        # Build server bundle
        echo -e "${YELLOW}📦 Step 1/3: Building server bundle...${NC}"
        meteor_build_bundle "$BUILD_DIR" "os.linux.x86_64"
        echo -e "${GREEN}✅ Server bundle completed${NC}"
        echo ""

        # Build iOS
        echo -e "${YELLOW}📱 Step 2/3: Building iOS application...${NC}"
        meteor_build_ios "$BUILD_DIR" "$SERVER_URL"
        echo -e "${GREEN}✅ iOS build completed${NC}"
        echo ""

        # Build Android
        echo -e "${YELLOW}🤖 Step 3/3: Building Android application...${NC}"
        meteor_build_android "$BUILD_DIR" "$SERVER_URL"
        echo -e "${GREEN}✅ Android build completed${NC}"
        echo ""

        ui_show_completion "All platform builds" "All builds available at: $BUILD_DIR"
        ;;
    "codepush-ios")
        echo -e "${YELLOW}📱 Building and releasing iOS update to CodePush...${NC}"
        # Example: Replace with your actual app name and deployment
        codepush_build_and_release "ios" "CarpSchool-iOS" "Staging" "$BUILD_DIR" "$SERVER_URL" "" "iOS update from build script"
        ui_show_completion "iOS CodePush release" "Update released to CodePush server"
        ;;
    "codepush-android")
        echo -e "${YELLOW}🤖 Building and releasing Android update to CodePush...${NC}"
        # Example: Replace with your actual app name and deployment
        codepush_build_and_release "android" "CarpSchool-Android" "Staging" "$BUILD_DIR" "$SERVER_URL" "" "Android update from build script"
        ui_show_completion "Android CodePush release" "Update released to CodePush server"
        ;;
    "codepush-status")
        codepush_show_status
        ;;
    *)
        ui_error_exit "Unknown command '${COMMAND}'" 1
        ;;
esac
