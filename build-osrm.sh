#!/bin/bash

# OSRM Build Script
# Builds OSRM routing data from OpenMapTiles PBF files

set -e

# Source utility modules
source "./tools/ui-utils.sh"
source "./tools/docker-utils.sh"
source "./tools/map-utils.sh"
source "./tools/fs-utils.sh"
source "./tools/download-utils.sh"

ui_show_header "OSRM Build Script" "Builds OSRM routing data from OpenMapTiles PBF files"

# Configuration
OSRM_DATA_DIR="osrmdata/data"
OSRM_BASE_DIR="osrmdata"
DEFAULT_PBF_PATH="openmaptilesdata/data/north-america/canada/british-columbia.osm.pbf"
DEFAULT_REGION="british-columbia"

# Function to check if PBF file exists
osrm_check_pbf_file() {
    local pbf_path="$1"

    if [[ ! -f "$pbf_path" ]]; then
        echo -e "${RED}❌ PBF file not found: $pbf_path${NC}"
        echo ""
        echo "You need OpenMapTiles data with PBF files before building OSRM."
        echo "Available options:"
        echo "1. Run './download-openmaptiles-data.sh' to download pre-built data"
        echo "2. Run './build-openmaptiles.sh' to build from scratch"
        echo ""
        return 1
    fi

    local file_size=$(du -h "$pbf_path" | cut -f1)
    echo -e "${GREEN}✓ Found PBF file: $pbf_path ($file_size)${NC}"
    return 0
}

# Function to prompt for PBF file selection
osrm_prompt_pbf_selection() {
    local choice
    local max_attempts=3
    local attempts=0

    while [ $attempts -lt $max_attempts ]; do
        echo "" >&2
        echo "Please choose the PBF file source:" >&2
        echo "" >&2
        echo "1) Use default BC data: $DEFAULT_PBF_PATH" >&2
        echo "2) Enter custom PBF file path" >&2
        echo "3) Browse available PBF files in openmaptilesdata/" >&2
        echo "" >&2
        echo -n "Enter your choice (1-3): " >&2

        if read -r choice; then
            case $choice in
                1)
                    PBF_PATH="$DEFAULT_PBF_PATH"
                    REGION="$DEFAULT_REGION"
                    return 0
                    ;;
                2)
                    echo "" >&2
                    echo -n "Enter full path to PBF file: " >&2
                    local custom_pbf
                    if read -r custom_pbf; then
                        # Extract region name from filename
                        PBF_PATH="$custom_pbf"
                        REGION=$(basename "$custom_pbf" .osm.pbf)
                        return 0
                    else
                        echo "Failed to read PBF file path" >&2
                        attempts=$((attempts + 1))
                    fi
                    ;;
                3)
                    echo "" >&2
                    echo "Available PBF files:" >&2
                    find openmaptilesdata/ -name "*.osm.pbf" -type f 2>/dev/null >&2 || echo "No PBF files found in openmaptilesdata/" >&2
                    echo "" >&2
                    echo -n "Enter path to selected PBF file: " >&2
                    local selected_pbf
                    if read -r selected_pbf; then
                        PBF_PATH="$selected_pbf"
                        REGION=$(basename "$selected_pbf" .osm.pbf)
                        return 0
                    else
                        echo "Failed to read PBF file path" >&2
                        attempts=$((attempts + 1))
                    fi
                    ;;
                *)
                    echo "Invalid choice. Please enter 1, 2, or 3." >&2
                    attempts=$((attempts + 1))
                    ;;
            esac
        else
            echo "Failed to read choice selection (attempt $((attempts + 1))/$max_attempts)" >&2
            attempts=$((attempts + 1))
        fi
    done

    echo "Failed to get PBF selection after $max_attempts attempts" >&2
    return 1
}

# Function to run OSRM Docker command with error handling
osrm_run_docker_command() {
    local command="$1"
    local description="$2"
    local input_file="$3"

    echo ""
    echo -e "${YELLOW}🔄 $description...${NC}"
    echo -e "${BLUE}Command: $command${NC}"

    if eval "$command"; then
        echo -e "${GREEN}✓ $description completed successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ $description failed${NC}"
        return 1
    fi
}

