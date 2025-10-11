# 🪟 Deploy Thư Viện Ảnh trên Windows 10

## ⚠️ Lưu ý quan trọng
- Windows 10 KHÔNG PHẢI server OS, chỉ nên dùng cho development/testing
- Giới hạn 20 concurrent connections 
- Cần Windows 10 Pro/Enterprise cho đầy đủ tính năng

## 📋 Yêu cầu hệ thống

### **Hardware:**
- RAM: Tối thiểu 8GB (khuyến nghị 16GB)
- CPU: 4 cores trở lên
- Storage: 50GB free space
- Network: IP tĩnh hoặc Dynamic DNS

### **Software:**
- Windows 10 Pro/Enterprise (Build 19041+)
- Node.js 18+ LTS
- PostgreSQL 15
- Git
- PowerShell 5.1+

## 🚀 Bước 1: Cài đặt Prerequisites

### **1.1 Cài Node.js**
```powershell
# Download và cài từ https://nodejs.org/
# Hoặc dùng winget:
winget install OpenJS.NodeJS.LTS
```

### **1.2 Cài PostgreSQL**
```powershell
# Download từ https://www.postgresql.org/download/windows/
# Hoặc dùng winget:
winget install PostgreSQL.PostgreSQL

# Sau khi cài, config PostgreSQL:
# - Port: 5432
# - Password: Demo1234
# - Database: Ninh96
```

### **1.3 Cài Git**
```powershell
winget install Git.Git
```

### **1.4 Cài PM2 (Process Manager)**
```powershell
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

## 🛠️ Bước 2: Setup Application

### **2.1 Clone repository**
```powershell
# Tạo folder apps
New-Item -Path "C:\apps\thuvienanh" -ItemType Directory -Force
Set-Location "C:\apps\thuvienanh"

# Clone code
git clone https://github.com/hksdtp/thuvienanh.git .
```

### **2.2 Tạo file .env**
```powershell
@"
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://postgres:Demo1234@localhost:5432/Ninh96
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=Ninh96

# Synology NAS Configuration (giữ nguyên nếu có)
SYNOLOGY_HOST=222.252.23.248
SYNOLOGY_PORT=6868
SYNOLOGY_USERNAME=your_username
SYNOLOGY_PASSWORD=your_password
SMB_HOST=222.252.23.248
SMB_PORT=445
SMB_USERNAME=your_username
SMB_PASSWORD=your_password
SMB_SHARE=marketing

# API Configuration
ALLOWED_ORIGIN=*
NEXT_PUBLIC_API_URL=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
```

### **2.3 Cài dependencies và build**
```powershell
# Cài dependencies
npm install

# Build production
npm run build

# Test chạy
npm start
```

## 🔧 Bước 3: Setup Database

### **3.1 Tạo database**
```powershell
# Mở PowerShell với quyền Admin
psql -U postgres -c "CREATE DATABASE Ninh96;"
```

### **3.2 Import schema**
```powershell
psql -U postgres -d Ninh96 -f database/init.sql
```

## 🌐 Bước 4: Configure Network & Firewall

### **4.1 Mở port trong Windows Firewall**
```powershell
# Chạy PowerShell với quyền Admin
New-NetFirewallRule -DisplayName "Node.js App" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
```

### **4.2 Configure Router (Port Forwarding)**
```
Vào router admin panel (thường là 192.168.1.1):
1. Tìm Port Forwarding / Virtual Server
2. Thêm rules:
   - External Port: 3000 -> Internal Port: 3000 -> PC IP
   - External Port: 5432 -> Internal Port: 5432 -> PC IP
