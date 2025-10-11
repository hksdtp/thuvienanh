#!/bin/bash

# Auto Pull Script - Đồng bộ code từ Mac sang Windows qua Tailscale
# Sử dụng: ./auto-pull.sh

set -e  # Dừng nếu có lỗi

# ============================================
# CẤU HÌNH - VUI LÒNG ĐIỀU CHỈNH
# ============================================

# Tailscale IP của máy Windows
WINDOWS_IP="100.101.50.87"

# Username trên máy Windows (thay đổi theo username của bạn)
WINDOWS_USER="Marketingpc"

# Đường dẫn đến thư mục code trên Windows
# Lưu ý: Dùng forward slash (/) thay vì backslash (\)
WINDOWS_PROJECT_PATH="/d/Ninh/thuvienanh"

# Branch cần push/pull
BRANCH="main"

# ============================================
# SCRIPT BẮT ĐẦU
# ============================================

echo "🚀 Bắt đầu đồng bộ code..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Bước 1: Kiểm tra có thay đổi cần commit không
echo ""
echo "📝 Bước 1: Kiểm tra thay đổi..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Có thay đổi chưa commit!"
    echo ""
    git status -s
    echo ""
    read -p "Bạn có muốn commit tất cả thay đổi? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Nhập commit message: " commit_msg
        git add -A
        git commit -m "$commit_msg"
        echo "✅ Đã commit thay đổi"
    else
        echo "❌ Hủy bỏ. Vui lòng commit thay đổi trước."
        exit 1
    fi
else
    echo "✅ Không có thay đổi mới"
fi

# Bước 2: Push lên GitHub
echo ""
echo "📤 Bước 2: Push lên GitHub..."
if git push origin $BRANCH; then
    echo "✅ Push thành công lên GitHub"
else
    echo "❌ Push thất bại!"
    exit 1
fi

# Bước 3: Kiểm tra kết nối SSH đến Windows
echo ""
echo "🔌 Bước 3: Kiểm tra kết nối đến Windows..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes $WINDOWS_USER@$WINDOWS_IP "echo 'Connected'" 2>/dev/null; then
    echo "✅ Kết nối SSH thành công"
else
    echo "❌ Không thể kết nối SSH đến Windows!"
    echo ""
    echo "Vui lòng kiểm tra:"
    echo "  1. Tailscale đang chạy trên cả 2 máy"
    echo "  2. SSH server đã được cài đặt trên Windows"
    echo "  3. Username và IP đúng trong script"
    echo ""
    echo "Để cài SSH trên Windows, chạy PowerShell as Admin:"
    echo "  Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0"
    echo "  Start-Service sshd"
    echo "  Set-Service -Name sshd -StartupType 'Automatic'"
    exit 1
fi

# Bước 4: Pull code trên Windows
echo ""
echo "📥 Bước 4: Pull code trên Windows..."
ssh $WINDOWS_USER@$WINDOWS_IP << 'ENDSSH'
    set -e
    
    echo "📂 Di chuyển đến thư mục project..."
    cd "$WINDOWS_PROJECT_PATH" || {
        echo "❌ Không tìm thấy thư mục: $WINDOWS_PROJECT_PATH"
        exit 1
    }
    
    echo "🔄 Git pull..."
    git pull origin $BRANCH || {
        echo "❌ Git pull thất bại!"
        exit 1
    }
    
    echo "📦 Cài đặt dependencies..."
    npm install || {
        echo "⚠️  npm install có lỗi, nhưng tiếp tục..."
    }
    
    echo "✅ Hoàn thành trên Windows!"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 ĐỒNG BỘ THÀNH CÔNG!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Code đã được đồng bộ từ Mac sang Windows"
    echo "Windows IP: $WINDOWS_IP"
    echo "Project path: $WINDOWS_PROJECT_PATH"
else
    echo ""
    echo "❌ Có lỗi xảy ra khi pull code trên Windows"
    exit 1
fi

