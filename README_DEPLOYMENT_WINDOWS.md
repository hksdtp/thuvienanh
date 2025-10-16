# 🚀 Deployment Guide - Windows 10 + Docker + Tailscale

## 📖 Tài liệu hướng dẫn

Dự án này có 3 file hướng dẫn chính:

1. **[QUICK_START_WINDOWS_DOCKER.md](QUICK_START_WINDOWS_DOCKER.md)** ⚡
   - Hướng dẫn nhanh 3 bước
   - Dành cho người đã setup xong
   - Workflow hàng ngày

2. **[DEPLOY_TO_WINDOWS_TAILSCALE.md](DEPLOY_TO_WINDOWS_TAILSCALE.md)** 📚
   - Hướng dẫn chi tiết đầy đủ
   - Các phương án sync code
   - Troubleshooting
   - Backup & Monitoring

3. **[DEPLOY_WINDOWS_10_GUIDE.md](DEPLOY_WINDOWS_10_GUIDE.md)** 🔧
   - Deploy không dùng Docker
   - Sử dụng PM2
   - Chạy trực tiếp trên Windows

---

## 🎯 Chọn phương án phù hợp

### **Phương án 1: Docker (Khuyến nghị) ⭐**

**Ưu điểm:**
- ✅ Dễ deploy và quản lý
- ✅ Isolated environment
- ✅ Dễ scale và backup
- ✅ Có pgAdmin UI

**Nhược điểm:**
- ❌ Cần Docker Desktop (tốn RAM)
- ❌ Hơi phức tạp lần đầu setup

**Phù hợp với:**
- Production deployment
- Team development
- Cần quản lý nhiều services

**Hướng dẫn:** [QUICK_START_WINDOWS_DOCKER.md](QUICK_START_WINDOWS_DOCKER.md)

---

### **Phương án 2: PM2 (Đơn giản)**

**Ưu điểm:**
- ✅ Nhẹ hơn Docker
- ✅ Đơn giản, dễ hiểu
- ✅ Ít tốn tài nguyên

**Nhược điểm:**
- ❌ Phải cài PostgreSQL riêng
- ❌ Khó quản lý nhiều services
- ❌ Không có isolation

**Phù hợp với:**
- Development/Testing
- Máy cấu hình thấp
- Chỉ cần chạy app đơn giản

**Hướng dẫn:** [DEPLOY_WINDOWS_10_GUIDE.md](DEPLOY_WINDOWS_10_GUIDE.md)

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    Tailscale Network                     │
│                    (100.x.x.x/8)                        │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐     ┌─────▼─────┐
   │   Mac   │       │ Windows10 │     │  Mobile   │
   │  (Dev)  │       │  (Server) │     │  (View)   │
   └─────────┘       └───────────┘     └───────────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
         ┌──────▼───┐  ┌──▼────┐  ┌──▼──────┐
         │  Docker  │  │ Nginx │  │Portainer│
         │ Compose  │  │ :80   │  │  :9000  │
         └──────────┘  └───────┘  └─────────┘
                │
        ┌───────┼───────┐
        │       │       │
    ┌───▼──┐ ┌─▼────┐ ┌▼──────┐
    │ App  │ │ DB   │ │pgAdmin│
    │:4000 │ │:5434 │ │ :5051 │
    └──────┘ └──────┘ └───────┘
