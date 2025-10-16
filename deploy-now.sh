#!/bin/bash

# ========================================
# One-Click Deploy to Windows
# ========================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

WINDOWS_IP="100.101.50.87"
WINDOWS_USER="nihdev"

clear
echo -e "${BOLD}${CYAN}"
cat << "EOF"
╔════════════════════════════════════════╗
║   THƯ VIỆN ẢNH - WINDOWS DEPLOYMENT   ║
║        One-Click Deploy Script         ║
╚════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Quick check
echo -e "${YELLOW}🔍 Quick check...${NC}"

# Check Tailscale
echo -n "  Tailscale connection... "
if ping -c 1 -W 2 $WINDOWS_IP > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    echo -e "${RED}Cannot reach Windows PC!${NC}"
    echo -e "${YELLOW}Please check Tailscale is running on both devices${NC}"
    exit 1
fi

# Check SSH
echo -n "  SSH connection... "
if timeout 5 ssh -o ConnectTimeout=3 -o BatchMode=yes $WINDOWS_USER@$WINDOWS_IP "echo OK" > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
    HAS_SSH=1
else
    echo -e "${YELLOW}⚠️  (requires password)${NC}"
    HAS_SSH=0
fi

echo ""

# Deployment options
if [ $HAS_SSH -eq 1 ]; then
    echo -e "${CYAN}${BOLD}🚀 Ready for automated deployment!${NC}"
    echo ""
    echo -e "${CYAN}What do you want to do?${NC}"
    echo "  ${BOLD}1.${NC} Full deploy (sync + build + start) ${GREEN}[Recommended]${NC}"
    echo "  ${BOLD}2.${NC} Quick sync and restart (no rebuild)"
    echo "  ${BOLD}3.${NC} Just sync code"
    echo "  ${BOLD}4.${NC} Check status only"
    echo "  ${BOLD}5.${NC} Manual instructions"
    echo ""
    read -p "Enter choice (1-5): " choice
    
    case $choice in
        1)
            echo ""
            echo -e "${YELLOW}🚀 Starting full deployment...${NC}"
            echo ""
            
            # Sync
            echo -e "${CYAN}[1/3] Syncing code...${NC}"
            rsync -avz --progress \
                --exclude 'node_modules' \
                --exclude '.next' \
                --exclude '.git' \
                --exclude 'logs' \
                --exclude 'backups' \
                --exclude '.DS_Store' \
                --exclude 'test-results' \
                --exclude 'playwright-report' \
                ./ $WINDOWS_USER@$WINDOWS_IP:/d/Projects/thuvienanh/
            
            if [ $? -ne 0 ]; then
                echo -e "${RED}❌ Sync failed!${NC}"
                exit 1
            fi
            echo -e "${GREEN}✅ Code synced${NC}"
            echo ""
            
            # Build
            echo -e "${CYAN}[2/3] Building Docker images (this may take 5-10 minutes)...${NC}"
            ssh $WINDOWS_USER@$WINDOWS_IP "cd /d/Projects/thuvienanh && docker-compose build"
            
            if [ $? -ne 0 ]; then
                echo -e "${RED}❌ Build failed!${NC}"
                exit 1
            fi
            echo -e "${GREEN}✅ Build completed${NC}"
            echo ""
            
            # Start
            echo -e "${CYAN}[3/3] Starting containers...${NC}"
            ssh $WINDOWS_USER@$WINDOWS_IP "cd /d/Projects/thuvienanh && docker-compose up -d"
            
            if [ $? -ne 0 ]; then
                echo -e "${RED}❌ Start failed!${NC}"
                exit 1
            fi
            echo -e "${GREEN}✅ Containers started${NC}"
            echo ""
            
            # Wait and check
            echo -e "${YELLOW}⏳ Waiting for app to be ready...${NC}"
            sleep 10
            
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$WINDOWS_IP:4000)
            if [ "$HTTP_CODE" = "200" ]; then
                echo ""
                echo -e "${GREEN}${BOLD}╔════════════════════════════════════════╗${NC}"
                echo -e "${GREEN}${BOLD}║     ✅ DEPLOYMENT SUCCESSFUL! 🎉      ║${NC}"
                echo -e "${GREEN}${BOLD}╚════════════════════════════════════════╝${NC}"
                echo ""
                echo -e "${CYAN}🌐 Access your app:${NC}"
                echo -e "   ${BOLD}http://$WINDOWS_IP:4000${NC}"
                echo ""
                echo -e "${CYAN}📊 Management:${NC}"
                echo "   pgAdmin: http://$WINDOWS_IP:5051"
                echo "   Portainer: http://$WINDOWS_IP:9000"
                echo ""
                
                # Ask to open browser
                read -p "Open app in browser? (y/n): " open_browser
                if [ "$open_browser" = "y" ]; then
                    open "http://$WINDOWS_IP:4000"
                fi
            else
                echo -e "${YELLOW}⚠️  App deployed but not responding yet${NC}"
                echo -e "${CYAN}Check logs:${NC}"
                echo "  ssh $WINDOWS_USER@$WINDOWS_IP 'cd /d/Projects/thuvienanh && docker-compose logs -f fabric-library'"
            fi
            ;;
            
        2)
            echo ""
            echo -e "${YELLOW}🔄 Quick sync and restart...${NC}"
            
            # Sync
            echo -e "${CYAN}Syncing code...${NC}"
            rsync -avz --update \
                --exclude 'node_modules' \
                --exclude '.next' \
                --exclude '.git' \
                ./ $WINDOWS_USER@$WINDOWS_IP:/d/Projects/thuvienanh/
            
            # Restart
            echo -e "${CYAN}Restarting containers...${NC}"
            ssh $WINDOWS_USER@$WINDOWS_IP "cd /d/Projects/thuvienanh && docker-compose restart fabric-library"
            
            echo -e "${GREEN}✅ Done!${NC}"
            echo -e "${CYAN}Access: http://$WINDOWS_IP:4000${NC}"
            ;;
            
        3)
            echo ""
            echo -e "${YELLOW}🔄 Syncing code only...${NC}"
            rsync -avz --progress \
                --exclude 'node_modules' \
                --exclude '.next' \
                --exclude '.git' \
                ./ $WINDOWS_USER@$WINDOWS_IP:/d/Projects/thuvienanh/
            
            echo -e "${GREEN}✅ Sync completed${NC}"
            echo -e "${CYAN}To rebuild: ./remote-deploy.sh${NC}"
            ;;
            
        4)
            echo ""
            echo -e "${YELLOW}📊 Checking status...${NC}"
            echo ""
            ssh $WINDOWS_USER@$WINDOWS_IP "cd /d/Projects/thuvienanh && docker-compose ps"
            
            echo ""
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$WINDOWS_IP:4000)
            if [ "$HTTP_CODE" = "200" ]; then
                echo -e "${GREEN}✅ App is running${NC}"
                echo -e "${CYAN}Access: http://$WINDOWS_IP:4000${NC}"
            else
                echo -e "${RED}❌ App not responding (HTTP $HTTP_CODE)${NC}"
            fi
            ;;
            
        5)
            cat << EOF

