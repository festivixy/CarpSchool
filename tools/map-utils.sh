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

# Function to prompt for custom release name
map_prompt_custom_release() {
    while true; do
        read -p "Enter custom release name: " custom_release
        if [[ -n "$custom_release" && "$custom_release" =~ ^[a-zA-Z0-9._-]+$ ]]; then
            echo "$custom_release"
            return 0
        else
            echo "Invalid release name. Please use only alphanumeric characters, dots, hyphens, and underscores."
        fi
    done
}

# Function to create directory structure
map_create_target_dir() {
    local target_dir="$1"
    echo "Creating directory structure: $target_dir"
    mkdir -p "$target_dir"
}

# Function to check download tool availability
map_check_download_tool() {
    if command -v curl &> /dev/null; then
        echo "curl"
        return 0
    elif command -v wget &> /dev/null; then
        echo "wget"
        return 0
    else
        echo "✗ Error: Neither curl nor wget is available."
        echo "Please install curl or wget to download files."
        return 1
    fi
}

# Function to download file with error handling
map_download_file() {
    local url="$1"
    local target_file="$2"
    local tool="$3"

    echo "Downloading from: $url"
    echo "Saving to: $target_file"
    echo ""

    case "$tool" in
        "curl")
            echo "Using curl to download..."
            if curl -L -f --progress-bar -o "$target_file" "$url"; then
                echo "✓ Download completed successfully!"
                return 0
            else
                echo "✗ Download failed. Please check:"
                echo "  - Internet connection"
                echo "  - URL: $url"
                return 1
            fi
            ;;
        "wget")
            echo "Using wget to download..."
            if wget --progress=bar:force -O "$target_file" "$url"; then
                echo "✓ Download completed successfully!"
                return 0
            else
                echo "✗ Download failed. Please check:"
                echo "  - Internet connection"
                echo "  - URL: $url"
                return 1
            fi
            ;;
        *)
            echo "✗ Error: Invalid download tool specified"
            return 1
            ;;
    esac
}
