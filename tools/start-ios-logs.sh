#!/bin/bash

echo "🍎 iOS Safari Console Log Monitor"
echo "=================================="
echo ""

# Check if ios_webkit_debug_proxy is installed
if ! command -v ios_webkit_debug_proxy &> /dev/null; then
    echo "❌ ios_webkit_debug_proxy not found. Install with:"
    echo "   brew install ios-webkit-debug-proxy"
    exit 1
fi

# Check if proxy is already running
if lsof -ti:9221 > /dev/null; then
    echo "✅ ios_webkit_debug_proxy already running on port 9221"
else
    echo "🚀 Starting ios_webkit_debug_proxy..."
    ios_webkit_debug_proxy -c null:9221 -d &
    PROXY_PID=$!
    echo "📡 Debug proxy started (PID: $PROXY_PID)"
    sleep 2
fi

echo ""
echo "🎯 Starting iOS Log Server..."
echo "   Server will run on: http://localhost:9220"
echo "   Logs endpoint: http://localhost:9220/api/logs"
echo ""
echo "📱 Make sure your iOS app is running in simulator!"
echo "   Then use: curl http://localhost:9220/api/logs"
echo ""

# Start the log server
cd "$(dirname "$0")"
node ios-log-server.js