${CYAN}${BOLD}Manual Deployment Instructions:${NC}

${YELLOW}On Windows (PowerShell as Administrator):${NC}

1. Navigate to project:
   ${BOLD}cd D:\\Projects\\thuvienanh${NC}

2. Deploy:
   ${BOLD}.\\deploy-windows-tailscale.ps1${NC}

3. Or manual Docker commands:
   ${BOLD}docker-compose up -d --build${NC}

4. Check status:
   ${BOLD}docker-compose ps${NC}

5. View logs:
   ${BOLD}docker-compose logs -f fabric-library${NC}

${CYAN}Access app:${NC}
   ${BOLD}http://localhost:4000${NC} (from Windows)
   ${BOLD}http://100.101.50.87:4000${NC} (from Mac/Tailscale)

EOF
            ;;
            
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
else
    # No SSH - show manual instructions
    echo -e "${YELLOW}${BOLD}⚠️  SSH not configured${NC}"
    echo ""
    echo -e "${CYAN}You need to deploy manually on Windows:${NC}"
    echo ""
    echo -e "${YELLOW}Step 1: Copy code to Windows${NC}"
    echo "  - Use USB drive, or"
    echo "  - Use Git (push from Mac, pull on Windows), or"
    echo "  - Setup SSH (see SETUP_SSH_WINDOWS.md)"
    echo ""
    echo -e "${YELLOW}Step 2: On Windows (PowerShell as Administrator):${NC}"
    echo "  ${BOLD}cd D:\\Projects\\thuvienanh${NC}"
    echo "  ${BOLD}.\\deploy-windows-tailscale.ps1${NC}"
    echo ""
    echo -e "${CYAN}Or setup SSH for automated deployment:${NC}"
    echo "  See: ${BOLD}SETUP_SSH_WINDOWS.md${NC}"
    echo ""
fi

echo ""

