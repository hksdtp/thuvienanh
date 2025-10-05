# ✅ Đã Chuyển Sang Chạy Trực Tiếp (Không Docker)

**Ngày:** 2025-09-30  
**Thay đổi:** Tắt Docker, chạy Next.js dev server trực tiếp  
**Port:** 4000  
**Database:** Remote PostgreSQL (222.252.23.248:5499)  

---

## 🎯 **Những Gì Đã Làm**

### **1. Tắt và Xóa Docker Containers** ✅

```bash
docker-compose down -v
```

**Kết quả:**
```
✅ Container tva-fabric-library  Removed
✅ Container tva-pgadmin         Removed
✅ Container tva-postgres        Removed
✅ Volume tva_postgres_data      Removed
✅ Volume tva_pgadmin_data       Removed
✅ Network fabric-library-network Removed
```

### **2. Xóa Next.js Cache** ✅

```bash
rm -rf .next
```

### **3. Chạy Dev Server Trực Tiếp** ✅

```bash
npm run dev
```

**Kết quả:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:4000
- Environments: .env.local, .env

✓ Ready in 850ms
✅ Synology authentication successful
✅ SMB Health check...
```

### **4. Verify API** ✅

```bash
# Fabrics
curl http://localhost:4000/api/fabrics
→ {"success":true,"data":[],"message":"Tìm thấy 0 loại vải"}

# Collections
curl http://localhost:4000/api/collections
→ {"success":true,"data":[],"message":"Tìm thấy 0 bộ sưu tập"}
```

---

## 📊 **Cấu Hình Hiện Tại**

### **Environment Variables (.env):**

```env
# Database - Remote PostgreSQL
DATABASE_URL=postgresql://postgres:Demo1234@222.252.23.248:5499/Ninh96
POSTGRES_HOST=222.252.23.248
POSTGRES_PORT=5499
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=Ninh96

# Application
NODE_ENV=development
PORT=3000

# Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
```

### **Package.json Scripts:**

```json
{
  "scripts": {
    "dev": "next dev -p 4000",
    "build": "next build",
    "start": "next start -p 4000",
    "lint": "next lint"
  }
}
```

---

## 🚀 **Cách Sử Dụng**

### **Start Dev Server:**

```bash
cd /Users/ninh/Webapp/TVA
npm run dev
```

**Output:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:4000

✓ Ready in 850ms
```

### **Stop Dev Server:**

```bash
# Nhấn Ctrl + C trong terminal
```

### **Restart Dev Server:**

```bash
# Stop (Ctrl + C)
# Start lại
npm run dev
```

---

## 🌐 **URLs**

### **Web Application:**
```
http://localhost:4000/
```

### **API Endpoints:**
```
http://localhost:4000/api/fabrics
http://localhost:4000/api/collections
http://localhost:4000/api/albums
http://localhost:4000/api/health
http://localhost:4000/api/health/synology
```

### **Database:**
```
Host:     222.252.23.248
Port:     5499
Database: Ninh96
Username: postgres
Password: Demo1234
```

### **Synology NAS:**
```
URL:      http://222.252.23.248:8888
Username: haininh
Password: Villad24@
```

---

## ✅ **Lợi Ích Chạy Trực Tiếp**

### **1. Hot Reload Nhanh Hơn** ⚡
- Thay đổi code → Tự động reload ngay lập tức
- Không cần rebuild Docker image
- Dev experience tốt hơn

### **2. Debug Dễ Dàng** 🐛
- Console.log hiển thị trực tiếp trong terminal
- Error stack trace rõ ràng
- Dễ dàng attach debugger

### **3. Không Cần Docker** 🚫🐳
- Tiết kiệm tài nguyên hệ thống
- Không cần quản lý containers
- Startup nhanh hơn

### **4. Kết Nối Database Remote** 🌐
- Kết nối trực tiếp đến PostgreSQL server
- Không cần local database container
- Dữ liệu đồng bộ với production

---

## 📝 **Lưu Ý Quan Trọng**

### **⚠️ Dev Server vs Production:**

**Dev Server (npm run dev):**
- ✅ Hot reload
- ✅ Source maps
- ✅ Detailed error messages
- ❌ Chậm hơn
- ❌ Không tối ưu

**Production (npm run build && npm start):**
- ✅ Tối ưu performance
- ✅ Minified code
- ✅ Nhanh hơn
- ❌ Không hot reload
- ❌ Cần rebuild khi thay đổi

### **✅ Khi Nào Dùng Dev Server:**

- ✅ Đang develop/code
- ✅ Cần hot reload
- ✅ Cần debug
- ✅ Test tính năng mới

