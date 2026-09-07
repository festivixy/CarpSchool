#!/bin/bash
set -euo pipefail

# Update and redeploy the production server bundle, with a rollback to the
# previous build if the app fails its health check afterwards.

BUILD_DIR="../build"
HEALTH_URL="http://127.0.0.1:3000/health"
HEALTH_RETRIES=60
HEALTH_INTERVAL=5

docker compose down

git pull

# Keep the previous bundle so we can roll back to it
if [ -d "$BUILD_DIR" ]; then
    rm -rf "${BUILD_DIR}.old"
    mv "$BUILD_DIR" "${BUILD_DIR}.old"
fi

meteor build "$BUILD_DIR" --architecture "os.linux.x86_64" --server-only --verbose

docker compose up -d

echo "Waiting for the app to become healthy..."
healthy=false
for _ in $(seq 1 "$HEALTH_RETRIES"); do
    if curl --silent --fail --output /dev/null "$HEALTH_URL"; then
        healthy=true
        break
    fi
    sleep "$HEALTH_INTERVAL"
done

if [ "$healthy" = true ]; then
    echo "✅ Deployment healthy."
    rm -rf "${BUILD_DIR}.old"
else
    echo "❌ Health check failed after deploy; rolling back to previous build."
    docker compose down
    rm -rf "$BUILD_DIR"
    if [ -d "${BUILD_DIR}.old" ]; then
        mv "${BUILD_DIR}.old" "$BUILD_DIR"
    fi
    docker compose up -d
    echo "Rolled back. Investigate the new build before retrying."
    exit 1
fi
