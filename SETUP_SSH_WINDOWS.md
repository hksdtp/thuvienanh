# 🔐 Setup SSH trên Windows 10

## Tại sao cần SSH?

SSH cho phép bạn:
- 🔄 Sync code từ Mac sang Windows tự động
- 🚀 Deploy remote từ Mac
- 📊 Quản lý Docker từ xa
- 💻 Không cần ngồi trước máy Windows

---

## 📋 Cài đặt OpenSSH Server trên Windows

### **Bước 1: Mở PowerShell as Administrator**

1. Nhấn `Windows + X`
2. Chọn **"Windows PowerShell (Admin)"** hoặc **"Terminal (Admin)"**

### **Bước 2: Cài đặt OpenSSH Server**

```powershell
# Kiểm tra xem đã cài chưa
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'

# Cài đặt OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Cài đặt OpenSSH Client (nếu chưa có)
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

### **Bước 3: Khởi động SSH Service**

```powershell
# Start SSH service
Start-Service sshd

# Set to start automatically
Set-Service -Name sshd -StartupType 'Automatic'

# Verify service is running
Get-Service sshd
```

### **Bước 4: Cấu hình Firewall**

```powershell
# Firewall rule should be created automatically, but verify:
Get-NetFirewallRule -Name *ssh*

# If not exists, create it:
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

### **Bước 5: Test SSH từ Windows**

```powershell
# Test SSH locally
ssh localhost

# Should prompt for password
# Type 'exit' to close
```

---

## 🔑 Setup Passwordless SSH (Khuyến nghị)

### **Trên Mac:**

```bash
# 1. Generate SSH key (nếu chưa có)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Nhấn Enter để chấp nhận vị trí mặc định (~/.ssh/id_rsa)
# Có thể để trống passphrase hoặc đặt password

# 2. Copy public key
cat ~/.ssh/id_rsa.pub
# Copy toàn bộ nội dung
```

### **Trên Windows:**

```powershell
# 1. Tạo thư mục .ssh (nếu chưa có)
New-Item -Path "$env:USERPROFILE\.ssh" -ItemType Directory -Force

# 2. Tạo file authorized_keys
New-Item -Path "$env:USERPROFILE\.ssh\authorized_keys" -ItemType File -Force

# 3. Mở Notepad để paste public key
notepad "$env:USERPROFILE\.ssh\authorized_keys"

# Paste nội dung public key từ Mac vào file này và Save

# 4. Set permissions
icacls "$env:USERPROFILE\.ssh\authorized_keys" /inheritance:r
icacls "$env:USERPROFILE\.ssh\authorized_keys" /grant:r "$env:USERNAME:R"
```

### **Hoặc dùng lệnh tự động từ Mac:**

```bash
# Copy SSH key to Windows (sẽ hỏi password)
ssh-copy-id nihdev@100.101.50.87

# Hoặc thủ công:
cat ~/.ssh/id_rsa.pub | ssh nihdev@100.101.50.87 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### **Test passwordless SSH:**

```bash
# Từ Mac
ssh nihdev@100.101.50.87

# Nếu không hỏi password = thành công!
```

---

## 🔧 Cấu hình SSH (Optional)

### **Trên Windows - Cho phép key authentication:**

```powershell
# Edit sshd_config
notepad C:\ProgramData\ssh\sshd_config

# Đảm bảo các dòng sau KHÔNG bị comment (#):
# PubkeyAuthentication yes
# AuthorizedKeysFile .ssh/authorized_keys

# Restart SSH service
Restart-Service sshd
```

### **Trên Mac - Tạo SSH config:**

```bash
# Tạo/edit SSH config
nano ~/.ssh/config

# Thêm vào:
Host windows-pc
    HostName 100.101.50.87
    User nihdev
    IdentityFile ~/.ssh/id_rsa
    ServerAliveInterval 60
    ServerAliveCountMax 3

