#!/bin/bash
# F1 Hybrid System - Setup Test Script
# Run this on your MacBook to verify setup

echo "🏎️  F1 Hybrid System - Setup Test"
echo "=================================="
echo ""

# Get MacBook IP
MAC_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "✓ MacBook IP: $MAC_IP"
echo ""

# Test 1: Check if server directory exists
if [ -d "server" ]; then
    echo "✓ Server directory found"
else
    echo "✗ Server directory not found!"
    exit 1
fi

# Test 2: Check if dependencies installed
if [ -d "node_modules" ]; then
    echo "✓ Node modules installed"
else
    echo "⚠ Node modules not installed. Run: npm install"
fi

# Test 3: Check if server .env exists
if [ -f "server/.env" ]; then
    echo "✓ Server .env file exists"
else
    echo "⚠ Server .env file missing. Creating..."
    cat > server/.env << EOF
PORT=3000
UDP_PORT=20777
LOG_LEVEL=info
CORS_ORIGIN=*
HEROKU_APP_URL=https://placeholder.herokuapp.com
EOF
    echo "✓ Created server/.env"
fi

# Test 4: Build server
echo ""
echo "Building server..."
cd server
npm run build 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ Server build successful"
else
    echo "⚠ Server build failed. Check errors above."
fi
cd ..

# Test 5: Check ports
echo ""
echo "Checking ports..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠ Port 3000 already in use"
else
    echo "✓ Port 3000 available"
fi

if lsof -Pi :20777 -sUDP:LISTEN -t >/dev/null ; then
    echo "⚠ Port 20777 already in use"
else
    echo "✓ Port 20777 available"
fi

# Test 6: Create deployment package for Windows PCs
echo ""
echo "Creating deployment package for Windows PCs..."
cd ..
zip -r f1-project-deploy.zip aicentre-f1-hybrid \
  -x "*/node_modules/*" \
  -x "*/dist/*" \
  -x "*/.git/*" \
  -x "*/.DS_Store" \
  >/dev/null 2>&1

if [ -f "f1-project-deploy.zip" ]; then
    ZIPSIZE=$(du -h f1-project-deploy.zip | awk '{print $1}')
    echo "✓ Deployment package created: f1-project-deploy.zip ($ZIPSIZE)"
    echo "  Upload this to cloud storage for Windows PCs"
else
    echo "⚠ Failed to create deployment package"
fi

echo ""
echo "=================================="
echo "Setup Summary"
echo "=================================="
echo "MacBook IP:     $MAC_IP"
echo "Server Port:    3000"
echo "UDP Port:       20777"
echo ""
echo "Next Steps:"
echo "1. Start server:  cd server && npm start"
echo "2. Open dashboard: http://$MAC_IP:3000"
echo "3. Test from Windows PC: curl http://$MAC_IP:3000/api/health"
echo ""
echo "Windows PC Configuration:"
echo "  - Download f1-project-deploy.zip"
echo "  - Extract to C:\\f1-racing-simulator\\"
echo "  - Edit rig-client/config.json:"
echo "    serverUrl: \"http://$MAC_IP:3000\""
echo ""
