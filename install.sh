#!/bin/bash

# Install script for Carpool app
# This script installs npm dependencies for the Meteor app

set -e  # Exit on any error

echo "📦 Installing Carpool app dependencies..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Navigate to app directory and install dependencies
echo -e "${YELLOW}📁 Changing to app directory...${NC}"
cd app

echo -e "${YELLOW}⬇️  Installing npm dependencies...${NC}"
meteor npm install --save

echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
echo -e "${GREEN}🚀 You can now run './runner.sh' to start the development server${NC}"
