# 📥 DOWNLOAD LINKS - CÀI LẠI WINDOWS

## 🪟 WINDOWS SERVER 2022

### **Official Microsoft Download:**
```
https://www.microsoft.com/en-us/evalcenter/download-windows-server-2022
```

**Chọn:**
- ✅ Windows Server 2022 Standard
- ✅ 64-bit edition
- ✅ ISO - DVD
- ✅ Desktop Experience (có GUI)

**Thông tin:**
- Size: ~5.2 GB
- Build: 20348
- Trial: 180 ngày
- Language: English (có thể cài Vietnamese language pack sau)

---

## 🔧 PHẦN MỀM CẦN THIẾT

### **1. Node.js 22.x LTS**
```
https://nodejs.org/
```
- Download: Windows Installer (.msi)
- Version: 22.x LTS (Latest)
- Architecture: 64-bit

### **2. PostgreSQL 16**
```
https://www.postgresql.org/download/windows/
```
- Download: Windows x86-64
- Version: 16.x (Latest)
- Components: PostgreSQL Server, pgAdmin 4, Command Line Tools
- **Password:** `haininh1`
- **Port:** `5432`

### **3. Git for Windows**
```
https://git-scm.com/download/win
```
- Download: 64-bit Git for Windows Setup
- Version: Latest
- Default options OK

### **4. Rufus (Tạo USB Boot)**
```
https://rufus.ie/
```
- Download: Rufus Portable
- Version: Latest
- Không cần cài đặt

---

## 📦 OPTIONAL SOFTWARE

### **Visual Studio Code**
```
https://code.visualstudio.com/
```
- Download: Windows 64-bit User Installer
- Recommended extensions:
  - ESLint
  - Prettier
  - TypeScript
  - PostgreSQL

### **Windows Terminal**
```
https://aka.ms/terminal
```
- Download từ Microsoft Store
- Hoặc: https://github.com/microsoft/terminal/releases

### **7-Zip**
```
https://www.7-zip.org/
```
- Download: 64-bit x64
- Để extract files

---

## 🎯 DOWNLOAD ORDER

**Thứ tự download (theo độ ưu tiên):**

1. **Windows Server 2022 ISO** (~5.2 GB) - Download trước vì lâu nhất
2. **Rufus** - Tạo USB boot
3. **Node.js** - Cần thiết cho app
4. **PostgreSQL** - Cần thiết cho database
5. **Git** - Cần thiết để clone source code
6. **VS Code** (optional) - Để edit code
7. **Windows Terminal** (optional) - Terminal đẹp hơn

---

## 💾 TẠO USB BOOT

### **Yêu cầu:**
- USB drive ≥ 8GB
- Rufus (download ở trên)
- Windows Server 2022 ISO

### **Các bước:**

1. **Mở Rufus**
2. **Chọn USB drive**
3. **Click "SELECT"** → Chọn Windows Server 2022 ISO
4. **Partition scheme:** GPT
5. **Target system:** UEFI (non CSM)
6. **File system:** NTFS
7. **Click "START"**
8. **Chọn:** "Write in ISO Image mode" (recommended)
9. **Đợi ~10 phút**

---

## 🔑 ACTIVATION

### **Option 1: Evaluation (Free)**
- Tự động active khi cài
- 180 ngày trial
- Có thể extend thêm 180 ngày:
  ```powershell
  slmgr /rearm
  ```

### **Option 2: Retail License**
- Mua từ Microsoft hoặc reseller
- Giá: ~$1,000 USD
- Activate:
  ```powershell
  slmgr /ipk YOUR-PRODUCT-KEY
  slmgr /ato
  ```

### **Option 3: Volume License (KMS)**
- Dùng KMS server (tự tìm hiểu)
- Miễn phí nhưng cần renew 180 ngày/lần
- Không khuyến khích cho production

---

## 📋 INSTALLATION CHECKLIST

### **Trước khi cài:**
- [ ] Download Windows Server 2022 ISO
- [ ] Download Rufus
- [ ] Tạo USB boot
- [ ] Backup dữ liệu (ĐÃ HOÀN THÀNH ✅)
- [ ] Note lại passwords

### **Sau khi cài Windows:**
- [ ] Cài Node.js
- [ ] Cài PostgreSQL
- [ ] Cài Git
- [ ] Cài PM2: `npm install -g pm2 pm2-windows-startup`
- [ ] Clone source code
- [ ] Restore database
- [ ] Deploy app

---

## 🆘 ALTERNATIVE DOWNLOADS

### **Nếu link Microsoft không hoạt động:**

**Windows Server 2022 ISO:**
- TechBench: https://tb.rg-adguard.net/public.php
- MSDN: https://msdn.microsoft.com/ (cần subscription)

**Node.js:**
- Mirror: https://nodejs.org/dist/

**PostgreSQL:**
- EDB: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

---

## 📞 SUPPORT

**Nếu gặp vấn đề download:**
1. Thử browser khác (Chrome, Edge, Firefox)
2. Tắt VPN/Proxy
3. Dùng download manager (IDM, Free Download Manager)
4. Download vào giờ thấp điểm (đêm)

**Verify ISO integrity:**
```powershell
# Get file hash
Get-FileHash -Path "C:\path\to\windows-server-2022.iso" -Algorithm SHA256

# Compare với hash chính thức từ Microsoft
```

---

## 🎯 QUICK LINKS

| Software | Link |
|----------|------|
| Windows Server 2022 | https://www.microsoft.com/en-us/evalcenter/download-windows-server-2022 |
| Node.js | https://nodejs.org/ |
| PostgreSQL | https://www.postgresql.org/download/windows/ |
| Git | https://git-scm.com/download/win |
| Rufus | https://rufus.ie/ |
| VS Code | https://code.visualstudio.com/ |
| Windows Terminal | https://aka.ms/terminal |

---

## 📊 DOWNLOAD SIZE SUMMARY

| Item | Size | Time (100 Mbps) |
|------|------|-----------------|
| Windows Server 2022 ISO | ~5.2 GB | ~7 minutes |
| Node.js | ~30 MB | ~3 seconds |
| PostgreSQL | ~250 MB | ~20 seconds |
| Git | ~50 MB | ~4 seconds |
| Rufus | ~1.4 MB | <1 second |
| VS Code | ~90 MB | ~7 seconds |
| **TOTAL** | **~5.6 GB** | **~8 minutes** |

---

## ✅ READY TO GO!

**Sau khi download xong:**
1. Tạo USB boot với Rufus
2. Boot từ USB
3. Cài Windows Server 2022
4. Follow hướng dẫn trong `WINDOWS_REINSTALL_GUIDE.md`

**Good luck! 🚀**

