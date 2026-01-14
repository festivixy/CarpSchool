#!/bin/bash

# Check if both arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 user@host remote/path"
    exit 1
fi

REMOTE_TARGET=$1
REMOTE_PATH=$2
LOCAL_FILE="./build/app.tar.gz"

# 1. Create the remote directory structure
# We use escaped quotes to ensure the remote shell sees the path as a single argument
echo "Ensuring remote directory exists..."
ssh "$REMOTE_TARGET" "mkdir -p \"$REMOTE_PATH/build\""

# 2. Upload the file
if [ $? -eq 0 ]; then
    echo "Uploading $LOCAL_FILE to $REMOTE_TARGET:$REMOTE_PATH/build/"
    scp "$LOCAL_FILE" $REMOTE_TARGET:$REMOTE_PATH/build/
else
    echo "Error: Could not create remote directory. Skipping upload."
    exit 1
fi

echo "Done!"