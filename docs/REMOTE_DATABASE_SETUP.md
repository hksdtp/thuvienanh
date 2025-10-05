# 🌐 Cấu hình Database Remote - Hoàn thành

**Ngày cấu hình:** 2025-09-30  
**Loại database:** Remote PostgreSQL Server

---

## ✅ **Tóm tắt:**

Dự án TVA Fabric Library đã được cấu hình để sử dụng **database remote** thay vì Docker local. Điều này cho phép bạn làm việc từ bất kỳ đâu mà không cần chạy Docker PostgreSQL trên máy tính.

---

## 🔌 **Thông tin kết nối Remote Database:**

### **Server Remote:**

| Thông tin | Giá trị |
|-----------|---------|
| **Host** | `222.252.23.248` |
| **Port** | `5499` |
| **Database** | `Ninh96` |
| **Username** | `postgres` |
| **Password** | `Demo1234` |
| **Encoding** | `UTF8` |
| **Collate** | `Vietnamese_Vietnam.1252` |

### **Connection String:**
```
postgresql://postgres:Demo1234@222.252.23.248:5499/Ninh96
```

---

## 📊 **Dữ liệu đã import:**

### **Tables (8 tables):**

| # | Table Name | Số lượng records | Mô tả |
|---|------------|------------------|-------|
| 1 | **users** | 3 | Người dùng hệ thống |
| 2 | **collections** | 3 | Bộ sưu tập vải |
| 3 | **fabrics** | 5 | Các loại vải |
| 4 | **albums** | 4 | Albums ảnh |
| 5 | **collection_fabrics** | 0 | Liên kết vải-bộ sưu tập |
| 6 | **fabric_images** | 0 | Ảnh của vải |
| 7 | **album_images** | 0 | Ảnh trong albums |
| 8 | **ninh1** | - | Table cũ (giữ nguyên) |

### **Dữ liệu mẫu Collections:**

```
ID                                   | Name                      | Active
-------------------------------------|---------------------------|--------
cfb86c95-62ee-4dcd-a5bb-a592297eb1eb | Bộ sưu tập Xuân Hè 2024  | ✅
6342eb1a-f901-400d-b5f3-fbd545c82d9e | Vải Cao Cấp              | ✅
ed010b4f-dd0a-4360-98b3-fb8935c14eaa | Vải Công Sở              | ✅
```

### **Dữ liệu mẫu Fabrics:**

```
Code  | Name                      | Material   | Color      | Price
------|---------------------------|------------|------------|--------
F0123 | Vải Lụa Cotton F0123     | Cotton     | Trắng ngà  | 45.00
P0456 | Polyester Blend P0456    | Polyester  | Xanh navy  | 32.00
L0789 | Linen Tự Nhiên L0789     | Linen      | Be nhạt    | 55.00
S0234 | Silk Cao Cấp S0234       | Silk       | Đỏ đô      | 120.00
W0567 | Wool Blend W0567         | Wool       | Xám đậm    | 85.00
```

### **Dữ liệu mẫu Users:**

```
Email                | Role      | Password (hashed)
---------------------|-----------|------------------
admin@tva.local      | admin     | admin123
manager@tva.local    | manager   | manager123
user@tva.local       | viewer    | user123
```

---

## 🚀 **Các bước đã thực hiện:**

### **1. ✅ Import Schema vào Remote Database**
```bash
PGPASSWORD='Demo1234' psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 < database/schema.sql
```

**Kết quả:**
- ✅ 7 tables mới được tạo
- ✅ 31 indexes được tạo
- ✅ 3 triggers được tạo
- ✅ 2 views được tạo
- ✅ 1 function được tạo

### **2. ✅ Import Dữ liệu mẫu**
```bash
PGPASSWORD='Demo1234' psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 < database/seed.sql
```

**Kết quả:**
- ✅ 3 users
- ✅ 3 collections
- ✅ 5 fabrics
- ✅ 4 albums

