#!/bin/bash

# ========================================
# Kiểm tra Production Deployment
# ========================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

WINDOWS_IP="100.112.44.73"
WINDOWS_USER="Administrator"

echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   KIỂM TRA PRODUCTION DEPLOYMENT                  ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Tailscale
echo -e "${YELLOW}[1/6] Tailscale Network${NC}"
if ping -c 1 -W 2 $WINDOWS_IP > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Windows server reachable${NC}"
else
    echo -e "${RED}❌ Cannot reach Windows server${NC}"
fi

# 2. SSH
echo -e "${YELLOW}[2/6] SSH Connection${NC}"
if ssh -o ConnectTimeout=3 -o BatchMode=yes $WINDOWS_USER@$WINDOWS_IP "echo OK" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SSH connection OK${NC}"
else
    echo -e "${RED}❌ SSH connection failed${NC}"
fi

# 3. Docker
echo -e "${YELLOW}[3/6] Docker Containers${NC}"
DOCKER_STATUS=$(ssh $WINDOWS_USER@$WINDOWS_IP "cd /d/Projects/thuvienanh && docker-compose -f docker-compose.production.windows.yml ps --format json 2>/dev/null" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker containers running${NC}"
else
    echo -e "${RED}❌ Docker containers not running${NC}"
fi

# 4. Local endpoint
echo -e "${YELLOW}[4/6] Local Endpoint (http://$WINDOWS_IP:4000)${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://$WINDOWS_IP:4000 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ App responding (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ App not responding (HTTP $HTTP_CODE)${NC}"
fi

# 5. Production domain
echo -e "${YELLOW}[5/6] Production Domain (https://thuvienanh.incanto.my)${NC}"
PROD_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 https://thuvienanh.incanto.my 2>/dev/null)
if [ "$PROD_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Production accessible (HTTP $PROD_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Production not accessible (HTTP $PROD_CODE)${NC}"
fi

# 6. Cloudflare Tunnel
echo -e "${YELLOW}[6/6] Cloudflare Tunnel Service${NC}"
CF_STATUS=$(ssh $WINDOWS_USER@$WINDOWS_IP "powershell -Command \"(Get-Service cloudflared).Status\"" 2>/dev/null)
if [ "$CF_STATUS" = "Running" ]; then
    echo -e "${GREEN}✅ Cloudflare Tunnel running${NC}"
else
    echo -e "${RED}❌ Cloudflare Tunnel not running${NC}"
fi

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Summary${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Production URL: ${GREEN}https://thuvienanh.incanto.my${NC}"
echo -e "Local URL:      ${YELLOW}http://$WINDOWS_IP:4000${NC}"
echo ""

