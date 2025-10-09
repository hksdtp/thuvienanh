# 🔧 ALBUM CATEGORY_PATH FIX REPORT

**Ngày:** 2025-10-09  
**Status:** ✅ **COMPLETED - Database & API Fixed**

---

## 📊 VẤN ĐỀ PHÁT HIỆN

### **User Report:**
> "Tôi vừa thực hiện test tạo album mới từ menu 'Thư viện Vải' nhưng gặp các vấn đề sau:
> 1. Album không xuất hiện trong menu sau khi tạo
> 2. Database: Cần kiểm tra xem album có được lưu vào database không?
> 3. Synology Storage: Không thấy folder mới được tạo trên Synology NAS"

### **Root Cause Analysis:**

1. ✅ **Albums được lưu vào database** - Đã verify có 3 albums
2. ❌ **Column `category_path` chưa tồn tại** - Cần thêm vào schema
3. ❌ **Synology folder creation bị disabled** - `ENABLE_SYNOLOGY_FOLDER_CREATION=false`
4. ❌ **API không support hierarchical structure** - Chỉ dùng `category`, không có `category_path`

---

## ✅ FIXES IMPLEMENTED

### **1. Database Schema Update**

#### **Added `category_path` Column:**
```sql
ALTER TABLE albums 
ADD COLUMN IF NOT EXISTS category_path VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_albums_category_path 
ON albums(category_path);
```

#### **Updated Existing Albums:**
```sql
UPDATE albums 
SET category_path = CASE 
  WHEN category = 'fabric' THEN 'fabrics/general'
  WHEN category = 'event' THEN 'events'
  ELSE category
END
WHERE category_path IS NULL;
```

**Result:**
```
✅ Column category_path added successfully
✅ Index idx_albums_category_path created
✅ Updated existing albums with category_path

📋 Updated albums:
   1. 1
      category: fabric
      category_path: fabrics/general
   2. Test Album 1760022884378
      category: fabric
      category_path: fabrics/general
   3. 1
      category: fabric
      category_path: fabrics/general
```

---

### **2. TypeScript Types Update**

#### **Album Interface:**
```typescript
export interface Album {
  id: string
  name: string
  description?: string
  cover_image_url?: string
  cover_image_id?: string
  image_count: number
  created_at: Date
  updated_at: Date
  created_by: string
  is_active: boolean
  tags?: string[]
  category?: 'fabric' | 'accessory' | 'event' | 'collection' | 'project' | 'season' | 'client' | 'other'
  category_path?: string // ✅ NEW - Hierarchical path
}
```

#### **CreateAlbumForm Interface:**
```typescript
export interface CreateAlbumForm {
  name: string
  description?: string
  category?: Album['category']
  category_path?: string // ✅ NEW - Optional: will be auto-generated
  subcategory?: string // ✅ NEW - For subcategories like 'moq', 'new', 'clearance'
  tags?: string[]
}
```

---

### **3. AlbumService.create() Update**

