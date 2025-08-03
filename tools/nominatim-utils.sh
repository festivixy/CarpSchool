#!/bin/bash

# Nominatim utilities for Carpool app
# Provides reusable Nominatim database operations

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to prompt for Nominatim download
nominatim_prompt_download() {
    echo ""
    echo "Do you want to download a Nominatim database backup? (y/N)"
    local download_nominatim
    echo -n "Download Nominatim database? (y/N): "

    if read -r download_nominatim; then
        case "${download_nominatim,,}" in
            y|yes)
                return 0
                ;;
            *)
                echo "Skipping Nominatim database download."
                return 1
                ;;
        esac
    else
        echo "Failed to read input, skipping Nominatim database download."
        return 1
    fi
}

# Function to prompt for Nominatim database choice
nominatim_prompt_database_choice() {
    echo "Which Nominatim database do you want to download?"
    echo "1) nominatim.pgsql.ca.bc (British Columbia)"
    echo "2) nominatim.pgsql.ca (Canada)"

    local max_attempts=3
    local attempts=0
    local nominatim_choice

    while [ $attempts -lt $max_attempts ]; do
        echo -n "Enter your choice (1-2): "
        if read -r nominatim_choice; then
            case "$nominatim_choice" in
                1)
                    NOMINATIM_RELEASE="nominatim.pgsql.ca.bc"
                    return 0
                ;;
                2)
                    NOMINATIM_RELEASE="nominatim.pgsql.ca"
                    return 0
                ;;
                *)
                    echo "Invalid choice. Please enter 1 or 2."
                    attempts=$((attempts + 1))
                ;;
            esac
        else
            echo "Failed to read input (attempt $((attempts + 1))/$max_attempts)"
            attempts=$((attempts + 1))
        fi
    done

    echo "Failed to get valid choice after $max_attempts attempts"
    return 1
}

# Function to download Nominatim chunks
nominatim_download_chunks() {
    local release="$1"
    local download_tool="$2"
    local github_base_url="${3:-https://github.com/zlc1004/Carpool}"

    local nominatim_dir="openmaptilesdata/tarballs/pgdataNominatimInternal.tar.gz.chunks"
    local nominatim_chunks_url="${github_base_url}/releases/download/${release}/chunks.txt"
    local nominatim_chunks_file="$nominatim_dir/nominatim_chunks.txt"

    echo "Downloading Nominatim chunks.txt from: $nominatim_chunks_url"
    mkdir -p "$nominatim_dir"

    # Download chunks.txt
    case "$download_tool" in
        "curl")
            curl -L -f --progress-bar -o "$nominatim_chunks_file" "$nominatim_chunks_url"
            ;;
        "wget")
            wget --progress=bar:force -O "$nominatim_chunks_file" "$nominatim_chunks_url"
            ;;
        *)
            echo "✗ Error: Invalid download tool"
            return 1
            ;;
    esac

    # Download individual chunks
    echo "Reading nominatim_chunks.txt and downloading tarball chunks..."
    local total_chunks=$(wc -l < "$nominatim_chunks_file")
    local current_chunk=0

    for chunk_filename in $(cat "$nominatim_chunks_file"); do
        current_chunk=$((current_chunk + 1))
        echo "[$current_chunk/$total_chunks] Downloading: $chunk_filename"

        local chunk_url="${github_base_url}/releases/download/${release}/${chunk_filename}"
        local chunk_target="$nominatim_dir/$chunk_filename"

        case "$download_tool" in
            "curl")
                curl -L -f --progress-bar -o "$chunk_target" "$chunk_url"
                ;;
            "wget")
                wget --progress=bar:force -O "$chunk_target" "$chunk_url"
                ;;
        esac
    done

    NOMINATIM_CHUNKS_DIR="$nominatim_dir"
    return 0
}

# Function to combine and extract Nominatim database
nominatim_combine_and_extract() {
    local chunks_dir="$1"

    echo "Combining Nominatim database chunks..."
    local nominatim_tarball="openmaptilesdata/tarballs/pgdataNominatimInternal.tar.gz"
    cat "$chunks_dir"/pgdataNominatimInternal.tar.gz.*.part > "$nominatim_tarball"

    echo "Extracting Nominatim database to pgdataNominatimInternal..."
    mkdir -p pgdataNominatimInternal
    tar -xzf "$nominatim_tarball" -C pgdataNominatimInternal --strip-components=1
}

# Function to fix Nominatim permissions
nominatim_fix_permissions() {
    echo "Fixing permissions in the container..."
    docker compose run --rm nominatim chown -R postgres:postgres /var/lib/postgresql/16/main
    docker compose run --rm nominatim chmod 0700 /var/lib/postgresql/16/main
    echo "Nominatim database is ready."
}

# Function to handle complete Nominatim setup
nominatim_setup() {
    local download_tool="$1"
    local github_base_url="${2:-https://github.com/zlc1004/Carpool}"

    if nominatim_prompt_download; then
        if nominatim_prompt_database_choice; then
            if nominatim_download_chunks "$NOMINATIM_RELEASE" "$download_tool" "$github_base_url"; then
                nominatim_combine_and_extract "$NOMINATIM_CHUNKS_DIR"
                nominatim_fix_permissions
            else
                echo "Failed to download Nominatim chunks"
                return 1
            fi
        else
            echo "Failed to get Nominatim database choice"
            return 1
        fi
    fi
}
