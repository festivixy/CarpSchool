#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

if [ -d "openmaptiles" ]; then
  read -p $'\033[1;33m[STEP]\033[0m The openmaptiles repo already exists. Do you want to re-clone it? (y/n): ' yn
  case $yn in
    [Yy]* )
      echo -e "\033[1;34m[INFO]\033[0m Re-cloning openmaptiles"
      rm -rf openmaptiles
      git clone https://github.com/openmaptiles/openmaptiles.git
      ;;
    * )
      echo -e "\033[1;34m[INFO]\033[0m Using existing openmaptiles repo"
      ;;
  esac
else
  echo -e "\033[1;34m[INFO]\033[0m cloning openmaptiles"
  git clone https://github.com/openmaptiles/openmaptiles.git
fi

area="north-america/canada/british-columbia"
MAX_ZOOM=18
MIN_ZOOM=1
MBTILES_FILE=tiles.mbtiles
export area="north-america/canada/british-columbia"
export MAX_ZOOM=14
export MIN_ZOOM=1
export MBTILES_FILE=tiles.mbtiles

echo -e "using MBTILES_FILE: $MBTILES_FILE"
echo -e "using area: $area"
echo -e "using MAX_ZOOM: $MAX_ZOOM"
echo -e "using MIN_ZOOM: $MIN_ZOOM"

echo -e "\033[1;34m[INFO]\033[0m entering openmaptiles directory"
cd openmaptiles

echo -e "\033[1;34m[INFO]\033[0m pulling docker images"

docker compose pull

make init-dirs

echo -e "\033[1;34m[INFO]\033[0m Cleaning previous build files"
make clean

echo -e "\033[1;34m[INFO]\033[0m Generating new build files"
make

echo -e "\033[1;34m[INFO]\033[0m Starting database"
make start-db


rm -f "./data/$MBTILES_FILE"
echo -e "\033[1;32m[DATA]\033[0m Downloading area: north-america/canada/british-columbia"
make download
echo -e "\033[1;34m[INFO]\033[0m Importing data"
make import-data
echo -e "\033[1;34m[INFO]\033[0m Importing OSM"
make import-osm
echo -e "\033[1;34m[INFO]\033[0m Importing SQL"
make import-sql
echo -e "\033[1;34m[INFO]\033[0m Importing wikidata"
make import-wikidata
echo -e "\033[1;34m[INFO]\033[0m Backing up wikidata cache"
# Create backup directory for wikidata files
mkdir -p ./data/wikidata-backup
# Copy the wikidata cache file if it exists
if [ -f "./cache/wikidata-cache.json" ]; then
  cp "./cache/wikidata-cache.json" "./data/wikidata-backup/"
  echo -e "\033[1;32m[BACKUP]\033[0m Saved wikidata-cache.json"
fi
# Also download Nominatim-compatible wikidata importance rankings
if [ ! -f "./data/wikidata-backup/wikimedia-importance.sql.gz" ]; then
  echo -e "\033[1;36m[DOWNLOAD]\033[0m Downloading Nominatim-compatible wikidata importance rankings"
  wget -q --show-progress -O "./data/wikidata-backup/wikimedia-importance.sql.gz" \
    "https://www.nominatim.org/data/wikimedia-importance.sql.gz" || echo -e "\033[1;31m[WARNING]\033[0m Failed to download wikimedia-importance.sql.gz"
fi
# echo -e "\033[1;34m[INFO]\033[0m Analyzing database"
# make analyze-db
# echo -e "\033[1;34m[INFO]\033[0m Testing performance (null)"
# make test-perf-null

if [[ "$(source .env ; echo -e "$BBOX")" = "-180.0,-85.0511,180.0,85.0511" ]]; then
  if [[ "$area" != "planet" ]]; then
    echo -e "\033[1;36m[ZOOM]\033[0m Compute bounding box for tile generation"
    make generate-bbox-file ${MIN_ZOOM:+MIN_ZOOM="${MIN_ZOOM}"} ${MAX_ZOOM:+MAX_ZOOM="${MAX_ZOOM}"}
  else
    echo -e "\033[1;36m[ZOOM]\033[0m Skipping bbox calculation when generating the entire planet"
  fi

else
  echo -e "\033[1;36m[ZOOM]\033[0m Bounding box is set in .env file"
fi

echo -e "\033[1;34m[INFO]\033[0m Generating tiles from PostGIS"
make generate-tiles-pg

echo -e "\033[1;34m[INFO]\033[0m Downloading map fonts"
make download-fonts
echo -e "\033[1;34m[INFO]\033[0m Building map styles"
make build-style

echo -e "\033[1;34m[INFO]\033[0m Stopping database"
make stop-db
read -p $'\033[1;33m[STEP]\033[0m Do you want to remove Docker images? (y/n): ' yn
case $yn in
  [Yy]* )
    echo -e "\033[1;34m[INFO]\033[0m Shutting down docker compose"
    docker compose down -v
    echo -e "\033[1;34m[INFO]\033[0m Removing docker images"
    make remove-docker-images
    ;;
  * )
    echo -e "\033[1;34m[INFO]\033[0m Skipping removal of docker images"
    ;;
esac

echo -e "\033[1;34m[INFO]\033[0m Creating output directories"
mkdir -p ../openmaptilesdata/data
mkdir -p ../openmaptilesdata/style
mkdir -p ../openmaptilesdata/build

echo -e "\033[1;34m[INFO]\033[0m Copying data, style, and build outputs"
cp -r ./data ../openmaptilesdata
cp -r ./style ../openmaptilesdata
cp -r ./build ../openmaptilesdata
echo -e "\033[1;32m[WIKIDATA]\033[0m Wikidata files available in: ../openmaptilesdata/data/wikidata-backup/"
echo -e "\033[1;32m[COMPLETE]\033[0m OpenMapTiles build completed successfully! "

read -p $'\033[1;33m[STEP]\033[0m Do you want to create a tarball chunks of the built data? (y/n): ' yn
case $yn in
  [Yy]* )
    echo -e "\033[1;34m[INFO]\033[0m Creating tarball of the built data"
    cd ..
    tar -czf openmaptilesdata.tar.gz openmaptilesdata
    echo -e "\033[1;32m[COMPLETE]\033[0m Tarball created: openmaptilesdata.tar.gz"
    echo -e "\033[1;34m[INFO]\033[0m Creating chunks directory and moving tarball"
    mkdir -p openmaptilesdata/tarballs/chunks
    mv openmaptilesdata.tar.gz openmaptilesdata/tarballs/openmaptilesdata.tar.gz
    split -b 256M openmaptilesdata/tarballs/openmaptilesdata.tar.gz openmaptilesdata/tarballs/chunks/openmaptilesdata.tar.gz. --additional-suffix=.part -a 3 --numeric-suffixes
    find openmaptilesdata/tarballs/chunks -maxdepth 1 -type f ! -name 'chunks.txt' -exec basename {} \; > openmaptilesdata/tarballs/chunks/chunks.txt
    ;;
  * )
    echo -e "\033[1;34m[INFO]\033[0m Skipping tarball creation"
    ;;
esac
