# 🐳 Hướng dẫn cài Docker trên Windows

## 🎯 Có 2 cách cài đặt:

### Cách 1: Tự động từ Mac (Khuyến nghị nếu có quyền Admin)
### Cách 2: Thủ công trên Windows (Đơn giản nhất)

---

## 🚀 Cách 1: Cài đặt tự động từ Mac

### Bước 1: Copy script sang Windows

```bash
./install-docker-on-windows.sh
```

**Lưu ý:** Script sẽ yêu cầu quyền Administrator trên Windows.

---

## 🖱️ Cách 2: Cài đặt thủ công trên Windows (KHUYẾN NGHỊ)

### Yêu cầu hệ thống:

- ✅ Windows 10 64-bit: Pro, Enterprise, hoặc Education (Build 19041 trở lên)
- ✅ Windows 11 64-bit
- ✅ Bật Hyper-V và WSL 2
- ✅ 4GB RAM (khuyến nghị 8GB+)

### Các bước cài đặt:

#### Bước 1: Bật WSL 2

Mở **PowerShell as Administrator** và chạy:

```powershell
# Bật WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Bật Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart máy
Restart-Computer
```

#### Bước 2: Cài WSL 2 kernel update

Sau khi restart, mở PowerShell as Administrator:

```powershell
# Download và cài WSL 2 kernel update
wsl --install

# Hoặc download thủ công từ:
# https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi

# Set WSL 2 làm mặc định
wsl --set-default-version 2
```

#### Bước 3: Download Docker Desktop

**Cách A: Qua trình duyệt**
1. Truy cập: https://www.docker.com/products/docker-desktop/
2. Click "Download for Windows"
3. Chạy file `Docker Desktop Installer.exe`

**Cách B: Qua PowerShell**

```powershell
# Download Docker Desktop
$url = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$output = "$env:USERPROFILE\Downloads\DockerDesktopInstaller.exe"
Invoke-WebRequest -Uri $url -OutFile $output

# Chạy installer
Start-Process -FilePath $output -Wait
```

#### Bước 4: Cài đặt Docker Desktop

1. Chạy `Docker Desktop Installer.exe`
2. Chọn "Use WSL 2 instead of Hyper-V" (khuyến nghị)
3. Click "OK" để cài đặt
4. Đợi quá trình cài đặt hoàn tất (5-10 phút)
5. Click "Close and restart" khi được yêu cầu

#### Bước 5: Khởi động Docker Desktop

1. Sau khi restart, Docker Desktop sẽ tự động khởi động
2. Chấp nhận "Docker Subscription Service Agreement"
3. Đợi Docker khởi động hoàn tất (xem icon ở system tray)
4. Khi icon Docker không còn "animating", Docker đã sẵn sàng

#### Bước 6: Verify cài đặt

Mở PowerShell và chạy:

```powershell
# Kiểm tra Docker version
docker --version

# Kiểm tra Docker Compose
docker compose version

# Test chạy container
docker run hello-world
```

Nếu thấy "Hello from Docker!" thì cài đặt thành công! 🎉

---

## 🔧 Cấu hình Docker cho project

### 1. Cấu hình WSL 2 integration

1. Mở Docker Desktop
2. Vào **Settings** → **Resources** → **WSL Integration**
3. Bật "Enable integration with my default WSL distro"
4. Click "Apply & Restart"

### 2. Cấu hình Resources

1. Vào **Settings** → **Resources**
2. Điều chỉnh:
   - **CPUs:** 4 (hoặc 50% số CPU)
   - **Memory:** 4GB (hoặc 50% RAM)
   - **Swap:** 1GB
   - **Disk image size:** 60GB
3. Click "Apply & Restart"

### 3. Cấu hình Docker Daemon

Vào **Settings** → **Docker Engine**, thêm cấu hình:

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "features": {
    "buildkit": true
  }
}
```

Click "Apply & Restart"

---

## 🧪 Test Docker với project

### Từ Mac, SSH vào Windows và test:

```bash
# SSH vào Windows
ssh-win

# Di chuyển đến project
cd D:\Ninh\thuvienanh

# Kiểm tra Docker
docker --version
docker compose version

# Build và chạy project (nếu có docker-compose.yml)
docker compose up -d

# Xem logs
docker compose logs -f

# Dừng containers
docker compose down
```

### Hoặc chạy từ Mac:

```bash
# Kiểm tra Docker trên Windows
sshpass -p "haininh1" ssh -o StrictHostKeyChecking=no Marketingpc@100.101.50.87 "docker --version"

