# 📸 Tích hợp Synology Photos API

## 🎯 Tổng quan

Tài liệu này mô tả cách tích hợp Synology Photos API vào ứng dụng TVA Fabric Library để upload và quản lý ảnh vải trên Synology NAS.

---

## 🔧 Cấu hình

### **Thông tin Server Synology**

```env
# .env.local
SYNOLOGY_BASE_URL=http://222.252.23.248:8888
SYNOLOGY_ALTERNATIVE_URL=http://222.252.23.248:6868
SYNOLOGY_USERNAME=haininh
SYNOLOGY_PASSWORD=Villad24@
```

### **Các API Endpoints**

| API | Mô tả | Version |
|-----|-------|---------|
| `SYNO.API.Auth` | Xác thực người dùng | 3 |
| `SYNO.Foto.Browse.Folder` | Duyệt thư mục cá nhân | 1 |
| `SYNO.FotoTeam.Browse.Folder` | Duyệt thư mục chia sẻ | 1 |
| `SYNO.Foto.Browse.Album` | Duyệt albums | 1 |

---

## 📁 Cấu trúc Code

### **1. Service Layer (`lib/synology.ts`)**

#### **SynologyPhotosAPIService Class**

```typescript
class SynologyPhotosAPIService {
  private config: SynologyConfig
  private sessionId: string | null = null
  private workingUrl: string | null = null

  // Xác thực với Synology Photos API
  async authenticate(): Promise<boolean>

  // Duyệt thư mục cá nhân
  async browseFolders(offset?: number, limit?: number): Promise<SynologyPhotosFolder[]>

  // Duyệt thư mục chia sẻ
  async browseSharedFolders(offset?: number, limit?: number): Promise<SynologyPhotosFolder[]>

  // Duyệt albums
  async browseAlbums(offset?: number, limit?: number): Promise<SynologyPhotosAlbum[]>

  // Đăng xuất
  async logout(): Promise<void>
}
```

#### **Interfaces**

```typescript
interface SynologyPhotosFolder {
  id: number
  name: string
  owner_user_id: number
  parent: number
  passphrase: string
  shared: boolean
  sort_by: string
  sort_direction: string
  type: string
}

interface SynologyPhotosAlbum {
  id: number
  name: string
  item_count: number
  shared: boolean
  passphrase: string
  create_time: number
  start_time: number
  end_time: number
}
```

### **2. API Routes (`app/api/synology/photos/route.ts`)**

#### **GET - Test và Browse**

```typescript
// Test kết nối
GET /api/synology/photos?action=test

// Lấy danh sách thư mục cá nhân
GET /api/synology/photos?action=folders

// Lấy danh sách thư mục chia sẻ
GET /api/synology/photos?action=shared-folders

// Lấy danh sách albums
GET /api/synology/photos?action=albums
```

#### **POST - Upload**

```typescript
POST /api/synology/photos
Content-Type: multipart/form-data

Body:
- files: File[]
- albumPath: string (optional, default: 'fabric-library')
```

### **3. Test Page (`app/synology-test/page.tsx`)**

Trang test giao diện để kiểm tra các tính năng:
- ✅ Test kết nối
- 📁 Browse folders (cá nhân)
- 🔗 Browse shared folders
- 📸 Browse albums
- 🚀 Chạy tất cả tests

**Truy cập:** http://localhost:4000/synology-test

---

## 🔐 Authentication Flow

### **Bước 1: Xác thực**

```bash
curl -X POST "http://222.252.23.248:8888/photo/webapi/auth.cgi" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api=SYNO.API.Auth&version=3&method=login&account=haininh&passwd=Villad24@"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "did": "...",
    "sid": "EU_GYNhZkTrRFHQSL5SrVCxPpoVv8q6Ai0JC5WbN5wIZ4iL--0el6Rj1R5ovxIk__22sdfGXNnv6ZJVA3qkFBU"
  }
}
```

### **Bước 2: Sử dụng Session ID**

Tất cả các API calls tiếp theo phải include `_sid` parameter:

