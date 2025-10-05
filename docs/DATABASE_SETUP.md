# PostgreSQL Database Setup Guide

## 🎯 Tổng quan

Dự án Thư Viện Ảnh VẢI đã được tích hợp với PostgreSQL database và pgAdmin 4 để quản lý dữ liệu.

**⚠️ LƯU Ý QUAN TRỌNG: Dự án hiện đang sử dụng database `Ninh96`. Xem chi tiết trong file `DATABASE_NINH96_SETUP.md`**

---

## 🐳 Docker Services

Docker Compose đã được cấu hình với 3 services:

1. **postgres** - PostgreSQL 15 database
2. **pgadmin** - pgAdmin 4 web interface
3. **fabric-library** - Next.js application

---

## 🚀 Khởi động Database

### 1. Start tất cả services

```bash
docker-compose up -d
```

Lệnh này sẽ khởi động:
- PostgreSQL trên port **5434** (mapped từ internal port 5432)
- pgAdmin 4 trên port **5051** (mapped từ internal port 80)
- Application trên port **4000**

### 2. Kiểm tra services đang chạy

```bash
docker-compose ps
```

### 3. Xem logs

```bash
# Xem logs của PostgreSQL
docker logs tva-postgres -f

# Xem logs của pgAdmin
docker logs tva-pgadmin -f

# Xem logs của app
docker logs tva-fabric-library -f
```

---

## 🔐 Thông tin đăng nhập

### PostgreSQL Database

- **Host**: localhost (hoặc `postgres` từ bên trong Docker network)
- **Port**: 5434 (external), 5432 (internal Docker network)
- **Database**: tva_fabric_library
- **Username**: tva_admin
- **Password**: Villad24@TVA

### pgAdmin 4 Web Interface

- **URL**: http://localhost:5051
- **Email**: admin@tva.com
- **Password**: Villad24@

---

## 📊 Truy cập pgAdmin 4

### 1. Mở trình duyệt và truy cập

```
http://localhost:5051
```

### 2. Đăng nhập với thông tin

- Email: `admin@tva.local`
- Password: `Villad24@`

### 3. Thêm PostgreSQL server

Click **Add New Server** và điền thông tin:

**General tab:**
- Name: `TVA Fabric Library`

**Connection tab:**
- Host: `postgres` (container name trong Docker network)
- Port: `5432`
- Maintenance database: `tva_fabric_library`
- Username: `tva_admin`
- Password: `Villad24@TVA`
- Save password: ✅ (checked)

Click **Save**

---

## 🗄️ Database Schema

Database bao gồm các bảng sau:

### Core Tables

1. **users** - Người dùng hệ thống
2. **collections** - Bộ sưu tập vải
3. **fabrics** - Thư viện vải
4. **collection_fabrics** - Liên kết collection & fabric (many-to-many)
5. **fabric_images** - Hình ảnh của vải
6. **albums** - Album ảnh
7. **album_images** - Hình ảnh trong album

### Schema Files

- `database/schema.sql` - Full schema với comments
- `database/init.sql` - Auto-initialization script
- `database/seed.sql` - Sample data cho development

---

## 🌱 Seed Sample Data

### Chạy seed data script

```bash
# Copy seed.sql vào container
docker cp database/seed.sql tva-postgres:/tmp/seed.sql

# Execute seed script
docker exec -it tva-postgres psql -U tva_admin -d tva_fabric_library -f /tmp/seed.sql
```

### Sample data bao gồm:

- 3 users (admin, manager, viewer)
- 3 collections
- 5 fabrics
- 4 albums

---

## 🔧 Database Management Commands

### Kết nối vào PostgreSQL container

```bash
docker exec -it tva-postgres psql -U tva_admin -d tva_fabric_library
```

### Useful PostgreSQL commands

```sql
-- List all tables
\dt

-- Describe table structure
\d fabrics

-- View table data
SELECT * FROM collections;

-- Count records
SELECT COUNT(*) FROM fabrics;

-- Check database size
\l+

-- Exit
\q
```

### Backup database