### **3. ✅ Cập nhật file .env**

**Trước:**
```env
DATABASE_URL=postgresql://postgres:Demo1234@localhost:5434/Ninh96
POSTGRES_HOST=localhost
POSTGRES_PORT=5434
```

**Sau:**
```env
DATABASE_URL=postgresql://postgres:Demo1234@222.252.23.248:5499/Ninh96
POSTGRES_HOST=222.252.23.248
POSTGRES_PORT=5499
```

### **4. ✅ Cập nhật docker-compose.yml**

**Thay đổi:**
- Cập nhật DATABASE_URL để kết nối đến remote server
- Xóa dependency vào local PostgreSQL container
- Thêm comment để dễ dàng chuyển đổi giữa local và remote

### **5. ✅ Restart ứng dụng**
```bash
docker-compose restart fabric-library
```

### **6. ✅ Test kết nối**
```bash
curl http://localhost:4000/api/health
```

**Kết quả:** ✅ Healthy

---

## 🎯 **Ưu điểm của Remote Database:**

### **1. Làm việc linh hoạt**
- ✅ Không cần chạy Docker PostgreSQL trên máy
- ✅ Tiết kiệm tài nguyên máy tính
- ✅ Làm việc từ bất kỳ đâu

### **2. Dữ liệu tập trung**
- ✅ Dữ liệu được lưu trên server remote
- ✅ Không mất dữ liệu khi tắt máy
- ✅ Dễ dàng chia sẻ dữ liệu với team

### **3. Backup tự động**
- ✅ Server remote có backup tự động
- ✅ Không lo mất dữ liệu

---

## 📝 **Cấu hình hiện tại:**

### **Docker Containers đang chạy:**

```
NAME                 STATUS              PORTS
tva-fabric-library   Up (healthy)        0.0.0.0:4000->4000/tcp
tva-pgadmin          Up                  0.0.0.0:5051->80/tcp
tva-postgres         Up (healthy)        0.0.0.0:5434->5432/tcp (KHÔNG SỬ DỤNG)
```

**Lưu ý:** Container `tva-postgres` vẫn chạy nhưng KHÔNG được sử dụng. Ứng dụng đang kết nối đến remote database.

### **Nếu muốn tắt PostgreSQL local:**

```bash
# Tắt PostgreSQL local để tiết kiệm tài nguyên
docker-compose stop postgres

# Hoặc xóa hoàn toàn
docker-compose rm -f postgres
```

---

## 🔧 **Kết nối từ pgAdmin 4:**

### **Thông tin đã có sẵn trong pgAdmin:**

Bạn đã có server "Ninh96" trong pgAdmin với thông tin:
```
Host: 222.252.23.248
Port: 5499
Database: Ninh96
Username: postgres
Password: Demo1234
```

### **Xem dữ liệu mới:**

1. Mở pgAdmin 4
2. Kết nối đến server "Ninh96"
3. Expand: **Databases → Ninh96 → Schemas → public → Tables**
4. Bạn sẽ thấy 8 tables (bao gồm 7 tables mới + table ninh1 cũ)

### **Test Queries:**

#### **Query 1: Thống kê dữ liệu**
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

#### **Query 2: Xem Collections**
```sql
SELECT id, name, description, is_active, created_at
FROM collections
ORDER BY created_at DESC;
```

#### **Query 3: Xem Fabrics**
```sql
SELECT id, code, name, material, color, price_per_meter, created_at
FROM fabrics
ORDER BY created_at DESC;
```

#### **Query 4: Xem Users**
```sql
SELECT id, email, role, is_active, created_at
FROM users
ORDER BY created_at DESC;
```

---

## 🧪 **Test kết nối từ command line:**

### **Test 1: Kết nối database**
```bash
PGPASSWORD='Demo1234' psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96
```

### **Test 2: Liệt kê tables**
```bash
PGPASSWORD='Demo1234' psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 -c "\dt"
```

