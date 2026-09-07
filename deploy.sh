#!/bin/bash

# Deploy script for CarpSchoolServer
# Downloads latest meteor-bundle from GitHub Actions and deploys to server
#
# Usage: ./deploy.sh [--run-id RUN_ID]
#   --run-id RUN_ID   Download the meteor-bundle artifact from a specific
#                      GitHub Actions run instead of the latest one.

set -euo pipefail  # Exit on any error

cd "$(cd "$(dirname "$0")" && pwd)"

echo "========================================"
echo "CarpSchoolServer Deployment"
echo "========================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

RUN_ID=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --run-id)
            if [ -n "${2:-}" ]; then
                RUN_ID="$2"
                shift 2
            else
                echo -e "${RED}❌ --run-id requires a value${NC}"
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

HEALTH_URL="http://127.0.0.1:3000/health"
HEALTH_RETRIES=60
HEALTH_INTERVAL=5

BUILD_DIR="build"

echo -e "${YELLOW}🐳 Stopping existing containers...${NC}"
docker compose down
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# Rename old build if it exists
if [ -f "app.tar.gz" ]; then
    echo -e "${YELLOW}📦 Renaming old build to app.tar.gz.old...${NC}"
    rm -f app.tar.gz.old
    mv app.tar.gz app.tar.gz.old
    echo -e "${GREEN}✅ Old build renamed${NC}"
    echo ""
fi

echo -e "${YELLOW}📦 Downloading meteor-bundle from GitHub...${NC}"
if [ -n "$RUN_ID" ]; then
    gh run download "$RUN_ID" --pattern "meteor-bundle-*"
else
    gh run download --pattern "meteor-bundle-*"
fi
echo -e "${GREEN}✅ Download complete!${NC}"
echo ""

if [ ! -f "app.tar.gz" ]; then
    echo -e "${RED}❌ Downloaded artifact is missing app.tar.gz${NC}"
    exit 1
fi

# List downloaded files
echo -e "${YELLOW}📁 Downloaded files:${NC}"
ls -lh
echo ""

cd ..

echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker compose up -d
echo -e "${GREEN}✅ Containers started${NC}"
echo ""

echo -e "${YELLOW}⏳ Waiting for the app to become healthy...${NC}"
healthy=false
for _ in $(seq 1 "$HEALTH_RETRIES"); do
    if curl --silent --fail --output /dev/null "$HEALTH_URL"; then
        healthy=true
        break
    fi
    sleep "$HEALTH_INTERVAL"
done

if [ "$healthy" = true ]; then
    echo ""
    echo "========================================"
    echo -e "${GREEN}🎉 Deployment complete!${NC}"
    echo "========================================"
    echo ""
    echo "Check status with: docker compose ps"
    echo "View logs with: docker compose logs -f"
else
    echo -e "${RED}❌ Health check failed after deploy; rolling back...${NC}"
    docker compose down

    if [ -f "$BUILD_DIR/app.tar.gz.old" ]; then
        rm -f "$BUILD_DIR/app.tar.gz"
        mv "$BUILD_DIR/app.tar.gz.old" "$BUILD_DIR/app.tar.gz"
        docker compose up -d
        echo -e "${YELLOW}⚠️  Rolled back to the previous build. Investigate the new build before retrying.${NC}"
    else
        echo -e "${RED}❌ No previous build (app.tar.gz.old) to roll back to.${NC}"
    fi
    exit 1
fi
