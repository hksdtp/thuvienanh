# 📋 TÀI LIỆU CẬP NHẬT CẤU TRÚC MENU - ỨNG DỤNG BÁN RÈM CỬA

## 🎯 TỔNG QUAN

Đã hoàn thành cập nhật cấu trúc menu và database cho ứng dụng web bán rèm cửa theo yêu cầu:
- ✅ Thêm mục "Phụ kiện" với 4 danh mục con
- ✅ Tái cấu trúc mục "Thư viện công trình"
- ✅ Thêm mục "Phong cách" mới
- ✅ Cập nhật database schema
- ✅ Cập nhật menu sidebar

---

## 📊 CẤU TRÚC MENU MỚI

### **1. Tổng quan** (Không đổi)
- Icon: Squares2X2Icon
- Link: `/`

### **2. Tìm kiếm** (Không đổi)
- Icon: MagnifyingGlassIcon
- Link: `/search`

### **3. Thư Viện Vải** (Không đổi)
- Icon: SparklesIcon
- **Vải Mẫu**: `/fabrics`
- **Bộ Sưu Tập**: `/collections`
- **Albums Ảnh Vải**: `/albums?category=fabric`

### **4. Phụ Kiện** ✨ (MỚI)
- Icon: WrenchScrewdriverIcon
- **Phụ kiện trang trí**: `/accessories?category=phu-kien-trang-tri`
  - Mành rèm, dây buộc rèm, móc cài rèm, đường bo trang trí, viền trang trí, dây tua rua
- **Thanh phụ kiện**: `/accessories?category=thanh-phu-kien`
  - Các loại thanh treo rèm và phụ kiện liên quan
- **Thanh lý**: `/accessories?category=thanh-ly`
  - Sản phẩm thanh lý, giảm giá
- **Album**: `/accessories?category=album`
  - Thư viện ảnh sản phẩm phụ kiện

### **5. Thư Viện Công Trình** 🔄 (CẬP NHẬT)
- Icon: BuildingOffice2Icon
- **Khách hàng lẻ**: `/projects?category=retail_customer`
  - Hình ảnh báo cáo công trình của kỹ thuật viên cho khách hàng lẻ
- **Dự án**: `/projects?category=project`
  - Hình ảnh báo cáo công trình của kỹ thuật viên cho các dự án lớn
- **Công trình tiêu biểu**: `/projects?category=featured`
  - Ảnh chất lượng cao đã được lựa chọn, dùng để sale giới thiệu
- **Phong cách**: `/styles` ✨ (MỚI)
  - Các phong cách thiết kế rèm phổ biến
  - Mỗi phong cách có ảnh minh họa, hướng dẫn phối màu

### **6. Sự Kiện Công Ty** (Không đổi)
- Icon: CalendarDaysIcon
- **Sự Kiện Nội Bộ**: `/events`
- **Albums Ảnh Sự Kiện**: `/albums?category=event`

---

## 🗄️ DATABASE SCHEMA MỚI

### **1. Phụ Kiện (Accessories)**

#### **accessory_categories** - Danh mục phụ kiện
```sql
- id (UUID, PK)
- name (VARCHAR) - Tên danh mục
- slug (VARCHAR, UNIQUE) - Slug URL
- description (TEXT)
- sort_order (INTEGER)
- is_active (BOOLEAN)
```

**Dữ liệu mặc định:**
1. Phụ kiện trang trí (`phu-kien-trang-tri`)
2. Thanh phụ kiện (`thanh-phu-kien`)
3. Thanh lý (`thanh-ly`)
4. Album (`album`)

#### **accessories** - Sản phẩm phụ kiện
```sql
- id (UUID, PK)
- category_id (UUID, FK → accessory_categories)
- code (VARCHAR, UNIQUE) - Mã sản phẩm
- name (VARCHAR) - Tên sản phẩm
- description (TEXT)
- material, color, size, unit
- price, sale_price, discount_percent
- is_on_sale (BOOLEAN)
- stock_quantity, min_stock_level
- cover_image_url, image_count
- tags (TEXT[])
- specifications (JSONB) - Thông số kỹ thuật
- status: 'active', 'inactive', 'discontinued', 'clearance'
- is_featured, is_active
- created_at, updated_at, created_by
```

