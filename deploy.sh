#!/bin/bash

# Deploy script for CarpSchoolServer
# Downloads latest meteor-bundle from GitHub Actions and deploys to server

set -e  # Exit on any error

echo "========================================"
echo "CarpSchoolServer Deployment"
echo "========================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to build directory
BUILD_DIR="$(dirname "$0")/build"
cd "$BUILD_DIR"

echo -e "${YELLOW}🐳 Stopping existing containers...${NC}"
cd "$(dirname "$0")/server"
docker compose down
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

# Go back to build directory
cd "$BUILD_DIR"

# Rename old build if it exists
if [ -f "app.tar.gz" ]; then
    echo -e "${YELLOW}📦 Renaming old build to app.tar.gz.old...${NC}"
    rm -f app.tar.gz.old
    mv app.tar.gz app.tar.gz.old
    echo -e "${GREEN}✅ Old build renamed${NC}"
    echo ""
fi

echo -e "${YELLOW}📦 Downloading latest meteor-bundle from GitHub...${NC}"
gh run download --name "meteor-bundle" --pattern "*"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to download meteor-bundle${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Download complete!${NC}"
echo ""

# List downloaded files
echo -e "${YELLOW}📁 Downloaded files:${NC}"
ls -lh
echo ""

echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start containers${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Containers started${NC}"
echo ""

echo "========================================"
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo "========================================"
echo ""
echo "Check status with: cd server && docker compose ps"
echo "View logs with: cd server && docker compose logs -f"
