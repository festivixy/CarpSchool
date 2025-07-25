#!/bin/bash

# Download utilities for Carpool app
# Provides reusable download and archive operations

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to draw progress bar
download_draw_progress_bar() {
    local current="$1"
    local total="$2"
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))

    printf "\r["
    printf "%*s" "$filled" | tr ' ' '█'
    printf "%*s" "$empty" | tr ' ' '░'
    printf "] %d%% (%d/%d)" "$percentage" "$current" "$total"
}

# Function to display file information
download_show_file_info() {
    local file_path="$1"
    
    if [[ -f "$file_path" ]]; then
        local file_size=$(du -h "$file_path" | cut -f1)
        echo ""
        echo "File downloaded successfully:"
        echo "  Location: $file_path"
        echo "  Size: $file_size"
        echo ""
        return 0
    else
        echo "✗ Error: Download completed but file not found at expected location."
        return 1
    fi
}

# Function to download chunks from a chunks.txt file
download_chunks_from_file() {
    local chunks_file="$1"
    local release="$2"
    local target_dir="$3"
    local download_tool="$4"
    
    echo "Reading chunks.txt and downloading tarball chunks..."
    echo ""

    # Count total chunks for progress tracking
    local total_chunks=$(wc -l < "$chunks_file")
    local current_chunk=0
    local successful_downloads=0
    local failed_downloads=0

    echo "Found $total_chunks chunks to download"
    echo ""

    # Read each line and download the corresponding chunk
    while IFS= read -r chunk_filename; do
        # Skip empty lines
        [[ -z "$chunk_filename" ]] && continue

        current_chunk=$((current_chunk + 1))

        # Show overall progress
        download_draw_progress_bar "$current_chunk" "$total_chunks"
        echo ""
        echo "Downloading: $chunk_filename"

        # Build download URL and target path
        local chunk_url="https://github.com/zlc1004/Carpool/releases/download/${release}/${chunk_filename}"
        local chunk_target="$target_dir/$chunk_filename"

        # Download the chunk
        if download_single_chunk "$chunk_url" "$chunk_target" "$download_tool"; then
            successful_downloads=$((successful_downloads + 1))
            echo "✓ Downloaded successfully"
        else
            failed_downloads=$((failed_downloads + 1))
            echo "✗ Failed to download"
        fi
        echo ""
    done < "$chunks_file"

    download_show_summary "$total_chunks" "$successful_downloads" "$failed_downloads" "$release"
    return $failed_downloads
}

# Function to download a single chunk
download_single_chunk() {
    local url="$1"
    local target="$2"
    local tool="$3"
    
    case "$tool" in
        "curl")
            curl -L -f --progress-bar -o "$target" "$url"
            ;;
        "wget")
            wget --progress=bar:force -O "$target" "$url"
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to show download summary
download_show_summary() {
    local total="$1"
    local successful="$2"
    local failed="$3"
    local release="$4"
    
    echo ""
    echo "============================================"
    echo "Download Summary:"
    echo "============================================"
    echo "Total chunks: $total"
    echo "Successfully downloaded: $successful"
    echo "Failed downloads: $failed"
    echo ""

    if [[ $failed -eq 0 ]]; then
        echo "✓ All chunks downloaded successfully!"
        echo "All files are saved in the target directory"
    else
        echo "⚠ Some downloads failed. You may want to retry or check:"
        echo "  - Internet connection stability"
        echo "  - Release '$release' contains all listed chunks"
        echo "  - Available disk space"
    fi
    echo ""
}

# Function to show spinner animation
download_show_spinner() {
    local pid="$1"
    local message="$2"
    local spin_chars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
    
    while kill -0 $pid 2>/dev/null; do
        for (( i=0; i<${#spin_chars}; i++ )); do
            echo -ne "\r${spin_chars:$i:1} $message... "
            sleep 0.1
        done
    done
    echo ""
}

# Function to concatenate chunks into final archive
download_concatenate_chunks() {
    local chunks_dir="$1"
    local final_archive="$2"
    local pattern="$3"
    
    echo ""
    echo "============================================"
    echo "Concatenating chunk parts into final archive..."
    echo "============================================"
    
    # Create target directory for final archive
    mkdir -p "$(dirname "$final_archive")"

    # Show progress spinner during concatenation
    echo -n "Processing chunks "

    # Concatenate all .part files in order
    cat "$chunks_dir"/$pattern > "$final_archive" 2>/dev/null &
    local cat_pid=$!

    # Show spinner while concatenating
    download_show_spinner $cat_pid "Concatenating chunks"
    wait $cat_pid
    local concat_result=$?

    if [[ $concat_result -eq 0 ]]; then
        local final_size=$(du -h "$final_archive" | cut -f1)
        echo "✓ Successfully created final archive:"
        echo "  Location: $final_archive"
        echo "  Size: $final_size"
        echo ""
        return 0
    else
        echo "✗ Failed to concatenate chunk parts. Please check:"
        echo "  - All required .part files are present"
        echo "  - Sufficient disk space available"
        echo "  - File permissions"
        return 1
    fi
}

# Function to extract archive with spinner
download_extract_archive() {
    local archive_path="$1"
    local extract_dir="$2"
    local strip_components="$3"
    
    echo ""
    echo "Extracting archive to $extract_dir..."

    # Create extraction directory
    mkdir -p "$extract_dir"

    # Extract the archive with progress indication
    echo -n "Extracting "
    if [[ -n "$strip_components" ]]; then
        tar -xzf "$archive_path" -C "$extract_dir" --strip-components="$strip_components" &
    else
        tar -xzf "$archive_path" -C "$extract_dir" &
    fi
    local tar_pid=$!

    # Show spinner while extracting
    download_show_spinner $tar_pid "Extracting archive"
    wait $tar_pid
    local extract_result=$?

    if [[ $extract_result -eq 0 ]]; then
        echo "✓ Archive extracted successfully to $extract_dir"
        return 0
    else
        echo "✗ Failed to extract archive. You can extract it manually with:"
        if [[ -n "$strip_components" ]]; then
            echo "  tar -xzf $archive_path -C $extract_dir --strip-components=$strip_components"
        else
            echo "  tar -xzf $archive_path -C $extract_dir"
        fi
        return 1
    fi
}
