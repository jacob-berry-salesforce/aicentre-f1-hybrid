#!/bin/bash

# F1 Racing Simulator - Setup Verification Script
# Run this script to verify your installation is complete and configured correctly

echo "=========================================="
echo "F1 Racing Simulator - Setup Verification"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

error() {
    echo -e "${RED}✗ ERROR: $1${NC}"
    ((ERRORS++))
}

warning() {
    echo -e "${YELLOW}⚠ WARNING: $1${NC}"
    ((WARNINGS++))
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

info() {
    echo -e "ℹ $1"
}

echo "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js installed: $NODE_VERSION"

    # Check if version is >= 18
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        error "Node.js version must be 18 or higher (found: $NODE_VERSION)"
    fi
else
    error "Node.js is not installed"
fi
echo ""

echo "Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "npm installed: $NPM_VERSION"
else
    error "npm is not installed"
fi
echo ""

echo "Checking directory structure..."
for dir in server rig-client heroku-app stream-deck; do
    if [ -d "$dir" ]; then
        success "Directory exists: $dir"
    else
        error "Missing directory: $dir"
    fi
done
echo ""

echo "Checking node_modules..."
if [ -d "node_modules" ]; then
    success "Root dependencies installed"
else
    warning "Root dependencies not installed (run: npm install)"
fi

for dir in server rig-client heroku-app; do
    if [ -d "$dir/node_modules" ]; then
        success "Dependencies installed: $dir"
    else
        warning "Dependencies not installed: $dir (run: npm install)"
    fi
done
echo ""

echo "Checking configuration files..."

# Server
if [ -f "server/.env" ]; then
    success "server/.env exists"
else
    warning "server/.env not found (copy from .env.example)"
fi

# Rig Client
if [ -f "rig-client/.env" ]; then
    success "rig-client/.env exists"
else
    warning "rig-client/.env not found (copy from .env.example)"
fi

if [ -f "rig-client/config.json" ]; then
    success "rig-client/config.json exists"

    # Check rigId
    RIG_ID=$(grep -o '"rigId"[[:space:]]*:[[:space:]]*"[^"]*"' rig-client/config.json | cut -d'"' -f4)
    if [ -n "$RIG_ID" ]; then
        info "  Rig ID: $RIG_ID"
        if [ "$RIG_ID" != "rig-1" ] && [ "$RIG_ID" != "rig-2" ]; then
            warning "  Rig ID should be 'rig-1' or 'rig-2'"
        fi
    fi
else
    warning "rig-client/config.json not found (copy from config.json.example)"
fi

# Heroku App
if [ -f "heroku-app/.env" ]; then
    success "heroku-app/.env exists"
else
    warning "heroku-app/.env not found (copy from .env.example)"
fi
echo ""

echo "Checking package.json files..."
for file in package.json server/package.json rig-client/package.json heroku-app/package.json; do
    if [ -f "$file" ]; then
        success "Found: $file"
    else
        error "Missing: $file"
    fi
done
echo ""

echo "Checking TypeScript configuration..."
for file in server/tsconfig.json rig-client/tsconfig.json heroku-app/server/tsconfig.json heroku-app/client/tsconfig.json; do
    if [ -f "$file" ]; then
        success "Found: $file"
    else
        error "Missing: $file"
    fi
done
echo ""

echo "Checking documentation..."
for file in README.md QUICK_START.md ARCHITECTURE.md PROJECT_SUMMARY.md; do
    if [ -f "$file" ]; then
        success "Found: $file"
    else
        warning "Missing: $file"
    fi
done
echo ""

echo "Checking logs directories..."
for dir in server/logs rig-client/logs; do
    if [ -d "$dir" ]; then
        success "Log directory exists: $dir"
    else
        warning "Log directory missing: $dir (will be created automatically)"
    fi
done
echo ""

echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    success "All checks passed! Your setup is complete."
    echo ""
    echo "Next steps:"
    echo "1. Configure .env files with your network settings"
    echo "2. Configure rig-client/config.json with correct rig ID"
    echo "3. Build all components: npm run build"
    echo "4. Start the system (see QUICK_START.md)"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}Setup is mostly complete with $WARNINGS warning(s).${NC}"
    echo "Review warnings above and address them before starting."
else
    echo -e "${RED}Setup incomplete with $ERRORS error(s) and $WARNINGS warning(s).${NC}"
    echo "Please fix errors before proceeding."
    exit 1
fi
echo ""
