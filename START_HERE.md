# 🎯 START HERE - Deploy lên Windows 10 qua Tailscale

## 📊 Tình trạng hiện tại

✅ **Đã có:**
- Tailscale đang chạy (ping được 100.101.50.87)
- PostgreSQL đang chạy trên Windows (100.101.50.87:5432)
- Code đang ở Mac: `/Users/nihdev/Web/thuvienanh`

❌ **Cần làm:**
- Cài Docker Desktop trên Windows
- Setup SSH trên Windows (optional nhưng khuyến nghị)
- Sync code từ Mac sang Windows
- Deploy Docker containers

---

## 🚀 Hướng dẫn từng bước

### **BƯỚC 1: Cài Docker Desktop trên Windows** (15 phút)

#### Trên Windows 10:

1. **Download Docker Desktop:**
   - Truy cập: https://www.docker.com/products/docker-desktop/
   - Download "Docker Desktop for Windows"

2. **Cài đặt:**
   - Chạy file installer
   - Chọn "Use WSL 2 instead of Hyper-V" (khuyến nghị)
   - Nhấn Install

3. **Khởi động lại máy**

4. **Mở Docker Desktop:**
   - Đợi Docker khởi động hoàn tất (icon Docker ở system tray màu xanh)
   - Chấp nhận Terms of Service

5. **Kiểm tra:**
   ```powershell
   # Mở PowerShell
   docker --version
   docker-compose --version
   docker info
   ```

**✅ Hoàn thành Bước 1 khi thấy Docker version và info**

---

### **BƯỚC 2: Setup SSH trên Windows** (10 phút - Optional)

#### Trên Windows (PowerShell as Administrator):

```powershell
# Cài OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Khởi động SSH
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# Mở firewall
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

#### Trên Mac:

```bash
# Test SSH
ssh nihdev@100.101.50.87

# Nếu hỏi password, nhập password Windows của bạn
# Nếu kết nối OK, gõ 'exit'
```

**✅ Hoàn thành Bước 2 khi SSH được từ Mac**

📖 **Chi tiết:** Xem [SETUP_SSH_WINDOWS.md](SETUP_SSH_WINDOWS.md)

---

### **BƯỚC 3: Chuẩn bị thư mục trên Windows** (2 phút)

#### Trên Windows (PowerShell):

```powershell
# Tạo thư mục project
New-Item -Path "D:\Projects\thuvienanh" -ItemType Directory -Force

# Kiểm tra
cd D:\Projects\thuvienanh
```

**✅ Hoàn thành Bước 3 khi thư mục đã tạo**

---

### **BƯỚC 4: Sync code từ Mac sang Windows** (5 phút)

#### Cách A: Dùng SSH (Nếu đã setup SSH)

```bash
# Trên Mac
cd /Users/nihdev/Web/thuvienanh

# Chạy script sync
./sync-to-windows.sh

# Chọn option 1 (Full sync)
```

#### Cách B: Dùng Git (Nếu có repository)

```bash
# Trên Mac - Push code
git add .
git commit -m "Prepare for Windows deployment"
git push origin main
```

```powershell
# Trên Windows - Pull code
cd D:\Projects\thuvienanh
git clone <your-repo-url> .
# Hoặc nếu đã clone:
git pull origin main
```

#### Cách C: Dùng USB/Network Share (Thủ công)

1. Copy toàn bộ folder từ Mac sang USB
2. Cắm USB vào Windows
3. Copy vào `D:\Projects\thuvienanh`

**✅ Hoàn thành Bước 4 khi code đã có trên Windows**

---

### **BƯỚC 5: Deploy Docker trên Windows** (10 phút)

#### Trên Windows (PowerShell as Administrator):

```powershell
# Di chuyển vào thư mục project
cd D:\Projects\thuvienanh

# Chạy deploy script
.\deploy-windows-tailscale.ps1

# Hoặc manual:
docker-compose up -d --build
```

**Lần đầu build sẽ mất 5-10 phút**

**✅ Hoàn thành Bước 5 khi thấy "Deployment completed"**

---

### **BƯỚC 6: Kiểm tra và truy cập** (2 phút)

#### Trên Windows:

```powershell
# Xem trạng thái
docker-compose ps

# Xem logs
docker-compose logs -f fabric-library
```

#### Trên Mac:

```bash
# Kiểm tra kết nối
./check-windows-connection.sh

