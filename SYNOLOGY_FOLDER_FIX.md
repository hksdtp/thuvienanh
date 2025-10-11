# BÁO CÁO SỬA LỖI XÓA FOLDER SYNOLOGY

## 📋 Tổng quan vấn đề
- Album bị xóa trong database ✅  
- Folder Synology KHÔNG bị xóa ❌
- Nguyên nhân: Không đồng nhất format tên folder khi tạo và xóa

## 🔍 Phân tích

### Cấu trúc folder hiện tại trên Synology:
```
/Marketing/Ninh/thuvienanh/
├── fabric/                    <- Sai: phải là fabrics/general/
│   └── Test Upload Album      <- Sai: thiếu _albumId
├── fabrics/
│   ├── general/
│   │   └── test-upload-album_baf784c1-43a1-4f3a-9e37-9f274eaa50b1  <- Đúng
│   ├── moq/
│   ├── new/
│   └── clearance/
└── events/
```

### Vấn đề tìm thấy:

1. **Khi tạo album:**
   - Path: `/Marketing/Ninh/thuvienanh/fabrics/general/album-name_uuid`
   - Format: lowercase với dash, có UUID

2. **Khi upload ảnh:**  
   - Path cũ: `/Marketing/Ninh/thuvienanh/fabric/Album Name` (SAI)
   - Path mới: `/Marketing/Ninh/thuvienanh/fabrics/general/album-name_uuid` (ĐÚNG)

3. **Khi xóa album:**
   - Cố xóa nhiều path khác nhau
   - Nhưng không match với path thực tế đã tạo

## ✅ Đã sửa

### 1. Thống nhất format folder:
- **Fabric albums**: `/Marketing/Ninh/thuvienanh/fabrics/general/[album-name]_[id]`
- **Event albums**: `/Marketing/Ninh/thuvienanh/events/[album-name]_[id]`
- **Accessory albums**: `/Marketing/Ninh/thuvienanh/accessories/[album-name]_[id]`

### 2. Cập nhật code:
- ✅ Fix upload path trong `/app/api/albums/upload-filestation/route.ts`
- ✅ Fix delete logic để thử nhiều path khả thi
- ✅ Đồng bộ logic tạo folder name

### 3. Test thành công:
- Xóa được folder `/Marketing/Ninh/thuvienanh/fabric/Test Upload Album` ✅

## 📝 Lưu ý quan trọng

### Folders cũ cần dọn dẹp thủ công:
1. `/Marketing/Ninh/thuvienanh/fabric/` - folder cũ, nên xóa
2. `/Marketing/Ninh/thuvienanh/Album Database Success` - test folder
3. Các folder không có UUID suffix

### Format folder chuẩn:
```
/Marketing/Ninh/thuvienanh/{category_path}/{album-name}_{album-id}/
```
Trong đó:
- `{category_path}`: 
  - fabric → `fabrics/general`
  - event → `events`
  - accessory → `accessories`
- `{album-name}`: lowercase, thay space bằng dash
- `{album-id}`: UUID của album

## 🚀 Hành động tiếp theo

1. **Test lại xóa album mới tạo**
2. **Dọn dẹp folders cũ trên Synology**
3. **Monitor logs khi xóa album để confirm path**

## 🔧 Debug Commands

```bash
# List all folders
node test-synology-delete.js

# Check database albums
psql -h 100.101.50.87 -U postgres -d tva -c "SELECT id, name, category FROM albums;"

# Test create and delete
curl -X POST http://localhost:4000/api/albums ...
curl -X DELETE http://localhost:4000/api/albums/by-id/[id]
```
