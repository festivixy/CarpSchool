#!/bin/bash

# CarpSchool Deployment Script
# Builds locally and deploys via SFTP
#
# Usage: ./deploy.sh user@host path/to/server/on/remote
#
# Example: ./deploy.sh user@myserver.com /var/www/carpool
#
# Prerequisites:
# - SSH access to remote server (password or key authentication)
# - rsync installed on local machine (for efficient file transfer)
# - Remote server has Node.js and required dependencies installed
# - Local machine has Meteor and Docker installed for building

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Show usage
show_usage() {
    echo -e "${BLUE}🚀 CarpSchool Deployment Script${NC}"
    echo ""
    echo "Usage: $0 <user@host> <remote_path>"
    echo ""
    echo "Arguments:"
    echo "  user@host      SSH connection string (e.g., user@myserver.com)"
    echo "  remote_path    Path on remote server (e.g., /var/www/carpool)"
    echo ""
    echo "Prerequisites:"
    echo "  - SSH key authentication configured for passwordless login"
    echo "  - Remote server has Node.js installed"
    echo "  - Local machine has Meteor and Docker installed"
    echo ""
    echo "Example:"
    echo "  $0 user@myserver.com /var/www/carpool"
}

# Check if SSH connection works
check_ssh_connection() {
    local ssh_target="$1"
    echo -e "${BLUE}🔍 Checking SSH connection to $ssh_target...${NC}"
    echo -e "${YELLOW}💡 Enter password if prompted (or use SSH keys for automation)${NC}"

    if ! ssh -o ConnectTimeout=10 "$ssh_target" "echo 'SSH connection successful'" >/dev/null 2>&1; then
        echo -e "${RED}❌ SSH connection failed!${NC}"
        echo -e "${YELLOW}💡 Troubleshooting:${NC}"
        echo "   - Check username/host are correct"
        echo "   - Verify SSH service is running on remote server"
        echo "   - For password auth: enter password when prompted"
        echo "   - For key auth: run 'ssh-copy-id $ssh_target' first"
        echo "   - Ensure rsync is installed: 'which rsync'"
        exit 1
    fi

    echo -e "${GREEN}✅ SSH connection verified${NC}"
}

# Check if remote directory exists and is writable
check_remote_directory() {
    local ssh_target="$1"
    local remote_path="$2"
    echo -e "${BLUE}🔍 Checking remote directory $remote_path...${NC}"

    # Check if directory exists
    if ! ssh "$ssh_target" "test -d '$remote_path'"; then
        echo -e "${YELLOW}⚠️  Remote directory $remote_path does not exist${NC}"
        echo -e "${BLUE}📁 Creating remote directory...${NC}"
        if ! ssh "$ssh_target" "mkdir -p '$remote_path'"; then
            echo -e "${RED}❌ Failed to create remote directory${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Remote directory created${NC}"
    fi

    # Check if writable
    if ! ssh "$ssh_target" "test -w '$remote_path'"; then
        echo -e "${RED}❌ Remote directory $remote_path is not writable${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Remote directory verified${NC}"
}

# Build the application locally
build_locally() {
    echo -e "${BLUE}🔨 Building CarpSchool locally...${NC}"

    # Check if we're in the right directory
    if [ ! -d "app" ] || [ ! -d "tools" ]; then
        echo -e "${RED}❌ Not in CarpSchool server directory!${NC}"
        echo -e "${YELLOW}💡 Please run this script from the CarpSchoolServer directory${NC}"
        exit 1
    fi

    # Clean previous build
    echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
    rm -rf build server/build

    # Update browserslist (with timeout to prevent hanging)
    echo -e "${YELLOW}📦 Updating browserslist database...${NC}"
    cd app
    timeout 30 meteor npm install caniuse-lite --save --legacy-peer-deps >/dev/null 2>&1 || echo "caniuse-lite install skipped"
    timeout 30 npx update-browserslist-db@latest --yes >/dev/null 2>&1 || echo "browserslist update skipped"
    cd ..

    # Build Meteor bundle
    echo -e "${YELLOW}🚀 Building Meteor bundle...${NC}"
    cd app
    meteor build "../build" --architecture "os.linux.x86_64" --server-only
    cd ..

    # Install server dependencies
    echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
    cd build/bundle/programs/server
    npm install --production --silent
    cd ../../../..

    # Create tar.gz bundle for deployment
    echo -e "${YELLOW}📦 Creating deployment bundle...${NC}"
    cd build/bundle/programs/server
    tar -czf ../../../app.tar.gz .
    cd ../../../../

    echo -e "${GREEN}✅ Local build completed${NC}"
    echo -e "${BLUE}📁 Bundle created: build/app.tar.gz${NC}"
}

