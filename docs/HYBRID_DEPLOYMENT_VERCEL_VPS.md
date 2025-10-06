# 🚀 Hybrid Deployment: Frontend (Vercel) + Backend (VPS)

## 🎯 Kiến Trúc

```
┌──────────────────────────────────────────────────────────────┐
│                    USER (Browser)                             │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│              VERCEL (Frontend Only)                           │
│  ✅ Static HTML/CSS/JS                                       │
│  ✅ React Components                                          │
│  ✅ Next.js Pages (SSG)                                      │
│  ✅ CDN (Fast globally)                                       │
│  ✅ Free tier: Unlimited bandwidth                           │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ API Calls (HTTPS)
                        ▼
┌──────────────────────────────────────────────────────────────┐
│              VPS (Backend + Database)                         │
│  ✅ API Routes (/api/*)                                      │
│  ✅ PostgreSQL Database (222.252.23.248:5499)               │
│  ✅ Synology NAS (222.252.23.248:6868)                      │
│  ✅ File Uploads                                              │
│  ✅ Server-side Logic                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ Ưu Điểm

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
- ✅ **Private network** - Database không expose ra internet
- ✅ **Chi phí $0** - VPS đã có sẵn

---

## 🛠️ Implementation Steps

### **Step 1: Tách Frontend và Backend**

#### **1.1. Tạo 2 projects:**

```bash
# Project structure
thuvienanh/
├── frontend/          # Deploy lên Vercel
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── (pages)/
│   ├── components/
│   ├── public/
│   ├── next.config.js
│   └── package.json
│
└── backend/           # Deploy lên VPS
    ├── app/
    │   └── api/       # Tất cả API routes
    ├── lib/
    │   ├── db.ts
    │   └── synology.ts
    ├── next.config.js
    └── package.json
```

#### **1.2. Hoặc giữ nguyên 1 project, config khác nhau:**

**Cách này đơn giản hơn!** ✅

---

### **Step 2: Cấu hình Next.js**

#### **2.1. Tạo `next.config.vercel.js` (cho Vercel):**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export - không có API routes
  output: 'export',
  
  // Disable image optimization (không cần trên static)
  images: {
    unoptimized: true,
  },
  
  // Base path nếu cần
  // basePath: '/app',
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: 'https://your-vps-domain.com',
  },
}

module.exports = nextConfig
```

#### **2.2. Giữ nguyên `next.config.js` (cho VPS):**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone - có API routes
  output: 'standalone',
  
  images: {
    domains: [
      '222.252.23.248',
      'localhost'
    ],
  },
}

module.exports = nextConfig
```

---

### **Step 3: Cấu hình API Client**

#### **3.1. Tạo API client:**

```typescript
// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}

// Usage examples
export const fabricsApi = {
  getAll: () => apiFetch<Fabric[]>('/api/fabrics'),
  getById: (id: string) => apiFetch<Fabric>(`/api/fabrics/${id}`),
  create: (data: CreateFabricDto) => 
    apiFetch<Fabric>('/api/fabrics', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
```

#### **3.2. Update components để dùng API client:**

```typescript
// components/FabricList.tsx
'use client'

import { useEffect, useState } from 'react'
import { fabricsApi } from '@/lib/api-client'

export default function FabricList() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
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
      {fabrics.map(fabric => (
        <FabricCard key={fabric.id} fabric={fabric} />
      ))}
    </div>
  )
}
```

---

### **Step 4: Cấu hình CORS trên VPS**

#### **4.1. Tạo middleware:**

```typescript
// middleware.ts (trên VPS)
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }
  
  // Add CORS headers to all responses
  const response = NextResponse.next()
  
  response.headers.set(
    'Access-Control-Allow-Origin',
    process.env.ALLOWED_ORIGIN || '*'
  )
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )
  
  return response
}

// Apply to API routes only
export const config = {
  matcher: '/api/:path*',
}
```

#### **4.2. Set environment variable trên VPS:**

```bash
# .env (trên VPS)
ALLOWED_ORIGIN=https://thuvienanh.vercel.app
```

---

### **Step 5: Deploy Frontend lên Vercel**

#### **5.1. Tạo `vercel.json`:**

```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "out",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-vps-domain.com"
  }
}
```

#### **5.2. Thêm script vào `package.json`:**

```json
{
  "scripts": {
    "dev": "next dev -p 4000",
    "build": "next build",
    "build:vercel": "cp next.config.vercel.js next.config.js && next build",
    "start": "next start -p 4000"
  }
}
```

#### **5.3. Deploy:**

```bash
# Option 1: Connect GitHub repo
# Vercel sẽ auto deploy khi push