# Mở app trong browser
open http://100.101.50.87:4000
```

#### Trên Browser (bất kỳ thiết bị nào trong Tailscale):

```
http://100.101.50.87:4000
```

**✅ Hoàn thành Bước 6 khi thấy app chạy**

---

## 📋 Checklist đầy đủ

### Trên Windows 10:
- [ ] Docker Desktop đã cài và đang chạy
- [ ] SSH Server đã cài và đang chạy (optional)
- [ ] Tailscale đang chạy (IP: 100.101.50.87)
- [ ] PostgreSQL đang chạy
- [ ] Thư mục `D:\Projects\thuvienanh` đã tạo
- [ ] Code đã được sync vào thư mục
- [ ] Docker containers đang chạy
- [ ] Firewall đã mở port 4000, 5051, 5434

### Trên Mac:
- [ ] Tailscale đang chạy
- [ ] Ping được 100.101.50.87
- [ ] SSH được vào Windows (optional)
- [ ] Scripts đã chmod +x

---

## 🎯 Workflow sau khi setup xong

### **Hàng ngày:**

1. **Code trên Mac** như bình thường

2. **Sync code sang Windows:**
   ```bash
   ./sync-to-windows.sh  # Chọn option 2 (Quick sync)
   ```

3. **Rebuild nếu cần:**
   ```bash
   ./remote-deploy.sh  # Chọn option 3 (Rebuild)
   ```

4. **Test:**
   ```
   http://100.101.50.87:4000
   ```

### **Khi cần update:**

```bash
# Từ Mac - One command deploy
./remote-deploy.sh  # Chọn option 1 (Full deploy)
```

---

## 🔧 Scripts đã tạo

| Script | Mục đích | Chạy từ |
|--------|----------|---------|
| `check-windows-connection.sh` | Kiểm tra kết nối | Mac |
| `sync-to-windows.sh` | Sync code | Mac |
| `remote-deploy.sh` | Deploy từ xa | Mac |
| `deploy-windows-tailscale.ps1` | Deploy script | Windows |
| `manage-docker.ps1` | Quản lý Docker | Windows |

---

## 📚 Tài liệu chi tiết

1. **[QUICK_START_WINDOWS_DOCKER.md](QUICK_START_WINDOWS_DOCKER.md)**
   - Quick start 3 bước
   - Workflow hàng ngày

2. **[DEPLOY_TO_WINDOWS_TAILSCALE.md](DEPLOY_TO_WINDOWS_TAILSCALE.md)**
   - Hướng dẫn chi tiết đầy đủ
   - Troubleshooting

3. **[SETUP_SSH_WINDOWS.md](SETUP_SSH_WINDOWS.md)**
   - Setup SSH chi tiết
   - Passwordless authentication

4. **[README_DEPLOYMENT_WINDOWS.md](README_DEPLOYMENT_WINDOWS.md)**
   - Tổng quan kiến trúc
   - URLs và credentials

---

## 🆘 Cần giúp đỡ?

### **Không kết nối được Windows:**
```bash
# Kiểm tra Tailscale
sudo tailscale status
ping 100.101.50.87
```

### **Docker không chạy:**
```powershell
# Trên Windows
docker info
# Nếu lỗi, mở Docker Desktop
```

### **SSH không được:**
- Xem [SETUP_SSH_WINDOWS.md](SETUP_SSH_WINDOWS.md)
- Hoặc deploy thủ công trên Windows

### **App không start:**
```powershell
# Xem logs
docker-compose logs -f
```

---

## 🎯 Bắt đầu ngay

### **Nếu chưa có gì:**

1. Cài Docker Desktop trên Windows
2. Chạy `./check-windows-connection.sh` trên Mac
3. Follow hướng dẫn từ script

### **Nếu đã có Docker:**

1. Chạy `./sync-to-windows.sh` trên Mac
2. Chạy `.\deploy-windows-tailscale.ps1` trên Windows
3. Truy cập http://100.101.50.87:4000

### **Nếu muốn deploy remote:**

1. Setup SSH trên Windows (xem SETUP_SSH_WINDOWS.md)
2. Chạy `./remote-deploy.sh` trên Mac
3. Chọn option 1 (Full deploy)

---

## 📞 Quick Commands

```bash
# Từ Mac
./check-windows-connection.sh    # Kiểm tra kết nối
./sync-to-windows.sh             # Sync code
./remote-deploy.sh               # Deploy menu
open http://100.101.50.87:4000   # Mở app
```

```powershell
# Trên Windows
.\deploy-windows-tailscale.ps1   # Deploy
.\manage-docker.ps1              # Management menu
docker-compose ps                # Status
docker-compose logs -f           # Logs
```

---

**Bắt đầu từ BƯỚC 1 và làm tuần tự! 🚀**

