# 🔒 FIX MIXED CONTENT ERROR - HTTPS DEPLOYMENT

## 🐛 VẤN ĐỀ

**Lỗi:** Mixed Content - Trang HTTPS request tới HTTP resources
```
Mixed Content: The page at 'https://...' was loaded over HTTPS, 
but requested an insecure element 'http://222.252.23.248:...'. 
This request has been blocked; the content must be served over HTTPS.
```

**Nguyên nhân:**
- ❌ Website chạy HTTPS
- ❌ Synology NAS chạy HTTP (port 8888, 6868)
- ❌ Browser block HTTP requests từ HTTPS page

---

## ✅ GIẢI PHÁP

### **Option 1: Sử dụng Proxy Route (Recommended)**

Tất cả images đã được proxy qua `/synology-proxy` route, nhưng cần đảm bảo không có hardcoded URLs.

#### **1. Kiểm tra Environment Variables trên VPS**

SSH vào VPS:
```bash
ssh user@your-vps-ip
cd ~/apps/thuvienanh
cat .env.production
```

Đảm bảo **KHÔNG** có `NEXT_PUBLIC_API_URL` hoặc URLs với IP:
```env
# ❌ XÓA hoặc comment out
# NEXT_PUBLIC_API_URL=http://222.252.23.248:3000

# ✅ Chỉ cần internal URLs (server-side)
SYNOLOGY_BASE_URL=http://222.252.23.248:8888
SYNOLOGY_ALTERNATIVE_URL=http://222.252.23.248:6868
POSTGRES_HOST=222.252.23.248
```

#### **2. Rebuild và Restart**

```bash
cd ~/apps/thuvienanh
npm run build
pm2 restart thuvienanh
```

---

### **Option 2: Setup HTTPS cho Synology (Advanced)**

Nếu muốn access trực tiếp Synology qua HTTPS:

#### **1. Enable HTTPS trên Synology**
1. Đăng nhập Synology DSM
2. Control Panel → Security → Certificate
3. Add certificate (Let's Encrypt hoặc self-signed)
4. Enable HTTPS cho File Station

#### **2. Update Environment Variables**
```env
SYNOLOGY_BASE_URL=https://222.252.23.248:5001
SYNOLOGY_ALTERNATIVE_URL=https://222.252.23.248:5001
```

#### **3. Update next.config.js**
```javascript
remotePatterns: [
  {
    protocol: 'https',  // ✅ Change to https
    hostname: '222.252.23.248',
    port: '5001',
  },
]
```

---

### **Option 3: Setup Nginx Reverse Proxy (Best Practice)**

#### **1. Install Nginx**
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

#### **2. Create Nginx Config**
```bash
sudo nano /etc/nginx/sites-available/thuvienanh
```

Paste:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Certificate (will be added by certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Next.js App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Synology Proxy (Optional - if you want direct access)
    location /synology/ {
        proxy_pass http://222.252.23.248:8888/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### **3. Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/thuvienanh /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### **4. Get SSL Certificate**
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### **5. Update Environment Variables**
```env
# No need for NEXT_PUBLIC_API_URL
# All requests will go through domain
```

---

## 🔍 DEBUG CHECKLIST

### **1. Check Browser Console**
```javascript
// Open DevTools → Console
// Look for Mixed Content errors
```

### **2. Check Network Tab**
```
DevTools → Network → Filter: Images
- All image URLs should be relative (/synology-proxy?path=...)
- OR same protocol as page (https://...)
```

### **3. Check Server Logs**
```bash
pm2 logs thuvienanh --lines 100
```

### **4. Test Proxy Route**
```bash
# Should work
curl https://your-domain.com/synology-proxy?path=/Marketing/test.jpg

# Should return image data
```

---

## 🚀 QUICK FIX (Immediate)

**Nếu đang gấp, làm theo các bước sau:**

### **1. SSH vào VPS**
```bash
ssh user@your-vps-ip
cd ~/apps/thuvienanh
```

### **2. Edit .env.production**
```bash
nano .env.production
```

Xóa hoặc comment out:
```env
# NEXT_PUBLIC_API_URL=http://222.252.23.248:3000
```

### **3. Rebuild**
```bash
npm run build
pm2 restart thuvienanh
```

### **4. Clear Browser Cache**
```
Ctrl + Shift + R (hard refresh)
```

---

## 📊 VERIFY FIX

### **1. Check Image URLs in Browser**
Open DevTools → Elements → Find `<img>` tags:

**❌ BAD (Will be blocked):**
```html
<img src="http://222.252.23.248:8888/..." />
```

**✅ GOOD (Will work):**
```html
<img src="/synology-proxy?path=/Marketing/..." />
```

### **2. Check API Calls**
DevTools → Network → XHR:

**❌ BAD:**
```
POST http://222.252.23.248:3000/api/albums
```

**✅ GOOD:**
```
POST /api/albums
```

---

## 💡 BEST PRACTICES

1. **Never use absolute URLs in frontend code**
   ```typescript
   // ❌ BAD
   const API_URL = 'http://222.252.23.248:3000'
   
   // ✅ GOOD
   const response = await fetch('/api/albums')
   ```

2. **Use environment variables only for server-side**
   ```typescript
   // ✅ Server-side only
   const SYNOLOGY_URL = process.env.SYNOLOGY_BASE_URL
   ```

3. **Always use proxy routes for external resources**
   ```typescript
   // ✅ Proxy through Next.js
   <Image src="/synology-proxy?path=..." />
   ```

4. **Setup proper CORS headers**
   ```typescript
   // next.config.js
   async headers() {
     return [
       {
         source: '/api/:path*',
         headers: [
           { key: 'Access-Control-Allow-Origin', value: '*' },
         ],
       },
     ]
   }
   ```

---

## 🆘 STILL NOT WORKING?

### **Check these:**

1. **Clear all caches:**
   ```bash
   # Server
   rm -rf .next
   npm run build
   pm2 restart thuvienanh
   
   # Browser
   Ctrl + Shift + Delete → Clear all
   ```

2. **Check Nginx logs (if using):**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Check PM2 logs:**
   ```bash
   pm2 logs thuvienanh --err
   ```

4. **Test locally with HTTPS:**
   ```bash
   # Install mkcert
   brew install mkcert  # macOS
   # or
   sudo apt install mkcert  # Linux
   
   # Create local certificate
   mkcert localhost
   
   # Run with HTTPS
   npm run dev -- --experimental-https
   ```

---

## 📞 CONTACT

Nếu vẫn gặp vấn đề, cung cấp:
1. Browser console errors (screenshot)
2. Network tab (screenshot)
3. PM2 logs: `pm2 logs thuvienanh --lines 50`
4. Environment variables (ẩn passwords)

