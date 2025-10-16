# ⚡ QUICK REINSTALL CHECKLIST

## 📋 TRƯỚC KHI CÀI LẠI WINDOWS

### ✅ BACKUP (ĐÃ HOÀN THÀNH)

- [x] **Database backup:** ✅ `tva_backup_2025-10-13_15-50-06.sql`
  - Local: `D:\Ninh\thuvienanh\backups\`
  - Synology: `\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\`
  - Size: 0.05 MB (50 KB)

- [x] **Ảnh trên Synology:** ✅ Đã có sẵn
  - `\\222.252.23.248\Marketing\Ninh\thuvienanh\albums\`
  - `\\222.252.23.248\Marketing\Ninh\thuvienanh\events\`
  - `\\222.252.23.248\Marketing\Ninh\thuvienanh\fabrics\`
  - `\\222.252.23.248\Marketing\Ninh\thuvienanh\projects\`

- [ ] **Backup .env files** (Chạy lệnh này):
  ```powershell
  Copy-Item -Path "D:\Ninh\thuvienanh\.env" -Destination "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\.env.backup"
  Copy-Item -Path "D:\Ninh\thuvienanh\.env.production" -Destination "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\.env.production.backup"
  ```

- [ ] **Note lại thông tin quan trọng:**
  - Synology IP: `222.252.23.248`
  - Synology User: `haininh`
  - Synology Pass: `Villad24@`
  - PostgreSQL Pass: `haininh1`
  - Database Name: `tva`

---

## 💿 DOWNLOAD WINDOWS SERVER 2022

### **Link Download:**
```
https://www.microsoft.com/en-us/evalcenter/download-windows-server-2022
```

### **Chọn:**
- ✅ **Windows Server 2022 Standard (Desktop Experience)**
- ✅ **64-bit edition**
- ✅ **ISO - DVD**

### **Tạo USB Boot:**
1. Download Rufus: https://rufus.ie/
2. Chọn ISO file
3. Partition: GPT
4. Target: UEFI
5. Click Start

---

## 🔧 SAU KHI CÀI WINDOWS MỚI

### **1. Cài phần mềm cơ bản (30 phút)**

```powershell
# Mở PowerShell as Administrator

# 1. Download và cài Node.js 22.x
# https://nodejs.org/
# Verify: node --version

# 2. Download và cài PostgreSQL 16
# https://www.postgresql.org/download/windows/
# Password: haininh1
# Port: 5432
# Verify: psql --version

# 3. Download và cài Git
# https://git-scm.com/download/win
# Verify: git --version

# 4. Cài PM2
npm install -g pm2 pm2-windows-startup
pm2-startup install
```

### **2. Clone source code (5 phút)**

```powershell
# Tạo thư mục
mkdir D:\Ninh
cd D:\Ninh

# Clone từ GitHub
git clone https://github.com/your-username/thuvienanh.git
cd thuvienanh

# Install dependencies
npm install
```

### **3. Restore Database (5 phút)**

```powershell
cd D:\Ninh\thuvienanh

# Chạy restore script
.\scripts\restore-database-from-synology.ps1

# Nhập "yes" khi được hỏi
```

**Hoặc restore thủ công:**

```powershell
# Set password
$env:PGPASSWORD = "haininh1"

# Create database
& "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres tva

# Restore
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d tva -f "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\tva_backup_2025-10-13_15-50-06.sql"
```

### **4. Restore .env files (1 phút)**

```powershell
# Copy từ Synology
Copy-Item -Path "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\.env.backup" -Destination "D:\Ninh\thuvienanh\.env"
Copy-Item -Path "\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\.env.production.backup" -Destination "D:\Ninh\thuvienanh\.env.production"
```

### **5. Build và Deploy (10 phút)**

```powershell
cd D:\Ninh\thuvienanh

# Build production
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

# Check status
pm2 status
```

### **6. Test (2 phút)**

```powershell
# Test database
psql -U postgres -d tva -c "SELECT COUNT(*) FROM projects;"
# Should return: 5

# Test API
curl http://localhost:4000/api/projects

# Open browser
start http://localhost:4000
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Node.js installed: `node --version` → v22.x.x
- [ ] PostgreSQL installed: `psql --version` → 16.x
- [ ] Git installed: `git --version` → 2.x.x
- [ ] PM2 installed: `pm2 --version` → 5.x.x
- [ ] Source code cloned: `D:\Ninh\thuvienanh\`
- [ ] Database restored: 5 projects
- [ ] .env files restored
- [ ] Build successful
- [ ] PM2 running: `pm2 status` → online
- [ ] Web accessible: http://localhost:4000
- [ ] API working: http://localhost:4000/api/projects
- [ ] Synology accessible: Ảnh hiển thị được

---

## 🆘 TROUBLESHOOTING

### **Không kết nối được Synology:**
```powershell
# Map network drive
net use Z: \\222.252.23.248\Marketing /user:haininh Villad24@

# Test
Test-Path Z:\Ninh\thuvienanh\backups
```

### **PostgreSQL không start:**
```powershell
# Check service
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-16
```

### **PM2 không start:**
```powershell
# Check logs
pm2 logs thuvienanh --err

# Restart
pm2 restart thuvienanh
```

### **Build failed:**
```powershell
# Clean install
rm -r node_modules
rm package-lock.json
npm install
npm run build
```

---

## 📞 IMPORTANT CREDENTIALS

**Synology NAS:**
- IP: `222.252.23.248`
- User: `haininh`
- Password: `Villad24@`
- Backup Path: `\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\`

**PostgreSQL:**
- User: `postgres`
- Password: `haininh1`
- Port: `5432`
- Database: `tva`

**GitHub:**
- Repo: `https://github.com/your-username/thuvienanh.git`

---

## ⏱️ ESTIMATED TIME

| Task | Time |
|------|------|
| Download Windows ISO | 30 min |
| Create USB Boot | 10 min |
| Install Windows | 30 min |
| Windows Updates | 20 min |
| Install Software | 30 min |
| Clone Source | 5 min |
| Restore Database | 5 min |
| Build & Deploy | 10 min |
| Test & Verify | 5 min |
| **TOTAL** | **~2.5 hours** |

---

## 🎯 QUICK COMMANDS

**Backup Database:**
```powershell
.\scripts\backup-database-to-synology.ps1
```

**Restore Database:**
```powershell
.\scripts\restore-database-from-synology.ps1
```

**Deploy App:**
```powershell
npm run build
pm2 start ecosystem.config.js
pm2 save
```

**Check Status:**
```powershell
pm2 status
pm2 logs thuvienanh
```

---

## 📁 FILES LOCATION

**Backup Files on Synology:**
```
\\222.252.23.248\Marketing\Ninh\thuvienanh\backups\
├── tva_backup_2025-10-13_15-50-06.sql  (Database)
├── .env.backup                          (Environment)
├── .env.production.backup               (Production env)
└── ecosystem.config.js.backup           (PM2 config)
```

**Images on Synology:**
```
\\222.252.23.248\Marketing\Ninh\thuvienanh\
├── albums/
├── events/
├── fabrics/
└── projects/
```

---

## ✅ FINAL CHECK

Sau khi hoàn thành, verify:

1. **Database:** 5 projects, 15+ tables
2. **API:** http://localhost:4000/api/projects returns data
3. **Web:** http://localhost:4000 loads successfully
4. **Images:** Ảnh từ Synology hiển thị được
5. **PM2:** Auto-start on boot enabled

---

**🎊 DONE! Hệ thống đã sẵn sàng!** 🚀

