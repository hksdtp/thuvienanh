# Vercel Deployment Strategy

## ❌ Vấn Đề Gặp Phải

1. **Static Export không support API routes**
   - Next.js `output: 'export'` không thể có `app/api/*`
   
2. **Static Export không support Dynamic Routes với data**
   - Các trang `[id]`, `[category]` cần `generateStaticParams()`
   - Nhưng không thể dùng `generateStaticParams()` với `'use client'`
   - Không thể pre-generate vì data từ database

3. **Vercel Serverless không access được Private Database**
   - Database ở `222.252.23.248:5499` (private IP)
   - Vercel functions không thể connect

## ✅ Giải Pháp Đề Xuất

### **Option 1: Hybrid với Static Pages Only (KHUYẾN NGHỊ)**

**Deploy lên Vercel:**
- ✅ Trang chủ (`/`)
- ✅ Trang danh sách (`/fabrics`, `/collections`, `/projects`, `/events`)
- ✅ Trang tĩnh (`/about`, `/contact`)

**KHÔNG deploy:**
- ❌ API routes (`/api/*`)
- ❌ Dynamic detail pages (`/fabrics/[id]`, `/projects/[id]`, etc.)

**User Experience:**
- User vào trang chủ từ Vercel (nhanh, CDN)
- Click vào item → Redirect về VPS để xem chi tiết
- Hoặc: Trang danh sách có link trực tiếp về VPS

**Pros:**
- ✅ Đơn giản, dễ maintain
- ✅ Trang chủ nhanh (CDN)
- ✅ Không cần refactor code
- ✅ Chi phí $0

**Cons:**
- ❌ Detail pages không có CDN
- ❌ Cần redirect hoặc external links

---

### **Option 2: Full VPS Deployment (BACKUP PLAN)**

**Deploy toàn bộ trên VPS:**
- ✅ Frontend + Backend cùng server
- ✅ Không cần CORS
- ✅ Không cần split architecture
- ✅ Tất cả features hoạt động

**Setup:**
```bash
# Build production
npm run build

# Run with PM2
pm2 start npm --name "thuvienanh-web" -- start

# Nginx reverse proxy
# Port 3000 cho frontend
# Port 4000 cho API (nếu tách riêng)
```

**Pros:**
- ✅ Đơn giản nhất
- ✅ Không có giới hạn
- ✅ Full control

**Cons:**
- ❌ Không có CDN
- ❌ Tốc độ phụ thuộc VPS location
- ❌ Cần quản lý server

---

### **Option 3: Cloudflare Pages (ALTERNATIVE)**

Cloudflare Pages support:
- ✅ Static export
- ✅ Edge functions (có thể proxy API)
- ✅ Free tier generous hơn Vercel
- ✅ CDN toàn cầu

**Nhưng:**
- ❌ Vẫn gặp vấn đề tương tự với dynamic routes
- ❌ Cần học Cloudflare Workers

---

## 🎯 Quyết Định

Tôi đề xuất: **Option 1 - Hybrid với Static Pages Only**

**Implementation:**

1. **Vercel Config:**
   ```json
   {
     "buildCommand": "bash scripts/build-static-only.sh",
     "outputDirectory": "out",
     "framework": "nextjs"
   }
   ```

2. **Build Script:**
   - Remove API routes
   - Remove dynamic detail pages
   - Keep list pages (they fetch from API client-side)
   - Build static export

3. **Frontend Changes:**
   - List pages: Link to VPS for details
   - Or: Use modal/drawer to show details (fetch from API)

4. **User Flow:**
   ```
   User → Vercel (/) → Fast load
        → Click item → Fetch detail from VPS API
        → Show in modal/drawer
   ```

---

## 📝 Next Steps

1. Tạo `scripts/build-static-only.sh`
2. Remove dynamic detail pages từ build
3. Update list pages để show details in modal
4. Test build locally
5. Deploy to Vercel
6. Update DNS/links

---

## 🤔 Câu Hỏi Cho User

1. Bạn có muốn detail pages mở trong modal hay redirect về VPS?
2. Bạn có chấp nhận UX này không?
3. Hoặc bạn muốn deploy toàn bộ trên VPS (Option 2)?


