# 🚀 PM2 QUICK GUIDE - THƯ VIỆN ẢNH

## 📋 THÔNG TIN CƠ BẢN

- **Application Name:** thuvienanh
- **Port:** 4000
- **URL:** http://localhost:4000
- **Environment:** Production
- **Process Manager:** PM2

---

## ⚡ QUICK COMMANDS

### **Quản lý ứng dụng:**

```powershell
# Start application
pm2 start ecosystem.config.js

# Stop application
pm2 stop thuvienanh

# Restart application
pm2 restart thuvienanh

# Delete from PM2
pm2 delete thuvienanh
```

### **Monitoring:**

```powershell
# View status
pm2 status

# View logs (real-time)
pm2 logs thuvienanh

# View logs (last 100 lines)
pm2 logs thuvienanh --lines 100

# Monitoring dashboard
pm2 monit
```

### **Sử dụng script quản lý:**

```powershell
# Status
.\pm2-manage.ps1 status

# Restart
.\pm2-manage.ps1 restart

# Logs
.\pm2-manage.ps1 logs

# Monitoring
.\pm2-manage.ps1 monit
```

---

## 🔧 TROUBLESHOOTING

### **App không start:**

```powershell
# Check logs
pm2 logs thuvienanh --err

# Check PostgreSQL
Get-Service postgresql*

# Restart PostgreSQL
Restart-Service postgresql*
```

### **App bị crash:**

```powershell
# View error logs
pm2 logs thuvienanh --err --lines 50

# Restart app
pm2 restart thuvienanh

# Check memory
pm2 monit
```

### **Port 4000 đã được sử dụng:**

```powershell
# Find process using port 4000
netstat -ano | findstr :4000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Restart app
pm2 restart thuvienanh
```

---

## 📊 PM2 MONITORING

### **PM2 Monit (Terminal Dashboard):**

```powershell
pm2 monit
```

Hiển thị:
- CPU usage
- Memory usage
- Logs real-time
- Process status

### **PM2 Plus (Web Dashboard):**

1. Đăng ký tại: https://app.pm2.io/
2. Tạo bucket mới
3. Copy secret_key và public_key
4. Link PM2:
   ```powershell
   pm2 link <secret_key> <public_key>
   ```
5. Access: https://app.pm2.io/

---

## 🔄 AUTO-RESTART

PM2 đã được cấu hình để:
- ✅ Auto-restart khi app crash
- ✅ Auto-start khi Windows boot
- ✅ Restart nếu memory > 1GB
- ✅ Max 10 restarts trong 1 phút

---

## 📁 FILE LOCATIONS

- **Application:** D:\Ninh\thuvienanh
- **Logs:** D:\Ninh\thuvienanh\logs
- **PM2 Config:** D:\Ninh\thuvienanh\ecosystem.config.js
- **Environment:** D:\Ninh\thuvienanh\.env.production

---

## 🌐 ACCESS URLS

- **Local:** http://localhost:4000
- **LAN:** http://192.168.1.x:4000 (replace with your IP)
- **Tailscale:** http://100.101.50.87:4000 (after Tailscale setup)
- **Public:** https://thuvienanh.com (after Cloudflare Tunnel setup)

---

## 🆘 EMERGENCY COMMANDS

### **Complete restart:**

```powershell
pm2 delete thuvienanh
pm2 start ecosystem.config.js
pm2 save
```

### **Rebuild and restart:**

```powershell
npm run build
pm2 restart thuvienanh
```

### **Reset PM2:**

```powershell
pm2 kill
pm2 start ecosystem.config.js
pm2 save
```

---

## 📞 NEXT STEPS

Sau khi deploy thành công:

1. ✅ **Test application:** http://localhost:4000
2. ✅ **Setup Custom Domain:** Xem `SETUP_CUSTOM_DOMAIN_SSL.md`
3. ✅ **Setup Remote Development:** Xem `remote-dev-from-mac.sh`
4. ✅ **Configure Monitoring:** PM2 Plus hoặc PM2 Monit

---

**🎉 Chúc bạn sử dụng thành công!**

