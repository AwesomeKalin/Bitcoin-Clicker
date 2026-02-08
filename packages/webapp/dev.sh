#!/bin/bash
# Start both Convex dev server and Vite dev server

echo "🚀 Starting Bitcoin Clicker dev environment..."
echo "⚡ This will start both Convex backend and Vite frontend"
echo ""

# Check if convex is installed
if ! command -v convex &> /dev/null; then
    echo "📦 Installing convex CLI..."
    npm install -g convex
fi

# Start convex dev in background
echo "🔧 Starting Convex dev server..."
npx convex dev &
CONVEX_PID=$!

# Wait a bit for Convex to start
sleep 3

# Start vite
echo "⚡ Starting Vite dev server..."
npm run dev

# Cleanup on exit
trap "kill $CONVEX_PID" EXIT
