#!/bin/bash

# OpenMapTiles Data Download Script
# Downloads chunks.txt for OpenMapTiles data releases

set -e

echo "============================================"
echo "OpenMapTiles Data Download Script"
echo "============================================"
echo ""
echo "Please select the data release you want to download:"
echo ""
echo "1) omt.ca.bc - OpenMapTiles Canada BC data"
echo "2) omt.ca - OpenMapTiles Canada (entire country) data"
echo "3) custom - Enter custom release name"
echo ""

# Function to validate user input
validate_choice() {
    case $1 in
        1|2|3)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Get user choice
while true; do
    read -p "Enter your choice (1-3): " choice

    if validate_choice "$choice"; then
        break
    else
        echo "Invalid choice. Please enter 1, 2, or 3."
    fi
done

# Set RELEASE variable based on choice
case $choice in
    1)
        RELEASE="omt.ca.bc"
        echo "Selected: OpenMapTiles Canada BC data"
        ;;
    2)
        RELEASE="omt.ca"
        echo "Selected: OpenMapTiles Canada (entire country) data"
        ;;
    3)
        while true; do
            read -p "Enter custom release name: " custom_release
            if [[ -n "$custom_release" && "$custom_release" =~ ^[a-zA-Z0-9._-]+$ ]]; then
                RELEASE="$custom_release"
                echo "Selected: Custom release '$RELEASE'"
                break
            else
                echo "Invalid release name. Please use only alphanumeric characters, dots, hyphens, and underscores."
            fi
        done
        ;;
esac

echo ""
echo "Release set to: $RELEASE"
echo ""

# Create target directory structure
TARGET_DIR="openmaptilesdata/tarballs/chunks"
echo "Creating directory structure: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Download URL
DOWNLOAD_URL="https://github.com/zlc1004/Carpool/releases/download/${RELEASE}/chunks.txt"
TARGET_FILE="$TARGET_DIR/chunks.txt"

echo "Downloading from: $DOWNLOAD_URL"
echo "Saving to: $TARGET_FILE"
echo ""

# Download the chunks.txt file
if command -v curl &> /dev/null; then
    echo "Using curl to download..."
    if curl -L -f --progress-bar -o "$TARGET_FILE" "$DOWNLOAD_URL"; then
        echo "✓ Download completed successfully!"
    else
        echo "✗ Download failed. Please check:"
        echo "  - Internet connection"
        echo "  - Release name '$RELEASE' exists"
        echo "  - URL: $DOWNLOAD_URL"
        exit 1
    fi
elif command -v wget &> /dev/null; then
    echo "Using wget to download..."
    if wget --progress=bar:force -O "$TARGET_FILE" "$DOWNLOAD_URL"; then
        echo "✓ Download completed successfully!"
    else
        echo "✗ Download failed. Please check:"
        echo "  - Internet connection"
        echo "  - Release name '$RELEASE' exists"
        echo "  - URL: $DOWNLOAD_URL"
        exit 1
    fi
else
    echo "✗ Error: Neither curl nor wget is available."
    echo "Please install curl or wget to download files."
    exit 1
fi

