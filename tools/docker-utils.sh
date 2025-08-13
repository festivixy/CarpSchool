#!/bin/bash

# Docker utilities for Carpool app
# Provides reusable Docker-related functions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to stop Docker containers
docker_stop_containers() {
    local compose_file=${1:-"docker-compose.yml"}
    echo -e "${YELLOW}🛑 Stopping Docker containers...${NC}"
    docker compose -f "$compose_file" down
}

# Function to start Docker containers
docker_start_containers() {
    local compose_file=${1:-"docker-compose.yml"}
    echo -e "${YELLOW}🚀 Starting services with Docker Compose...${NC}"
    docker compose -f "$compose_file" up -d
}

# Function to show Docker status
docker_show_status() {
    local app_url=${1:-"http://localhost:3000"}
    echo -e "${GREEN}✅ Services started successfully!${NC}"
    echo -e "${GREEN}🌐 App available at: ${app_url}${NC}"
    echo ""
    echo "📝 Useful commands:"
    echo "  View logs: docker compose logs -f app"
    echo "  Stop services: docker compose down"
    echo "  Rebuild: ./build-prod.sh"
}

# Function to check if Docker is running
docker_check_running() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running!${NC}"
        echo "Please start Docker and try again."
        exit 1
    fi
}