```

### **4.3 Setup Dynamic DNS (nếu không có IP tĩnh)**
```
Sử dụng dịch vụ như:
- No-IP (free): https://www.noip.com/
- DuckDNS (free): https://www.duckdns.org/
- Cloudflare (free với domain có sẵn)
```

## 🚦 Bước 5: Setup PM2 Process Manager

### **5.1 Tạo ecosystem file**
```powershell
@"
module.exports = {
  apps: [{
    name: 'thuvienanh',
    script: '.next/standalone/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
}
"@ | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8
```

### **5.2 Start application với PM2**
```powershell
# Start app
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Check status
pm2 status
pm2 logs
```

## 🔒 Bước 6: Security & Optimization

### **6.1 Tạo Windows Service**
```powershell
# Cài PM2 as Windows Service
pm2 startup
pm2 save
```

### **6.2 Enable IIS (Optional - for reverse proxy)**
```powershell
# Enable IIS
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirect, IIS-ApplicationDevelopment, IIS-NetFxExtensibility45, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-IIS6ManagementCompatibility, IIS-Metabase, Application-Server-WebServer-Support -All

# Install URL Rewrite Module
# Download từ: https://www.iis.net/downloads/microsoft/url-rewrite
```

### **6.3 Configure IIS Reverse Proxy (Optional)**
Tạo file `web.config` trong `C:\inetpub\wwwroot\`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="NodeJS" stopProcessing="true">
                    <match url=".*" />
                    <action type="Rewrite" url="http://localhost:3000/{R:0}" />
                </rule>
            </rules>
        </rewrite>
        <httpErrors existingResponse="PassThrough" />
    </system.webServer>
</configuration>
```

## 📊 Bước 7: Monitoring & Maintenance

### **7.1 Setup monitoring**
```powershell
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### **7.2 Tạo backup script**
```powershell
@"
# Backup database
pg_dump -U postgres -d Ninh96 -f "backups\db_backup_$(Get-Date -Format 'yyyyMMdd').sql"

# Backup uploads folder
Compress-Archive -Path "public\uploads" -DestinationPath "backups\uploads_$(Get-Date -Format 'yyyyMMdd').zip"
"@ | Out-File -FilePath "backup.ps1" -Encoding UTF8
```

### **7.3 Schedule auto-restart**
```powershell
# Tạo scheduled task restart hàng ngày lúc 3 AM
schtasks /create /tn "RestartNodeApp" /tr "pm2 restart all" /sc daily /st 03:00 /ru SYSTEM
```

## 🎯 Bước 8: Testing

### **8.1 Test local**
```powershell
# Test từ chính máy Windows
Start-Process "http://localhost:3000"
```

### **8.2 Test từ mạng LAN**
```powershell
# Lấy IP local
ipconfig | Select-String "IPv4"

# Test từ máy khác trong LAN
# http://[YOUR_LOCAL_IP]:3000
```

### **8.3 Test từ Internet**
```powershell
# Lấy public IP
Invoke-RestMethod -Uri "https://api.ipify.org"

# Test từ bên ngoài
# http://[YOUR_PUBLIC_IP]:3000
# hoặc
# http://[YOUR_DDNS_DOMAIN]:3000
```

## ⚠️ Troubleshooting

### **Lỗi port đã được sử dụng:**
```powershell
# Check port usage
netstat -ano | findstr :3000

# Kill process using port
taskkill /PID [PROCESS_ID] /F
```

### **Lỗi PostgreSQL connection:**
```powershell
# Check PostgreSQL service
Get-Service postgresql*

# Restart PostgreSQL
Restart-Service postgresql-x64-15
```

### **Lỗi PM2:**
```powershell
# Reset PM2
pm2 kill
pm2 start ecosystem.config.js
```

## 🚨 Production Checklist

- [ ] Windows Updates đã cài đặt
- [ ] Antivirus configured (exclude Node.js folders)
- [ ] Firewall rules configured
- [ ] Port forwarding configured
- [ ] Dynamic DNS configured (nếu cần)
- [ ] PM2 startup configured
- [ ] Backup scheduled
- [ ] Monitoring setup
- [ ] SSL certificate (optional nhưng recommended)

## 📝 Notes

- **Performance:** Windows 10 sẽ chậm hơn Linux server ~20-30%
- **Stability:** Cần restart định kỳ (weekly) để maintain performance
- **Security:** Cần cẩn thận với Windows Updates có thể break config
- **Alternative:** Cân nhắc dùng WSL2 (Windows Subsystem for Linux) để chạy Linux environment

## 🆘 Support

Nếu gặp vấn đề:
1. Check PM2 logs: `pm2 logs`
2. Check Windows Event Viewer
3. Test database connection riêng
4. Verify network configuration

---

**⚡ Quick Deploy Script:** Xem file `deploy-windows.ps1` để tự động hóa toàn bộ process.