# Function to setup OSRM data directory
osrm_setup_data_dir() {
    local pbf_path="$1"
    local region="$2"

    echo ""
    echo -e "${YELLOW}📁 Setting up OSRM data directory...${NC}"

    # Create OSRM data directory with -p flag
    if mkdir -p "$OSRM_DATA_DIR"; then
        echo -e "${GREEN}✓ Created directory: $OSRM_DATA_DIR${NC}"
    else
        echo -e "${RED}❌ Failed to create directory: $OSRM_DATA_DIR${NC}"
        return 1
    fi

    # Verify source file exists
    if [[ ! -f "$pbf_path" ]]; then
        echo -e "${RED}❌ Source PBF file not found: $pbf_path${NC}"
        return 1
    fi

    # Copy PBF file to OSRM data directory
    local target_pbf="$OSRM_DATA_DIR/$region.osm.pbf"
    echo -e "${BLUE}Copying PBF file: $pbf_path → $target_pbf${NC}"

    if cp "$pbf_path" "$target_pbf"; then
        echo -e "${GREEN}✓ PBF file copied successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to copy PBF file from $pbf_path to $target_pbf${NC}"
        echo -e "${RED}   Check file permissions and disk space${NC}"
        return 1
    fi
}

# Function to run OSRM processing pipeline
osrm_run_pipeline() {
    local region="$1"

    echo ""
    echo -e "${CYAN}🚀 Starting OSRM processing pipeline for: $region${NC}"
    echo ""

    # Step 1: Extract
    local extract_cmd="docker run -t -v \"./$OSRM_DATA_DIR:/data\" ghcr.io/project-osrm/osrm-backend osrm-extract -p /opt/car.lua /data/$region.osm.pbf"
    if ! osrm_run_docker_command "$extract_cmd" "OSRM Extract (parsing OSM data)" "$region.osm.pbf"; then
        echo -e "${RED}❌ OSRM extract step failed${NC}"
        return 1
    fi

    # Step 2: Partition
    local partition_cmd="docker run -t -v \"./$OSRM_DATA_DIR:/data\" ghcr.io/project-osrm/osrm-backend osrm-partition /data/$region.osrm"
    if ! osrm_run_docker_command "$partition_cmd" "OSRM Partition (creating routing graph)" "$region.osrm"; then
        echo -e "${RED}❌ OSRM partition step failed${NC}"
        return 1
    fi

    # Step 3: Customize
    local customize_cmd="docker run -t -v \"./$OSRM_DATA_DIR:/data\" ghcr.io/project-osrm/osrm-backend osrm-customize /data/$region.osrm"
    if ! osrm_run_docker_command "$customize_cmd" "OSRM Customize (optimizing for routing)" "$region.osrm"; then
        echo -e "${RED}❌ OSRM customize step failed${NC}"
        return 1
    fi

    echo ""
    echo -e "${GREEN}🎉 OSRM processing pipeline completed successfully!${NC}"
    return 0
}

# Function to show OSRM files summary
osrm_show_summary() {
    local region="$1"

    echo ""
    echo "============================================"
    echo "OSRM Build Summary"
    echo "============================================"
    echo "Region: $region"
    echo "Data directory: $OSRM_DATA_DIR/"
    echo ""
    echo "Generated files:"

    # List all OSRM-related files
    find "$OSRM_DATA_DIR" -name "$region.*" -type f | while read file; do
        local size=$(du -h "$file" | cut -f1)
        echo "  $(basename "$file") ($size)"
    done

    echo ""
    echo -e "${GREEN}✓ OSRM data is ready for routing server${NC}"
    echo ""
}

