# 🧹 Hướng Dẫn Clean Up Dự Án /ptninh

**Ngày tạo:** 2025-09-30  
**Mục đích:** Xóa file rác, file test, file không cần thiết để dự án gọn gàng, sạch đẹp  

---

## 📋 **PHÂN TÍCH DỰ ÁN**

### **Cấu Trúc Hiện Tại:**

```
/ptninh/
├── google-apps-script/      # ❌ Thư mục Google Apps Script (không dùng)
├── automation/               # ❌ Scripts automation test (không dùng)
├── node_modules/             # ✅ Giữ lại (cần thiết)
├── src/                      # ⚠️ Chỉ có 1 file, có thể xóa
├── *.html                    # ❌ Nhiều file HTML test/demo
├── *.js                      # ❌ File JS test/demo
├── server.js                 # ⚠️ Kiểm tra xem có dùng không
├── package.json              # ✅ Giữ lại
└── README-*.md               # ❌ File README development
```

---

## 🗑️ **DANH SÁCH FILE/FOLDER CẦN XÓA**

### **1. Thư Mục Google Apps Script** ❌

**Lý do:** Dự án này là TVA Fabric Library (Next.js), không phải Google Apps Script

**Xóa:**
```bash
rm -rf google-apps-script/
```

**Files bị xóa:**
- `google-apps-script/Code.gs`
- `google-apps-script/Tasks*.html` (7 files)
- `google-apps-script/Login.html`
- `google-apps-script/TaskDetail.html`
- `google-apps-script/TaskEdit.html`
- `google-apps-script/TestPage.html`
- `google-apps-script/*.md` (4 files: DEPLOY-NOW, SETUP, INTEGRATION-GUIDE, README)
- `google-apps-script/.clasp.json`
- `google-apps-script/appsscript.json`

**Tổng:** ~20 files

---

### **2. Thư Mục Automation** ❌

**Lý do:** Scripts test automation không cần thiết cho production

**Xóa:**
```bash
rm -rf automation/
```

**Files bị xóa:**
- `automation/serena-auto-update.js`
- `automation/test-urls.sh`
- `automation/browser-test.js`
- `automation/test-error.png`
- `automation/config.js`
- `automation/run-with-browser.js`
- `automation/apps-script-api-updater.js`
- `automation/test-login-flow.js`
- `automation/apps-script-updater.js`
- `automation/login-page.png`
- `automation/quick-update.js`
- `automation/copy-to-clipboard.js`

**Tổng:** ~12 files

---

### **3. File HTML Test/Demo** ❌

**Lý do:** Các file HTML test không liên quan đến dự án Next.js

**Xóa:**
```bash
rm -f task-list.html
rm -f local-preview.html
rm -f index.html
rm -f css.html
rm -f login.html
rm -f task-detail.html
rm -f task-edit.html
rm -f js.html
```

**Files bị xóa:**
- `task-list.html` - Task list demo
- `local-preview.html` - Preview demo
- `index.html` - Index demo
- `css.html` - CSS demo
- `login.html` - Login demo
- `task-detail.html` - Task detail demo
- `task-edit.html` - Task edit demo
- `js.html` - JS demo

**Tổng:** 8 files

---

### **4. File JS Test/Demo** ❌

**Lý do:** File JS test không liên quan đến dự án Next.js

**Xóa:**
```bash
rm -f code.gs
rm -f data-manager.js
rm -f server.js  # ⚠️ Kiểm tra trước khi xóa
```

**Files bị xóa:**
- `code.gs` - Google Apps Script code (không dùng)
- `data-manager.js` - Data manager demo (không dùng)
- `server.js` - ⚠️ **KIỂM TRA:** Có thể là Express server test

**Tổng:** 2-3 files

---

### **5. Thư Mục src/** ⚠️

**Lý do:** Chỉ có 1 file component, có thể không cần thiết

**Kiểm tra:**
```bash
ls -la src/components/dashboard/
```

**Nếu không dùng:**
```bash
rm -rf src/
```

