@echo off
setlocal

echo ========================================
echo  CarpSchool Production Build Script
echo  Based on build-prod.sh structure
echo ========================================
echo.

REM Source utility functions (Windows equivalents)
call :source_utils

REM Check dependencies
call :check_dependencies

REM Check if app directory exists
if not exist "app" (
    echo ERROR: app directory not found!
    echo Please run this script from the CarpSchool root directory.
    pause
    exit /b 1
)

REM Step 1: Clean previous build
echo [1/5] Cleaning previous build...
if exist "..\build" (
    rmdir /s /q "..\build"
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to clean build directory
        pause
        exit /b 1
    )
)

REM Step 2: Install/update browserslist
echo [2/5] Updating browserslist database...
cd app
call meteor npm install caniuse-lite --save --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to update browserslist (non-critical)
)

REM Step 3: Build Meteor app bundle
echo [3/5] Building Meteor app bundle...
call meteor build "..\build" --architecture os.linux.x86_64 --server-only
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Meteor build failed
    pause
    exit /b 1
)

REM Step 4: Ensure map data directory exists
echo [4/5] Ensuring map data directory...
if not exist "..\openmaptilesdata\data" (
    mkdir "..\openmaptilesdata\data"
    echo Created map data directory
)

REM Step 5: Install server dependencies
echo [5/5] Installing server dependencies...
cd "..\build\bundle\programs\server"
call npm install --production
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

REM Copy to server build directory
echo [6/6] Preparing server build...
cd ..\..\..
if not exist "server\build" (
    mkdir "server\build"
)

xcopy /s /e /i /y "build\bundle\programs\server\*" "server\build\"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to copy server build
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
echo To start the server:
echo   cd server\build
echo   node main.js
echo.
echo To start with Docker:
echo   docker-compose up -d
echo.

pause
exit /b 0

REM ========================================
REM  Utility Functions
REM ========================================

:source_utils
REM Windows equivalent of sourcing utilities
goto :eof

:check_dependencies
REM Check if Meteor is installed
where meteor >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Meteor is not installed or not in PATH
    echo Please install Meteor from https://www.meteor.com/
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Git is installed
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Git is not installed (optional for building)
)

goto :eof