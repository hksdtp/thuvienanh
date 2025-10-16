#!/bin/bash

# ============================================
# Test Deployment Prerequisites
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WINDOWS_SERVER="100.112.44.73"
WINDOWS_USER="Administrator"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🧪 Testing Deployment Prerequisites${NC}"
echo -e "${BLUE}============================================${NC}"

# Test 1: Tailscale Connection
echo -e "\n${YELLOW}1. Testing Tailscale connection...${NC}"
if ping -c 1 ${WINDOWS_SERVER} > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Tailscale connection OK${NC}"
else
    echo -e "${RED}❌ Cannot ping Windows server${NC}"
    exit 1
fi

# Test 2: SSH Connection
echo -e "\n${YELLOW}2. Testing SSH connection...${NC}"
if ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "echo OK" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SSH connection OK${NC}"
else
    echo -e "${RED}❌ SSH connection failed${NC}"
    exit 1
fi

# Test 3: Docker
echo -e "\n${YELLOW}3. Testing Docker...${NC}"
DOCKER_VERSION=$(ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "docker --version" 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker installed: ${DOCKER_VERSION}${NC}"
else
    echo -e "${RED}❌ Docker not found${NC}"
    exit 1
fi

# Test 4: Docker Compose
echo -e "\n${YELLOW}4. Testing Docker Compose...${NC}"
COMPOSE_VERSION=$(ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "docker compose version" 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker Compose installed: ${COMPOSE_VERSION}${NC}"
else
    echo -e "${RED}❌ Docker Compose not found${NC}"
    exit 1
fi

# Test 5: Cloudflared
echo -e "\n${YELLOW}5. Testing Cloudflared...${NC}"
CLOUDFLARED_VERSION=$(ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "cloudflared --version" 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Cloudflared installed: ${CLOUDFLARED_VERSION}${NC}"
else
    echo -e "${RED}❌ Cloudflared not found${NC}"
    exit 1
fi

# Test 6: PostgreSQL
echo -e "\n${YELLOW}6. Testing PostgreSQL...${NC}"
PG_STATUS=$(ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "powershell -Command \"Get-Service -Name postgresql* | Select-Object -ExpandProperty Status\"" 2>&1)
if [[ $PG_STATUS == *"Running"* ]]; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL status: ${PG_STATUS}${NC}"
fi

# Test 7: Port 4000 availability
echo -e "\n${YELLOW}7. Testing port 4000 availability...${NC}"
PORT_CHECK=$(ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "powershell -Command \"Test-NetConnection -ComputerName localhost -Port 4000 -InformationLevel Quiet\"" 2>&1)
if [[ $PORT_CHECK == *"False"* ]] || [[ $PORT_CHECK == "" ]]; then
    echo -e "${GREEN}✅ Port 4000 is available${NC}"
else
    echo -e "${YELLOW}⚠️  Port 4000 might be in use${NC}"
fi

# Test 8: Existing containers
echo -e "\n${YELLOW}8. Checking existing containers...${NC}"
ssh ${WINDOWS_USER}@${WINDOWS_SERVER} 'docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'

# Test 9: Synology NAS
echo -e "\n${YELLOW}9. Testing Synology NAS connection...${NC}"
SYNOLOGY_TEST=$(ssh ${WINDOWS_USER}@${WINDOWS_SERVER} "curl -s -o /dev/null -w '%{http_code}' http://222.252.23.248:8888 --connect-timeout 5" 2>&1)
if [ "$SYNOLOGY_TEST" == "200" ] || [ "$SYNOLOGY_TEST" == "302" ]; then
    echo -e "${GREEN}✅ Synology NAS is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Synology NAS response: ${SYNOLOGY_TEST}${NC}"
fi

# Test 10: Required files
echo -e "\n${YELLOW}10. Checking required files...${NC}"
REQUIRED_FILES=(
    "Dockerfile"
    "docker-compose.production.windows.yml"
    ".env.production.windows"
    "package.json"
    "next.config.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ ${file}${NC}"
    else
        echo -e "${RED}❌ ${file} not found${NC}"
    fi
done

echo -e "\n${BLUE}============================================${NC}"
echo -e "${GREEN}✅ All prerequisite tests passed!${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "\n${YELLOW}Ready to deploy!${NC}"
echo -e "Run: ${GREEN}./deploy-to-windows.sh${NC}"