```bash
# Backup to SQL file
docker exec tva-postgres pg_dump -U tva_admin tva_fabric_library > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with gzip compression
docker exec tva-postgres pg_dump -U tva_admin tva_fabric_library | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore database

```bash
# From SQL file
docker exec -i tva-postgres psql -U tva_admin tva_fabric_library < backup.sql

# From gzip file
gunzip -c backup.sql.gz | docker exec -i tva-postgres psql -U tva_admin tva_fabric_library
```

---

## 🔄 Switching from Mock Data to PostgreSQL

### In your code

```typescript
// Old (mock data)
import { CollectionService } from '@/lib/database'

// New (PostgreSQL)
import { CollectionService } from '@/lib/database-pg'
```

### Environment variables

Application tự động sử dụng PostgreSQL khi các biến môi trường sau được set:

```env
DATABASE_URL=postgresql://tva_admin:Villad24@TVA@postgres:5432/tva_fabric_library
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=tva_admin
POSTGRES_PASSWORD=Villad24@TVA
POSTGRES_DB=tva_fabric_library
```

---

## 🏥 Health Checks

### Check database connection

```bash
# Via API endpoint
curl http://localhost:4000/api/health/db

# Via psql
docker exec tva-postgres pg_isready -U tva_admin -d tva_fabric_library
```

### Check pgAdmin

```bash
curl http://localhost:5051
```

---

## 🛠️ Troubleshooting

### PostgreSQL container won't start

```bash
# Check logs
docker logs tva-postgres

# Remove old volumes and restart
docker-compose down -v
docker-compose up -d postgres
```

### Can't connect to database from pgAdmin

- Đảm bảo sử dụng hostname `postgres` (không phải `localhost`)
- Kiểm tra cả hai containers đều chạy: `docker-compose ps`
- Restart pgAdmin: `docker-compose restart pgadmin`

### pgAdmin shows "password authentication failed"

- Kiểm tra credentials trong docker-compose.yml
- Restart containers: `docker-compose restart`

### Port already in use

```bash
# Check what's using the port
lsof -i :5434  # PostgreSQL (external)
lsof -i :5051  # pgAdmin

# Stop the conflicting process or change port in docker-compose.yml
```

### Database is empty after restart

- Đảm bảo volumes được persist: `docker volume ls`
- Check volume mount: `docker-compose down && docker-compose up -d`

---

## 📈 Performance Optimization

### Indexes

Schema đã bao gồm các indexes được tối ưu:

- GIN indexes cho array columns (tags)
- B-tree indexes cho foreign keys
- Covering indexes cho queries thường dùng

### Connection Pooling

Application sử dụng connection pooling với:
- Max pool size: 20 connections
- Idle timeout: 30 seconds
- Connection timeout: 10 seconds

### Query Monitoring

```sql
-- View active queries
SELECT pid, query, state, query_start 
FROM pg_stat_activity 
WHERE datname = 'tva_fabric_library';

-- View slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

## 🔒 Security Best Practices

### For Production

1. **Change default passwords**
   ```bash
   # Create .env file
   POSTGRES_PASSWORD=<strong-password>
   PGADMIN_DEFAULT_PASSWORD=<strong-password>
   ```

2. **Use Docker secrets** instead of environment variables

3. **Restrict network access**
   - Don't expose ports 5434 and 5051 to public
   - Use VPN or SSH tunnel

4. **Enable SSL/TLS** for PostgreSQL connections

5. **Regular backups**
   - Set up automated daily backups
   - Store backups in secure location

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgAdmin 4 Documentation](https://www.pgadmin.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)

---

## 🎉 Summary

Bạn đã thành công:

✅ Cài đặt PostgreSQL 15 database  
✅ Cài đặt pgAdmin 4 web interface  
✅ Tạo database schema với đầy đủ tables, indexes, triggers  
✅ Cấu hình Docker Compose với 3 services  
✅ Tích hợp database connection vào Next.js app  
✅ Tạo health check endpoints  
✅ Chuẩn bị seed data cho testing  

**Next steps:**
1. Start services: `docker-compose up -d`
2. Access pgAdmin: http://localhost:5051
3. Add server connection
4. Run seed data
5. Test application với real database!
