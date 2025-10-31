# 🔧 TROUBLESHOOTING: 502 Bad Gateway Error

## ❌ **VẤN ĐỀ**

**Error:** Bad gateway Error code 502  
**Time:** 2025-10-27 01:53:20 UTC  
**URL:** https://thuvienanh.ninh.app

**Nguyên nhân có thể:**
1. PM2 process crashed hoặc stopped
2. Next.js server không response
3. Database connection timeout
4. Tailscale VPN disconnected
5. Server out of memory/resources

---

## 🔍 **DIAGNOSTIC STEPS**

### **Step 1: Check Tailscale Connection**

```bash
# Check Tailscale status
tailscale status

# Expected output: Should show 100.115.191.19 as online
# If offline: Tailscale is disconnected
```

**If Tailscale is offline:**
```bash
# Restart Tailscale
sudo tailscale up

# Or on macOS
brew services restart tailscale
```

---

### **Step 2: Check Server Connectivity**

```bash
# Ping server
ping -c 3 100.115.191.19

# Expected: Should get replies
# If timeout: Server is unreachable via Tailscale
```

**If ping fails:**
- Check Tailscale connection (Step 1)
- Check if server is powered on
- Check network connectivity

---

### **Step 3: Check PM2 Status**

```bash
# SSH to server and check PM2
ssh nihdev@100.115.191.19 'pm2 status'

# Expected output:
# ┌─────┬──────────────┬─────────┬─────────┬─────────┐
# │ id  │ name         │ status  │ restart │ uptime  │
# ├─────┼──────────────┼─────────┼─────────┼─────────┤
# │ 0   │ thuvienanh   │ online  │ 0       │ 2h      │
# └─────┴──────────────┴─────────┴─────────┴─────────┘
```

**If status is "stopped" or "errored":**
```bash
# Restart PM2 process
ssh nihdev@100.115.191.19 'pm2 restart thuvienanh'

# Check logs
ssh nihdev@100.115.191.19 'pm2 logs thuvienanh --lines 50'
```

---

### **Step 4: Check Application Logs**

```bash
# View recent logs
ssh nihdev@100.115.191.19 'pm2 logs thuvienanh --lines 100 --nostream'

# Look for errors:
# - Database connection errors
# - Out of memory errors
# - Unhandled exceptions
# - Port binding errors
```

**Common errors and solutions:**

#### **Error: "ECONNREFUSED" (Database)**
```bash
# Check PostgreSQL status
ssh nihdev@100.115.191.19 'sudo systemctl status postgresql'

# Restart PostgreSQL if needed
ssh nihdev@100.115.191.19 'sudo systemctl restart postgresql'
```

#### **Error: "EADDRINUSE" (Port already in use)**
```bash
# Kill process on port 3000
ssh nihdev@100.115.191.19 'lsof -ti:3000 | xargs kill -9'

# Restart PM2
ssh nihdev@100.115.191.19 'pm2 restart thuvienanh'
```

#### **Error: "Out of memory"**
```bash
# Check memory usage
ssh nihdev@100.115.191.19 'free -h'

# Restart PM2 to free memory
ssh nihdev@100.115.191.19 'pm2 restart thuvienanh'
```

---

### **Step 5: Check Server Resources**

```bash
# Check disk space
ssh nihdev@100.115.191.19 'df -h'

# Check memory
ssh nihdev@100.115.191.19 'free -h'

# Check CPU
ssh nihdev@100.115.191.19 'top -bn1 | head -20'
```

**If disk is full:**
```bash
# Clean up logs
ssh nihdev@100.115.191.19 'pm2 flush'

# Clean up old builds
ssh nihdev@100.115.191.19 'cd ~/projects/thuvienanh && rm -rf .next'
```

---

## 🚀 **QUICK FIX COMMANDS**

### **Option 1: Restart PM2 Process**
```bash
ssh nihdev@100.115.191.19 'pm2 restart thuvienanh && pm2 logs thuvienanh --lines 20'
```

### **Option 2: Full Restart**
```bash
ssh nihdev@100.115.191.19 'cd ~/projects/thuvienanh && pm2 stop thuvienanh && pm2 start ecosystem.config.js && pm2 logs thuvienanh --lines 20'
```

### **Option 3: Rebuild & Restart**
```bash
ssh nihdev@100.115.191.19 'cd ~/projects/thuvienanh && npm run build && pm2 restart thuvienanh'
```

### **Option 4: Nuclear Option (Full Reset)**
```bash
ssh nihdev@100.115.191.19 'cd ~/projects/thuvienanh && pm2 delete thuvienanh && rm -rf .next && npm run build && pm2 start ecosystem.config.js'
```

---

## 🔧 **MANUAL TROUBLESHOOTING**

### **If SSH doesn't work:**

1. **Check Tailscale on local machine:**
   ```bash
   tailscale status
   # Should show 100.115.191.19 as online
   ```

2. **Restart Tailscale:**
   ```bash
   # macOS
   brew services restart tailscale
   
   # Linux
   sudo systemctl restart tailscaled
   ```

3. **Try alternative connection:**
   - Use server's public IP (if available)
   - Use VNC/console access
   - Contact hosting provider

---

### **If PM2 is running but app still 502:**

1. **Check if app is listening on correct port:**
   ```bash
   ssh nihdev@100.115.191.19 'netstat -tlnp | grep 3000'
   # Should show: tcp ... 0.0.0.0:3000 ... LISTEN
   ```

