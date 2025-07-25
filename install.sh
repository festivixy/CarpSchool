#!/bin/bash

# Install script for Carpool app
# This script installs npm dependencies for the Meteor app

set -e  # Exit on any error

# Source utility modules
source "./tools/ui-utils.sh"

echo "📦 Installing Carpool app dependencies..."

# Step 1: Navigate to app directory and install dependencies
echo -e "${YELLOW}📁 Changing to app directory...${NC}"
cd app

echo -e "${YELLOW}⬇️  Installing npm dependencies...${NC}"
meteor npm install --save

ui_show_completion "Dependencies installed" "You can now run './runner.sh' to start the development server"
