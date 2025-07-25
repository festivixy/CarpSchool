#!/bin/bash

# OpenMapTiles build utilities for Carpool app
# Provides reusable OpenMapTiles build operations

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
CYAN='\033[1;36m'
NC='\033[0m' # No Color

# Function to handle openmaptiles repository
omt_handle_repository() {
    if [ -d "openmaptiles" ]; then
        if ui_ask_yes_no "The openmaptiles repo already exists. Do you want to re-clone it?" "N"; then
            echo -e "${BLUE}[INFO]${NC} Re-cloning openmaptiles"
            rm -rf openmaptiles
            git clone https://github.com/openmaptiles/openmaptiles.git
        else
            echo -e "${BLUE}[INFO]${NC} Using existing openmaptiles repo"
        fi
    else
        echo -e "${BLUE}[INFO]${NC} cloning openmaptiles"
        git clone https://github.com/openmaptiles/openmaptiles.git
    fi
}

# Function to set build configuration
omt_set_configuration() {
    local area=${1:-"north-america/canada/british-columbia"}
    local max_zoom=${2:-"14"}
    local min_zoom=${3:-"1"}
    local mbtiles_file=${4:-"tiles.mbtiles"}
    
    export area="$area"
    export MAX_ZOOM="$max_zoom"
    export MIN_ZOOM="$min_zoom"
    export MBTILES_FILE="$mbtiles_file"
    
    echo -e "using MBTILES_FILE: $MBTILES_FILE"
    echo -e "using area: $area"
    echo -e "using MAX_ZOOM: $MAX_ZOOM"
    echo -e "using MIN_ZOOM: $MIN_ZOOM"
}

# Function to prepare build environment
omt_prepare_environment() {
    echo -e "${BLUE}[INFO]${NC} entering openmaptiles directory"
    cd openmaptiles

    echo -e "${BLUE}[INFO]${NC} pulling docker images"
    docker compose pull

    make init-dirs

    echo -e "${BLUE}[INFO]${NC} Cleaning previous build files"
    make clean

    echo -e "${BLUE}[INFO]${NC} Generating new build files"
    make

    echo -e "${BLUE}[INFO]${NC} Starting database"
    make start-db
}

# Function to download and import data
omt_import_data() {
    local mbtiles_file="$1"
    local area="$2"
    
    rm -f "./data/$mbtiles_file"
    echo -e "${GREEN}[DATA]${NC} Downloading area: $area"
    make download
    
    echo -e "${BLUE}[INFO]${NC} Importing data"
    make import-data
    
    echo -e "${BLUE}[INFO]${NC} Importing OSM"
    make import-osm
    
    echo -e "${BLUE}[INFO]${NC} Importing SQL"
    make import-sql
    
    echo -e "${BLUE}[INFO]${NC} Importing wikidata"
    make import-wikidata
}

# Function to backup wikidata
omt_backup_wikidata() {
    echo -e "${BLUE}[INFO]${NC} Backing up wikidata cache"
    
    # Create backup directory for wikidata files
    mkdir -p ./data/wikidata-backup
    
    # Copy the wikidata cache file if it exists
    if [ -f "./cache/wikidata-cache.json" ]; then
        cp "./cache/wikidata-cache.json" "./data/wikidata-backup/"
        echo -e "${GREEN}[BACKUP]${NC} Saved wikidata-cache.json"
    fi
    
    # Download Nominatim-compatible wikidata importance rankings
    if [ ! -f "./data/wikidata-backup/wikimedia-importance.sql.gz" ]; then
        echo -e "${CYAN}[DOWNLOAD]${NC} Downloading Nominatim-compatible wikidata importance rankings"
        wget -q --show-progress -O "./data/wikidata-backup/wikimedia-importance.sql.gz" \
            "https://www.nominatim.org/data/wikimedia-importance.sql.gz" || \
            echo -e "${RED}[WARNING]${NC} Failed to download wikimedia-importance.sql.gz"
    fi
}

# Function to generate bounding box
omt_generate_bbox() {
    local area="$1"
    local min_zoom="$2"
    local max_zoom="$3"
    
    if [[ "$(source .env ; echo -e "$BBOX")" = "-180.0,-85.0511,180.0,85.0511" ]]; then
        if [[ "$area" != "planet" ]]; then
            echo -e "${CYAN}[ZOOM]${NC} Compute bounding box for tile generation"
            make generate-bbox-file ${min_zoom:+MIN_ZOOM="${min_zoom}"} ${max_zoom:+MAX_ZOOM="${max_zoom}"}
        else
            echo -e "${CYAN}[ZOOM]${NC} Skipping bbox calculation when generating the entire planet"
        fi
    else
        echo -e "${CYAN}[ZOOM]${NC} Bounding box is set in .env file"
    fi
}

# Function to generate tiles and build styles
omt_generate_tiles_and_styles() {
    echo -e "${BLUE}[INFO]${NC} Generating tiles from PostGIS"
    make generate-tiles-pg

    echo -e "${BLUE}[INFO]${NC} Downloading map fonts"
    make download-fonts
    
    echo -e "${BLUE}[INFO]${NC} Building map styles"
    make build-style
}