2. **Test app directly:**
   ```bash
   ssh nihdev@100.115.191.19 'curl -I http://localhost:3000'
   # Should return: HTTP/1.1 200 OK
   ```

3. **Check nginx/reverse proxy:**
   ```bash
   ssh nihdev@100.115.191.19 'sudo systemctl status nginx'
   ssh nihdev@100.115.191.19 'sudo nginx -t'
   ```

---

## 📊 **MONITORING COMMANDS**

### **Real-time Monitoring:**
```bash
# Watch PM2 status
ssh nihdev@100.115.191.19 'pm2 monit'

# Watch logs in real-time
ssh nihdev@100.115.191.19 'pm2 logs thuvienanh'

# Watch system resources
ssh nihdev@100.115.191.19 'htop'
```

### **Health Check:**
```bash
# Check if app responds
curl -I https://thuvienanh.ninh.app

# Check API endpoint
curl https://thuvienanh.ninh.app/api/health

# Check database connection
curl https://thuvienanh.ninh.app/api/admin/optimize-database
```

---

## 🎯 **RECOMMENDED ACTIONS**

### **Immediate (Do this first):**

1. **Check Tailscale:**
   ```bash
   tailscale status
   ```

2. **Restart PM2:**
   ```bash
   ssh nihdev@100.115.191.19 'pm2 restart thuvienanh'
   ```

3. **Check logs:**
   ```bash
   ssh nihdev@100.115.191.19 'pm2 logs thuvienanh --lines 50'
   ```

4. **Verify site is up:**
   ```bash
   curl -I https://thuvienanh.ninh.app
   ```

---

### **If still not working:**

1. **Full restart:**
   ```bash
   ssh nihdev@100.115.191.19 'pm2 stop thuvienanh && pm2 start ecosystem.config.js'
   ```

2. **Check database:**
   ```bash
   ssh nihdev@100.115.191.19 'sudo systemctl status postgresql'
   ```

3. **Rebuild app:**
   ```bash
   ssh nihdev@100.115.191.19 'cd ~/projects/thuvienanh && npm run build && pm2 restart thuvienanh'
   ```

---

## 📝 **COMMON SCENARIOS**

### **Scenario 1: Database Optimization Caused Crash**

**Symptoms:**
- 502 error after running database optimization
- PM2 shows "errored" status
- Logs show database connection errors

**Solution:**
```bash
# Restart PostgreSQL
ssh nihdev@100.115.191.19 'sudo systemctl restart postgresql'

# Wait 10 seconds
sleep 10

# Restart app
ssh nihdev@100.115.191.19 'pm2 restart thuvienanh'
```

---

### **Scenario 2: Out of Memory**

**Symptoms:**
- 502 error intermittently
- PM2 shows high memory usage
- Server is slow

**Solution:**
```bash
# Restart PM2 to free memory
ssh nihdev@100.115.191.19 'pm2 restart thuvienanh'

# Check memory
ssh nihdev@100.115.191.19 'free -h'

# If still high, restart server
ssh nihdev@100.115.191.19 'sudo reboot'
```

---

### **Scenario 3: Tailscale Disconnected**

**Symptoms:**
- Cannot SSH to server
- Ping timeout
- Tailscale status shows offline

**Solution:**
```bash
# Restart Tailscale on local machine
brew services restart tailscale

# Wait 10 seconds
sleep 10

# Check status
tailscale status

# Try SSH again
ssh nihdev@100.115.191.19 'pm2 status'
```

---

## ✅ **VERIFICATION**

After fixing, verify everything works:

```bash
# 1. Check PM2 status
ssh nihdev@100.115.191.19 'pm2 status'
# Expected: status = "online"

# 2. Check app responds
curl -I https://thuvienanh.ninh.app
# Expected: HTTP/1.1 200 OK

# 3. Check API works
curl https://thuvienanh.ninh.app/api/fabrics
# Expected: JSON response with fabrics

# 4. Check database works
curl https://thuvienanh.ninh.app/api/admin/optimize-database
# Expected: JSON response with indexes

# 5. Open in browser
open https://thuvienanh.ninh.app
# Expected: Site loads correctly
```

---

## 🆘 **IF NOTHING WORKS**

### **Last Resort Options:**

1. **Contact hosting provider:**
   - Check if server is online
   - Check for network issues
   - Check for hardware problems

2. **Restore from backup:**
   - Deploy from local machine
   - Restore database from backup
   - Rebuild from scratch

3. **Deploy fresh:**
   ```bash
   # From local machine
   rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next' \
     . nihdev@100.115.191.19:~/projects/thuvienanh/
   
   ssh nihdev@100.115.191.19 'cd ~/projects/thuvienanh && \
     npm install && \
     npm run build && \
     pm2 restart thuvienanh'
   ```

---

## 📞 **SUPPORT CHECKLIST**

When asking for help, provide:

- [ ] Tailscale status output
- [ ] PM2 status output
- [ ] PM2 logs (last 100 lines)
- [ ] Server resource usage (free -h, df -h)
- [ ] Error message from browser
- [ ] Time when error started
- [ ] What was done before error occurred

---

**Created:** 2025-10-27  
**Status:** Troubleshooting guide for 502 errors  
**Next:** Follow diagnostic steps above

