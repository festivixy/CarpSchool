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

# Step 2: Remove database folders
echo -e "${YELLOW}Do you want to remove database folders (mongo_data/ and pgdata/)? (Y/n): ${NC}"
read -p $'' yn
case $yn in
  [Nn]* )
    echo -e "${YELLOW}Skipping removal of database folders.${NC}"
    ;;
  * )
    echo -e "${YELLOW}🗑️  Removing database folders...${NC}"
    rm -rf mongo_data
    rm -rf pgdata
    echo -e "${GREEN}   Removed mongo_data/ and pgdata/ directories${NC}"
    ;;
esac

# Step 3: Clean build artifacts
echo -e "${YELLOW}🗂️  Cleaning build artifacts...${NC}"
rm -rf build

echo -e "${YELLOW}Do you want to remove the entire Meteor local directory (app/.meteor/local)? (Y/n): ${NC}"
read -p $'' yn
case $yn in
  [Nn]* )
    echo -e "${YELLOW}Do you want to remove just the Meteor database (app/.meteor/local/db)? (Y/n): ${NC}"
    read -p $'' yn2
    case $yn2 in
      [Nn]* )
        echo -e "${YELLOW}Skipping removal of Meteor local artifacts.${NC}"
        ;;
      * )
        echo -e "${YELLOW}🗑️  Removing Meteor local database...${NC}"
        rm -rf app/.meteor/local/db
        echo -e "${GREEN}   Removed app/.meteor/local/db${NC}"
        ;;
    esac
    ;;
  * )
    echo -e "${YELLOW}🗑️  Removing entire Meteor local directory...${NC}"
    rm -rf app/.meteor/local
    echo -e "${GREEN}   Removed app/.meteor/local${NC}"
    ;;
esac

echo -e "${YELLOW}Do you want to remove the openmaptiles directory? (Y/n): ${NC}"
read -p $'' yn
case $yn in
  [Nn]* )
    echo -e "${YELLOW}Skipping removal of openmaptiles directory.${NC}"
    ;;
  * )
    echo -e "${YELLOW}  Removing openmaptiles directory...${NC}"
    rm -rf openmaptiles
    ;;
esac

echo -e "${YELLOW}Do you want to remove Node.js dependencies (package-lock.json and node_modules)? (Y/n): ${NC}"
read -p $'' yn
case $yn in
  [Nn]* )
    echo -e "${YELLOW}Skipping removal of Node.js dependencies.${NC}"
    ;;
  * )
    echo -e "${YELLOW}🗑️  Removing Node.js dependencies...${NC}"
    rm -f app/package-lock.json
    rm -rf app/node_modules
    echo -e "${GREEN}   Removed package-lock.json and node_modules${NC}"
    ;;
esac

echo -e "${GREEN}✅ Cleanup completed!${NC}"
echo ""
echo "📝 To rebuild and run:"
echo "  ./build-and-run.sh"
