# 🗺️ CẤU TRÚC ROUTES - TVA FABRIC

## 📋 TỔNG QUAN

Ứng dụng sử dụng **Phương án 1: Nested Routes** để tổ chức các trang theo danh mục.

---

## 🌐 ROUTES MAPPING

### **1. Trang chính**
```
/ ...................... Trang chủ (Dashboard)
/search ................ Tìm kiếm
```

### **2. Thư viện Vải**
```
/fabrics ............... Danh sách vải mẫu
/fabrics/[id] .......... Chi tiết vải
/collections ........... Danh sách bộ sưu tập
/collections/[id] ...... Chi tiết bộ sưu tập
/albums?category=fabric  Albums ảnh vải
```

### **3. Phụ kiện** ✨ (MỚI)
```
/accessories/phu-kien-trang-tri ... Phụ kiện trang trí
/accessories/thanh-phu-kien ....... Thanh phụ kiện
/accessories/thanh-ly ............. Thanh lý
/accessories/album ................ Album phụ kiện
```

**Database mapping:**
- Route: `/accessories/[category]`
- Category slug → Database: `accessory_categories.slug`
- Valid slugs: `phu-kien-trang-tri`, `thanh-phu-kien`, `thanh-ly`, `album`

### **4. Thư viện Công Trình** 🔄 (CẬP NHẬT)
```
/projects .......................... Tất cả công trình (trang cũ)
/projects/khach-hang-le ............ Khách hàng lẻ
/projects/du-an .................... Dự án
/projects/cong-trinh-tieu-bieu ..... Công trình tiêu biểu
/projects/[id] ..................... Chi tiết công trình
```

**Database mapping:**
- Route: `/projects/[category]`
- Category slug → Database: `projects.project_category`
- Mapping:
  - `khach-hang-le` → `retail_customer`
  - `du-an` → `project`
  - `cong-trinh-tieu-bieu` → `featured`

### **5. Phong cách** ✨ (MỚI)
```
/styles ................ Danh sách phong cách
/styles/[slug] ......... Chi tiết phong cách (TODO)
```

**Database mapping:**
- Route: `/styles`
- Detail route: `/styles/[slug]` (e.g., `/styles/co-dien-chau-au`)
- Database: `styles.slug`

### **6. Sự kiện**
```
/events ................ Danh sách sự kiện
/events/[id] ........... Chi tiết sự kiện
/albums?category=event . Albums ảnh sự kiện
```

---

## 📁 FILE STRUCTURE

```
app/
├── page.tsx ........................... Trang chủ
├── search/
│   └── page.tsx ....................... Tìm kiếm
│
├── fabrics/
│   ├── page.tsx ....................... Danh sách vải
│   └── [id]/
│       └── page.tsx ................... Chi tiết vải
│
├── collections/
│   ├── page.tsx ....................... Danh sách bộ sưu tập
│   └── [id]/
│       └── page.tsx ................... Chi tiết bộ sưu tập
│
├── accessories/ ✨ MỚI
│   └── [category]/
│       └── page.tsx ................... Dynamic route cho categories
│                                        (phu-kien-trang-tri, thanh-phu-kien, thanh-ly, album)
│
├── projects/
│   ├── page.tsx ....................... Tất cả công trình (trang cũ)
│   ├── [category]/ 🔄 MỚI
│   │   └── page.tsx ................... Dynamic route cho categories
│   │                                    (khach-hang-le, du-an, cong-trinh-tieu-bieu)
│   └── [id]/
│       └── page.tsx ................... Chi tiết công trình
│
├── styles/ ✨ MỚI
│   └── page.tsx ....................... Danh sách phong cách
│   └── [slug]/ (TODO)
│       └── page.tsx ................... Chi tiết phong cách
│
├── events/
│   ├── page.tsx ....................... Danh sách sự kiện
│   └── [id]/
│       └── page.tsx ................... Chi tiết sự kiện
│
└── albums/
    ├── page.tsx ....................... Danh sách albums
    └── [id]/
        └── page.tsx ................... Chi tiết album
```

---

## 🔧 DYNAMIC ROUTES IMPLEMENTATION

### **Accessories Dynamic Route**

**File:** `app/accessories/[category]/page.tsx`

```typescript
const VALID_CATEGORIES = {
  'phu-kien-trang-tri': {
    name: 'Phụ kiện trang trí',
    description: '...',
    slug: 'phu-kien-trang-tri'
  },
  'thanh-phu-kien': { ... },
  'thanh-ly': { ... },
  'album': { ... }
}

// Generate static params
export async function generateStaticParams() {
  return Object.keys(VALID_CATEGORIES).map((category) => ({
    category,
  }))
}
```

### **Projects Dynamic Route**

**File:** `app/projects/[category]/page.tsx`

