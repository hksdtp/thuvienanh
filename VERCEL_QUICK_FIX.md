# 🚀 Fix Lỗi Vercel - Hướng Dẫn Nhanh

## ❌ Vấn Đề
Dự án **thuvienanh** deploy lên Vercel bị lỗi vì:
- Database PostgreSQL tại `222.252.23.248:5499` là IP private
- Vercel (serverless) không thể kết nối đến IP private
- Environment variables chưa được set

## ✅ Giải Pháp Nhanh Nhất (5 phút)

### **Bước 1: Tạo Supabase Database (Miễn phí)**

1. Truy cập: https://supabase.com
2. Đăng ký/Đăng nhập
3. Click **"New Project"**
4. Điền:
   - Name: `thuvienanh`
   - Password: (tạo password mạnh, lưu lại)
   - Region: **Southeast Asia (Singapore)**
5. Click **"Create new project"** (chờ ~2 phút)

### **Bước 2: Export Database Hiện Tại**

```bash
# Chạy script tự động
./scripts/export-database.sh

# Hoặc export thủ công
pg_dump -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 \
  --no-owner --no-acl -f backup.sql
```

### **Bước 3: Import vào Supabase**

1. Vào Supabase Dashboard > **Settings** > **Database**
2. Copy **Connection string** (dạng: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`)
3. Import database:

```bash
# Thay [CONNECTION-STRING] bằng connection string từ Supabase
psql "[CONNECTION-STRING]" -f backup.sql
```

### **Bước 4: Set Environment Variables trên Vercel**

1. Truy cập: https://vercel.com/hksdtps-projects/thuvienanh
2. Vào **Settings** > **Environment Variables**
3. Thêm các biến sau (copy từ Supabase):

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
POSTGRES_HOST=db.[REF].supabase.co
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[YOUR-PASSWORD]
POSTGRES_DB=postgres
```

4. Chọn **All Environments** (Production, Preview, Development)
5. Click **Save**

### **Bước 5: Redeploy**

1. Vào **Deployments** tab
2. Click **"..."** ở deployment mới nhất
3. Click **"Redeploy"**
4. Chờ ~2 phút

### **Bước 6: Verify**

Truy cập: https://thuvienanh.vercel.app/api/health/db

Nếu thấy:
```json
{
  "status": "healthy",
  "connected": true
}
```

✅ **Thành công!** 🎉

---

## 📚 Tài Liệu Chi Tiết

Xem file: [`docs/VERCEL_DEPLOYMENT_FIX.md`](docs/VERCEL_DEPLOYMENT_FIX.md)

---

## 🆘 Cần Giúp?

### **Lỗi: "Cannot connect to database"**
- Kiểm tra connection string có đúng không
- Verify password Supabase
- Thử connect từ local: `psql "[CONNECTION-STRING]" -c "SELECT 1"`

### **Lỗi: "Environment variables not found"**
- Verify đã set đúng tên biến
- Chọn đúng environment (Production)
- Redeploy sau khi set

### **Lỗi: "Build failed"**
- Check build logs trên Vercel
- Thường do TypeScript errors
- Verify dependencies trong package.json

---

## 💡 Tips

- ✅ Supabase free tier: 500 MB storage (đủ dùng)
- ✅ Có thể dùng Supabase Storage thay Synology
- ✅ Backup database định kỳ
- ✅ Monitor usage trên Supabase Dashboard

---

## 🎯 Checklist

- [ ] Tạo Supabase project
- [ ] Export database hiện tại
- [ ] Import vào Supabase
- [ ] Set environment variables trên Vercel
- [ ] Redeploy
- [ ] Test `/api/health/db`
- [ ] Test các chức năng chính

---

**Thời gian ước tính:** 5-10 phút  
**Chi phí:** $0 (Miễn phí)  
**Độ khó:** ⭐⭐☆☆☆ (Dễ)

