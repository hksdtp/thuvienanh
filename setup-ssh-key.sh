#!/bin/bash

# Setup SSH Key - Để không cần nhập password mỗi lần
# Sử dụng: ./setup-ssh-key.sh

WINDOWS_IP="100.101.50.87"
WINDOWS_USER="Marketingpc"

echo "🔑 Setup SSH Key cho Windows..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Kiểm tra SSH key đã tồn tại chưa
if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "📝 Tạo SSH key mới..."
    ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
    echo "✅ Đã tạo SSH key"
else
    echo "✅ SSH key đã tồn tại"
fi

echo ""
echo "📤 Copy SSH key sang Windows..."
echo "⚠️  Bạn sẽ cần nhập password Windows: haininh1"
echo ""

# Copy key sang Windows
ssh-copy-id -i ~/.ssh/id_ed25519.pub $WINDOWS_USER@$WINDOWS_IP

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 SETUP THÀNH CÔNG!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Từ giờ bạn có thể SSH vào Windows mà không cần password!"
    echo ""
    echo "Test thử:"
    echo "  ssh $WINDOWS_USER@$WINDOWS_IP \"echo 'Connected!'\""
else
    echo ""
    echo "❌ Setup thất bại!"
    echo ""
    echo "Vui lòng kiểm tra:"
    echo "  1. SSH Server đã được cài trên Windows chưa?"
    echo "  2. Password có đúng không?"
    echo "  3. Tailscale đang chạy trên cả 2 máy?"
fi

