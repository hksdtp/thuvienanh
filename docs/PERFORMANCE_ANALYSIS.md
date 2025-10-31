# 🚀 PHÂN TÍCH HIỆU SUẤT - THƯ VIỆN ẢNH VẢI

## 📊 **TỔNG QUAN VẤN ĐỀ**

### **Vấn đề 1: Thời gian lưu ảnh và dữ liệu rất lâu**
- Upload ảnh vải mới hoặc cập nhật thông tin vải mất quá nhiều thời gian
- Cần phân tích: API endpoint, Database queries, Synology upload

### **Vấn đề 2: Thời gian phân tích/xử lý dữ liệu mất rất nhiều thời gian**
- Load danh sách vải hoặc xem chi tiết vải quá lâu
- Cần kiểm tra: Database queries, image loading, component rendering

---

## 🔍 **BOTTLENECKS ĐÃ PHÁT HIỆN**

### **1. DATABASE PERFORMANCE ISSUES** ❌ CRITICAL

#### **1.1. Thiếu Indexes**
**Vấn đề:**
- Bảng `fabrics` KHÔNG có indexes trên các cột thường xuyên query:
  - `material` - Dùng trong filter
  - `color` - Dùng trong filter
  - `pattern` - Dùng trong filter
  - `created_at` - Dùng để sort và filter "new fabrics"
  - `search_keywords` - Dùng trong full-text search
  - `tags` - Dùng trong filter (GIN index cho array)

**Impact:**
- Query `SELECT * FROM fabrics WHERE material = 'Cotton'` → **FULL TABLE SCAN**
- Query với `ILIKE '%search%'` → **FULL TABLE SCAN**
- Query với `created_at > '2025-09-26'` → **FULL TABLE SCAN**
- Với 1000+ fabrics → **500ms - 2s per query**

**Code hiện tại:**
```typescript
// lib/database.ts:200-209
if (filter?.search) {
  queryText += ` AND (
    name ILIKE $${paramIndex} OR
    code ILIKE $${paramIndex} OR
    description ILIKE $${paramIndex} OR
    search_keywords ILIKE $${paramIndex}
  )`
  queryParams.push(`%${filter.search}%`)
  paramIndex++
}
```

**Giải pháp:**
```sql
-- Indexes cần thiết
CREATE INDEX idx_fabrics_material ON fabrics(material);
CREATE INDEX idx_fabrics_color ON fabrics(color);
CREATE INDEX idx_fabrics_pattern ON fabrics(pattern);
CREATE INDEX idx_fabrics_created_at ON fabrics(created_at DESC);
CREATE INDEX idx_fabrics_is_active ON fabrics(is_active);

-- Full-text search index
CREATE INDEX idx_fabrics_search_keywords_gin ON fabrics USING GIN(to_tsvector('english', search_keywords));

-- Array index for tags
CREATE INDEX idx_fabrics_tags_gin ON fabrics USING GIN(tags);

-- Composite index for common queries
CREATE INDEX idx_fabrics_active_created ON fabrics(is_active, created_at DESC);
```

**Expected improvement:** 500ms → **10-50ms** (10-50x faster)

---

#### **1.2. N+1 Query Problem**
**Vấn đề:**
```typescript
// lib/database.ts:243-268
static async getById(id: string): Promise<Fabric | null> {
  // Query 1: Get fabric
  const fabricResult = await query(`SELECT ... FROM fabrics WHERE id = $1`, [id])
  
  // Query 2: Get images
  const imagesResult = await query(`SELECT ... FROM fabric_images WHERE fabric_id = $1`, [id])
  
  // Total: 2 queries per fabric
}
```

**Impact:**
- Load 20 fabrics → **40 queries** (20 fabrics + 20 images)
- Với network latency 10ms → **400ms overhead**

**Giải pháp:**
```typescript
// Use JOIN to get all data in 1 query
static async getAllWithImages(filter?: FabricFilter): Promise<Fabric[]> {
  const query = `
    SELECT 
      f.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', fi.id,
            'url', fi.url,
            'sort_order', fi.sort_order,
            'is_primary', fi.is_primary
          ) ORDER BY fi.sort_order
        ) FILTER (WHERE fi.id IS NOT NULL),
        '[]'
      ) as images
    FROM fabrics f
    LEFT JOIN fabric_images fi ON f.id = fi.fabric_id
    WHERE f.is_active = true
    GROUP BY f.id
  `
  // 1 query instead of N+1
}
```