```

---

## 📋 Cấu hình hiện tại

### **Windows 10 Server**
- **IP Tailscale:** 100.101.50.87
- **Hostname:** marketingpc
- **PostgreSQL:** D:\Ninh\pg\tva (Port 5432)
- **Project Path:** D:\Projects\thuvienanh

### **Mac Development**
- **Project Path:** /Users/nihdev/Web/thuvienanh
- **Dev Server:** http://localhost:4000

### **Database**
- **Host:** 100.101.50.87
- **Port:** 5432
- **Database:** tva
- **User:** postgres
- **Password:** haininh1

### **Synology NAS**
- **Host:** 222.252.23.248
- **Ports:** 8888, 6868
- **SMB Share:** marketing

---

## 🚀 Quick Start

### **Lần đầu tiên (Setup)**

1. **Trên Windows:**
   ```powershell
   # Cài Docker Desktop
   # Download: https://www.docker.com/products/docker-desktop/
   
   # Tạo thư mục project
   mkdir D:\Projects\thuvienanh
   ```

2. **Trên Mac:**
   ```bash
   cd /Users/nihdev/Web/thuvienanh
   
   # Sync code sang Windows
   ./sync-to-windows.sh
   ```

3. **Trên Windows:**
   ```powershell
   # Deploy
   cd D:\Projects\thuvienanh
   .\deploy-windows-tailscale.ps1
   ```

4. **Truy cập:**
   ```
   http://100.101.50.87:4000
   ```

---

### **Hàng ngày (Update)**

1. **Code trên Mac**
2. **Sync:**
   ```bash
   ./sync-to-windows.sh  # Option 2 (Quick sync)
   ```
3. **Rebuild (nếu cần):**
   ```powershell
   docker-compose up -d --build
   ```

---

## 📁 Files quan trọng

### **Scripts**
- `deploy-windows-tailscale.ps1` - Deploy script cho Windows
- `sync-to-windows.sh` - Sync code từ Mac sang Windows
- `docker-compose.yml` - Docker configuration

### **Documentation**
- `QUICK_START_WINDOWS_DOCKER.md` - Quick start guide
- `DEPLOY_TO_WINDOWS_TAILSCALE.md` - Chi tiết đầy đủ
- `DEPLOY_WINDOWS_10_GUIDE.md` - Deploy không dùng Docker

### **Configuration**
- `.env` - Environment variables
- `Dockerfile` - Docker image definition
- `next.config.js` - Next.js configuration

---

## 🔧 Lệnh thường dùng

### **Sync Code**
```bash
# Từ Mac
./sync-to-windows.sh
```

### **Docker Management**
```powershell
# Trên Windows
docker-compose ps              # Xem trạng thái
docker-compose logs -f         # Xem logs
docker-compose restart         # Restart
docker-compose up -d --build   # Rebuild & restart
docker-compose stop            # Stop
docker-compose start           # Start
```

### **Backup**
```powershell
# Backup database
docker exec tva-postgres pg_dump -U postgres tva > backup.sql

# Backup uploads
Compress-Archive -Path "public\uploads" -DestinationPath "backup-uploads.zip"
```

---

## 🌐 Access URLs

| Service | Local (Windows) | Tailscale (Mac) | Credentials |
|---------|----------------|-----------------|-------------|
| **App** | http://localhost:4000 | http://100.101.50.87:4000 | - |
| **pgAdmin** | http://localhost:5051 | http://100.101.50.87:5051 | admin@tva.com / Villad24@ |
| **PostgreSQL** | localhost:5434 | 100.101.50.87:5434 | postgres / haininh1 |
| **Portainer** | http://localhost:9000 | http://100.101.50.87:9000 | Setup on first access |

---

## 🐛 Troubleshooting

### **Không kết nối được Windows**
```bash
# Kiểm tra Tailscale
ping 100.101.50.87

# Kiểm tra SSH
ssh nihdev@100.101.50.87
```

### **Docker không chạy**
```powershell
# Kiểm tra Docker
docker info

# Restart Docker Desktop
Restart-Service docker
```

### **App không start**
```powershell
# Xem logs
docker-compose logs -f fabric-library

# Kiểm tra database
docker exec tva-postgres pg_isready -U postgres

# Restart
docker-compose restart fabric-library
```

### **Port conflict**
```powershell
# Tìm process
netstat -ano | findstr :4000

# Kill process
taskkill /PID <PID> /F
```

---

## 📊 Monitoring

### **Resource Usage**
```powershell
docker stats
```

### **Logs**
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f fabric-library
docker-compose logs -f postgres
```

### **Health Check**
```powershell
docker ps
curl http://localhost:4000
```

---

## 🔒 Security

### **Firewall**
```powershell
# Chỉ cho phép Tailscale network
New-NetFirewallRule -DisplayName "TVA-Tailscale" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 4000 `
  -Action Allow `
  -RemoteAddress 100.0.0.0/8
```

### **Backup**
- Database: Tự động backup hàng ngày
- Uploads: Backup thủ công hoặc schedule
- Config: Commit vào Git

---

## 📞 Support

Nếu gặp vấn đề:

1. **Kiểm tra logs:**
   ```powershell
   docker-compose logs -f
   ```

2. **Kiểm tra services:**
   ```powershell
   docker-compose ps
   ```

3. **Restart:**
   ```powershell
   docker-compose restart
   ```

4. **Reset hoàn toàn:**
   ```powershell
   docker-compose down -v
   .\deploy-windows-tailscale.ps1 -Clean -Rebuild
   ```

---

## 📚 Tài liệu tham khảo

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Tailscale Documentation](https://tailscale.com/kb/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Happy Deploying! 🚀**

