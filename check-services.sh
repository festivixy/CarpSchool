#!/bin/bash

echo "🔍 Checking Docker Services Health..."
echo "======================================"

# Function to check if a service is responding
check_service() {
  local name=$1
  local url=$2
  local expected_status=${3:-200}
  
  echo -n "Checking $name ($url)... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  
  if [ "$response" = "$expected_status" ]; then
    echo "✅ OK (HTTP $response)"
  else
    echo "❌ Failed (HTTP $response)"
  fi
}

# Check Tileserver (should be available on port 8082)
echo "📍 Tileserver Services:"
check_service "Tileserver Health" "http://localhost:8082/health" 200
check_service "Tileserver Styles" "http://localhost:8082/styles" 200
check_service "Tileserver Data" "http://localhost:8082/data" 200

echo ""

# Check Nominatim (should be available on port 8080)
echo "🗺️  Nominatim Services:"
check_service "Nominatim Status" "http://localhost:8080/status" 200
check_service "Nominatim Search" "http://localhost:8080/search?q=Vancouver&format=json&limit=1" 200

echo ""

# Check main app (should be available on port 3000)
echo "🚗 Main Application:"
check_service "App Health" "http://localhost:3000" 200

echo ""
echo "🐳 Docker Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "network=carpool_carpool_network"

echo ""
echo "📊 Port Usage Summary:"
echo "- Port 3000: Main Meteor Application"
echo "- Port 8080: Nominatim (Geocoding Service)"
echo "- Port 8081: Mongo Express (Admin Interface)"
echo "- Port 8082: Tileserver-GL (Map Tiles)"
echo "- Port 8083: Nominatim-Dev (Development/Manual Profile)"
