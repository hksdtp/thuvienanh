# 📋 CẤU TRÚC MENU - GIẢI THÍCH CHI TIẾT

## 🎯 MỤC ĐÍCH

Tài liệu này giải thích **ý nghĩa** và **mục đích** của từng mục trong menu sidebar của TVA Fabric.

---

## 🗂️ CẤU TRÚC MENU HOÀN CHỈNH

```
🏠 Tổng quan (Dashboard)

📦 Thư Viện Vải
├── 📷 Vải Mẫu
├── 📁 Bộ Sưu Tập
└── 📦 Albums Vải

🔧 Phụ Kiện
├── ✨ Phụ kiện trang trí
├── 🏷️ Thanh phụ kiện
├── 🗑️ Thanh lý
└── 📦 Albums Phụ kiện

🏢 Thư Viện Công Trình
├── 👥 Khách hàng lẻ
├── 🏢 Dự án
├── ⭐ Công trình tiêu biểu
└── 🎨 Phong cách

📅 Sự Kiện Công Ty
├── ✨ Sự Kiện Nội Bộ
└── 📦 Albums Sự Kiện
```

---

## 📖 GIẢI THÍCH CHI TIẾT

### **1. 🏠 Tổng quan (Dashboard)**

**Mục đích:**
- Trang chủ, hiển thị tổng quan toàn bộ hệ thống
- Thống kê nhanh: Số lượng vải, bộ sưu tập, công trình
- Hiển thị vải mới nhất và bộ sưu tập nổi bật

**Người dùng:**
- Admin, Manager, Sales

**Nội dung:**
- Stats cards (Vải Mẫu, Bộ Sưu Tập, Công Trình)
- Latest fabrics grid (4 items)
- Featured collections grid (4 items)

---

### **2. 📦 Thư Viện Vải**

**Mục đích:**
- Quản lý toàn bộ vải mẫu của công ty
- Tổ chức vải theo bộ sưu tập
- Lưu trữ ảnh vải theo albums

#### **2.1. 📷 Vải Mẫu**
**Route:** `/fabrics`

**Mục đích:**
- Danh sách tất cả các mẫu vải
- Tìm kiếm, lọc vải theo: màu sắc, chất liệu, bộ sưu tập
- Upload ảnh vải mới
- Xem chi tiết từng mẫu vải

**Dữ liệu:**
- Bảng: `fabrics`
- Thông tin: Tên, mã vải, màu sắc, chất liệu, giá, tồn kho, ảnh

**Người dùng:**
- Admin: Full quyền (thêm, sửa, xóa)
- Sales: Xem, tìm kiếm
- Kỹ thuật viên: Xem, cập nhật tồn kho

#### **2.2. 📁 Bộ Sưu Tập**
**Route:** `/collections`

**Mục đích:**
- Nhóm các mẫu vải theo chủ đề, mùa, phong cách
- Ví dụ: "Bộ sưu tập Xuân Hè 2024", "Vải Cao Cấp", "Vải Giá Rẻ"
- Giúp sales dễ dàng tìm vải phù hợp cho khách hàng

**Dữ liệu:**
- Bảng: `collections`
- Quan hệ: 1 collection có nhiều fabrics

**Người dùng:**
- Admin: Tạo, quản lý bộ sưu tập
- Sales: Xem, tìm kiếm

#### **2.3. 📦 Albums Vải**
**Route:** `/albums/fabric`

**Mục đích:**
- Thư viện ảnh vải được tổ chức theo albums
- Khác với "Vải Mẫu": Đây là **ảnh thô chưa phân loại**
- Ví dụ: "Ảnh vải nhập tháng 1", "Ảnh vải từ nhà cung cấp A"

**Dữ liệu:**
- Bảng: `albums` (category = 'fabric')
- Bảng: `album_images`

**Người dùng:**
- Admin: Upload, tổ chức albums
- Kỹ thuật viên: Upload ảnh từ kho