# Upload via SFTP
upload_via_sftp() {
    local ssh_target="$1"
    local remote_path="$2"
    local tar_file="build/app.tar.gz"

    echo -e "${BLUE}📤 Uploading bundle via SFTP...${NC}"
    echo -e "${YELLOW}💡 Enter password if prompted${NC}"

    # Check if tar file exists
    if [ ! -f "$tar_file" ]; then
        echo -e "${RED}❌ Bundle file $tar_file not found!${NC}"
        echo -e "${YELLOW}💡 Make sure the build completed successfully${NC}"
        exit 1
    fi

    echo -e "${YELLOW}🔄 Transferring $tar_file...${NC}"

    # Upload the tar.gz file
    if scp "$tar_file" "$ssh_target:$remote_path/app.tar.gz"; then
        echo -e "${GREEN}✅ Upload completed successfully${NC}"

        # Extract on remote server
        echo -e "${YELLOW}📦 Extracting bundle on remote server...${NC}"
        if ssh "$ssh_target" "cd '$remote_path' && tar -xzf app.tar.gz && rm app.tar.gz"; then
            echo -e "${GREEN}✅ Bundle extracted successfully${NC}"

            # Show remote file count for verification
            local remote_file_count=$(ssh "$ssh_target" "find '$remote_path' -type f | wc -l")
            echo -e "${GREEN}📊 Files deployed: $remote_file_count${NC}"
        else
            echo -e "${RED}❌ Failed to extract bundle on remote server${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Upload failed!${NC}"
        echo -e "${YELLOW}💡 Check:${NC}"
        echo "   - Remote directory permissions"
        echo "   - Available disk space"
        echo "   - Network connectivity"
        exit 1
    fi
}

# Show deployment completion
show_completion() {
    local ssh_target="$1"
    local remote_path="$2"

    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps on remote server:${NC}"
    echo "1. SSH to server: ssh $ssh_target"
    echo "2. Navigate to app: cd $remote_path"
    echo "3. Install dependencies: npm install"
    echo "4. Start application: node main.js"
    echo ""
    echo -e "${YELLOW}💡 Optional:${NC}"
    echo "   Use PM2 for production: pm2 start main.js --name carpSchool"
    echo "   Set up systemd service for auto-start"
    echo ""
    echo -e "${GREEN}✨ Bundle automatically extracted and ready to run!${NC}"
    echo ""
    echo -e "${BLUE}🌐 Application should be accessible once started${NC}"
}

# Main deployment function
main() {
    # Check arguments
    if [ $# -ne 2 ]; then
        show_usage
        exit 1
    fi

    local ssh_target="$1"
    local remote_path="$2"

    echo -e "${GREEN}🚀 Starting CarpSchool deployment...${NC}"
    echo -e "${BLUE}Target: $ssh_target${NC}"
    echo -e "${BLUE}Path: $remote_path${NC}"
    echo ""

    # Validate inputs
    if [[ ! "$ssh_target" =~ ^[^@]+@[^@]+$ ]]; then
        echo -e "${RED}❌ Invalid SSH target format. Expected: user@host${NC}"
        exit 1
    fi

    if [[ ! "$remote_path" =~ ^/ ]]; then
        echo -e "${RED}❌ Remote path must be absolute (start with /)${NC}"
        exit 1
    fi

    # Run deployment steps
    check_ssh_connection "$ssh_target"
    check_remote_directory "$ssh_target" "$remote_path"
    build_locally
    upload_via_sftp "$ssh_target" "$remote_path"
    show_completion "$ssh_target" "$remote_path"

    echo ""
    echo -e "${GREEN}✨ Deployment script completed!${NC}"
}

# Run main function with all arguments
main "$@"