# Function to create tarball of OSRM data
osrm_create_tarball() {
    local region="$1"
    local tarball_dir="$OSRM_BASE_DIR/tarballs"
    local tarball_file="$tarball_dir/osrmdata-$region.tar.gz"

    echo ""
    echo -e "${YELLOW}📦 Creating OSRM data tarball...${NC}"

    # Create tarballs directory
    mkdir -p "$tarball_dir"

    # Remove british-columbia.osm.pbf before creating tarball
    if [[ -f "$OSRM_BASE_DIR/data/british-columbia.osm.pbf" ]]; then
        echo -e "${BLUE}Removing british-columbia.osm.pbf before creating tarball...${NC}"
        rm -f "$OSRM_BASE_DIR/data/british-columbia.osm.pbf"
        echo -e "${GREEN}✓ british-columbia.osm.pbf removed${NC}"
    fi

    # Create tarball with progress indication
    echo -n "Creating tarball "
    (cd "$OSRM_BASE_DIR" && tar -czf "tarballs/osrmdata-$region.tar.gz" data/) &
    local tar_pid=$!

    # Show spinner while creating tarball
    download_show_spinner $tar_pid "Creating tarball"
    wait $tar_pid
    local tar_result=$?

    if [[ $tar_result -eq 0 ]]; then
        local tarball_size=$(du -h "$tarball_file" | cut -f1)
        echo -e "${GREEN}✓ Tarball created successfully:${NC}"
        echo "  Location: $tarball_file"
        echo "  Size: $tarball_size"
        TARBALL_PATH="$tarball_file"
        return 0
    else
        echo -e "${RED}❌ Failed to create tarball${NC}"
        return 1
    fi
}

# Function to chunk the tarball
osrm_chunk_tarball() {
    local tarball_file="$1"
    local region="$2"
    local chunks_dir="$OSRM_BASE_DIR/tarballs/chunks"
    local chunk_size="256M"  # 256MB chunks

    echo ""
    echo -e "${YELLOW}🔄 Chunking tarball into $chunk_size pieces...${NC}"

    # Create chunks directory
    mkdir -p "$chunks_dir"

    # Split tarball into chunks
    echo -n "Splitting tarball "
    (cd "$chunks_dir" && split -b "$chunk_size" -d "../../tarballs/osrmdata-$region.tar.gz" "osrmdata-$region.tar.gz." --additional-suffix=.part -a 3 --numeric-suffixes) &
    local split_pid=$!

    # Show spinner while splitting
    download_show_spinner $split_pid "Splitting into chunks"
    wait $split_pid
    local split_result=$?

    if [[ $split_result -eq 0 ]]; then
        # Create chunks.txt file (no need to rename - split already added .part suffix)
        local chunks_txt="$chunks_dir/chunks.txt"
        ls "$chunks_dir"/osrmdata-$region.tar.gz.*.part | sed 's|.*/||' > "$chunks_txt"

        local chunk_count=$(wc -l < "$chunks_txt")
        echo -e "${GREEN}✓ Tarball chunked successfully:${NC}"
        echo "  Chunks: $chunk_count pieces"
        echo "  Location: $chunks_dir/"
        echo "  Chunks list: $chunks_txt"

        echo ""
        echo "Generated chunks:"
        cat "$chunks_txt" | head -5
        if [[ $chunk_count -gt 5 ]]; then
            echo "  ... and $((chunk_count - 5)) more chunks"
        fi
        find "$chunks_dir" -maxdepth 1 -type f ! -name 'chunks.txt' -exec basename {} \; \
                    > "$chunks_txt"
        return 0
    else
        echo -e "${RED}❌ Failed to chunk tarball${NC}"
        return 1
    fi
}

