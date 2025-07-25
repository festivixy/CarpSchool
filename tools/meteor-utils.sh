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
    meteor build "$build_dir" --architecture "$architecture" --server-only
}

# Function to run development server
meteor_run_dev() {
    local settings_file=${1:-"../config/settings.development.json"}
    local port=${2:-"3001"}
    
    echo -e "${YELLOW}🚀 Starting Meteor development server...${NC}"
    cd app
    meteor --no-release-check --settings "$settings_file" --port "$port"
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

# Function to clean Node.js dependencies
meteor_clean_dependencies() {
    local app_dir=${1:-"app"}
    
    echo -e "${YELLOW}🗑️  Removing Node.js dependencies...${NC}"
    rm -f "$app_dir/package-lock.json"
    rm -rf "$app_dir/node_modules"
    echo -e "${GREEN}   Removed package-lock.json and node_modules${NC}"
}