# Save: Ctrl+O, Enter, Ctrl+X

# Bây giờ có thể SSH đơn giản:
ssh windows-pc
```

---

## ✅ Kiểm tra Setup

### **Từ Mac:**

```bash
# Test SSH connection
ssh nihdev@100.101.50.87 "echo 'SSH OK'"

# Test với hostname (nếu đã config)
ssh windows-pc "echo 'SSH OK'"

# Run Windows command
ssh nihdev@100.101.50.87 "powershell -Command 'Get-Date'"

# Check Docker
ssh nihdev@100.101.50.87 "docker --version"
```

---

## 🚀 Sử dụng SSH để Deploy

### **1. Sync code:**

```bash
# Từ Mac
./sync-to-windows.sh
```

### **2. Remote deploy:**

```bash
# Từ Mac
./remote-deploy.sh
```

### **3. Remote commands:**

```bash
# Check Docker status
ssh nihdev@100.101.50.87 "cd /d/Projects/thuvienanh && docker-compose ps"

# View logs
ssh nihdev@100.101.50.87 "cd /d/Projects/thuvienanh && docker-compose logs -f fabric-library"

# Restart app
ssh nihdev@100.101.50.87 "cd /d/Projects/thuvienanh && docker-compose restart fabric-library"
```

---

## 🐛 Troubleshooting

### **SSH connection refused:**

```powershell
# Trên Windows - Check service
Get-Service sshd

# Restart service
Restart-Service sshd

# Check firewall
Get-NetFirewallRule -Name *ssh*
```

### **Permission denied (publickey):**

```powershell
# Trên Windows - Check authorized_keys permissions
icacls "$env:USERPROFILE\.ssh\authorized_keys"

# Should show only your user with Read permission
# Fix permissions:
icacls "$env:USERPROFILE\.ssh\authorized_keys" /inheritance:r
icacls "$env:USERPROFILE\.ssh\authorized_keys" /grant:r "$env:USERNAME:R"

# Restart SSH
Restart-Service sshd
```

### **SSH works but asks for password:**

```powershell
# Check sshd_config
notepad C:\ProgramData\ssh\sshd_config

# Ensure these lines are uncommented:
# PubkeyAuthentication yes
# AuthorizedKeysFile .ssh/authorized_keys

# Check if administrators_authorized_keys exists (remove if yes)
Remove-Item C:\ProgramData\ssh\administrators_authorized_keys -ErrorAction SilentlyContinue

# Restart SSH
Restart-Service sshd
```

### **Can't find .ssh folder:**

```powershell
# Show hidden files
Get-ChildItem $env:USERPROFILE -Force | Where-Object Name -eq '.ssh'

# Create if not exists
New-Item -Path "$env:USERPROFILE\.ssh" -ItemType Directory -Force
```

---

## 📝 Quick Reference

### **Windows Commands:**

```powershell
# Start SSH
Start-Service sshd

# Stop SSH
Stop-Service sshd

# Restart SSH
Restart-Service sshd

# Check status
Get-Service sshd

# View SSH logs
Get-EventLog -LogName Application -Source OpenSSH -Newest 10
```

### **Mac Commands:**

```bash
# Test connection
ssh nihdev@100.101.50.87

# Copy file to Windows
scp file.txt nihdev@100.101.50.87:/d/Projects/

# Copy folder to Windows
scp -r folder/ nihdev@100.101.50.87:/d/Projects/

# Run remote command
ssh nihdev@100.101.50.87 "command"
```

---

## 🎯 Next Steps

Sau khi setup SSH xong:

1. ✅ Test SSH connection: `ssh nihdev@100.101.50.87`
2. ✅ Run connection check: `./check-windows-connection.sh`
3. ✅ Sync code: `./sync-to-windows.sh`
4. ✅ Deploy: `./remote-deploy.sh`

---

**Chúc bạn setup thành công! 🎉**

