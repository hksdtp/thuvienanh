# 🚀 Hướng Dẫn Fix Lỗi Deploy Vercel

## 📋 Tóm Tắt Vấn Đề

Dự án **thuvienanh** đã được deploy lên Vercel nhưng gặp lỗi kết nối database. Nguyên nhân chính:

### ❌ **Vấn đề chính:**
1. **Database không thể truy cập từ Vercel**
   - PostgreSQL đang chạy tại IP private: `222.252.23.248:5499`
   - Vercel (serverless) chạy trên AWS Lambda không thể kết nối đến IP private/local
   - Cần database phải có public access hoặc sử dụng cloud database

2. **Environment Variables chưa được cấu hình**
   - Các biến môi trường trong `.env.local` chưa được set trên Vercel
   - Vercel không tự động đọc file `.env.local`

3. **Synology NAS không thể truy cập**
   - Synology NAS tại `222.252.23.248:6868` cũng là IP private
   - Vercel không thể kết nối để lấy/upload ảnh

---

## 🎯 Giải Pháp Đề Xuất

### **Option 1: Sử dụng Cloud Database (Khuyến nghị ⭐)**

Đây là giải pháp tốt nhất cho production deployment trên Vercel.

#### **1.1. Sử dụng Vercel Postgres**

```bash
# Cài đặt Vercel Postgres từ dashboard
# https://vercel.com/dashboard/stores

# Vercel sẽ tự động tạo database và set environment variables:
# - POSTGRES_URL
# - POSTGRES_PRISMA_URL
# - POSTGRES_URL_NON_POOLING
```

**Ưu điểm:**
- ✅ Tích hợp sẵn với Vercel
- ✅ Connection pooling tự động
- ✅ Không cần cấu hình phức tạp
- ✅ Free tier: 256 MB storage

**Nhược điểm:**
- ❌ Cần migrate data từ database hiện tại
- ❌ Free tier có giới hạn

#### **1.2. Sử dụng Supabase (Miễn phí, Khuyến nghị)**

```bash
# 1. Tạo project tại https://supabase.com
# 2. Lấy connection string từ Settings > Database
# 3. Set environment variables trên Vercel
```

**Environment Variables cần set:**
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
POSTGRES_HOST=db.[YOUR-PROJECT-REF].supabase.co
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[YOUR-PASSWORD]
POSTGRES_DB=postgres
```

**Ưu điểm:**
- ✅ Hoàn toàn miễn phí (500 MB storage)
- ✅ Public access, Vercel có thể kết nối
- ✅ Có dashboard quản lý database
- ✅ Có storage cho ảnh (thay thế Synology)

#### **1.3. Sử dụng Neon (Serverless Postgres)**

```bash
# 1. Tạo project tại https://neon.tech
# 2. Lấy connection string
# 3. Set environment variables trên Vercel
```

**Ưu điểm:**
- ✅ Serverless, scale tự động
- ✅ Free tier: 512 MB storage
- ✅ Connection pooling built-in

---

### **Option 2: Expose Database hiện tại (Không khuyến nghị)**

⚠️ **Cảnh báo bảo mật:** Expose database ra internet có rủi ro cao!

#### **Bước 1: Cấu hình Router/Firewall**
```bash
# 1. Mở port 5499 trên router
# 2. Forward port 5499 đến máy chạy PostgreSQL
# 3. Lấy public IP: curl ifconfig.me
```

#### **Bước 2: Cấu hình PostgreSQL**
```bash
# File: postgresql.conf
listen_addresses = '*'