**Khác biệt với "Vải Mẫu":**
| Vải Mẫu | Albums Vải |
|---------|------------|
| Đã phân loại, có thông tin đầy đủ | Ảnh thô, chưa phân loại |
| Có giá, tồn kho, mã vải | Chỉ có ảnh và mô tả |
| Dùng cho sales | Dùng cho quản lý kho |

---

### **3. 🔧 Phụ Kiện**

**Mục đích:**
- Quản lý phụ kiện rèm cửa (thanh treo, móc cài, dây buộc, v.v.)
- Phân loại theo chức năng

#### **3.1. ✨ Phụ kiện trang trí**
**Route:** `/accessories/phu-kien-trang-tri`

**Mục đích:**
- Các phụ kiện để trang trí rèm
- Ví dụ: Mành rèm, dây buộc rèm, móc cài, đường bo, viền trang trí, dây tua rua

**Dữ liệu:**
- Bảng: `accessories` (category = 'phu-kien-trang-tri')

#### **3.2. 🏷️ Thanh phụ kiện**
**Route:** `/accessories/thanh-phu-kien`

**Mục đích:**
- Các loại thanh treo rèm và phụ kiện liên quan
- Ví dụ: Thanh treo, ray treo, khoen treo

**Dữ liệu:**
- Bảng: `accessories` (category = 'thanh-phu-kien')

#### **3.3. 🗑️ Thanh lý**
**Route:** `/accessories/thanh-ly`

**Mục đích:**
- Sản phẩm phụ kiện thanh lý, giảm giá
- Hàng tồn kho, hàng lỗi, hàng cũ

**Dữ liệu:**
- Bảng: `accessories` (category = 'thanh-ly')

#### **3.4. 📦 Albums Phụ kiện**
**Route:** `/albums/accessory`

**Mục đích:**
- Thư viện ảnh phụ kiện chưa phân loại
- Tương tự "Albums Vải" nhưng cho phụ kiện

**Dữ liệu:**
- Bảng: `albums` (category = 'accessory')

---

### **4. 🏢 Thư Viện Công Trình**

**Mục đích:**
- Lưu trữ ảnh các công trình đã thi công
- Phân loại theo loại khách hàng và chất lượng
- Dùng cho marketing và báo cáo kỹ thuật

#### **4.1. 👥 Khách hàng lẻ**
**Route:** `/projects/khach-hang-le`

**Mục đích:**
- Ảnh công trình của khách hàng cá nhân
- Nhà riêng, căn hộ, chung cư

**Dữ liệu:**
- Bảng: `projects` (project_category = 'retail_customer')

**Phân quyền:**
- Ảnh báo cáo kỹ thuật: Chỉ admin và kỹ thuật viên xem
- Ảnh showcase: Sales và marketing xem được

#### **4.2. 🏢 Dự án**
**Route:** `/projects/du-an`

**Mục đích:**
- Ảnh công trình dự án lớn
- Khách sạn, văn phòng, showroom, nhà hàng

**Dữ liệu:**
- Bảng: `projects` (project_category = 'project')

#### **4.3. ⭐ Công trình tiêu biểu**
**Route:** `/projects/cong-trinh-tieu-bieu`

**Mục đích:**
- Các công trình chất lượng cao, đẹp nhất
- Dùng cho marketing, website, brochure
- Được chọn lọc kỹ từ "Khách hàng lẻ" và "Dự án"

**Dữ liệu:**
- Bảng: `projects` (is_featured = true, quality_rating >= 4)

**Tiêu chí chọn:**
- Chất lượng thi công cao
- Ảnh đẹp, góc chụp tốt
- Khách hàng đồng ý cho sử dụng ảnh

#### **4.4. 🎨 Phong cách**
**Route:** `/styles`

**Mục đích:**
- Phân loại công trình theo phong cách thiết kế
- Ví dụ: Cổ điển, Hiện đại, Tối giản, Sang trọng, Vintage

