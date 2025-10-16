#!/bin/bash

# ========================================
# Remote Deploy to Windows from Mac
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
WINDOWS_PATH="D:\\Projects\\thuvienanh"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Remote Deploy to Windows${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check connection
echo -e "${YELLOW}🔍 Checking connection...${NC}"
if ! ping -c 1 -W 2 $WINDOWS_IP > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot reach Windows PC${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Connection OK${NC}"
echo ""

# Menu
echo -e "${CYAN}Select deployment action:${NC}"
echo "  1. Full deploy (sync + build + start)"
echo "  2. Sync code only"
echo "  3. Rebuild Docker images"
echo "  4. Restart containers"
echo "  5. View logs"
echo "  6. Check status"
echo "  7. Stop containers"
echo "  8. Clean and rebuild"
echo "  9. Backup database"
echo "  0. Exit"
echo ""
read -p "Enter choice (0-9): " choice

case $choice in
    1)
        echo -e "${YELLOW}🚀 Starting full deployment...${NC}"
        echo ""
        
        # Step 1: Sync code
        echo -e "${CYAN}Step 1/3: Syncing code...${NC}"
        rsync -avz --progress \
            --exclude 'node_modules' \
            --exclude '.next' \
            --exclude '.git' \
            --exclude 'logs' \
            --exclude 'backups' \
            ./ $WINDOWS_USER@$WINDOWS_IP:/d/Projects/thuvienanh/
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Sync failed!${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Code synced${NC}"
        echo ""
        
        # Step 2: Build
        echo -e "${CYAN}Step 2/3: Building Docker images...${NC}"
        ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose build"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Build failed!${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Build completed${NC}"
        echo ""
        
        # Step 3: Start
        echo -e "${CYAN}Step 3/3: Starting containers...${NC}"
        ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose up -d"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Start failed!${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Containers started${NC}"
        echo ""
        
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  ✅ Deployment completed!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo -e "${CYAN}Access app at: http://$WINDOWS_IP:4000${NC}"
        ;;
        
    2)
        echo -e "${YELLOW}🔄 Syncing code...${NC}"
        rsync -avz --progress \
            --exclude 'node_modules' \
            --exclude '.next' \
            --exclude '.git' \
            ./ $WINDOWS_USER@$WINDOWS_IP:/d/Projects/thuvienanh/
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Sync completed${NC}"
        else
            echo -e "${RED}❌ Sync failed${NC}"
        fi
        ;;
        
    3)
        echo -e "${YELLOW}🔨 Rebuilding Docker images...${NC}"
        ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose build --no-cache"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Rebuild completed${NC}"
            echo ""
            read -p "Start containers now? (y/n): " start
            if [ "$start" = "y" ]; then
                ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose up -d"
                echo -e "${GREEN}✅ Containers started${NC}"
            fi
        else
            echo -e "${RED}❌ Rebuild failed${NC}"
        fi
        ;;
        
    4)
        echo -e "${YELLOW}🔄 Restarting containers...${NC}"
        ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose restart"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Containers restarted${NC}"
        else
            echo -e "${RED}❌ Restart failed${NC}"
        fi
        ;;
        
    5)
        echo -e "${YELLOW}📋 Viewing logs...${NC}"
        echo ""
        echo -e "${CYAN}Which service?${NC}"
        echo "  1. All services"
        echo "  2. App only"
        echo "  3. Database only"
        echo "  4. pgAdmin only"
        read -p "Choice: " log_choice
        
        case $log_choice in
            1) ssh -t $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose logs -f" ;;
            2) ssh -t $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose logs -f fabric-library" ;;
            3) ssh -t $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose logs -f postgres" ;;
            4) ssh -t $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose logs -f pgadmin" ;;
            *) echo -e "${RED}Invalid choice${NC}" ;;
        esac
        ;;
        
    6)
        echo -e "${YELLOW}📊 Checking status...${NC}"
        echo ""
        ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose ps"
        echo ""
        
        echo -e "${CYAN}Testing HTTP endpoint...${NC}"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$WINDOWS_IP:4000)
        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}✅ App is running (HTTP $HTTP_CODE)${NC}"
            echo -e "${CYAN}Access at: http://$WINDOWS_IP:4000${NC}"
        else
            echo -e "${RED}❌ App not responding (HTTP $HTTP_CODE)${NC}"
        fi
        ;;
        
    7)
        echo -e "${YELLOW}🛑 Stopping containers...${NC}"
        read -p "Are you sure? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose stop"
            echo -e "${GREEN}✅ Containers stopped${NC}"
        fi
        ;;
        
    8)
        echo -e "${YELLOW}🧹 Clean and rebuild...${NC}"
        echo -e "${RED}⚠️  This will remove all containers and volumes!${NC}"
        read -p "Are you sure? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            echo ""
            echo -e "${YELLOW}Stopping containers...${NC}"
            ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose down -v"
            
            echo -e "${YELLOW}Cleaning Docker system...${NC}"
            ssh $WINDOWS_USER@$WINDOWS_IP "docker system prune -af --volumes"
            
            echo -e "${YELLOW}Syncing code...${NC}"
            rsync -avz --progress \
                --exclude 'node_modules' \
                --exclude '.next' \
                --exclude '.git' \
                ./ $WINDOWS_USER@$WINDOWS_IP:/d/Projects/thuvienanh/
            
            echo -e "${YELLOW}Building images...${NC}"
            ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose build --no-cache"
            
            echo -e "${YELLOW}Starting containers...${NC}"
            ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker-compose up -d"
            
            echo -e "${GREEN}✅ Clean rebuild completed${NC}"
        fi
        ;;
        
    9)
        echo -e "${YELLOW}💾 Backing up database...${NC}"
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        
        ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && docker exec tva-postgres pg_dump -U postgres tva > backups/$BACKUP_FILE"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database backed up to: backups/$BACKUP_FILE${NC}"
            
            read -p "Download backup to Mac? (y/n): " download
            if [ "$download" = "y" ]; then
                mkdir -p ./backups
                scp $WINDOWS_USER@$WINDOWS_IP:/d/Projects/thuvienanh/backups/$BACKUP_FILE ./backups/
                echo -e "${GREEN}✅ Downloaded to ./backups/$BACKUP_FILE${NC}"
            fi
        else
            echo -e "${RED}❌ Backup failed${NC}"
        fi
        ;;
        
    0)
        echo -e "${CYAN}Goodbye!${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}Done!${NC}"

