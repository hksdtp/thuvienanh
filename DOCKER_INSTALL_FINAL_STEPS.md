# 🎉 Docker Desktop đã được download!

## ✅ Trạng thái hiện tại:

- ✅ Docker Desktop Installer đã được download
- 📁 Vị trí: `D:\Ninh\DockerDesktopInstaller.exe`
- 💾 Kích thước: ~500MB

---

## 🚀 Các bước tiếp theo (QUAN TRỌNG):

### Cách 1: Cài đặt từ Windows (KHUYẾN NGHỊ)

**Trên máy Windows:**

1. Mở File Explorer
2. Đi đến `D:\Ninh\`
3. Double-click vào `DockerDesktopInstaller.exe`
4. Chọn "Use WSL 2 instead of Hyper-V" (khuyến nghị)
5. Click "OK" và đợi cài đặt (5-10 phút)
6. Click "Close and restart" khi hoàn tất
7. Sau khi restart, Docker Desktop sẽ tự động khởi động
8. Chấp nhận Docker Service Agreement
9. Đợi Docker khởi động xong (xem icon ở system tray)

### Cách 2: Cài đặt qua SSH từ Mac

```bash
# SSH vào Windows
ssh-win

# Chạy installer (cần quyền Administrator)
powershell -Command "Start-Process 'D:\Ninh\DockerDesktopInstaller.exe' -ArgumentList 'install --quiet --accept-license' -Verb RunAs -Wait"
```

**Lưu ý:** Cách này có thể yêu cầu xác nhận UAC trên Windows.

---

## 🔧 Sau khi cài đặt xong:

### 1. Verify Docker đã cài đặt:

```bash
# Từ Mac, kiểm tra Docker trên Windows
ssh-win "docker --version"
ssh-win "docker compose version"
```

### 2. Test Docker:

```bash
# Test chạy container đầu tiên
ssh-win "docker run hello-world"
```

Nếu thấy "Hello from Docker!" → Cài đặt thành công! 🎉

### 3. Cấu hình Docker cho project:

```bash
# SSH vào Windows
ssh-win

# Di chuyển đến project
cd D:\Ninh\thuvienanh

# Kiểm tra docker-compose.yml
dir docker-compose*.yml

# Build và chạy project
docker compose up -d

# Xem logs
docker compose logs -f
```

---

## 📋 Checklist cài đặt:

- [ ] Download Docker Desktop ✅ (Đã xong)
- [ ] Chạy installer
- [ ] Chọn WSL 2
- [ ] Đợi cài đặt hoàn tất
- [ ] Restart máy
- [ ] Docker Desktop tự động khởi động
- [ ] Chấp nhận Service Agreement
- [ ] Đợi Docker khởi động
- [ ] Verify: `docker --version`
- [ ] Test: `docker run hello-world`

---

## 🎯 Tạo alias để dễ sử dụng Docker:

Thêm vào `~/.zshrc` trên Mac:

```bash
# Docker aliases cho Windows
alias dw='sshpass -p "haininh1" ssh -o StrictHostKeyChecking=no Marketingpc@100.101.50.87 "cd D:\\Ninh\\thuvienanh && docker"'
alias dcw='sshpass -p "haininh1" ssh -o StrictHostKeyChecking=no Marketingpc@100.101.50.87 "cd D:\\Ninh\\thuvienanh && docker compose"'

# Shortcuts
alias docker-up='dcw up -d'
alias docker-down='dcw down'
alias docker-logs='dcw logs -f'
alias docker-ps='dw ps'
alias docker-build='dcw build'
```

Sau đó reload:

```bash
source ~/.zshrc
```

Sử dụng:

```bash
docker-up        # Start containers
docker-logs      # Xem logs
docker-ps        # List containers
docker-down      # Stop containers
docker-build     # Build images
```

---

## 🐛 Troubleshooting:

### Nếu installer không chạy được:

1. **Kiểm tra file đã download đầy đủ chưa:**
   ```bash
   ssh-win "powershell -Command \"(Get-Item D:\\Ninh\\DockerDesktopInstaller.exe).Length / 1MB\""
   ```
   Phải > 400MB

2. **Download lại nếu file bị lỗi:**
   ```bash
   ssh-win "powershell -Command \"Remove-Item D:\\Ninh\\DockerDesktopInstaller.exe; Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe' -OutFile 'D:\\Ninh\\DockerDesktopInstaller.exe' -UseBasicParsing\""
   ```

### Nếu cần WSL 2:

```bash
ssh-win "powershell -Command \"wsl --install\""
```

Sau đó restart Windows.

---

## 📞 Cần hỗ trợ?

Nếu gặp vấn đề, chạy:

```bash
# Kiểm tra Windows version
ssh-win "ver"

# Kiểm tra file installer
ssh-win "dir D:\\Ninh\\DockerDesktopInstaller.exe"

# Kiểm tra WSL
ssh-win "wsl --status"
```

---

## 🎊 Sau khi cài xong:

Bạn sẽ có thể:

1. ✅ Build Docker images trên Windows
2. ✅ Chạy containers
3. ✅ Deploy production với Docker
4. ✅ Sử dụng docker-compose
5. ✅ Điều khiển Docker từ Mac qua SSH

**Chúc mừng bạn sắp hoàn thành việc cài đặt Docker!** 🎉

