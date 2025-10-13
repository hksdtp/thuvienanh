# 🚀 QUICK START - DEPLOYMENT GUIDE

## 📋 TÓM TẮT NHANH

Bạn có **4 yêu cầu chính:**
1. ✅ Deploy production trên Windows với auto-start
2. ✅ Custom domain + SSL/HTTPS
3. ✅ Remote development từ Mac
4. ✅ So sánh Docker vs PM2

**Giải pháp đề xuất:** DOCKER COMPOSE + TAILSCALE + CLOUDFLARE TUNNEL

---

## ⚡ OPTION 1: DOCKER (KHUYẾN NGHỊ)

### **Yêu cầu:**
- Windows 10 Pro/Enterprise
- RAM: 16GB minimum
- Docker Desktop installed

### **Deploy trong 3 bước:**

```powershell
# Bước 1: Run PowerShell as Administrator
cd D:\Ninh\thuvienanh

# Bước 2: Deploy với Docker
.\deploy-production-complete.ps1 -UseDocker

# Bước 3: Verify
docker-compose -f docker-compose.local-db.yml ps
```

**Kết quả:**
- ✅ App chạy tại: http://localhost:80
- ✅ Portainer UI: http://localhost:9000
- ✅ Auto-restart khi Windows reboot
- ✅ PostgreSQL local được sử dụng

---

## ⚡ OPTION 2: PM2 (NẾU RAM <16GB)

### **Deploy trong 3 bước:**

```powershell
# Bước 1: Run PowerShell as Administrator
cd D:\Ninh\thuvienanh

# Bước 2: Deploy với PM2
.\deploy-production-complete.ps1 -UsePM2

# Bước 3: Verify
pm2 status
```

**Kết quả:**
- ✅ App chạy tại: http://localhost:4000
- ✅ PM2 monitoring: pm2 monit
- ✅ Auto-restart khi Windows reboot

---

## 🌐 SETUP CUSTOM DOMAIN + SSL

### **Option A: Cloudflare Tunnel (Khuyến nghị - Free SSL)**

```powershell
# 1. Download cloudflared
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "C:\cloudflared\cloudflared.exe"

# 2. Login
C:\cloudflared\cloudflared.exe tunnel login

# 3. Create tunnel
C:\cloudflared\cloudflared.exe tunnel create thuvienanh

# 4. Configure (edit config.yml)
# See SETUP_CUSTOM_DOMAIN_SSL.md for details

# 5. Install as service
C:\cloudflared\cloudflared.exe service install
C:\cloudflared\cloudflared.exe service start
```

**Kết quả:**
- ✅ Access: https://thuvienanh.com
- ✅ Free SSL/HTTPS
- ✅ No port forwarding needed
- ✅ DDoS protection

**Chi tiết:** Xem file `SETUP_CUSTOM_DOMAIN_SSL.md`

---

## 💻 REMOTE DEVELOPMENT TỪ MAC

### **Setup trong 5 phút:**

```bash
# Trên Mac, chạy script tự động
cd /path/to/thuvienanh
chmod +x remote-dev-from-mac.sh
./remote-dev-from-mac.sh
```

**Script sẽ tự động:**
1. ✅ Install Tailscale
2. ✅ Configure SSH
3. ✅ Setup VS Code Remote
4. ✅ Create management aliases
5. ✅ Test connection

### **Sau khi setup, bạn có thể:**

```bash
# SSH vào Windows
tva-ssh

# Mở VS Code Remote
tva-code

# Deploy code mới
tva-deploy

# Xem logs
tva-logs

# Restart app
tva-restart

# Backup database
tva-backup
```

**Chi tiết:** Xem file `COMPREHENSIVE_DEPLOYMENT_PLAN.md`

---

## 📊 SO SÁNH DOCKER VS PM2

| Tiêu chí | Docker | PM2 |
|----------|--------|-----|
| **Setup Time** | 15-30 phút | 5-10 phút |
| **RAM Required** | 16GB | 8GB |
| **Production Ready** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **SSL/HTTPS** | ✅ Built-in | ⚠️ Manual |
| **Monitoring** | Portainer UI | PM2 UI |
| **Rollback** | ✅ Easy | ⚠️ Manual |
| **Isolation** | ✅ Excellent | ❌ None |

**Kết luận:**
- **Docker:** Tốt nhất cho production, cần 16GB RAM
- **PM2:** Nhẹ hơn, đủ dùng cho <20 users

**Chi tiết:** Xem file `DOCKER_VS_PM2_COMPARISON.md`

---

## 🎯 WORKFLOW HOÀN CHỈNH

### **1. Development trên Mac:**

```bash
# Connect VS Code Remote
tva-code

# Edit code, test, commit
git add .
git commit -m "feat: new feature"
git push origin main
```

### **2. Deploy to Production:**

```bash
# Option A: Từ Mac
tva-deploy

# Option B: Trên Windows
cd D:\Ninh\thuvienanh
git pull
docker-compose -f docker-compose.local-db.yml up -d --build
```

