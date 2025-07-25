#!/bin/bash

# Runner script for Carpool app
# Usage: ./runner.sh [command]
# Commands:
#   dev   - Run the app in development mode
#   prod  - Build and run the app in production mode

set -e  # Exit on any error

# Source utility modules
source "./tools/meteor-utils.sh"
source "./tools/ui-utils.sh"

# Function to display usage
show_usage() {
    local commands="  ${GREEN}dev${NC}    - Run the app in development mode
  ${GREEN}prod${NC}   - Build and run the app in production mode

Examples:
  ./runner.sh dev
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
    "prod")
        echo -e "${YELLOW}🚀 Running production build and run...${NC}"
        ./build-and-run.sh
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
