#!/bin/bash

# Quick Sync - Đồng bộ nhanh không cần confirm
# Sử dụng: ./quick-sync.sh "commit message"

WINDOWS_IP="100.101.50.87"
WINDOWS_USER="Marketingpc"
WINDOWS_PATH="/d/Ninh/thuvienanh"

# Lấy commit message từ tham số hoặc dùng mặc định
COMMIT_MSG="${1:-Update code}"

echo "🚀 Quick Sync..."

# Add, commit, push
git add -A
git commit -m "$COMMIT_MSG" || echo "No changes to commit"
git push origin main

# Pull trên Windows
echo "📥 Pulling on Windows..."
ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && git pull origin main && npm install"

echo "✅ Done!"

