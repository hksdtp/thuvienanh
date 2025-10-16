#!/bin/bash

# ========================================
# Deploy Production từ Mac sang Windows
# Sync code + Trigger deployment
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

echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   DEPLOY PRODUCTION TỪ MAC SANG WINDOWS           ║${NC}"
echo -e "${CYAN}║   Domain: thuvienanh.incanto.my                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# ========================================
# 1. Kiểm tra Tailscale
# ========================================
echo -e "${YELLOW}[1/5] Kiểm tra Tailscale...${NC}"

if ! command -v tailscale &> /dev/null; then
    echo -e "${RED}❌ Tailscale chưa được cài đặt!${NC}"
    echo -e "${YELLOW}Cài đặt: brew install tailscale${NC}"
    exit 1
fi

# Kiểm tra Tailscale đang chạy
if ! tailscale status &> /dev/null; then
    echo -e "${RED}❌ Tailscale chưa chạy!${NC}"
    echo -e "${YELLOW}Khởi động Tailscale và chạy lại script${NC}"
    exit 1
fi

# Ping Windows server
if ! ping -c 1 -W 2 $WINDOWS_IP > /dev/null 2>&1; then
    echo -e "${RED}❌ Không thể kết nối đến Windows server: $WINDOWS_IP${NC}"
    echo -e "${YELLOW}Kiểm tra:${NC}"
    echo "  1. Tailscale đang chạy trên Windows"
    echo "  2. Windows server đang online"
    echo "  3. IP address đúng"
    exit 1
fi

echo -e "${GREEN}✅ Tailscale OK - Connected to $WINDOWS_IP${NC}"

# ========================================
# 2. Kiểm tra SSH
# ========================================
echo -e "${YELLOW}[2/5] Kiểm tra SSH connection...${NC}"

if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $WINDOWS_USER@$WINDOWS_IP "echo 'OK'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Không thể SSH đến Windows server!${NC}"
    echo -e "${YELLOW}Kiểm tra:${NC}"
    echo "  1. SSH server đang chạy trên Windows"
    echo "  2. SSH key đã được setup"
    echo "  3. Username đúng: $WINDOWS_USER"
    exit 1
fi

echo -e "${GREEN}✅ SSH connection OK${NC}"

# ========================================
# 3. Sync code
# ========================================
echo -e "${YELLOW}[3/5] Đồng bộ code sang Windows...${NC}"

# Tạo thư mục trên Windows nếu chưa có
echo -e "${CYAN}Tạo thư mục project trên Windows...${NC}"
ssh $WINDOWS_USER@$WINDOWS_IP "powershell -Command \"New-Item -ItemType Directory -Force -Path '$WINDOWS_PATH'\"" 2>/dev/null

# Exclude patterns cho tar
EXCLUDE_PATTERNS=(
    "node_modules"
    ".next"
    ".git"
    "logs"
    "backups"
    "*.log"
    ".DS_Store"
    "public/uploads"
)

# Build exclude arguments cho tar
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude='$pattern'"
done

# Sync using tar + ssh (không cần rsync trên Windows)
echo -e "${CYAN}Đang nén và upload code...${NC}"
cd "$LOCAL_PATH"

# Tạo tar và pipe qua SSH với PowerShell
eval tar czf - $EXCLUDE_ARGS . | \
    ssh $WINDOWS_USER@$WINDOWS_IP "powershell -Command \"\$input | tar xzf - -C '$WINDOWS_PATH'\""

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Sync thất bại!${NC}"
    echo -e "${YELLOW}Thử phương pháp backup (scp)...${NC}"

    # Fallback: Tạo tar file tạm và scp
    TEMP_TAR="/tmp/thuvienanh-deploy-$$.tar.gz"
    echo -e "${CYAN}Tạo archive...${NC}"
    eval tar czf "$TEMP_TAR" $EXCLUDE_ARGS .

    echo -e "${CYAN}Upload archive...${NC}"
    scp "$TEMP_TAR" "$WINDOWS_USER@$WINDOWS_IP:$WINDOWS_PATH/deploy.tar.gz"

    echo -e "${CYAN}Giải nén trên Windows...${NC}"
    ssh $WINDOWS_USER@$WINDOWS_IP "powershell -Command \"cd '$WINDOWS_PATH'; tar xzf deploy.tar.gz; Remove-Item deploy.tar.gz\""

    # Cleanup
    rm -f "$TEMP_TAR"

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Sync thất bại hoàn toàn!${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Code đã được sync${NC}"

# ========================================
# 4. Trigger deployment trên Windows
# ========================================
echo -e "${YELLOW}[4/5] Trigger deployment trên Windows...${NC}"

# Tạo deployment command
DEPLOY_CMD="cd $WINDOWS_PATH && powershell -ExecutionPolicy Bypass -File deploy-production-cloudflare.ps1"

# Hỏi user có muốn rebuild không
echo ""
read -p "Bạn có muốn rebuild Docker image? (y/n): " rebuild
if [ "$rebuild" = "y" ]; then
    DEPLOY_CMD="$DEPLOY_CMD -Rebuild"
fi

# Hỏi user có muốn clean không
read -p "Bạn có muốn clean trước khi deploy? (y/n): " clean
if [ "$clean" = "y" ]; then
    DEPLOY_CMD="$DEPLOY_CMD -Clean"
fi

echo ""
echo -e "${CYAN}Đang chạy deployment trên Windows...${NC}"
echo -e "${YELLOW}Lệnh: $DEPLOY_CMD${NC}"
echo ""

# Execute deployment
ssh -t $WINDOWS_USER@$WINDOWS_IP "$DEPLOY_CMD"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment thất bại!${NC}"
    exit 1
fi

# ========================================
# 5. Kiểm tra kết quả
# ========================================
echo -e "${YELLOW}[5/5] Kiểm tra deployment...${NC}"

# Đợi một chút để app khởi động
sleep 5

# Test local endpoint
echo -n "Testing local endpoint (http://$WINDOWS_IP:4000)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 http://$WINDOWS_IP:4000 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
fi

# Test production domain
echo -n "Testing production domain (https://thuvienanh.incanto.my)... "
PROD_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 https://thuvienanh.incanto.my 2>/dev/null)

if [ "$PROD_CODE" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP $PROD_CODE (Cloudflare Tunnel có thể cần vài phút để propagate)${NC}"
fi

# ========================================
# Hoàn tất
# ========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ DEPLOYMENT HOÀN TẤT!                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}🌐 Địa chỉ truy cập:${NC}"
echo -e "  Production: ${GREEN}https://thuvienanh.incanto.my${NC}"
echo -e "  Local:      ${YELLOW}http://$WINDOWS_IP:4000${NC}"
echo ""
echo -e "${CYAN}🔧 Lệnh hữu ích:${NC}"
echo "  Xem logs:   ssh $WINDOWS_USER@$WINDOWS_IP 'cd $WINDOWS_PATH && docker-compose -f docker-compose.production.windows.yml logs -f'"
echo "  Restart:    ssh $WINDOWS_USER@$WINDOWS_IP 'cd $WINDOWS_PATH && docker-compose -f docker-compose.production.windows.yml restart app'"
echo "  SSH:        ssh $WINDOWS_USER@$WINDOWS_IP"
echo ""
echo -e "${CYAN}📝 Ghi chú:${NC}"
echo "  - Nếu domain chưa hoạt động, đợi vài phút để DNS propagate"
echo "  - Kiểm tra Cloudflare Tunnel: ssh $WINDOWS_USER@$WINDOWS_IP 'Get-Service cloudflared'"
echo ""

