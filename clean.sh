#!/bin/bash

# Clean script for Carpool Docker deployment
# This script stops containers, removes volumes, and cleans build artifacts

set -e  # Exit on any error

# Source utility modules
source "./tools/docker-utils.sh"
source "./tools/meteor-utils.sh"
source "./tools/fs-utils.sh"
source "./tools/ui-utils.sh"

echo "🧹 Cleaning Carpool Docker deployment..."

# Step 1: Stop and remove Docker containers
docker_stop_containers

# Step 2: Remove database folders
fs_clean_databases

# Step 3: Clean build artifacts
fs_clean_build "build"

# Step 4: Handle Meteor local directory cleanup
if ui_ask_yes_no "Do you want to remove the entire Meteor local directory (app/.meteor/local)?"; then
    meteor_clean_local "app" "all"
else
    if ui_ask_yes_no "Do you want to remove just the Meteor database (app/.meteor/local/db)?"; then
        meteor_clean_local "app" "db"
    else
        echo -e "${YELLOW}Skipping removal of Meteor local artifacts.${NC}"
    fi
fi

# Step 5: Clean openmaptiles directory
fs_clean_openmaptiles

# Step 6: Clean PostgreSQL data
fs_clean_postgres

# Step 7: Clean Node.js dependencies
if ui_ask_yes_no "Do you want to remove Node.js dependencies (package-lock.json and node_modules)?"; then
    meteor_clean_dependencies "app"
else
    echo -e "${YELLOW}Skipping removal of Node.js dependencies.${NC}"
fi

ui_show_completion "Cleanup" "To rebuild and run: ./build-prod.sh"