**Files bị xóa:**
- `src/components/dashboard/department-tasks-preview.tsx`

**Tổng:** 1 file

---

### **6. File README Development** ❌

**Lý do:** File README development không cần thiết cho production

**Xóa:**
```bash
rm -f README-DEVELOPMENT.md
```

**Files bị xóa:**
- `README-DEVELOPMENT.md`

**Tổng:** 1 file

---

## ✅ **DANH SÁCH FILE/FOLDER GIỮ LẠI**

### **1. Thư Mục node_modules/** ✅

**Lý do:** Dependencies cần thiết cho dự án

**Giữ lại:** `node_modules/`

---

### **2. File Package** ✅

**Lý do:** Cấu hình npm cần thiết

**Giữ lại:**
- `package.json`
- `package-lock.json`

---

### **3. File Markdown Documentation** ✅

**Lý do:** Tài liệu quan trọng đã tạo

**Giữ lại:**
- `STORAGE_OPTIONS_FIXED.md`
- `UPLOAD_BUG_FIXED.md`
- `DASHBOARD_MOCK_DATA_REMOVED.md`
- `MOCK_DATA_REMOVED.md`
- `CLEAR_CACHE_COMPLETE.md`
- `CLEAR_BROWSER_CACHE.md`
- `GETTING_STARTED_REAL_DATA.md`
- `RUNNING_WITHOUT_DOCKER.md`

---

## 🚀 **SCRIPT CLEAN UP TỰ ĐỘNG**

### **Script 1: Clean Up Toàn Bộ** (Khuyến nghị)

Tạo file `cleanup.sh`:

```bash
#!/bin/bash

echo "🧹 Bắt đầu clean up dự án /ptninh..."

# 1. Xóa Google Apps Script
echo "❌ Xóa google-apps-script/..."
rm -rf google-apps-script/

# 2. Xóa Automation
echo "❌ Xóa automation/..."
rm -rf automation/

# 3. Xóa HTML test files
echo "❌ Xóa HTML test files..."
rm -f task-list.html
rm -f local-preview.html
rm -f index.html
rm -f css.html
rm -f login.html
rm -f task-detail.html
rm -f task-edit.html
rm -f js.html

# 4. Xóa JS test files
echo "❌ Xóa JS test files..."
rm -f code.gs
rm -f data-manager.js

# 5. Xóa README development
echo "❌ Xóa README-DEVELOPMENT.md..."
rm -f README-DEVELOPMENT.md

# 6. Xóa src/ nếu không dùng
echo "⚠️  Kiểm tra src/..."
if [ -d "src" ]; then
  echo "   src/ tồn tại. Bạn có muốn xóa? (y/n)"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    rm -rf src/
    echo "   ✅ Đã xóa src/"
  else
    echo "   ⏭️  Bỏ qua src/"
  fi
fi

# 7. Kiểm tra server.js
echo "⚠️  Kiểm tra server.js..."
if [ -f "server.js" ]; then
  echo "   server.js tồn tại. Bạn có muốn xóa? (y/n)"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    rm -f server.js
    echo "   ✅ Đã xóa server.js"
  else
    echo "   ⏭️  Bỏ qua server.js"
  fi
fi

echo ""
echo "✅ Clean up hoàn tất!"
echo ""
echo "📊 Tổng kết:"
echo "   ✅ Đã xóa: google-apps-script/ (~20 files)"
echo "   ✅ Đã xóa: automation/ (~12 files)"
echo "   ✅ Đã xóa: HTML test files (8 files)"
echo "   ✅ Đã xóa: JS test files (2-3 files)"
echo "   ✅ Đã xóa: README-DEVELOPMENT.md (1 file)"
echo ""
echo "   📁 Giữ lại: node_modules/"
echo "   📁 Giữ lại: package.json, package-lock.json"
echo "   📁 Giữ lại: *.md documentation files"
echo ""
echo "🎉 Dự án đã sạch sẽ!"
```

**Chạy:**
```bash
chmod +x cleanup.sh
./cleanup.sh
```

---

