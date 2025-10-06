# 🚀 Thư Viện Ảnh - Deployment Guide

## 📋 Tổng Quan

Dự án **Thư Viện Ảnh** (TVA) - Hệ thống quản lý vải, collections, projects và events.

**Tech Stack:**
- Frontend: Next.js 14 (App Router)
- Backend: Next.js API Routes
- Database: PostgreSQL
- Storage: Synology NAS (SMB/FileStation)
- Deployment: VPS Full Stack

---

## 🎯 Deployment Strategy

Sau khi đánh giá các options, chúng tôi đã chọn:

### ✅ **Full Stack VPS Deployment**

**Lý do:**
- ✅ Đơn giản, không cần split architecture
- ✅ Tất cả features hoạt động 100%
- ✅ Không cần CORS configuration
- ✅ Database access trực tiếp
- ✅ Full control
- ✅ Chi phí thấp (đã có VPS)

**Kiến trúc:**
```
VPS (222.252.23.248)
├── Next.js App (Frontend + API) - Port 3000
├── PostgreSQL Database - Port 5499
└── Synology NAS - Port 6868
```

---

## 📚 Documentation Files

### **Quick Start:**
- **`DEPLOY_VPS_QUICK_START.txt`** - Hướng dẫn nhanh (5 phút)

### **Detailed Guides:**
- **`DEPLOY_VPS_FULL_STACK.md`** - Hướng dẫn chi tiết đầy đủ
- **`VERCEL_DEPLOYMENT_STRATEGY.md`** - Tại sao không dùng Vercel
- **`VERCEL_ENV_SETUP.md`** - Vercel env vars (nếu cần sau này)

### **Scripts:**
- **`scripts/deploy-vps.sh`** - Script deploy tự động

---

## 🚀 Quick Deploy

### **Bước 1: SSH vào VPS**
```bash
ssh user@222.252.23.248
```

### **Bước 2: Clone code**
```bash
mkdir -p ~/apps/thuvienanh
cd ~/apps/thuvienanh
git clone https://github.com/hksdtp/thuvienanh.git .
```

### **Bước 3: Tạo .env**
```bash
nano .env
```

Paste:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:Demo1234@222.252.23.248:5499/Ninh96
POSTGRES_HOST=222.252.23.248
POSTGRES_PORT=5499
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=Ninh96
SYNOLOGY_HOST=222.252.23.248
SYNOLOGY_PORT=6868
SYNOLOGY_USERNAME=your_username
SYNOLOGY_PASSWORD=your_password
SMB_HOST=222.252.23.248
SMB_PORT=445
SMB_USERNAME=your_username
SMB_PASSWORD=your_password
SMB_SHARE=marketing
ALLOWED_ORIGIN=*
NEXT_PUBLIC_API_URL=http://222.252.23.248:3000
```

### **Bước 4: Deploy**
```bash
bash scripts/deploy-vps.sh
```

### **Bước 5: Access**
```
http://222.252.23.248:3000
```

---

## 📊 Monitoring

```bash
# Status
pm2 status

# Logs
pm2 logs thuvienanh

# Real-time monitoring
pm2 monit

# Restart
pm2 restart thuvienanh
```

---

## 🔄 Update Code

```bash
cd ~/apps/thuvienanh
git pull origin main
bash scripts/deploy-vps.sh
```

---

## 🌐 Optional: Setup Domain & SSL

### **1. Point domain to VPS**
```
A Record: @ → 222.252.23.248
A Record: www → 222.252.23.248
```

### **2. Setup Nginx**
See `DEPLOY_VPS_FULL_STACK.md` for Nginx configuration

### **3. Get SSL certificate**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 📝 Environment Variables

### **Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_*` - Database credentials
- `SYNOLOGY_*` - Synology NAS credentials
- `SMB_*` - SMB share credentials

### **Optional:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (production/development)
- `ALLOWED_ORIGIN` - CORS origin (default: *)

---

## 🏗️ Project Structure

```
thuvienanh/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Backend)
│   ├── fabrics/           # Fabrics pages
│   ├── collections/       # Collections pages
│   ├── projects/          # Projects pages
│   └── events/            # Events pages
├── components/            # React components
├── lib/                   # Utilities
│   ├── db.ts             # Database client
│   ├── synology.ts       # Synology integration
│   └── smbUpload.ts      # SMB upload
├── types/                 # TypeScript types
├── scripts/               # Deployment scripts
├── .env                   # Environment variables (not in git)
├── next.config.js         # Next.js config (VPS)
├── next.config.vercel.js  # Next.js config (Vercel - not used)
└── package.json           # Dependencies
```

---

## 🔐 Security Notes

### **DO NOT commit to Git:**
- ❌ `.env` file
- ❌ Database passwords
- ❌ Synology credentials
- ❌ SMB passwords
- ❌ API keys

### **Already in .gitignore:**
- ✅ `.env`
- ✅ `.env.local`
- ✅ `.env.production`
- ✅ `node_modules/`
- ✅ `.next/`

---

## 🐛 Troubleshooting

### **Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

### **Database connection failed:**
```bash
psql -h 222.252.23.248 -p 5499 -U postgres -d Ninh96
```

### **Build failed:**
```bash
rm -rf node_modules .next
npm install
npm run build
```

### **PM2 not starting:**
```bash
pm2 logs thuvienanh --lines 100
```

---

## 📞 Support

- **Documentation:** See `DEPLOY_VPS_FULL_STACK.md`
- **Quick Start:** See `DEPLOY_VPS_QUICK_START.txt`
- **Issues:** Check troubleshooting section

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] SSH access to VPS
- [ ] .env file created
- [ ] Dependencies installed
- [ ] Production build successful
- [ ] PM2 process running
- [ ] Health check passing
- [ ] Frontend accessible
- [ ] API endpoints working
- [ ] Database connected
- [ ] Synology integration working
- [ ] PM2 startup configured
- [ ] Monitoring setup

---

## 📈 Performance Tips

1. **Enable Nginx caching** for static assets
2. **Setup CDN** (Cloudflare) if needed
3. **Optimize images** before upload
4. **Monitor PM2 logs** regularly
5. **Setup database backups**

---

## 🔮 Future Enhancements

- [ ] Setup CI/CD pipeline
- [ ] Add automated tests
- [ ] Setup monitoring/alerts
- [ ] Add database backup automation
- [ ] Setup staging environment
- [ ] Add performance monitoring

---

## 📄 License

Private project - All rights reserved

---

## 👥 Team

- Developer: Ninh
- Repository: https://github.com/hksdtp/thuvienanh

---

**Last Updated:** 2025-10-06

**Deployment Status:** ✅ Ready for Production

