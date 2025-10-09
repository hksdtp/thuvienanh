# 🔧 Cấu hình pg_hba.conf trên Windows 10

## 📋 Vấn đề hiện tại:
PostgreSQL đang chặn kết nối từ Mac (Tailscale IP: 100.82.243.45) vì chưa có entry trong pg_hba.conf

## ✅ Giải pháp:

### Bước 1: Tìm file pg_hba.conf
Trên Windows, mở **Command Prompt** hoặc **PowerShell** và chạy:

```powershell
# Tìm file pg_hba.conf
dir "D:\Ninh\pg\tva\pg_hba.conf" /s
```

Hoặc file thường nằm ở:
- `D:\Ninh\pg\tva\pg_hba.conf`
- `C:\Program Files\PostgreSQL\16\data\pg_hba.conf`

### Bước 2: Backup file hiện tại
```powershell
copy "D:\Ninh\pg\tva\pg_hba.conf" "D:\Ninh\pg\tva\pg_hba.conf.backup"
```

### Bước 3: Chỉnh sửa pg_hba.conf
Mở file `pg_hba.conf` bằng **Notepad** hoặc **Notepad++** (Run as Administrator)

Thêm các dòng sau vào **cuối file**:

```conf
# Allow connections from Tailscale network
host    all             all             100.0.0.0/8             md5

# Allow connections from local network (if needed)
host    all             all             192.168.0.0/16          md5
host    all             all             10.0.0.0/8              md5

# Allow connections from specific Mac IP
host    all             all             100.82.243.45/32        md5
```

**Giải thích:**
- `host` = cho phép kết nối TCP/IP
- `all` (database) = tất cả databases
- `all` (user) = tất cả users
- `100.0.0.0/8` = toàn bộ mạng Tailscale (100.x.x.x)
- `md5` = yêu cầu mật khẩu

### Bước 4: Kiểm tra postgresql.conf
Đảm bảo PostgreSQL đang listen trên tất cả interfaces:

Mở file `postgresql.conf` (cùng thư mục với pg_hba.conf)

Tìm và sửa dòng:
```conf
listen_addresses = '*'          # Cho phép listen trên tất cả IP
```

Hoặc cụ thể hơn:
```conf
listen_addresses = 'localhost,100.101.50.87'
```

### Bước 5: Restart PostgreSQL Service
Mở **Services** (services.msc) hoặc chạy PowerShell:

```powershell
# Restart PostgreSQL service
Restart-Service postgresql-x64-16

# Hoặc nếu service có tên khác:
Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}
Restart-Service <tên-service>
```

### Bước 6: Kiểm tra Firewall
Đảm bảo Windows Firewall cho phép port 5432:

```powershell
# Thêm rule cho PostgreSQL
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
```

## 🧪 Test lại kết nối
Sau khi hoàn thành các bước trên, chạy lại test từ Mac:

```bash
node test-db-connection.js
```

## 📝 Nội dung mẫu pg_hba.conf hoàn chỉnh:

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     trust

# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust

# Allow connections from Tailscale network
host    all             all             100.0.0.0/8             md5

# Allow connections from local network
host    all             all             192.168.0.0/16          md5

# Allow replication connections
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
```

## ⚠️ Lưu ý bảo mật:
- Chỉ mở kết nối cho các IP/subnet cần thiết
- Luôn dùng `md5` hoặc `scram-sha-256` thay vì `trust` cho remote connections
- Backup file cấu hình trước khi sửa
- Restart service sau mỗi thay đổi

## 🆘 Nếu vẫn lỗi:
1. Kiểm tra PostgreSQL service đang chạy: `Get-Service postgresql*`
2. Kiểm tra port đang listen: `netstat -an | findstr 5432`
3. Kiểm tra log: `D:\Ninh\pg\tva\log\` hoặc Event Viewer
4. Thử kết nối local trước: `psql -U postgres -d tva`

