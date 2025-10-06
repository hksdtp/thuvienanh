#!/bin/bash

# VPS Deployment Script
# Deploy full stack Next.js app to VPS

set -e

echo "🚀 Starting VPS deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="thuvienanh"
APP_DIR="$HOME/apps/$APP_NAME"
PM2_NAME="thuvienanh"

# Step 1: Check if we're on VPS
echo ""
echo "📍 Step 1: Checking environment..."
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ .env file not found!${NC}"
  echo "Please create .env file first. See DEPLOY_VPS_FULL_STACK.md"
  exit 1
fi
echo -e "${GREEN}✅ Environment file found${NC}"

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Build production
echo ""
echo "🏗️  Step 3: Building production..."
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Step 4: Stop old PM2 processes
echo ""
echo "🛑 Step 4: Stopping old processes..."

# Stop old API process (if exists)
pm2 stop thuvienanh-api 2>/dev/null || echo "No old API process found"
pm2 delete thuvienanh-api 2>/dev/null || true

# Stop old web process (if exists)
pm2 stop thuvienanh-web 2>/dev/null || echo "No old web process found"
pm2 delete thuvienanh-web 2>/dev/null || true

# Stop current process (if exists)
pm2 stop $PM2_NAME 2>/dev/null || echo "No old process found"
pm2 delete $PM2_NAME 2>/dev/null || true

echo -e "${GREEN}✅ Old processes stopped${NC}"

# Step 5: Start new process
echo ""
echo "🚀 Step 5: Starting application..."

# Start with PM2
pm2 start npm --name "$PM2_NAME" -- start

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to start application!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Application started${NC}"

# Step 6: Save PM2 configuration
echo ""
echo "💾 Step 6: Saving PM2 configuration..."
pm2 save
echo -e "${GREEN}✅ PM2 configuration saved${NC}"

# Step 7: Show status
echo ""
echo "📊 Step 7: Application status..."
pm2 status

# Step 8: Show logs
echo ""
echo "📝 Recent logs:"
pm2 logs $PM2_NAME --lines 20 --nostream

# Step 9: Test health
echo ""
echo "🏥 Step 9: Testing health endpoint..."
sleep 3
HEALTH_CHECK=$(curl -s http://localhost:3000/api/health || echo "failed")

if [[ $HEALTH_CHECK == *"healthy"* ]]; then
  echo -e "${GREEN}✅ Health check passed!${NC}"
else
  echo -e "${YELLOW}⚠️  Health check failed or endpoint not responding${NC}"
  echo "Response: $HEALTH_CHECK"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📍 Application URL:"
echo "   http://localhost:3000"
echo "   http://222.252.23.248:3000"
echo ""
echo "📊 Monitoring:"
echo "   pm2 status"
echo "   pm2 logs $PM2_NAME"
echo "   pm2 monit"
echo ""
echo "🔄 Update later:"
echo "   git pull origin main"
echo "   bash scripts/deploy-vps.sh"
echo ""
echo "═══════════════════════════════════════════════════════════"

