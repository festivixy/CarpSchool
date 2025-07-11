#!/bin/bash

# Build and run Carpool app with Docker using zodern/meteor bundle approach
# This script builds the Meteor app as a bundle and runs it using Docker Compose

set -e  # Exit on any error

echo "🚀 Building and running Carpool app with Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Clean previous build
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
rm -rf build

# Step 2: Build the Meteor app
echo -e "${YELLOW}📦 Building Meteor app bundle...${NC}"
cd app
meteor build ../build --architecture os.linux.x86_64 --server-only
cd ..

# Step 3: Start services with Docker Compose
echo -e "${YELLOW}🚀 Starting services with Docker Compose...${NC}"
docker compose up -d

# Step 4: Show status
echo -e "${GREEN}✅ Services started successfully!${NC}"
echo -e "${GREEN}🌐 App available at: http://localhost:3000${NC}"
echo ""
echo "📝 Useful commands:"
echo "  View logs: docker compose logs -f app"
echo "  Stop services: docker compose down"
echo "  Rebuild: ./build-and-run.sh"
