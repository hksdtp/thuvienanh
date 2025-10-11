# HỆ THỐNG UPLOAD ẢNH TOÀN DIỆN

## 📋 Tổng quan
Đã xây dựng hệ thống upload ảnh thống nhất cho toàn bộ danh mục của dự án với cấu trúc folder chuẩn trên Synology.

## 🏗️ Cấu trúc folder Synology

```
/Marketing/Ninh/thuvienanh/
├── fabrics/                  # Vải
│   ├── general/              # Chung
│   ├── moq/                  # MOQ
│   ├── new/                  # Mới
│   ├── clearance/            # Thanh lý
│   └── demo/                 # Demo
├── collections/              # Bộ sưu tập
│   └── all/
├── projects/                 # Công trình
│   ├── general/
│   ├── residential/          # Nhà ở
│   ├── commercial/           # Thương mại
│   └── office/               # Văn phòng
├── events/                   # Sự kiện
│   ├── general/
│   ├── internal/             # Nội bộ
│   ├── external/             # Bên ngoài
│   └── training/             # Đào tạo
├── styles/                   # Phong cách
│   ├── general/
│   ├── modern/               # Hiện đại
│   ├── classic/              # Cổ điển
│   └── minimalist/           # Tối giản
├── accessories/              # Phụ kiện
│   ├── general/
│   ├── decorative/           # Trang trí
│   ├── rods/                 # Thanh treo
│   └── clearance/            # Thanh lý
└── albums/                   # Albums
    ├── general/
    ├── fabrics/
    ├── events/
    └── accessories/
```

## 🎯 API Endpoints

### 1. Universal Upload Endpoint
```
POST /api/upload/filestation
```

**Request (FormData):**
- `entityType`: fabric | collection | project | event | style | accessory | album
- `entityId`: UUID của entity
- `entityName`: Tên entity
- `subcategory`: (optional) Danh mục con
- `files`: File[] - Danh sách files upload

**Response:**
```json
{
  "success": true,
  "data": {
    "uploaded": 3,
    "files": [
      {
        "name": "image1.jpg",
        "url": "http://localhost:4000/api/synology/file-proxy?path=...",
        "path": "/Marketing/Ninh/thuvienanh/fabrics/general/vai-lua_uuid/image1.jpg"
      }
    ]
  }
}
```

### 2. Album-specific Upload (existing)
```
POST /api/albums/upload-filestation
```
Dành riêng cho albums với logic đặc biệt.

## 📊 Database Tables

Đã tạo bảng images cho tất cả entities:

1. **album_images** - Ảnh albums ✅
2. **fabric_images** - Ảnh vải ✅
3. **collection_images** - Ảnh bộ sưu tập ✅
4. **project_images** - Ảnh công trình ✅
5. **event_images** - Ảnh sự kiện ✅
6. **style_images** - Ảnh phong cách ✅
7. **accessory_images** - Ảnh phụ kiện ✅

**Cấu trúc bảng chuẩn:**
```sql
- id (UUID)
- {entity}_id (UUID) - Foreign key
- image_url (TEXT)
- image_id (VARCHAR)
- caption (TEXT)
- display_order (INTEGER)
- added_at (TIMESTAMP)
- added_by (VARCHAR)
```

## 🧩 Components

### UniversalUploadModal
Component React để upload ảnh cho mọi entity type.

**Props:**
```typescript
{
  isOpen: boolean
  onClose: () => void
  entityType: EntityType
  entityId: string
  entityName: string
  subcategory?: string
  maxFiles?: number
  acceptedFormats?: string[]
  onUploadSuccess?: (urls: string[]) => void
}
```

**Sử dụng:**
```jsx
<UniversalUploadModal
  isOpen={uploadModalOpen}
  onClose={() => setUploadModalOpen(false)}
  entityType="fabric"
  entityId={fabricId}
  entityName={fabricName}
  subcategory="moq"
  onUploadSuccess={handleUploadSuccess}
/>
```

## 🚀 Hướng dẫn tích hợp

### 1. Cho trang Fabrics:
```jsx
import UniversalUploadModal from '@/components/UniversalUploadModal'

// Trong component
const [uploadModalOpen, setUploadModalOpen] = useState(false)

// Button upload
<button onClick={() => setUploadModalOpen(true)}>
  Upload ảnh
</button>

// Modal
<UniversalUploadModal
  isOpen={uploadModalOpen}
  onClose={() => setUploadModalOpen(false)}
  entityType="fabric"
  entityId={fabric.id}
  entityName={fabric.name}
  subcategory={fabric.category} // moq, new, clearance
/>
```

### 2. Cho Collections, Projects, Events, Styles, Accessories:
Tương tự như trên, chỉ thay đổi `entityType` và `subcategory` phù hợp.

## ✅ Tính năng đã hoàn thành

1. **Cấu trúc folder chuẩn**: Mọi entity đều có folder riêng với format `{entity-name}_{entity-id}`
2. **Upload đa file**: Hỗ trợ upload nhiều file cùng lúc
3. **Database integration**: Tự động lưu thông tin ảnh vào bảng tương ứng
4. **Synology FileStation**: Upload trực tiếp lên NAS
5. **Image proxy**: Serve ảnh qua proxy endpoint
6. **Error handling**: Xử lý lỗi chi tiết
7. **Progress tracking**: Hiển thị trạng thái upload

## 🔧 Cấu hình môi trường

Đảm bảo các biến sau trong `.env`:
```env
SYNOLOGY_BASE_URL=http://222.252.23.248:8888
SYNOLOGY_USERNAME=haininh
SYNOLOGY_PASSWORD=Villad24@
ENABLE_SYNOLOGY_FOLDER_CREATION=true
```

## 📝 Lưu ý quan trọng

1. **Naming convention**: Folder name format: `{lowercase-name}_{uuid}`
2. **Subcategories**: Mỗi entity type có subcategories riêng
3. **Permissions**: User phải có quyền write tại `/Marketing/Ninh/thuvienanh`
4. **File types**: Chỉ chấp nhận JPEG, PNG, WebP
5. **File size**: Tối đa 10MB/file
6. **Batch limit**: Tối đa 10 files/lần upload

## 🐛 Troubleshooting

### Lỗi authentication Synology:
- Kiểm tra credentials trong `.env`
- Đảm bảo user có quyền FileStation

### Folder không tạo được:
- Kiểm tra quyền write tại parent folder
- Verify path không chứa ký tự đặc biệt

### Upload fail:
- Check file size < 10MB
- Verify file type được hỗ trợ
- Kiểm tra network connection đến NAS

## 🚦 Next Steps

1. **Thêm image optimization**: Resize/compress trước khi upload
2. **Thumbnail generation**: Tạo thumbnails tự động
3. **Bulk operations**: Xóa/di chuyển nhiều ảnh
4. **CDN integration**: Cache ảnh qua CDN
5. **Access control**: Phân quyền xem/upload theo user role
