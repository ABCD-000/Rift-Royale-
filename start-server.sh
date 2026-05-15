#!/bin/bash
# Quick Start Script for Royal Rift Arena Multiplayer Server

set -e  # Exit on any error

echo ""
echo "🎮 Royal Rift Arena - Multiplayer Edition"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo ""
    echo "Please download Node.js from: https://nodejs.org/"
    echo "Download the LTS version"
    echo ""
    echo "After installation, try this script again."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Navigate to backend directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ ERROR: Could not find backend folder"
    echo "Make sure this file is in the 'Something Beter' folder"
    exit 1
fi

cd "$BACKEND_DIR" || exit 1

echo "📍 Backend folder: $(pwd)"
echo ""

# Check if node_modules already exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies already installed. Skipping npm install."
    echo ""
else
    echo "=========================================="
    echo "📦 Installing Dependencies"
    echo "=========================================="
    echo ""
    
    echo "🧹 Clearing npm cache..."
    npm cache clean --force
    
    echo ""
    echo "📥 Downloading packages (this may take 1-2 minutes)..."
    echo ""
    
    if ! npm install --verbose; then
        echo ""
        echo "⚠️  First installation attempt failed. Trying alternative..."
        echo ""
        
        if ! npm install --legacy-peer-deps; then
            echo ""
            echo "❌ ERROR: Installation failed"
            echo ""
            echo "Try these steps:"
            echo "1. Make sure you have good internet connection"
            echo "2. Delete the 'node_modules' folder in the backend folder"
            echo "3. Run this script again"
            echo ""
            exit 1
        fi
    fi
    
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
fi

echo "=========================================="
echo "🚀 Starting Royal Rift Server..."
echo "=========================================="
echo ""
echo "📍 Server will run on: http://localhost:3000"
echo ""
echo "📝 Open your browser and go to:"
echo "   http://localhost:3000"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"
echo ""
echo "=========================================="
echo ""

npm start
