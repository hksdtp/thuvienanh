#!/bin/bash

# ========================================
# Kiểm tra kết nối đến Windows 10 qua Tailscale
# ========================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
WINDOWS_IP="100.101.50.87"
WINDOWS_USER="nihdev"
APP_PORT="4000"
DB_PORT="5434"
PGADMIN_PORT="5051"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Windows Connection Check${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Function to check service
check_service() {
    local name=$1
    local host=$2
    local port=$3
    
    echo -n "Checking $name ($host:$port)... "
    if nc -z -w 2 $host $port 2>/dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# 1. Check Tailscale connection
echo -e "${YELLOW}1. Tailscale Network${NC}"
echo -n "Ping Windows PC... "
if ping -c 1 -W 2 $WINDOWS_IP > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
    PING_OK=1
else
    echo -e "${RED}❌ FAILED${NC}"
    echo -e "${RED}Cannot reach Windows PC at $WINDOWS_IP${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "  1. Check Tailscale is running on Mac:"
    echo "     sudo tailscale status"
    echo "  2. Check Tailscale is running on Windows"
    echo "  3. Verify Windows IP is correct"
    PING_OK=0
fi
echo ""

# 2. Check SSH
if [ $PING_OK -eq 1 ]; then
    echo -e "${YELLOW}2. SSH Connection${NC}"
    echo -n "SSH to Windows... "
    if timeout 5 ssh -o ConnectTimeout=3 -o BatchMode=yes $WINDOWS_USER@$WINDOWS_IP "echo 'OK'" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK (passwordless)${NC}"
        SSH_OK=1
    elif timeout 5 ssh -o ConnectTimeout=3 $WINDOWS_USER@$WINDOWS_IP "echo 'OK'" 2>&1 | grep -q "password"; then
        echo -e "${YELLOW}⚠️  OK (requires password)${NC}"
        echo -e "${CYAN}Tip: Setup SSH key for passwordless access:${NC}"
        echo "  ssh-copy-id $WINDOWS_USER@$WINDOWS_IP"
        SSH_OK=1
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo -e "${YELLOW}SSH may not be enabled on Windows${NC}"
        echo ""
        echo -e "${CYAN}To enable SSH on Windows:${NC}"
        echo "  1. Open PowerShell as Administrator"
        echo "  2. Run: Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0"
        echo "  3. Run: Start-Service sshd"
        echo "  4. Run: Set-Service -Name sshd -StartupType 'Automatic'"
        SSH_OK=0
    fi
    echo ""
fi

# 3. Check Docker services
if [ $PING_OK -eq 1 ]; then
    echo -e "${YELLOW}3. Docker Services${NC}"
    
    # Check if netcat is available
    if ! command -v nc &> /dev/null; then
        echo -e "${YELLOW}⚠️  netcat not installed, skipping port checks${NC}"
        echo "Install with: brew install netcat"
    else
        check_service "Next.js App" $WINDOWS_IP $APP_PORT
        check_service "PostgreSQL" $WINDOWS_IP $DB_PORT
        check_service "pgAdmin" $WINDOWS_IP $PGADMIN_PORT
    fi
    echo ""
fi

# 4. Check HTTP endpoint
if [ $PING_OK -eq 1 ]; then
    echo -e "${YELLOW}4. HTTP Endpoint${NC}"
    echo -n "Testing http://$WINDOWS_IP:$APP_PORT... "
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://$WINDOWS_IP:$APP_PORT 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ OK (HTTP $HTTP_CODE)${NC}"
        APP_OK=1
    elif [ "$HTTP_CODE" = "000" ]; then
        echo -e "${RED}❌ Cannot connect${NC}"
        APP_OK=0
    else
        echo -e "${YELLOW}⚠️  HTTP $HTTP_CODE${NC}"
        APP_OK=0
    fi
    echo ""
fi

# 5. Summary
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Summary${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

if [ $PING_OK -eq 1 ] && [ ${SSH_OK:-0} -eq 1 ] && [ ${APP_OK:-0} -eq 1 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo -e "${CYAN}You can now:${NC}"
    echo "  1. Sync code: ./sync-to-windows.sh"
    echo "  2. Access app: http://$WINDOWS_IP:$APP_PORT"
    echo "  3. Access pgAdmin: http://$WINDOWS_IP:$PGADMIN_PORT"
elif [ $PING_OK -eq 1 ] && [ ${SSH_OK:-0} -eq 1 ]; then
    echo -e "${YELLOW}⚠️  Connection OK but app not running${NC}"
    echo ""
    echo -e "${CYAN}To start the app on Windows:${NC}"
    echo "  ssh $WINDOWS_USER@$WINDOWS_IP"
    echo "  cd D:\\Projects\\thuvienanh"
    echo "  .\\deploy-windows-tailscale.ps1"
elif [ $PING_OK -eq 1 ]; then
    echo -e "${YELLOW}⚠️  Network OK but SSH not configured${NC}"
    echo ""
    echo -e "${CYAN}Setup SSH on Windows first${NC}"
else
    echo -e "${RED}❌ Cannot connect to Windows PC${NC}"
    echo ""
    echo -e "${CYAN}Check:${NC}"
    echo "  1. Tailscale is running on both devices"
    echo "  2. Windows PC is online"
    echo "  3. IP address is correct: $WINDOWS_IP"
fi

echo ""
echo -e "${CYAN}Quick Commands:${NC}"
echo "  Check Tailscale: sudo tailscale status"
echo "  Test SSH: ssh $WINDOWS_USER@$WINDOWS_IP"
echo "  Sync code: ./sync-to-windows.sh"
echo "  Open app: open http://$WINDOWS_IP:$APP_PORT"
echo ""