# Function to cleanup build environment
omt_cleanup_environment() {
    echo -e "${BLUE}[INFO]${NC} Stopping database"
    make stop-db
    
    if ui_ask_yes_no "Do you want to remove Docker images?" "N"; then
        echo -e "${BLUE}[INFO]${NC} Shutting down docker compose"
        docker compose down -v
        echo -e "${BLUE}[INFO]${NC} Removing docker images"
        make remove-docker-images
    else
        echo -e "${BLUE}[INFO]${NC} Skipping removal of docker images"
    fi
}

# Function to copy build outputs
omt_copy_outputs() {
    echo -e "${BLUE}[INFO]${NC} Creating output directories"
    mkdir -p ../openmaptilesdata/data
    mkdir -p ../openmaptilesdata/style
    mkdir -p ../openmaptilesdata/build

    echo -e "${BLUE}[INFO]${NC} Copying data, style, and build outputs"
    cp -r ./data ../openmaptilesdata
    cp -r ./style ../openmaptilesdata
    cp -r ./build ../openmaptilesdata
    
    echo -e "${GREEN}[WIKIDATA]${NC} Wikidata files available in: ../openmaptilesdata/data/wikidata-backup/"
    echo -e "${GREEN}[COMPLETE]${NC} OpenMapTiles build completed successfully!"
}

# Function to create tarball and chunks
omt_create_tarball() {
    if ui_ask_yes_no "Do you want to create a tarball chunks of the built data?" "N"; then
        echo -e "${BLUE}[INFO]${NC} Creating tarball of the built data"
        cd ..
        tar -czf openmaptilesdata.tar.gz openmaptilesdata
        echo -e "${GREEN}[COMPLETE]${NC} Tarball created: openmaptilesdata.tar.gz"
        
        echo -e "${BLUE}[INFO]${NC} Creating chunks directory and moving tarball"
        mkdir -p openmaptilesdata/tarballs/chunks
        mv openmaptilesdata.tar.gz openmaptilesdata/tarballs/openmaptilesdata.tar.gz
        
        split -b 256M openmaptilesdata/tarballs/openmaptilesdata.tar.gz \
            openmaptilesdata/tarballs/chunks/openmaptilesdata.tar.gz. \
            --additional-suffix=.part -a 3 --numeric-suffixes
            
        find openmaptilesdata/tarballs/chunks -maxdepth 1 -type f ! -name 'chunks.txt' -exec basename {} \; \
            > openmaptilesdata/tarballs/chunks/chunks.txt
            
        echo -e "${GREEN}[COMPLETE]${NC} Chunks created successfully"
        cd openmaptiles
    else
        echo -e "${BLUE}[INFO]${NC} Skipping tarball creation"
    fi
}

# Function to wait for Nominatim startup
omt_wait_for_nominatim() {
    echo -e "to see build logs, run 'docker compose logs -f nominatim-dev'"
    
    # Wait for Nominatim to finish starting up
    while true; do
        if docker compose logs nominatim-dev --no-color --no-log-prefix | grep -q "Application startup complete."; then
            echo -e "${GREEN}[SUCCESS]${NC} Nominatim application startup complete!"
            break
        else
            echo -e "${YELLOW}[WAIT]${NC} Waiting for Nominatim to start (database prep/build)... (retrying in 10s)"
            sleep 10
        fi
    done
}

# Function to handle Nominatim build
omt_build_nominatim() {
    if ui_ask_yes_no "Do you want to build Nominatim database?" "N"; then
        docker compose up nominatim-dev -d
        omt_wait_for_nominatim
        
        echo -e "${BLUE}[INFO]${NC} stopping Nominatim."
        docker compose stop nominatim-dev
        echo -e "${BLUE}[INFO]${NC} Nominatim stopped."
        
        echo -e "${BLUE}[INFO]${NC} Creating tarball of the built data"
        cd ..
        tar -czf pgdataNominatimInternal.tar.gz pgdataNominatimInternal
        mv pgdataNominatimInternal.tar.gz "openmaptilesdata/tarballs/"
        echo -e "${GREEN}[COMPLETE]${NC} Tarball created: pgdataNominatimInternal.tar.gz"

        if ui_ask_yes_no "Do you want to split (chunk) the tarball?" "N"; then
            echo -e "${BLUE}[INFO]${NC} Splitting tarball into 256MB chunks"
            mkdir -p openmaptilesdata/tarballs/pgdataNominatimInternal.tar.gz.chunks
            
            split -b 256M openmaptilesdata/tarballs/pgdataNominatimInternal.tar.gz \
                openmaptilesdata/tarballs/pgdataNominatimInternal.tar.gz.chunks/pgdataNominatimInternal.tar.gz. \
                --additional-suffix=.part -a 3 --numeric-suffixes
                
            find openmaptilesdata/tarballs/pgdataNominatimInternal.tar.gz.chunks -maxdepth 1 -type f ! -name 'chunks.txt' -exec basename {} \; \
                > openmaptilesdata/tarballs/pgdataNominatimInternal.tar.gz.chunks/chunks.txt
                
            echo -e "${GREEN}[COMPLETE]${NC} Chunking complete."
        else
            echo -e "${BLUE}[INFO]${NC} Skipping chunking"
        fi
        cd openmaptiles
    else
        echo -e "${BLUE}[INFO]${NC} Skipping building nominatim"
    fi
}
