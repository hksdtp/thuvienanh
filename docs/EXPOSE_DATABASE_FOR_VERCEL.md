# 🌐 Hướng Dẫn Expose Database Hiện Tại Cho Vercel

## 📋 Tổng Quan

Bạn muốn giữ nguyên PostgreSQL database tại `222.252.23.248:5499` và cho Vercel kết nối được.

**3 giải pháp:**
1. ✅ **Expose qua Public IP** (đơn giản, có rủi ro)
2. ✅ **Sử dụng Cloudflare Tunnel** (an toàn hơn, miễn phí)
3. ✅ **Sử dụng Ngrok/Tailscale** (dễ setup, có giới hạn)

---

## 🚀 **Option 1: Expose Database qua Public IP**

### **Bước 1: Kiểm tra Public IP**

```bash
# Lấy public IP của bạn
curl ifconfig.me

# Hoặc
curl ipinfo.io/ip
```

Lưu lại IP này, ví dụ: `123.45.67.89`

### **Bước 2: Cấu hình Router (Port Forwarding)**

1. **Đăng nhập vào Router:**
   - Thường là: `http://192.168.1.1` hoặc `http://192.168.0.1`
   - Username/Password: thường là `admin/admin` hoặc xem dưới router

2. **Tìm mục Port Forwarding:**
   - Có thể gọi là: "Virtual Server", "NAT", "Port Mapping"

3. **Thêm rule mới:**
   ```
   Service Name: PostgreSQL
   External Port: 5499
   Internal IP: 222.252.23.248
   Internal Port: 5499
   Protocol: TCP
   ```

4. **Save và Apply**

### **Bước 3: Cấu hình PostgreSQL**

#### **3.1. Cho phép remote connections**

```bash
# SSH vào máy chạy PostgreSQL
ssh user@222.252.23.248

# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf
# Hoặc tìm file: sudo find / -name postgresql.conf 2>/dev/null
```

**Thêm/sửa dòng:**
```conf
listen_addresses = '*'
```

#### **3.2. Cấu hình authentication**

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

**Thêm dòng này (CHÚ Ý: Chỉ cho phép Vercel IPs):**
```conf
# Allow connections from Vercel
host    all    all    0.0.0.0/0    md5
```

**⚠️ BẢO MẬT HƠN:** Chỉ cho phép Vercel IPs (xem danh sách bên dưới)

#### **3.3. Restart PostgreSQL**

```bash
sudo systemctl restart postgresql
# Hoặc
sudo service postgresql restart
```

### **Bước 4: Test Connection từ Internet**

```bash
# Test từ máy khác (không phải local network)
psql -h [YOUR-PUBLIC-IP] -p 5499 -U postgres -d Ninh96

# Hoặc dùng telnet
telnet [YOUR-PUBLIC-IP] 5499
```

Nếu kết nối được → **Thành công!** ✅

### **Bước 5: Cấu hình Firewall (Quan trọng!)**

#### **5.1. Nếu dùng UFW (Ubuntu):**

```bash
# Mở port 5499
sudo ufw allow 5499/tcp

# Hoặc chỉ cho phép Vercel IPs (an toàn hơn)
sudo ufw allow from 76.76.21.0/24 to any port 5499
sudo ufw allow from 76.223.126.0/24 to any port 5499
```

#### **5.2. Nếu dùng firewalld (CentOS/RHEL):**

```bash
sudo firewall-cmd --permanent --add-port=5499/tcp
sudo firewall-cmd --reload
```

### **Bước 6: Set Environment Variables trên Vercel**

1. Truy cập: https://vercel.com/hksdtps-projects/thuvienanh
2. Settings > Environment Variables
3. Thêm:

```env
DATABASE_URL=postgresql://postgres:Demo1234@[YOUR-PUBLIC-IP]:5499/Ninh96
POSTGRES_HOST=[YOUR-PUBLIC-IP]
POSTGRES_PORT=5499
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=Ninh96
```

4. Chọn **All Environments**
5. Save

### **Bước 7: Redeploy Vercel**

```bash
# Trigger redeploy từ Vercel Dashboard
# Hoặc push code mới
git commit --allow-empty -m "trigger redeploy"
git push
```

