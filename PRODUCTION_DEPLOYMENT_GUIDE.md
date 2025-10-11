# 🚀 Production Deployment Guide - Thư Viện Ảnh

## ⚠️ QUAN TRỌNG: Windows 10 + Docker cho Production

### **Đánh giá thực tế:**

**Docker trên Windows 10 TỐT HƠN native Windows** nhưng vẫn có limitations:

| Tiêu chí | Native Windows 10 | Docker on Windows 10 | VPS Linux | Đánh giá Production |
|----------|------------------|---------------------|-----------|-------------------|
| **Performance** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Docker tốt hơn 30% |
| **Concurrent Users** | Max 20 | Max 20* | Unlimited | *Windows limit vẫn còn |
| **Stability** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Docker stable hơn |
| **Resource Usage** | High | Medium-High | Low | Docker tốn RAM (WSL2) |
| **Production Ready** | ❌ | ⚠️ | ✅ | Chỉ cho small business |

### **Kết luận:** 
- Docker trên Windows 10 **CÓ THỂ** dùng cho production với <20 users đồng thời
- Phù hợp cho small business, internal tools
- KHÔNG phù hợp cho public website với traffic cao

---

## 📋 OPTION 1: Docker trên Windows 10 (Immediate Solution)

### **Yêu cầu:**
- Windows 10 Pro/Enterprise (64-bit) 
- RAM: 16GB minimum (Docker + WSL2 tốn ~4-6GB)
- CPU: 4+ cores với Virtualization enabled
- Disk: 100GB+ free space

### **Ưu điểm:**
✅ Isolation tốt hơn native Windows  
✅ Easy deployment & rollback  
✅ Container management  
✅ Better performance than native  

### **Nhược điểm:**
❌ Vẫn giới hạn 20 concurrent connections (Windows limit)  
❌ WSL2 overhead (~2-4GB RAM)  
❌ Cần restart Docker Desktop định kỳ  
❌ Windows Updates có thể break WSL2  

---

## 🚀 SETUP PRODUCTION với Docker Windows

### **Bước 1: Cài đặt Docker Desktop**

```powershell
# Run PowerShell as Administrator

# 1. Enable WSL2
wsl --install
wsl --set-default-version 2

# 2. Download & Install Docker Desktop
# https://www.docker.com/products/docker-desktop/

# 3. Configure Docker Desktop
# Settings > General > Use WSL 2 based engine ✅
# Settings > Resources > WSL Integration > Enable for default distro ✅
# Settings > Resources > Advanced > 
#   - CPUs: 4
#   - Memory: 8GB
#   - Swap: 2GB
#   - Disk: 60GB
```

### **Bước 2: Prepare Production Files**

Tạo file `.env.production`:
```env
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://postgres:Demo1234@host.docker.internal:5432/Ninh96
POSTGRES_HOST=host.docker.internal
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=Ninh96

# Synology NAS
SYNOLOGY_HOST=222.252.23.248
SYNOLOGY_PORT=6868
SYNOLOGY_USERNAME=haininh
SYNOLOGY_PASSWORD=Villad24@

# SMB Configuration
SMB_HOST=222.252.23.248
SMB_PORT=445
SMB_USERNAME=haininh
SMB_PASSWORD=Villad24@
SMB_SHARE=marketing

# CORS
ALLOWED_ORIGIN=*
```

### **Bước 3: Create Production Docker Compose**

Tạo file `docker-compose.prod.windows.yml`:
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: tva-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: Demo1234
      POSTGRES_DB: Ninh96
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d Ninh96"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tva-app
    restart: always
    ports:
      - "80:3000"     # Production port 80
      - "443:3000"    # HTTPS ready
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:Demo1234@postgres:5432/Ninh96
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: Demo1234
      POSTGRES_DB: Ninh96
      # Synology config from .env
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./public/uploads:/app/public/uploads
    networks:
      - tva-network

  # Nginx Reverse Proxy (Optional - Better performance)
  nginx:
    image: nginx:alpine
    container_name: tva-nginx
    restart: always
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    networks:
      - tva-network

volumes:
  postgres_data:

networks:
  tva-network:
    driver: bridge
```

### **Bước 4: Create Nginx Config (Optional but Recommended)**

Tạo file `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream nextjs {
        server app:3000;
    }

    server {
        listen 80;
        server_name localhost;
        
        client_max_body_size 100M;
        
        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
        
        # Cache static assets
        location /_next/static {
            proxy_pass http://nextjs;
            proxy_cache_valid 60m;
            add_header Cache-Control "public, max-age=3600";
        }
        
        location / {
            proxy_pass http://nextjs;
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
}
```

### **Bước 5: Deploy Script**

Tạo file `deploy-docker-windows.ps1`:
```powershell
# Production Deploy Script for Windows Docker
Write-Host "🚀 PRODUCTION DEPLOYMENT - THƯ VIỆN ẢNH" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Desktop not installed!" -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Check Docker running
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker Desktop detected" -ForegroundColor Green

# Pull latest code
Write-Host "📥 Pulling latest code..." -ForegroundColor Yellow
git pull origin main

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.windows.yml down

# Build and start
Write-Host "🔨 Building production image..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.windows.yml build --no-cache

Write-Host "🚀 Starting production services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.windows.yml up -d

# Wait for services
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check status
docker-compose -f docker-compose.prod.windows.yml ps

# Get IP addresses
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | Select-Object -First 1).IPAddress
$publicIP = (Invoke-RestMethod -Uri "https://api.ipify.org" -ErrorAction SilentlyContinue)

