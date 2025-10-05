# ✅ Cấu hình Database Ninh96 - Hoàn thành

## 📋 Tổng quan

Dự án TVA Fabric Library đã được cấu hình để sử dụng database **Ninh96** thay vì `tva_fabric_library`.

---

## 🎯 Thông tin kết nối

### **Database Ninh96**

| Thông tin | Giá trị |
|-----------|---------|
| **Database Name** | `Ninh96` |
| **Host** | `postgres` (internal Docker) hoặc `localhost` (external) |
| **Port (Internal)** | `5432` |
| **Port (External)** | `5434` |
| **Username** | `postgres` |
| **Password** | `Demo1234` |

### **Connection String**

```bash
# Internal (từ container khác trong Docker network)
postgresql://postgres:Demo1234@postgres:5432/Ninh96

# External (từ máy host)
postgresql://postgres:Demo1234@localhost:5434/Ninh96
```

---

## 📊 Dữ liệu đã tạo

| Loại dữ liệu | Số lượng | Mô tả |
|--------------|----------|-------|
| **Collections** | 5 | Bộ sưu tập vải (Spring, Summer, Autumn, Winter, Classic) |
| **Fabrics** | 22 | Các loại vải (Cotton, Silk, Linen, Wool, Denim, Chiffon, Polyester) |
| **Collection_Fabrics** | 32 | Liên kết giữa vải và bộ sưu tập |
| **Albums** | 5 | Albums ảnh |

### **Thống kê vải theo loại:**

```
   material   | count |      avg_price      
--------------+-------+---------------------
 Cotton       |     4 |  86,250 VNĐ/m
 Polyester    |     3 |  55,000 VNĐ/m
 Linen        |     3 | 121,667 VNĐ/m
 Cotton Denim |     3 |  96,000 VNĐ/m
 Silk         |     3 | 360,000 VNĐ/m
 Wool         |     3 | 286,667 VNĐ/m
 Chiffon      |     3 |  76,000 VNĐ/m
```

---

## 🔧 Các thay đổi đã thực hiện

### 1. **docker-compose.yml**

```yaml
# PostgreSQL Service
postgres:
  environment:
    - POSTGRES_DB=Ninh96  # Thay đổi từ tva_fabric_library

# Application Service
fabric-library:
  environment:
    - DATABASE_URL=postgresql://tva_admin:Villad24@TVA@postgres:5432/Ninh96
    - POSTGRES_DB=Ninh96
```

### 2. **Database Schema**

- ✅ Tạo database `Ninh96`
- ✅ Import schema từ `database/schema.sql`
- ✅ Import dữ liệu mẫu từ `database/sample_data.sql`

---

## 🚀 Cách sử dụng

### **1. Kết nối qua pgAdmin**

1. Mở pgAdmin: http://localhost:5051
2. Login:
   - Email: `admin@tva.com`
   - Password: `Villad24@`
3. Kết nối server:
   - Host: `postgres`
   - Port: `5432`
   - Database: `Ninh96`
   - Username: `postgres`
   - Password: `Demo1234`

### **2. Kết nối từ command line**

```bash
# Từ bên trong Docker container
docker exec -it tva-postgres psql -U postgres -d Ninh96

# Từ máy host (cần cài psql)
psql -h localhost -p 5434 -U postgres -d Ninh96
```

### **3. Kết nối từ ứng dụng**

Ứng dụng Next.js đã được cấu hình tự động qua biến môi trường:

```env
DATABASE_URL=postgresql://postgres:Demo1234@postgres:5432/Ninh96
```

---

## 💻 Các lệnh hữu ích

### **Xem tất cả tables**

```bash
docker exec -it tva-postgres psql -U postgres -d Ninh96 -c "\dt"
```

### **Xem dữ liệu fabrics**

```bash
docker exec -it tva-postgres psql -U tva_admin -d Ninh96 -c "SELECT * FROM fabrics LIMIT 5;"
```

### **Xem collections**

```bash
docker exec -it tva-postgres psql -U tva_admin -d Ninh96 -c "SELECT * FROM collections;"
```

### **Backup database**

```bash
docker exec tva-postgres pg_dump -U tva_admin Ninh96 > backup_ninh96_$(date +%Y%m%d).sql
```

### **Restore database**