**Expected improvement:** 40 queries → **1 query** (40x reduction)

---

### **2. SYNOLOGY UPLOAD PERFORMANCE ISSUES** ❌ CRITICAL

#### **2.1. Sequential Upload (Không song song)**
**Vấn đề:**
```typescript
// app/api/fabrics/route.ts:154-181
for (let i = 0; i < images.length; i++) {
  const image = images[i]
  const uploadResult = await fileStation.uploadFile(image, destinationPath)
  // Upload tuần tự - chờ từng file xong mới upload file tiếp theo
}
```

**Impact:**
- Upload 5 ảnh, mỗi ảnh 2MB, tốc độ 1MB/s
- Sequential: **5 × 2s = 10 seconds**
- Parallel (5 concurrent): **2 seconds** (5x faster)

**Giải pháp:**
```typescript
// Upload song song với Promise.all
const uploadPromises = images.map(async (image, i) => {
  try {
    const uploadResult = await fileStation.uploadFile(image, destinationPath)
    return { success: true, index: i, result: uploadResult }
  } catch (error) {
    return { success: false, index: i, error }
  }
})

const results = await Promise.all(uploadPromises)
```

**Expected improvement:** 10s → **2s** (5x faster)

---

#### **2.2. Không có Image Compression**
**Vấn đề:**
- Upload ảnh gốc không nén (5-10MB per image)
- Không có thumbnail generation
- Không có progressive loading

**Impact:**
- Upload 5 ảnh × 8MB = **40MB total**
- Với tốc độ 2MB/s → **20 seconds**

**Giải pháp:**
```typescript
import sharp from 'sharp'

async function compressImage(file: File): Promise<Buffer> {
  const buffer = Buffer.from(await file.arrayBuffer())
  
  // Compress to 80% quality, max 1920px width
  const compressed = await sharp(buffer)
    .resize(1920, null, { withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer()
  
  return compressed
}

// Generate thumbnail
async function generateThumbnail(file: File): Promise<Buffer> {
  const buffer = Buffer.from(await file.arrayBuffer())
  
  return await sharp(buffer)
    .resize(400, 400, { fit: 'cover' })
    .jpeg({ quality: 70 })
    .toBuffer()
}
```

**Expected improvement:**
- File size: 8MB → **800KB** (10x smaller)
- Upload time: 20s → **2s** (10x faster)

---

#### **2.3. Không có Upload Progress Tracking**
**Vấn đề:**
- User không biết upload đang ở đâu
- Không có retry mechanism khi upload fail
- Không có cancel functionality

**Giải pháp:**
```typescript
// Use XMLHttpRequest for progress tracking
function uploadWithProgress(
  file: File,
  onProgress: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100
        onProgress(percent)
      }
    })
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`))
      }
    })
    
    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}
```

---

### **3. API RESPONSE TIME ISSUES** ⚠️ MEDIUM

#### **3.1. Không có Response Caching**
**Vấn đề:**
```typescript
// app/api/fabrics/route.ts - Không có cache headers
export async function GET(request: NextRequest) {
  const fabrics = await FabricService.getAll(filter)
  return NextResponse.json({ success: true, data: fabrics })
  // Mỗi request đều query database
}
```

**Impact:**
- Mỗi page load → **Full database query**
- 10 users cùng lúc → **10 identical queries**

**Giải pháp:**
```typescript
import { unstable_cache } from 'next/cache'

// Cache fabric list for 60 seconds
const getCachedFabrics = unstable_cache(
  async (filter: FabricFilter) => {
    return await FabricService.getAll(filter)
  },
  ['fabrics-list'],
  { revalidate: 60, tags: ['fabrics'] }
)

export async function GET(request: NextRequest) {
  const fabrics = await getCachedFabrics(filter)
  
  return NextResponse.json(
    { success: true, data: fabrics },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    }
  )
}
```

**Expected improvement:** 200ms → **5ms** (40x faster for cached requests)

---

#### **3.2. Không có Pagination**
**Vấn đề:**
```typescript
// Load ALL fabrics at once
const fabrics = await FabricService.getAll(filter)
// Với 1000 fabrics → 5MB JSON response
```

**Impact:**
- Response size: **5MB**
- Parse time: **500ms**
- Memory usage: **High**

**Giải pháp:**
```typescript
interface PaginationParams {
  page?: number
  limit?: number
}

