# 🔧 Hướng Dẫn Cấu Hình PostgreSQL cho Tailscale Access

## 📋 Mục đích
Cấu hình PostgreSQL trên Windows để cho phép Mac kết nối qua mạng Tailscale.

---

## ⚡ Cách 1: Chạy Script Tự Động (Khuyến nghị)

### Bước 1: Mở PowerShell với quyền Administrator

1. Nhấn `Windows + X`
2. Chọn **"Windows PowerShell (Admin)"** hoặc **"Terminal (Admin)"**
3. Click **"Yes"** khi UAC hỏi

### Bước 2: Chuyển đến thư mục dự án

```powershell
cd D:\Ninh\thuvienanh
```

### Bước 3: Chạy script

```powershell
.\setup-tailscale-access.ps1
```

### Bước 4: Đợi script hoàn thành

Script sẽ tự động:
- ✅ Backup các file cấu hình
- ✅ Cấu hình `pg_hba.conf` cho Tailscale
- ✅ Cấu hình `postgresql.conf` để listen trên tất cả interfaces
- ✅ Thêm Windows Firewall rule cho port 5432
- ✅ Restart PostgreSQL service

---

## 🔧 Cách 2: Cấu Hình Thủ Công

Nếu script không chạy được, làm theo các bước sau:

### Bước 1: Backup files cấu hình

```powershell
# Mở PowerShell với quyền Administrator
cd D:\Ninh\pg\tva

# Backup
Copy-Item pg_hba.conf pg_hba.conf.backup
Copy-Item postgresql.conf postgresql.conf.backup
```

### Bước 2: Chỉnh sửa pg_hba.conf

```powershell
notepad pg_hba.conf
```

Thêm vào cuối file:

```
# Tailscale Network Access
# Allow connections from Tailscale network (100.x.x.x)
host    all             all             100.0.0.0/8             md5

# Allow connections from specific Mac IP
host    all             all             100.82.243.45/32        md5

# Allow connections from local network (optional)
host    all             all             192.168.0.0/16          md5
host    all             all             10.0.0.0/8              md5
```

**Lưu file** (Ctrl+S) và đóng Notepad.

### Bước 3: Chỉnh sửa postgresql.conf

```powershell
notepad postgresql.conf
```

Tìm dòng:
```
#listen_addresses = 'localhost'
```

Thay đổi thành:
```
listen_addresses = '*'
```

**Lưu file** (Ctrl+S) và đóng Notepad.

### Bước 4: Thêm Windows Firewall Rule

```powershell
New-NetFirewallRule -DisplayName "PostgreSQL Port 5432" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow -Profile Any
```

### Bước 5: Restart PostgreSQL Service

```powershell
Restart-Service postgresql-x64-16
```

### Bước 6: Kiểm tra service đang chạy

```powershell
Get-Service postgresql-x64-16
```

Kết quả phải là: **Status: Running**

### Bước 7: Kiểm tra port đang listen

```powershell
netstat -an | Select-String "5432"
```

Phải thấy: `0.0.0.0:5432` hoặc `[::]:5432` với trạng thái **LISTENING**

---

## 🧪 Kiểm Tra Kết Nối

### Từ Windows (Local)

```powershell
# Test connection
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -d tva -c "SELECT version();"
```

### Từ Mac (qua Tailscale)

Trước tiên, kiểm tra Tailscale IP của Windows:

```bash
# Trên Windows
tailscale ip -4
```

Kết quả sẽ là: `100.101.50.87` (hoặc IP khác)

Sau đó, từ Mac:

```bash
# Test với psql
psql -h 100.101.50.87 -p 5432 -U postgres -d tva

# Hoặc test với Node.js
node test-db-connection.js
```

---

## 📊 Thông Tin Kết Nối

### Windows PC (Tailscale)
```
Tailscale IP: 100.101.50.87
Hostname: marketingpc
Port: 5432
Database: tva
User: postgres
Password: haininh1
```

