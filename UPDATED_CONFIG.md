# ✅ CẬP NHẬT CẤU HÌNH MỚI

## 🔄 Đã cập nhật

### **Tailscale IP mới:**
- ❌ IP cũ: `100.101.50.87` (marketingpc)
- ✅ IP mới: `100.112.44.73` (nindev - Windows Server)

### **SSH Username:**
- ❌ Username cũ: `nihdev`
- ✅ Username mới: `Administrator`

---

## 📝 Files đã cập nhật

1. ✅ `.env`
   - `DATABASE_URL=postgresql://postgres:haininh1@100.112.44.73:5432/tva`
   - `POSTGRES_HOST=100.112.44.73`

2. ✅ `deploy-from-mac.sh`
   - `WINDOWS_IP="100.112.44.73"`
   - `WINDOWS_USER="Administrator"`

3. ✅ `check-production.sh`
   - `WINDOWS_IP="100.112.44.73"`
   - `WINDOWS_USER="Administrator"`

4. ✅ `sync-to-windows.sh`
   - `WINDOWS_IP="100.112.44.73"`
   - `WINDOWS_USER="Administrator"`

---

## 🚀 Sẵn sàng deploy

Bây giờ bạn có thể chạy:

```bash
# Kiểm tra kết nối
ping -c 3 100.112.44.73

# Test SSH
ssh Administrator@100.112.44.73 "echo OK"

# Deploy
./deploy-from-mac.sh
```

---

## 📊 Cấu hình hiện tại

```
MAC (macninh)
  IP: 100.75.210.49
  OS: macOS 15.71
      ↓
      ↓ Tailscale VPN
      ↓
WINDOWS SERVER (nindev)
  IP: 100.112.44.73
  OS: Windows Server
  SSH: Administrator@100.112.44.73
  PostgreSQL: localhost:5432/tva
  Project: D:\Projects\thuvienanh
```

---

**Đã sẵn sàng! Hãy chạy `./deploy-from-mac.sh` 🚀**

