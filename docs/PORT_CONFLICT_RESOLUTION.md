# Giải quyết Xung đột Port - Docker Deployment

## 🎯 Vấn đề

Khi khởi động dự án TVA Fabric Library với Docker, phát hiện các port bị trùng lặp với các dịch vụ khác đang chạy trên máy:

### Kiểm tra Port Conflict

```bash
lsof -i :4000 -i :5432 -i :5050 | grep LISTEN
```

**Kết quả:**
- ⚠️ Port **5432** (PostgreSQL) đang được sử dụng bởi postgres process (PID 881)
- ⚠️ Port **5050** (pgAdmin) đang được sử dụng bởi Docker terabase (PID 17896)
- ✅ Port **4000** (Application) đang trống

---

## ✅ Giải pháp: Thay đổi Port Mapping

### Bảng so sánh Port

| Service | Port Cũ | Port Mới | Trạng thái |
|---------|---------|----------|------------|
| **PostgreSQL** | 5432 | **5434** | ✅ Đã cập nhật |
| **pgAdmin 4** | 5050 | **5051** | ✅ Đã cập nhật |
| **Application** | 4000 | **4000** | ✅ Giữ nguyên |

### Lưu ý quan trọng

- **External Port** (host machine): Port mà bạn truy cập từ máy local
- **Internal Port** (Docker network): Port mà các container giao tiếp với nhau

```
Host Machine          Docker Network
localhost:5434  →     postgres:5432
localhost:5051  →     pgadmin:80
localhost:4000  →     app:4000
```

---

## 📝 Files đã được cập nhật

### 1. docker-compose.yml

#### PostgreSQL Service
```yaml
postgres:
  ports:
    - "5434:5432"  # Changed from 5432:5432
```

#### pgAdmin Service
```yaml
pgadmin:
  ports:
    - "5051:80"    # Changed from 5050:80
```

#### Application Service
```yaml
fabric-library:
  ports:
    - "4000:4000"  # Unchanged
  environment:
    # Internal connection vẫn dùng port 5432
    - DATABASE_URL=postgresql://tva_admin:Villad24@TVA@postgres:5432/tva_fabric_library
    - POSTGRES_HOST=postgres
    - POSTGRES_PORT=5432  # Internal port
```

### 2. DATABASE_SETUP.md

Đã cập nhật tất cả tài liệu hướng dẫn với port mới:
- PostgreSQL: 5434 (external), 5432 (internal)
- pgAdmin: 5051
- Application: 4000

---

## 🚀 Cách sử dụng

### 1. Khởi động Docker Services

```bash
# Dừng các container cũ (nếu có)
docker-compose down

# Xóa volumes cũ (nếu cần reset database)
docker-compose down -v

# Build và khởi động với cấu hình mới
docker-compose up --build -d

# Kiểm tra services đang chạy
docker-compose ps
```

### 2. Truy cập Services

#### Application
```
http://localhost:4000
```

#### pgAdmin 4
```
URL: http://localhost:5051
Email: admin@tva.local
Password: Villad24@
```

#### PostgreSQL từ Host Machine
```bash
# Sử dụng psql
psql -h localhost -p 5434 -U tva_admin -d tva_fabric_library

# Hoặc connection string
postgresql://tva_admin:Villad24@TVA@localhost:5434/tva_fabric_library
```

#### PostgreSQL từ bên trong Docker Network
```bash
# Từ container khác trong cùng network
psql -h postgres -p 5432 -U tva_admin -d tva_fabric_library

# Connection string
postgresql://tva_admin:Villad24@TVA@postgres:5432/tva_fabric_library
```

---

## 🔍 Kiểm tra và Xác nhận

### 1. Kiểm tra Port đang lắng nghe

```bash
# Kiểm tra port mới
lsof -i :5434  # PostgreSQL
lsof -i :5051  # pgAdmin
lsof -i :4000  # Application

# Hoặc dùng netstat
netstat -an | grep LISTEN | grep -E '5434|5051|4000'
```

### 2. Kiểm tra Container Health

```bash
# Xem logs
docker logs tva-postgres -f
docker logs tva-pgadmin -f
docker logs tva-fabric-library -f

# Kiểm tra health status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### 3. Test Database Connection

```bash
# Test từ host machine
docker exec tva-postgres pg_isready -U tva_admin -d tva_fabric_library

# Test API health check
curl http://localhost:4000/api/health
curl http://localhost:4000/api/health/db
```

---

## 🛠️ Troubleshooting

### Vẫn bị conflict port?

```bash
# 1. Kiểm tra process đang dùng port
lsof -i :5434
lsof -i :5051

# 2. Dừng Docker containers
docker-compose down

# 3. Kill process đang dùng port (nếu cần)
kill -9 <PID>

# 4. Khởi động lại
docker-compose up -d
```

### Container không start được?

```bash
# Xem logs chi tiết
docker-compose logs

# Xóa volumes và rebuild
docker-compose down -v
docker-compose up --build --force-recreate
```

### Không kết nối được database?

```bash
# Kiểm tra network
docker network ls
docker network inspect fabric-library-network

# Kiểm tra container có trong network không
docker network inspect fabric-library-network | grep -A 5 "Containers"
```

---

## 📊 Port Mapping Summary

### Từ Host Machine (localhost)

| Service | URL/Connection |
|---------|----------------|
| Application | http://localhost:4000 |
| pgAdmin | http://localhost:5051 |
| PostgreSQL | localhost:5434 |

### Từ Docker Network (container-to-container)

| Service | URL/Connection |
|---------|----------------|
| Application | http://fabric-library:4000 |
| pgAdmin | http://pgadmin:80 |
| PostgreSQL | postgres:5432 |

---

## ✅ Kết quả

- ✅ Không còn conflict port với dịch vụ khác
- ✅ Tất cả services khởi động thành công
- ✅ Database connection hoạt động bình thường
- ✅ Application truy cập được database
- ✅ pgAdmin kết nối được PostgreSQL
- ✅ Tài liệu đã được cập nhật đầy đủ

---

## 📅 Thông tin

- **Ngày thực hiện**: 2025-09-30
- **Người thực hiện**: Augment Agent
- **Lý do**: Tránh xung đột port với các dự án khác đang chạy
- **Impact**: Không ảnh hưởng đến chức năng, chỉ thay đổi port mapping

---

## 🔗 Tài liệu liên quan

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Hướng dẫn setup database
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Hướng dẫn deploy Docker
- [PORT_CHANGE_SUMMARY.md](./PORT_CHANGE_SUMMARY.md) - Lịch sử thay đổi port trước đó
- [docker-compose.yml](./docker-compose.yml) - File cấu hình Docker Compose

