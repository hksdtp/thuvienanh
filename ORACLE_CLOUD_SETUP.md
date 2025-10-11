# 🚀 Oracle Cloud Free Tier - Setup Guide

## ⭐ Tại sao chọn Oracle Cloud Free?

- ✅ **MIỄN PHÍ VĨNH VIỄN** (Always Free)
- ✅ **4 ARM CPU cores + 24GB RAM** (Cực mạnh!)
- ✅ **200GB Storage**
- ✅ **10TB bandwidth/tháng**
- ✅ **2 VMs miễn phí**
- ✅ Performance tương đương VPS $50-100/tháng

## 📋 Bước 1: Đăng ký Oracle Cloud

### 1.1 Tạo tài khoản
1. Truy cập: https://signup.cloud.oracle.com/
2. Chọn **Country**: Vietnam (hoặc country của bạn)
3. Nhập thông tin:
   - Email thật (cần verify)
   - Phone number thật (nhận OTP)
   - Company name: có thể điền tên cá nhân

### 1.2 Verify Credit Card
- **QUAN TRỌNG**: Cần credit/debit card để verify
- **KHÔNG BỊ CHARGE** (chỉ hold $1 để verify)
- Có thể dùng:
  - Visa/Mastercard debit của VN banks
  - Virtual card từ Wise, Payoneer
  - Prepaid card

### 1.3 Chọn Home Region
- **Singapore** (gần VN nhất, ping thấp)
- **Japan Central (Osaka)** (alternative)
- **LƯU Ý**: Không thể đổi region sau này!

## 📦 Bước 2: Tạo VM Instance

### 2.1 Vào Compute > Instances
1. Click **"Create Instance"**
2. **Name**: `thuvienanh-prod`

### 2.2 Chọn Image và Shape
**QUAN TRỌNG: Chọn đúng để được FREE**

1. **Image**: 
   - Ubuntu 22.04 (Recommended)
   - Oracle Linux 8 (Alternative)

2. **Shape**: Click "Change shape"
   - Choose **"Ampere"** (ARM processor)
   - Select **VM.Standard.A1.Flex**
   - Configure:
     - OCPUs: **4** (max free)
     - Memory: **24 GB** (max free)
   - **Cost/month**: $0.00 ✅

### 2.3 Networking
1. **Virtual cloud network**: Keep default
2. **Subnet**: Keep default
3. **Public IP**: Assign public IPv4 address ✅

### 2.4 Add SSH keys
```bash
# Generate SSH key (trên máy local)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/oracle_cloud

# Copy public key
cat ~/.ssh/oracle_cloud.pub
```
Paste public key vào ô "SSH keys"

### 2.5 Boot volume
- Size: **50 GB** (free tier)
- Keep other defaults

### 2.6 Create Instance
- Click **"Create"**
- Đợi 2-3 phút để instance start

## 🔧 Bước 3: Configure Networking

### 3.1 Mở ports trong Security List
1. Go to **Networking > Virtual Cloud Networks**
2. Click vào VCN của bạn
3. Click **Security Lists** > Default Security List
4. **Add Ingress Rules**:

| Source | Protocol | Port | Description |
|--------|----------|------|-------------|
| 0.0.0.0/0 | TCP | 80 | HTTP |
| 0.0.0.0/0 | TCP | 443 | HTTPS |
| 0.0.0.0/0 | TCP | 3000 | App (optional) |

### 3.2 Configure iptables trên VM
```bash
# SSH vào instance
ssh -i ~/.ssh/oracle_cloud ubuntu@<public-ip>

# Mở ports trong iptables
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT

# Save iptables rules
sudo netfilter-persistent save
```

## 🚀 Bước 4: Deploy Application

### 4.1 SSH vào instance
```bash
ssh -i ~/.ssh/oracle_cloud ubuntu@<public-ip>
```

