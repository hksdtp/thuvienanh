#!/bin/bash

echo "🧹 Clean up bổ sung cho dự án TVA..."
echo ""

# 1. Xóa test images
echo "❌ Xóa test images..."
TEST_IMAGES=(
  "test-image.jpg"
  "test-image.png"
)

IMG_COUNT=0
for file in "${TEST_IMAGES[@]}"; do
  if [ -f "$file" ]; then
    rm -f "$file"
    echo "   ✅ Đã xóa $file"
    ((IMG_COUNT++))
  fi
done

if [ $IMG_COUNT -eq 0 ]; then
  echo "   ⏭️  Không có test images"
fi

# 2. Tổ chức lại documentation
echo ""
echo "📚 Tổ chức lại documentation..."
if [ ! -d "docs" ]; then
  mkdir -p docs
  echo "   ✅ Tạo folder docs/"
fi

# Di chuyển các file .md vào docs/ (trừ README.md)
MD_FILES=(
  "CLEANUP_PROJECT_GUIDE.md"
  "CLEAR_BROWSER_CACHE.md"
  "CLEAR_CACHE_COMPLETE.md"
  "DASHBOARD_MOCK_DATA_REMOVED.md"
  "DATABASE_CREDENTIALS_UPDATE.md"
  "DATABASE_NINH96_SETUP.md"
  "DATABASE_SETUP.md"
  "DOCKER_DEPLOYMENT.md"
  "DOCKER_STARTUP_SUCCESS.md"
  "GETTING_STARTED_REAL_DATA.md"
  "IMPLEMENTATION_REPORT.md"
  "MOCK_DATA_REMOVED.md"
  "PGADMIN_CONNECTION_GUIDE.md"
  "PGADMIN_GUIDE.md"
  "PORT_CHANGE_SUMMARY.md"
  "PORT_CONFLICT_RESOLUTION.md"
  "QUICK_START_SYNOLOGY_PHOTOS.md"
  "REMOTE_DATABASE_SETUP.md"
  "RUNNING_WITHOUT_DOCKER.md"
  "SIDEBAR_FIX_SUMMARY.md"
  "STORAGE_OPTIONS_FIXED.md"
  "SYNOLOGY_INTEGRATION_SUMMARY.md"
  "SYNOLOGY_PHOTOS_INTEGRATION.md"
  "UPLOAD_BUG_FIXED.md"
)

MD_COUNT=0
for file in "${MD_FILES[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" "docs/"
    ((MD_COUNT++))
  fi
done

echo "   ✅ Di chuyển $MD_COUNT files vào docs/"

# 3. Xóa .next cache (optional)
echo ""
echo "⚠️  Xóa .next cache?"
echo "   (Cache sẽ được tạo lại khi chạy npm run dev)"
echo "   Bạn có muốn xóa .next/? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  if [ -d ".next" ]; then
    rm -rf .next/
    echo "   ✅ Đã xóa .next/"
  else
    echo "   ⏭️  .next/ không tồn tại"
  fi
else
  echo "   ⏭️  Bỏ qua .next/"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Clean up bổ sung hoàn tất!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Tổng kết:"
echo "   ✅ Đã xóa: $IMG_COUNT test images"
echo "   ✅ Đã di chuyển: $MD_COUNT documentation files vào docs/"
echo ""
echo "📁 Cấu trúc mới:"
echo ""
echo "   /TVA/"
echo "   ├── docs/                    # 📚 Documentation (24 files)"
echo "   ├── app/                     # 🎨 Next.js app"
echo "   ├── components/              # 🧩 React components"
echo "   ├── lib/                     # 📦 Libraries"
echo "   ├── database/                # 🗄️  Database"
echo "   ├── public/                  # 🖼️  Public assets"
echo "   ├── node_modules/            # 📦 Dependencies"
echo "   ├── README.md                # 📖 Main README"
echo "   ├── package.json             # 📦 Package config"
echo "   ├── docker-compose.yml       # 🐳 Docker config"
echo "   └── *.config.js              # ⚙️  Config files"
echo ""
echo "🎉 Dự án đã gọn gàng hơn!"
echo ""
echo "💡 Tiếp theo:"
echo "   1. Kiểm tra: ls -la"
echo "   2. Test: npm run dev"
echo "   3. Commit: git add . && git commit -m 'Organize documentation'"