#### **accessory_images** - Hình ảnh phụ kiện
```sql
- id (UUID, PK)
- accessory_id (UUID, FK → accessories, CASCADE DELETE)
- image_url, thumbnail_url
- title, description
- display_order
- width, height, file_size
- created_at, is_active
```

---

### **2. Phong Cách (Styles)**

#### **styles** - Phong cách thiết kế
```sql
- id (UUID, PK)
- name (VARCHAR) - Tên phong cách
- slug (VARCHAR, UNIQUE)
- description (TEXT)
- characteristics (TEXT) - Đặc điểm
- color_palette (JSONB) - Bảng màu phù hợp
- suitable_rooms (TEXT[]) - Phòng phù hợp
- curtain_types (TEXT[]) - Loại rèm phù hợp
- fabric_recommendations (TEXT[])
- accessory_recommendations (TEXT[])
- cover_image_url, image_count
- tags (TEXT[])
- popularity_score, view_count
- is_featured, is_active
- created_at, updated_at, created_by
```

**Dữ liệu mặc định:**
1. Phong cách Cổ điển Châu Âu
2. Phong cách Hiện đại Tối giản
3. Phong cách Scandinavian
4. Phong cách Industrial
5. Phong cách Tân cổ điển

#### **style_images** - Hình ảnh phong cách
```sql
- id (UUID, PK)
- style_id (UUID, FK → styles, CASCADE DELETE)
- image_url, thumbnail_url
- title, description
- image_type: 'inspiration', 'example', 'color_palette', 'detail'
- room_type
- display_order
- source - Nguồn ảnh (nếu sưu tầm)
- created_at, is_active
```

#### **style_categories** - Danh mục phong cách
```sql
- id (UUID, PK)
- name, slug (UNIQUE)
- description
- sort_order, is_active
```

**Dữ liệu mặc định:**
1. Cổ điển
2. Hiện đại
3. Tân cổ điển
4. Scandinavian
5. Industrial
6. Minimalist

#### **style_category_mappings** - Liên kết phong cách-danh mục
```sql
- style_id (UUID, FK → styles)
- category_id (UUID, FK → style_categories)
- PRIMARY KEY (style_id, category_id)
```

---

### **3. Cập Nhật Projects**

#### **Columns mới trong bảng `projects`:**
```sql
- project_category (VARCHAR) - Phân loại:
  * 'retail_customer' - Khách hàng lẻ
  * 'project' - Dự án
  * 'featured' - Công trình tiêu biểu

- source_type (VARCHAR) - Nguồn ảnh:
  * 'technician_report' - Báo cáo kỹ thuật
  * 'sales_showcase' - Ảnh cho sale
  * 'collected' - Ảnh sưu tầm

- is_featured (BOOLEAN) - Đánh dấu công trình tiêu biểu
- quality_rating (INTEGER 1-5) - Đánh giá chất lượng ảnh
- technician_name (VARCHAR) - Tên kỹ thuật viên
- report_date (DATE) - Ngày báo cáo
- customer_type (VARCHAR) - Loại khách hàng:
  * 'retail', 'wholesale', 'project', 'vip'
```

#### **View mới: v_projects_by_category**
```sql
SELECT 
  p.*,
  CASE project_category
    WHEN 'retail_customer' THEN 'Khách hàng lẻ'
    WHEN 'project' THEN 'Dự án'
    WHEN 'featured' THEN 'Công trình tiêu biểu'
  END as category_display_name,
  ...
FROM projects p
WHERE p.is_active = true;
```

#### **Functions mới:**
- `mark_project_as_featured(project_uuid, rating)` - Đánh dấu công trình tiêu biểu
- `get_projects_by_category(category)` - Lấy danh sách theo phân loại

---

## 🔧 FEATURES KỸ THUẬT

