# 🚀 Quick Start - Deploy lên Windows 10 qua Tailscale

## ⚡ Cách nhanh nhất (3 bước)

### **Bước 1: Sync code từ Mac sang Windows**

```bash
# Trên Mac
cd /Users/nihdev/Web/thuvienanh
./sync-to-windows.sh
```

Chọn option `1` (Full sync) lần đầu tiên.

---

### **Bước 2: Chạy deploy script trên Windows**

**Cách A: Trực tiếp trên Windows**
```powershell
# Mở PowerShell as Administrator trên Windows
cd D:\Projects\thuvienanh
.\deploy-windows-tailscale.ps1
```

**Cách B: Remote từ Mac (nếu đã setup SSH)**
```bash
# Từ Mac
ssh nihdev@100.101.50.87 "cd /d/Projects/thuvienanh && powershell -File deploy-windows-tailscale.ps1"
```

---

### **Bước 3: Truy cập ứng dụng**

Từ Mac:
```
http://100.101.50.87:4000
```

Từ Windows:
```
http://localhost:4000
```

---

## 📋 Checklist trước khi deploy

### Trên Windows 10:
- [ ] Docker Desktop đã cài đặt và đang chạy
- [ ] Tailscale đang chạy (IP: 100.101.50.87)
- [ ] PostgreSQL đang chạy tại `D:\Ninh\pg\tva`
- [ ] Có thư mục `D:\Projects\thuvienanh`

### Trên Mac:
- [ ] Tailscale đang chạy
- [ ] Có thể ping được `100.101.50.87`
- [ ] Code đã được commit/save

---

## 🔧 Lệnh thường dùng

### Sync code
```bash
# Full sync
./sync-to-windows.sh  # Chọn option 1

# Quick sync (chỉ file thay đổi)
./sync-to-windows.sh  # Chọn option 2

# Sync deploy scripts
./sync-to-windows.sh  # Chọn option 4
```

### Quản lý Docker (trên Windows)
```powershell
# Xem trạng thái
docker-compose ps

# Xem logs
docker-compose logs -f fabric-library

# Restart
docker-compose restart fabric-library

# Stop
docker-compose stop

# Start lại
docker-compose start

# Rebuild
docker-compose up -d --build
```

### Update code và redeploy
```bash
# Trên Mac: Sync code mới
./sync-to-windows.sh

# Trên Windows: Rebuild và restart
docker-compose up -d --build
```

---

## 🌐 URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **App (từ Mac)** | http://100.101.50.87:4000 | - |
| **App (từ Windows)** | http://localhost:4000 | - |
| **pgAdmin** | http://100.101.50.87:5051 | admin@tva.com / Villad24@ |
| **PostgreSQL** | 100.101.50.87:5434 | postgres / haininh1 |

---

## 🐛 Troubleshooting nhanh

### Không sync được code
```bash
# Kiểm tra Tailscale
ping 100.101.50.87

# Kiểm tra SSH
ssh nihdev@100.101.50.87 "echo OK"
```

### Docker không chạy
```powershell
# Trên Windows
docker info

# Nếu lỗi, restart Docker Desktop
Restart-Service docker
```

### App không start
```powershell
# Xem logs
docker-compose logs -f fabric-library

# Kiểm tra database
docker exec tva-postgres pg_isready -U postgres
```

### Port bị chiếm
```powershell
# Tìm process đang dùng port 4000
netstat -ano | findstr :4000

# Kill process
taskkill /PID <PID> /F
```

---

## 📞 Cần giúp đỡ?

1. **Xem logs chi tiết:**
   ```powershell
   docker-compose logs -f
   ```

2. **Kiểm tra health:**
   ```powershell
   docker ps
   ```

3. **Restart tất cả:**
   ```powershell
   docker-compose restart
   ```

4. **Reset hoàn toàn:**
   ```powershell
   docker-compose down -v
   .\deploy-windows-tailscale.ps1 -Clean -Rebuild
   ```

---

## 🎯 Workflow hàng ngày

1. **Sáng:** Code trên Mac
2. **Chiều:** Sync lên Windows
   ```bash
   ./sync-to-windows.sh  # Option 2 (Quick sync)
   ```
3. **Test:** Truy cập http://100.101.50.87:4000
4. **Nếu cần rebuild:**
   ```powershell
   # Trên Windows
   docker-compose up -d --build
   ```

---

**Happy Coding! 🎉**

