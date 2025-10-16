# 🚀 Deploy Thư Viện Ảnh lên Windows 10 qua Tailscale

## 📋 Tổng quan

Hướng dẫn này giúp bạn deploy ứng dụng Next.js lên máy Windows 10 sử dụng Docker, với kết nối qua Tailscale.

**Cấu hình hiện tại:**
- 🖥️ **Windows 10 PC:** IP Tailscale `100.101.50.87` (marketingpc)
- 💻 **Mac Development:** Đang code tại `/Users/nihdev/Web/thuvienanh`
- 🗄️ **PostgreSQL:** Đang chạy trên Windows tại `D:\Ninh\pg\tva`
- 🌐 **Tailscale:** Kết nối mạng riêng giữa các thiết bị

---

## 🎯 Phương án Deploy

### **Phương án A: Sync Code qua Git (Khuyến nghị)**

#### Bước 1: Push code từ Mac
```bash
# Trên Mac
cd /Users/nihdev/Web/thuvienanh
git add .
git commit -m "Update for Windows deployment"
git push origin main
```

#### Bước 2: Pull code trên Windows
```powershell
# Trên Windows (PowerShell as Administrator)
cd D:\Projects\thuvienanh
git pull origin main
```

---

### **Phương án B: Sync Code qua SCP/Tailscale**

#### Bước 1: Cài OpenSSH Server trên Windows

```powershell
# Trên Windows (PowerShell as Administrator)
# Cài OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Khởi động SSH service
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# Mở firewall cho SSH
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

#### Bước 2: Sync từ Mac sang Windows

```bash
# Trên Mac
cd /Users/nihdev/Web/thuvienanh

# Sync toàn bộ code (lần đầu)
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ nihdev@100.101.50.87:/d/Projects/thuvienanh/

