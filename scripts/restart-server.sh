#!/bin/bash
# Restart F1 Hybrid Server with latest changes

echo "🏎️  Restarting F1 Hybrid Server..."
echo ""

# Kill any existing server processes
echo "Stopping existing server..."
pkill -f "node.*server/dist/index.js" 2>/dev/null || echo "No existing server found"

sleep 1

# Start new server
echo ""
echo "Starting server..."
cd server
node dist/index.js