```bash
curl "http://222.252.23.248:8888/photo/webapi/entry.cgi?api=SYNO.Foto.Browse.Folder&version=1&method=list&offset=0&limit=10&_sid=<SESSION_ID>"
```

---

## 📊 API Examples

### **1. Browse Folders (Personal Space)**

```typescript
const folders = await synologyPhotosAPIService.browseFolders(0, 100)
console.log(folders)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "fabric-library",
        "owner_user_id": 1,
        "parent": 0,
        "shared": false,
        "type": "folder"
      }
    ]
  }
}
```

### **2. Browse Albums**

```typescript
const albums = await synologyPhotosAPIService.browseAlbums(0, 100)
console.log(albums)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "Vải Xuân Hè 2024",
        "item_count": 25,
        "shared": true,
        "create_time": 1704067200
      }
    ]
  }
}
```

---

## 🚀 Sử dụng trong Code

### **Trong Component**

```typescript
'use client'

import { useState } from 'react'

export default function UploadComponent() {
  const [folders, setFolders] = useState([])

  const loadFolders = async () => {
    const response = await fetch('/api/synology/photos?action=folders')
    const result = await response.json()
    
    if (result.success) {
      setFolders(result.data.folders)
    }
  }

  const uploadFiles = async (files: FileList) => {
    const formData = new FormData()
    
    Array.from(files).forEach(file => {
      formData.append('files', file)
    })
    formData.append('albumPath', 'fabric-library')

    const response = await fetch('/api/synology/photos', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    console.log(result)
  }

  return (
    <div>
      <button onClick={loadFolders}>Load Folders</button>
      <input type="file" multiple onChange={(e) => uploadFiles(e.target.files!)} />
    </div>
  )
}
```

---

## ⚠️ Error Codes

| Code | Mô tả | Giải pháp |
|------|-------|-----------|
| 119 | Session ID không hợp lệ | Xác thực lại |
| 400 | Thiếu tham số bắt buộc | Kiểm tra request parameters |
| 402 | Không có quyền truy cập | Kiểm tra permissions |
| 602 | Invalid parameter | Kiểm tra API version và parameters |

---

## 🔍 Debugging

### **Kiểm tra kết nối**

```bash
# Test API Info
curl "http://222.252.23.248:8888/photo/webapi/entry.cgi?api=SYNO.API.Info&version=1&method=query&query=all"

# Test Authentication
curl -X POST "http://222.252.23.248:8888/photo/webapi/auth.cgi" \
  -d "api=SYNO.API.Auth&version=3&method=login&account=haininh&passwd=Villad24@"
```

### **Xem logs trong Docker**

```bash
docker logs tva-fabric-library --tail 50 -f
```

---

## 📝 TODO

- [ ] Implement upload method trong SynologyPhotosAPIService
- [ ] Tạo UI component để chọn folder/album
- [ ] Thêm progress bar cho upload
- [ ] Implement thumbnail generation
- [ ] Thêm batch upload support
- [ ] Implement shared album access without login
- [ ] Tạo webhook để sync changes từ Synology
- [ ] Thêm caching cho folder/album list

---

## 🎉 Kết luận

Tích hợp Synology Photos API đã được thiết lập thành công với:

✅ **Authentication** - Xác thực với Synology Photos API  
✅ **Browse Folders** - Duyệt thư mục cá nhân và chia sẻ  
✅ **Browse Albums** - Lấy danh sách albums  
✅ **Test Page** - Giao diện test các tính năng  
✅ **API Routes** - Endpoints để frontend sử dụng  

**Tiếp theo:**
- Implement upload functionality
- Tích hợp vào FileUpload component
- Test với dữ liệu thực

---

**Tài liệu liên quan:**
- [SYNOLOGY_INTEGRATION_SUMMARY.md](./SYNOLOGY_INTEGRATION_SUMMARY.md) - Tích hợp File Station
- [REMOTE_DATABASE_SETUP.md](./REMOTE_DATABASE_SETUP.md) - Cấu hình database remote

