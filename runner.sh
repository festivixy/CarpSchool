#!/bin/bash

# Runner script for Carpool app
# Usage: ./runner.sh [command]
# Commands:
#   dev   - Run the app in development mode
#   prod  - Build and run the app in production mode

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display usage
show_usage() {
    echo -e "${BLUE}🚀 Carpool Runner Script${NC}"
    echo ""
    echo "Usage: ./runner.sh [command]"
    echo ""
    echo "Available commands:"
    echo -e "  ${GREEN}dev${NC}    - Run the app in development mode"
    echo -e "  ${GREEN}prod${NC}   - Build and run the app in production mode"
    echo ""
    echo "Examples:"
    echo "  ./runner.sh dev"
    echo "  ./runner.sh prod"
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
        cd app
        meteor --no-release-check --settings ../config/settings.development.json --port 3001
        ;;
    "prod")
        echo -e "${YELLOW}🚀 Running production build and run...${NC}"
        ./build-and-run.sh
        echo -e "${GREEN}✅ Production build and run completed successfully!${NC}"
        ;;
    "help" | "-h" | "--help")
        show_usage
        ;;
    *)
        echo -e "${RED}❌ Error: Unknown command '${COMMAND}'${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
