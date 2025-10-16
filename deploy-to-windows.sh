#!/bin/bash

# ============================================
# Deploy Thư Viện Ảnh to Windows Server
# ============================================
# Domain: thuvienanh.incanto.my
# Server: Windows 10 via Tailscale (100.112.44.73)
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WINDOWS_SERVER="100.112.44.73"
WINDOWS_USER="Administrator"
PROJECT_NAME="thuvienanh"
DEPLOY_DIR="C:/Users/Administrator/${PROJECT_NAME}"
CONTAINER_NAME="${PROJECT_NAME}-app"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🚀 Deploying Thư Viện Ảnh to Windows Server${NC}"
echo -e "${BLUE}============================================${NC}"

# Step 1: Check connection
echo -e "\n${YELLOW}📡 Step 1: Checking connection to Windows server...${NC}"
if ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "echo OK" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to Windows server${NC}"
    exit 1
fi

# Step 2: Check Docker
echo -e "\n${YELLOW}🐳 Step 2: Checking Docker on Windows server...${NC}"
ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "docker --version && docker compose version"

# Step 3: Create project directory
echo -e "\n${YELLOW}📁 Step 3: Creating project directory...${NC}"
ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "powershell -Command \"New-Item -ItemType Directory -Force -Path '${DEPLOY_DIR}'\""

# Step 4: Sync project files
echo -e "\n${YELLOW}📦 Step 4: Syncing project files...${NC}"
tar czf - \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='playwright-report' \
    --exclude='test-results' \
    --exclude='logs' \
    --exclude='.env.local' \
    . | ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "cd ${DEPLOY_DIR} && tar xzf -"

# Step 5: Copy production environment file (skip if not exists)
echo -e "\n${YELLOW}🔧 Step 5: Setting up environment variables...${NC}"
if [ -f .env.production.windows ]; then
    scp .env.production.windows ${WINDOWS_USER}@${WINDOWS_SERVER}:${DEPLOY_DIR}/.env.production
else
    echo -e "${YELLOW}⚠️  .env.production.windows not found, using existing .env on server${NC}"
fi

# Step 6: Build and deploy with Docker
echo -e "\n${YELLOW}🏗️  Step 6: Building Docker image...${NC}"
ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "cd ${DEPLOY_DIR} && docker compose -f docker-compose.production.windows.yml build"

# Step 7: Stop old container if exists
echo -e "\n${YELLOW}🛑 Step 7: Stopping old container...${NC}"
ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "docker stop ${CONTAINER_NAME} 2>/dev/null || true"
ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "docker rm ${CONTAINER_NAME} 2>/dev/null || true"

# Step 8: Start new container
echo -e "\n${YELLOW}🚀 Step 8: Starting new container...${NC}"
ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "cd ${DEPLOY_DIR} && docker compose -f docker-compose.production.windows.yml up -d app"

# Step 9: Wait for container to be healthy
echo -e "\n${YELLOW}⏳ Step 9: Waiting for container to be healthy...${NC}"
sleep 10

# Step 10: Check container status
echo -e "\n${YELLOW}📊 Step 10: Checking container status...${NC}"
ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "docker ps -a | grep ${CONTAINER_NAME}"

# Step 11: Check health endpoint
echo -e "\n${YELLOW}🏥 Step 11: Checking health endpoint...${NC}"
ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "curl -s http://localhost:4000/api/health || echo 'Health check failed'"

# Step 12: Show logs
echo -e "\n${YELLOW}📋 Step 12: Container logs (last 20 lines)...${NC}"
ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "docker logs --tail 20 ${CONTAINER_NAME}"

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "${BLUE}📍 Local URL: http://localhost:4000${NC}"
echo -e "${BLUE}🌐 Public URL: https://thuvienanh.ninh.app${NC}"
echo -e "${BLUE}🐳 Container: ${CONTAINER_NAME}${NC}"
echo -e "${BLUE}📊 Portainer: http://${WINDOWS_SERVER}:9000${NC}"
echo -e "\n${YELLOW}🧪 Testing endpoints:${NC}"
echo -e "1. Health: https://thuvienanh.ninh.app/api/health"
echo -e "2. Database: https://thuvienanh.ninh.app/api/health/db"
echo -e "3. Albums: https://thuvienanh.ninh.app/albums/fabric"