**Dữ liệu:**
- Bảng: `styles`
- Bảng: `style_images` (ảnh sưu tầm từ internet hoặc công trình thực tế)

**Nội dung mỗi phong cách:**
- Tên phong cách
- Mô tả đặc điểm
- Ảnh minh họa
- Gợi ý loại vải phù hợp
- Gợi ý màu sắc
- Gợi ý phụ kiện (yếm, dây buộc, v.v.)

**Người dùng:**
- Sales: Tư vấn khách hàng chọn phong cách
- Designer: Tham khảo ý tưởng

---

### **5. 📅 Sự Kiện Công Ty**

**Mục đích:**
- Lưu trữ ảnh các sự kiện nội bộ công ty
- Team building, hội nghị, tiệc cuối năm, v.v.

#### **5.1. ✨ Sự Kiện Nội Bộ**
**Route:** `/events`

**Mục đích:**
- Danh sách các sự kiện
- Thông tin: Tên sự kiện, ngày, địa điểm, mô tả

**Dữ liệu:**
- Bảng: `events`

#### **5.2. 📦 Albums Sự Kiện**
**Route:** `/albums/event`

**Mục đích:**
- Thư viện ảnh sự kiện được tổ chức theo albums
- Mỗi sự kiện có 1 album riêng

**Dữ liệu:**
- Bảng: `albums` (category = 'event')

---

## 🔄 QUAN HỆ GIỮA CÁC MỤC

### **Albums vs Pages chính:**

```
Vải Mẫu (/fabrics)
  ↓ (ảnh đã phân loại, có thông tin đầy đủ)
Albums Vải (/albums/fabric)
  ↓ (ảnh thô, chưa phân loại)

Phụ kiện (/accessories/*)
  ↓ (sản phẩm đã phân loại)
Albums Phụ kiện (/albums/accessory)
  ↓ (ảnh thô, chưa phân loại)

Sự Kiện (/events)
  ↓ (thông tin sự kiện)
Albums Sự Kiện (/albums/event)
  ↓ (ảnh sự kiện)
```

### **Workflow:**

1. **Upload ảnh thô** → Albums
2. **Phân loại, thêm thông tin** → Vải Mẫu / Phụ kiện
3. **Nhóm theo chủ đề** → Bộ Sưu Tập
4. **Chọn ảnh đẹp nhất** → Công trình tiêu biểu

---

## ✅ TẠI SAO CẤU TRÚC NÀY?

### **Ưu điểm:**

1. **Phân cấp rõ ràng:**
   - Mỗi nhóm có mục đích riêng
   - Không bị trùng lặp chức năng

2. **Dễ tìm kiếm:**
   - Sales dễ tìm vải cho khách
   - Admin dễ quản lý kho
   - Marketing dễ tìm ảnh đẹp

3. **Phân quyền tốt:**
   - Mỗi role thấy đúng thông tin cần thiết
   - Ảnh kỹ thuật không lộ ra ngoài

4. **Scalable:**
   - Dễ thêm categories mới
   - Dễ thêm phong cách mới
   - Dễ mở rộng chức năng

---

## 🎯 NGƯỜI DÙNG VÀ QUYỀN HẠN

| Role | Quyền truy cập |
|------|----------------|
| **Admin** | Full quyền tất cả mục |
| **Sales** | Vải Mẫu, Bộ Sưu Tập, Công trình tiêu biểu, Phong cách |
| **Kỹ thuật viên** | Vải Mẫu, Albums Vải, Công trình (tất cả), Phụ kiện |
| **Marketing** | Bộ Sưu Tập, Công trình tiêu biểu, Phong cách, Sự Kiện |
| **Kế toán** | Vải Mẫu (giá, tồn kho), Phụ kiện (giá) |

---

**Tài liệu này giải thích đầy đủ ý nghĩa và mục đích của từng mục trong menu.**

