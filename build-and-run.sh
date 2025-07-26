#!/bin/bash

# Build and run Carpool app with Docker using zodern/meteor bundle approach
# This script builds the Meteor app as a bundle and runs it using Docker Compose
#
# Environment Variables:
#   READ_TIMEOUT           - Input timeout in seconds (default: 10s)
#   CARPOOL_NONINTERACTIVE - Set to '1' for non-interactive mode
#
# Features:
#   - Automatic cleanup of previous builds
#   - Meteor app bundle creation for production
#   - Map data validation and setup
#   - Docker container orchestration
#   - Configurable input timeouts (default: 10 seconds)
#   - Non-interactive mode for CI/CD pipelines
#   - Maximum 3 retry attempts for user input validation
#
# Examples:
#   ./build-and-run.sh                                 # Interactive mode
#   READ_TIMEOUT=30 ./build-and-run.sh                # 30 second input timeout
#   CARPOOL_NONINTERACTIVE=1 ./build-and-run.sh       # Automated/CI mode

set -e  # Exit on any error

# Source utility modules
source "./tools/docker-utils.sh"
source "./tools/meteor-utils.sh"
source "./tools/fs-utils.sh"
source "./tools/map-utils.sh"
source "./tools/ui-utils.sh"

echo "🚀 Building and running Carpool app with Docker..."

# Check if Docker is running
docker_check_running

# Step 1: Clean previous build
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
fs_clean_build "build"

# Step 2: Build the Meteor app
echo -e "${YELLOW}📦 Building Meteor app bundle...${NC}"
cd app
meteor_update_browserslist
meteor_build_bundle "../build" "os.linux.x86_64"
cd ..

# Step 3: Ensure map data exists
map_ensure_data "openmaptilesdata/data"

# Step 4: Start services with Docker Compose
docker_start_containers

# Step 5: Show status
docker_show_status "http://localhost:3000"
