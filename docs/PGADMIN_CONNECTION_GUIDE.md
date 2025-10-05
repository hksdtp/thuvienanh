# 🔌 Hướng dẫn kết nối pgAdmin 4 với Database Ninh96

Tài liệu này hướng dẫn cách kết nối pgAdmin 4 (đã cài trên máy) với database Ninh96 của dự án TVA Fabric Library.

---

## 📋 Thông tin kết nối

### **Database Ninh96 - TVA Fabric Library**

| Thông tin | Giá trị |
|-----------|---------|
| **Host** | `localhost` hoặc `127.0.0.1` |
| **Port** | `5434` |
| **Database** | `Ninh96` |
| **Username** | `postgres` |
| **Password** | `Demo1234` |

**Connection String:**
```
postgresql://postgres:Demo1234@localhost:5434/Ninh96
```

---

## 🚀 Hướng dẫn từng bước

### **Bước 1: Đảm bảo Docker đang chạy**

Trước khi kết nối, đảm bảo Docker containers đang chạy:

```bash
cd /Users/ninh/Webapp/TVA
docker-compose ps
```

Kết quả phải hiển thị:
```
NAME                 STATUS              PORTS
tva-postgres         Up (healthy)        0.0.0.0:5434->5432/tcp
tva-pgadmin          Up                  0.0.0.0:5051->80/tcp
tva-fabric-library   Up                  0.0.0.0:3000->3000/tcp
```

Nếu chưa chạy, khởi động Docker:
```bash
docker-compose up -d
```

---

### **Bước 2: Mở pgAdmin 4**

1. Mở ứng dụng **pgAdmin 4** trên máy của bạn
2. Nếu được yêu cầu, nhập Master Password của pgAdmin

---

### **Bước 3: Tạo Server mới**

#### **3.1. Click chuột phải vào "Servers"**

- Trong cây thư mục bên trái, tìm **"Servers"**
- Click chuột phải → **"Register" → "Server..."**

#### **3.2. Tab "General" - Thông tin chung**

| Field | Giá trị |
|-------|---------|
| **Name** | `TVA Fabric Library - Ninh96` |
| **Server group** | `Servers` (mặc định) |
| **Comments** | `Database Ninh96 cho dự án TVA Fabric Library` (tùy chọn) |

#### **3.3. Tab "Connection" - Thông tin kết nối**

| Field | Giá trị |
|-------|---------|
| **Host name/address** | `localhost` (hoặc `127.0.0.1`) |
| **Port** | `5434` |
| **Maintenance database** | `Ninh96` |
| **Username** | `postgres` |
| **Password** | `Demo1234` |
| **Save password?** | ☑️ **Tích chọn** (để lưu mật khẩu) |

#### **3.4. Tab "Advanced" (Tùy chọn)**

Có thể để mặc định hoặc điều chỉnh:

| Field | Giá trị đề xuất |
|-------|-----------------|
| **DB restriction** | `Ninh96` (chỉ hiển thị database Ninh96) |

#### **3.5. Lưu cấu hình**

- Click nút **"Save"** ở góc dưới bên phải
- pgAdmin sẽ tự động kết nối đến database

---

### **Bước 4: Kiểm tra kết nối thành công**

Sau khi lưu, bạn sẽ thấy cấu trúc như sau:

```
Servers
└── TVA Fabric Library - Ninh96
    └── Databases (1)
        └── Ninh96
            └── Schemas (1)
                └── public
                    └── Tables (7)
                        ├── albums
                        ├── album_images
                        ├── collections
                        ├── collection_fabrics
                        ├── fabrics
                        ├── fabric_images
                        └── users
```

---

## 🧪 Test kết nối bằng Query

### **Cách 1: Sử dụng Query Tool**

1. Click chuột phải vào database **"Ninh96"**
2. Chọn **"Query Tool"**
3. Chạy các query sau để kiểm tra:

#### **Query 1: Xem tất cả tables**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Kết quả mong đợi:
```
table_name
------------------
album_images
albums
collection_fabrics
collections
fabric_images
fabrics
users
```

#### **Query 2: Thống kê dữ liệu**

```sql
SELECT 
    'Collections' as table_name, COUNT(*) as count FROM collections
UNION ALL
SELECT 'Fabrics', COUNT(*) FROM fabrics
UNION ALL
SELECT 'Albums', COUNT(*) FROM albums
UNION ALL
SELECT 'Users', COUNT(*) FROM users;
```