### **⚠️ RỦI RO BẢO MẬT:**

- ❌ Database exposed ra internet
- ❌ Có thể bị brute force attack
- ❌ Cần password mạnh
- ❌ Nên enable SSL/TLS

### **🔒 TĂNG CƯỜNG BẢO MẬT:**

#### **1. Chỉ cho phép Vercel IPs:**

Vercel sử dụng AWS IPs, danh sách đầy đủ tại:
https://vercel.com/docs/concepts/edge-network/regions

**Một số IP ranges phổ biến:**
```
76.76.21.0/24
76.223.126.0/24
```

**Cấu hình pg_hba.conf:**
```conf
# Chỉ cho phép Vercel IPs
host    all    all    76.76.21.0/24      md5
host    all    all    76.223.126.0/24    md5
```

#### **2. Đổi password mạnh:**

```sql
-- Connect vào PostgreSQL
psql -U postgres

-- Đổi password
ALTER USER postgres WITH PASSWORD 'NewStrongPassword123!@#';
```

#### **3. Enable SSL/TLS:**

```bash
# Generate self-signed certificate
sudo openssl req -new -x509 -days 365 -nodes -text \
  -out /etc/postgresql/15/main/server.crt \
  -keyout /etc/postgresql/15/main/server.key

# Set permissions
sudo chmod 600 /etc/postgresql/15/main/server.key
sudo chown postgres:postgres /etc/postgresql/15/main/server.*
```

**Edit postgresql.conf:**
```conf
ssl = on
ssl_cert_file = '/etc/postgresql/15/main/server.crt'
ssl_key_file = '/etc/postgresql/15/main/server.key'
```

**Restart PostgreSQL:**
```bash
sudo systemctl restart postgresql
```

**Update connection string:**
```env
DATABASE_URL=postgresql://postgres:Demo1234@[YOUR-PUBLIC-IP]:5499/Ninh96?sslmode=require
```

---

## 🌐 **Option 2: Sử dụng Cloudflare Tunnel (Khuyến nghị)** ⭐⭐⭐⭐⭐

Đây là cách **AN TOÀN NHẤT** và **MIỄN PHÍ**!

### **Ưu điểm:**
- ✅ Không cần expose port ra internet
- ✅ Không cần public IP tĩnh
- ✅ Có SSL/TLS tự động
- ✅ Có DDoS protection
- ✅ Hoàn toàn miễn phí

### **Bước 1: Cài đặt Cloudflared**

```bash
# Ubuntu/Debian
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# macOS
brew install cloudflare/cloudflare/cloudflared

# Windows
# Download từ: https://github.com/cloudflare/cloudflared/releases
```

### **Bước 2: Login Cloudflare**

```bash
cloudflared tunnel login
```

Trình duyệt sẽ mở, đăng nhập Cloudflare account (tạo miễn phí nếu chưa có)

### **Bước 3: Tạo Tunnel**

```bash
# Tạo tunnel
cloudflared tunnel create thuvienanh-db

# Lưu lại Tunnel ID (ví dụ: abc123-def456-ghi789)
```

### **Bước 4: Cấu hình Tunnel**

```bash
# Tạo config file
nano ~/.cloudflared/config.yml
```

**Nội dung:**
```yaml
tunnel: abc123-def456-ghi789  # Thay bằng Tunnel ID của bạn
credentials-file: /home/user/.cloudflared/abc123-def456-ghi789.json

ingress:
  - hostname: db.yourdomain.com  # Thay bằng domain của bạn
    service: tcp://222.252.23.248:5499
  - service: http_status:404
```

### **Bước 5: Cấu hình DNS**

```bash
# Tạo DNS record
cloudflared tunnel route dns thuvienanh-db db.yourdomain.com
```

### **Bước 6: Chạy Tunnel**

