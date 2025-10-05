# Docker Deployment Guide - Fabric Library

## 📋 Tổng quan

Webapp Fabric Library đã được containerize thành công với Docker và có thể chạy độc lập trên bất kỳ môi trường nào có Docker.

## 🚀 Khởi động nhanh

### 1. Build và chạy với Docker Compose

```bash
# Build và khởi động container
docker-compose up --build -d

# Kiểm tra container đang chạy
docker ps | grep fabric-library

# Xem logs
docker logs tva-fabric-library-1 -f

# Dừng container
docker-compose down
```

### 2. Truy cập webapp

- **URL**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health
- **SMB Health**: http://localhost:4000/api/health/smb

## 📁 Cấu trúc Files

### Dockerfile
- **Base Image**: node:18-alpine
- **Build Strategy**: Multi-stage build (deps → builder → runner)
- **Output Mode**: Standalone (tối ưu cho production)
- **Port**: 4000

### docker-compose.yml
- **Service Name**: fabric-library
- **Network**: fabric-library-network
- **Restart Policy**: unless-stopped
- **Health Check**: Kiểm tra `/api/health` mỗi 30s

### Environment Variables
Các biến môi trường được cấu hình trong `docker-compose.yml`:

```yaml
- NODE_ENV=production
- NEXT_TELEMETRY_DISABLED=1
- SYNOLOGY_BASE_URL=http://222.252.23.248:8888
- SYNOLOGY_ALTERNATIVE_URL=http://222.252.23.248:6868
- SYNOLOGY_USERNAME=haininh
- SYNOLOGY_PASSWORD=Villad24@
- SMB_HOST=222.252.23.248
- SMB_SHARE=marketing
- SMB_DOMAIN=WORKGROUP
- SMB_USERNAME=haininh
- SMB_PASSWORD=Villad24@
- SMB_PORT=445
```

## 🔧 Các lệnh Docker hữu ích

### Quản lý Container

```bash
# Khởi động container
docker-compose up -d

# Dừng container
docker-compose down

# Restart container
docker-compose restart

# Xem logs real-time
docker logs tva-fabric-library-1 -f

# Xem logs 100 dòng cuối
docker logs tva-fabric-library-1 --tail 100

# Vào shell của container
docker exec -it tva-fabric-library-1 sh
```

### Build và Clean

```bash
# Build lại image
docker-compose build

# Build không dùng cache
docker-compose build --no-cache

# Xóa container và network
docker-compose down

# Xóa container, network và volumes
docker-compose down -v

# Xóa images cũ
docker image prune -a
```

### Kiểm tra trạng thái

```bash
# Xem tất cả containers
docker ps -a

# Xem resource usage
docker stats tva-fabric-library-1

# Kiểm tra health
docker inspect tva-fabric-library-1 | grep -A 10 Health
```

## 🐛 Troubleshooting

### Container không khởi động

```bash
# Xem logs để tìm lỗi
docker logs tva-fabric-library-1

# Kiểm tra port có bị chiếm không
lsof -i :4000

# Rebuild từ đầu
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Lỗi kết nối Synology/SMB

```bash
# Kiểm tra network connectivity từ container
docker exec -it tva-fabric-library-1 sh
ping 222.252.23.248

# Test SMB health endpoint
curl http://localhost:4000/api/health/smb
```

### Lỗi build

```bash
# Xem build logs chi tiết
docker-compose build --progress=plain

# Kiểm tra Dockerfile syntax
docker build -t test-build .
```

## 📊 Monitoring

### Health Checks

Container có health check tự động:
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3
- **Start Period**: 40s

```bash
# Kiểm tra health status
docker inspect tva-fabric-library-1 --format='{{.State.Health.Status}}'
```

### Logs

```bash
# Xem logs theo thời gian
docker logs tva-fabric-library-1 --since 1h

# Xem logs với timestamp
docker logs tva-fabric-library-1 -t

# Export logs ra file
docker logs tva-fabric-library-1 > app.log 2>&1
```

## 🔐 Security Notes

⚠️ **Lưu ý bảo mật:**
- Passwords đang được hardcode trong `docker-compose.yml`
- Nên sử dụng `.env` file hoặc Docker secrets cho production
- Không commit passwords vào Git

### Sử dụng .env file (Recommended)

1. Tạo file `.env`:
```bash
SYNOLOGY_USERNAME=haininh
SYNOLOGY_PASSWORD=Villad24@
SMB_USERNAME=haininh
SMB_PASSWORD=Villad24@
```

2. Cập nhật `docker-compose.yml`:
```yaml
environment:
  - SYNOLOGY_USERNAME=${SYNOLOGY_USERNAME}
  - SYNOLOGY_PASSWORD=${SYNOLOGY_PASSWORD}
  - SMB_USERNAME=${SMB_USERNAME}
  - SMB_PASSWORD=${SMB_PASSWORD}
```

## 🚢 Production Deployment

### Deploy lên VPS/Server

```bash
# 1. Copy files lên server
scp -r . user@server:/path/to/app

# 2. SSH vào server
ssh user@server

# 3. Build và chạy
cd /path/to/app
docker-compose up --build -d

# 4. Kiểm tra
docker ps
curl http://localhost:4000/api/health
```

### Sử dụng Docker Registry

```bash
# 1. Tag image
docker tag tva-fabric-library:latest your-registry/fabric-library:latest

# 2. Push lên registry
docker push your-registry/fabric-library:latest

# 3. Pull và chạy trên server khác
docker pull your-registry/fabric-library:latest
docker run -d -p 4000:4000 your-registry/fabric-library:latest
```

## 📝 Changelog

### Version 1.0.0 (2025-09-30)
- ✅ Initial Docker setup
- ✅ Multi-stage build optimization
- ✅ Environment variables configuration
- ✅ Health check implementation
- ✅ SMB integration support
- ✅ Synology API integration
- ✅ Production-ready standalone build

## 🎯 Next Steps

1. **Setup CI/CD**: Tự động build và deploy khi có code mới
2. **Add Docker Secrets**: Bảo mật passwords
3. **Setup Nginx**: Reverse proxy và SSL
4. **Add Monitoring**: Prometheus + Grafana
5. **Setup Backup**: Tự động backup database và uploads

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Docker logs: `docker logs tva-fabric-library-1`
2. Health endpoint: `curl http://localhost:4000/api/health`
3. Container status: `docker ps -a`
4. Network connectivity: `docker exec -it tva-fabric-library-1 ping 222.252.23.248`