#### **Auto-generate category_path Logic:**
```typescript
static async create(data: CreateAlbumForm): Promise<Album> {
  try {
    // Auto-generate category_path if not provided
    let categoryPath = data.category_path
    
    if (!categoryPath) {
      const category = data.category || 'other'
      const subcategory = data.subcategory
      
      // Generate hierarchical path based on category and subcategory
      if (category === 'fabric') {
        if (subcategory) {
          // fabrics/moq, fabrics/new, fabrics/clearance
          categoryPath = `fabrics/${subcategory}`
        } else {
          // fabrics/general (default for fabric category)
          categoryPath = 'fabrics/general'
        }
      } else if (category === 'event') {
        categoryPath = 'events'
      } else if (category === 'collection') {
        categoryPath = 'collections'
      } else {
        categoryPath = category
      }
    }
    
    console.log(`📁 Creating album with category_path: ${categoryPath}`)
    
    const result = await query<Album>(
      `INSERT INTO albums (name, description, category, category_path, tags, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, cover_image_url, cover_image_id,
                 created_at, updated_at, created_by, is_active,
                 tags, category, category_path`,
      [
        data.name,
        data.description || null,
        data.category || 'other',
        categoryPath,
        data.tags || [],
        true
      ]
    )

    const album = result.rows[0]
    console.log('✅ Album created in database:', album.id, 'category_path:', album.category_path)

    return {
      ...album,
      created_at: new Date(album.created_at),
      updated_at: new Date(album.updated_at)
    }
  } catch (error) {
    console.error('❌ AlbumService.create error:', error)
    throw error
  }
}
```

---

### **4. API Update - /api/albums/route.ts**

#### **Support subcategory Parameter:**
```typescript
const albumData: CreateAlbumForm = {
  name: body.name.trim(),
  description: body.description?.trim() || undefined,
  category: body.category || 'other',
  subcategory: body.subcategory, // ✅ NEW - Support subcategories
  category_path: body.category_path, // ✅ NEW - Optional
  tags: body.tags || []
}

const newAlbum = await AlbumService.create(albumData)
```

#### **Use category_path for Synology Folder:**
```typescript
if (ENABLE_SYNOLOGY_FOLDER_CREATION) {
  const categoryPath = newAlbum.category_path || newAlbum.category || 'other'
  const folderName = createFolderName(newAlbum.name, newAlbum.id)
  const folderPath = `/Marketing/Ninh/thuvienanh/${categoryPath}/${folderName}`
  console.log(`📁 Creating Synology folder for new album: ${folderPath}`)
  console.log(`   Category Path: "${categoryPath}", Album: "${newAlbum.name}" => Folder: "${folderName}"`)

  try {
    const folderCreated = await synologyService.fileStation.createFolder(folderPath)
    if (folderCreated) {
      console.log(`✅ Synology folder created: ${folderPath}`)
    } else {
      console.warn(`⚠️ Failed to create Synology folder for album: ${newAlbum.id}`)
    }
  } catch (error) {
    console.error('❌ Error creating Synology folder:', error)
  }
}
```

---

### **5. Enable Synology Folder Creation**

#### **.env Update:**
```env
# Synology NAS Configuration (ENABLED)
SYNOLOGY_BASE_URL=http://222.252.23.248:8888
SYNOLOGY_ALTERNATIVE_URL=http://222.252.23.248:6868
SYNOLOGY_PHOTOS_URL=http://222.252.23.248:6868
SYNOLOGY_USERNAME=haininh
SYNOLOGY_PASSWORD=Villad24@
SYNOLOGY_SHARED_FOLDER=/Marketing/Ninh/thuvienanh
ENABLE_SYNOLOGY_FOLDER_CREATION=true  # ✅ ENABLED
```

---

## 📁 HIERARCHICAL STORAGE STRUCTURE

### **Synology NAS Structure:**
```
/Marketing/Ninh/thuvienanh/
├── fabrics/
│   ├── moq/                    ← Vải Order theo MOQ
│   │   ├── album-name_uuid/
│   │   └── ...
│   ├── new/                    ← Vải Mới
│   │   ├── album-name_uuid/
│   │   └── ...
│   ├── clearance/              ← Vải Thanh Lý
│   │   ├── album-name_uuid/
│   │   └── ...
│   └── general/                ← Vải chung
│       ├── album-name_uuid/
│       └── ...
├── collections/                ← Bộ Sưu Tập
│   ├── album-name_uuid/
│   └── ...
└── events/                     ← Sự kiện
    ├── album-name_uuid/
    └── ...
```

### **Category Path Mapping:**
| Category | Subcategory | category_path | Synology Path |
|----------|-------------|---------------|---------------|
| fabric | moq | `fabrics/moq` | `/Marketing/Ninh/thuvienanh/fabrics/moq/` |
| fabric | new | `fabrics/new` | `/Marketing/Ninh/thuvienanh/fabrics/new/` |
| fabric | clearance | `fabrics/clearance` | `/Marketing/Ninh/thuvienanh/fabrics/clearance/` |
| fabric | (none) | `fabrics/general` | `/Marketing/Ninh/thuvienanh/fabrics/general/` |
| event | - | `events` | `/Marketing/Ninh/thuvienanh/events/` |
| collection | - | `collections` | `/Marketing/Ninh/thuvienanh/collections/` |

---

## 🔄 NEXT STEPS (TODO)

### **High Priority:**

1. **Update Pages to Pass Subcategory** ⚠️
   - `/fabrics/moq` → pass `subcategory: 'moq'`
   - `/fabrics/new` → pass `subcategory: 'new'`
   - `/fabrics/clearance` → pass `subcategory: 'clearance'`

2. **Test Album Creation** 🧪
   - Create album from each category page
   - Verify `category_path` in database
   - Verify folder created on Synology
   - Verify album appears in correct menu

3. **Update Upload Logic** 📤
   - Use `category_path` for upload destination
   - Ensure images go to correct folder

### **Medium Priority:**

4. **Add Category Path to Album List API** 📋
   - Return `category_path` in GET /api/albums
   - Filter by `category_path` if needed

5. **Update Album Detail Page** 📄
   - Show `category_path` in album info
   - Allow editing `category_path`

---

## ✅ COMPLETION STATUS

### **Completed:**
- ✅ Database schema updated (category_path column added)
- ✅ TypeScript types updated
- ✅ AlbumService.create() updated with auto-generation logic
- ✅ API updated to support subcategory
- ✅ Synology folder creation enabled
- ✅ Hierarchical storage structure defined

### **Pending:**
- ⏸️ Update pages to pass subcategory parameter
- ⏸️ Test album creation from each category
- ⏸️ Verify Synology folder creation
- ⏸️ Update upload logic to use category_path

---

**Prepared by:** AI Assistant  
**Date:** 2025-10-09  
**Status:** ✅ **DATABASE & API FIXED - READY FOR PAGE UPDATES**

