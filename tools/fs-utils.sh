#!/bin/bash

# File system utilities for Carpool app
# Provides reusable file system operations

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to clean build artifacts
fs_clean_build() {
    local build_dir=${1:-"build"}

    echo -e "${YELLOW}🗂️  Cleaning build artifacts...${NC}"
    rm -rf "$build_dir"
    echo -e "${GREEN}   Removed $build_dir directory${NC}"
}

# Function to remove directory with confirmation
fs_remove_with_confirmation() {
    local dir_path="$1"
    local dir_name="$2"
    local prompt_msg="$3"

    echo -e "${YELLOW}${prompt_msg} (Y/n): ${NC}"
    local yn
    if read -r yn; then
        case $yn in
            [Nn]* )
                echo -e "${YELLOW}Skipping removal of ${dir_name}.${NC}"
                return 1
                ;;
            * )
                echo -e "${YELLOW}🗑️  Removing ${dir_name}...${NC}"
                rm -rf "$dir_path"
                echo -e "${GREEN}   Removed ${dir_path}${NC}"
                return 0
                ;;
        esac
    else
        echo -e "${YELLOW}Failed to read input, skipping removal of ${dir_name}.${NC}"
        return 1
    fi
}

# Function to remove database directories
fs_clean_databases() {
    fs_remove_with_confirmation "mongo_data" "database folders" "Do you want to remove database folders (mongo_data/)?"
}

# Function to remove openmaptiles directory
fs_clean_openmaptiles() {
    if fs_remove_with_confirmation "openmaptiles/*" "openmaptiles directory" "Do you want to remove the openmaptiles directory?"; then
        # Only remove contents, not the directory itself
        echo -e "${YELLOW}  Removing openmaptiles directory contents...${NC}"
    fi
}

# Function to remove PostgreSQL data
fs_clean_postgres() {
    fs_remove_with_confirmation "pgdataNominatimInternal" "pgdataNominatimInternal directory" "Do you want to remove the pgdataNominatimInternal directory?"
}

# Function to check if directory exists
fs_check_directory() {
    local dir_path="$1"
    local dir_description="$2"

    if [ ! -d "$dir_path" ]; then
        echo -e "${RED}⚠️  ${dir_description} directory not found!${NC}"
        return 1
    fi
    return 0
}
