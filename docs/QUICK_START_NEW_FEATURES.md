# 🚀 HƯỚNG DẪN NHANH - FEATURES MỚI

## 📋 TỔNG QUAN

Ứng dụng đã được cập nhật với 2 features chính:
1. **Phụ kiện** - Quản lý phụ kiện rèm cửa
2. **Phong cách** - Thư viện phong cách thiết kế rèm

---

## 🗄️ DATABASE QUERIES THƯỜNG DÙNG

### **1. Phụ kiện (Accessories)**

#### Lấy danh sách phụ kiện theo danh mục:
```sql
-- Phụ kiện trang trí
SELECT a.*, ac.name as category_name
FROM accessories a
JOIN accessory_categories ac ON a.category_id = ac.id
WHERE ac.slug = 'phu-kien-trang-tri'
  AND a.is_active = true
ORDER BY a.created_at DESC;

-- Thanh lý (sản phẩm giảm giá)
SELECT a.*, ac.name as category_name
FROM accessories a
JOIN accessory_categories ac ON a.category_id = ac.id
WHERE ac.slug = 'thanh-ly'
  AND a.is_active = true
  AND a.is_on_sale = true
ORDER BY a.discount_percent DESC;
```

#### Tìm kiếm phụ kiện:
```sql
-- Tìm theo tên
SELECT * FROM accessories
WHERE name ILIKE '%dây buộc%'
  AND is_active = true;

-- Tìm theo tags
SELECT * FROM accessories
WHERE tags @> ARRAY['trang trí']
  AND is_active = true;

-- Tìm theo giá
SELECT * FROM accessories
WHERE price BETWEEN 50000 AND 200000
  AND is_active = true
ORDER BY price ASC;
```

#### Lấy phụ kiện với ảnh:
```sql
SELECT 
  a.*,
  json_agg(
    json_build_object(
      'id', ai.id,
      'url', ai.image_url,
      'thumbnail', ai.thumbnail_url,
      'order', ai.display_order
    ) ORDER BY ai.display_order
  ) as images
FROM accessories a
LEFT JOIN accessory_images ai ON a.id = ai.accessory_id
WHERE a.is_active = true
GROUP BY a.id
ORDER BY a.created_at DESC;
```

---

### **2. Phong cách (Styles)**

#### Lấy danh sách phong cách:
```sql
-- Tất cả phong cách
SELECT * FROM styles
WHERE is_active = true
ORDER BY popularity_score DESC, name;

-- Phong cách nổi bật
SELECT * FROM styles
WHERE is_featured = true
  AND is_active = true
ORDER BY popularity_score DESC;
```

#### Lấy phong cách theo danh mục:
```sql
SELECT s.*, sc.name as category_name
FROM styles s
JOIN style_category_mappings scm ON s.id = scm.style_id
JOIN style_categories sc ON scm.category_id = sc.id
WHERE sc.slug = 'co-dien'
  AND s.is_active = true
ORDER BY s.popularity_score DESC;
```

#### Lấy phong cách với ảnh:
```sql
SELECT 
  s.*,
  json_agg(
    json_build_object(
      'id', si.id,
      'url', si.image_url,
      'thumbnail', si.thumbnail_url,
      'type', si.image_type,
      'room_type', si.room_type,
      'order', si.display_order
    ) ORDER BY si.display_order
  ) as images
FROM styles s
LEFT JOIN style_images si ON s.id = si.style_id
WHERE s.is_active = true
GROUP BY s.id
ORDER BY s.popularity_score DESC;
```

#### Tìm phong cách phù hợp với phòng:
```sql
-- Phong cách cho phòng khách
SELECT * FROM styles
WHERE 'living_room' = ANY(suitable_rooms)
  AND is_active = true
ORDER BY popularity_score DESC;

-- Phong cách cho phòng ngủ
SELECT * FROM styles
WHERE 'bedroom' = ANY(suitable_rooms)
  AND is_active = true
ORDER BY popularity_score DESC;
```

