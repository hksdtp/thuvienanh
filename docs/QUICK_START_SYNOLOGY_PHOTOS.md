# 🚀 Quick Start: Synology Photos API

## 📋 Tóm Tắt

Hướng dẫn nhanh để sử dụng tính năng upload ảnh lên Synology Photos trong TVA Fabric Library.

---

## ✅ Kiểm Tra Kết Nối

### **Bước 1: Mở trang test**

```
http://localhost:4000/synology-test
```

### **Bước 2: Test các tính năng**

1. **Test Connection** - Kiểm tra kết nối đến Synology server
2. **Browse Folders** - Xem danh sách thư mục cá nhân
3. **Browse Shared Folders** - Xem danh sách thư mục chia sẻ
4. **Browse Albums** - Xem danh sách albums
5. **Upload Files** - Test upload ảnh

---

## 📤 Upload Ảnh Vải

### **Cách 1: Từ trang Fabrics**

1. Truy cập: http://localhost:4000/fabrics
2. Click **"Thêm vải mới"**
3. Trong phần upload:
   - Chọn storage type: **"Photos API"** (màu teal)
   - Đợi status hiển thị: ✅ "Synology Photos API đã kết nối"
4. Kéo thả hoặc chọn file ảnh
5. Click **"Upload"**
6. Điền thông tin vải (mã, tên, chất liệu, màu sắc, giá)
7. Click **"Lưu"**

### **Cách 2: Từ trang Test**

1. Truy cập: http://localhost:4000/synology-test
2. Scroll xuống phần **"Upload Files"**
3. Click **"Chọn files để upload"**
4. Chọn ảnh từ máy tính
5. Click **"Upload to Synology Photos"**
6. Xem kết quả upload

---

## 🔧 Cấu Hình

### **Thông tin Server (đã cấu hình sẵn)**

```env
Server: 222.252.23.248
Port: 8888 (primary) / 6868 (alternative)
Username: haininh
Password: Villad24@
```

### **Storage Types**

| Type | Mô tả | Màu | Khuyến nghị |
|------|-------|-----|-------------|
| **Photos API** | Synology Photos API mới | Teal | ⭐ Khuyến nghị |
| Synology (Legacy) | API cũ | Green | Backup |
| File Station | File Station API | Purple | Alternative |
| SMB Share | SMB network share | Orange | Local network |
| Local | Local server storage | Blue | Fallback |

---

## 📁 Folder/Album Management

### **Upload vào thư mục gốc**

- Để trống field "Folder ID"
- Files sẽ được upload vào thư mục mặc định

### **Upload vào folder cụ thể**

1. Vào trang test: http://localhost:4000/synology-test
2. Click **"Browse Folders"**
3. Xem kết quả, tìm folder ID (ví dụ: `id: 123`)
4. Khi upload, nhập folder ID vào field "Folder ID"

---

## 🐛 Troubleshooting

### **Lỗi: "Không thể kết nối Synology Photos API"**

**Nguyên nhân:**
- Server Synology không khả dụng
- Sai thông tin đăng nhập
- Network issue

**Giải pháp:**
1. Kiểm tra server có online không:
   ```bash
   curl http://222.252.23.248:8888/photo/webapi/entry.cgi?api=SYNO.API.Info&version=1&method=query&query=all
   ```
2. Verify thông tin đăng nhập trong `.env.local`
3. Thử alternative port (6868)
4. Fallback về "Local" storage

### **Lỗi: "Upload failed"**

**Nguyên nhân:**
- File quá lớn
- Sai folder ID
- Session timeout

**Giải pháp:**
1. Kiểm tra file size (max 10MB mặc định)
2. Verify folder ID tồn tại
3. Refresh trang và thử lại
4. Check logs: `docker logs tva-fabric-library --tail 50`

### **Lỗi: "404 Not Found" khi gọi API**

**Nguyên nhân:**
- Next.js chưa nhận API route mới

**Giải pháp:**
```bash
docker-compose restart fabric-library
# Hoặc
docker-compose down && docker-compose up -d
```

---

## 📊 Monitoring

### **Xem logs**

```bash
# Real-time logs
docker logs tva-fabric-library -f

# Last 50 lines
docker logs tva-fabric-library --tail 50

# Search for errors
docker logs tva-fabric-library 2>&1 | grep -i error
```

### **Check connection status**

```bash
# Test authentication
curl -X POST "http://222.252.23.248:8888/photo/webapi/auth.cgi" \
  -d "api=SYNO.API.Auth&version=3&method=login&account=haininh&passwd=Villad24@"

# Test API endpoint
curl "http://localhost:4000/api/synology/photos?action=test"
```

---

## 🎯 Best Practices

### **1. Chọn Storage Type phù hợp**

- **Photos API** - Cho ảnh vải chính thức, cần quản lý albums
- **Local** - Cho testing, development
- **SMB Share** - Cho shared network access

### **2. Organize Files**

- Tạo folders theo bộ sưu tập
- Đặt tên file có ý nghĩa: `fabric-code-001.jpg`
- Sử dụng albums để group ảnh liên quan

### **3. Error Handling**

- Luôn check connection status trước khi upload
- Sử dụng fallback mechanism
- Monitor logs để catch issues sớm

### **4. Performance**

- Upload batch files (max 10 files/lần)
- Compress ảnh trước khi upload nếu cần
- Sử dụng cache cho folder/album list

---

## 📚 Tài Liệu Chi Tiết

- **[IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md)** - Báo cáo triển khai đầy đủ
- **[SYNOLOGY_PHOTOS_INTEGRATION.md](./SYNOLOGY_PHOTOS_INTEGRATION.md)** - Chi tiết kỹ thuật
- **[REMOTE_DATABASE_SETUP.md](./REMOTE_DATABASE_SETUP.md)** - Cấu hình database

---

## 🆘 Support

**Nếu gặp vấn đề:**

1. Check trang test: http://localhost:4000/synology-test
2. Xem logs: `docker logs tva-fabric-library --tail 50`
3. Verify cấu hình trong `.env.local`
4. Thử fallback về Local storage
5. Restart container: `docker-compose restart fabric-library`

---

## ✨ Features

✅ **Auto-detect working URL** - Tự động chọn port khả dụng (8888/6868)  
✅ **Session management** - Quản lý SID token tự động  
✅ **Batch upload** - Upload nhiều files cùng lúc  
✅ **Fallback mechanism** - Tự động chuyển sang Local nếu Synology fail  
✅ **Progress tracking** - Hiển thị tiến trình upload  
✅ **Error handling** - Xử lý lỗi chi tiết với messages rõ ràng  

---

**Happy uploading! 🎉**