# Build project trên Windows
sshpass -p "haininh1" ssh -o StrictHostKeyChecking=no Marketingpc@100.101.50.87 "cd D:\Ninh\thuvienanh && docker compose up -d"
```

---

## 🐛 Troubleshooting

### Lỗi: "WSL 2 installation is incomplete"

**Giải pháp:**
```powershell
# Cài WSL 2 kernel update
wsl --install
wsl --set-default-version 2
```

### Lỗi: "Docker Desktop requires Windows 10 Pro/Enterprise"

**Giải pháp:**
- Nếu dùng Windows 10 Home, cần upgrade lên Pro
- Hoặc dùng Docker Toolbox (cũ hơn, không khuyến nghị)

### Lỗi: "Hardware assisted virtualization and data execution protection must be enabled"

**Giải pháp:**
1. Restart máy
2. Vào BIOS/UEFI (thường nhấn F2, F10, hoặc Del khi khởi động)
3. Tìm và bật:
   - Intel VT-x / AMD-V
   - Intel VT-d / AMD IOMMU
4. Save và restart

### Docker Desktop không khởi động

**Giải pháp:**
```powershell
# Reset Docker Desktop
cd "C:\Program Files\Docker\Docker"
.\DockerCli.exe -Uninstall
.\DockerCli.exe -Install

# Hoặc reinstall hoàn toàn
```

### Lỗi: "docker: command not found" trong SSH

**Giải pháp:**
```powershell
# Thêm Docker vào PATH
$env:Path += ";C:\Program Files\Docker\Docker\resources\bin"

# Hoặc restart PowerShell
```

---

## 📊 So sánh Docker Desktop vs Docker Engine

| Tính năng | Docker Desktop | Docker Engine (Linux) |
|-----------|----------------|----------------------|
| GUI | ✅ Có | ❌ Không |
| WSL 2 Integration | ✅ Có | N/A |
| Kubernetes | ✅ Có | ❌ Không |
| Dễ cài đặt | ✅ Rất dễ | ⚠️ Trung bình |
| Performance | ⚠️ Tốt | ✅ Rất tốt |
| Khuyến nghị | Windows/Mac | Linux Server |

---

## 🎯 Workflow sau khi cài Docker

### 1. Code trên Mac, build trên Windows:

```bash
# Sync code
sync "Update Dockerfile"

# Build trên Windows
ssh-win "cd D:\Ninh\thuvienanh && docker compose build"

# Run trên Windows
ssh-win "cd D:\Ninh\thuvienanh && docker compose up -d"

# Xem logs
ssh-win "cd D:\Ninh\thuvienanh && docker compose logs -f"
```

### 2. Tạo alias cho Docker commands:

Thêm vào `~/.zshrc`:

```bash
alias docker-win='sshpass -p "haininh1" ssh -o StrictHostKeyChecking=no Marketingpc@100.101.50.87 "cd D:\Ninh\thuvienanh && docker"'
alias docker-compose-win='sshpass -p "haininh1" ssh -o StrictHostKeyChecking=no Marketingpc@100.101.50.87 "cd D:\Ninh\thuvienanh && docker compose"'
```

Sau đó:

```bash
source ~/.zshrc

# Sử dụng
docker-win ps
docker-compose-win up -d
docker-compose-win logs -f
```

---

## 📚 Tài liệu tham khảo

- Docker Desktop for Windows: https://docs.docker.com/desktop/install/windows-install/
- WSL 2: https://docs.microsoft.com/en-us/windows/wsl/install
- Docker Compose: https://docs.docker.com/compose/

---

## ✅ Checklist cài đặt

- [ ] Bật WSL 2
- [ ] Cài WSL 2 kernel update
- [ ] Download Docker Desktop
- [ ] Cài đặt Docker Desktop
- [ ] Restart máy
- [ ] Chấp nhận Docker Service Agreement
- [ ] Đợi Docker khởi động
- [ ] Verify: `docker --version`
- [ ] Test: `docker run hello-world`
- [ ] Cấu hình Resources
- [ ] Test với project

---

## 🆘 Cần hỗ trợ?

Nếu gặp vấn đề, chạy lệnh sau để thu thập thông tin:

```powershell
# Kiểm tra Windows version
winver

# Kiểm tra WSL
wsl --status

# Kiểm tra Docker
docker version
docker info

# Kiểm tra Docker Desktop logs
Get-Content "$env:LOCALAPPDATA\Docker\log.txt" -Tail 50
```

Gửi output cho tôi để được hỗ trợ!

