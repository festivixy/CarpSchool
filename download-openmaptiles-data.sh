#!/bin/bash

# OpenMapTiles Data Download Script
# Downloads chunks.txt for OpenMapTiles data releases with robust input handling
#
# Environment Variables:
#   READ_TIMEOUT           - Input timeout in seconds (default: 10s)
#   CARPOOL_NONINTERACTIVE - Set to '1' for non-interactive mode
#
# Features:
#   - Interactive selection of OpenMapTiles data releases
#   - Configurable input timeout (default: 10 seconds)
#   - Non-interactive mode support for automated setups
#   - Maximum 3 retry attempts for invalid user input
#   - Automatic fallback to defaults when stdin unavailable
#   - Support for custom release names
#
# Examples:
#   ./download-openmaptiles-data.sh                    # Interactive mode
#   READ_TIMEOUT=30 ./download-openmaptiles-data.sh    # 30 second timeout
#   CARPOOL_NONINTERACTIVE=1 ./download-openmaptiles-data.sh  # Automated mode

set -e

# Source utility modules
source "./tools/map-utils.sh"
source "./tools/ui-utils.sh"
source "./tools/download-utils.sh"
source "./tools/nominatim-utils.sh"

ui_show_header "OpenMapTiles Data Download Script" "Downloads chunks.txt for OpenMapTiles data releases"

# Ask if user wants to download OpenMapTiles data
echo "Do you want to download OpenMapTiles data? (y/N)"
if ui_ask_yes_no "Download OpenMapTiles data?" "N"; then
    echo ""
    echo "Please select the data release you want to download:"
    echo ""
    echo "1) omt.ca.bc - OpenMapTiles Canada BC data"
    echo "2) omt.ca - OpenMapTiles Canada (entire country) data"
    echo "3) custom - Enter custom release name"
    echo ""

    # Get user choice with validation
    choice=$(ui_prompt_with_validation "Enter your choice (1-3): " "1 2 3" "Invalid choice. Please enter 1, 2, or 3.")

    # Debug: Show what choice was captured
    echo "Debug: Choice captured = '$choice'"

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
            if map_prompt_custom_release; then
                echo "Selected: Custom release '$RELEASE'"
            else
                echo "Failed to get custom release name"
                exit 1
            fi
            ;;
        *)
            echo "Debug: Unmatched choice = '$choice' (length: ${#choice})"
            echo "Debug: Choice in hex:"
            echo -n "$choice" | xxd
            echo "No valid choice matched. Exiting."
            exit 1
            ;;
    esac

    echo ""
    echo "Release set to: $RELEASE"
    echo "Debug: RELEASE variable = '$RELEASE'"
    echo ""

    # Create target directory structure
    TARGET_DIR="openmaptilesdata/tarballs/chunks"
    map_create_target_dir "$TARGET_DIR"

    # Check download tool availability
    if ! map_check_download_tool; then
        exit 1
    fi

    # Download chunks.txt file
    DOWNLOAD_URL="https://github.com/zlc1004/Carpool/releases/download/${RELEASE}/chunks.txt"
    TARGET_FILE="$TARGET_DIR/chunks.txt"

    if ! map_download_file "$DOWNLOAD_URL" "$TARGET_FILE" "$DOWNLOAD_TOOL"; then
        echo "  - Release name '$RELEASE' exists"
        exit 1
    fi

    # Display file information and download chunks
    if download_show_file_info "$TARGET_FILE"; then
        # Download all chunks listed in the file
        download_chunks_from_file "$TARGET_FILE" "$RELEASE" "$TARGET_DIR" "$DOWNLOAD_TOOL"
        failed_downloads=$?

        # Concatenate chunk parts into final tar.gz file
        if [[ $failed_downloads -eq 0 ]]; then
            final_archive="openmaptilesdata/tarballs/openmaptilesdata.tar.gz"

            if download_concatenate_chunks "$TARGET_DIR" "$final_archive" "openmaptilesdata.tar.gz.*.part"; then

                # Ask user if they want to extract the archive
                if ui_ask_yes_no "Do you want to extract the archive now?" "N"; then
                    if download_extract_archive "$final_archive" "openmaptilesdata" "1"; then
                        echo ""
                        echo "OpenMapTiles data is now ready for use in: openmaptilesdata/"
                    fi
                else
                    echo ""
                    echo "Archive not extracted. You can extract it later with:"
                    echo "  mkdir -p openmaptilesdata"
                    echo "  tar -xzf $final_archive -C openmaptilesdata/ --strip-components=1"
                fi

                echo ""
                echo "Cleanup options:"
                echo ""

                # Ask if user wants to delete the entire tarballs directory
                echo "This will remove the final archive and all downloaded chunks."
                if ui_ask_yes_no "Do you want to delete the tarballs directory (openmaptilesdata/tarballs)?" "N"; then
                    echo ""
                    echo "Deleting openmaptilesdata/tarballs/..."
                    if rm -rf openmaptilesdata/tarballs/; then
                        echo "✓ Tarballs directory deleted successfully"
                    else
                        echo "✗ Failed to delete tarballs directory"
                    fi
                else
                    # If not deleting tarballs, ask about chunks only
                    echo ""
                    echo "This will keep the final archive but remove the individual chunk files."
                    if ui_ask_yes_no "Do you want to delete just the chunks directory (openmaptilesdata/tarballs/chunks)?" "N"; then
                        echo ""
                        echo "Deleting openmaptilesdata/tarballs/chunks/..."
                        if rm -rf openmaptilesdata/tarballs/chunks/; then
                            echo "✓ Chunks directory deleted successfully"
                            echo "Final archive preserved at: $final_archive"
                        else
                            echo "✗ Failed to delete chunks directory"
                        fi
                    else
                        echo ""
                        echo "No cleanup performed. All files preserved:"
                        echo "  - Final archive: $final_archive"
                        echo "  - Individual chunks: openmaptilesdata/tarballs/chunks/"
                    fi
                fi
            fi
        fi

        echo ""
        echo "You can now use these OpenMapTiles data chunks for processing."
    else
        exit 1
    fi
else
    echo ""
    echo "Skipping OpenMapTiles data download."
    echo ""

    # Still need download tool for potential Nominatim setup
    if ! map_check_download_tool; then
        echo "Note: Download tool needed for optional Nominatim setup"
    fi
fi

# Handle Nominatim database download
nominatim_setup "$DOWNLOAD_TOOL"