# Hoặc dùng SCP
scp -r ./* nihdev@100.101.50.87:/d/Projects/thuvienanh/
```

#### Tạo script sync tự động:

```bash
# Tạo file sync-to-windows.sh
cat > sync-to-windows.sh << 'EOF'
#!/bin/bash
echo "🔄 Syncing code to Windows via Tailscale..."

rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'logs' \
  --exclude 'backups' \
  ./ nihdev@100.101.50.87:/d/Projects/thuvienanh/

echo "✅ Sync completed!"
EOF

chmod +x sync-to-windows.sh

# Chạy sync
./sync-to-windows.sh
```

---

### **Phương án C: Shared Folder qua SMB (Đơn giản nhất)**

#### Bước 1: Share folder trên Windows
```powershell
# Trên Windows
# 1. Chuột phải folder D:\Projects\thuvienanh
# 2. Properties > Sharing > Advanced Sharing
# 3. Check "Share this folder"
# 4. Permissions > Add "Everyone" với Read/Write
```

#### Bước 2: Mount từ Mac
```bash
# Trên Mac
mkdir -p ~/mnt/windows-project
mount -t smbfs //nihdev@100.101.50.87/thuvienanh ~/mnt/windows-project

# Copy code
cp -r /Users/nihdev/Web/thuvienanh/* ~/mnt/windows-project/
```

---

## 🐳 Deploy với Docker trên Windows

### **Bước 1: Chuẩn bị Windows 10**

#### 1.1. Cài Docker Desktop

```powershell
# Tải và cài Docker Desktop
# https://www.docker.com/products/docker-desktop/

# Hoặc dùng Chocolatey
choco install docker-desktop -y

# Khởi động lại máy sau khi cài
```

#### 1.2. Kiểm tra Docker
```powershell
docker --version
docker-compose --version
docker info
```

### **Bước 2: Chạy Deploy Script**

```powershell
# Trên Windows (PowerShell as Administrator)
cd D:\Projects\thuvienanh

# Chạy script deploy
.\deploy-windows-tailscale.ps1

# Hoặc với options:
.\deploy-windows-tailscale.ps1 -Rebuild    # Build lại images
.\deploy-windows-tailscale.ps1 -Clean      # Dọn dẹp trước khi deploy
```

### **Bước 3: Kiểm tra Deployment**

```powershell
# Xem trạng thái containers
docker-compose ps

# Xem logs
docker-compose logs -f

# Xem logs của app
docker-compose logs -f fabric-library

# Test kết nối
curl http://localhost:4000
```

---

## 🌐 Truy cập ứng dụng

### **Từ Windows (Local)**
```
http://localhost:4000
```

### **Từ Mac qua Tailscale**
```
http://100.101.50.87:4000
```

### **Từ thiết bị khác trong Tailscale network**
```
http://100.101.50.87:4000
```

### **pgAdmin (Database Management)**
```
http://100.101.50.87:5051
Email: admin@tva.com
Password: Villad24@
```

---

## 🔧 Quản lý Docker Containers

### **Xem trạng thái**
```powershell
docker-compose ps
docker stats
```

### **Xem logs**
```powershell
# Tất cả services
docker-compose logs -f

# Chỉ app
docker-compose logs -f fabric-library

# Chỉ database
docker-compose logs -f postgres
```

### **Restart services**
```powershell
# Restart tất cả
docker-compose restart

# Restart chỉ app
docker-compose restart fabric-library
```

### **Stop/Start**
```powershell
# Stop tất cả
docker-compose stop

# Start lại
docker-compose start

# Stop và xóa containers
docker-compose down

# Stop và xóa cả volumes (data)
docker-compose down -v
```

### **Update code và redeploy**
```powershell
# Pull code mới
git pull origin main

# Rebuild và restart
docker-compose up -d --build
```

---

## 🔒 Bảo mật

### **1. Firewall Rules**
```powershell
# Mở port cho Tailscale network
New-NetFirewallRule -DisplayName "TVA-App" -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow
New-NetFirewallRule -DisplayName "TVA-pgAdmin" -Direction Inbound -Protocol TCP -LocalPort 5051 -Action Allow
```

### **2. Chỉ cho phép truy cập từ Tailscale**
```powershell
# Giới hạn chỉ Tailscale network (100.x.x.x)
New-NetFirewallRule -DisplayName "TVA-App-Tailscale" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 4000 `
  -Action Allow `
  -RemoteAddress 100.0.0.0/8
```

---

## 💾 Backup & Restore

### **Backup Database**
```powershell
# Backup database
docker exec tva-postgres pg_dump -U postgres tva > "backups\db_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

# Backup uploads
Compress-Archive -Path "public\uploads" -DestinationPath "backups\uploads_$(Get-Date -Format 'yyyyMMdd').zip"
```

### **Restore Database**
```powershell
# Restore từ backup
docker exec -i tva-postgres psql -U postgres tva < backups\db_20250113_120000.sql
```

### **Auto Backup Script**
```powershell
# Tạo file backup-daily.ps1
@"
# Daily Backup Script
`$backupDir = "D:\Backups\thuvienanh\`$(Get-Date -Format 'yyyyMMdd')"
New-Item -Path `$backupDir -ItemType Directory -Force

# Backup database
docker exec tva-postgres pg_dump -U postgres tva > "`$backupDir\database.sql"

# Backup uploads
Compress-Archive -Path "D:\Projects\thuvienanh\public\uploads" -DestinationPath "`$backupDir\uploads.zip"

# Xóa backup cũ hơn 30 ngày
Get-ChildItem "D:\Backups\thuvienanh" -Directory | Where-Object {`$_.CreationTime -lt (Get-Date).AddDays(-30)} | Remove-Item -Recurse -Force

Write-Host "Backup completed: `$backupDir"
"@ | Out-File -FilePath "backup-daily.ps1" -Encoding UTF8

# Schedule backup hàng ngày lúc 2 AM
schtasks /create /tn "TVA-Daily-Backup" /tr "powershell.exe -File D:\Projects\thuvienanh\backup-daily.ps1" /sc daily /st 02:00 /ru SYSTEM
```

---

## 🐛 Troubleshooting

### **Docker không khởi động**
```powershell
# Restart Docker Desktop
Restart-Service docker

# Hoặc restart Docker Desktop app
Stop-Process -Name "Docker Desktop" -Force
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### **Port đã được sử dụng**
```powershell
# Kiểm tra port 4000
netstat -ano | findstr :4000

# Kill process
taskkill /PID <PID> /F
```

### **Container không healthy**
```powershell
# Xem logs chi tiết
docker-compose logs fabric-library

# Vào trong container để debug
docker exec -it tva-fabric-library sh

# Kiểm tra kết nối database
docker exec -it tva-postgres psql -U postgres -d tva
```

### **Không kết nối được database**
```powershell
# Kiểm tra PostgreSQL đang chạy
docker exec tva-postgres pg_isready -U postgres

# Test kết nối từ app
docker exec tva-fabric-library ping postgres

# Kiểm tra environment variables
docker exec tva-fabric-library env | grep POSTGRES
```

---

## 📊 Monitoring

### **Resource Usage**
```powershell
# Xem resource usage real-time
docker stats

# Xem disk usage
docker system df
```

### **Health Checks**
```powershell
# Kiểm tra health của containers
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 🚀 Quick Commands Reference

```powershell
# Deploy lần đầu
.\deploy-windows-tailscale.ps1 -Rebuild

# Update code và redeploy
git pull && docker-compose up -d --build

# Xem logs
docker-compose logs -f fabric-library

# Restart app
docker-compose restart fabric-library

# Backup database
docker exec tva-postgres pg_dump -U postgres tva > backup.sql

# Stop tất cả
docker-compose stop

# Start lại
docker-compose start

# Dọn dẹp hoàn toàn
docker-compose down -v && docker system prune -af
```

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra Docker Desktop đang chạy
3. Kiểm tra Tailscale connection: `ping 100.101.50.87`
4. Kiểm tra firewall rules
5. Restart Docker Desktop

---

**Chúc bạn deploy thành công! 🎉**