### Mac (Tailscale)
```
Tailscale IP: 100.82.243.45
```

### Connection String từ Mac
```
postgresql://postgres:haininh1@100.101.50.87:5432/tva
```

---

## ⚠️ Troubleshooting

### Vấn đề 1: Không kết nối được từ Mac

**Kiểm tra:**
1. Tailscale đang chạy trên cả Windows và Mac
2. Ping được từ Mac đến Windows:
   ```bash
   ping 100.101.50.87
   ```
3. PostgreSQL service đang chạy:
   ```powershell
   Get-Service postgresql-x64-16
   ```
4. Port 5432 đang listen:
   ```powershell
   netstat -an | Select-String "5432"
   ```

### Vấn đề 2: Firewall chặn kết nối

**Giải pháp:**
```powershell
# Xóa rule cũ (nếu có)
Remove-NetFirewallRule -DisplayName "PostgreSQL Port 5432"

# Thêm rule mới
New-NetFirewallRule -DisplayName "PostgreSQL Port 5432" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow -Profile Any
```

### Vấn đề 3: pg_hba.conf không đúng

**Kiểm tra:**
```powershell
Get-Content D:\Ninh\pg\tva\pg_hba.conf | Select-String "100.0.0.0"
```

Phải thấy dòng:
```
host    all             all             100.0.0.0/8             md5
```

### Vấn đề 4: postgresql.conf không đúng

**Kiểm tra:**
```powershell
Get-Content D:\Ninh\pg\tva\postgresql.conf | Select-String "listen_addresses"
```

Phải thấy:
```
listen_addresses = '*'
```

---

## 🔄 Rollback (Khôi phục cấu hình cũ)

Nếu có vấn đề, khôi phục từ backup:

```powershell
# Mở PowerShell với quyền Administrator
cd D:\Ninh\pg\tva

# Restore backup (thay TIMESTAMP bằng timestamp thực tế)
Copy-Item pg_hba.conf.backup_TIMESTAMP pg_hba.conf -Force
Copy-Item postgresql.conf.backup_TIMESTAMP postgresql.conf -Force

# Restart service
Restart-Service postgresql-x64-16
```

---

## ✅ Checklist Hoàn Thành

- [ ] Backup files cấu hình
- [ ] Cấu hình pg_hba.conf (thêm Tailscale network)
- [ ] Cấu hình postgresql.conf (listen_addresses = '*')
- [ ] Thêm Windows Firewall rule
- [ ] Restart PostgreSQL service
- [ ] Kiểm tra service đang chạy
- [ ] Kiểm tra port 5432 đang listen
- [ ] Test kết nối từ Windows (local)
- [ ] Test kết nối từ Mac (Tailscale)

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra logs PostgreSQL:
   ```powershell
   Get-Content "C:\Program Files\PostgreSQL\16\data\log\*.log" -Tail 50
   ```

2. Kiểm tra Windows Event Viewer:
   - Windows Logs → Application
   - Tìm events từ PostgreSQL

3. Test kết nối local trước:
   ```powershell
   psql -U postgres -h localhost -d tva
   ```

---

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn thành:

✅ PostgreSQL trên Windows có thể nhận kết nối từ:
- Localhost (127.0.0.1)
- Tailscale network (100.x.x.x)
- Local network (192.168.x.x, 10.x.x.x)

✅ Mac có thể kết nối đến PostgreSQL qua Tailscale:
```bash
psql -h 100.101.50.87 -p 5432 -U postgres -d tva
```

✅ Next.js trên Mac có thể sử dụng database trên Windows:
```env
DATABASE_URL=postgresql://postgres:haininh1@100.101.50.87:5432/tva
```

---

**Ngày tạo**: 2025-10-09  
**Script**: `setup-tailscale-access.ps1`  
**Database**: PostgreSQL 16.10  
**Data Location**: D:\Ninh\pg\tva