static async getAll(
  filter?: FabricFilter,
  pagination?: PaginationParams
): Promise<{ fabrics: Fabric[], total: number, page: number, totalPages: number }> {
  const page = pagination?.page || 1
  const limit = pagination?.limit || 20
  const offset = (page - 1) * limit
  
  // Get total count
  const countQuery = `SELECT COUNT(*) FROM fabrics WHERE is_active = true`
  const countResult = await query(countQuery)
  const total = parseInt(countResult.rows[0].count)
  
  // Get paginated results
  const dataQuery = `
    SELECT * FROM fabrics 
    WHERE is_active = true 
    ORDER BY created_at DESC 
    LIMIT $1 OFFSET $2
  `
  const dataResult = await query(dataQuery, [limit, offset])
  
  return {
    fabrics: dataResult.rows,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}
```

**Expected improvement:**
- Response size: 5MB → **200KB** (25x smaller)
- Parse time: 500ms → **20ms** (25x faster)

---

### **4. FRONTEND RENDERING ISSUES** ⚠️ MEDIUM

#### **4.1. Không có Memoization**
**Vấn đề:**
```typescript
// app/fabrics/new/page.tsx:30-56
useEffect(() => {
  const fetchData = async () => {
    // Re-fetch on every filter change
    const fabricsResponse = await fabricsApi.getAll(filters)
    setFabrics(fabricsResponse.data)
  }
  fetchData()
}, [filters]) // Re-run khi filters thay đổi
```

**Impact:**
- Mỗi filter change → **Full re-render**
- Render 100 FabricCard components → **200ms**

**Giải pháp:**
```typescript
import { useMemo, useCallback } from 'react'

// Memoize filtered fabrics
const filteredFabrics = useMemo(() => {
  return fabrics.filter(fabric => {
    // Client-side filtering for instant feedback
    if (searchTerm && !fabric.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    return true
  })
}, [fabrics, searchTerm])

// Memoize FabricCard to prevent unnecessary re-renders
const MemoizedFabricCard = memo(FabricCard)
```

---

#### **4.2. Không có Virtual Scrolling**
**Vấn đề:**
- Render ALL 1000 fabric cards cùng lúc
- Mỗi card có image → **1000 images loaded**

**Impact:**
- Initial render: **2-3 seconds**
- Memory usage: **High**
- Scroll performance: **Janky**

**Giải pháp:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function FabricsList({ fabrics }: { fabrics: Fabric[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: fabrics.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 350, // Estimated card height
    overscan: 5 // Render 5 extra items
  })
  
  return (
    <div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <FabricCard fabric={fabrics[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Expected improvement:**
- Render 1000 cards → **Render only 10-15 visible cards**
- Initial render: 3s → **300ms** (10x faster)

---

## 📈 **TỔNG KẾT PERFORMANCE GAINS**

| Bottleneck | Before | After | Improvement |
|------------|--------|-------|-------------|
| **Database Queries** | 500ms | 10-50ms | **10-50x** |
| **N+1 Queries** | 40 queries | 1 query | **40x** |
| **Image Upload** | 20s | 2s | **10x** |
| **API Response** | 200ms | 5ms (cached) | **40x** |
| **Response Size** | 5MB | 200KB | **25x** |
| **Frontend Render** | 3s | 300ms | **10x** |

**Overall Expected Improvement:** **5-50x faster** across the board

---

## 🎯 **KẾ HOẠCH THỰC THI**

### **Phase 1: Database Optimization** (Highest Impact)
1. ✅ Add indexes to fabrics table
2. ✅ Implement JOIN queries to eliminate N+1
3. ✅ Add query result caching

### **Phase 2: Upload Optimization** (High Impact)
1. ✅ Implement parallel uploads
2. ✅ Add image compression with Sharp
3. ✅ Add upload progress tracking
4. ✅ Generate thumbnails

### **Phase 3: API Optimization** (Medium Impact)
1. ✅ Add response caching
2. ✅ Implement pagination
3. ✅ Add cache headers

### **Phase 4: Frontend Optimization** (Medium Impact)
1. ✅ Add memoization
2. ✅ Implement virtual scrolling
3. ✅ Add lazy loading for images

---

## 📊 **MONITORING & BENCHMARKING**

### **Metrics to Track:**
- Database query time (before/after indexes)
- Upload time per image
- API response time
- Frontend render time
- Memory usage
- Network payload size

### **Tools:**
- PostgreSQL `EXPLAIN ANALYZE` for query performance
- Chrome DevTools Performance tab
- Lighthouse for overall performance score
- Custom timing logs in API routes