### 4.2 Run deployment script
```bash
# Quick deploy
curl -o- https://raw.githubusercontent.com/yourusername/thuvienanh/main/scripts/deploy-oracle.sh | bash

# Or manual deploy
git clone https://github.com/yourusername/thuvienanh.git
cd thuvienanh
chmod +x scripts/deploy-oracle.sh
./scripts/deploy-oracle.sh
```

## 🌐 Bước 5: Setup Domain (Optional)

### 5.1 Point domain to Oracle IP
Trong DNS settings của domain:
```
A Record: @ -> <oracle-public-ip>
A Record: www -> <oracle-public-ip>
```

### 5.2 Setup SSL với Let's Encrypt
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📊 Monitoring & Management

### Check application status
```bash
pm2 status
pm2 logs
pm2 monit
```

### Update application
```bash
cd ~/thuvienanh
git pull origin main
npm install
npm run build
pm2 restart all
```

### Backup database
```bash
pg_dump -U thuvienanh thuvienanh_prod > backup_$(date +%Y%m%d).sql
```

## ⚠️ Quan trọng: Giữ Account Active

Oracle có thể **reclaim resources** nếu không sử dụng!

**Để tránh bị xóa:**
1. ✅ Login Oracle Cloud console mỗi tháng
2. ✅ Keep CPU usage > 10% (app running)
3. ✅ Generate some network traffic
4. ✅ Don't let instance idle > 7 days

**Auto keep-alive script:**
```bash
# Add to crontab
crontab -e

# Run every 6 hours
0 */6 * * * curl http://localhost:3000 > /dev/null 2>&1
```

## 🆘 Troubleshooting

### Cannot create ARM instance
- ARM instances rất popular, có thể hết quota
- **Solution**: 
  1. Thử different availability domain
  2. Thử vào các giờ ít người (2-6 AM)
  3. Dùng script auto-retry:

```bash
#!/bin/bash
# Auto retry create instance
while true; do
    oci compute instance launch \
        --availability-domain <AD-NAME> \
        --compartment-id <COMPARTMENT-ID> \
        --shape VM.Standard.A1.Flex \
        --shape-config '{"ocpus":4,"memory_in_gbs":24}' \
        --image-id <IMAGE-ID> \
        --subnet-id <SUBNET-ID> \
        --display-name thuvienanh-prod
    
    if [ $? -eq 0 ]; then
        echo "Instance created!"
        break
    fi
    
    echo "Failed, retrying in 5 minutes..."
    sleep 300
done
```

### SSH connection refused
```bash
# Check Security List rules
# Check iptables on instance
sudo iptables -L -n

# Reset iptables if needed
sudo iptables -F
sudo iptables -X
sudo iptables -t nat -F
sudo iptables -t nat -X
sudo iptables -t mangle -F
sudo iptables -t mangle -X
```

### Application not accessible
1. Check PM2: `pm2 status`
2. Check Nginx: `sudo systemctl status nginx`
3. Check logs: `pm2 logs`
4. Check firewall: `sudo ufw status`

## 📌 Tips & Best Practices

1. **Backup thường xuyên**
   - Setup automated backups
   - Download backups to local

2. **Monitor resources**
   ```bash
   # Install monitoring
   sudo apt install htop
   htop
   ```

3. **Setup alerts**
   - Use Oracle Cloud Monitoring
   - Setup email alerts

4. **Security**
   - Change default passwords
   - Setup fail2ban
   - Regular updates: `sudo apt update && sudo apt upgrade`

5. **Performance tuning**
   ```bash
   # Optimize for ARM
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

## 🎉 Complete!

Bạn đã có một **Production Server MIỄN PHÍ** với specs khủng:
- 4 ARM CPU cores
- 24GB RAM  
- 200GB storage
- 10TB bandwidth

**Tương đương VPS $50-100/tháng nhưng MIỄN PHÍ VĨNH VIỄN!** 🚀

---

**Need help?** Check logs và status:
```bash
pm2 logs
pm2 status
systemctl status nginx
tail -f /var/log/nginx/error.log
```
