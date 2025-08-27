#!/bin/bash

# CodePush Setup Helper Script
# Docker Compose deployment for CodePush server

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

# Function to check and generate JWT token
check_jwt_config() {
    echo -e "${BLUE}🔐 Checking JWT configuration...${NC}"

    if grep -q "INSERT_RANDOM_TOKEN_KEY" codepush-config.js; then
        echo -e "${RED}⚠️  WARNING: JWT token is not configured!${NC}"
        echo -e "${YELLOW}The JWT tokenSecret is still set to placeholder value.${NC}"
        echo -e "${YELLOW}For security, please update codepush-config.js with a random 63-character key.${NC}"
        echo -e "${YELLOW}Generate one at: https://www.grc.com/passwords.htm${NC}"
        echo ""
        read -p "Continue anyway? (y/N): " confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            echo -e "${RED}❌ Setup cancelled. Please configure JWT token first.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ JWT token appears to be configured${NC}"
    fi
}



# Function to start CodePush services
start_codepush() {
    echo -e "${BLUE}🔄 Starting CodePush services...${NC}"

    # Start only CodePush related services
    docker compose up -d codepush-mysql codepush-redis codepush-server

    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 30

    # Check if services are healthy
    if docker compose ps codepush-server | grep -q "healthy"; then
        echo -e "${GREEN}✅ CodePush server is running${NC}"
    else
        echo -e "${YELLOW}⚠️  CodePush server is starting up, please wait...${NC}"
    fi
}

# Function to get deployment keys
get_deployment_keys() {
    echo -e "${BLUE}🔑 Retrieving deployment keys...${NC}"

    # Wait for MySQL to be ready and run query to get keys
    # Note: Using no password since MYSQL_ALLOW_EMPTY_PASSWORD="On"
    docker compose exec codepush-mysql mysql -u codepush -D codepush -e "
        SELECT
            a.name as app_name,
            a.os,
            a.platform,
            d.name as deployment_name,
            d.deployment_key
        FROM apps a
        JOIN deployments d ON a.id = d.appid
        ORDER BY a.platform, a.name, d.name;
    " 2>/dev/null || echo -e "${YELLOW}⚠️  Could not retrieve keys. Database may still be initializing or no apps created yet.${NC}"
}

# Function to show CodePush status
show_status() {
    echo -e "${BLUE}📊 CodePush Server Status${NC}"
    echo ""

    # Docker Compose status
    echo -e "${YELLOW}Docker Services:${NC}"
    docker compose ps codepush-server codepush-mysql codepush-redis
    echo ""

    # Check if server is accessible
    if curl -s http://localhost:3000/ >/dev/null 2>&1; then
        echo -e "${GREEN}✅ CodePush server is accessible at http://localhost:3000${NC}"
    else
        echo -e "${YELLOW}⚠️  CodePush server not accessible directly.${NC}"
    fi

    # Check if server is accessible through proxy
    if curl -s http://localhost:40064/ >/dev/null 2>&1; then
        echo -e "${GREEN}✅ CodePush server is accessible through proxy at http://localhost:40064${NC}"
        echo -e "${GREEN}🌐 Will be available at https://codepush.carp.school (when proxied)${NC}"
    else
        echo -e "${YELLOW}⚠️  CodePush server not accessible through proxy.${NC}"
        echo -e "${YELLOW}💡 Try: docker compose up -d service-proxy${NC}"
    fi

    echo ""

    # Show configuration
    echo -e "${YELLOW}Configuration:${NC}"
    echo -e "Direct Access: http://localhost:3000"
    echo -e "Proxy Port: 40064 (http://localhost:40064)"
    echo -e "External URL: https://codepush.carp.school"
    echo -e "Admin Credentials: admin / 123456 (default)"
    echo -e "Data Directory: ./codepush_storage"
    echo -e "MySQL Database: codepush (user: codepush, no password required)"
    echo ""

    echo -e "${RED}🔐 SECURITY REMINDERS:${NC}"
    echo -e "1. Change default admin password after first login"
    echo -e "2. Update JWT tokenSecret in codepush-config.js"
    echo -e "3. Configure SMTP settings for email notifications"
    echo ""
}

# Function to stop services
stop_codepush() {
    echo -e "${BLUE}🛑 Stopping CodePush services...${NC}"
    docker compose stop codepush-server codepush-mysql codepush-redis
    echo -e "${GREEN}✅ CodePush services stopped${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 CodePush Server Logs (Press Ctrl+C to exit)${NC}"
    docker compose logs -f codepush-server
}

# Function to reset data
reset_data() {
    echo -e "${RED}⚠️  WARNING: This will delete all CodePush data!${NC}"
    read -p "Are you sure? Type 'yes' to continue: " confirm
    if [ "$confirm" = "yes" ]; then
        echo -e "${BLUE}🗑️  Resetting CodePush data...${NC}"
        docker compose down codepush-server codepush-mysql codepush-redis
        sudo rm -rf codepush_storage codepush_tmp codepush_mysql_data codepush_redis_data
        echo -e "${GREEN}✅ CodePush data reset${NC}"
        echo -e "${YELLOW}💡 Run '$0 start' to initialize fresh services${NC}"
    else
        echo -e "${YELLOW}❌ Reset cancelled${NC}"
    fi
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
    echo -e "  $0 start                    # Start CodePush services"
    echo -e "  $0 keys                     # Get deployment keys"
    echo -e "  $0 logs                     # Show server logs"
    echo -e "  $0 status                   # Check service health"
    echo ""
    echo -e "${YELLOW}Features:${NC}"
    echo -e "  - Docker Compose deployment"
    echo -e "  - Uses admin:123456 default credentials (change after setup!)"
    echo -e "  - Compatible with official code-push-server Docker images"
    echo -e "  - Local volume storage for persistence"
    echo ""
}

# Parse command
case "${1:-status}" in
    "start")
        check_docker
        check_jwt_config
        start_codepush
        echo ""
        echo -e "${GREEN}🎉 CodePush services started!${NC}"
        echo -e "${YELLOW}💡 Run '$0 keys' to get deployment keys${NC}"
        echo -e "${YELLOW}💡 Run '$0 status' to check service health${NC}"
        echo -e "${YELLOW}💡 Web interface: http://localhost:3000 (admin/123456)${NC}"
        ;;
    "stop")
        stop_codepush
        ;;
    "restart")
        echo -e "${BLUE}🔄 Restarting CodePush services...${NC}"
        docker compose restart codepush-server codepush-mysql codepush-redis
        echo -e "${GREEN}✅ CodePush services restarted${NC}"
        ;;
    "status")
        show_status
        ;;
    "keys")
        get_deployment_keys
        ;;
    "logs")
        show_logs
        ;;
    "reset")
        reset_data
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