### **1. Phân loại ảnh theo nguồn**
```sql
-- Ảnh báo cáo kỹ thuật
SELECT * FROM projects 
WHERE source_type = 'technician_report';

-- Ảnh cho sale (chất lượng cao)
SELECT * FROM projects 
WHERE source_type = 'sales_showcase' 
  AND is_featured = true;
```

### **2. Lọc và phân quyền**
```sql
-- Khách hàng lẻ
SELECT * FROM projects 
WHERE project_category = 'retail_customer'
  AND is_active = true;

-- Công trình tiêu biểu (cho sale)
SELECT * FROM projects 
WHERE project_category = 'featured'
  AND quality_rating >= 4
  AND is_active = true;
```

### **3. Quản lý tags và categories**
```sql
-- Tìm phong cách theo tags
SELECT * FROM styles 
WHERE tags @> ARRAY['cổ điển', 'sang trọng'];

-- Phong cách theo danh mục
SELECT s.* 
FROM styles s
JOIN style_category_mappings scm ON s.id = scm.style_id
JOIN style_categories sc ON scm.category_id = sc.id
WHERE sc.slug = 'co-dien';
```

---

## 📁 FILES ĐÃ TẠO/CẬP NHẬT

### **Database Migrations:**
1. ✅ `sql/accessories_schema.sql` - Schema phụ kiện
2. ✅ `sql/styles_schema.sql` - Schema phong cách
3. ✅ `sql/update_projects_classification.sql` - Cập nhật projects

### **Frontend:**
1. ✅ `components/SidebarIOS.tsx` - Cập nhật menu structure

### **Documentation:**
1. ✅ `docs/MENU_RESTRUCTURE_SUMMARY.md` - File này

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] Tạo schema `accessories` với 3 tables
- [x] Tạo schema `styles` với 4 tables
- [x] Cập nhật bảng `projects` với columns mới
- [x] Tạo 4 danh mục phụ kiện
- [x] Tạo 5 phong cách mẫu
- [x] Tạo 6 danh mục phong cách
- [x] Cập nhật menu sidebar với 4 groups
- [x] Thêm icons mới (WrenchScrewdriverIcon, TagIcon, etc.)
- [x] Tạo sample data cho accessories
- [x] Tạo sample data cho styles
- [x] Cập nhật projects với phân loại mới
- [x] Tạo views và functions hỗ trợ
- [x] Chạy migrations thành công
- [x] Tạo tài liệu đầy đủ

---

## 🚀 NEXT STEPS

### **1. Tạo Pages mới:**
- [ ] `/accessories` - Trang danh sách phụ kiện
- [ ] `/accessories/[id]` - Trang chi tiết phụ kiện
- [ ] `/styles` - Trang danh sách phong cách
- [ ] `/styles/[slug]` - Trang chi tiết phong cách

### **2. Cập nhật Pages hiện có:**
- [ ] `/projects` - Thêm filter theo `project_category`
- [ ] `/projects/[id]` - Hiển thị thông tin kỹ thuật viên, rating

### **3. API Endpoints:**
- [ ] `GET /api/accessories` - List accessories
- [ ] `GET /api/accessories/[id]` - Get accessory detail
- [ ] `GET /api/styles` - List styles
- [ ] `GET /api/styles/[slug]` - Get style detail
- [ ] `PUT /api/projects/[id]/feature` - Mark as featured

### **4. Admin Features:**
- [ ] Quản lý phụ kiện (CRUD)
- [ ] Quản lý phong cách (CRUD)
- [ ] Đánh dấu công trình tiêu biểu
- [ ] Upload ảnh cho phong cách
- [ ] Phân quyền xem ảnh

---

## 📞 HỖ TRỢ

Nếu cần thêm thông tin hoặc gặp vấn đề:
1. Xem database schema: `\d+ accessories`, `\d+ styles`, `\d+ projects`
2. Xem sample data: `SELECT * FROM accessories LIMIT 5`
3. Test functions: `SELECT * FROM get_projects_by_category('featured')`

---

**Ngày cập nhật:** 2025-10-04  
**Tạo bởi:** Augment AI  
**Version:** 1.0.0

