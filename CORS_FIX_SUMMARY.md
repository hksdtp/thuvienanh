# 🔧 CORS & File Proxy Error Fix Summary

## 📋 Các lỗi đã được sửa

### 1. **CORS Error với Cloudflare RUM**
```
[Error] XMLHttpRequest cannot load https://thuvienanh.ninh.app/cdn-cgi/rum? 
due to access control checks.
```

**Nguyên nhân:**
- Content Security Policy (CSP) quá nghiêm ngặt trong `next.config.js`
- CSP cũ: `"default-src 'self'; script-src 'none'; sandbox;"`
- Chặn tất cả scripts bao gồm Cloudflare RUM (Real User Monitoring)

**Giải pháp:**
- ✅ Xóa CSP nghiêm ngặt khỏi image config
- ✅ Thêm security headers phù hợp hơn vào `next.config.js`
- ✅ Thêm meta tag để disable Cloudflare RUM nếu cần
- ✅ Cập nhật middleware để skip `/cdn-cgi/` paths

### 2. **Failed to load resource: file-proxy**
```
[Error] Failed to load resource: Không thể kết nối máy chủ. (file-proxy, line 0)
```

**Nguyên nhân:**
- Timeout khi kết nối với Synology NAS
- Không có error handling chi tiết
- Không có timeout cho authentication và fetch requests

**Giải pháp:**
- ✅ Thêm timeout 10s cho authentication
- ✅ Thêm timeout 30s cho file fetch
- ✅ Cải thiện error messages chi tiết hơn
- ✅ Thêm CORS headers cho file-proxy response
- ✅ Thêm logging chi tiết hơn

---

## 📝 Các file đã được sửa đổi

### 1. `next.config.js`
**Thay đổi:**
- ❌ Xóa: `contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"`
- ✅ Thêm: `contentDispositionType: 'inline'`
- ✅ Thêm: Security headers function với X-Frame-Options, X-Content-Type-Options, etc.

**Lý do:**
- CSP cũ quá nghiêm ngặt, chặn Cloudflare RUM và các scripts hợp lệ
- Security headers mới vẫn bảo mật nhưng linh hoạt hơn

### 2. `middleware.ts`
**Thay đổi:**
- ✅ Thêm: Skip Cloudflare CDN paths (`/cdn-cgi/`)
- ✅ Thêm: `Access-Control-Allow-Credentials: 'true'`
- ✅ Thêm: `X-Requested-With` vào allowed headers

**Lý do:**
- Cloudflare RUM cần được bypass khỏi middleware
- Cải thiện CORS support cho credentials

### 3. `app/api/synology/file-proxy/route.ts`
**Thay đổi:**
- ✅ Thêm: Authentication timeout (10s)
- ✅ Thêm: Fetch timeout (30s) với `AbortSignal.timeout(30000)`
- ✅ Thêm: Chi tiết error messages (timeout, connection, etc.)
- ✅ Thêm: CORS header `Access-Control-Allow-Origin: '*'`
- ✅ Thêm: Logging chi tiết hơn với file size

**Lý do:**
- Tránh request bị treo vô thời hạn
- Giúp debug dễ dàng hơn với error messages rõ ràng
- Đảm bảo CORS hoạt động cho file proxy

### 4. `app/layout.tsx`
**Thay đổi:**
- ✅ Thêm: `<head>` section với meta tag
- ✅ Thêm: `<meta name="cf-2fa-verify" content="false" />`

**Lý do:**
- Tắt Cloudflare RUM nếu vẫn gây vấn đề
- Có thể bật/tắt dễ dàng

---

## 🧪 Cách kiểm tra

### 1. **Build và chạy local**
```bash
# Build project
npm run build

# Chạy production mode
npm start
```

### 2. **Kiểm tra trong browser**
- Mở DevTools (F12)
- Vào tab Console
- Refresh trang (Cmd+R hoặc Ctrl+R)
- ✅ Không còn CORS errors
- ✅ Không còn file-proxy errors

### 3. **Kiểm tra Network tab**
- Mở DevTools > Network
- Filter: `file-proxy`
- ✅ Status code: 200 OK
- ✅ Response time: < 30s
- ✅ Content-Type: image/jpeg hoặc image/png

