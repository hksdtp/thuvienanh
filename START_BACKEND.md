# Hướng dẫn khởi động Backend

## ✅ Database đã kết nối thành công!

Backend đã được cấu hình để kết nối đến database local `tva`.

## 🚀 Khởi động Backend

### Cách 1: Development mode (khuyến nghị)

```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:4000

### Cách 2: Production mode

```bash
npm run build
npm start
```

## 📋 Kiểm tra Backend đang chạy

Mở trình duyệt và truy cập:
- http://localhost:4000
- http://localhost:4000/api/health (nếu có health check endpoint)

## 🔍 Test API endpoints

Sau khi backend chạy, bạn có thể test các API:

```bash
# Test fabrics API
curl http://localhost:4000/api/fabrics

# Test albums API  
curl http://localhost:4000/api/albums

# Test collections API
curl http://localhost:4000/api/collections
```

## 📊 Thông tin kết nối Database

- **Database**: tva
- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: haininh1
- **Data Location**: D:\Ninh\pg\tva

## ⚠️ Lưu ý

1. **Database schema**: Database hiện tại chỉ có 1 bảng test (`test_table`)
2. **Cần import schema**: Bạn cần import schema từ file `database/schema.sql` hoặc `backup_ninhdata_full.sql`
3. **Port 4000**: Đảm bảo port 4000 không bị chiếm bởi ứng dụng khác

## 🔄 Import Database Schema

Nếu database chưa có tables, chạy:

```bash
# Import schema
psql -U postgres -h localhost -d tva -f database/schema.sql

# Hoặc restore từ backup
psql -U postgres -h localhost -d tva -f backup_ninhdata_full.sql
```

## 🌐 Kết nối Frontend với Backend

Sau khi backend chạy, frontend sẽ tự động kết nối qua:
- Local: http://localhost:4000
- API endpoints: http://localhost:4000/api/*

Mọi thao tác trên web app (thêm, sửa, xóa) sẽ được lưu vào database `tva` tại `D:\Ninh\pg\tva`.

