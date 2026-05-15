@echo off
setlocal enabledelayedexpansion
REM Quick Start Script for Royal Rift Arena Multiplayer Server (Windows)

echo.
echo ========================================
echo  Royal Rift Arena - Multiplayer Edition
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please download Node.js from:
    echo   https://nodejs.org/ (LTS version)
    echo.
    echo After installation, restart your computer
    echo and run this file again.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo Node.js version: %NODE_VERSION%
echo npm version: %NPM_VERSION%
echo.

REM Navigate to backend directory
cd /d "%~dp0backend" || (
    echo ERROR: Could not navigate to backend directory
    echo Make sure this file is in the "Something Beter" folder
    pause
    exit /b 1
)

echo Backend folder: %cd%
echo.

REM Check if node_modules already exists
if exist "node_modules" (
    echo Existing installation found. Skipping npm install.
    goto :SKIP_INSTALL
)

echo ========================================
echo  Installing Dependencies
echo ========================================
echo.
echo Clearing npm cache...
call npm cache clean --force

echo.
echo Downloading packages (this may take 1-2 minutes)...
echo.

call npm install --verbose

if %ERRORLEVEL% neq 0 (
    echo.
    echo ========================================
    echo  ERROR: Installation Failed
    echo ========================================
    echo.
    echo Trying alternative method...
    echo.
    
    REM Try with legacy peer deps
    call npm install --legacy-peer-deps
    
    if !ERRORLEVEL! neq 0 (
        echo.
        echo Still failing. Please try:
        echo.
        echo 1. Close this window
        echo 2. Open Command Prompt as Administrator
        echo 3. Navigate to the backend folder:
        echo    cd "C:\Users\soura\Downloads\Something Beter\backend"
        echo.
        echo 4. Run: npm install --legacy-peer-deps
        echo.
        pause
        exit /b 1
    )
)

:SKIP_INSTALL

echo.
echo ========================================
echo  Starting Royal Rift Server...
echo ========================================
echo.
echo Server will run on: http://localhost:3000
echo.
echo Open your browser and go to:
echo   http://localhost:3000
echo.
echo When you're done playing, press Ctrl+C
echo to stop the server.
echo.
echo ========================================
echo.

call npm start

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Server failed to start
    echo.
)

pause
