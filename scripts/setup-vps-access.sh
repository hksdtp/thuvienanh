#!/bin/bash

# Setup VPS Access for Augment
# This script will:
# 1. Copy SSH key to VPS
# 2. Install Docker (if not installed)
# 3. Setup Docker for Next.js app

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setup VPS Access for Augment${NC}"
echo ""

# VPS Configuration
VPS_IP="14.225.218.134"
VPS_USER="root"

echo -e "${YELLOW}📋 VPS Information:${NC}"
echo "   IP: $VPS_IP"
echo "   User: $VPS_USER"
echo ""

# Step 1: Copy SSH key
echo -e "${BLUE}📍 Step 1: Copy SSH key to VPS${NC}"
echo "You will be asked for VPS password..."
echo ""

if ssh-copy-id $VPS_USER@$VPS_IP; then
    echo -e "${GREEN}✓ SSH key copied successfully${NC}"
else
    echo -e "${RED}❌ Failed to copy SSH key${NC}"
    echo "Please make sure:"
    echo "  1. VPS is accessible"
    echo "  2. Password is correct"
    echo "  3. SSH service is running on VPS"
    exit 1
fi

echo ""

# Step 2: Test SSH connection
echo -e "${BLUE}📍 Step 2: Test SSH connection${NC}"

if ssh $VPS_USER@$VPS_IP "echo 'SSH connection successful'"; then
    echo -e "${GREEN}✓ SSH connection works!${NC}"
else
    echo -e "${RED}❌ SSH connection failed${NC}"
    exit 1
fi

echo ""

# Step 3: Check if Docker is installed
echo -e "${BLUE}📍 Step 3: Check Docker installation${NC}"

DOCKER_INSTALLED=$(ssh $VPS_USER@$VPS_IP "command -v docker >/dev/null 2>&1 && echo 'yes' || echo 'no'")

if [ "$DOCKER_INSTALLED" = "yes" ]; then
    echo -e "${GREEN}✓ Docker is already installed${NC}"
    
    # Show Docker version
    DOCKER_VERSION=$(ssh $VPS_USER@$VPS_IP "docker --version")
    echo "   Version: $DOCKER_VERSION"
    
    # Show running containers
    echo ""
    echo -e "${YELLOW}📦 Running containers:${NC}"
    ssh $VPS_USER@$VPS_IP "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
else
    echo -e "${YELLOW}⚠️  Docker is not installed${NC}"
    echo "Installing Docker..."
    echo ""
    
    # Install Docker
    ssh $VPS_USER@$VPS_IP "bash -s" << 'ENDSSH'
        # Update package index
        apt-get update
        
        # Install prerequisites
        apt-get install -y \
            ca-certificates \
            curl \
            gnupg \
            lsb-release
        
        # Add Docker's official GPG key
        mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        
        # Set up repository
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker Engine
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        # Start Docker
        systemctl start docker
        systemctl enable docker
        
        # Verify installation
        docker --version
ENDSSH
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Docker installed successfully${NC}"
    else
        echo -e "${RED}❌ Docker installation failed${NC}"
        exit 1
    fi
fi

echo ""

# Step 4: Check Easypanel
echo -e "${BLUE}📍 Step 4: Check Easypanel${NC}"

EASYPANEL_RUNNING=$(ssh $VPS_USER@$VPS_IP "docker ps | grep easypanel >/dev/null 2>&1 && echo 'yes' || echo 'no'")

if [ "$EASYPANEL_RUNNING" = "yes" ]; then
    echo -e "${GREEN}✓ Easypanel is running${NC}"
    
    # Show Easypanel container
    echo ""
    echo -e "${YELLOW}📦 Easypanel containers:${NC}"
    ssh $VPS_USER@$VPS_IP "docker ps | grep easypanel"
else
    echo -e "${YELLOW}⚠️  Easypanel is not running (or not using Docker)${NC}"
fi

echo ""

# Step 5: Check thuvienanh app
echo -e "${BLUE}📍 Step 5: Check thuvienanh app${NC}"

APP_RUNNING=$(ssh $VPS_USER@$VPS_IP "docker ps | grep thuvienanh >/dev/null 2>&1 && echo 'yes' || echo 'no'")

if [ "$APP_RUNNING" = "yes" ]; then
    echo -e "${GREEN}✓ thuvienanh app is running in Docker${NC}"
    
    # Show app container
    echo ""
    echo -e "${YELLOW}📦 App container:${NC}"
    ssh $VPS_USER@$VPS_IP "docker ps | grep thuvienanh"
    
    # Show logs
    echo ""
    echo -e "${YELLOW}📋 Recent logs:${NC}"
    CONTAINER_NAME=$(ssh $VPS_USER@$VPS_IP "docker ps | grep thuvienanh | awk '{print \$NF}'")
    ssh $VPS_USER@$VPS_IP "docker logs $CONTAINER_NAME --tail 20"
else
    echo -e "${YELLOW}⚠️  thuvienanh app is not running in Docker${NC}"
    echo "   It might be running with PM2 or another method"
    
    # Check PM2
    PM2_RUNNING=$(ssh $VPS_USER@$VPS_IP "command -v pm2 >/dev/null 2>&1 && pm2 list | grep thuvienanh >/dev/null 2>&1 && echo 'yes' || echo 'no'")
    
    if [ "$PM2_RUNNING" = "yes" ]; then
        echo -e "${GREEN}✓ thuvienanh app is running with PM2${NC}"
        ssh $VPS_USER@$VPS_IP "pm2 list"
    fi
fi

echo ""

# Step 6: Summary
echo -e "${BLUE}📊 Summary${NC}"
echo "================================"
echo -e "SSH Access:        ${GREEN}✓ Configured${NC}"
echo -e "Docker:            ${GREEN}✓ Installed${NC}"
echo -e "Easypanel:         $([ "$EASYPANEL_RUNNING" = "yes" ] && echo -e "${GREEN}✓ Running${NC}" || echo -e "${YELLOW}⚠ Not detected${NC}")"
echo -e "App (Docker):      $([ "$APP_RUNNING" = "yes" ] && echo -e "${GREEN}✓ Running${NC}" || echo -e "${YELLOW}⚠ Not running${NC}")"
echo "================================"

echo ""
echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Augment can now SSH into your VPS"
echo "2. Augment can run commands to debug and fix issues"
echo "3. You can deploy your app with Docker"
echo ""
echo -e "${BLUE}🔍 Useful commands:${NC}"
echo "   ssh $VPS_USER@$VPS_IP                    # SSH into VPS"
echo "   ssh $VPS_USER@$VPS_IP 'docker ps'        # List containers"
echo "   ssh $VPS_USER@$VPS_IP 'docker logs ...'  # View logs"
echo ""

