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

# Step 4: Clean Docker images (optional - uncomment if needed)
# echo -e "${YELLOW}🐳 Removing unused Docker images...${NC}"
# docker image prune -f

echo -e "${GREEN}✅ Cleanup completed!${NC}"
echo ""
echo "📝 To rebuild and run:"
echo "  ./build-and-run.sh"
