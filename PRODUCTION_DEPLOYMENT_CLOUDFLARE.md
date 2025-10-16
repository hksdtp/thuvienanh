# 🚀 Production Deployment Guide - Cloudflare Tunnel

## 📋 Tổng quan

Hướng dẫn triển khai Production cho dự án Thư Viện Ảnh trên Windows Server với Cloudflare Tunnel.

### ✨ Tính năng

- ✅ **Domain HTTPS**: `thuvienanh.incanto.my`
- ✅ **Cloudflare Tunnel**: Expose ra internet an toàn
- ✅ **Auto-start**: Tự động khởi động khi Windows reboot
- ✅ **Synology NAS**: Lưu trữ ảnh thay cho Cloudinary
- ✅ **Docker Production**: Tối ưu hóa cho production
- ✅ **Health Checks**: Monitoring và auto-restart
- ✅ **Resource Limits**: CPU/RAM limits
- ✅ **Logging**: Structured logging với rotation

---

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────┐
│         💻 MAC (Development)                        │
│  - Code trên Mac                                    │
│  - Sync qua Tailscale                               │
│  - Trigger deployment                               │
└──────────────────┬──────────────────────────────────┘
                   │ Tailscale VPN
                   │ (100.101.50.87)
                   ▼
┌─────────────────────────────────────────────────────┐
│      🖥️  WINDOWS SERVER (Production)                │
│                                                     │
│  🐳 Docker Containers:                              │
│     - Next.js App (Port 4000)                      │
│     - Portainer (Port 9000)                        │
│                                                     │
│  💾 PostgreSQL (Native):                            │
│     - Database: tva                                │
│     - Port: 5432                                   │
│                                                     │
│  ☁️  Cloudflare Tunnel:                             │
│     - Domain: thuvienanh.incanto.my                │
│     - HTTPS auto                                   │
│     - Auto-start service                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│      🌐 INTERNET                                    │
│  https://thuvienanh.incanto.my                     │
└─────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│      💾 SYNOLOGY NAS (Storage)                      │
│  - IP: 222.252.23.248                              │
│  - Path: /Marketing/Ninh/thuvienanh               │
│  - Lưu trữ tất cả ảnh                              │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Yêu cầu

### Trên Windows Server:

- ✅ Windows 10/11 hoặc Windows Server 2019+
- ✅ Docker Desktop đã cài đặt
- ✅ PostgreSQL 16 đã cài đặt và chạy
- ✅ Database `tva` đã được tạo
- ✅ Tailscale đã cài đặt và connected
- ✅ PowerShell 5.1+

### Trên Mac (Development):

- ✅ Tailscale đã cài đặt
- ✅ SSH access đến Windows server
- ✅ rsync (thường có sẵn)

### Cloudflare:

- ✅ Tài khoản Cloudflare (miễn phí)
- ✅ Domain đã add vào Cloudflare
- ✅ Subdomain: `thuvienanh.incanto.my`

---

## 🚀 Hướng dẫn Deployment

### **Cách 1: Deploy từ Mac (Khuyến nghị)** ⭐

Đây là cách nhanh nhất và tiện nhất khi develop trên Mac.

#### Bước 1: Chuẩn bị

```bash
# Trên Mac
cd /Users/nihdev/Web/thuvienanh

# Đảm bảo Tailscale đang chạy
tailscale status

# Kiểm tra kết nối Windows
ping -c 3 100.101.50.87
```

#### Bước 2: Chạy deployment script

```bash
# Cấp quyền execute
chmod +x deploy-from-mac.sh

# Chạy deployment
./deploy-from-mac.sh
```

Script sẽ:
1. ✅ Kiểm tra Tailscale và SSH
2. ✅ Sync code sang Windows
3. ✅ Trigger deployment trên Windows
4. ✅ Kiểm tra kết quả

#### Bước 3: Truy cập

```
https://thuvienanh.incanto.my
```

---

### **Cách 2: Deploy trực tiếp trên Windows**

Nếu bạn đang làm việc trực tiếp trên Windows server.

#### Bước 1: Mở PowerShell as Administrator

```powershell
# Nhấn Windows + X, chọn "Windows PowerShell (Admin)"
```

#### Bước 2: Chạy deployment script

```powershell
cd D:\Projects\thuvienanh

# Deploy lần đầu (build image)
.\deploy-production-cloudflare.ps1 -Rebuild

# Deploy thường (không rebuild)
.\deploy-production-cloudflare.ps1

# Deploy với clean
.\deploy-production-cloudflare.ps1 -Clean -Rebuild

# Setup auto-start
.\deploy-production-cloudflare.ps1 -SetupAutoStart
```

#### Bước 3: Kiểm tra

```powershell
# Xem containers
docker-compose -f docker-compose.production.windows.yml ps

# Xem logs
docker-compose -f docker-compose.production.windows.yml logs -f

# Test local
curl http://localhost:4000

# Kiểm tra Cloudflare Tunnel
Get-Service cloudflared
```

---

## ☁️ Cấu hình Cloudflare Tunnel

