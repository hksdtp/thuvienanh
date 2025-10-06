# 🔐 Vercel Environment Variables Setup

## 📋 Tổng Quan

Dự án **thuvienanh** sử dụng **Hybrid Deployment**:
- **Frontend**: Vercel (static export)
- **Backend**: VPS (API + Database)

Do đó, chỉ cần **1 biến môi trường** trên Vercel.

---

## ✅ Biến Môi Trường Cần Thiết

### **1. NEXT_PUBLIC_API_URL** (BẮT BUỘC)

**Mục đích:** URL của backend API để frontend gọi

**Giá trị:**
```
http://222.252.23.248:4000
```

**Hoặc nếu có domain:**
```
https://api.your-domain.com
```

**Lưu ý:**
- ✅ Prefix `NEXT_PUBLIC_` để client-side access được
- ✅ Không có trailing slash `/`
- ✅ Phải là URL public (accessible từ internet)

---

## 🚀 Cách Setup Trên Vercel

### **Method 1: Qua Dashboard (Khuyến nghị)**

#### **Bước 1: Truy cập Settings**

1. Vào: https://vercel.com/hksdtps-projects/thuvienanh
2. Click tab **"Settings"**
3. Click **"Environment Variables"** ở sidebar

#### **Bước 2: Add Variable**

1. Click button **"Add New"**
2. Điền thông tin:
   ```
   Key:   NEXT_PUBLIC_API_URL
   Value: http://222.252.23.248:4000
   ```
3. Chọn **Environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Click **"Save"**

#### **Bước 3: Redeploy**

1. Vào tab **"Deployments"**
2. Tìm deployment mới nhất
3. Click **"..."** (3 dots)
4. Click **"Redeploy"**
5. Chờ ~2-3 phút

---

### **Method 2: Qua CLI**

```bash
# 1. Install Vercel CLI (nếu chưa có)
npm install -g vercel

# 2. Login
vercel login

# 3. Link project
cd /Users/ninh/Webapp/TVA
vercel link

# 4. Add environment variable
vercel env add NEXT_PUBLIC_API_URL production

# Khi được hỏi value, nhập:
# http://222.252.23.248:4000

# 5. Add cho preview
vercel env add NEXT_PUBLIC_API_URL preview

# 6. Add cho development
vercel env add NEXT_PUBLIC_API_URL development

# 7. Redeploy
vercel --prod
```

---

## 📝 Kiểm Tra Sau Khi Setup

### **1. Verify trên Dashboard**

1. Vào: https://vercel.com/hksdtps-projects/thuvienanh/settings/environment-variables
2. Kiểm tra có variable:
   ```
   NEXT_PUBLIC_API_URL = http://222.252.23.248:4000
   ```
3. Kiểm tra đã chọn đủ 3 environments

### **2. Test sau khi deploy**

1. Mở frontend: https://thuvienanh.vercel.app
2. Mở DevTools (F12) > Console
3. Chạy:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_URL)
   // Phải hiển thị: http://222.252.23.248:4000
   ```

### **3. Test API call**

```javascript
// Trong browser console
fetch('http://222.252.23.248:4000/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// Kết quả mong đợi:
// { status: "healthy", ... }
```

---

## ⚠️ Lưu Ý Quan Trọng

### **1. CORS Configuration**

Backend (VPS) phải cho phép Vercel domain:

**File `.env` trên VPS:**
```bash
ALLOWED_ORIGIN=https://thuvienanh.vercel.app
```

**Restart backend sau khi update:**
```bash
# Nếu dùng npm run dev
Ctrl+C
npm run dev

# Nếu dùng PM2
pm2 restart thuvienanh-api
```

### **2. Không Commit Sensitive Data**

❌ **KHÔNG BAO GIỜ** commit các biến sau vào Git:
- Database passwords
- API keys
- Synology credentials
- SMB passwords

✅ Các biến này chỉ cần trên VPS, không cần trên Vercel

### **3. Public vs Private Variables**

**Public (NEXT_PUBLIC_*):**
- ✅ Có thể expose ra client-side
- ✅ Visible trong browser
- ✅ Ví dụ: API URLs, public keys

**Private (không prefix):**
- ❌ Không dùng trong static export
- ❌ Chỉ dùng khi có server-side code
- ❌ Ví dụ: Database passwords, API secrets

---

## 🔄 Update Environment Variables

### **Khi nào cần update?**

1. **Thay đổi VPS IP/domain**
2. **Thay đổi backend port**
3. **Setup custom domain cho backend**

### **Cách update:**

1. Vào Vercel Dashboard > Settings > Environment Variables
2. Click **"Edit"** trên variable cần update
3. Nhập value mới
4. Click **"Save"**
5. **Redeploy** để apply changes

---

## 🎯 Checklist Setup

- [ ] Add `NEXT_PUBLIC_API_URL` trên Vercel
- [ ] Chọn đủ 3 environments (Production, Preview, Development)
- [ ] Redeploy sau khi add
- [ ] Verify variable trong browser console
- [ ] Test API call từ frontend
- [ ] Update `ALLOWED_ORIGIN` trên VPS
- [ ] Restart backend trên VPS
- [ ] Test CORS không bị block

---

## 🐛 Troubleshooting

### **Lỗi: API call bị CORS blocked**

**Nguyên nhân:** Backend chưa cho phép Vercel domain

**Giải pháp:**
```bash
# Trên VPS, edit .env
nano .env

# Thêm/sửa dòng:
ALLOWED_ORIGIN=https://thuvienanh.vercel.app

# Save và restart
pm2 restart thuvienanh-api
```

### **Lỗi: process.env.NEXT_PUBLIC_API_URL is undefined**

**Nguyên nhân:** Variable chưa được set hoặc chưa redeploy

**Giải pháp:**
1. Kiểm tra variable đã add chưa
2. Redeploy lại
3. Clear browser cache

### **Lỗi: API returns 404**

**Nguyên nhân:** URL sai hoặc backend không chạy

**Giải pháp:**
```bash
# Test backend trực tiếp
curl http://222.252.23.248:4000/api/health

# Nếu không response, check backend
ssh user@222.252.23.248
pm2 status
pm2 logs thuvienanh-api
```

---

## 📚 Tài Liệu Tham Khảo

- **Vercel Env Vars:** https://vercel.com/docs/environment-variables
- **Next.js Env Vars:** https://nextjs.org/docs/basic-features/environment-variables
- **Project Setup:** `HYBRID_DEPLOYMENT_QUICK_START.md`
- **Full Docs:** `docs/HYBRID_DEPLOYMENT_VERCEL_VPS.md`

---

## 💡 Tips

1. **Dùng domain thay vì IP:**
   ```
   NEXT_PUBLIC_API_URL=https://api.thuvienanh.com
   ```
   - Professional hơn
   - SSL miễn phí với Let's Encrypt
   - Dễ nhớ hơn

2. **Test local trước:**
   ```bash
   # File .env.local
   NEXT_PUBLIC_API_URL=http://localhost:4000
   
   # Test
   npm run dev
   ```

3. **Monitor logs:**
   ```bash
   # Vercel logs
   vercel logs
   
   # VPS logs
   pm2 logs thuvienanh-api
   ```

---

## 🎉 Kết Luận

Chỉ cần **1 biến môi trường** trên Vercel:
```
NEXT_PUBLIC_API_URL=http://222.252.23.248:4000
```

Đơn giản, dễ maintain, và hoạt động hoàn hảo với hybrid deployment! 🚀

