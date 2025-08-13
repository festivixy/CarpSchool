#!/bin/bash

# Runner script for Carpool app
# Provides unified interface for development and production modes
#
# Usage: ./runner.sh [command]
# Commands:
#   dev     - Run the app in development mode
#   ios     - Run the app in iOS development mode
#   android - Run the app in Android development mode
#   prod    - Build and run the app in production mode
#
# Environment Variables:
#   READ_TIMEOUT           - Input timeout in seconds (default: 10s)
#   CARPOOL_NONINTERACTIVE - Set to '1' for non-interactive mode
#
# Examples:
#   ./runner.sh dev                                    # Interactive development mode
#   READ_TIMEOUT=30 ./runner.sh dev                   # Development with 30s timeout
#   CARPOOL_NONINTERACTIVE=1 ./runner.sh prod         # Non-interactive production build

set -e  # Exit on any error

# Source utility modules
source "./tools/meteor-utils.sh"
source "./tools/ui-utils.sh"

# Function to display usage
show_usage() {
    local commands="  ${GREEN}dev${NC}     - Run the app in development mode
  ${GREEN}ios${NC}     - Run the app in iOS development mode
  ${GREEN}android${NC} - Run the app in Android development mode
  ${GREEN}prod${NC}    - Build and run the app in production mode

Examples:
  ./runner.sh dev
  ./runner.sh ios
  ./runner.sh android
  ./runner.sh prod"

    ui_show_usage "runner.sh" "$commands"
}

# Get the command (default to dev if no args provided)
if [ $# -eq 0 ]; then
    COMMAND="dev"
else
    COMMAND=$1
fi

case $COMMAND in
    "dev")
        echo -e "${YELLOW}🚀 Starting development server...${NC}"
        meteor_run_dev "../config/settings.development.json" "3001"
        ;;
    "ios")
        echo -e "${YELLOW}📱 Starting iOS development server...${NC}"
        meteor_run_ios "../config/settings.development.json" "3001"
        ;;
    "android")
        echo -e "${YELLOW}🤖 Starting Android development server...${NC}"
        meteor_run_android "../config/settings.development.json" "3001"
        ;;
    "prod")
        echo -e "${YELLOW}🚀 Running production build and run...${NC}"
        ./build-prod.sh
        ui_show_completion "Production build and run"
        ;;
    "help" | "-h" | "--help")
        show_usage
        ;;
    *)
        ui_error_exit "Unknown command '${COMMAND}'" 1
        show_usage
        ;;
esac
