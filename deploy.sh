#!/bin/bash

# CarpSchool Deployment Script
# Builds locally and deploys via SFTP
#
# Usage: ./deploy.sh user@host path/to/server/on/remote
#
# Example: ./deploy.sh user@myserver.com /var/www/carpool
#
# Prerequisites:
# - SSH key authentication set up for passwordless login
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

    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$ssh_target" "echo 'SSH connection successful'" >/dev/null 2>&1; then
        echo -e "${RED}❌ SSH connection failed!${NC}"
        echo -e "${YELLOW}💡 Make sure:${NC}"
        echo "   - SSH key is added to ~/.ssh/authorized_keys on remote server"
        echo "   - SSH agent is running: eval \$(ssh-agent) && ssh-add"
        echo "   - Firewall allows SSH connections"
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

    # Update browserslist
    echo -e "${YELLOW}📦 Updating browserslist database...${NC}"
    cd app
    meteor npm install caniuse-lite --save --legacy-peer-deps >/dev/null 2>&1 || true
    npx update-browserslist-db@latest >/dev/null 2>&1 || true
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

    # Prepare server build directory
    echo -e "${YELLOW}📁 Preparing server build...${NC}"
    mkdir -p server/build
    cp -r build/bundle/programs/server/* server/build/

    echo -e "${GREEN}✅ Local build completed${NC}"
}

# Upload via SFTP
upload_via_sftp() {
    local ssh_target="$1"
    local remote_path="$2"
    echo -e "${BLUE}📤 Uploading bundle via SFTP...${NC}"

    # Create batch file for sftp
    local sftp_batch_file="/tmp/carpschool_deploy_$$.txt"
    cat > "$sftp_batch_file" << EOF
cd $remote_path
put -r server/build
EOF

    echo -e "${YELLOW}🔄 Transferring files...${NC}"

    # Execute SFTP batch
    if sftp -b "$sftp_batch_file" "$ssh_target" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Upload completed successfully${NC}"

        # Clean up
        rm -f "$sftp_batch_file"

        # Show remote file count for verification
        local remote_file_count=$(ssh "$ssh_target" "find '$remote_path' -type f | wc -l")
        echo -e "${GREEN}📊 Files uploaded: $remote_file_count${NC}"
    else
        echo -e "${RED}❌ SFTP upload failed!${NC}"
        rm -f "$sftp_batch_file"
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