# 🔧 HƯỚNG DẪN CÀI LẠI WINDOWS VPS + BACKUP/RESTORE

## 📋 MỤC LỤC
1. [Windows phiên bản tối ưu](#1-windows-phiên-bản-tối-ưu)
2. [Backup trước khi cài lại](#2-backup-trước-khi-cài-lại)
3. [Cài đặt Windows mới](#3-cài-đặt-windows-mới)
4. [Restore dữ liệu](#4-restore-dữ-liệu)
5. [Cài đặt lại ứng dụng](#5-cài-đặt-lại-ứng-dụng)

---

## 1️⃣ WINDOWS PHIÊN BẢN TỐI ƯU

### **🏆 KHUYẾN NGHỊ: Windows Server 2022 Standard**

**Tại sao chọn Windows Server 2022?**
- ✅ **Tối ưu cho VPS/Server:** Thiết kế cho môi trường server
- ✅ **Ổn định cao:** Uptime 99.9%+
- ✅ **Bảo mật tốt:** Security updates thường xuyên
- ✅ **Hỗ trợ dài hạn:** Đến năm 2031
- ✅ **Hiệu năng tốt:** Tối ưu cho 16GB RAM
- ✅ **Không giới hạn users:** Không bị giới hạn 20 users như Windows 10
- ✅ **Hỗ trợ Docker, Hyper-V:** Đầy đủ tính năng virtualization
- ✅ **Remote Desktop tốt hơn:** RDP performance cao

### **📥 Download Windows Server 2022**

**Official Microsoft Evaluation Center:**
```
https://www.microsoft.com/en-us/evalcenter/download-windows-server-2022
```

**Thông tin ISO:**
- **Tên:** Windows Server 2022 Standard (Desktop Experience)
- **Size:** ~5.2 GB
- **Build:** 20348
- **Trial:** 180 ngày (có thể extend hoặc activate sau)

**Chọn edition:**
- ✅ **Standard (Desktop Experience)** - Có GUI, dễ sử dụng (RECOMMENDED)
- ❌ **Standard (Server Core)** - Chỉ command line, khó dùng

### **🔑 Activation**

**Option 1: Evaluation (Free 180 days)**
- Dùng ngay sau khi cài
- Có thể extend thêm 180 ngày (tổng 360 ngày)

**Option 2: Retail License**
- Mua license chính hãng từ Microsoft
- Giá: ~$1,000 USD

**Option 3: KMS Activation**
- Dùng KMS server (tự tìm hiểu)
- Miễn phí nhưng cần renew định kỳ

### **📊 So sánh các phiên bản**

| Phiên bản | RAM | Users | Uptime | Server Features | Giá | Khuyến nghị |
|-----------|-----|-------|--------|-----------------|-----|-------------|
| **Windows Server 2022** | 16GB+ | Unlimited | 99.9% | ✅ Full | $$$ | ⭐⭐⭐⭐⭐ |
| **Windows Server 2019** | 16GB+ | Unlimited | 99.9% | ✅ Full | $$$ | ⭐⭐⭐⭐ |
| **Windows 11 Pro** | 16GB | 20 | 95% | ⚠️ Limited | $$ | ⭐⭐⭐ |
| **Windows 10 Pro** | 16GB | 20 | 95% | ⚠️ Limited | $$ | ⭐⭐ |

---

## 2️⃣ BACKUP TRƯỚC KHI CÀI LẠI

### **📦 Checklist Backup**

- [ ] Database PostgreSQL → Synology
- [ ] Source code → GitHub (đã có)
- [ ] Ảnh uploads → Synology (đã có)
- [ ] Environment files (.env)
- [ ] PM2 configuration
- [ ] PostgreSQL configuration
- [ ] Tailscale config (nếu có)

### **💾 BACKUP DATABASE VÀO SYNOLOGY**

**Bước 1: Chạy script backup**

```powershell
# Mở PowerShell as Administrator
cd D:\Ninh\thuvienanh

# Chạy backup script
.\scripts\backup-database-to-synology.ps1
```

**Script sẽ:**
1. ✅ Backup database `tva` thành file SQL
2. ✅ Lưu local: `D:\Ninh\thuvienanh\backups\tva_backup_YYYY-MM-DD_HH-mm-ss.sql`
3. ✅ Copy lên Synology: `\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\`
4. ✅ Tự động xóa backup cũ hơn 7 ngày

**Output:**
```
========================================
  BACKUP DATABASE TO SYNOLOGY
========================================

Backing up database 'tva'...
Backup file: tva_backup_2025-10-13_16-30-00.sql
✅ Database backup successful!
Backup size: 2.45 MB

Copying backup to Synology NAS...
Destination: \\222.252.23.248\Marketing\Ninh\thuvienanh\backups
✅ Backup copied to Synology successfully!
Synology file size: 2.45 MB

Cleaning up old backups...

========================================
  BACKUP COMPLETED!
========================================

Local backup: D:\Ninh\thuvienanh\backups\tva_backup_2025-10-13_16-30-00.sql
Synology backup: \\222.252.23.248\Marketing\Ninh\thuvienanh\backups\tva_backup_2025-10-13_16-30-00.sql
```

### **📸 BACKUP ẢNH (ĐÃ CÓ SẴN TRÊN SYNOLOGY)**

Ảnh đã được lưu trên Synology NAS:
```
\\222.252.23.248\Marketing\Ninh\thuvienanh\
├── albums/
├── events/
├── fabrics/
├── projects/
└── backups/  (database backups)
```

**✅ Không cần backup ảnh vì đã lưu trên Synology!**

### **📄 BACKUP FILES QUAN TRỌNG**

**Bước 2: Backup environment files**

```powershell
# Copy .env files to Synology
Copy-Item -Path "D:\Ninh\thuvienanh\.env" -Destination "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\.env.backup"
Copy-Item -Path "D:\Ninh\thuvienanh\.env.production" -Destination "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\.env.production.backup"
```

**Bước 3: Backup PM2 config**

```powershell
# Copy PM2 config
Copy-Item -Path "D:\Ninh\thuvienanh\ecosystem.config.js" -Destination "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\ecosystem.config.js.backup"
```

### **✅ VERIFY BACKUP**

```powershell
# Check Synology backups
Get-ChildItem "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\"
```

**Bạn sẽ thấy:**
```
tva_backup_2025-10-13_16-30-00.sql
.env.backup
.env.production.backup
ecosystem.config.js.backup
```

---

## 3️⃣ CÀI ĐẶT WINDOWS MỚI

### **📀 Chuẩn bị**

1. **Download Windows Server 2022 ISO** (link ở trên)
2. **Tạo USB boot** với Rufus:
   - Download Rufus: https://rufus.ie/
   - Chọn ISO file
   - Partition scheme: GPT
   - Target system: UEFI
   - Click Start

3. **Boot từ USB**
   - Restart PC
   - Nhấn F12/F2/Del để vào Boot Menu
   - Chọn USB boot

### **💿 Cài đặt Windows Server 2022**

**Bước 1: Chọn edition**
- ✅ Chọn: **Windows Server 2022 Standard (Desktop Experience)**
- ❌ KHÔNG chọn: Server Core

**Bước 2: Chọn partition**
- Format ổ C:\ (xóa Windows cũ)
- Cài đặt vào ổ C:\

**Bước 3: Cấu hình ban đầu**
- Set Administrator password: `haininh1` (hoặc password mạnh hơn)
- Đặt tên máy: `MarketingPC` hoặc `ThuvienanhVPS`
- Cấu hình network: DHCP hoặc Static IP

**Bước 4: Windows Updates**
```powershell
# Check for updates
Settings → Windows Update → Check for updates
```

### **🔧 Cài đặt drivers**
- Network driver
- Graphics driver (nếu cần)
- Chipset driver

---

## 4️⃣ RESTORE DỮ LIỆU

### **📦 Cài đặt phần mềm cần thiết**

**Bước 1: Cài Node.js**
```
https://nodejs.org/
Version: 22.x LTS
```

**Bước 2: Cài PostgreSQL 16**
```
https://www.postgresql.org/download/windows/
Version: 16.x
Password: haininh1
Port: 5432
```

**Bước 3: Cài Git**
```
https://git-scm.com/download/win
```

**Bước 4: Cài PM2**
```powershell
npm install -g pm2 pm2-windows-startup
pm2-startup install
```

### **📥 Clone source code**

```powershell
# Tạo thư mục
mkdir D:\Ninh
cd D:\Ninh

# Clone từ GitHub
git clone https://github.com/your-repo/thuvienanh.git
cd thuvienanh

# Install dependencies
npm install
```

### **💾 RESTORE DATABASE**

**Option 1: Restore từ Synology (RECOMMENDED)**

```powershell
# Chạy restore script
cd D:\Ninh\thuvienanh
.\scripts\restore-database-from-synology.ps1
```

**Script sẽ:**
1. ✅ Tìm backup mới nhất trên Synology
2. ✅ Drop database cũ (nếu có)
3. ✅ Create database mới
4. ✅ Restore từ backup file
5. ✅ Verify restore

**Output:**
```
========================================
  RESTORE DATABASE FROM SYNOLOGY
========================================

Finding latest backup...
Latest backup: tva_backup_2025-10-13_16-30-00.sql
Created: 10/13/2025 4:30:00 PM
Size: 2.45 MB

Do you want to restore database 'tva' from this backup? (yes/no): yes

Restoring database...
Dropping existing database...
Creating new database...
Restoring from backup file...

✅ Database restored successfully!

Verifying restore...
Tables restored: 15
Active projects: 5

========================================
  RESTORE COMPLETED!
========================================
```

**Option 2: Restore thủ công**

```powershell
# Set password
$env:PGPASSWORD = "haininh1"

# Create database
& "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres tva

# Restore from backup
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d tva -f "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\tva_backup_2025-10-13_16-30-00.sql"
```

### **📄 Restore environment files**

```powershell
# Copy .env files từ Synology
Copy-Item -Path "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\.env.backup" -Destination "D:\Ninh\thuvienanh\.env"
Copy-Item -Path "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\.env.production.backup" -Destination "D:\Ninh\thuvienanh\.env.production"
```

### **✅ Verify restore**

```powershell
# Test database connection
psql -U postgres -d tva -c "SELECT COUNT(*) FROM projects;"

# Should return: 5
```

---

## 5️⃣ CÀI ĐẶT LẠI ỨNG DỤNG

### **🚀 Build và Deploy**

```powershell
cd D:\Ninh\thuvienanh

# Build production
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

# Verify
pm2 status
```

### **🌐 Test ứng dụng**

```powershell
# Open browser
start http://localhost:4000

# Test API
curl http://localhost:4000/api/projects
```

### **✅ Verify tất cả**

- [ ] Database có 5 projects
- [ ] Ảnh trên Synology accessible
- [ ] PM2 running
- [ ] Web app accessible
- [ ] API endpoints working

---

## 📋 CHECKLIST HOÀN CHỈNH

### **Trước khi cài lại:**
- [ ] Backup database lên Synology
- [ ] Backup .env files
- [ ] Backup PM2 config
- [ ] Verify backups trên Synology
- [ ] Note lại passwords

### **Sau khi cài Windows mới:**
- [ ] Cài Node.js 22.x
- [ ] Cài PostgreSQL 16
- [ ] Cài Git
- [ ] Cài PM2
- [ ] Clone source code
- [ ] Restore database
- [ ] Restore .env files
- [ ] Build production
- [ ] Start PM2
- [ ] Test ứng dụng

---

## 🆘 TROUBLESHOOTING

### **Lỗi: Không kết nối được Synology**

```powershell
# Test connection
Test-Path "\\222.252.23.248\Marketing"

# Nếu fail, map network drive
net use Z: \\222.252.23.248\Marketing /user:haininh Villad24@
```

### **Lỗi: PostgreSQL restore failed**

```powershell
# Check PostgreSQL service
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-16

# Check logs
Get-Content "C:\Program Files\PostgreSQL\16\data\log\*.log" -Tail 50
```

### **Lỗi: PM2 không start**

```powershell
# Reinstall PM2
npm uninstall -g pm2
npm install -g pm2 pm2-windows-startup
pm2-startup install
```

---

## 📞 SUPPORT FILES

**Scripts đã tạo:**
- `scripts/backup-database-to-synology.ps1` - Backup database
- `scripts/restore-database-from-synology.ps1` - Restore database

**Synology backup location:**
```
\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\
```

**Credentials:**
- Synology: haininh / Villad24@
- PostgreSQL: postgres / haininh1
- Database: tva

---

## 🎯 SUMMARY

1. **Download:** Windows Server 2022 Standard (Desktop Experience)
2. **Backup:** Database + .env files → Synology
3. **Install:** Windows Server 2022
4. **Restore:** Database từ Synology
5. **Deploy:** Build + PM2 start

**Ảnh đã có sẵn trên Synology - KHÔNG CẦN BACKUP!**

---

**Bạn đã sẵn sàng cài lại Windows chưa?** 🚀