# File: pg_hba.conf
host    all    all    0.0.0.0/0    md5
```

#### **Bước 3: Set Environment Variables trên Vercel**
```env
POSTGRES_HOST=[YOUR-PUBLIC-IP]
POSTGRES_PORT=5499
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=Ninh96
```

**Rủi ro:**
- ❌ Database bị expose ra internet
- ❌ Có thể bị tấn công brute force
- ❌ Cần setup firewall rules cẩn thận

---

### **Option 3: Deploy lên VPS thay vì Vercel (Alternative)**

Nếu muốn giữ nguyên database hiện tại và không muốn migrate:

#### **3.1. Deploy lên Railway**
```bash
# 1. Tạo account tại https://railway.app
# 2. Connect GitHub repo
# 3. Set environment variables
# 4. Deploy
```

#### **3.2. Deploy lên Render**
```bash
# 1. Tạo account tại https://render.com
# 2. Connect GitHub repo
# 3. Set environment variables
# 4. Deploy
```

#### **3.3. Deploy lên VPS (DigitalOcean, Linode, etc.)**
```bash
# Sử dụng Docker Compose đã có sẵn
docker-compose up -d
```

**Ưu điểm:**
- ✅ Có thể kết nối đến database private
- ✅ Không cần migrate data
- ✅ Full control

**Nhược điểm:**
- ❌ Cần quản lý server
- ❌ Không có auto-scaling như Vercel

---

## 🔧 Hướng Dẫn Chi Tiết: Migrate sang Supabase (Khuyến nghị)

### **Bước 1: Tạo Supabase Project**

1. Truy cập https://supabase.com
2. Đăng ký/Đăng nhập
3. Click "New Project"
4. Điền thông tin:
   - Name: `thuvienanh`
   - Database Password: (tạo password mạnh)
   - Region: `Southeast Asia (Singapore)` (gần Việt Nam nhất)
5. Click "Create new project"

### **Bước 2: Export Database hiện tại**

```bash
# Export schema và data
pg_dump -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 \
  --no-owner --no-acl -f backup.sql

# Hoặc chỉ export schema
pg_dump -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 \
  --schema-only --no-owner --no-acl -f schema.sql
```

### **Bước 3: Import vào Supabase**

```bash
# Lấy connection string từ Supabase Dashboard
# Settings > Database > Connection string

# Import database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  -f backup.sql
```

### **Bước 4: Cấu hình Environment Variables trên Vercel**

1. Truy cập https://vercel.com/hksdtps-projects/thuvienanh
2. Vào **Settings** > **Environment Variables**
3. Thêm các biến sau:

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
POSTGRES_HOST=db.[PROJECT-REF].supabase.co
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[YOUR-SUPABASE-PASSWORD]
POSTGRES_DB=postgres

# Synology (tạm thời disable nếu không dùng)
SYNOLOGY_BASE_URL=
SYNOLOGY_USERNAME=
SYNOLOGY_PASSWORD=

# Upload (sử dụng Supabase Storage)
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
```

### **Bước 5: Cập nhật Code để sử dụng Supabase Storage (Optional)**

Nếu muốn sử dụng Supabase Storage thay vì Synology:

```typescript
// lib/supabase-storage.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function uploadImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file)
  
  if (error) throw error
  return data
}
```

### **Bước 6: Redeploy trên Vercel**

```bash
# Push code lên GitHub (nếu có thay đổi)
git add .
git commit -m "fix: update database connection for Vercel"
git push

# Vercel sẽ tự động redeploy
# Hoặc trigger manual deploy từ dashboard
```

---

## 📝 Checklist Deploy

- [ ] Tạo cloud database (Supabase/Neon/Vercel Postgres)
- [ ] Export database hiện tại
- [ ] Import vào cloud database
- [ ] Set environment variables trên Vercel
- [ ] Test connection: `/api/health/db`
- [ ] Redeploy application
- [ ] Verify deployment works
- [ ] Test các chức năng chính

---

## 🐛 Troubleshooting

### **Lỗi: "Connection timeout"**
```bash
# Kiểm tra database có public access không
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -c "SELECT 1"
```

### **Lỗi: "Environment variables not found"**
```bash
# Verify environment variables đã được set
# Vercel Dashboard > Settings > Environment Variables
# Đảm bảo chọn đúng environment: Production, Preview, Development
```

### **Lỗi: "Build failed"**
```bash
# Check build logs trên Vercel
# Thường do TypeScript errors hoặc missing dependencies
```

---

## 💡 Khuyến Nghị Cuối Cùng

**Cho Production:**
1. ✅ Sử dụng **Supabase** (miễn phí, dễ setup)
2. ✅ Migrate data sang cloud database
3. ✅ Sử dụng Supabase Storage cho ảnh
4. ✅ Set proper environment variables
5. ✅ Enable SSL/TLS cho database connection

**Cho Development:**
1. ✅ Giữ nguyên local database
2. ✅ Sử dụng `npm run dev` để test local
3. ✅ Chỉ deploy lên Vercel khi đã test kỹ

---

## 📞 Cần Hỗ Trợ?

Nếu gặp vấn đề, hãy cung cấp:
1. Build logs từ Vercel
2. Runtime logs từ Vercel Functions
3. Screenshot lỗi
4. Environment variables đã set (không bao gồm password)

