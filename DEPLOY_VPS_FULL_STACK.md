# 🚀 Deploy Full Stack lên VPS

## 📋 Tổng Quan

Deploy toàn bộ ứng dụng (Frontend + Backend) lên VPS tại `222.252.23.248`.

**Kiến trúc:**
```
VPS (222.252.23.248)
├── Frontend (Next.js) - Port 3000
├── Backend API (Next.js API Routes) - Cùng port 3000
├── Database (PostgreSQL) - Port 5499
└── Synology NAS - Port 6868
```

---

## ✅ Yêu Cầu

- ✅ VPS đã có Node.js (v18+)
- ✅ VPS đã có PM2
- ✅ Database PostgreSQL đang chạy
- ✅ Synology NAS đang chạy
- ✅ Git đã cài đặt

---

## 🔧 BƯỚC 1: Chuẩn Bị VPS

### **1.1: SSH vào VPS**

```bash
ssh user@222.252.23.248
```

### **1.2: Tạo thư mục project**

```bash
# Tạo thư mục
mkdir -p ~/apps/thuvienanh
cd ~/apps/thuvienanh

# Clone repository
git clone https://github.com/hksdtp/thuvienanh.git .

# Hoặc nếu đã có, pull latest
git pull origin main
```

### **1.3: Cài đặt dependencies**

```bash
npm install
```

---

## 🔐 BƯỚC 2: Cấu Hình Environment Variables

### **2.1: Tạo file .env**

```bash
nano .env
```

### **2.2: Nội dung file .env**

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:Demo1234@222.252.23.248:5499/Ninh96
POSTGRES_HOST=222.252.23.248
POSTGRES_PORT=5499
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=Ninh96

# Synology
SYNOLOGY_HOST=222.252.23.248
SYNOLOGY_PORT=6868
SYNOLOGY_USERNAME=your_username
SYNOLOGY_PASSWORD=your_password

# SMB
SMB_HOST=222.252.23.248
SMB_PORT=445
SMB_USERNAME=your_username
SMB_PASSWORD=your_password
SMB_SHARE=marketing

# CORS (không cần nếu cùng domain)
ALLOWED_ORIGIN=*

# Next.js
NEXT_PUBLIC_API_URL=http://222.252.23.248:3000
```

**Lưu file:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🏗️ BƯỚC 3: Build Production

### **3.1: Build Next.js**

```bash
# Sử dụng config cho VPS (standalone mode)
npm run build
```

**Lưu ý:** Build sẽ sử dụng `next.config.js` (đã có sẵn với `output: 'standalone'`)

### **3.2: Kiểm tra build**

```bash
# Kiểm tra folder .next đã được tạo
ls -la .next/

# Kiểm tra standalone folder
ls -la .next/standalone/
```

---

## 🚀 BƯỚC 4: Chạy Với PM2

### **4.1: Stop process cũ (nếu có)**

```bash
# Stop backend API cũ
pm2 stop thuvienanh-api 2>/dev/null || true
pm2 delete thuvienanh-api 2>/dev/null || true

# Stop frontend cũ (nếu có)
pm2 stop thuvienanh-web 2>/dev/null || true
pm2 delete thuvienanh-web 2>/dev/null || true
```

### **4.2: Start ứng dụng mới**

```bash
# Start Next.js full stack (frontend + API)
pm2 start npm --name "thuvienanh" -- start

# Hoặc dùng standalone server (nhanh hơn)
cd .next/standalone
pm2 start node --name "thuvienanh" -- server.js

