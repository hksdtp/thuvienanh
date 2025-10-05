# 📘 Hướng dẫn sử dụng pgAdmin 4 - TVA Fabric Library

## 🎯 Tổng quan

pgAdmin 4 là công cụ quản lý PostgreSQL database với giao diện web hiện đại, giúp bạn dễ dàng:
- Xem và quản lý cấu trúc database
- Chạy SQL queries
- Backup và restore dữ liệu
- Quản lý users và permissions
- Monitor performance

---

## 🚀 Bước 1: Truy cập pgAdmin 4

### Thông tin đăng nhập:

```
URL: http://localhost:5051
Email: admin@tva.com
Password: Villad24@
```

**Lưu ý:** Tôi đã mở pgAdmin trong trình duyệt của bạn. Nếu chưa thấy, hãy truy cập URL trên.

---

## 🔌 Bước 2: Kết nối đến PostgreSQL Database

### 2.1. Thêm Server mới

1. **Click chuột phải vào "Servers"** trong sidebar bên trái
2. Chọn **"Register" → "Server..."**

### 2.2. Điền thông tin kết nối

#### Tab "General":
```
Name: TVA Fabric Library
```

#### Tab "Connection":
```
Host name/address: postgres
Port: 5432
Maintenance database: tva_fabric_library
Username: tva_admin
Password: Villad24@TVA
```

**☑️ Tích chọn:** "Save password" để không phải nhập lại mỗi lần

#### Tab "Advanced" (Tùy chọn):
```
DB restriction: tva_fabric_library
```
(Chỉ hiển thị database này, ẩn các database hệ thống)

### 2.3. Lưu và kết nối

Click **"Save"** → pgAdmin sẽ kết nối đến database

---

## 📊 Bước 3: Khám phá Database

Sau khi kết nối thành công, bạn sẽ thấy cấu trúc:

```
Servers
└── TVA Fabric Library
    └── Databases
        └── tva_fabric_library
            ├── Schemas
            │   └── public
            │       ├── Tables
            │       ├── Views
            │       ├── Functions
            │       └── Sequences
            ├── Extensions
            └── Login/Group Roles
```

### 3.1. Xem Tables (Bảng dữ liệu)

1. Mở rộng: **Databases → tva_fabric_library → Schemas → public → Tables**
2. Click vào một table để xem chi tiết
3. Click chuột phải → **"View/Edit Data" → "All Rows"** để xem dữ liệu

**Các tables chính trong dự án:**
- `fabrics` - Thông tin vải
- `collections` - Bộ sưu tập
- `albums` - Albums ảnh
- `fabric_collections` - Liên kết vải và collections
- `album_images` - Ảnh trong albums

### 3.2. Xem cấu trúc Table

Click chuột phải vào table → **"Properties"**

Các tab quan trọng:
- **Columns**: Danh sách cột và kiểu dữ liệu
- **Constraints**: Ràng buộc (Primary Key, Foreign Key, Unique)
- **Indexes**: Chỉ mục để tăng tốc truy vấn
- **Triggers**: Triggers tự động

---

## 💻 Bước 4: Chạy SQL Queries

### 4.1. Mở Query Tool

**Cách 1:** Click vào database → Click icon **"Query Tool"** (⚡) trên toolbar

**Cách 2:** Click chuột phải vào database → **"Query Tool"**

### 4.2. Các Query cơ bản

#### Xem tất cả vải:
```sql
SELECT * FROM fabrics 
ORDER BY created_at DESC 
LIMIT 10;
```

#### Đếm số lượng vải:
```sql
SELECT COUNT(*) as total_fabrics FROM fabrics;
```

#### Tìm vải theo tên:
```sql
SELECT * FROM fabrics 
WHERE name ILIKE '%cotton%';
```

#### Xem vải trong collection:
```sql
SELECT 
    f.id,
    f.name,
    f.code,
    c.name as collection_name
FROM fabrics f
JOIN fabric_collections fc ON f.id = fc.fabric_id
JOIN collections c ON fc.collection_id = c.id
WHERE c.name = 'Summer 2024';
```

