#!/bin/bash

echo "🏥 Docker Compose Health Check"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check service health
check_service_health() {
    local service_name=$1
    local health_status=$(docker compose ps --format json | jq -r ".[] | select(.Name==\"$service_name\") | .Health")
    local state=$(docker compose ps --format json | jq -r ".[] | select(.Name==\"$service_name\") | .State")
    
    if [ "$health_status" = "healthy" ]; then
        echo -e "${GREEN}✅ $service_name: Healthy${NC}"
    elif [ "$health_status" = "unhealthy" ]; then
        echo -e "${RED}❌ $service_name: Unhealthy${NC}"
    elif [ "$health_status" = "starting" ]; then
        echo -e "${YELLOW}🔄 $service_name: Starting (health check in progress)${NC}"
    elif [ "$state" = "running" ]; then
        echo -e "${BLUE}ℹ️  $service_name: Running (no health check configured)${NC}"
    else
        echo -e "${RED}💀 $service_name: $state${NC}"
    fi
}

# Function to get service logs tail
show_service_logs() {
    local service_name=$1
    local lines=${2:-5}
    echo -e "${BLUE}📋 Last $lines log lines for $service_name:${NC}"
    docker compose logs --tail=$lines $service_name 2>/dev/null | sed 's/^/   /'
    echo ""
}

# Check all services
echo "🔍 Service Health Status:"
echo ""

services=("mongo" "tileserver-gl" "nominatim" "service-proxy" "app")

for service in "${services[@]}"; do
    check_service_health $service
done

echo ""
echo "📊 Overall Service Status:"
docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Health}}\t{{.Ports}}"

echo ""
echo "🔧 Quick Actions:"
echo "  View detailed logs: docker compose logs [service-name]"
echo "  Restart service:    docker compose restart [service-name]"
echo "  Check health:       docker compose ps"
echo "  Full restart:       docker compose down && docker compose up -d"

# Option to show logs for unhealthy services
read -p "Show logs for unhealthy services? (y/N): " show_logs
if [[ $show_logs =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔍 Checking for unhealthy services..."
    
    for service in "${services[@]}"; do
        health_status=$(docker compose ps --format json 2>/dev/null | jq -r ".[] | select(.Name==\"$service\") | .Health")
        if [ "$health_status" = "unhealthy" ] || [ "$health_status" = "starting" ]; then
            show_service_logs $service 10
        fi
    done
fi
