#!/bin/bash
set -euo pipefail

# Check if both arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 user@host remote/path"
    exit 1
fi

REMOTE_TARGET="$1"
REMOTE_PATH="$2"
LOCAL_FILE="./build/app.tar.gz"

HEALTH_URL="http://127.0.0.1:3000/health"
HEALTH_RETRIES=60
HEALTH_INTERVAL=5

if [ ! -f "$LOCAL_FILE" ]; then
    echo "Error: $LOCAL_FILE not found. Build it first."
    exit 1
fi

LOCAL_SHA256=$(sha256sum "$LOCAL_FILE" | awk '{print $1}')

# 1. Create the remote directory structure
echo "Ensuring remote directory exists..."
ssh "$REMOTE_TARGET" "mkdir -p \"$REMOTE_PATH/build\""

# 2. Upload the file as app.tar.gz.new, then verify its checksum remotely
echo "Uploading $LOCAL_FILE to $REMOTE_TARGET:$REMOTE_PATH/build/app.tar.gz.new"
scp "$LOCAL_FILE" "$REMOTE_TARGET:$REMOTE_PATH/build/app.tar.gz.new"

echo "Verifying remote checksum..."
REMOTE_SHA256=$(ssh "$REMOTE_TARGET" "sha256sum \"$REMOTE_PATH/build/app.tar.gz.new\" | awk '{print \$1}'")

if [ "$LOCAL_SHA256" != "$REMOTE_SHA256" ]; then
    echo "Error: checksum mismatch after upload (local=$LOCAL_SHA256 remote=$REMOTE_SHA256)."
    ssh "$REMOTE_TARGET" "rm -f \"$REMOTE_PATH/build/app.tar.gz.new\""
    exit 1
fi
echo "Checksum verified: $LOCAL_SHA256"

# 3. Swap in the new bundle, keeping the old one for rollback
ssh "$REMOTE_TARGET" "cd \"$REMOTE_PATH\" && docker compose down"
ssh "$REMOTE_TARGET" "cd \"$REMOTE_PATH/build\" && rm -f app.tar.gz.old && ([ -f app.tar.gz ] && mv app.tar.gz app.tar.gz.old || true) && mv app.tar.gz.new app.tar.gz"
ssh "$REMOTE_TARGET" "cd \"$REMOTE_PATH\" && docker compose up -d"

# 4. Health check with rollback on failure
echo "Waiting for the app to become healthy..."
healthy=false
for _ in $(seq 1 "$HEALTH_RETRIES"); do
    if ssh "$REMOTE_TARGET" "curl --silent --fail --output /dev/null \"$HEALTH_URL\""; then
        healthy=true
        break
    fi
    sleep "$HEALTH_INTERVAL"
done

if [ "$healthy" = true ]; then
    echo "Done!"
else
    echo "Health check failed after deploy; rolling back..."
    ssh "$REMOTE_TARGET" "cd \"$REMOTE_PATH\" && docker compose down"
    ssh "$REMOTE_TARGET" "cd \"$REMOTE_PATH/build\" && [ -f app.tar.gz.old ] && mv app.tar.gz.old app.tar.gz || true"
    ssh "$REMOTE_TARGET" "cd \"$REMOTE_PATH\" && docker compose up -d"
    echo "Rolled back to the previous build. Investigate the new build before retrying."
    exit 1
fi
