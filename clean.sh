#!/bin/bash

# Clean script for Carpool Docker deployment
# This script stops containers, removes volumes, and cleans build artifacts

set -e  # Exit on any error

echo "🧹 Cleaning Carpool Docker deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Stop and remove Docker containers
echo -e "${YELLOW}🛑 Stopping Docker containers...${NC}"
docker compose down

# Step 2: Remove Docker volumes (optional - uncomment if needed)
# echo -e "${YELLOW}🗑️  Removing Docker volumes...${NC}"
# docker compose down -v

# Step 3: Clean build artifacts
echo -e "${YELLOW}🗂️  Cleaning build artifacts...${NC}"
rm -rf build

echo -e "${YELLOW}🗑️  Removing local Meteor build artifacts...${NC}"
rm -rf app/.meteor/local


read -p $'${YELLOW}Do you want to remove the openmaptiles directory? (y/n): ${NC}' yn
case $yn in
  [Yy]* )
    echo -e "${YELLOW}  Removing openmaptiles directory...${NC}"
    rm -rf openmaptiles
    ;;
  * )
    echo -e "${YELLOW}Skipping removal of openmaptiles directory.${NC}"
    ;;
esac

echo -e "${GREEN}✅ Cleanup completed!${NC}"
echo ""
echo "📝 To rebuild and run:"
echo "  ./build-and-run.sh"