# Quay lại root
cd ~/apps/thuvienanh
```

### **4.3: Lưu PM2 config**

```bash
pm2 save
```

### **4.4: Kiểm tra status**

```bash
pm2 status
pm2 logs thuvienanh --lines 50
```

---

## 🌐 BƯỚC 5: Cấu Hình Nginx (Optional)

Nếu muốn dùng domain hoặc port 80/443:

### **5.1: Tạo Nginx config**

```bash
sudo nano /etc/nginx/sites-available/thuvienanh
```

### **5.2: Nội dung config**

```nginx
server {
    listen 80;
    server_name thuvienanh.com www.thuvienanh.com;
    # Hoặc dùng IP: server_name 222.252.23.248;

    # Logs
    access_log /var/log/nginx/thuvienanh-access.log;
    error_log /var/log/nginx/thuvienanh-error.log;

    # Proxy to Next.js
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Images caching
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

### **5.3: Enable site**

```bash
# Tạo symlink
sudo ln -s /etc/nginx/sites-available/thuvienanh /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### **5.4: Setup SSL (Optional)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d thuvienanh.com -d www.thuvienanh.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## ✅ BƯỚC 6: Kiểm Tra

### **6.1: Test local**

```bash
# Test từ VPS
curl http://localhost:3000

# Test API
curl http://localhost:3000/api/health
```

### **6.2: Test từ browser**

```
# Nếu không dùng Nginx:
http://222.252.23.248:3000

# Nếu dùng Nginx:
http://222.252.23.248
# hoặc
http://thuvienanh.com
```

### **6.3: Test các trang**

- ✅ Trang chủ: `/`
- ✅ Fabrics: `/fabrics`
- ✅ Fabric detail: `/fabrics/[id]`
- ✅ Collections: `/collections`
- ✅ Projects: `/projects`
- ✅ Events: `/events`
- ✅ API health: `/api/health`

---

## 🔄 BƯỚC 7: Update Code Sau Này

### **7.1: Pull latest code**

```bash
cd ~/apps/thuvienanh
git pull origin main
```

### **7.2: Rebuild và restart**

```bash
# Install new dependencies (nếu có)
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart thuvienanh

# Check logs
pm2 logs thuvienanh --lines 50
```

---

## 📊 BƯỚC 8: Monitoring

### **8.1: PM2 monitoring**

```bash
# Real-time monitoring
pm2 monit

# Logs
pm2 logs thuvienanh

# Status
pm2 status
```

### **8.2: Setup PM2 startup**

```bash
# Generate startup script
pm2 startup

# Copy và chạy command được suggest

# Save current processes
pm2 save
```

---

## 🐛 Troubleshooting

### **Lỗi: Port 3000 đã được sử dụng**

```bash
# Tìm process đang dùng port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Hoặc dùng port khác
# Edit .env: PORT=3001
```

### **Lỗi: Database connection failed**

```bash
# Test database connection
psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96

# Check PostgreSQL running
sudo systemctl status postgresql

# Check firewall
sudo ufw status
```

### **Lỗi: Module not found**

```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### **Lỗi: Permission denied**

```bash
# Fix permissions
chmod -R 755 ~/apps/thuvienanh
chown -R $USER:$USER ~/apps/thuvienanh
```

---

## 📝 Checklist

- [ ] SSH vào VPS
- [ ] Clone/pull code
- [ ] Install dependencies
- [ ] Tạo file .env
- [ ] Build production
- [ ] Stop processes cũ
- [ ] Start với PM2
- [ ] Save PM2 config
- [ ] Test local
- [ ] Test từ browser
- [ ] (Optional) Setup Nginx
- [ ] (Optional) Setup SSL
- [ ] Setup PM2 startup
- [ ] Test tất cả pages
- [ ] Monitor logs

---

## 🎉 Hoàn Tất!

Ứng dụng của bạn đã chạy trên VPS!

**Access:**
- Frontend: `http://222.252.23.248:3000`
- API: `http://222.252.23.248:3000/api/*`

**Next Steps:**
- Setup domain name
- Setup SSL certificate
- Setup monitoring/alerts
- Setup backup strategy

---

## 📚 Tài Liệu Tham Khảo

- Next.js Production: https://nextjs.org/docs/deployment
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- Nginx Configuration: https://nginx.org/en/docs/

---

**Chúc mừng! Bạn đã deploy thành công!** 🎊🚀

