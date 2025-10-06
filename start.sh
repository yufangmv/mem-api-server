#!/bin/bash

# MemMachine UI Startup Script

echo "🚀 Starting MemMachine UI Server..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "🌐 Starting server on http://localhost:3000"
echo "📡 API Proxy configured for: https://localhost:8000/v1"
echo ""
echo "💡 Tips:"
echo "   - Open http://localhost:3000 in your browser"
echo "   - Make sure your MemMachine API server is running on https://localhost:8000"
echo "   - To change the API base URL, edit DEFAULT_API_BASE in server.js"
echo ""

npm start
