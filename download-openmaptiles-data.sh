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
    esac

    echo ""
    echo "Release set to: $RELEASE"
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

# Handle OSRM data download
echo ""
if ui_ask_yes_no "Do you want to download OSRM routing data?" "N"; then
    echo ""
    echo "Please select the OSRM data release you want to download:"
    echo ""
    echo "1) osrm.ca.bc - OSRM Canada BC routing data"
    echo "2) osrm.ca - OSRM Canada (entire country) routing data"
    echo ""

    # Get user choice with validation
    osrm_choice=$(ui_prompt_with_validation "Enter your choice (1-2): " "1 2" "Invalid choice. Please enter 1 or 2.")

    # Set OSRM_RELEASE variable based on choice
    case $osrm_choice in
        1)
            OSRM_RELEASE="osrm.ca.bc"
            echo "Selected: OSRM Canada BC routing data"
            ;;
        2)
            OSRM_RELEASE="osrm.ca"
            echo "Selected: OSRM Canada (entire country) routing data"
            ;;
    esac

    echo ""
    echo "OSRM Release set to: $OSRM_RELEASE"
    echo ""

    # Create target directory structure for OSRM
    OSRM_TARGET_DIR="osrmdata/tarballs/chunks"
    map_create_target_dir "$OSRM_TARGET_DIR"

    # Check download tool availability
    if ! map_check_download_tool; then
        exit 1
    fi

    # Download OSRM chunks.txt file
    OSRM_DOWNLOAD_URL="https://github.com/zlc1004/Carpool/releases/download/${OSRM_RELEASE}/chunks.txt"
    OSRM_TARGET_FILE="$OSRM_TARGET_DIR/chunks.txt"

    if ! map_download_file "$OSRM_DOWNLOAD_URL" "$OSRM_TARGET_FILE" "$DOWNLOAD_TOOL"; then
        echo "  - OSRM Release name '$OSRM_RELEASE' exists"
        exit 1
    fi

    # Display file information and download OSRM chunks
    if download_show_file_info "$OSRM_TARGET_FILE"; then
        # Download all chunks listed in the file
        download_chunks_from_file "$OSRM_TARGET_FILE" "$OSRM_RELEASE" "$OSRM_TARGET_DIR" "$DOWNLOAD_TOOL"
        osrm_failed_downloads=$?

        # Concatenate chunk parts into final tar.gz file
        if [[ $osrm_failed_downloads -eq 0 ]]; then
            osrm_final_archive="osrmdata/tarballs/osrmdata.tar.gz"

            if download_concatenate_chunks "$OSRM_TARGET_DIR" "$osrm_final_archive" "osrmdata.tar.gz.*.part"; then

                # Ask user if they want to extract the OSRM archive
                if ui_ask_yes_no "Do you want to extract the OSRM archive now?" "Y"; then
                    if download_extract_archive "$osrm_final_archive" "osrmdata" "1"; then
                        echo ""
                        echo "OSRM routing data is now ready for use in: osrmdata/"
                    fi
                else
                    echo ""
                    echo "OSRM archive not extracted. You can extract it later with:"
                    echo "  mkdir -p osrmdata"
                    echo "  tar -xzf $osrm_final_archive -C osrmdata/ --strip-components=1"
                fi

                echo ""
                echo "OSRM cleanup options:"
                echo ""

                # Ask if user wants to delete the OSRM tarballs directory
                echo "This will remove the final OSRM archive and all downloaded chunks."
                if ui_ask_yes_no "Do you want to delete the OSRM tarballs directory (osrmdata/tarballs)?" "N"; then
                    echo ""
                    echo "Deleting osrmdata/tarballs/..."
                    if rm -rf osrmdata/tarballs/; then
                        echo "✓ OSRM tarballs directory deleted successfully"
                    else
                        echo "✗ Failed to delete OSRM tarballs directory"
                    fi
                else
                    # If not deleting tarballs, ask about chunks only
                    echo ""
                    echo "This will keep the final OSRM archive but remove the individual chunk files."
                    if ui_ask_yes_no "Do you want to delete just the OSRM chunks directory (osrmdata/tarballs/chunks)?" "N"; then
                        echo ""
                        echo "Deleting osrmdata/tarballs/chunks/..."
                        if rm -rf osrmdata/tarballs/chunks/; then
                            echo "✓ OSRM chunks directory deleted successfully"
                            echo "Final OSRM archive preserved at: $osrm_final_archive"
                        else
                            echo "✗ Failed to delete OSRM chunks directory"
                        fi
                    else
                        echo ""
                        echo "No OSRM cleanup performed. All files preserved:"
                        echo "  - Final OSRM archive: $osrm_final_archive"
                        echo "  - Individual chunks: osrmdata/tarballs/chunks/"
                    fi
                fi
            fi
        fi

        echo ""
        echo "You can now use this OSRM routing data with the build-osrm.sh script."
    else
        exit 1
    fi
else
    echo ""
    echo "Skipping OSRM data download."
fi

# Handle Nominatim database download
nominatim_setup "$DOWNLOAD_TOOL"
