#!/bin/bash

# Map utilities for Carpool app
# Provides reusable map data operations

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if map data exists
map_check_data() {
    local data_dir=${1:-"openmaptilesdata/data"}
    
    if [ ! -d "$data_dir" ]; then
        echo -e "${RED}⚠️  $data_dir directory not found!${NC}"
        echo -e "${YELLOW}You need map data before continuing.${NC}"
        return 1
    fi
    return 0
}

# Function to prompt for map data action
map_prompt_data_action() {
    echo ""
    echo "Please choose an option:"
    echo "1) Build - Run './build-openmaptiles.sh' to generate map data WARN: takes around 5 to 20 hours depends on your hardware."
    echo "2) Download - Run './download-openmaptiles-data.sh' to download pre-built data"
    echo ""
    read -p "Enter your choice (1-2): " choice
    
    case $choice in
        1 )
            echo "Starting map data build process..."
            ./build-openmaptiles.sh
            return 0
            ;;
        2 )
            echo "Starting map data download process..."
            ./download-openmaptiles-data.sh
            return 0
            ;;
        * )
            echo "Invalid choice. Exiting..."
            echo "Please run the script again and choose 1 or 2."
            return 1
            ;;
    esac
}

# Function to handle map data requirements
map_ensure_data() {
    local data_dir=${1:-"openmaptilesdata/data"}
    
    if ! map_check_data "$data_dir"; then
        if ! map_prompt_data_action; then
            exit 1
        fi
    fi
}

# Function to validate release choice for downloads
map_validate_release_choice() {
    local choice="$1"
    case $choice in
        1|2|3)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to get release name from choice
map_get_release_name() {
    local choice="$1"
    case $choice in
        1)
            echo "omt.ca.bc"
            ;;
        2)
            echo "omt.ca"
            ;;
        3)
            echo "custom"
            ;;
        *)
            echo ""
            return 1
            ;;
    esac
}
