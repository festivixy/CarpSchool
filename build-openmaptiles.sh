#!/bin/bash

# Build OpenMapTiles data and tiles
# This script builds OpenMapTiles data using the openmaptiles/openmaptiles repository

set -o errexit
set -o pipefail
set -o nounset

# Source utility modules
source "./tools/ui-utils.sh"
source "./tools/openmaptiles-utils.sh"

# Configuration
AREA="north-america/canada/british-columbia"
MAX_ZOOM="14"
MIN_ZOOM="1"
MBTILES_FILE="tiles.mbtiles"

# Step 1: Handle repository setup
omt_handle_repository

# Step 2: Set build configuration
omt_set_configuration "$AREA" "$MAX_ZOOM" "$MIN_ZOOM" "$MBTILES_FILE"

# Step 3: Prepare build environment
omt_prepare_environment

# Step 4: Download and import data
omt_import_data "$MBTILES_FILE" "$AREA"

# Step 5: Backup wikidata
omt_backup_wikidata

# Step 6: Generate bounding box
omt_generate_bbox "$AREA" "$MIN_ZOOM" "$MAX_ZOOM"

# Step 7: Generate tiles and build styles
omt_generate_tiles_and_styles

# Step 8: Cleanup environment
omt_cleanup_environment

# Step 9: Copy outputs
omt_copy_outputs

# Step 10: Create tarball and chunks
omt_create_tarball

# Step 11: Build Nominatim database
omt_build_nominatim
