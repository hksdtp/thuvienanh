# 🎯 Hướng Dẫn Bắt Đầu Với Dữ Liệu Thật

## ✅ Database Đã Được Reset

**Trạng thái hiện tại:**
- ✅ Đã xóa toàn bộ dữ liệu mẫu/giả
- ✅ Database sạch, sẵn sàng cho dữ liệu thật
- ✅ Giữ lại 1 user admin: `admin@tva.local`

**Thống kê:**
```
Fabrics:            0 records
Fabric Images:      0 records
Collections:        0 records
Collection-Fabrics: 0 records
Albums:             0 records
Album Images:       0 records
Users:              1 record (admin)
```

---

## 🚀 Bắt Đầu Tạo Dữ Liệu Thật

### **Bước 1: Truy Cập Ứng Dụng**

```
🌐 Web App: http://localhost:4000
```

### **Bước 2: Tạo Bộ Sưu Tập (Collections)**

1. Truy cập: http://localhost:4000/collections
2. Click **"Thêm bộ sưu tập"**
3. Điền thông tin:
   - **Tên bộ sưu tập**: Ví dụ "Vải Xuân Hè 2025"
   - **Mô tả**: Mô tả chi tiết về bộ sưu tập
   - **Trạng thái**: Active/Inactive
4. Click **"Lưu"**

**Gợi ý tên bộ sưu tập:**
- Vải Xuân Hè 2025
- Vải Thu Đông 2025
- Vải Cao Cấp
- Vải Công Sở
- Vải Dạ Hội
- Vải Thể Thao

---

### **Bước 3: Tạo Albums (Tùy Chọn)**

1. Truy cập: http://localhost:4000/albums
2. Click **"Tạo album mới"**
3. Điền thông tin:
   - **Tên album**: Ví dụ "Ảnh Vải Mẫu 2025"
   - **Mô tả**: Mô tả về album
4. Click **"Lưu"**

**Gợi ý tên albums:**
- Ảnh Vải Mẫu 2025
- Lookbook Xuân Hè
- Catalog Vải Cao Cấp
- Mẫu Vải Mới Nhất

---

### **Bước 4: Upload Ảnh Vải Thật**

#### **Cách 1: Upload Trực Tiếp Khi Tạo Vải**

1. Truy cập: http://localhost:4000/fabrics
2. Click **"Thêm vải mới"**
3. **Chọn Storage Type:**
   - **Photos API** ⭐ (Khuyến nghị - Upload lên Synology Photos)
   - **Local** (Lưu trên server local)
   - **File Station** (Upload lên Synology File Station)
4. **Đợi kết nối:**
   - Đợi status hiển thị: ✅ "Synology Photos API đã kết nối"
5. **Upload ảnh:**
   - Kéo thả hoặc click để chọn file ảnh
   - Hỗ trợ: JPG, PNG, WEBP
   - Có thể upload nhiều ảnh cùng lúc
6. **Điền thông tin vải:**
   - **Mã vải**: Ví dụ "V001", "COTTON-001"
   - **Tên vải**: Ví dụ "Vải Cotton Cao Cấp"
   - **Chất liệu**: Cotton, Polyester, Linen, Silk, Wool, v.v.
   - **Màu sắc**: Trắng, Đen, Xanh, Đỏ, v.v.
   - **Giá/mét**: Giá bán (VNĐ)
   - **Bộ sưu tập**: Chọn bộ sưu tập đã tạo
7. Click **"Lưu"**

#### **Cách 2: Test Upload Trên Trang Test**

1. Truy cập: http://localhost:4000/synology-test
2. Scroll xuống phần **"Upload Files"**
3. Click **"Chọn files để upload"**
4. Chọn ảnh từ máy tính
5. Click **"Upload to Synology Photos"**
6. Xem kết quả upload

---

## 📁 Cấu Trúc Đề Xuất

### **Quy Tắc Đặt Tên File Ảnh:**

```
[MÃ_VẢI]-[MÔ_TẢ]-[SỐ_THỨ_TỰ].jpg

Ví dụ:
- V001-cotton-cao-cap-01.jpg
- V001-cotton-cao-cap-02.jpg
- V002-polyester-trang-01.jpg
```

### **Quy Tắc Mã Vải:**

```
[LOẠI_VẢI]-[SỐ_THỨ_TỰ]

Ví dụ:
- COTTON-001
- POLY-001
- SILK-001
- LINEN-001
```

### **Cấu Trúc Bộ Sưu Tập:**

```
Bộ Sưu Tập
├── Vải Xuân Hè 2025
│   ├── COTTON-001: Vải Cotton Trắng
│   ├── COTTON-002: Vải Cotton Xanh
│   └── POLY-001: Vải Polyester Đỏ
├── Vải Thu Đông 2025
│   ├── WOOL-001: Vải Wool Nâu
│   └── SILK-001: Vải Silk Đen
└── Vải Cao Cấp
    ├── SILK-002: Vải Silk Cao Cấp
    └── LINEN-001: Vải Linen Premium
```

---

## 🎨 Storage Types - Chọn Loại Lưu Trữ