### 4. **Kiểm tra Cloudflare RUM**
- Mở DevTools > Network
- Filter: `cdn-cgi`
- ✅ Không còn CORS errors
- ✅ RUM script load thành công (hoặc bị disable bởi meta tag)

---

## 🚀 Deploy lên production

### Option 1: Deploy lên Ubuntu Server (Cloudflare Tunnel)
```bash
# Sync code lên server
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ nihdev@100.115.191.19:/data/Ninh/projects/thuvienanh/

# SSH vào server
ssh nihdev@100.115.191.19

# Build và restart
cd /data/Ninh/projects/thuvienanh
npm install
npm run build
pm2 restart thuvienanh
pm2 save

# Kiểm tra logs
pm2 logs thuvienanh --lines 50
```

### Option 2: Deploy với Docker
```bash
# Build Docker image
docker-compose -f docker-compose.production.yml build

# Restart container
docker-compose -f docker-compose.production.yml up -d

# Kiểm tra logs
docker-compose -f docker-compose.production.yml logs -f app
```

---

## 📊 Monitoring

### Kiểm tra logs trên server
```bash
# PM2 logs
ssh nihdev@100.115.191.19 'pm2 logs thuvienanh --lines 100'

# Tìm file-proxy errors
ssh nihdev@100.115.191.19 'pm2 logs thuvienanh --lines 1000 | grep "file-proxy"'

# Tìm CORS errors
ssh nihdev@100.115.191.19 'pm2 logs thuvienanh --lines 1000 | grep "CORS"'
```

### Kiểm tra Synology connection
```bash
# Test Synology API
curl -v http://222.252.23.248:8888/webapi/entry.cgi?api=SYNO.API.Info&version=1&method=query

# Test file-proxy endpoint
curl -v https://thuvienanh.ninh.app/api/synology/file-proxy?path=/Marketing/Ninh/thuvienanh/test.jpg
```

---

## 🔍 Troubleshooting

### Nếu vẫn còn CORS errors:

1. **Kiểm tra Cloudflare settings:**
   - Login: https://dash.cloudflare.com
   - Domain: ninh.app
   - SSL/TLS > Overview > Full (strict)
   - Speed > Optimization > Disable Auto Minify for JS

2. **Kiểm tra environment variables:**
   ```bash
   # Trên server
   ssh nihdev@100.115.191.19 'cat /data/Ninh/projects/thuvienanh/.env | grep ALLOWED_ORIGIN'
   ```

3. **Clear Cloudflare cache:**
   - Cloudflare Dashboard > Caching > Purge Everything

### Nếu file-proxy vẫn timeout:

1. **Kiểm tra Synology NAS:**
   ```bash
   # Ping Synology
   ping 222.252.23.248
   
   # Test port
   nc -zv 222.252.23.248 8888
   ```

2. **Kiểm tra credentials:**
   ```bash
   # Test authentication
   curl -X POST "http://222.252.23.248:8888/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=login&account=haininh&passwd=Villad24%40&session=FileStation&format=cookie"
   ```

3. **Tăng timeout nếu cần:**
   - Edit `app/api/synology/file-proxy/route.ts`
   - Tăng `AbortSignal.timeout(30000)` lên `60000` (60s)

---

## ✅ Checklist

- [x] Xóa CSP nghiêm ngặt khỏi next.config.js
- [x] Thêm security headers phù hợp
- [x] Cập nhật middleware để skip Cloudflare paths
- [x] Thêm timeout cho file-proxy
- [x] Cải thiện error handling
- [x] Thêm CORS headers cho file-proxy
- [x] Thêm meta tag để disable RUM nếu cần
- [x] Test local
- [ ] Deploy lên production
- [ ] Kiểm tra trên production
- [ ] Monitor logs

---

## 📚 Tài liệu tham khảo

- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Cloudflare RUM Documentation](https://developers.cloudflare.com/analytics/web-analytics/)
- [CORS Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [AbortSignal.timeout()](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout)

---

**Tạo bởi:** Augment Agent  
**Ngày:** 2025-10-26  
**Version:** 1.0