### **✅ Khi Nào Dùng Docker:**

- ✅ Deploy production
- ✅ Cần môi trường giống production
- ✅ Cần local database
- ✅ Cần nhiều services (nginx, redis, etc.)

---

## 🔧 **Troubleshooting**

### **1. Port 4000 Đã Được Sử Dụng:**

```bash
# Tìm process đang dùng port 4000
lsof -i :4000

# Kill process
kill -9 <PID>

# Hoặc dùng port khác
next dev -p 3000
```

### **2. Database Connection Error:**

```bash
# Test connection
PGPASSWORD='Demo1234' psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96 -c "SELECT 1;"

# Nếu fail, check:
- Network connection
- Firewall
- Database credentials
```

### **3. Module Not Found:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **4. Cache Issues:**

```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Restart dev server
npm run dev
```

---

## 📚 **Commands Cheat Sheet**

### **Development:**

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### **Database:**

```bash
# Connect to database
PGPASSWORD='Demo1234' psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96

# Check tables
\dt

# Check data
SELECT COUNT(*) FROM fabrics;
SELECT COUNT(*) FROM collections;
SELECT COUNT(*) FROM albums;

# Exit
\q
```

### **Testing:**

```bash
# Test API
curl http://localhost:4000/api/fabrics
curl http://localhost:4000/api/collections
curl http://localhost:4000/api/albums

# Test with jq
curl -s http://localhost:4000/api/fabrics | jq '.message'
```

---

## 🎊 **Tổng Kết**

### **Trước (Docker):**

```
✅ Docker containers: 3 (app, postgres, pgadmin)
✅ Port: 4000
✅ Database: Local PostgreSQL container
❌ Slow startup
❌ Cần rebuild khi thay đổi code
```

### **Sau (Direct):**

```
✅ No Docker
✅ Port: 4000
✅ Database: Remote PostgreSQL (222.252.23.248:5499)
✅ Fast hot reload
✅ Easy debugging
✅ Instant code changes
```

---

## 🚀 **Bây Giờ Bạn Có Thể:**

### **1. Mở Dashboard:**
```
http://localhost:4000/
```

**Verify:**
- ✅ Tổng số mẫu vải: 0
- ✅ Bộ sưu tập: 0
- ✅ Sắp hết hàng: 0
- ✅ Hoạt động gần đây: "Chưa có hoạt động nào"

### **2. Tạo Bộ Sưu Tập:**
```
http://localhost:4000/collections
→ Click "Thêm bộ sưu tập"
→ Tên: "Vải Xuân Hè 2025"
→ Lưu
```

### **3. Thêm Vải:**
```
http://localhost:4000/fabrics
→ Click "Thêm vải mới"
→ Storage: "Photos API"
→ Upload ảnh thật
→ Điền thông tin
→ Lưu
```

### **4. Tạo Album:**
```
http://localhost:4000/albums
→ Click "Tạo album mới"
→ Điền thông tin
→ Lưu
```

---

## 📊 **Status Check**

### **✅ Hoàn Thành:**

- [x] Tắt Docker containers
- [x] Xóa Docker volumes
- [x] Xóa .next cache
- [x] Start dev server
- [x] Verify API trả về 0 records
- [x] Mở browser
- [x] Tạo tài liệu

### **⏳ Bạn Cần Làm:**

- [ ] Hard refresh browser: `Cmd/Ctrl + Shift + R`
- [ ] Verify Dashboard hiển thị 0 records
- [ ] Bắt đầu tạo dữ liệu thật
- [ ] Test upload ảnh với Synology Photos API

---

## 🎯 **Next Steps**

### **1. Verify Dashboard Clean:**

```
1. Mở: http://localhost:4000/
2. Hard refresh: Cmd + Shift + R
3. Check: Tất cả stats = 0
4. Check: "Chưa có hoạt động nào"
```

### **2. Tạo Dữ Liệu Đầu Tiên:**

```
1. Tạo bộ sưu tập: "Vải Xuân Hè 2025"
2. Thêm vải với ảnh thật
3. Refresh Dashboard
4. Verify: Stats tăng lên!
```

### **3. Test Synology Integration:**

```
1. Vào /fabrics
2. Thêm vải mới
3. Chọn Storage: "Photos API"
4. Upload ảnh
5. Verify: Ảnh được upload lên Synology
```

---

**✅ Đã chuyển sang chạy trực tiếp thành công! Dev server đang chạy trên port 4000! 🎉**

**Mở: http://localhost:4000/ và nhấn `Cmd + Shift + R` để xem kết quả!**