### **Script 2: Clean Up An Toàn** (Backup trước)

Tạo file `cleanup-safe.sh`:

```bash
#!/bin/bash

echo "🧹 Clean up an toàn với backup..."

# Tạo backup folder
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Tạo backup tại: $BACKUP_DIR"

# Backup trước khi xóa
if [ -d "google-apps-script" ]; then
  cp -r google-apps-script "$BACKUP_DIR/"
fi

if [ -d "automation" ]; then
  cp -r automation "$BACKUP_DIR/"
fi

if [ -d "src" ]; then
  cp -r src "$BACKUP_DIR/"
fi

# Copy HTML files
for file in task-list.html local-preview.html index.html css.html login.html task-detail.html task-edit.html js.html; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/"
  fi
done

# Copy JS files
for file in code.gs data-manager.js server.js; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/"
  fi
done

# Copy README
if [ -f "README-DEVELOPMENT.md" ]; then
  cp "README-DEVELOPMENT.md" "$BACKUP_DIR/"
fi

echo "✅ Backup hoàn tất!"
echo ""
echo "🗑️  Bây giờ bạn có thể chạy cleanup.sh để xóa files"
echo "    Nếu có vấn đề, restore từ: $BACKUP_DIR"
```

**Chạy:**
```bash
chmod +x cleanup-safe.sh
./cleanup-safe.sh
./cleanup.sh
```

---

## 📊 **TỔNG KẾT**

### **Trước Clean Up:**

```
/ptninh/
├── google-apps-script/      (~20 files)
├── automation/               (~12 files)
├── src/                      (1 file)
├── *.html                    (8 files)
├── *.js                      (3 files)
├── *.md                      (9 files)
├── node_modules/             (nhiều files)
└── package*.json             (2 files)

Tổng: ~55+ files (không kể node_modules)
```

### **Sau Clean Up:**

```
/ptninh/
├── node_modules/             (giữ lại)
├── *.md                      (8 files - documentation)
├── package.json              (1 file)
└── package-lock.json         (1 file)

Tổng: ~10 files (không kể node_modules)
```

### **Kết Quả:**

- ✅ **Đã xóa:** ~45 files không cần thiết
- ✅ **Giảm:** ~82% số lượng files
- ✅ **Giữ lại:** Chỉ files cần thiết và documentation

---

## ⚠️ **LƯU Ý QUAN TRỌNG**

### **1. Kiểm Tra Trước Khi Xóa:**

```bash
# Kiểm tra server.js có đang chạy không
ps aux | grep server.js

# Kiểm tra src/ có được import không
grep -r "src/components" .

# Kiểm tra automation/ có được dùng không
grep -r "automation/" .
```

### **2. Backup Trước Khi Xóa:**

```bash
# Tạo backup toàn bộ dự án
tar -czf ptninh-backup-$(date +%Y%m%d).tar.gz \
  google-apps-script/ \
  automation/ \
  src/ \
  *.html \
  *.js \
  README-DEVELOPMENT.md
```

### **3. Git Commit Trước Khi Xóa:**

```bash
# Commit trạng thái hiện tại
git add .
git commit -m "Backup before cleanup"

# Sau khi clean up
git add .
git commit -m "Clean up: Remove unused files and folders"
```

---

## 🎯 **HÀNH ĐỘNG TIẾP THEO**

### **Bước 1: Backup**
```bash
./cleanup-safe.sh
```

### **Bước 2: Clean Up**
```bash
./cleanup.sh
```

### **Bước 3: Verify**
```bash
ls -la
# Kiểm tra chỉ còn:
# - node_modules/
# - *.md (documentation)
# - package.json
# - package-lock.json
```

### **Bước 4: Test**
```bash
# Test dự án vẫn chạy được
npm run dev
# Mở: http://localhost:4000
```

### **Bước 5: Commit**
```bash
git add .
git commit -m "Clean up: Remove 45+ unused files"
git push
```

---

**✅ Hoàn thành! Dự án đã sạch sẽ, gọn gàng! 🎉**