#### Thống kê vải theo collection:
```sql
SELECT 
    c.name as collection_name,
    COUNT(fc.fabric_id) as fabric_count
FROM collections c
LEFT JOIN fabric_collections fc ON c.id = fc.collection_id
GROUP BY c.id, c.name
ORDER BY fabric_count DESC;
```

### 4.3. Chạy Query

1. Gõ SQL vào editor
2. Click **"Execute/Refresh"** (▶️) hoặc nhấn **F5**
3. Kết quả hiển thị ở tab **"Data Output"** bên dưới

### 4.4. Export kết quả

Click vào icon **"Download"** trên Data Output → Chọn format:
- CSV
- JSON
- Excel

---

## 🔧 Bước 5: Quản lý Dữ liệu

### 5.1. Thêm dữ liệu mới (INSERT)

```sql
INSERT INTO fabrics (name, code, description, color, material, width, weight)
VALUES (
    'Cotton Premium',
    'FAB-001',
    'High quality cotton fabric',
    'White',
    'Cotton',
    150.0,
    200.0
);
```

### 5.2. Cập nhật dữ liệu (UPDATE)

```sql
UPDATE fabrics 
SET price = 150000, 
    updated_at = NOW()
WHERE code = 'FAB-001';
```

### 5.3. Xóa dữ liệu (DELETE)

```sql
-- Xóa một record cụ thể
DELETE FROM fabrics 
WHERE id = 123;

-- Xóa nhiều records
DELETE FROM fabrics 
WHERE created_at < '2024-01-01';
```

**⚠️ Cảnh báo:** Luôn kiểm tra kỹ điều kiện WHERE trước khi DELETE!

### 5.4. Sử dụng giao diện (không cần SQL)

1. Click chuột phải vào table → **"View/Edit Data" → "All Rows"**
2. Click vào cell để chỉnh sửa trực tiếp
3. Click **"Save"** (💾) để lưu thay đổi

---

## 💾 Bước 6: Backup và Restore

### 6.1. Backup Database

1. Click chuột phải vào **database "tva_fabric_library"**
2. Chọn **"Backup..."**
3. Cấu hình:
   - **Filename**: Chọn vị trí lưu (ví dụ: `tva_backup_2024-09-30.sql`)
   - **Format**: 
     - `Plain` - SQL text file (dễ đọc, có thể edit)
     - `Custom` - Compressed format (nhỏ hơn, nhanh hơn)
   - **Encoding**: UTF8
4. Tab **"Data Options"**:
   - ☑️ **Blobs** - Backup binary data
   - ☑️ **Data** - Backup dữ liệu
5. Click **"Backup"**

### 6.2. Restore Database

1. Click chuột phải vào **database "tva_fabric_library"**
2. Chọn **"Restore..."**
3. Chọn file backup
4. Click **"Restore"**

**Lưu ý:** Nếu restore vào database đã có dữ liệu, có thể gặp lỗi duplicate. Nên restore vào database mới hoặc xóa dữ liệu cũ trước.

### 6.3. Backup từ Command Line (Khuyến nghị cho automation)

```bash
# Backup
docker exec tva-postgres pg_dump -U tva_admin -d tva_fabric_library > backup.sql

# Restore
docker exec -i tva-postgres psql -U tva_admin -d tva_fabric_library < backup.sql
```

---

## 📈 Bước 7: Monitor và Tối ưu

### 7.1. Xem Dashboard

Click vào **database** → Tab **"Dashboard"** hiển thị:
- Server activity
- Database size
- Number of connections
- Transactions per second

### 7.2. Xem Active Queries

**Tools → Server Status** → Tab **"Sessions"**

Hiển thị:
- Queries đang chạy
- User đang kết nối
- Thời gian chạy
- Database đang sử dụng

### 7.3. Explain Query (Phân tích hiệu suất)

```sql
EXPLAIN ANALYZE
SELECT * FROM fabrics 
WHERE material = 'Cotton';
```

Kết quả cho biết:
- Query plan
- Execution time
- Rows scanned
- Index usage

### 7.4. Tạo Index để tăng tốc

```sql
-- Tạo index cho cột thường xuyên search
CREATE INDEX idx_fabrics_material ON fabrics(material);
CREATE INDEX idx_fabrics_color ON fabrics(color);
CREATE INDEX idx_fabrics_code ON fabrics(code);

-- Xem danh sách indexes
SELECT * FROM pg_indexes 
WHERE tablename = 'fabrics';
```

