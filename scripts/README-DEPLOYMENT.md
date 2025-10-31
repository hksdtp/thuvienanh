# 🚀 Deployment Scripts - Hướng Dẫn Sử Dụng

## 📋 Mục Lục

1. [Deploy Dự Án Hiện Tại](#deploy-dự-án-hiện-tại)
2. [Tạo Script Deploy Cho Dự Án Mới](#tạo-script-deploy-cho-dự-án-mới)
3. [Troubleshooting](#troubleshooting)

---

## 🎯 Deploy Dự Án Hiện Tại

### Cách 1: Dùng npm script (KHUYẾN NGHỊ)

```bash
npm run deploy
# hoặc
npm run sync
```

### Cách 2: Chạy trực tiếp

```bash
./scripts/sync-to-ubuntu.sh
```

**Lưu ý:** Cả 2 cách đều giống nhau, `npm run deploy` chỉ là alias ngắn gọn hơn.

---

## 🆕 Tạo Script Deploy Cho Dự Án Mới

### Bước 1: Copy template vào dự án mới

```bash
# Giả sử dự án mới tên là "my-new-project"
cd /Users/nihdev/Web/my-new-project

# Copy template từ dự án cũ
cp /Users/nihdev/Web/thuvienanh/scripts/TEMPLATE-sync-to-ubuntu.sh ./scripts/sync-to-ubuntu.sh

# Cấp quyền thực thi
chmod +x ./scripts/sync-to-ubuntu.sh
```

### Bước 2: Chỉnh sửa 3 biến quan trọng

Mở file `scripts/sync-to-ubuntu.sh` và sửa:

```bash
# ⚠️ SỬA 3 DÒNG NÀY
SERVER_PATH="/data/Ninh/projects/my-new-project"  # Tên folder trên server
LOCAL_PATH="/Users/nihdev/Web/my-new-project"     # Tên folder trên Mac
PM2_APP_NAME="my-new-project"                     # Tên PM2 app (phải khớp ecosystem.config.js)
```

### Bước 3: Thêm npm scripts vào package.json

```json
{
  "scripts": {
    "dev": "next dev -p 4001",
    "build": "next build",
    "deploy": "./scripts/sync-to-ubuntu.sh",
    "sync": "./scripts/sync-to-ubuntu.sh"
  }
}
```

### Bước 4: Tạo folder trên server (lần đầu tiên)

```bash
ssh nihdev@100.115.191.19
mkdir -p /data/Ninh/projects/my-new-project
exit
```

### Bước 5: Deploy lần đầu

```bash
npm run deploy
```

---

## 🔧 Tùy Chỉnh Script

### Skip build step (nếu build trên server)

Sửa trong `sync-to-ubuntu.sh`:

```bash
RUN_BUILD="false"  # Không build trên Mac, chỉ build trên server
```

### Thêm exclude patterns

Sửa phần rsync:

```bash
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env.local' \
    --exclude 'my-custom-folder' \  # Thêm dòng này
    ${LOCAL_PATH}/ \
    ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot reach server"

**Nguyên nhân:** Tailscale chưa chạy hoặc server offline

**Giải pháp:**
```bash
# Kiểm tra Tailscale trên Mac
tailscale status

# Kiểm tra ping
ping -c 3 100.115.191.19

# Khởi động Tailscale nếu cần
sudo tailscale up
```

### Lỗi: "SSH connection failed"

**Nguyên nhân:** Chưa setup SSH key

**Giải pháp:**
```bash
# Copy SSH key lên server
ssh-copy-id nihdev@100.115.191.19

# Test SSH
ssh nihdev@100.115.191.19 "echo 'SSH OK'"
```

### Lỗi: "Build failed"

**Nguyên nhân:** Lỗi TypeScript hoặc dependencies

**Giải pháp:**
```bash
# Kiểm tra lỗi build local
npm run build

# Xem log chi tiết
npm run build 2>&1 | tee build.log
```

### Lỗi: "PM2 restart failed"

**Nguyên nhân:** PM2 chưa cài hoặc app name sai

**Giải pháp:**
```bash
# SSH vào server
ssh nihdev@100.115.191.19

# Kiểm tra PM2
pm2 list

# Kiểm tra ecosystem.config.js
cat /data/Ninh/projects/my-new-project/ecosystem.config.js

# Start PM2 lần đầu
cd /data/Ninh/projects/my-new-project
pm2 start ecosystem.config.js
pm2 save
```

---

## 📊 Kiểm Tra Sau Deploy

### 1. Kiểm tra PM2 status

```bash
ssh nihdev@100.115.191.19 'pm2 status'
```

### 2. Xem logs

```bash
ssh nihdev@100.115.191.19 'pm2 logs thuvienanh --lines 50'
```

### 3. Test website

```bash
# Kiểm tra HTTP response
curl -I http://100.115.191.19:4000

# Mở browser
open http://100.115.191.19:4000
```

---

## 🎓 Best Practices

1. **Luôn test local trước khi deploy:**
   ```bash
   npm run build
   npm run dev
   ```

2. **Commit code trước khi deploy:**
   ```bash
   git add .
   git commit -m "Feature: Add new feature"
   npm run deploy
   ```

3. **Backup database trước khi deploy breaking changes:**
   ```bash
   ssh nihdev@100.115.191.19 'pg_dump -U postgres tva > /tmp/backup-$(date +%Y%m%d).sql'
   ```

4. **Monitor logs sau deploy:**
   ```bash
   ssh nihdev@100.115.191.19 'pm2 logs thuvienanh --lines 100'
   ```

---

## 📝 Checklist Deploy Dự Án Mới

- [ ] Copy `TEMPLATE-sync-to-ubuntu.sh` → `sync-to-ubuntu.sh`
- [ ] Sửa `SERVER_PATH`, `LOCAL_PATH`, `PM2_APP_NAME`
- [ ] Thêm `"deploy"` và `"sync"` vào `package.json`
- [ ] Tạo folder trên server: `mkdir -p /data/Ninh/projects/PROJECT_NAME`
- [ ] Tạo `ecosystem.config.js` với đúng `PM2_APP_NAME`
- [ ] Test SSH: `ssh nihdev@100.115.191.19`
- [ ] Deploy lần đầu: `npm run deploy`
- [ ] Verify: `ssh nihdev@100.115.191.19 'pm2 status'`

---

**Tác giả:** Nguyen Hai Ninh (nihdev)  
**Cập nhật:** 2025-10-23  
**Version:** 1.0.0

