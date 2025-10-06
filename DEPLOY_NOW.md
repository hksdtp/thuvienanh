# 🚀 DEPLOY NGAY BÂY GIỜ!

## ✅ Setup Đã Hoàn Thành!

Tôi đã setup xong tất cả files cần thiết cho hybrid deployment:

### **Files đã tạo/cập nhật:**
- ✅ `lib/api-client.ts` - API client cho frontend
- ✅ `next.config.vercel.js` - Config cho Vercel
- ✅ `middleware.ts` - CORS middleware
- ✅ `vercel.json` - Vercel deployment config
- ✅ `.env` - Đã thêm ALLOWED_ORIGIN
- ✅ `app/fabrics/page.tsx` - Updated để dùng API client

---

## 🎯 Bước Tiếp Theo (3 bước)

### **Bước 1: Commit & Push Code**

```bash
git add .
git commit -m "feat: setup hybrid deployment (Vercel + VPS)"
git push origin main
```

---

### **Bước 2: Deploy Frontend Lên Vercel**

#### **Option A: Connect GitHub (Khuyến nghị) ⭐**

1. **Truy cập:** https://vercel.com/new
2. **Import Repository:**
   - Click "Import Git Repository"
   - Chọn repo: `hksdtp/thuvienanh`
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto detect)
   - Root Directory: `./` (default)
   - Build Command: `cp next.config.vercel.js next.config.js && next build`
   - Output Directory: `out`

4. **Environment Variables:**
   Click "Environment Variables" và thêm:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: http://222.252.23.248:4000
   ```
   
   **Hoặc nếu có domain:**
   ```
   Value: https://api.your-domain.com
   ```

5. **Deploy:**
   - Click "Deploy"
   - Chờ ~2 phút
   - Done! 🎉

#### **Option B: Deploy Thủ Công**

```bash
# Cài Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Khi được hỏi, nhập:
# - NEXT_PUBLIC_API_URL: http://222.252.23.248:4000
```

---

### **Bước 3: Update ALLOWED_ORIGIN Sau Khi Deploy**

Sau khi deploy xong, Vercel sẽ cho bạn URL, ví dụ:
```
https://thuvienanh-abc123.vercel.app
```

**Update .env với URL thật:**

```bash
# Edit .env
nano .env

# Sửa dòng ALLOWED_ORIGIN thành URL thật từ Vercel
ALLOWED_ORIGIN=https://thuvienanh-abc123.vercel.app

# Save (Ctrl+O, Enter, Ctrl+X)
```

**Restart dev server:**
```bash
# Nếu đang chạy npm run dev, nhấn Ctrl+C rồi:
npm run dev
```

---

## 🧪 Test Deployment

### **Test 1: Frontend**
```bash
# Mở URL Vercel
open https://thuvienanh-abc123.vercel.app
```

**Kiểm tra:**
- ✅ Trang load được
- ✅ Không có lỗi CORS trong console (F12)
- ✅ Data hiển thị đúng

### **Test 2: API từ Browser Console**

Mở trang Vercel, nhấn F12, vào Console, chạy:

```javascript
// Test health
fetch('http://222.252.23.248:4000/api/health')
  .then(r => r.json())
  .then(console.log)

// Test fabrics
fetch('http://222.252.23.248:4000/api/fabrics')
  .then(r => r.json())
  .then(console.log)
```

**Kết quả mong đợi:**
- ✅ Không có lỗi CORS
- ✅ Trả về data đúng

---

## 🔧 Nếu Muốn Deploy Backend Lên VPS (Optional)

Hiện tại backend đang chạy local (`npm run dev`). Nếu muốn deploy lên VPS:

### **Bước 1: SSH vào VPS**
```bash
ssh user@your-vps-ip
```

### **Bước 2: Clone repo**
```bash
git clone https://github.com/hksdtp/thuvienanh.git
cd thuvienanh
```

### **Bước 3: Install & Build**
```bash
npm install
npm run build
```

### **Bước 4: Setup PM2**
```bash
# Cài PM2
npm install -g pm2

# Start app
pm2 start npm --name "thuvienanh-api" -- start

# Save
pm2 save
pm2 startup
```

### **Bước 5: Setup Nginx (Optional)**

Nếu muốn có domain (api.your-domain.com):

```bash
# Cài Nginx
sudo apt update
sudo apt install nginx

# Tạo config
sudo nano /etc/nginx/sites-available/thuvienanh-api
```

**Paste:**
```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable
sudo ln -s /etc/nginx/sites-available/thuvienanh-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

**Update NEXT_PUBLIC_API_URL trên Vercel:**
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

---

## 📊 Kiến Trúc Sau Khi Deploy

```
┌─────────────────────────────────────────────────────────┐
│  USER                                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  VERCEL (Frontend)                                       │
│  https://thuvienanh.vercel.app                          │
│  - Static HTML/CSS/JS                                    │
│  - CDN (Fast globally)                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ API Calls (HTTPS)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  VPS/Local (Backend)                                     │
│  http://222.252.23.248:4000                             │
│  - API Routes                                            │
│  - PostgreSQL (222.252.23.248:5499)                     │
│  - Synology NAS                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### **Lỗi: CORS blocked**

**Nguyên nhân:** ALLOWED_ORIGIN chưa đúng

**Giải pháp:**
```bash
# Kiểm tra .env
cat .env | grep ALLOWED_ORIGIN

# Phải match với URL Vercel
ALLOWED_ORIGIN=https://thuvienanh-abc123.vercel.app

# Restart
npm run dev
```

---

### **Lỗi: API not found (404)**

**Nguyên nhân:** NEXT_PUBLIC_API_URL sai

**Giải pháp:**
```bash
# Kiểm tra trên Vercel Dashboard
# Settings > Environment Variables
# NEXT_PUBLIC_API_URL phải đúng

# Test API trực tiếp
curl http://222.252.23.248:4000/api/health
```

---

### **Lỗi: Build failed on Vercel**

**Nguyên nhân:** Build command hoặc config sai

**Giải pháp:**
```bash
# Test build local
cp next.config.vercel.js next.config.js
npm run build

# Nếu lỗi, check logs
```

---

## ✅ Checklist

- [ ] Commit & push code
- [ ] Deploy frontend lên Vercel
- [ ] Set NEXT_PUBLIC_API_URL trên Vercel
- [ ] Update ALLOWED_ORIGIN trong .env với URL Vercel thật
- [ ] Restart dev server
- [ ] Test frontend: https://thuvienanh.vercel.app
- [ ] Test API từ browser console
- [ ] Verify không có lỗi CORS

---

## 🎉 Kết Quả

Sau khi hoàn thành:
- ✅ Frontend trên Vercel (CDN, fast, free)
- ✅ Backend trên local/VPS (full control)
- ✅ Database & Synology giữ nguyên
- ✅ Chi phí: $0/tháng
- ✅ Không cần refactor code nhiều

---

## 📞 Cần Hỗ Trợ?

Nếu gặp vấn đề:
1. Check console logs (F12)
2. Check Vercel deployment logs
3. Check backend logs: `npm run dev`
4. Verify environment variables

---

**Ready to deploy?** 🚀

```bash
git add .
git commit -m "feat: setup hybrid deployment"
git push
```

Sau đó vào https://vercel.com/new để deploy!

