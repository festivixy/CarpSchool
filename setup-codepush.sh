#!/bin/bash

# CodePush Setup Helper Script
# This script helps set up and configure CodePush server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 CodePush Server Setup Helper${NC}"
echo ""

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is running${NC}"
}

# Function to start CodePush services
start_codepush() {
    echo -e "${BLUE}🔄 Starting CodePush services...${NC}"

    # Start only CodePush related services
    docker-compose up -d codepush-mysql codepush-redis codepush-server

    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 30

    # Check if services are healthy
    if docker-compose ps codepush-server | grep -q "healthy"; then
        echo -e "${GREEN}✅ CodePush server is running${NC}"
    else
        echo -e "${YELLOW}⚠️  CodePush server is starting up, please wait...${NC}"
    fi
}

# Function to get deployment keys
get_deployment_keys() {
    echo -e "${BLUE}🔑 Retrieving deployment keys...${NC}"

    # Wait for MySQL to be ready and run query to get keys
    docker-compose exec codepush-mysql mysql -u codepush -pcodepush123 -D codepush -e "
        SELECT
            a.name as app_name,
            a.platform,
            d.name as deployment_name,
            d.\`key\` as deployment_key
        FROM apps a
        JOIN deployments d ON a.id = d.app_id
        ORDER BY a.platform, a.name, d.name;
    " 2>/dev/null || echo -e "${YELLOW}⚠️  Could not retrieve keys. Database may still be initializing.${NC}"
}

# Function to show CodePush status
show_status() {
    echo -e "${BLUE}📊 CodePush Server Status${NC}"
    echo ""

    # Check service status
    echo -e "${YELLOW}Docker Services:${NC}"
    docker-compose ps codepush-server codepush-mysql codepush-redis
    echo ""

    # Check if server is accessible through proxy
    if curl -s http://localhost:40064/ >/dev/null; then
        echo -e "${GREEN}✅ CodePush server is accessible through proxy at http://localhost:40064${NC}"
        echo -e "${GREEN}🌐 Will be available at https://codepush.carp.school (when proxied)${NC}"
    else
        echo -e "${YELLOW}⚠️  CodePush server not accessible through proxy. Check if service-proxy is running.${NC}"
        echo -e "${YELLOW}💡 Try: docker-compose up -d service-proxy${NC}"
    fi
    echo ""

    # Show configuration
    echo -e "${YELLOW}Configuration:${NC}"
    echo -e "Proxy Port: 40064 (http://localhost:40064)"
    echo -e "External URL: https://codepush.carp.school"
    echo -e "Admin UI: https://codepush.carp.school (admin/carpschool123)"
    echo -e "Data Directory: ./codepush_storage"
    echo -e "Access: Through nginx proxy only (no direct port exposure)"
    echo ""
}

# Function to show usage
show_usage() {
    echo -e "${YELLOW}Usage: $0 [command]${NC}"
    echo ""
    echo -e "${GREEN}Commands:${NC}"
    echo -e "  ${GREEN}start${NC}     - Start CodePush services"
    echo -e "  ${GREEN}stop${NC}      - Stop CodePush services"
    echo -e "  ${GREEN}restart${NC}   - Restart CodePush services"
    echo -e "  ${GREEN}status${NC}    - Show service status"
    echo -e "  ${GREEN}keys${NC}      - Show deployment keys"
    echo -e "  ${GREEN}logs${NC}      - Show CodePush server logs"
    echo -e "  ${GREEN}reset${NC}     - Reset database and storage (DANGER!)"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  $0 start                    # Start all CodePush services"
    echo -e "  $0 keys                     # Get deployment keys for mobile app"
    echo -e "  $0 logs                     # Show server logs"
    echo ""
}

# Parse command
case "${1:-status}" in
    "start")
        check_docker
        start_codepush
        echo ""
        echo -e "${GREEN}🎉 CodePush services started!${NC}"
        echo -e "${YELLOW}💡 Run '$0 keys' to get deployment keys${NC}"
        echo -e "${YELLOW}💡 Run '$0 status' to check service health${NC}"
        ;;
    "stop")
        echo -e "${BLUE}🛑 Stopping CodePush services...${NC}"
        docker-compose stop codepush-server codepush-mysql codepush-redis
        echo -e "${GREEN}✅ CodePush services stopped${NC}"
        ;;
    "restart")
        echo -e "${BLUE}🔄 Restarting CodePush services...${NC}"
        docker-compose restart codepush-server codepush-mysql codepush-redis
        echo -e "${GREEN}✅ CodePush services restarted${NC}"
        ;;
    "status")
        show_status
        ;;
    "keys")
        get_deployment_keys
        ;;
    "logs")
        echo -e "${BLUE}📋 CodePush Server Logs (Press Ctrl+C to exit)${NC}"
        docker-compose logs -f codepush-server
        ;;
    "reset")
        echo -e "${RED}⚠️  WARNING: This will delete all CodePush data!${NC}"
        read -p "Are you sure? Type 'yes' to continue: " confirm
        if [ "$confirm" = "yes" ]; then
            echo -e "${BLUE}🗑️  Resetting CodePush data...${NC}"
            docker-compose down codepush-server codepush-mysql codepush-redis
            sudo rm -rf codepush_storage codepush_tmp codepush_mysql_data codepush_redis_data
            echo -e "${GREEN}✅ CodePush data reset${NC}"
            echo -e "${YELLOW}💡 Run '$0 start' to initialize fresh services${NC}"
        else
            echo -e "${YELLOW}❌ Reset cancelled${NC}"
        fi
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