---

### **3. Công trình (Projects) - CẬP NHẬT**

#### Lấy công trình theo phân loại:
```sql
-- Khách hàng lẻ
SELECT * FROM projects
WHERE project_category = 'retail_customer'
  AND is_active = true
ORDER BY created_at DESC;

-- Dự án lớn
SELECT * FROM projects
WHERE project_category = 'project'
  AND is_active = true
ORDER BY created_at DESC;

-- Công trình tiêu biểu (cho sale)
SELECT * FROM projects
WHERE project_category = 'featured'
  AND is_featured = true
  AND quality_rating >= 4
  AND is_active = true
ORDER BY quality_rating DESC, created_at DESC;
```

#### Sử dụng function có sẵn:
```sql
-- Lấy công trình theo category
SELECT * FROM get_projects_by_category('featured');
SELECT * FROM get_projects_by_category('retail_customer');
SELECT * FROM get_projects_by_category('project');
```

#### Đánh dấu công trình tiêu biểu:
```sql
-- Đánh dấu 1 công trình là tiêu biểu với rating 5
SELECT mark_project_as_featured('project-uuid-here', 5);

-- Hoặc dùng UPDATE trực tiếp
UPDATE projects
SET 
  is_featured = true,
  project_category = 'featured',
  quality_rating = 5,
  source_type = 'sales_showcase'
WHERE id = 'project-uuid-here';
```

---

## 🔧 API ENDPOINTS (Gợi ý)

### **Accessories API**

```typescript
// GET /api/accessories
// Query params: category, search, minPrice, maxPrice, tags, page, limit
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  
  let query = `
    SELECT a.*, ac.name as category_name
    FROM accessories a
    JOIN accessory_categories ac ON a.category_id = ac.id
    WHERE a.is_active = true
  `
  
  if (category) {
    query += ` AND ac.slug = '${category}'`
  }
  
  if (search) {
    query += ` AND a.name ILIKE '%${search}%'`
  }
  
  query += ` ORDER BY a.created_at DESC`
  
  const result = await db.query(query)
  return Response.json(result.rows)
}

// GET /api/accessories/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const query = `
    SELECT 
      a.*,
      ac.name as category_name,
      json_agg(
        json_build_object(
          'id', ai.id,
          'url', ai.image_url,
          'thumbnail', ai.thumbnail_url
        ) ORDER BY ai.display_order
      ) as images
    FROM accessories a
    JOIN accessory_categories ac ON a.category_id = ac.id
    LEFT JOIN accessory_images ai ON a.id = ai.accessory_id
    WHERE a.id = $1 AND a.is_active = true
    GROUP BY a.id, ac.name
  `
  
  const result = await db.query(query, [params.id])
  return Response.json(result.rows[0])
}
```

### **Styles API**

```typescript
// GET /api/styles
// Query params: category, featured, search, page, limit
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  
  let query = `
    SELECT s.*
    FROM styles s
    WHERE s.is_active = true
  `
  
  if (featured === 'true') {
    query += ` AND s.is_featured = true`
  }
  
  if (category) {
    query += `
      AND s.id IN (
        SELECT scm.style_id 
        FROM style_category_mappings scm
        JOIN style_categories sc ON scm.category_id = sc.id
        WHERE sc.slug = '${category}'
      )
    `
  }
  
  query += ` ORDER BY s.popularity_score DESC, s.name`
  
  const result = await db.query(query)
  return Response.json(result.rows)
}

// GET /api/styles/[slug]
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const query = `
    SELECT 
      s.*,
      json_agg(
        DISTINCT jsonb_build_object(
          'id', sc.id,
          'name', sc.name,
          'slug', sc.slug
        )
      ) FILTER (WHERE sc.id IS NOT NULL) as categories,
      (
        SELECT json_agg(
          json_build_object(
            'id', si.id,
            'url', si.image_url,
            'thumbnail', si.thumbnail_url,
            'type', si.image_type,
            'room_type', si.room_type
          ) ORDER BY si.display_order
        )
        FROM style_images si
        WHERE si.style_id = s.id AND si.is_active = true
      ) as images
    FROM styles s
    LEFT JOIN style_category_mappings scm ON s.id = scm.style_id
    LEFT JOIN style_categories sc ON scm.category_id = sc.id
    WHERE s.slug = $1 AND s.is_active = true
    GROUP BY s.id
  `
  
  const result = await db.query(query, [params.slug])
  
  // Tăng view count
  await db.query(
    'UPDATE styles SET view_count = view_count + 1 WHERE slug = $1',
    [params.slug]
  )
  
  return Response.json(result.rows[0])
}
```