### **Test 3: Đếm records**
```bash
PGPASSWORD='Demo1234' psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 -c "SELECT COUNT(*) FROM collections;"
```

---

## 🔄 **Chuyển đổi giữa Local và Remote:**

### **Để chuyển về Local Database:**

1. **Cập nhật .env:**
```env
DATABASE_URL=postgresql://postgres:Demo1234@localhost:5434/Ninh96
POSTGRES_HOST=localhost
POSTGRES_PORT=5434
```

2. **Cập nhật docker-compose.yml:**
```yaml
- DATABASE_URL=postgresql://postgres:Demo1234@postgres:5432/Ninh96
- POSTGRES_HOST=postgres
- POSTGRES_PORT=5432
```

3. **Restart:**
```bash
docker-compose restart fabric-library
```

### **Để chuyển về Remote Database:**

1. **Cập nhật .env:**
```env
DATABASE_URL=postgresql://postgres:Demo1234@222.252.23.248:5499/Ninh96
POSTGRES_HOST=222.252.23.248
POSTGRES_PORT=5499
```

2. **Cập nhật docker-compose.yml:**
```yaml
- DATABASE_URL=postgresql://postgres:Demo1234@222.252.23.248:5499/Ninh96
- POSTGRES_HOST=222.252.23.248
- POSTGRES_PORT=5499
```

3. **Restart:**
```bash
docker-compose restart fabric-library
```

---

## ⚠️ **Lưu ý quan trọng:**

### **1. Bảo mật:**
- 🔒 Password `Demo1234` đơn giản, chỉ dùng cho development
- 🔐 Nên thay đổi password phức tạp hơn cho production
- 🚪 Đảm bảo firewall cho phép kết nối từ IP của bạn

### **2. Kết nối mạng:**
- 🌐 Cần có kết nối internet để truy cập remote database
- 📡 Nếu mất kết nối, ứng dụng sẽ không hoạt động
- 🔌 Kiểm tra firewall không chặn port 5499

### **3. Backup:**
- 💾 Dữ liệu được lưu trên server remote
- 📦 Nên có backup định kỳ
- 🗄️ Sử dụng pgAdmin hoặc pg_dump để backup

### **4. Performance:**
- ⚡ Kết nối remote có thể chậm hơn local
- 🚀 Phụ thuộc vào tốc độ mạng
- 📊 Nên optimize queries để giảm số lần truy vấn

---

## 📚 **Tài liệu liên quan:**

- **[PGADMIN_CONNECTION_GUIDE.md](./PGADMIN_CONNECTION_GUIDE.md)** - Hướng dẫn kết nối pgAdmin 4
- **[DATABASE_NINH96_SETUP.md](./DATABASE_NINH96_SETUP.md)** - Thông tin chi tiết về database
- **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)** - Hướng dẫn triển khai Docker

---

## ✅ **Checklist hoàn thành:**

- [x] Import schema vào remote database
- [x] Import dữ liệu mẫu
- [x] Cập nhật file .env
- [x] Cập nhật docker-compose.yml
- [x] Restart ứng dụng
- [x] Test kết nối thành công
- [x] Kiểm tra dữ liệu trong pgAdmin
- [x] Tạo tài liệu hướng dẫn

---

## 🎉 **Kết luận:**

✅ **Đã hoàn thành cấu hình Remote Database!**

**Bạn có thể:**
1. ✅ Làm việc từ bất kỳ đâu mà không cần chạy Docker PostgreSQL
2. ✅ Truy cập dữ liệu qua pgAdmin 4
3. ✅ Chạy ứng dụng Next.js kết nối đến remote database
4. ✅ Chia sẻ dữ liệu với team dễ dàng

**Thông tin kết nối:**
- Host: 222.252.23.248
- Port: 5499
- Database: Ninh96
- Username: postgres
- Password: Demo1234

---

**Chúc bạn làm việc hiệu quả! 🚀**