### Lần đầu tiên

Script sẽ tự động:
1. Tải và cài đặt `cloudflared`
2. Mở browser để login Cloudflare
3. Tạo tunnel mới
4. Cấu hình DNS
5. Cài đặt Windows Service
6. Setup auto-start

### Thủ công (nếu cần)

```powershell
# Tải cloudflared
# https://github.com/cloudflare/cloudflared/releases

# Login
cloudflared tunnel login

# Tạo tunnel
cloudflared tunnel create thuvienanh-tunnel

# Cấu hình DNS
cloudflared tunnel route dns thuvienanh-tunnel thuvienanh.incanto.my

# Cài service
cloudflared service install

# Start service
Start-Service cloudflared

# Set auto-start
Set-Service -Name cloudflared -StartupType Automatic
```

---

## 🔧 Quản lý và Maintenance

### Docker Commands

```powershell
# Xem status
docker-compose -f docker-compose.production.windows.yml ps

# Xem logs
docker-compose -f docker-compose.production.windows.yml logs -f app

# Restart app
docker-compose -f docker-compose.production.windows.yml restart app

# Stop tất cả
docker-compose -f docker-compose.production.windows.yml stop

# Start tất cả
docker-compose -f docker-compose.production.windows.yml start

# Rebuild và restart
docker-compose -f docker-compose.production.windows.yml up -d --build
```

### Cloudflare Tunnel Commands

```powershell
# Kiểm tra service
Get-Service cloudflared

# Restart service
Restart-Service cloudflared

# Stop service
Stop-Service cloudflared

# Start service
Start-Service cloudflared

# Xem tunnel info
cloudflared tunnel info thuvienanh-tunnel

# Xem logs
cloudflared tunnel run thuvienanh-tunnel
```

### Database Backup

```powershell
# Backup database
pg_dump -U postgres -d tva > backups\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql

# Restore database
psql -U postgres -d tva < backups\backup_20241015_120000.sql
```

---

## 🔄 Workflow hàng ngày

### 1. Development trên Mac

```bash
# Code như bình thường
npm run dev

# Test local
http://localhost:4000
```

### 2. Deploy lên Production

```bash
# Từ Mac, chạy 1 lệnh
./deploy-from-mac.sh
```

### 3. Kiểm tra Production

```bash
# Truy cập
https://thuvienanh.incanto.my

# Xem logs từ Mac
ssh nihdev@100.101.50.87 'cd /d/Projects/thuvienanh && docker-compose -f docker-compose.production.windows.yml logs -f app'
```

---

## 🐛 Troubleshooting

### App không khởi động

```powershell
# Xem logs
docker-compose -f docker-compose.production.windows.yml logs app

# Kiểm tra database
psql -U postgres -d tva -c "SELECT 1;"

# Restart
docker-compose -f docker-compose.production.windows.yml restart app
```

### Cloudflare Tunnel không hoạt động

```powershell
# Kiểm tra service
Get-Service cloudflared

# Restart service
Restart-Service cloudflared

# Xem config
cat $env:USERPROFILE\.cloudflared\config.yml

# Test tunnel
cloudflared tunnel run thuvienanh-tunnel
```

### Domain không accessible

1. Kiểm tra DNS đã propagate chưa: `nslookup thuvienanh.incanto.my`
2. Kiểm tra Cloudflare Tunnel service đang chạy
3. Kiểm tra app đang chạy: `curl http://localhost:4000`
4. Kiểm tra firewall không block port 4000

### Không sync được từ Mac

```bash
# Kiểm tra Tailscale
tailscale status

# Kiểm tra SSH
ssh nihdev@100.101.50.87 "echo OK"

# Sync thủ công
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ nihdev@100.101.50.87:/d/Projects/thuvienanh/
```

---

## 📊 Monitoring

### Health Checks

App có health check endpoint:
```
http://localhost:4000/api/health
```

Docker sẽ tự động restart nếu health check fail.

### Logs

```powershell
# App logs
docker-compose -f docker-compose.production.windows.yml logs -f app

# Cloudflare logs
Get-EventLog -LogName Application -Source cloudflared -Newest 50

# System logs
Get-EventLog -LogName System -Newest 50
```

---

## 🎯 Checklist Deployment

- [ ] Tailscale đang chạy trên cả Mac và Windows
- [ ] PostgreSQL đang chạy trên Windows
- [ ] Database `tva` đã tồn tại
- [ ] Docker Desktop đang chạy
- [ ] Code đã được sync sang Windows
- [ ] `.env.production` đã được cấu hình đúng
- [ ] Cloudflared đã được cài đặt
- [ ] Cloudflare Tunnel đã được tạo và cấu hình
- [ ] DNS đã được setup
- [ ] App đã khởi động thành công
- [ ] Domain accessible qua HTTPS
- [ ] Auto-start đã được cấu hình

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Logs của Docker containers
2. Logs của Cloudflare Tunnel service
3. PostgreSQL service status
4. Network connectivity (Tailscale)

---

**Chúc bạn deployment thành công! 🎉**