### **Projects API - CẬP NHẬT**

```typescript
// GET /api/projects
// Query params: category, type, featured, page, limit
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') // retail_customer, project, featured
  
  let query = `
    SELECT * FROM projects
    WHERE is_active = true
  `
  
  if (category) {
    query += ` AND project_category = '${category}'`
  }
  
  query += `
    ORDER BY 
      CASE WHEN is_featured THEN 0 ELSE 1 END,
      quality_rating DESC NULLS LAST,
      created_at DESC
  `
  
  const result = await db.query(query)
  return Response.json(result.rows)
}

// PUT /api/projects/[id]/feature
// Mark project as featured
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { quality_rating = 5 } = await request.json()
  
  const query = `
    SELECT mark_project_as_featured($1, $2)
  `
  
  await db.query(query, [params.id, quality_rating])
  
  return Response.json({ success: true })
}
```

---

## 📱 REACT COMPONENTS (Gợi ý)

### **AccessoryCard.tsx**
```tsx
interface AccessoryCardProps {
  accessory: {
    id: string
    name: string
    price: number
    sale_price?: number
    cover_image_url: string
    is_on_sale: boolean
  }
}

export function AccessoryCard({ accessory }: AccessoryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <img 
        src={accessory.cover_image_url} 
        alt={accessory.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold">{accessory.name}</h3>
        <div className="mt-2 flex items-center gap-2">
          {accessory.is_on_sale && accessory.sale_price ? (
            <>
              <span className="text-red-600 font-bold">
                {accessory.sale_price.toLocaleString()}đ
              </span>
              <span className="text-gray-400 line-through text-sm">
                {accessory.price.toLocaleString()}đ
              </span>
            </>
          ) : (
            <span className="font-bold">
              {accessory.price.toLocaleString()}đ
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

### **StyleCard.tsx**
```tsx
interface StyleCardProps {
  style: {
    id: string
    name: string
    slug: string
    description: string
    cover_image_url: string
    is_featured: boolean
  }
}

export function StyleCard({ style }: StyleCardProps) {
  return (
    <Link href={`/styles/${style.slug}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
        <div className="relative">
          <img 
            src={style.cover_image_url} 
            alt={style.name}
            className="w-full h-64 object-cover"
          />
          {style.is_featured && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded text-sm font-semibold">
              Nổi bật
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg">{style.name}</h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {style.description}
          </p>
        </div>
      </div>
    </Link>
  )
}
```

---

## 🎯 NEXT STEPS

1. **Tạo pages:**
   - `/app/accessories/page.tsx`
   - `/app/accessories/[id]/page.tsx`
   - `/app/styles/page.tsx`
   - `/app/styles/[slug]/page.tsx`

2. **Tạo API routes:**
   - `/app/api/accessories/route.ts`
   - `/app/api/accessories/[id]/route.ts`
   - `/app/api/styles/route.ts`
   - `/app/api/styles/[slug]/route.ts`

3. **Cập nhật pages hiện có:**
   - `/app/projects/page.tsx` - Thêm filter theo category

4. **Upload ảnh:**
   - Tích hợp với Synology NAS hoặc cloud storage
   - Tạo API upload cho accessories và styles

---

**Tài liệu chi tiết:** `docs/MENU_RESTRUCTURE_SUMMARY.md`

