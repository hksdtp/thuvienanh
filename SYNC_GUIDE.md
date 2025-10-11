# 🔄 Hướng dẫn đồng bộ code Mac ↔ Windows qua Tailscale

## 📋 Thông tin cấu hình

- **Mac (máy code chính):** 100.82.243.45 (nguyens-macbook-pro)
- **Windows (máy nhận code):** 100.101.50.87 (marketingpc)
- **Windows Username:** Marketingpc
- **Windows Password:** haininh1
- **Đường dẫn code trên Windows:** D:\Ninh\thuvienanh

---

## 🚀 Cách sử dụng nhanh

### Lần đầu tiên - Setup SSH Key (chỉ làm 1 lần)

```bash
./setup-ssh-key.sh
```

Nhập password Windows khi được hỏi: `haininh1`

### Đồng bộ code hàng ngày

**Cách 1: Script đầy đủ (khuyến nghị)**
```bash
./auto-pull.sh
```
- Hỏi commit message
- Kiểm tra kỹ trước khi push
- Hiển thị tiến trình chi tiết

**Cách 2: Script nhanh**
```bash
./quick-sync.sh "Thêm tính năng mới"
```
- Tự động commit và push ngay
- Không hỏi gì cả
- Nhanh gọn

---

## 📁 Các file script

### 1. `setup-ssh-key.sh` - Setup lần đầu
Tạo SSH key và copy sang Windows để không cần nhập password mỗi lần.

**Chạy:**
```bash
./setup-ssh-key.sh
```

### 2. `auto-pull.sh` - Đồng bộ đầy đủ
Script đầy đủ với kiểm tra và xác nhận.

**Chạy:**
```bash
./auto-pull.sh
```

**Tính năng:**
- ✅ Kiểm tra thay đổi trước khi commit
- ✅ Hỏi commit message
- ✅ Kiểm tra kết nối SSH
- ✅ Push lên GitHub
- ✅ Pull trên Windows
- ✅ Tự động npm install
- ✅ Xử lý lỗi tốt

### 3. `quick-sync.sh` - Đồng bộ nhanh
Script nhanh gọn cho việc đồng bộ thường xuyên.

**Chạy:**
```bash
./quick-sync.sh "commit message"
```

**Tính năng:**
- ⚡ Tự động add tất cả file
- ⚡ Commit với message
- ⚡ Push và pull ngay lập tức
- ⚡ Không hỏi gì cả

---

## 🔧 Yêu cầu trên Windows

### 1. Cài đặt SSH Server

Mở **PowerShell as Administrator** và chạy:

```powershell
# Cài SSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Khởi động SSH
Start-Service sshd

# Tự động chạy khi khởi động
Set-Service -Name sshd -StartupType 'Automatic'

# Mở firewall
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

### 2. Kiểm tra SSH đang chạy

```powershell
Get-Service sshd
```

Phải thấy: `Status: Running`

### 3. Đảm bảo Git đã cài trên Windows

```powershell
git --version
```

Nếu chưa có, tải tại: https://git-scm.com/download/win

### 4. Clone repository trên Windows (nếu chưa có)

```powershell
cd D:\Ninh
git clone https://github.com/hksdtp/thuvienanh.git
```

---

## 🧪 Test kết nối

### Test từ Mac

```bash
# Test Tailscale
tailscale status

# Test SSH (sau khi setup SSH key)
ssh Marketingpc@100.101.50.87 "echo 'Connected!'"

# Test Git trên Windows
ssh Marketingpc@100.101.50.87 "cd /d/Ninh/thuvienanh && git status"
```

---

## 🎯 Workflow hàng ngày

### Kịch bản 1: Code trên Mac, chạy trên Windows

```bash
# 1. Code trên Mac như bình thường
# 2. Khi muốn test trên Windows:
./quick-sync.sh "Update feature X"