Write-Host ""
Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Local:    http://localhost" -ForegroundColor White
Write-Host "  LAN:      http://${localIP}" -ForegroundColor White
if ($publicIP) {
    Write-Host "  Public:   http://${publicIP}" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Configure port forwarding on router:" -ForegroundColor Yellow
    Write-Host "  Port 80 -> ${localIP}:80" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Monitor:" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker-compose.prod.windows.yml logs -f" -ForegroundColor White
Write-Host "  docker-compose -f docker-compose.prod.windows.yml ps" -ForegroundColor White
```

---

## 🎯 OPTION 2: Production VPS (RECOMMENDED)

### **Tại sao nên dùng VPS thay vì Windows 10?**
- ✅ No connection limits
- ✅ Better performance (3-5x faster)
- ✅ 99.9% uptime guarantee
- ✅ Professional support
- ✅ Automatic backups

### **Quick VPS Setup ($5-10/month)**

#### **A. Oracle Cloud Free Tier (FREE FOREVER)**
```bash
# 1. Sign up: https://www.oracle.com/cloud/free/
# 2. Create ARM instance (4 CPU, 24GB RAM FREE!)
# 3. SSH and run:
curl -o- https://raw.githubusercontent.com/yourusername/thuvienanh/main/scripts/deploy-vps.sh | bash
```

#### **B. DigitalOcean ($6/month)**
```bash
# 1. Create account: https://m.do.co/c/your-referral (get $200 credit)
# 2. Create Droplet: Ubuntu 22.04, $6/mo
# 3. SSH and deploy:
ssh root@your-droplet-ip
git clone https://github.com/yourusername/thuvienanh.git
cd thuvienanh
bash scripts/deploy-vps.sh
```

#### **C. Vultr ($5/month)**
```bash
# Similar to DigitalOcean
# Location Singapore for best latency in Vietnam
```

---

## 📊 PRODUCTION MONITORING

### **Docker Monitoring Commands**
```powershell
# View logs
docker-compose -f docker-compose.prod.windows.yml logs -f app

# Check resource usage
docker stats

# Health check
docker-compose -f docker-compose.prod.windows.yml ps

# Restart services
docker-compose -f docker-compose.prod.windows.yml restart

# Backup database
docker exec tva-postgres pg_dump -U postgres Ninh96 > backup_$(Get-Date -Format yyyyMMdd).sql
```

### **Setup Monitoring Dashboard**
```yaml
# Add to docker-compose.prod.windows.yml
portainer:
  image: portainer/portainer-ce:latest
  container_name: portainer
  restart: always
  ports:
    - "9000:9000"
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - portainer_data:/data
```

Access at: http://localhost:9000

---

## 🔒 SECURITY CHECKLIST

- [ ] Change default passwords
- [ ] Enable Windows Firewall
- [ ] Setup SSL certificate (Let's Encrypt)
- [ ] Configure fail2ban equivalent
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Update regularly

---

## ⚡ QUICK DECISION

### **Dùng ngay Windows 10 + Docker nếu:**
- Internal company tool
- <20 concurrent users
- Budget = 0
- Có sẵn máy Windows 24/7

### **Chuyển sang VPS nếu:**
- Public website
- >20 concurrent users  
- Cần uptime guarantee
- Budget $5-10/month OK

### **Hybrid approach (BEST):**
1. Start với Windows 10 + Docker (test)
2. Khi stable, deploy lên VPS production
3. Keep Windows as backup/staging

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Docker slow | Increase RAM allocation in Docker Desktop settings |
| Port 80 used | Change to 8080 or stop IIS |
| WSL2 error | Run `wsl --update` as Administrator |
| Connection refused | Check Windows Firewall, allow Docker |
| Database error | Check postgres container logs |

---

## 📞 Support Resources

1. **Docker Issues:** Check `docker logs container-name`
2. **Network Issues:** Verify port forwarding on router
3. **Performance:** Monitor with `docker stats`
4. **Backup:** Daily automated backups essential

**Ready to deploy? Choose your path:**
- 🪟 Windows + Docker: Run `.\deploy-docker-windows.ps1`
- ☁️ VPS Production: Follow VPS setup guide above
