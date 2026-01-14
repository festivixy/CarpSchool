@echo off
setlocal

echo ========================================
echo  CarpSchool Production Build Script
echo ========================================
echo.

REM Check if app directory exists
if not exist "app" (
    echo ERROR: app directory not found!
    echo Please run this script from the CarpSchool root directory.
    pause
    exit /b 1
)

REM Install dependencies
echo [1/5] Installing dependencies...
cd app
call meteor npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Clean previous build
echo [2/5] Cleaning previous build...
if exist "..\build" (
    rmdir /s /q "..\build"
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to clean build directory
        pause
        exit /b 1
    )
)

REM Build production bundle
echo [3/5] Building production bundle...
call meteor build "..\build" --architecture os.linux.x86_64 --server-only
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Meteor build failed
    pause
    exit /b 1
)

REM Install dependencies for server build
echo [4/5] Installing server dependencies...
cd "..\build\bundle\programs\server"
call npm install --production
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

REM Copy to server build directory
echo [5/5] Preparing server build...
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
echo.
echo To start the server:
echo   cd server\build
echo   node main.js
echo.

pause