# 3. Trên Windows, web app sẽ tự động reload (nếu đang chạy npm run dev)
```

### Kịch bản 2: Cần kiểm tra kỹ trước khi đồng bộ

```bash
# 1. Xem thay đổi
git status

# 2. Chạy script đầy đủ
./auto-pull.sh

# 3. Script sẽ hỏi và xác nhận từng bước
```

---

## 🔍 Troubleshooting

### Lỗi: "Permission denied (publickey)"

**Nguyên nhân:** SSH key chưa được setup

**Giải pháp:**
```bash
./setup-ssh-key.sh
```

### Lỗi: "Connection refused"

**Nguyên nhân:** SSH Server chưa chạy trên Windows

**Giải pháp:** Chạy PowerShell as Admin trên Windows:
```powershell
Start-Service sshd
```

### Lỗi: "No such file or directory: /d/Ninh/thuvienanh"

**Nguyên nhân:** Chưa clone repository trên Windows

**Giải pháp:** Trên Windows:
```powershell
cd D:\Ninh
git clone https://github.com/hksdtp/thuvienanh.git
```

### Lỗi: Git pull conflict

**Giải pháp:** SSH vào Windows và xử lý:
```bash
ssh Marketingpc@100.101.50.87
cd /d/Ninh/thuvienanh
git status
git stash  # Lưu thay đổi tạm thời
git pull
git stash pop  # Lấy lại thay đổi
```

---

## 💡 Tips

### 1. Tạo alias để gọi nhanh hơn

Thêm vào `~/.zshrc` hoặc `~/.bashrc`:

```bash
alias sync='cd /Users/nihdev/Web/thuvienanh && ./quick-sync.sh'
alias syncfull='cd /Users/nihdev/Web/thuvienanh && ./auto-pull.sh'
```

Sau đó reload:
```bash
source ~/.zshrc
```

Giờ chỉ cần gõ:
```bash
sync "Update code"
```

### 2. Tự động chạy web app trên Windows sau khi pull

Sửa file `quick-sync.sh`, thêm vào cuối:

```bash
ssh $WINDOWS_USER@$WINDOWS_IP "cd $WINDOWS_PATH && npm run dev &"
```

### 3. Xem log real-time từ Windows

```bash
ssh Marketingpc@100.101.50.87 "cd /d/Ninh/thuvienanh && tail -f nohup.out"
```

---

## 📊 So sánh các phương pháp

| Phương pháp | Tốc độ | Tự động | Kiểm tra | Khuyến nghị |
|-------------|--------|---------|----------|-------------|
| `auto-pull.sh` | Chậm | Không | Có | Lần đầu, thay đổi lớn |
| `quick-sync.sh` | Nhanh | Có | Không | Hàng ngày |
| Manual Git | Chậm nhất | Không | Có | Khi cần kiểm soát tối đa |

---

## ❓ FAQ

**Q: Tôi có cần push lên GitHub không?**
A: Có, vì Tailscale chỉ tạo mạng riêng, không đồng bộ code tự động.

**Q: Tôi có thể code trực tiếp trên Windows qua SSH không?**
A: Có, nhưng không khuyến nghị. Tốt hơn là code trên Mac và đồng bộ sang.

**Q: Script có hoạt động khi không có internet không?**
A: Không, vì cần push/pull qua GitHub. Nhưng Tailscale vẫn hoạt động offline.

**Q: Tôi có thể đồng bộ ngược từ Windows về Mac không?**
A: Có, chỉ cần commit và push trên Windows, sau đó pull trên Mac.

---

## 🔐 Bảo mật

- ✅ SSH key được mã hóa
- ✅ Tailscale sử dụng WireGuard encryption
- ✅ Password không được lưu trong script
- ⚠️ Không commit file chứa password lên GitHub

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Tailscale đang chạy: `tailscale status`
2. SSH Server đang chạy trên Windows
3. Git repository đã được clone trên Windows
4. SSH key đã được setup: `ssh Marketingpc@100.101.50.87 "echo test"`