```bash
docker exec -i tva-postgres psql -U tva_admin -d Ninh96 < backup_ninh96_20250930.sql
```

---

## 📚 Queries mẫu

### **1. Xem tất cả vải với giá**

```sql
SELECT 
    code,
    name,
    material,
    color,
    price_per_meter,
    stock_quantity
FROM fabrics
ORDER BY price_per_meter DESC;
```

### **2. Xem vải trong collection**

```sql
SELECT 
    c.name as collection_name,
    f.code,
    f.name as fabric_name,
    f.material,
    f.price_per_meter
FROM collections c
JOIN collection_fabrics cf ON c.id = cf.collection_id
JOIN fabrics f ON cf.fabric_id = f.id
WHERE c.name = 'Spring Collection 2024'
ORDER BY f.code;
```

### **3. Tìm vải theo màu**

```sql
SELECT name, code, material, color, price_per_meter
FROM fabrics
WHERE color ILIKE '%blue%'
ORDER BY price_per_meter;
```

### **4. Thống kê tồn kho**

```sql
SELECT 
    material,
    COUNT(*) as total_fabrics,
    SUM(stock_quantity) as total_stock,
    AVG(price_per_meter) as avg_price
FROM fabrics
GROUP BY material
ORDER BY total_stock DESC;
```

---

## ✅ Kiểm tra hoạt động

### **1. Kiểm tra Docker containers**

```bash
docker-compose ps
```

Kết quả mong đợi:
```
NAME                 STATUS              PORTS
tva-postgres         Up (healthy)        0.0.0.0:5434->5432/tcp
tva-pgadmin          Up                  0.0.0.0:5051->80/tcp
tva-fabric-library   Up                  0.0.0.0:4000->4000/tcp
```

### **2. Kiểm tra database connection**

```bash
docker exec tva-postgres pg_isready -U tva_admin -d Ninh96
```

Kết quả: `/var/run/postgresql:5432 - accepting connections`

### **3. Kiểm tra application health**

```bash
curl http://localhost:4000/api/health
```

Kết quả:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-30T...",
  "service": "fabric-library"
}
```

---

## 🎯 Lưu ý quan trọng

### ⚠️ **Chỉ sử dụng database Ninh96**

- ✅ Tất cả dữ liệu được lưu trong database **Ninh96**
- ❌ **KHÔNG** sử dụng database khác
- ✅ Tất cả kết nối đã được cấu hình tự động

### 🔒 **Bảo mật**

- Password: `Villad24@TVA` (đã được cấu hình trong Docker)
- Port external: `5434` (tránh conflict với PostgreSQL khác)
- Chỉ accessible từ localhost

### 📦 **Backup định kỳ**

Nên backup database thường xuyên:

```bash
# Backup hàng ngày
docker exec tva-postgres pg_dump -U tva_admin Ninh96 > backup_ninh96_$(date +%Y%m%d).sql

# Backup với compression
docker exec tva-postgres pg_dump -U tva_admin Ninh96 | gzip > backup_ninh96_$(date +%Y%m%d).sql.gz
```

---

## 🔄 Restart services

Nếu cần restart:

```bash
# Restart tất cả
docker-compose restart

# Restart chỉ database
docker-compose restart postgres

# Restart chỉ application
docker-compose restart fabric-library
```

---

## 📖 Tài liệu liên quan

- `PGADMIN_GUIDE.md` - Hướng dẫn chi tiết sử dụng pgAdmin 4
- `database/schema.sql` - Schema đầy đủ của database
- `database/sample_data.sql` - Dữ liệu mẫu
- `docker-compose.yml` - Cấu hình Docker

---

## ✅ Tóm tắt

✅ **Đã hoàn thành:**
- Cấu hình Docker để sử dụng database Ninh96
- Tạo database Ninh96
- Import schema đầy đủ
- Import dữ liệu mẫu (5 collections, 22 fabrics, 32 relationships, 5 albums)
- Kiểm tra kết nối thành công
- Application đang chạy healthy

✅ **Sẵn sàng sử dụng:**
- pgAdmin: http://localhost:5051
- Application: http://localhost:4000
- Database: Ninh96 (port 5434)

---

**🎉 Database Ninh96 đã sẵn sàng sử dụng!**

