# 🐳 DOCKER DEPLOYMENT GUIDE

## 📋 TỔNG QUAN

Deploy Next.js app lên VPS sử dụng Docker để:
- ✅ Isolated environment (không conflict dependencies)
- ✅ Dễ deploy, rollback, scale
- ✅ Consistent giữa dev và production
- ✅ Auto-restart khi crash
- ✅ Quản lý resources tốt hơn

---

## 🚀 QUICK START

### **Bước 1: Setup SSH Access**

Chạy script để copy SSH key lên VPS:

```bash
chmod +x scripts/setup-vps-access.sh
bash scripts/setup-vps-access.sh
```

**Script sẽ:**
- ✅ Copy SSH key lên VPS
- ✅ Kiểm tra Docker đã cài chưa
- ✅ Cài Docker nếu chưa có
- ✅ Kiểm tra app hiện tại

**Nhập password VPS khi được hỏi.**

---

### **Bước 2: Deploy với Docker**

```bash
chmod +x scripts/deploy-docker.sh
bash scripts/deploy-docker.sh
```

**Script sẽ:**
1. ✅ Kiểm tra SSH connection
2. ✅ Chuẩn bị VPS (tạo thư mục, cài Docker)
3. ✅ Copy code lên VPS
4. ✅ Build Docker image
5. ✅ Run container
6. ✅ Kiểm tra health

**Thời gian:** ~5-10 phút (lần đầu)

---

### **Bước 3: Verify Deployment**

```bash
# Check container status
ssh root@14.225.218.134 "docker ps"

# View logs
ssh root@14.225.218.134 "docker logs thuvienanh"

# Test API
curl http://14.225.218.134:3000/api/health
```

---

## 📁 FILES CREATED

### **1. Dockerfile**
Multi-stage build cho Next.js app:
- Stage 1: Install dependencies
- Stage 2: Build app
- Stage 3: Production runtime

### **2. docker-compose.production.yml**
Docker Compose config cho production:
- Environment variables
- Port mapping (3000:4000)
- Health checks
- Logging configuration

### **3. scripts/setup-vps-access.sh**
Setup SSH key và kiểm tra Docker

### **4. scripts/deploy-docker.sh**
Automated deployment script

---

## 🔧 MANUAL DEPLOYMENT

Nếu muốn deploy thủ công:

### **1. SSH vào VPS**
```bash
ssh root@14.225.218.134
```

### **2. Clone code**
```bash
mkdir -p ~/apps/thuvienanh
cd ~/apps/thuvienanh
git clone https://github.com/hksdtp/thuvienanh.git .
```

### **3. Build Docker image**
```bash
docker build -t thuvienanh:latest .
```

### **4. Run container**
```bash
docker run -d \
  --name thuvienanh \
  --restart unless-stopped \
  -p 3000:4000 \
  -e NODE_ENV=production \
  -e POSTGRES_HOST=222.252.23.248 \
  -e POSTGRES_PORT=5499 \
  -e POSTGRES_DB=Ninh96 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=Demo1234 \
  -e SYNOLOGY_BASE_URL=http://222.252.23.248:8888 \
  -e SYNOLOGY_ALTERNATIVE_URL=http://222.252.23.248:6868 \
  -e SYNOLOGY_USERNAME=haininh \
  -e SYNOLOGY_PASSWORD=Villad24@ \
  -e SMB_HOST=222.252.23.248 \
  -e SMB_SHARE=marketing \
  -e SMB_DOMAIN=WORKGROUP \
  -e SMB_USERNAME=haininh \
  -e SMB_PASSWORD=Villad24@ \
  -e SMB_PORT=445 \
  thuvienanh:latest
```

### **5. Check logs**
```bash
docker logs thuvienanh -f
```

---

## 🔍 DEBUGGING

### **View logs**
```bash
# Real-time logs
ssh root@14.225.218.134 "docker logs thuvienanh -f"

# Last 100 lines
ssh root@14.225.218.134 "docker logs thuvienanh --tail 100"

# Since 1 hour ago
ssh root@14.225.218.134 "docker logs thuvienanh --since 1h"
```

### **Shell access**
```bash
# Access container shell
ssh root@14.225.218.134 "docker exec -it thuvienanh sh"

# Run commands in container
ssh root@14.225.218.134 "docker exec thuvienanh ls -la"
ssh root@14.225.218.134 "docker exec thuvienanh env"
```

