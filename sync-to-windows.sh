#!/bin/bash

# ========================================
# Sync code từ Mac sang Windows 10 qua Tailscale
# ========================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
WINDOWS_IP="100.112.44.73"
WINDOWS_USER="Administrator"
WINDOWS_PATH="/d/Projects/thuvienanh"
LOCAL_PATH="/Users/nihdev/Web/thuvienanh"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Sync Code to Windows via Tailscale${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if Tailscale is running
echo -e "${YELLOW}🔍 Checking Tailscale connection...${NC}"
if ! ping -c 1 -W 2 $WINDOWS_IP > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot reach Windows PC at $WINDOWS_IP${NC}"
    echo -e "${YELLOW}Please check:${NC}"
    echo "  1. Tailscale is running on both Mac and Windows"
    echo "  2. Windows PC is online"
    echo "  3. IP address is correct"
    exit 1
fi
echo -e "${GREEN}✅ Windows PC is reachable${NC}"

# Check if SSH is available
echo -e "${YELLOW}🔍 Checking SSH connection...${NC}"
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $WINDOWS_USER@$WINDOWS_IP "echo 'SSH OK'" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  SSH connection requires password or not configured${NC}"
    echo ""
    echo -e "${CYAN}To setup passwordless SSH:${NC}"
    echo "  1. Generate SSH key (if not exists):"
    echo "     ssh-keygen -t rsa -b 4096"
    echo ""
    echo "  2. Copy key to Windows:"
    echo "     ssh-copy-id $WINDOWS_USER@$WINDOWS_IP"
    echo ""
    echo -e "${YELLOW}Continuing with password authentication...${NC}"
fi

# Ask for sync method
echo ""
echo -e "${CYAN}Select sync method:${NC}"
echo "  1. Full sync (all files except node_modules, .next, .git)"
echo "  2. Deploy script only"
read -p "Enter choice (1-2): " choice

# Tạo thư mục trên Windows nếu chưa có
ssh $WINDOWS_USER@$WINDOWS_IP "mkdir -p $WINDOWS_PATH" 2>/dev/null

case $choice in
    1)
        echo -e "${YELLOW}🔄 Starting full sync...${NC}"
        cd $LOCAL_PATH
        tar czf - \
            --exclude 'node_modules' \
            --exclude '.next' \
            --exclude '.git' \
            --exclude 'logs' \
            --exclude 'backups' \
            --exclude '.DS_Store' \
            --exclude 'test-results' \
            --exclude 'playwright-report' \
            --exclude 'public/uploads' \
            . | ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && tar xzf -"
        ;;
    2)
        echo -e "${YELLOW}🔄 Syncing deploy script only...${NC}"
        scp $LOCAL_PATH/deploy-production-cloudflare.ps1 \
            $WINDOWS_USER@$WINDOWS_IP:$WINDOWS_PATH/
        scp $LOCAL_PATH/.env.production \
            $WINDOWS_USER@$WINDOWS_IP:$WINDOWS_PATH/
        scp $LOCAL_PATH/docker-compose.production.windows.yml \
            $WINDOWS_USER@$WINDOWS_IP:$WINDOWS_PATH/
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✅ Sync completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${CYAN}Next steps on Windows:${NC}"
    echo "  1. Open PowerShell as Administrator"
    echo "  2. cd D:\\Projects\\thuvienanh"
    echo "  3. .\\deploy-windows-tailscale.ps1"
    echo ""
    echo -e "${CYAN}Or run deployment remotely:${NC}"
    echo "  ssh $WINDOWS_USER@$WINDOWS_IP 'cd $WINDOWS_PATH && powershell -File deploy-windows-tailscale.ps1'"
else
    echo -e "${RED}❌ Sync failed!${NC}"
    exit 1
fi

