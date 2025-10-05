#!/bin/bash

echo "🧹 Clean up an toàn với backup..."
echo ""

# Tạo backup folder với timestamp
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Tạo backup tại: $BACKUP_DIR"
echo ""

BACKUP_COUNT=0

# Backup google-apps-script/
if [ -d "google-apps-script" ]; then
  echo "   📁 Backup google-apps-script/..."
  cp -r google-apps-script "$BACKUP_DIR/"
  ((BACKUP_COUNT++))
fi

# Backup automation/
if [ -d "automation" ]; then
  echo "   📁 Backup automation/..."
  cp -r automation "$BACKUP_DIR/"
  ((BACKUP_COUNT++))
fi

# Backup src/
if [ -d "src" ]; then
  echo "   📁 Backup src/..."
  cp -r src "$BACKUP_DIR/"
  ((BACKUP_COUNT++))
fi

# Backup HTML files
HTML_FILES=(
  "task-list.html"
  "local-preview.html"
  "index.html"
  "css.html"
  "login.html"
  "task-detail.html"
  "task-edit.html"
  "js.html"
)

HTML_BACKUP_COUNT=0
for file in "${HTML_FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/"
    ((HTML_BACKUP_COUNT++))
  fi
done

if [ $HTML_BACKUP_COUNT -gt 0 ]; then
  echo "   📄 Backup $HTML_BACKUP_COUNT HTML files..."
  ((BACKUP_COUNT++))
fi

# Backup JS files
JS_FILES=(
  "code.gs"
  "data-manager.js"
  "server.js"
)

JS_BACKUP_COUNT=0
for file in "${JS_FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/"
    ((JS_BACKUP_COUNT++))
  fi
done

if [ $JS_BACKUP_COUNT -gt 0 ]; then
  echo "   📄 Backup $JS_BACKUP_COUNT JS files..."
  ((BACKUP_COUNT++))
fi

# Backup README
if [ -f "README-DEVELOPMENT.md" ]; then
  echo "   📄 Backup README-DEVELOPMENT.md..."
  cp "README-DEVELOPMENT.md" "$BACKUP_DIR/"
  ((BACKUP_COUNT++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backup hoàn tất!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Tổng kết backup:"
echo "   📦 Backup folder: $BACKUP_DIR"
echo "   📁 Số lượng items: $BACKUP_COUNT"
echo ""
echo "📁 Nội dung backup:"
ls -lh "$BACKUP_DIR"
echo ""
echo "💾 Kích thước backup:"
du -sh "$BACKUP_DIR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  Bây giờ bạn có thể chạy cleanup.sh để xóa files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Hướng dẫn:"
echo "   1. Chạy cleanup: ./cleanup.sh"
echo "   2. Nếu có vấn đề, restore từ: $BACKUP_DIR"
echo "   3. Restore command:"
echo "      cp -r $BACKUP_DIR/* ."
echo ""
echo "⚠️  Lưu ý: Backup sẽ được giữ lại, bạn có thể xóa sau khi verify"
echo "   Xóa backup: rm -rf $BACKUP_DIR"