# Function to prompt for tarball creation
osrm_prompt_tarball() {
    local region="$1"

    echo ""
    echo "Tarball and chunking options:"
    echo ""
    echo "1) Create tarball only"
    echo "2) Create tarball and chunk it"
    echo "3) Skip tarball creation"
    echo ""

    choice=$(ui_prompt_with_validation "Enter your choice (1-3): " "1 2 3" "Invalid choice. Please enter 1, 2, or 3.")

    case $choice in
        1)
            if osrm_create_tarball "$region"; then
                echo ""
                echo -e "${GREEN}✓ Tarball creation completed${NC}"
            fi
            ;;
        2)
            if osrm_create_tarball "$region"; then
                if osrm_chunk_tarball "$TARBALL_PATH" "$region"; then
                    echo ""
                    echo -e "${GREEN}✓ Tarball and chunking completed${NC}"

                    # Ask about cleanup
                    echo ""
                    if ui_ask_yes_no "Do you want to delete the original tarball (keeping only chunks)?" "Y"; then
                        rm -f "$TARBALL_PATH"
                        echo -e "${GREEN}✓ Original tarball deleted${NC}"
                    fi
                fi
            fi
            ;;
        3)
            echo -e "${YELLOW}Skipping tarball creation${NC}"
            ;;
    esac
}

# Function to show integration information
osrm_show_integration_info() {
    local region="$1"

    echo ""
    echo "============================================"
    echo "OSRM Integration Information"
    echo "============================================"
    echo ""
    echo -e "${GREEN}✓ OSRM service is already configured in docker-compose.yml${NC}"
    echo -e "${BLUE}Port 5000 is mapped for OSRM routing API${NC}"
    echo ""
    echo "To use OSRM with the application:"
    echo "1. Make sure your region data matches the docker-compose configuration"
    echo "2. Run: docker compose up -d osrm"
    echo "3. Test the API: curl http://localhost:5000/health"
    echo ""

    if [[ "$region" != "british-columbia" ]]; then
        echo -e "${YELLOW}⚠️  Note: docker-compose.yml is configured for 'british-columbia'${NC}"
        echo -e "${YELLOW}   You may need to update the command in docker-compose.yml to use: $region.osrm${NC}"
        echo ""
    fi
}

# Function to show manual Docker command
osrm_show_manual_command() {
    local region="$1"

    echo ""
    echo "============================================"
    echo "Manual OSRM Server Commands"
    echo "============================================"
    echo ""
    echo "To start OSRM routing server manually:"
    echo ""
    echo "docker run -t -i -p 5000:5000 -v \"./$OSRM_DATA_DIR:/data\" \\"
    echo "  ghcr.io/project-osrm/osrm-backend osrm-routed --algorithm mld /data/$region.osrm"
    echo ""
    echo "To add to docker-compose.yml:"
    echo ""
    cat << 'EOF'
  osrm:
    image: ghcr.io/project-osrm/osrm-backend
    command: osrm-routed --algorithm mld /data/REGION.osrm
    ports:
      - "5000:5000"
    volumes:
      - ./osrmdata/data:/data
    restart: unless-stopped
EOF
    echo ""
    echo -e "${BLUE}Replace 'REGION' with: $region${NC}"
    echo ""
}

# Function to prompt for operation type
osrm_prompt_operation() {
    local choice

    while true; do
        echo ""
        echo "Please choose the operation to perform:"
        echo ""
        echo "1) Full OSRM build (extract, partition, customize)"
        echo "2) Full OSRM build + create tarball"
        echo "3) Full OSRM build + create tarball + chunk it"
        echo "4) Tar only (create tarball from existing OSRM data)"
        echo ""
        echo -n "Enter your choice (1-4): "

        if read -r choice; then
            case $choice in
                1|2|3|4)
                    OPERATION_CHOICE="$choice"
                    return 0
                    ;;
                *)
                    echo "Invalid choice. Please enter 1, 2, 3, or 4."
                    ;;
            esac
        else
            echo "Failed to read input. Please try again."
        fi
    done
}