### **3. Monitor:**

```bash
# Logs
tva-logs

# Status
tva-status

# Portainer UI
open http://100.101.50.87:9000
```

### **4. Access:**

```
Local:    http://localhost
Tailscale: http://100.101.50.87
Public:    https://thuvienanh.com
```

---

## 📁 FILES QUAN TRỌNG

| File | Mục đích |
|------|----------|
| `deploy-production-complete.ps1` | Script deploy tự động (Windows) |
| `remote-dev-from-mac.sh` | Setup remote dev (Mac) |
| `docker-compose.local-db.yml` | Docker config với PostgreSQL local |
| `COMPREHENSIVE_DEPLOYMENT_PLAN.md` | Hướng dẫn chi tiết đầy đủ |
| `SETUP_CUSTOM_DOMAIN_SSL.md` | Hướng dẫn domain + SSL |
| `DOCKER_VS_PM2_COMPARISON.md` | So sánh chi tiết |

---

## 🔧 TROUBLESHOOTING

### **Docker không start:**
```powershell
# Check Docker Desktop
Get-Service docker

# Restart Docker Desktop
Restart-Service docker

# Check WSL2
wsl --status
```

### **PostgreSQL connection failed:**
```powershell
# Check PostgreSQL service
Get-Service postgresql*

# Test connection
psql -U postgres -d tva -c "SELECT 1;"
```

### **Tailscale không connect:**
```bash
# On Mac
sudo tailscale up

# On Windows
tailscale up

# Check status
tailscale status
```

### **SSH connection refused:**
```powershell
# On Windows, check SSH service
Get-Service sshd

# Start SSH
Start-Service sshd

# Check firewall
Get-NetFirewallRule -Name sshd
```

---

## 📚 NEXT STEPS

### **Sau khi deploy thành công:**

1. **Setup Monitoring:**
   - [ ] Configure Portainer alerts
   - [ ] Setup uptime monitoring (UptimeRobot)
   - [ ] Configure log aggregation

2. **Security:**
   - [ ] Change default passwords
   - [ ] Configure firewall rules
   - [ ] Setup fail2ban (if using SSH publicly)
   - [ ] Enable 2FA for Portainer

3. **Backup:**
   - [ ] Configure automated database backup
   - [ ] Setup offsite backup (Google Drive, Dropbox)
   - [ ] Test restore procedure

4. **Performance:**
   - [ ] Enable Cloudflare caching
   - [ ] Configure CDN for static assets
   - [ ] Optimize database queries
   - [ ] Setup Redis cache (optional)

5. **Documentation:**
   - [ ] Document deployment process
   - [ ] Create runbook for common issues
   - [ ] Train team members

---

## 🆘 SUPPORT

### **Nếu gặp vấn đề:**

1. **Check logs:**
   ```bash
   # Docker
   docker-compose -f docker-compose.local-db.yml logs -f app
   
   # PM2
   pm2 logs thuvienanh
   ```

2. **Check status:**
   ```bash
   # Docker
   docker-compose -f docker-compose.local-db.yml ps
   
   # PM2
   pm2 status
   ```

3. **Restart:**
   ```bash
   # Docker
   docker-compose -f docker-compose.local-db.yml restart app
   
   # PM2
   pm2 restart thuvienanh
   ```

4. **Check resources:**
   ```powershell
   # RAM usage
   Get-Process | Sort-Object -Property WS -Descending | Select-Object -First 10
   
   # Disk space
   Get-PSDrive C
   ```

---

## ✅ CHECKLIST DEPLOYMENT

### **Pre-deployment:**
- [ ] Windows 10 Pro/Enterprise (for Docker)
- [ ] 16GB RAM (for Docker) or 8GB (for PM2)
- [ ] PostgreSQL 16 installed và running
- [ ] Database 'tva' đã tạo
- [ ] Git installed
- [ ] Node.js 18+ installed

### **Deployment:**
- [ ] Code pulled from GitHub
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Docker/PM2 deployed successfully
- [ ] Application accessible

### **Post-deployment:**
- [ ] Custom domain configured
- [ ] SSL/HTTPS working
- [ ] Auto-start configured
- [ ] Remote access from Mac working
- [ ] Monitoring setup
- [ ] Backup configured

---

## 🎉 READY TO DEPLOY?

### **Chọn phương án của bạn:**

**Option 1: Docker (Full Production)**
```powershell
cd D:\Ninh\thuvienanh
.\deploy-production-complete.ps1 -UseDocker -SetupRemote
```

**Option 2: PM2 (Lightweight)**
```powershell
cd D:\Ninh\thuvienanh
.\deploy-production-complete.ps1 -UsePM2 -SetupRemote
```

**Option 3: Manual Step-by-step**
→ Xem `COMPREHENSIVE_DEPLOYMENT_PLAN.md`

---

**🚀 Chúc bạn deploy thành công!**

Nếu cần hỗ trợ, tham khảo các file hướng dẫn chi tiết hoặc check troubleshooting section.