# Option 2: Deploy thủ công
npm install -g vercel
vercel login
vercel --prod
```

---

### **Step 6: Setup VPS Backend**

#### **6.1. Cài đặt dependencies:**

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Clone repo (nếu chưa có)
git clone https://github.com/hksdtp/thuvienanh.git
cd thuvienanh

# Install dependencies
npm install

# Build
npm run build

# Start với PM2
pm2 start npm --name "thuvienanh-api" -- start
pm2 save
pm2 startup
```

#### **6.2. Cấu hình Nginx (reverse proxy):**

```nginx
# /etc/nginx/sites-available/thuvienanh-api
server {
    listen 80;
    server_name api.your-domain.com;  # Hoặc dùng IP
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/thuvienanh-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### **6.3. Setup SSL với Let's Encrypt:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

---

### **Step 7: Update Environment Variables**

#### **7.1. Trên Vercel:**

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

#### **7.2. Trên VPS:**

```env
# .env
DATABASE_URL=postgresql://postgres:Demo1234@222.252.23.248:5499/Ninh96
POSTGRES_HOST=222.252.23.248
POSTGRES_PORT=5499
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=Ninh96

SYNOLOGY_BASE_URL=http://222.252.23.248:6868
SYNOLOGY_USERNAME=haininh
SYNOLOGY_PASSWORD=Villad24@

ALLOWED_ORIGIN=https://thuvienanh.vercel.app

NODE_ENV=production
PORT=4000
```

---

## 🧪 Testing

### **Test 1: Frontend (Vercel)**

```bash
# Visit
https://thuvienanh.vercel.app

# Should load static pages
# Check browser console for API calls
```

### **Test 2: Backend (VPS)**

```bash
# Test API directly
curl https://api.your-domain.com/api/health

# Expected response
{"status":"healthy","timestamp":"..."}
```

### **Test 3: CORS**

```bash
# Test from browser console (on Vercel site)
fetch('https://api.your-domain.com/api/fabrics')
  .then(r => r.json())
  .then(console.log)

# Should work without CORS errors
```

---

## 📊 Chi Phí

| Service | Chi phí | Ghi chú |
|---------|---------|---------|
| **Vercel** | $0/tháng | Free tier: Unlimited bandwidth |
| **VPS** | $0/tháng | Đã có sẵn |
| **Domain** | ~$10/năm | Optional (có thể dùng IP) |
| **SSL** | $0 | Let's Encrypt miễn phí |
| **Total** | **$0/tháng** | 🎉 |

---

## ✅ Checklist

- [ ] Tạo API client (`lib/api-client.ts`)
- [ ] Update components để dùng API client
- [ ] Tạo `next.config.vercel.js`
- [ ] Tạo `middleware.ts` cho CORS
- [ ] Deploy frontend lên Vercel
- [ ] Setup Nginx trên VPS
- [ ] Setup SSL với Let's Encrypt
- [ ] Set environment variables
- [ ] Test frontend
- [ ] Test backend
- [ ] Test CORS

---

## 🐛 Troubleshooting

### **Lỗi: CORS blocked**

```typescript
// Kiểm tra middleware.ts
// Đảm bảo ALLOWED_ORIGIN đúng
console.log('ALLOWED_ORIGIN:', process.env.ALLOWED_ORIGIN)
```

### **Lỗi: API not found**

```typescript
// Kiểm tra NEXT_PUBLIC_API_URL
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

### **Lỗi: Build failed on Vercel**

```bash
# Kiểm tra next.config.vercel.js
# Đảm bảo output: 'export'
```

---

## 💡 Tips

1. **Dùng environment variables:**
   - `NEXT_PUBLIC_*` cho frontend (public)
   - Không có prefix cho backend (private)

2. **Cache API responses:**
   ```typescript
   // Use SWR or React Query
   import useSWR from 'swr'
   
   const { data, error } = useSWR('/api/fabrics', fabricsApi.getAll)
   ```

3. **Handle loading states:**
   ```typescript
   if (loading) return <Skeleton />
   if (error) return <ErrorMessage />
   return <Content data={data} />
   ```

---

**Tóm lại:** Bạn có thể deploy frontend lên Vercel (static) và giữ backend + database trên VPS. Frontend sẽ gọi API từ VPS qua HTTPS. Chi phí: $0/tháng! 🚀

