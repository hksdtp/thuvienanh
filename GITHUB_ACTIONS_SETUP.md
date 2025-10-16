# 🚀 GitHub Actions CI/CD Setup Guide

## BƯỚC 1: Tạo GitHub Secrets ⚙️

### 1.1. Vào GitHub Repository Settings
1. Mở repository: https://github.com/hksdtp/thuvienanh
2. Click **Settings** (tab trên cùng)
3. Sidebar bên trái → Click **Secrets and variables** → **Actions**
4. Click nút **New repository secret**

### 1.2. Thêm 3 Secrets sau:

#### Secret 1: WINDOWS_HOST
```
Name: WINDOWS_HOST
Value: 100.112.44.73
```
Click **Add secret**

#### Secret 2: WINDOWS_USER
```
Name: WINDOWS_USER
Value: Administrator
```
Click **Add secret**

#### Secret 3: WINDOWS_PASSWORD
```
Name: WINDOWS_PASSWORD
Value: [Mật khẩu Windows Server của bạn]
```
⚠️ **LƯU Ý:** Đây là mật khẩu đăng nhập Windows Server, KHÔNG phải mật khẩu GitHub!

Click **Add secret**

### 1.3. Kiểm tra Secrets đã tạo
Sau khi tạo xong, bạn sẽ thấy 3 secrets:
- ✅ WINDOWS_HOST
- ✅ WINDOWS_USER  
- ✅ WINDOWS_PASSWORD

---

## BƯỚC 2: Commit và Push Workflow File 📤

### 2.1. Kiểm tra file đã tạo
```bash
ls -la .github/workflows/deploy.yml
```

### 2.2. Commit và push
```bash
git add .github/workflows/deploy.yml
git commit -m "feat: Add GitHub Actions CI/CD workflow"
git push origin main
```

---

## BƯỚC 3: Kiểm tra Workflow đang chạy 👀

### 3.1. Vào GitHub Actions tab
1. Mở repository: https://github.com/hksdtp/thuvienanh
2. Click tab **Actions** (trên cùng)
3. Bạn sẽ thấy workflow "Deploy to Windows Server" đang chạy

### 3.2. Xem logs real-time
1. Click vào workflow run (tên commit)
2. Click vào job "Build and Deploy"
3. Xem từng step đang chạy

### 3.3. Các step sẽ chạy:
- ✅ Checkout code
- ✅ Setup Node.js
- ✅ Install dependencies
- ✅ Build Next.js app
- ✅ Create deployment package
- ✅ Upload to Windows Server
- ✅ Deploy on Windows Server
- ✅ Test deployment
- ✅ Deployment successful

---

## BƯỚC 4: Test Deployment 🧪

### 4.1. Sau khi workflow chạy xong (màu xanh ✅)

Kiểm tra website:
```bash
# Health check
curl https://thuvienanh.ninh.app/api/health

# Database check
curl https://thuvienanh.ninh.app/api/health/db

# Mở browser
open https://thuvienanh.ninh.app
```

### 4.2. Test tạo album
1. Vào https://thuvienanh.ninh.app/albums/fabric
2. Click "Tạo album"
3. Nhập tên "Test GitHub Actions"
4. Click "Tạo Album"
5. ✅ Phải tạo thành công!

---

## BƯỚC 5: Workflow Tự Động 🤖

### 5.1. Từ giờ, mỗi khi bạn push code:

```bash
# 1. Code trên Mac với Augment
# 2. Commit changes
git add .
git commit -m "feat: Add new feature"

# 3. Push to GitHub
git push origin main

# 4. GitHub Actions tự động:
#    - Build Next.js app
#    - Upload to Windows Server
#    - Deploy Docker container
#    - Test deployment
#    - Notify kết quả
```

### 5.2. Không cần SSH vào Windows nữa! 🎉

Workflow tự động làm tất cả:
- ✅ Build
- ✅ Upload
- ✅ Deploy
- ✅ Test
- ✅ Rollback nếu lỗi

---

## BƯỚC 6: Chạy Manual Deploy (Không cần push code) 🎮

### 6.1. Vào GitHub Actions
1. Mở https://github.com/hksdtp/thuvienanh/actions
2. Click workflow "Deploy to Windows Server"
3. Click nút **Run workflow** (bên phải)
4. Chọn branch: **main**
5. Click **Run workflow**

### 6.2. Workflow sẽ chạy ngay lập tức
Không cần push code, chỉ cần click button!

---

## TROUBLESHOOTING 🔧

### Lỗi: SSH connection failed
**Nguyên nhân:** Secrets chưa đúng hoặc Windows Server không cho phép SSH

**Giải pháp:**
1. Kiểm tra secrets đã nhập đúng chưa
2. Test SSH từ Mac:
   ```bash
   ssh Administrator@100.112.44.73
   ```
3. Nếu không kết nối được, cần cài OpenSSH trên Windows:
   ```powershell
   # Chạy trên Windows Server (PowerShell as Admin)
   Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
   Start-Service sshd
   Set-Service -Name sshd -StartupType 'Automatic'
   ```

### Lỗi: Build failed
**Nguyên nhân:** Dependencies hoặc code có lỗi

**Giải pháp:**
1. Test build local trước:
   ```bash
   npm run build
   ```
2. Fix lỗi trên Mac
3. Push lại

### Lỗi: Deployment failed
**Nguyên nhân:** Docker hoặc Windows Server có vấn đề

**Giải pháp:**
1. Xem logs trong GitHub Actions
2. SSH vào Windows Server kiểm tra:
   ```bash
   ssh Administrator@100.112.44.73
   docker ps
   docker logs thuvienanh-app
   ```

---

## ADVANCED: Thêm Slack/Discord Notification 📢

### Thêm vào cuối file `.github/workflows/deploy.yml`:

```yaml
      # Notify to Slack/Discord
      - name: 📢 Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to Windows Server'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

Sau đó thêm secret `SLACK_WEBHOOK` vào GitHub.

---

## SUMMARY 📋

### Workflow hiện tại:
```
Mac (Code) → Git Push → GitHub Actions → Windows Server → Production
     ↓                        ↓                  ↓              ↓
  Augment              Build + Test         Deploy         Live Site
```

### Ưu điểm:
- ✅ **Tự động 100%** - Push là deploy
- ✅ **Có logs** - Xem được từng step
- ✅ **Rollback dễ** - Revert commit là rollback
- ✅ **Test tự động** - Fail thì không deploy
- ✅ **Không cần SSH** - GitHub Actions làm hết

### Thời gian deploy:
- Build: ~2-3 phút
- Upload: ~30 giây
- Deploy: ~1 phút
- **Tổng: ~4-5 phút** từ push đến live

---

## NEXT STEPS 🎯

1. ✅ Tạo GitHub Secrets (BƯỚC 1)
2. ✅ Push workflow file (BƯỚC 2)
3. ✅ Xem workflow chạy (BƯỚC 3)
4. ✅ Test deployment (BƯỚC 4)
5. 🎉 Enjoy auto deployment!

---

**Có câu hỏi?** Hỏi tôi bất cứ lúc nào! 🚀

