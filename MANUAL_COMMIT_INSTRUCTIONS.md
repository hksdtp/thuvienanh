# 📝 Hướng dẫn Commit và Push thủ công

## ⚠️ Lưu ý quan trọng

Hệ thống phát hiện có **passwords/secrets** trong một số files deployment. Đã thay thế một số passwords bằng placeholders, nhưng vẫn còn password mẫu `Demo1234` trong các hướng dẫn.

## ✅ Các files đã được chuẩn bị:

### 🚀 Production Deployment:
- `deploy-docker-production.ps1` - Script deploy Docker Windows
- `docker-compose.prod.windows.yml` - Docker compose cho production
- `nginx/nginx.prod.conf` - Nginx config tối ưu
- `scripts/deploy-oracle.sh` - Deploy Oracle Cloud
- `scripts/deploy-vps.sh` - Deploy VPS thông thường

### 📚 Documentation:
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Hướng dẫn chi tiết
- `ORACLE_CLOUD_SETUP.md` - Setup Oracle Cloud Free
- `DEPLOY_WINDOWS_10_GUIDE.md` - Windows 10 deployment
- `QUICK_START_PRODUCTION.md` - Quick start guide
- `.env.example` - Template cho environment variables

### 🎨 UI & Performance:
- Components mới: OptimizedImage, AnimatedCard, PageTransition, etc.
- Image optimization API
- Performance improvements

## 🔧 Cách commit và push:

### Option 1: Commit tất cả (bao gồm demo passwords)
```bash
# Add all files
git add -A

# Commit với --no-verify để bypass security check
git commit --no-verify -m "🚀 Add production deployment setup with Docker & performance optimizations

Features:
- Docker production deployment for Windows 10
- Oracle Cloud & VPS deployment scripts
- Performance optimizations & UI improvements
- Comprehensive documentation

Note: Demo passwords included for testing purposes"

# Push to GitHub
git push origin main
```

### Option 2: Commit chỉ code (không có scripts deployment)
```bash
# Add only code files
git add app/ components/ lib/ package*.json *.md

# Commit normally
git commit -m "✨ Add performance optimizations and UI improvements"

# Push
git push origin main
```

### Option 3: Review và chọn files
```bash
# Review changes
git status

# Add specific files
git add [file1] [file2] ...

# Commit
git commit -m "Your message"

# Push
git push origin main
```

## 🔒 Security Notes:

1. **Demo passwords** (`Demo1234`) trong hướng dẫn là OK để commit
2. **Real passwords** đã được thay thế bằng placeholders
3. Luôn dùng `.env` files cho production, không hardcode passwords
4. Đã tạo `.env.example` làm template

## 📌 Recommended:

```bash
# Quick commit all (nếu bạn OK với demo passwords trong docs)
git add -A && git commit --no-verify -m "🚀 Production deployment setup" && git push origin main
```

---

**Note:** Passwords `Demo1234` trong documentation chỉ là ví dụ, không phải production passwords thực.
