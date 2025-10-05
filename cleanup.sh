#!/bin/bash

echo "🧹 Bắt đầu clean up dự án /ptninh..."
echo ""

# 1. Xóa Google Apps Script
echo "❌ Xóa google-apps-script/..."
if [ -d "google-apps-script" ]; then
  rm -rf google-apps-script/
  echo "   ✅ Đã xóa google-apps-script/ (~20 files)"
else
  echo "   ⏭️  google-apps-script/ không tồn tại"
fi

# 2. Xóa Automation
echo "❌ Xóa automation/..."
if [ -d "automation" ]; then
  rm -rf automation/
  echo "   ✅ Đã xóa automation/ (~12 files)"
else
  echo "   ⏭️  automation/ không tồn tại"
fi

# 3. Xóa HTML test files
echo "❌ Xóa HTML test files..."
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

HTML_COUNT=0
for file in "${HTML_FILES[@]}"; do
  if [ -f "$file" ]; then
    rm -f "$file"
    ((HTML_COUNT++))
  fi
done
echo "   ✅ Đã xóa $HTML_COUNT HTML test files"

# 4. Xóa JS test files
echo "❌ Xóa JS test files..."
JS_FILES=(
  "code.gs"
  "data-manager.js"
)

JS_COUNT=0
for file in "${JS_FILES[@]}"; do
  if [ -f "$file" ]; then
    rm -f "$file"
    ((JS_COUNT++))
  fi
done
echo "   ✅ Đã xóa $JS_COUNT JS test files"

# 5. Xóa README development
echo "❌ Xóa README-DEVELOPMENT.md..."
if [ -f "README-DEVELOPMENT.md" ]; then
  rm -f README-DEVELOPMENT.md
  echo "   ✅ Đã xóa README-DEVELOPMENT.md"
else
  echo "   ⏭️  README-DEVELOPMENT.md không tồn tại"
fi

# 6. Kiểm tra src/
echo ""
echo "⚠️  Kiểm tra src/..."
if [ -d "src" ]; then
  echo "   📁 src/ tồn tại với các files:"
  find src -type f
  echo ""
  echo "   Bạn có muốn xóa src/? (y/n)"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    rm -rf src/
    echo "   ✅ Đã xóa src/"
  else
    echo "   ⏭️  Bỏ qua src/"
  fi
else
  echo "   ⏭️  src/ không tồn tại"
fi

# 7. Kiểm tra server.js
echo ""
echo "⚠️  Kiểm tra server.js..."
if [ -f "server.js" ]; then
  echo "   📄 server.js tồn tại"
  echo "   Nội dung 5 dòng đầu:"
  head -5 server.js
  echo ""
  echo "   Bạn có muốn xóa server.js? (y/n)"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    rm -f server.js
    echo "   ✅ Đã xóa server.js"
  else
    echo "   ⏭️  Bỏ qua server.js"
  fi
else
  echo "   ⏭️  server.js không tồn tại"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Clean up hoàn tất!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Tổng kết:"
echo "   ✅ Đã xóa: google-apps-script/ (~20 files)"
echo "   ✅ Đã xóa: automation/ (~12 files)"
echo "   ✅ Đã xóa: HTML test files ($HTML_COUNT files)"
echo "   ✅ Đã xóa: JS test files ($JS_COUNT files)"
echo "   ✅ Đã xóa: README-DEVELOPMENT.md (1 file)"
echo ""
echo "📁 Files còn lại:"
ls -1 | grep -v node_modules | head -20
echo ""
echo "🎉 Dự án đã sạch sẽ!"
echo ""
echo "💡 Tiếp theo:"
echo "   1. Kiểm tra: ls -la"
echo "   2. Test: npm run dev"
echo "   3. Commit: git add . && git commit -m 'Clean up unused files'"

