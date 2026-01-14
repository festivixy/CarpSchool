@echo off
setlocal

echo ========================================
echo  CarpSchool Production Build Script
echo  Windows equivalent of build-prod.sh
echo ========================================
echo.

REM Check if app directory exists
if not exist "app" (
    echo ERROR: app directory not found!
    echo Please run this script from the CarpSchool root directory.
    pause
    exit /b 1
)

REM Step 1: Check Docker is running
echo [1/6] Checking Docker environment...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo Docker is running

REM Step 2: Clean previous build
echo [2/6] Cleaning previous build...
if exist "build" rmdir /s /q "build" >nul 2>&1
if exist "server\build" rmdir /s /q "server\build" >nul 2>&1
echo Cleaned previous builds

REM Step 3: Update browserslist database
echo [3/6] Updating browserslist database...
cd app
call meteor npm install caniuse-lite --save --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to update browserslist (non-critical)
) else (
    call npx update-browserslist-db@latest
)
cd ..
if %ERRORLEVEL% EQU 0 echo Browserslist updated

REM Step 4: Build Meteor app bundle
echo [4/6] Building Meteor app bundle...
cd app
call meteor build "..\build" --architecture "os.linux.x86_64" --server-only --verbose
set BUILD_RESULT=%ERRORLEVEL%
cd ..
if %BUILD_RESULT% NEQ 0 (
    echo ERROR: Meteor build failed
    pause
    exit /b 1
)
echo Meteor bundle built successfully

REM Step 5: Ensure map data directory
echo [5/6] Ensuring map data directory...
if not exist "openmaptilesdata\data" (
    mkdir "openmaptilesdata\data"
    echo Created map data directory
    echo.
    echo NOTE: You may need to populate this directory with map data.
    echo Run build-openmaptiles.sh ^(5-20 hours^) or download-openmaptiles-data.sh ^(faster^)
    echo.
)

REM Step 6: Install server dependencies and start services
echo [6/6] Installing server dependencies...
cd "build\bundle\programs\server"
call npm install --production
set NPM_RESULT=%ERRORLEVEL%
cd ..\..\..\..

if %NPM_RESULT% NEQ 0 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

REM Copy to server build directory
if not exist "server\build" mkdir "server\build"
xcopy /s /e /i /y "build\bundle\programs\server\*" "server\build\" >nul 2>&1

REM Start Docker services
echo Starting services with Docker Compose...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start Docker containers
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Build completed successfully!
echo ========================================
echo.
echo Production bundle is ready in: server\build
echo Map data directory: openmaptilesdata\data
echo.
echo App available at: http://localhost:3000
echo.
echo Useful commands:
echo   View logs: docker compose logs -f app
echo   Stop services: docker compose down
echo   Rebuild: build.bat
echo.
echo To start server manually:
echo   cd server\build
echo   node main.js
echo.

pause