Kết quả mong đợi:
```
table_name   | count
-------------+-------
Collections  |     3
Fabrics      |     5
Albums       |     4
Users        |     3
```

#### **Query 3: Xem dữ liệu Collections**

```sql
SELECT id, name, description, is_active, created_at 
FROM collections 
ORDER BY created_at DESC;
```

#### **Query 4: Xem dữ liệu Fabrics**

```sql
SELECT id, code, name, material, color, price_per_meter 
FROM fabrics 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🔧 Xử lý sự cố

### **Lỗi 1: "Could not connect to server"**

**Nguyên nhân:** Docker chưa chạy hoặc port 5434 bị chặn

**Giải pháp:**

```bash
# Kiểm tra Docker
docker-compose ps

# Nếu chưa chạy, khởi động
docker-compose up -d

# Kiểm tra port 5434
lsof -i :5434
```

---

### **Lỗi 2: "FATAL: password authentication failed"**

**Nguyên nhân:** Sai username hoặc password

**Giải pháp:**

- Đảm bảo Username: `postgres`
- Đảm bảo Password: `Demo1234`
- Kiểm tra không có khoảng trắng thừa

---

### **Lỗi 3: "Connection refused"**

**Nguyên nhân:** PostgreSQL chưa sẵn sàng

**Giải pháp:**

```bash
# Xem logs PostgreSQL
docker logs tva-postgres --tail 50

# Đợi PostgreSQL khởi động hoàn toàn
docker-compose ps
# Đợi đến khi thấy "Up (healthy)"
```

---

### **Lỗi 4: "Database does not exist"**

**Nguyên nhân:** Database Ninh96 chưa được tạo

**Giải pháp:**

```bash
# Import schema
docker exec -i tva-postgres psql -U postgres -d Ninh96 < database/schema.sql

# Import seed data
docker exec -i tva-postgres psql -U postgres -d Ninh96 < database/seed.sql
```

---

## 📊 Các thao tác thường dùng trong pgAdmin

### **1. Xem dữ liệu trong table**

- Click chuột phải vào table → **"View/Edit Data" → "All Rows"**

### **2. Chạy Query**

- Click chuột phải vào database → **"Query Tool"**
- Hoặc nhấn phím tắt: `Alt + Shift + Q`

### **3. Backup database**

- Click chuột phải vào database **"Ninh96"**
- Chọn **"Backup..."**
- Chọn định dạng: **Plain** (SQL file)
- Click **"Backup"**

### **4. Restore database**

- Click chuột phải vào database **"Ninh96"**
- Chọn **"Restore..."**
- Chọn file backup
- Click **"Restore"**

### **5. Xem cấu trúc table**

- Click vào table trong cây thư mục
- Tab **"Columns"** hiển thị các cột
- Tab **"Constraints"** hiển thị các ràng buộc
- Tab **"Indexes"** hiển thị các index

---

## 🎯 So sánh với database cũ

| Thông tin | Database cũ (Tuiss) | Database mới (TVA) |
|-----------|---------------------|-------------------|
| **Host** | 222.252.23.248 | localhost |
| **Port** | 5499 | 5434 |
| **Database** | Ninh96 | Ninh96 |
| **Username** | postgres | postgres |
| **Password** | Demo1234@ | Demo1234 |
| **Loại** | Remote server | Local Docker |

---

## 📚 Tài liệu liên quan

- [DATABASE_NINH96_SETUP.md](./DATABASE_NINH96_SETUP.md) - Hướng dẫn chi tiết về database Ninh96
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Hướng dẫn triển khai Docker
- [PGADMIN_GUIDE.md](./PGADMIN_GUIDE.md) - Hướng dẫn sử dụng pgAdmin 4

---

## ✅ Checklist kết nối thành công

- [ ] Docker containers đang chạy (`docker-compose ps`)
- [ ] Port 5434 đang mở (`lsof -i :5434`)
- [ ] pgAdmin 4 đã được cài đặt
- [ ] Server mới đã được tạo với thông tin đúng
- [ ] Kết nối thành công và thấy 7 tables
- [ ] Chạy test queries thành công
- [ ] Có thể xem dữ liệu trong các tables

---

## 🎉 Hoàn thành!

Bây giờ bạn đã có thể:

✅ Kết nối pgAdmin 4 với database Ninh96  
✅ Xem và quản lý dữ liệu  
✅ Chạy queries SQL  
✅ Backup và restore database  
✅ Theo dõi cấu trúc database  

**Chúc bạn làm việc hiệu quả với database Ninh96! 🚀**

