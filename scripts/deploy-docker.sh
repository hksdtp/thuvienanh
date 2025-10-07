#!/bin/bash

# Deploy Next.js app to VPS using Docker
# This script will:
# 1. Build Docker image
# 2. Push to VPS
# 3. Run container

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Deploy Next.js App with Docker${NC}"
echo ""

# Configuration
VPS_IP="14.225.218.134"
VPS_USER="root"
APP_NAME="thuvienanh"
APP_DIR="/root/apps/$APP_NAME"

# Step 1: Check SSH connection
echo -e "${BLUE}📍 Step 1: Check SSH connection${NC}"

if ssh $VPS_USER@$VPS_IP "echo 'SSH OK'"; then
    echo -e "${GREEN}✓ SSH connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to VPS${NC}"
    echo "Please run: bash scripts/setup-vps-access.sh"
    exit 1
fi

echo ""

# Step 2: Prepare VPS
echo -e "${BLUE}📍 Step 2: Prepare VPS${NC}"

ssh $VPS_USER@$VPS_IP "bash -s" << ENDSSH
    # Create app directory
    mkdir -p $APP_DIR
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "Docker is not installed. Installing..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    fi
    
    echo "✓ VPS prepared"
ENDSSH

echo -e "${GREEN}✓ VPS prepared${NC}"
echo ""

# Step 3: Copy files to VPS
echo -e "${BLUE}📍 Step 3: Copy files to VPS${NC}"

# Create tarball excluding node_modules and .next
tar -czf /tmp/$APP_NAME.tar.gz \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    .

# Copy to VPS
scp /tmp/$APP_NAME.tar.gz $VPS_USER@$VPS_IP:$APP_DIR/

# Extract on VPS
ssh $VPS_USER@$VPS_IP "cd $APP_DIR && tar -xzf $APP_NAME.tar.gz && rm $APP_NAME.tar.gz"

# Cleanup local tarball
rm /tmp/$APP_NAME.tar.gz

echo -e "${GREEN}✓ Files copied to VPS${NC}"
echo ""

# Step 4: Build Docker image on VPS
echo -e "${BLUE}📍 Step 4: Build Docker image${NC}"

ssh $VPS_USER@$VPS_IP "bash -s" << ENDSSH
    cd $APP_DIR
    
    # Stop and remove old container
    docker stop $APP_NAME 2>/dev/null || true
    docker rm $APP_NAME 2>/dev/null || true
    
    # Build new image
    docker build -t $APP_NAME:latest .
    
    echo "✓ Docker image built"
ENDSSH

echo -e "${GREEN}✓ Docker image built${NC}"
echo ""

# Step 5: Run container
echo -e "${BLUE}📍 Step 5: Run Docker container${NC}"

ssh $VPS_USER@$VPS_IP "bash -s" << 'ENDSSH'
    cd /root/apps/thuvienanh
    
    # Run container
    docker run -d \
        --name thuvienanh \
        --restart unless-stopped \
        -p 3000:4000 \
        -e NODE_ENV=production \
        -e NEXT_TELEMETRY_DISABLED=1 \
        -e POSTGRES_HOST=222.252.23.248 \
        -e POSTGRES_PORT=5499 \
        -e POSTGRES_DB=Ninh96 \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=Demo1234 \
        -e SYNOLOGY_BASE_URL=http://222.252.23.248:8888 \
        -e SYNOLOGY_ALTERNATIVE_URL=http://222.252.23.248:6868 \
        -e SYNOLOGY_USERNAME=haininh \
        -e SYNOLOGY_PASSWORD=Villad24@ \
        -e SMB_HOST=222.252.23.248 \
        -e SMB_SHARE=marketing \
        -e SMB_DOMAIN=WORKGROUP \
        -e SMB_USERNAME=haininh \
        -e SMB_PASSWORD=Villad24@ \
        -e SMB_PORT=445 \
        thuvienanh:latest
    
    echo "✓ Container started"
ENDSSH

echo -e "${GREEN}✓ Container started${NC}"
echo ""

# Step 6: Check container status
echo -e "${BLUE}📍 Step 6: Check container status${NC}"

sleep 5

ssh $VPS_USER@$VPS_IP "docker ps | grep $APP_NAME"

echo ""

# Step 7: Show logs
echo -e "${BLUE}📍 Step 7: Container logs${NC}"
echo "================================"

ssh $VPS_USER@$VPS_IP "docker logs $APP_NAME --tail 30"

echo "================================"
echo ""

# Step 8: Test health
echo -e "${BLUE}📍 Step 8: Test application${NC}"

sleep 3

HEALTH_CHECK=$(ssh $VPS_USER@$VPS_IP "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health || echo '000'")

if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✓ Application is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Health check returned: $HEALTH_CHECK${NC}"
    echo "   The app might still be starting up..."
fi

echo ""

# Summary
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Access your app:${NC}"
echo "   http://$VPS_IP:3000"
echo ""
echo -e "${YELLOW}🔍 Useful commands:${NC}"
echo "   ssh $VPS_USER@$VPS_IP 'docker logs $APP_NAME'           # View logs"
echo "   ssh $VPS_USER@$VPS_IP 'docker logs $APP_NAME -f'        # Follow logs"
echo "   ssh $VPS_USER@$VPS_IP 'docker restart $APP_NAME'        # Restart"
echo "   ssh $VPS_USER@$VPS_IP 'docker stop $APP_NAME'           # Stop"
echo "   ssh $VPS_USER@$VPS_IP 'docker exec -it $APP_NAME sh'    # Shell access"
echo ""

