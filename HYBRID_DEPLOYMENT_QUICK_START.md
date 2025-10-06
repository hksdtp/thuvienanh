# ⚡ Hybrid Deployment - Quick Start

## 🎯 Tại Sao Có Thể?

```
Frontend (Vercel)          Backend (VPS)
     │                          │
     │  Static HTML/CSS/JS      │  API Routes
     │  React Components        │  Database
     │  CDN (Fast)              │  Synology NAS
     │                          │
     └──── API Calls (HTTPS) ───┘
```

**Giải thích:**
1. **Vercel** chỉ serve static files (HTML, CSS, JS)
2. **JavaScript chạy trên browser** của user
3. **Browser gọi API** đến VPS qua HTTPS
4. **VPS xử lý** và trả data về
5. **Browser hiển thị** data

---

## 🚀 Setup Nhanh (10 phút)

### **Bước 1: Chạy script tự động**

```bash
./scripts/setup-hybrid-deployment.sh
```

**Script sẽ tạo:**
- ✅ `lib/api-client.ts` - API client cho frontend
- ✅ `next.config.vercel.js` - Config cho Vercel
- ✅ `middleware.ts` - CORS middleware
- ✅ `vercel.json` - Vercel deployment config
- ✅ `.env.vercel.example` - Environment variables template

---

### **Bước 2: Update 1 component để test**

```typescript
// app/fabrics/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { fabricsApi } from '@/lib/api-client'

export default function FabricsPage() {
  const [fabrics, setFabrics] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fabricsApi.getAll()
      .then(setFabrics)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <h1>Fabrics</h1>
      {fabrics.map(fabric => (
        <div key={fabric.id}>{fabric.name}</div>
      ))}
    </div>
  )
}
```

---

### **Bước 3: Set environment variable trên VPS**

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Add to .env
echo 'ALLOWED_ORIGIN=https://thuvienanh.vercel.app' >> .env

# Restart app
pm2 restart thuvienanh-api
```

---

### **Bước 4: Deploy lên Vercel**

#### **Option A: Connect GitHub (Khuyến nghị)**

1. Push code lên GitHub:
   ```bash
   git add .
   git commit -m "feat: setup hybrid deployment"
   git push
   ```

2. Vào Vercel Dashboard:
   - https://vercel.com/new
   - Import GitHub repo
   - Set environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-vps-domain.com
     ```
   - Deploy

#### **Option B: Deploy thủ công**

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

### **Bước 5: Test**

```bash
# 1. Test frontend
open https://thuvienanh.vercel.app

# 2. Test API từ browser console
fetch('https://your-vps-domain.com/api/health')
  .then(r => r.json())
  .then(console.log)

# 3. Test CORS
# Mở https://thuvienanh.vercel.app
# F12 > Console
fetch('https://your-vps-domain.com/api/fabrics')
  .then(r => r.json())
  .then(console.log)
```

---

## 📊 So Sánh Với Các Giải Pháp Khác

| Giải pháp | Chi phí | Migrate data | Độ khó | Thời gian |
|-----------|---------|--------------|--------|-----------|
| **Hybrid (Vercel + VPS)** | **$0** | ❌ | ⭐⭐ | 10 phút |
| Migrate sang Supabase | $0 | ✅ | ⭐⭐ | 10 phút |
| Expose database | $0 | ❌ | ⭐⭐⭐ | 30 phút |
| Cloudflare Tunnel | $0 | ❌ | ⭐⭐⭐⭐ | 20 phút |
| Full VPS | $0 | ❌ | ⭐ | 0 phút |

---

## ✅ Ưu Điểm Hybrid

### **Frontend trên Vercel:**
- ✅ **CDN toàn cầu** - Load nhanh từ mọi nơi
- ✅ **Miễn phí** - Unlimited bandwidth
- ✅ **Auto SSL** - HTTPS tự động
- ✅ **Auto deploy** - Push code là deploy
- ✅ **Preview deployments** - Test trước khi merge

### **Backend trên VPS:**
- ✅ **Giữ nguyên database** - Không cần migrate
- ✅ **Giữ nguyên Synology** - Không cần thay đổi
- ✅ **Full control** - Không giới hạn
- ✅ **Private network** - Database không expose
- ✅ **Chi phí $0** - VPS đã có sẵn

---

## 🔧 Cấu Hình VPS (Nếu Chưa Có)

### **Setup Nginx:**

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

---

## 🐛 Troubleshooting

### **Lỗi: CORS blocked**

**Nguyên nhân:** ALLOWED_ORIGIN chưa set hoặc sai

**Giải pháp:**
```bash
# Kiểm tra .env trên VPS
cat .env | grep ALLOWED_ORIGIN

# Nếu chưa có, thêm vào
echo 'ALLOWED_ORIGIN=https://thuvienanh.vercel.app' >> .env

# Restart
pm2 restart thuvienanh-api
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
curl https://your-vps-domain.com/api/health
```

---

### **Lỗi: Build failed on Vercel**

**Nguyên nhân:** next.config.vercel.js có vấn đề

**Giải pháp:**
```bash
# Test build local
cp next.config.vercel.js next.config.js
npm run build

# Nếu lỗi, check logs
```

---

## 📝 Checklist

- [ ] Chạy `./scripts/setup-hybrid-deployment.sh`
- [ ] Update 1 component để test (fabrics/page.tsx)
- [ ] Set `ALLOWED_ORIGIN` trên VPS
- [ ] Deploy frontend lên Vercel
- [ ] Set `NEXT_PUBLIC_API_URL` trên Vercel
- [ ] Test frontend: https://thuvienanh.vercel.app
- [ ] Test API: https://your-vps-domain.com/api/health
- [ ] Test CORS từ browser console
- [ ] Update tất cả components để dùng API client

---

## 📚 Tài Liệu Chi Tiết

- 📖 **Full guide:** [`docs/HYBRID_DEPLOYMENT_VERCEL_VPS.md`](docs/HYBRID_DEPLOYMENT_VERCEL_VPS.md)
- 🔧 **API Client:** [`lib/api-client.ts`](lib/api-client.ts)
- ⚙️ **Vercel Config:** [`next.config.vercel.js`](next.config.vercel.js)
- 🌐 **CORS Middleware:** [`middleware.ts`](middleware.ts)

---

## 💡 Tips

1. **Dùng domain cho VPS:**
   - Dễ nhớ hơn IP
   - SSL miễn phí với Let's Encrypt
   - Professional hơn

2. **Monitor logs:**
   ```bash
   # VPS logs
   pm2 logs thuvienanh-api
   
   # Vercel logs
   # Dashboard > Deployments > Click deployment > Logs
   ```

3. **Cache API responses:**
   ```bash
   npm install swr
   ```
   
   ```typescript
   import useSWR from 'swr'
   
   const { data, error } = useSWR('/api/fabrics', fabricsApi.getAll)
   ```

---

## 🎉 Kết Luận

**Hybrid deployment** là giải pháp tốt nhất khi:
- ✅ Muốn frontend nhanh (CDN)
- ✅ Giữ nguyên database & infrastructure
- ✅ Chi phí $0
- ✅ Không cần refactor code nhiều

**Thời gian setup:** ~10 phút  
**Chi phí:** $0/tháng  
**Độ khó:** ⭐⭐☆☆☆

---

**Ready to deploy?** 🚀

```bash
./scripts/setup-hybrid-deployment.sh
```

