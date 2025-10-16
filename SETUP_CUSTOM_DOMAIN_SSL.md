# 🌐 SETUP CUSTOM DOMAIN + SSL/HTTPS

## 📋 MỤC LỤC

1. [Option A: Cloudflare Tunnel (Khuyến nghị)](#option-a-cloudflare-tunnel)
2. [Option B: Traditional Port Forwarding + Let's Encrypt](#option-b-traditional-port-forwarding)
3. [Option C: Local Network Only](#option-c-local-network-only)

---

## 🏆 OPTION A: CLOUDFLARE TUNNEL (KHUYẾN NGHỊ)

### **Tại sao chọn Cloudflare Tunnel?**

✅ **Ưu điểm:**
- Free SSL/HTTPS tự động
- Không cần port forwarding
- Không cần IP tĩnh
- DDoS protection miễn phí
- Không expose port ra internet
- CDN tích hợp
- Analytics miễn phí

❌ **Nhược điểm:**
- Cần domain (có thể dùng free domain)
- Setup phức tạp hơn một chút

### **Bước 1: Chuẩn bị Domain**

**Option 1: Mua domain (Khuyến nghị)**
- Namecheap: ~$10/năm
- GoDaddy: ~$12/năm
- Porkbun: ~$8/năm

**Option 2: Free domain**
- Freenom: .tk, .ml, .ga, .cf, .gq (miễn phí)
- DuckDNS: subdomain.duckdns.org (miễn phí)

### **Bước 2: Add Domain vào Cloudflare**

1. Đăng ký tài khoản tại: https://dash.cloudflare.com/sign-up
2. Click "Add a Site"
3. Nhập domain của bạn (ví dụ: thuvienanh.com)
4. Chọn "Free Plan"
5. Cloudflare sẽ scan DNS records
6. Copy 2 nameservers mà Cloudflare cung cấp
7. Vào nhà cung cấp domain, đổi nameservers sang Cloudflare
8. Đợi 5-30 phút để DNS propagate

### **Bước 3: Install Cloudflare Tunnel trên Windows**

```powershell
# Run PowerShell as Administrator

# 1. Download cloudflared
$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
Invoke-WebRequest -Uri $url -OutFile "C:\cloudflared\cloudflared.exe"

# 2. Add to PATH
$env:Path += ";C:\cloudflared"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::Machine)

# 3. Login to Cloudflare
cd C:\cloudflared
.\cloudflared.exe tunnel login
# Browser sẽ mở, login và chọn domain

# 4. Create tunnel
.\cloudflared.exe tunnel create thuvienanh
# Lưu lại TUNNEL-ID được tạo

# 5. List tunnels để verify
.\cloudflared.exe tunnel list
```

### **Bước 4: Configure Tunnel**

```powershell
# Tạo file config.yml
$configPath = "$env:USERPROFILE\.cloudflared\config.yml"

$config = @"
tunnel: YOUR-TUNNEL-ID-HERE
credentials-file: $env:USERPROFILE\.cloudflared\YOUR-TUNNEL-ID.json

ingress:
  # Main application
  - hostname: thuvienanh.com
    service: http://localhost:80
  
  # Portainer (optional)
  - hostname: portainer.thuvienanh.com
    service: http://localhost:9000
  
  # Catch-all rule (required)
  - service: http_status:404
"@

$config | Out-File -FilePath $configPath -Encoding UTF8

# Replace YOUR-TUNNEL-ID-HERE với tunnel ID thực tế
```

### **Bước 5: Configure DNS trên Cloudflare**

```powershell
# Route DNS to tunnel
.\cloudflared.exe tunnel route dns thuvienanh thuvienanh.com
.\cloudflared.exe tunnel route dns thuvienanh portainer.thuvienanh.com
```

Hoặc thêm manual trên Cloudflare Dashboard:
1. Vào DNS settings
2. Add CNAME record:
   - Name: `@` (hoặc `www`)
   - Target: `YOUR-TUNNEL-ID.cfargotunnel.com`
   - Proxy status: Proxied (orange cloud)

### **Bước 6: Run Tunnel**

```powershell
# Test tunnel
.\cloudflared.exe tunnel run thuvienanh

# Nếu OK, install as Windows Service
.\cloudflared.exe service install

# Start service
.\cloudflared.exe service start

# Check status
Get-Service cloudflared
```

### **Bước 7: Configure Cloudflare Settings**

Vào Cloudflare Dashboard → SSL/TLS:

1. **SSL/TLS encryption mode:** Full (strict)
2. **Always Use HTTPS:** ON
3. **Automatic HTTPS Rewrites:** ON
4. **Minimum TLS Version:** 1.2

Vào Speed → Optimization:
1. **Auto Minify:** Check all (JavaScript, CSS, HTML)
2. **Brotli:** ON
3. **Rocket Loader:** ON (optional)

### **Bước 8: Test**

```bash
# Test từ bất kỳ đâu
curl https://thuvienanh.com

# Hoặc mở browser
open https://thuvienanh.com
```

✅ **Kết quả:** Website của bạn đã có HTTPS và accessible từ internet!

---

## 🔧 OPTION B: TRADITIONAL PORT FORWARDING + LET'S ENCRYPT

### **Yêu cầu:**
- IP tĩnh hoặc Dynamic DNS
- Access vào router để port forwarding
- Domain đã trỏ về IP public của bạn

### **Bước 1: Port Forwarding trên Router**

1. Login vào router (thường là 192.168.1.1)
2. Tìm "Port Forwarding" hoặc "Virtual Server"
3. Add rules:
   - Port 80 → 192.168.1.x:80 (HTTP)
   - Port 443 → 192.168.1.x:443 (HTTPS)

### **Bước 2: Dynamic DNS (nếu không có IP tĩnh)**

**Sử dụng No-IP:**
```powershell
# Download No-IP DUC
# https://www.noip.com/download

# Install và configure với hostname của bạn
# Ví dụ: thuvienanh.ddns.net
```

**Hoặc DuckDNS:**
```powershell
# Đăng ký tại: https://www.duckdns.org/
# Tạo subdomain: thuvienanh.duckdns.org

# Install DuckDNS updater
# Download từ: https://www.duckdns.org/install.jsp
```

### **Bước 3: Install Certbot cho Let's Encrypt**

```powershell
# Install Certbot
choco install certbot -y

# Stop Nginx/Docker để free port 80
docker-compose -f docker-compose.prod.windows.yml stop nginx

# Get certificate
certbot certonly --standalone -d thuvienanh.com -d www.thuvienanh.com

# Certificates sẽ ở:
# C:\Certbot\live\thuvienanh.com\fullchain.pem
# C:\Certbot\live\thuvienanh.com\privkey.pem
```

### **Bước 4: Configure Nginx với SSL**

Tạo file `nginx/nginx.prod.ssl.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name thuvienanh.com www.thuvienanh.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name thuvienanh.com www.thuvienanh.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;

        # Proxy to Next.js
        location / {
            proxy_pass http://app:4000;
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

### **Bước 5: Update Docker Compose**

Update `docker-compose.prod.windows.yml`:

```yaml
nginx:
  volumes:
    - ./nginx/nginx.prod.ssl.conf:/etc/nginx/nginx.conf:ro
    - C:/Certbot/live/thuvienanh.com:/etc/nginx/ssl:ro
```

### **Bước 6: Restart và Test**

```powershell
# Restart Docker
docker-compose -f docker-compose.prod.windows.yml up -d

# Test
curl https://thuvienanh.com
```

### **Bước 7: Auto-renew SSL Certificate**

```powershell
# Create scheduled task for renewal
$action = New-ScheduledTaskAction -Execute "certbot" -Argument "renew --quiet"
$trigger = New-ScheduledTaskTrigger -Daily -At 3am
Register-ScheduledTask -TaskName "Certbot Renew" -Action $action -Trigger $trigger -User "SYSTEM"
```

---

## 🏠 OPTION C: LOCAL NETWORK ONLY

### **Sử dụng Windows hosts file**

```powershell
# Edit hosts file
notepad C:\Windows\System32\drivers\etc\hosts

# Add line:
192.168.1.x    thuvienanh.local
```

### **Sử dụng mDNS (Bonjour)**

```powershell
# Install Bonjour
choco install bonjour -y

# Access via:
# http://COMPUTERNAME.local
```

### **Sử dụng Tailscale MagicDNS**

Tailscale tự động tạo DNS:
- `http://marketingpc.tail-scale.ts.net`
- Hoặc custom: `http://thuvienanh.tail-scale.ts.net`

---

## 📊 SO SÁNH CÁC OPTION

| Tiêu chí | Cloudflare Tunnel | Port Forwarding | Local Only |
|----------|------------------|-----------------|------------|
| **Setup Difficulty** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **Cost** | Free | Free | Free |
| **SSL/HTTPS** | ✅ Auto | ⚠️ Manual | ❌ |
| **Public Access** | ✅ Yes | ✅ Yes | ❌ No |
| **Security** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **DDoS Protection** | ✅ Yes | ❌ No | N/A |
| **CDN** | ✅ Yes | ❌ No | N/A |
| **Need Static IP** | ❌ No | ⚠️ Recommended | ❌ No |
| **Port Forwarding** | ❌ No | ✅ Required | ❌ No |

---

## 🎯 KHUYẾN NGHỊ

### **Cho Production Public Website:**
→ **Cloudflare Tunnel** (Option A)

### **Cho Internal/Company Network:**
→ **Tailscale + Local DNS** (Option C)

### **Cho Self-hosted Enthusiasts:**
→ **Port Forwarding + Let's Encrypt** (Option B)

---

## 🔍 TROUBLESHOOTING

### **Cloudflare Tunnel không connect:**
```powershell
# Check tunnel status
.\cloudflared.exe tunnel info thuvienanh

# Check service
Get-Service cloudflared

# View logs
.\cloudflared.exe tunnel run thuvienanh --loglevel debug
```

### **Let's Encrypt certificate failed:**
```powershell
# Check port 80 is accessible
Test-NetConnection -ComputerName yourdomain.com -Port 80

# Check DNS
nslookup yourdomain.com

# Retry with verbose
certbot certonly --standalone -d yourdomain.com --verbose
```

### **Port forwarding không hoạt động:**
```powershell
# Check Windows Firewall
Get-NetFirewallRule | Where-Object {$_.LocalPort -eq 80 -or $_.LocalPort -eq 443}

# Test from outside
# Sử dụng: https://www.yougetsignal.com/tools/open-ports/
```

---

## 📚 TÀI LIỆU THAM KHẢO

- Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- Let's Encrypt: https://letsencrypt.org/
- Certbot: https://certbot.eff.org/
- Tailscale: https://tailscale.com/kb/

---

**🎉 Chúc bạn setup thành công!**