# Display file information
if [[ -f "$TARGET_FILE" ]]; then
    file_size=$(du -h "$TARGET_FILE" | cut -f1)
    echo ""
    echo "File downloaded successfully:"
    echo "  Location: $TARGET_FILE"
    echo "  Size: $file_size"
    echo ""

    # Function to draw progress bar
    draw_progress_bar() {
        local current=$1
        local total=$2
        local width=50
        local percentage=$((current * 100 / total))
        local filled=$((current * width / total))
        local empty=$((width - filled))

        printf "\r["
        printf "%*s" "$filled" | tr ' ' '█'
        printf "%*s" "$empty" | tr ' ' '░'
        printf "] %d%% (%d/%d)" "$percentage" "$current" "$total"
    }

    # Read chunks.txt and download each tarball chunk
    echo "Reading chunks.txt and downloading tarball chunks..."
    echo ""

    # Count total chunks for progress tracking
    total_chunks=$(wc -l < "$TARGET_FILE")
    current_chunk=0
    successful_downloads=0
    failed_downloads=0

    echo "Found $total_chunks chunks to download"
    echo ""

    # Read each line and download the corresponding chunk
    while IFS= read -r chunk_filename; do
        # Skip empty lines
        [[ -z "$chunk_filename" ]] && continue

        current_chunk=$((current_chunk + 1))

        # Show overall progress
        draw_progress_bar "$current_chunk" "$total_chunks"
        echo ""
        echo "Downloading: $chunk_filename"

        # Build download URL and target path
        chunk_url="https://github.com/zlc1004/Carpool/releases/download/${RELEASE}/${chunk_filename}"
        chunk_target="$TARGET_DIR/$chunk_filename"

        # Download the chunk with progress bar
        if command -v curl &> /dev/null; then
            if curl -L -f --progress-bar -o "$chunk_target" "$chunk_url"; then
                successful_downloads=$((successful_downloads + 1))
                echo "✓ Downloaded successfully"
            else
                failed_downloads=$((failed_downloads + 1))
                echo "✗ Failed to download"
            fi
        elif command -v wget &> /dev/null; then
            if wget --progress=bar:force -O "$chunk_target" "$chunk_url"; then
                successful_downloads=$((successful_downloads + 1))
                echo "✓ Downloaded successfully"
            else
                failed_downloads=$((failed_downloads + 1))
                echo "✗ Failed to download"
            fi
        fi
        echo ""
    done < "$TARGET_FILE"

    echo ""
    echo "============================================"
    echo "Download Summary:"
    echo "============================================"
    echo "Total chunks: $total_chunks"
    echo "Successfully downloaded: $successful_downloads"
    echo "Failed downloads: $failed_downloads"
    echo ""

    if [[ $failed_downloads -eq 0 ]]; then
        echo "✓ All chunks downloaded successfully!"
        echo "All files are saved in: $TARGET_DIR"
    else
        echo "⚠ Some downloads failed. You may want to retry or check:"
        echo "  - Internet connection stability"
        echo "  - Release '$RELEASE' contains all listed chunks"
        echo "  - Available disk space"
    fi

    echo ""

    # Concatenate chunk parts into final tar.gz file
    if [[ $successful_downloads -gt 0 ]]; then
        echo ""
        echo "============================================"
        echo "Concatenating chunk parts into final archive..."
        echo "============================================"
        final_archive="openmaptilesdata/tarballs/openmaptilesdata.tar.gz"

        # Create target directory for final archive
        mkdir -p "openmaptilesdata/tarballs"

        # Show progress spinner during concatenation
        echo -n "Processing chunks "

        # Concatenate all .part files in order
        cat openmaptilesdata/tarballs/chunks/openmaptilesdata.tar.gz.*.part > "$final_archive" 2>/dev/null &
        cat_pid=$!

        # Show spinner while concatenating
        spin_chars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
        while kill -0 $cat_pid 2>/dev/null; do
            for (( i=0; i<${#spin_chars}; i++ )); do
                echo -ne "\r${spin_chars:$i:1} Concatenating chunks... "
                sleep 0.1
            done
        done
        wait $cat_pid
        concat_result=$?
        echo ""

        if [[ $concat_result -eq 0 ]]; then
            final_size=$(du -h "$final_archive" | cut -f1)
            echo "✓ Successfully created final archive:"
            echo "  Location: $final_archive"
            echo "  Size: $final_size"
            echo ""

            # Ask user if they want to extract the archive
            echo "Do you want to extract the archive now? (y/N)"
            read -p "Extract to openmaptilesdata/: " extract_choice

            case "${extract_choice,,}" in
                y|yes)
                    echo ""
                    echo "Extracting archive to openmaptilesdata/..."

                    # Create extraction directory
                    mkdir -p openmaptilesdata

                    # Extract the archive with progress indication
                    echo -n "Extracting "
                    tar -xzf "$final_archive" -C openmaptilesdata/ &
                    tar_pid=$!

                    # Show spinner while extracting
                    spin_chars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
                    while kill -0 $tar_pid 2>/dev/null; do
                        for (( i=0; i<${#spin_chars}; i++ )); do
                            echo -ne "\r${spin_chars:$i:1} Extracting archive... "
                            sleep 0.1
                        done
                    done
                    wait $tar_pid
                    extract_result=$?
                    echo ""

                    if [[ $extract_result -eq 0 ]]; then
                        echo "✓ Archive extracted successfully to openmaptilesdata/"
                        echo ""
                        echo "OpenMapTiles data is now ready for use in: openmaptilesdata/"
                    else
                        echo "✗ Failed to extract archive. You can extract it manually with:"
                        echo "  tar -xzf $final_archive -C openmaptilesdata/"
                    fi
                    ;;
                *)
                    echo ""
                    echo "Archive not extracted. You can extract it later with:"
                    echo "  mkdir -p openmaptilesdata"
                    echo "  tar -xzf $final_archive -C openmaptilesdata/"
                    ;;
            esac

            echo ""
            echo "Cleanup options:"
            echo ""

            # Ask if user wants to delete the entire tarballs directory
            echo "Do you want to delete the tarballs directory (openmaptilesdata/tarballs)? (y/N)"
            echo "This will remove the final archive and all downloaded chunks."
            read -p "Delete tarballs/: " delete_tarballs

            case "${delete_tarballs,,}" in
                y|yes)
                    echo ""
                    echo "Deleting openmaptilesdata/tarballs/..."
                    if rm -rf openmaptilesdata/tarballs/; then
                        echo "✓ Tarballs directory deleted successfully"
                    else
                        echo "✗ Failed to delete tarballs directory"
                    fi
                    ;;
                *)
                    # If not deleting tarballs, ask about chunks only
                    echo ""
                    echo "Do you want to delete just the chunks directory (openmaptilesdata/tarballs/chunks)? (y/N)"
                    echo "This will keep the final archive but remove the individual chunk files."
                    read -p "Delete chunks/: " delete_chunks

                    case "${delete_chunks,,}" in
                        y|yes)
                            echo ""
                            echo "Deleting openmaptilesdata/tarballs/chunks/..."
                            if rm -rf openmaptilesdata/tarballs/chunks/; then
                                echo "✓ Chunks directory deleted successfully"
                                echo "Final archive preserved at: $final_archive"
                            else
                                echo "✗ Failed to delete chunks directory"
                            fi
                            ;;
                        *)
                            echo ""
                            echo "No cleanup performed. All files preserved:"
                            echo "  - Final archive: $final_archive"
                            echo "  - Individual chunks: openmaptilesdata/tarballs/chunks/"
                            ;;
                    esac
                    ;;
            esac
        else
            echo "✗ Failed to concatenate chunk parts. Please check:"
            echo "  - All required .part files are present"
            echo "  - Sufficient disk space available"
            echo "  - File permissions"
        fi
    fi

    echo ""
    echo "You can now use these OpenMapTiles data chunks for processing."
