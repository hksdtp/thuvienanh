#!/bin/bash

# Sync với password - Sử dụng sshpass để tự động nhập password
# Cài đặt: brew install sshpass

WINDOWS_IP="100.101.50.87"
WINDOWS_USER="Marketingpc"
WINDOWS_PASS="haininh1"
WINDOWS_PATH="/d/Ninh/thuvienanh"
COMMIT_MSG="${1:-Update code}"

echo "🚀 Syncing code..."

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass chưa được cài đặt"
    echo "Đang cài đặt sshpass..."
    brew install hudochenkov/sshpass/sshpass
fi

# Add, commit, push
echo "📝 Committing changes..."
git add -A
git commit -m "$COMMIT_MSG" || echo "No changes to commit"

echo "📤 Pushing to GitHub..."
git push origin main

# Pull on Windows using sshpass
echo "📥 Pulling on Windows..."
sshpass -p "$WINDOWS_PASS" ssh -o StrictHostKeyChecking=no $WINDOWS_USER@$WINDOWS_IP "powershell -Command \"cd D:\\Ninh\\thuvienanh; git pull origin main; npm install\""

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Sync thành công!"
else
    echo ""
    echo "❌ Có lỗi xảy ra"
fi

