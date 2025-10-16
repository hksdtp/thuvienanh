# ⚡ Quick Start: GitHub Actions CI/CD

## 🎯 Mục tiêu
Setup tự động deploy từ Mac → GitHub → Windows Server chỉ với 1 lệnh `git push`

---

## ✅ CHECKLIST - Làm theo thứ tự

### [ ] 1. Setup OpenSSH trên Windows Server (5 phút)

**Trên Windows Server, mở PowerShell as Administrator:**

```powershell
# Copy file setup-windows-ssh.ps1 từ Mac sang Windows
# Hoặc tải từ GitHub sau khi push

# Chạy script
Set-ExecutionPolicy Bypass -Scope Process -Force
.\setup-windows-ssh.ps1
```

**Kết quả mong đợi:**
```
✅ OpenSSH Server is already installed
✅ SSH service started
✅ SSH service set to auto-start
✅ Firewall rule created
✅ SSH service is running
```

---

### [ ] 2. Test SSH từ Mac (1 phút)

**Trên Mac Terminal:**

```bash
# Test SSH connection
ssh Administrator@100.112.44.73 "echo OK"

# Nếu hỏi password, nhập password Windows Server
# Nếu hỏi "Are you sure you want to continue connecting?", gõ "yes"
```

**Kết quả mong đợi:**
```
OK
```

✅ Nếu thấy "OK" → SSH hoạt động!  
❌ Nếu lỗi → Xem phần Troubleshooting bên dưới

---

### [ ] 3. Tạo GitHub Secrets (2 phút)

**Vào GitHub Repository:**

1. Mở: https://github.com/hksdtp/thuvienanh/settings/secrets/actions
2. Click **New repository secret**
3. Tạo 3 secrets:

| Name | Value |
|------|-------|
| `WINDOWS_HOST` | `100.112.44.73` |
| `WINDOWS_USER` | `Administrator` |
| `WINDOWS_PASSWORD` | `[Mật khẩu Windows của bạn]` |

⚠️ **Lưu ý:** Mật khẩu Windows Server, KHÔNG phải mật khẩu GitHub!

---

### [ ] 4. Push Workflow File (1 phút)

**Trên Mac Terminal:**

```bash
cd /Users/nihdev/Web/thuvienanh

# Kiểm tra file đã tạo
ls -la .github/workflows/deploy.yml

# Add và commit
git add .github/workflows/deploy.yml
git add GITHUB_ACTIONS_SETUP.md
git add QUICK_START_GITHUB_ACTIONS.md
git add setup-windows-ssh.ps1

git commit -m "feat: Add GitHub Actions CI/CD workflow"

# Push to GitHub
git push origin main
```

---

### [ ] 5. Xem Workflow Chạy (4-5 phút)

**Vào GitHub Actions:**

1. Mở: https://github.com/hksdtp/thuvienanh/actions
2. Click vào workflow run mới nhất (tên commit: "feat: Add GitHub Actions CI/CD workflow")
3. Click vào job "Build and Deploy"
4. Xem logs real-time

**Các step sẽ chạy:**
```
✅ 📥 Checkout code
✅ 🔧 Setup Node.js
✅ 📦 Install dependencies
✅ 🏗️ Build Next.js app
✅ 📦 Create deployment package
✅ 🚀 Upload to Windows Server
✅ 🎯 Deploy on Windows Server
✅ 🧪 Test deployment
✅ ✅ Deployment successful
```

---

### [ ] 6. Test Website (1 phút)

**Sau khi workflow chạy xong (màu xanh ✅):**

```bash
# Test health
curl https://thuvienanh.ninh.app/api/health

# Test database
curl https://thuvienanh.ninh.app/api/health/db

# Mở browser
open https://thuvienanh.ninh.app
```

**Test tạo album:**
1. Vào https://thuvienanh.ninh.app/albums/fabric
2. Click "Tạo album"
3. Nhập tên "Test GitHub Actions"
4. Click "Tạo Album"
5. ✅ Phải tạo thành công!

---

## 🎉 HOÀN THÀNH!

Từ giờ, workflow tự động:

```
Code trên Mac → git push → GitHub Actions → Windows Server → Live!
```

**Không cần:**
- ❌ SSH vào Windows
- ❌ Chạy deploy script manual
- ❌ Build trên Windows
- ❌ Lo lắng về deployment

**Chỉ cần:**
- ✅ Code trên Mac
- ✅ `git push`
- ✅ Đợi 4-5 phút
- ✅ Website live!

---

## 🔧 TROUBLESHOOTING

### Lỗi: SSH connection failed

**Kiểm tra:**

```bash
# 1. Test SSH
ssh Administrator@100.112.44.73 "echo OK"

# 2. Kiểm tra Tailscale
ping 100.112.44.73

# 3. Kiểm tra SSH service trên Windows
# (Chạy trên Windows PowerShell)
Get-Service sshd
```

**Giải pháp:**

```powershell
# Trên Windows PowerShell as Admin
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# Kiểm tra firewall
Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP"
```

---

### Lỗi: Build failed

**Kiểm tra:**

```bash
# Test build local
npm run build
```

**Giải pháp:**
- Fix lỗi code trên Mac
- Commit và push lại

---

### Lỗi: Deployment failed

**Kiểm tra logs:**

1. Vào GitHub Actions → Click workflow run → Xem logs
2. SSH vào Windows:
   ```bash
   ssh Administrator@100.112.44.73
   docker ps
   docker logs thuvienanh-app --tail 50
   ```

**Giải pháp:**
- Xem error message trong logs
- Fix issue
- Push lại

---

### Lỗi: Secrets not found

**Kiểm tra:**

1. Vào https://github.com/hksdtp/thuvienanh/settings/secrets/actions
2. Đảm bảo có 3 secrets:
   - WINDOWS_HOST
   - WINDOWS_USER
   - WINDOWS_PASSWORD

**Giải pháp:**
- Tạo lại secrets nếu thiếu
- Re-run workflow

---

## 📚 TÀI LIỆU THAM KHẢO

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SSH Action](https://github.com/appleboy/ssh-action)
- [SCP Action](https://github.com/appleboy/scp-action)

---

## 🎯 NEXT STEPS

### Tính năng nâng cao có thể thêm:

1. **Slack/Discord Notification**
   - Thông báo khi deploy thành công/thất bại

2. **Staging Environment**
   - Deploy branch `develop` → Staging server
   - Deploy branch `main` → Production server

3. **Rollback Automation**
   - Tự động rollback nếu health check fail

4. **Performance Testing**
   - Chạy Lighthouse CI sau mỗi deploy

5. **Database Migration**
   - Tự động chạy migration scripts

---

**Cần hỗ trợ?** Hỏi tôi bất cứ lúc nào! 🚀