| Storage Type | Mô Tả | Ưu Điểm | Nhược Điểm | Khuyến Nghị |
|--------------|-------|---------|------------|-------------|
| **Photos API** | Upload lên Synology Photos | ✅ Quản lý tập trung<br>✅ Có albums<br>✅ Backup tự động | ⚠️ Cần kết nối Synology | ⭐⭐⭐⭐⭐ |
| **Local** | Lưu trên server | ✅ Nhanh<br>✅ Không cần kết nối | ❌ Không backup<br>❌ Khó quản lý | ⭐⭐⭐ |
| **File Station** | Upload lên File Station | ✅ Quản lý file dễ<br>✅ Backup tự động | ⚠️ Không có albums | ⭐⭐⭐⭐ |

**Khuyến nghị:** Sử dụng **Photos API** để upload ảnh vải chính thức.

---

## 📊 Workflow Đề Xuất

### **Workflow 1: Tạo Vải Mới Với Ảnh**

```
1. Chuẩn bị ảnh vải (JPG/PNG)
   ↓
2. Truy cập /fabrics → Click "Thêm vải mới"
   ↓
3. Chọn Storage Type: "Photos API"
   ↓
4. Upload ảnh (kéo thả hoặc chọn file)
   ↓
5. Điền thông tin vải (mã, tên, chất liệu, màu, giá)
   ↓
6. Chọn bộ sưu tập
   ↓
7. Click "Lưu"
   ↓
8. ✅ Vải được tạo với ảnh đã upload
```

### **Workflow 2: Tạo Bộ Sưu Tập Trước**

```
1. Truy cập /collections → Click "Thêm bộ sưu tập"
   ↓
2. Điền tên và mô tả bộ sưu tập
   ↓
3. Click "Lưu"
   ↓
4. Truy cập /fabrics → Tạo vải mới
   ↓
5. Chọn bộ sưu tập vừa tạo
   ↓
6. Upload ảnh và điền thông tin
   ↓
7. ✅ Vải được thêm vào bộ sưu tập
```

---

## 🔍 Kiểm Tra Dữ Liệu

### **Xem Danh Sách Vải:**
```
http://localhost:4000/fabrics
```

### **Xem Danh Sách Bộ Sưu Tập:**
```
http://localhost:4000/collections
```

### **Xem Danh Sách Albums:**
```
http://localhost:4000/albums
```

### **Kiểm Tra Database:**
```bash
# Đếm số lượng vải
PGPASSWORD='Demo1234' psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 \
  -c "SELECT COUNT(*) FROM fabrics;"

# Xem danh sách vải
PGPASSWORD='Demo1234' psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 \
  -c "SELECT code, name, material, color FROM fabrics;"

# Đếm số lượng ảnh
PGPASSWORD='Demo1234' psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 \
  -c "SELECT COUNT(*) FROM fabric_images;"
```

---

## 🐛 Troubleshooting

### **Lỗi: "Không thể kết nối Synology Photos API"**

**Giải pháp:**
1. Kiểm tra Synology server có online không
2. Thử chuyển sang storage type "Local"
3. Restart container: `docker-compose restart fabric-library`

### **Lỗi: "Upload failed"**

**Giải pháp:**
1. Kiểm tra file size (max 10MB)
2. Kiểm tra định dạng file (JPG, PNG, WEBP)
3. Thử upload lại
4. Check logs: `docker logs tva-fabric-library --tail 50`

### **Ảnh không hiển thị**

**Giải pháp:**
1. Refresh trang
2. Kiểm tra URL ảnh trong database
3. Verify ảnh đã được upload lên Synology
4. Check console logs trong browser (F12)

---

## 📝 Checklist Bắt Đầu

- [ ] Database đã được reset (0 fabrics, 0 collections, 0 albums)
- [ ] Ứng dụng đang chạy (http://localhost:4000)
- [ ] Đã tạo ít nhất 1 bộ sưu tập
- [ ] Đã test upload ảnh trên trang /synology-test
- [ ] Đã tạo vải đầu tiên với ảnh thật
- [ ] Đã verify ảnh hiển thị đúng trên web
- [ ] Đã kiểm tra ảnh trên Synology Photos (nếu dùng Photos API)

---

## 🎯 Mục Tiêu Tiếp Theo

1. **Tạo 3-5 bộ sưu tập** theo mùa hoặc loại vải
2. **Upload 10-20 vải mẫu** với ảnh thật
3. **Tạo 2-3 albums** để tổ chức ảnh
4. **Test tất cả tính năng:**
   - Tìm kiếm vải
   - Filter theo bộ sưu tập
   - Xem chi tiết vải
   - Edit thông tin vải
   - Xóa vải

---

## 📚 Tài Liệu Tham Khảo

- **[QUICK_START_SYNOLOGY_PHOTOS.md](./QUICK_START_SYNOLOGY_PHOTOS.md)** - Hướng dẫn Synology Photos
- **[IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md)** - Báo cáo triển khai
- **[SYNOLOGY_PHOTOS_INTEGRATION.md](./SYNOLOGY_PHOTOS_INTEGRATION.md)** - Chi tiết kỹ thuật

---

**Chúc bạn tạo dữ liệu thành công! 🎉**

**Nếu cần hỗ trợ, hãy:**
1. Check logs: `docker logs tva-fabric-library -f`
2. Test connection: http://localhost:4000/synology-test
3. Verify database: Chạy các câu lệnh SQL ở trên