else
    echo "✗ Error: Download completed but file not found at expected location."
    exit 1
fi

# Ask if user wants to download Nominatim database
echo ""
echo "Do you want to download a Nominatim database backup? (y/N)"
read -p "Download Nominatim database? (y/N): " download_nominatim
case "${download_nominatim,,}" in
  y|yes)
    echo "Which Nominatim database do you want to download?"
    echo "1) nominatim.pgsql.ca.bc (British Columbia)"
    echo "2) nominatim.pgsql.ca (Canada)"
    while true; do
      read -p "Enter your choice (1-2): " nominatim_choice
      if [[ "$nominatim_choice" == "1" ]]; then
        NOMINATIM_RELEASE="nominatim.pgsql.ca.bc"
        break
      elif [[ "$nominatim_choice" == "2" ]]; then
        NOMINATIM_RELEASE="nominatim.pgsql.ca"
        break
      else
        echo "Invalid choice. Please enter 1 or 2."
      fi
    done

    NOMINATIM_DIR="openmaptilesdata/tarballs/pgdataNominatimInternal.tar.gz.chunks"
    NOMINATIM_CHUNKS_URL="https://github.com/zlc1004/Carpool/releases/download/${NOMINATIM_RELEASE}/chunks.txt"
    NOMINATIM_CHUNKS_FILE="$NOMINATIM_DIR/nominatim_chunks.txt"
    echo "Downloading Nominatim chunks.txt from: $NOMINATIM_CHUNKS_URL"
    mkdir -p "$NOMINATIM_DIR"
    if command -v curl &> /dev/null; then
      curl -L -f --progress-bar -o "$NOMINATIM_CHUNKS_FILE" "$NOMINATIM_CHUNKS_URL"
    elif command -v wget &> /dev/null; then
      wget --progress=bar:force -O "$NOMINATIM_CHUNKS_FILE" "$NOMINATIM_CHUNKS_URL"
    else
      echo "✗ Error: Neither curl nor wget is available."
      exit 1
    fi
    echo "Reading nominatim_chunks.txt and downloading tarball chunks..."
    total_chunks=$(wc -l < "$NOMINATIM_CHUNKS_FILE")
    current_chunk=0
    for chunk_filename in $(cat "$NOMINATIM_CHUNKS_FILE"); do
      current_chunk=$((current_chunk + 1))
      echo "[$current_chunk/$total_chunks] Downloading: $chunk_filename"
      chunk_url="https://github.com/zlc1004/Carpool/releases/download/${NOMINATIM_RELEASE}/${chunk_filename}"
      chunk_target="$NOMINATIM_DIR/$chunk_filename"
      if command -v curl &> /dev/null; then
        curl -L -f --progress-bar -o "$chunk_target" "$chunk_url"
      elif command -v wget &> /dev/null; then
        wget --progress=bar:force -O "$chunk_target" "$chunk_url"
      fi
    done
    echo "Combining Nominatim database chunks..."
    NOMINATIM_TARBALL="openmaptilesdata/tarballs/pgdataNominatimInternal.tar.gz"
    cat $NOMINATIM_DIR/pgdataNominatimInternal.tar.gz.*.part > "$NOMINATIM_TARBALL"
    echo "Extracting Nominatim database to pgdataNominatimInternal..."
    mkdir -p pgdataNominatimInternal
    tar -xzf "$NOMINATIM_TARBALL" -C pgdataNominatimInternal --strip-components=1
    echo "Fixing permissions in the container..."
    docker compose run --rm nominatim-dev chown -R postgres:postgres /var/lib/postgresql/16/main
    docker compose run --rm nominatim-dev chmod 0700 /var/lib/postgresql/16/main
    echo "Nominatim database is ready."
    ;;
  *)
    echo "Skipping Nominatim database download."
    ;;
esac