### **Check container stats**
```bash
# Resource usage
ssh root@14.225.218.134 "docker stats thuvienanh --no-stream"

# Container details
ssh root@14.225.218.134 "docker inspect thuvienanh"
```

---

## 🔄 COMMON OPERATIONS

### **Restart container**
```bash
ssh root@14.225.218.134 "docker restart thuvienanh"
```

### **Stop container**
```bash
ssh root@14.225.218.134 "docker stop thuvienanh"
```

### **Start container**
```bash
ssh root@14.225.218.134 "docker start thuvienanh"
```

### **Remove container**
```bash
ssh root@14.225.218.134 "docker stop thuvienanh && docker rm thuvienanh"
```

### **Rebuild and redeploy**
```bash
bash scripts/deploy-docker.sh
```

---

## 🆘 TROUBLESHOOTING

### **Container keeps restarting**

**Check logs:**
```bash
ssh root@14.225.218.134 "docker logs thuvienanh --tail 50"
```

**Common causes:**
- Database connection failed
- Missing environment variables
- Port already in use
- Build errors

**Fix:**
```bash
# Check if port 3000 is in use
ssh root@14.225.218.134 "netstat -tulpn | grep 3000"

# Kill process using port 3000
ssh root@14.225.218.134 "kill -9 \$(lsof -t -i:3000)"

# Restart container
ssh root@14.225.218.134 "docker restart thuvienanh"
```

### **Cannot connect to database**

**Test connection:**
```bash
ssh root@14.225.218.134 "docker exec thuvienanh nc -zv 222.252.23.248 5499"
```

**Check environment variables:**
```bash
ssh root@14.225.218.134 "docker exec thuvienanh env | grep POSTGRES"
```

### **Build failed**

**Check build logs:**
```bash
ssh root@14.225.218.134 "cd ~/apps/thuvienanh && docker build -t thuvienanh:latest . 2>&1 | tee build.log"
```

**Common fixes:**
```bash
# Clear Docker cache
ssh root@14.225.218.134 "docker system prune -a"

# Rebuild without cache
ssh root@14.225.218.134 "cd ~/apps/thuvienanh && docker build --no-cache -t thuvienanh:latest ."
```

---

## 📊 MONITORING

### **Health check**
```bash
# Manual health check
curl http://14.225.218.134:3000/api/health

# Via SSH
ssh root@14.225.218.134 "curl -s http://localhost:3000/api/health"
```

### **Container health**
```bash
ssh root@14.225.218.134 "docker inspect --format='{{.State.Health.Status}}' thuvienanh"
```

### **Resource usage**
```bash
ssh root@14.225.218.134 "docker stats thuvienanh --no-stream"
```

---

## 🔐 SECURITY

### **Best practices:**

1. **Use SSH key instead of password**
   ```bash
   bash scripts/setup-vps-access.sh
   ```

2. **Don't expose unnecessary ports**
   ```bash
   # Only expose port 3000
   -p 3000:4000
   ```

3. **Use environment variables for secrets**
   ```bash
   # Never hardcode passwords in Dockerfile
   -e POSTGRES_PASSWORD=Demo1234
   ```

4. **Regular updates**
   ```bash
   ssh root@14.225.218.134 "docker pull node:18-alpine"
   bash scripts/deploy-docker.sh
   ```

---

## 🎯 NEXT STEPS

### **1. Setup Domain & SSL**
- Point domain to VPS IP
- Setup Nginx reverse proxy
- Get SSL certificate with Let's Encrypt

### **2. Setup CI/CD**
- Auto-deploy on git push
- Run tests before deploy
- Slack/Discord notifications

### **3. Monitoring & Logging**
- Setup log aggregation (ELK, Loki)
- Setup monitoring (Prometheus, Grafana)
- Setup alerts

---

## 📞 SUPPORT

Nếu gặp vấn đề, cung cấp:

1. **Container logs:**
   ```bash
   ssh root@14.225.218.134 "docker logs thuvienanh --tail 100" > logs.txt
   ```

2. **Container status:**
   ```bash
   ssh root@14.225.218.134 "docker ps -a | grep thuvienanh"
   ```

3. **Environment variables:**
   ```bash
   ssh root@14.225.218.134 "docker exec thuvienanh env | grep -v PASSWORD"
   ```

