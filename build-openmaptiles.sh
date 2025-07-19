git clone https://github.com/openmaptiles/openmaptiles.git

if [ -d "openmaptiles" ]; then
  read -p $'\033[1;33m[STEP]\033[0m The openmaptiles repo already exists. Do you want to re-clone it? (y/n): ' yn
  case $yn in
    [Yy]* )
      echo "\033[1;34m[INFO]\033[0m Re-cloning openmaptiles"
      rm -rf openmaptiles
      git clone https://github.com/openmaptiles/openmaptiles.git
      ;;
    * )
      echo "\033[1;34m[INFO]\033[0m Using existing openmaptiles repo"
      ;;
  esac
else
  echo "\033[1;34m[INFO]\033[0m cloning openmaptiles"
  git clone https://github.com/openmaptiles/openmaptiles.git
fi

echo "\033[1;34m[INFO]\033[0m entering openmaptiles directory"
cd openmaptiles

echo "\033[1;34m[INFO]\033[0m pulling docker images"

docker compose pull

echo "\033[1;33m[STEP]\033[0m Stopping running services & removing old containers"

make destroy-db 

echo "\033[1;34m[INFO]\033[0m downloading openmaptiles data"

make init-dirs
rm -f "./data/$MBTILES_FILE"
echo "\033[1;32m[DATA]\033[0m Downloading area: north-america/canada/british-columbia"
area="north-america/canada/british-columbia" make "download${osm_server:+-${osm_server}}"
echo "\033[1;34m[INFO]\033[0m Cleaning build"
make clean
echo "\033[1;34m[INFO]\033[0m Building all tiles"
make all
echo "\033[1;34m[INFO]\033[0m Starting database"
make start-db
echo "\033[1;34m[INFO]\033[0m Importing data"
make import-data
echo "\033[1;34m[INFO]\033[0m Importing OSM"
make import-osm
echo "\033[1;34m[INFO]\033[0m Importing SQL"
make import-sql
echo "\033[1;34m[INFO]\033[0m Analyzing database"
make analyze-db
# echo "\033[1;34m[INFO]\033[0m Testing performance (null)"
# make test-perf-null

if [[ "$(source .env ; echo "$BBOX")" = "-180.0,-85.0511,180.0,85.0511" ]]; then
  if [[ "$area" != "planet" ]]; then
    echo "\033[1;36m[ZOOM]\033[0m Compute bounding box for tile generation"
    make generate-bbox-file ${MIN_ZOOM:+MIN_ZOOM="${MIN_ZOOM}"} ${MAX_ZOOM:+MAX_ZOOM="${MAX_ZOOM}"}
  else
    echo "\033[1;36m[ZOOM]\033[0m Skipping bbox calculation when generating the entire planet"
  fi

else
  echo "\033[1;36m[ZOOM]\033[0m Bounding box is set in .env file"
fi

echo "\033[1;34m[INFO]\033[0m Generating tiles from PostGIS"
make generate-tiles-pg

echo "\033[1;34m[INFO]\033[0m Downloading map fonts"
make download-fonts
echo "\033[1;34m[INFO]\033[0m Building map styles"
make build-style

echo "\033[1;34m[INFO]\033[0m Stopping database"
rm -r ./data/fonts
make stop-db
echo "\033[1;34m[INFO]\033[0m Removing quickstart checklist"
rm -f ./data/quickstart_checklist.chk
read -p $'\033[1;33m[STEP]\033[0m Do you want to remove Docker images? (y/n): ' yn
case $yn in
  [Yy]* )
    echo "\033[1;34m[INFO]\033[0m Shutting down docker compose"
    docker compose down -v
    echo "\033[1;34m[INFO]\033[0m Removing docker images"
    make remove-docker-images
    ;;
  * )
    echo "\033[1;34m[INFO]\033[0m Skipping removal of docker images"
    ;;
esac

echo "\033[1;34m[INFO]\033[0m Creating output directories"
mkdir -p ../openmaptilesdata/data
mkdir -p ../openmaptilesdata/style
mkdir -p ../openmaptilesdata/build

echo "\033[1;34m[INFO]\033[0m Copying data, style, and build outputs"
cp -r ./data ../openmaptilesdata
cp -r ./style ../openmaptilesdata
cp -r ./build ../openmaptilesdata
echo "\033[1;32m[COMPLETE]\033[0m OpenMapTiles build completed successfully! "