```typescript
const VALID_CATEGORIES = {
  'khach-hang-le': {
    name: 'Khách hàng lẻ',
    dbValue: 'retail_customer',
    icon: '👥'
  },
  'du-an': {
    name: 'Dự án',
    dbValue: 'project',
    icon: '🏢'
  },
  'cong-trinh-tieu-bieu': {
    name: 'Công trình tiêu biểu',
    dbValue: 'featured',
    icon: '⭐'
  }
}

// Generate static params
export async function generateStaticParams() {
  return Object.keys(VALID_CATEGORIES).map((category) => ({
    category,
  }))
}
```

---

## 🎯 MENU → ROUTE MAPPING

### **Sidebar Menu Structure:**

```typescript
// components/SidebarIOS.tsx
const menuStructure = [
  { type: 'item', name: 'Tổng quan', href: '/' },
  { type: 'item', name: 'Tìm kiếm', href: '/search' },
  
  // Thư Viện Vải
  {
    type: 'group',
    groupName: 'Thư Viện Vải',
    items: [
      { name: 'Vải Mẫu', href: '/fabrics' },
      { name: 'Bộ Sưu Tập', href: '/collections' },
      { name: 'Albums Ảnh Vải', href: '/albums?category=fabric' }
    ]
  },
  
  // Phụ Kiện ✨
  {
    type: 'group',
    groupName: 'Phụ Kiện',
    items: [
      { name: 'Phụ kiện trang trí', href: '/accessories/phu-kien-trang-tri' },
      { name: 'Thanh phụ kiện', href: '/accessories/thanh-phu-kien' },
      { name: 'Thanh lý', href: '/accessories/thanh-ly' },
      { name: 'Album', href: '/accessories/album' }
    ]
  },
  
  // Thư Viện Công Trình 🔄
  {
    type: 'group',
    groupName: 'Thư Viện Công Trình',
    items: [
      { name: 'Khách hàng lẻ', href: '/projects/khach-hang-le' },
      { name: 'Dự án', href: '/projects/du-an' },
      { name: 'Công trình tiêu biểu', href: '/projects/cong-trinh-tieu-bieu' },
      { name: 'Phong cách', href: '/styles' }
    ]
  },
  
  // Sự Kiện
  {
    type: 'group',
    groupName: 'Sự Kiện Công Ty',
    items: [
      { name: 'Sự Kiện Nội Bộ', href: '/events' },
      { name: 'Albums Ảnh Sự Kiện', href: '/albums?category=event' }
    ]
  }
]
```

---

## ✅ STATUS

### **Đã hoàn thành:**
- ✅ Cập nhật `components/SidebarIOS.tsx` với routes mới
- ✅ Tạo `app/accessories/[category]/page.tsx`
- ✅ Tạo `app/projects/[category]/page.tsx`
- ✅ Tạo `app/styles/page.tsx`
- ✅ Implement dynamic routes với validation
- ✅ Generate static params cho SEO
- ✅ Metadata cho mỗi page

### **TODO (Next steps):**
- [ ] Tạo `app/styles/[slug]/page.tsx` - Chi tiết phong cách
- [ ] Tạo API endpoints:
  - [ ] `GET /api/accessories?category=...`
  - [ ] `GET /api/accessories/[id]`
  - [ ] `GET /api/styles`
  - [ ] `GET /api/styles/[slug]`
  - [ ] `GET /api/projects?category=...`
- [ ] Fetch real data từ database
- [ ] Implement filters và search
- [ ] Upload ảnh functionality
- [ ] Admin CRUD pages

---

## 🔍 TESTING ROUTES

### **Test trong browser:**
```
✅ http://localhost:3000/accessories/phu-kien-trang-tri
✅ http://localhost:3000/accessories/thanh-phu-kien
✅ http://localhost:3000/accessories/thanh-ly
✅ http://localhost:3000/accessories/album
✅ http://localhost:3000/projects/khach-hang-le
✅ http://localhost:3000/projects/du-an
✅ http://localhost:3000/projects/cong-trinh-tieu-bieu
✅ http://localhost:3000/styles
```

### **Test 404 (invalid routes):**
```
❌ http://localhost:3000/accessories/invalid-category → 404
❌ http://localhost:3000/projects/invalid-category → 404
```

---

## 📖 SEO & METADATA

Mỗi page có metadata riêng:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `${category.name} | TVA Fabric`,
    description: category.description,
  }
}
```

**Kết quả:**
- `/accessories/phu-kien-trang-tri` → "Phụ kiện trang trí | TVA Fabric"
- `/projects/khach-hang-le` → "Khách hàng lẻ | TVA Fabric"
- `/styles` → "Phong cách thiết kế rèm | TVA Fabric"

---

**Ngày cập nhật:** 2025-10-04  
**Version:** 2.0.0 (Nested Routes)