# Main execution flow
main() {
    # Check if Docker is running
    docker_check_running

    # Get operation choice
    if ! osrm_prompt_operation; then
        echo "Failed to get operation choice"
        exit 1
    fi

    # Debug: Ensure operation choice is valid
    echo -e "${BLUE}Debug: Operation choice selected: '$OPERATION_CHOICE'${NC}"

    # Handle tar only option
    if [[ "$OPERATION_CHOICE" == "4" ]]; then
        echo ""
        echo -e "${CYAN}🗃️  Tar Only Mode - Creating tarball from existing OSRM data${NC}"

        # Check if OSRM data directory exists
        if [[ ! -d "$OSRM_DATA_DIR" ]]; then
            echo -e "${RED}❌ OSRM data directory not found: $OSRM_DATA_DIR${NC}"
            echo "You need to run the full OSRM build first to generate data."
            exit 1
        fi

        # Find existing region data
        local region_files=$(find "$OSRM_DATA_DIR" -name "*.osrm" -type f | head -1)
        if [[ -z "$region_files" ]]; then
            echo -e "${RED}❌ No OSRM data files (.osrm) found in $OSRM_DATA_DIR${NC}"
            echo "You need to run the full OSRM build first to generate data."
            exit 1
        fi

        # Extract region name from existing .osrm file
        local region=$(basename "$region_files" .osrm)
        echo -e "${GREEN}✓ Found existing OSRM data for region: $region${NC}"

        # Ask about tarball creation
        osrm_prompt_tarball "$region"

        echo ""
        echo -e "${GREEN}🎉 Tar only operation completed successfully!${NC}"
        exit 0
    fi

    # Continue with normal flow for options 1-3
    # Get PBF file and region info
    echo ""
    if ! osrm_prompt_pbf_selection; then
        echo "Failed to get PBF file selection"
        exit 1
    fi

    # Debug: Ensure region is not empty
    if [[ -z "$REGION" ]]; then
        echo -e "${YELLOW}⚠️  Region name is empty, using default: $DEFAULT_REGION${NC}"
        REGION="$DEFAULT_REGION"
    fi

    # Validate PBF file exists
    if ! osrm_check_pbf_file "$PBF_PATH"; then
        exit 1
    fi

    # Ask user if they want to proceed
    echo ""
    if ! ui_ask_yes_no "Proceed with OSRM build for region '$REGION'?" "Y"; then
        echo "Build cancelled by user."
        exit 0
    fi

    # Setup OSRM data directory and copy PBF file
    if osrm_setup_data_dir "$PBF_PATH" "$REGION"; then
        echo -e "${GREEN}✓ OSRM data directory setup completed${NC}"
    else
        echo -e "${RED}❌ Failed to setup OSRM data directory${NC}"
        exit 1
    fi

    # Debug: Ensure region is still valid before pipeline
    if [[ -z "$REGION" ]]; then
        echo -e "${RED}❌ Region variable is empty before pipeline${NC}"
        exit 1
    fi

    # Run OSRM processing pipeline
    echo -e "${BLUE}Debug: Running pipeline for region: '$REGION'${NC}"
    if ! osrm_run_pipeline "$REGION"; then
        echo ""
        echo -e "${RED}❌ OSRM build failed${NC}"
        echo "Check the error messages above for troubleshooting."
        exit 1
    fi

    # Show build summary
    osrm_show_summary "$REGION"

    # Handle tarball creation based on operation choice
    case $OPERATION_CHOICE in
        1)
            echo -e "${YELLOW}Skipping tarball creation (option 1 selected)${NC}"
            ;;
        2)
            if osrm_create_tarball "$REGION"; then
                echo ""
                echo -e "${GREEN}✓ Tarball creation completed${NC}"
            fi
            ;;
        3)
            if osrm_create_tarball "$REGION"; then
                if osrm_chunk_tarball "$TARBALL_PATH" "$REGION"; then
                    echo ""
                    echo -e "${GREEN}✓ Tarball and chunking completed${NC}"

                    # Ask about cleanup
                    echo ""
                    if ui_ask_yes_no "Do you want to delete the original tarball (keeping only chunks)?" "Y"; then
                        rm -f "$TARBALL_PATH"
                        echo -e "${GREEN}✓ Original tarball deleted${NC}"
                    fi
                fi
            fi
            ;;
    esac

    # Show integration information
    osrm_show_integration_info "$REGION"

    echo ""
    echo -e "${GREEN}🎉 OSRM build process completed successfully!${NC}"
    echo -e "${CYAN}Your OSRM routing data is ready to use.${NC}"
}

# Run main function
main "$@"