---

## 👥 Bước 8: Quản lý Users và Permissions

### 8.1. Tạo User mới

```sql
-- Tạo user chỉ đọc (read-only)
CREATE USER readonly_user WITH PASSWORD 'password123';
GRANT CONNECT ON DATABASE tva_fabric_library TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Tạo user có quyền ghi
CREATE USER editor_user WITH PASSWORD 'password456';
GRANT CONNECT ON DATABASE tva_fabric_library TO editor_user;
GRANT USAGE ON SCHEMA public TO editor_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO editor_user;
```

### 8.2. Xem Users hiện tại

Click vào **Login/Group Roles** trong sidebar

Hoặc chạy query:
```sql
SELECT usename, usesuper, usecreatedb 
FROM pg_user;
```

---

## 🔍 Bước 9: Các Tính năng Nâng cao

### 9.1. ERD Diagram (Sơ đồ quan hệ)

1. Click chuột phải vào database
2. Chọn **"ERD For Database"**
3. pgAdmin sẽ tạo sơ đồ quan hệ giữa các tables

### 9.2. Import/Export Data

#### Import CSV:
1. Click chuột phải vào table → **"Import/Export Data..."**
2. Tab **"Import"**:
   - Chọn file CSV
   - Cấu hình delimiter (`,` hoặc `;`)
   - Map columns
3. Click **"OK"**

#### Export CSV:
1. Click chuột phải vào table → **"Import/Export Data..."**
2. Tab **"Export"**:
   - Chọn vị trí lưu
   - Chọn format (CSV, Text)
3. Click **"OK"**

### 9.3. Scheduled Jobs (Tác vụ định kỳ)

Sử dụng **pgAgent** để schedule:
- Backup tự động
- Data cleanup
- Report generation

---

## 🎨 Bước 10: Tùy chỉnh giao diện

### 10.1. Theme

**File → Preferences → Miscellaneous → Themes**
- Light theme
- Dark theme

### 10.2. Query Editor Settings

**File → Preferences → Query Tool**
- Font size
- Tab size
- Auto-complete
- Syntax highlighting

---

## 📝 Các Query hữu ích cho dự án TVA

### Xem tất cả tables và số lượng records:
```sql
SELECT 
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### Xem kích thước database:
```sql
SELECT 
    pg_size_pretty(pg_database_size('tva_fabric_library')) as database_size;
```

### Xem kích thước từng table:
```sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Tìm duplicate records:
```sql
SELECT code, COUNT(*) 
FROM fabrics 
GROUP BY code 
HAVING COUNT(*) > 1;
```

---

## ⚠️ Lưu ý quan trọng

### Bảo mật:
- ❌ **KHÔNG** share password database
- ✅ Sử dụng read-only user cho reporting
- ✅ Backup thường xuyên
- ✅ Test queries trên development trước

### Performance:
- ✅ Sử dụng LIMIT khi query large tables
- ✅ Tạo indexes cho columns thường search
- ✅ Sử dụng EXPLAIN để analyze slow queries
- ❌ Tránh SELECT * trong production

### Best Practices:
- ✅ Luôn có WHERE clause khi UPDATE/DELETE
- ✅ Test backup/restore định kỳ
- ✅ Monitor database size
- ✅ Clean up old data

---

## 🆘 Troubleshooting

### Không kết nối được database:
```bash
# Kiểm tra PostgreSQL đang chạy
docker ps | grep postgres

# Kiểm tra logs
docker logs tva-postgres

# Test connection
docker exec tva-postgres pg_isready -U tva_admin
```

### pgAdmin chậm:
- Clear browser cache
- Restart pgAdmin container: `docker-compose restart pgadmin`
- Giảm số lượng rows hiển thị trong preferences

### Quên password:
```bash
# Reset pgAdmin password
docker-compose down
docker volume rm tva_pgadmin_data
docker-compose up -d pgadmin
```

---

## 📚 Tài liệu tham khảo

- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

---

**✅ Bạn đã sẵn sàng sử dụng pgAdmin 4!**

Nếu cần hỗ trợ thêm, hãy cho tôi biết! 🚀