```bash
# Test
cloudflared tunnel run thuvienanh-db

# Chạy như service (background)
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### **Bước 7: Set Environment Variables trên Vercel**

```env
DATABASE_URL=postgresql://postgres:Demo1234@db.yourdomain.com:5499/Ninh96
POSTGRES_HOST=db.yourdomain.com
POSTGRES_PORT=5499
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=Ninh96
```

---

## 🔗 **Option 3: Sử dụng Ngrok (Nhanh nhất, có giới hạn)**

### **Ưu điểm:**
- ✅ Setup cực nhanh (2 phút)
- ✅ Không cần cấu hình router
- ✅ Có SSL tự động

### **Nhược điểm:**
- ❌ Free tier: URL thay đổi mỗi lần restart
- ❌ Có giới hạn bandwidth
- ❌ Paid plan: $8/tháng cho static domain

### **Bước 1: Cài đặt Ngrok**

```bash
# Download từ: https://ngrok.com/download
# Hoặc
brew install ngrok  # macOS
snap install ngrok  # Linux
```

### **Bước 2: Đăng ký & Get Auth Token**

1. Đăng ký tại: https://dashboard.ngrok.com/signup
2. Copy auth token
3. Setup:

```bash
ngrok config add-authtoken [YOUR-AUTH-TOKEN]
```

### **Bước 3: Expose PostgreSQL**

```bash
# Expose port 5499
ngrok tcp 222.252.23.248:5499
```

**Output:**
```
Forwarding  tcp://0.tcp.ngrok.io:12345 -> 222.252.23.248:5499
```

### **Bước 4: Set Environment Variables**

```env
DATABASE_URL=postgresql://postgres:Demo1234@0.tcp.ngrok.io:12345/Ninh96
POSTGRES_HOST=0.tcp.ngrok.io
POSTGRES_PORT=12345
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=Ninh96
```

### **⚠️ Lưu ý:**
- URL và port sẽ thay đổi mỗi lần restart ngrok
- Cần update environment variables trên Vercel mỗi lần restart
- Nên upgrade lên paid plan ($8/tháng) để có static domain

---

## 📊 **So Sánh Các Giải Pháp**

| Tiêu chí | Public IP | Cloudflare Tunnel | Ngrok |
|----------|-----------|-------------------|-------|
| **Chi phí** | Miễn phí | Miễn phí | $0-8/tháng |
| **Bảo mật** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Độ khó** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **Ổn định** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **SSL/TLS** | Cần setup | Tự động | Tự động |
| **Static URL** | ✅ | ✅ | ❌ (free) |

---

## 💡 **Khuyến Nghị**

### **Cho Production:**
1. ✅ **Cloudflare Tunnel** (an toàn nhất, miễn phí)
2. ✅ Public IP + SSL + Firewall rules (nếu có kinh nghiệm)

### **Cho Testing:**
1. ✅ **Ngrok** (nhanh nhất, dễ nhất)
2. ✅ Public IP (đơn giản)

### **KHÔNG nên:**
- ❌ Expose database không có SSL
- ❌ Dùng password yếu
- ❌ Không có firewall rules

---

## 🐛 **Troubleshooting**

### **Lỗi: "Connection timeout"**
```bash
# Kiểm tra port có mở không
telnet [YOUR-IP] 5499

# Kiểm tra firewall
sudo ufw status
sudo iptables -L -n | grep 5499
```

### **Lỗi: "Connection refused"**
```bash
# Kiểm tra PostgreSQL có listen không
sudo netstat -tlnp | grep 5499

# Kiểm tra postgresql.conf
grep listen_addresses /etc/postgresql/*/main/postgresql.conf
```

### **Lỗi: "Authentication failed"**
```bash
# Kiểm tra pg_hba.conf
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -v "^#"

# Test local connection
psql -h localhost -U postgres -d Ninh96
```

---

## 📝 **Checklist**

- [ ] Lấy public IP
- [ ] Cấu hình port forwarding trên router
- [ ] Sửa postgresql.conf (listen_addresses)
- [ ] Sửa pg_hba.conf (allow remote)
- [ ] Restart PostgreSQL
- [ ] Cấu hình firewall
- [ ] Test connection từ internet
- [ ] Enable SSL/TLS (khuyến nghị)
- [ ] Set environment variables trên Vercel
- [ ] Redeploy Vercel
- [ ] Test `/api/health/db`

---

## 🆘 **Cần Hỗ Trợ?**

Nếu gặp vấn đề, cung cấp:
1. Output của: `sudo netstat -tlnp | grep 5499`
2. Output của: `curl ifconfig.me`
3. Content của: `pg_hba.conf`
4. PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`

