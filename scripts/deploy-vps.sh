#!/bin/bash

# Universal VPS Deployment Script
# Works on: Ubuntu 20.04/22.04, Debian 11/12
# For: DigitalOcean, Vultr, Linode, etc.

set -e

echo "================================================"
echo "   THƯ VIỆN ẢNH - VPS DEPLOYMENT"
echo "================================================"
echo ""

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    echo "Cannot detect OS version"
    exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Functions
print_status() {
    echo -e "${YELLOW}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo or login as root)"
    exit 1
fi

# Update system
print_status "📦 Updating system packages..."
apt-get update && apt-get upgrade -y
print_success "System updated"

# Install essential packages
print_status "📦 Installing essential packages..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    postgresql \
    postgresql-contrib \
    ufw \
    certbot \
    python3-certbot-nginx \
    htop \
    fail2ban

print_success "Essential packages installed"

# Install Node.js 18 LTS
print_status "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
print_success "Node.js $(node --version) installed"

# Install PM2
print_status "📦 Installing PM2..."
npm install -g pm2
print_success "PM2 installed"

# Create application user
print_status "👤 Creating application user..."
if ! id -u thuvienanh > /dev/null 2>&1; then
    useradd -m -s /bin/bash thuvienanh
    usermod -aG sudo thuvienanh
fi
print_success "Application user created"

# Setup PostgreSQL
print_status "🗄️ Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS thuvienanh_prod;
DROP USER IF EXISTS thuvienanh;
CREATE USER thuvienanh WITH PASSWORD 'Demo1234';
CREATE DATABASE thuvienanh_prod OWNER thuvienanh;
GRANT ALL PRIVILEGES ON DATABASE thuvienanh_prod TO thuvienanh;
EOF

# Configure PostgreSQL for better performance
cat >> /etc/postgresql/*/main/postgresql.conf <<EOF

# Performance Tuning
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
min_wal_size = 1GB
max_wal_size = 4GB
EOF

systemctl restart postgresql
print_success "PostgreSQL configured"

# Setup firewall
print_status "🔥 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "Firewall configured"

# Configure fail2ban for security
print_status "🔒 Configuring fail2ban..."
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl restart fail2ban
print_success "fail2ban configured"

# Clone application
print_status "📥 Cloning application..."
cd /home/thuvienanh

if [ -d "app" ]; then
    cd app
    git pull origin main
else
    # Try to clone, if fails use a placeholder
    if ! git clone https://github.com/yourusername/thuvienanh.git app 2>/dev/null; then
        print_error "Could not clone repository. Please update the repository URL."
        mkdir -p app
    fi
    cd app
fi

chown -R thuvienanh:thuvienanh /home/thuvienanh/app
print_success "Application cloned"

# Create environment file
print_status "📝 Creating environment configuration..."
cat > .env.production <<EOF
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://thuvienanh:Demo1234@localhost:5432/thuvienanh_prod
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=thuvienanh
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=thuvienanh_prod

# Synology NAS
SYNOLOGY_HOST=222.252.23.248
SYNOLOGY_PORT=6868
SYNOLOGY_USERNAME=your_synology_username
SYNOLOGY_PASSWORD=your_synology_password
SMB_HOST=222.252.23.248
SMB_PORT=445
SMB_USERNAME=your_smb_username
SMB_PASSWORD=your_smb_password
SMB_SHARE=marketing

# API
ALLOWED_ORIGIN=*
EOF

chown thuvienanh:thuvienanh .env.production
print_success "Environment configured"

# Install dependencies and build as application user
print_status "📦 Installing application dependencies..."
sudo -u thuvienanh npm install
print_success "Dependencies installed"

print_status "🔨 Building application..."
sudo -u thuvienanh npm run build
print_success "Application built"

# Setup PM2
print_status "⚙️ Setting up PM2..."
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'thuvienanh',
    script: 'npm',
    args: 'start',
    cwd: '/home/thuvienanh/app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/thuvienanh/app/logs/err.log',
    out_file: '/home/thuvienanh/app/logs/out.log',
    log_file: '/home/thuvienanh/app/logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
}
EOF

mkdir -p /home/thuvienanh/app/logs
chown -R thuvienanh:thuvienanh /home/thuvienanh/app

# Start application with PM2
sudo -u thuvienanh pm2 start ecosystem.config.js
sudo -u thuvienanh pm2 save

# Setup PM2 startup
pm2 startup systemd -u thuvienanh --hp /home/thuvienanh
systemctl enable pm2-thuvienanh
print_success "PM2 configured"

# Configure Nginx
print_status "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/thuvienanh <<'EOF'
upstream nodejs_backend {
    least_conn;
    server localhost:3000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    client_max_body_size 100M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
    
    # Static files caching
    location /_next/static {
        proxy_pass http://nodejs_backend;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # API endpoints
    location /api {
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
    
    # Main application
    location / {
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/thuvienanh /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
print_success "Nginx configured"

# Create swap file if RAM < 2GB
TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM" -lt 2048 ]; then
    print_status "💾 Creating swap file..."
    if [ ! -f /swapfile ]; then
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        print_success "2GB swap file created"
    fi
fi

# Setup automatic backups
print_status "💾 Setting up automatic backups..."
cat > /home/thuvienanh/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/home/thuvienanh/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD=Demo1234 pg_dump -U thuvienanh -h localhost thuvienanh_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /home/thuvienanh/backup.sh
chown thuvienanh:thuvienanh /home/thuvienanh/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -u thuvienanh -l 2>/dev/null; echo "0 2 * * * /home/thuvienanh/backup.sh") | crontab -u thuvienanh -
print_success "Automatic backups configured"

# Create update script
print_status "📝 Creating update script..."
cat > /home/thuvienanh/update.sh <<'EOF'
#!/bin/bash
cd /home/thuvienanh/app
git pull origin main
npm install
npm run build
pm2 restart all
echo "Update completed at $(date)"
EOF

chmod +x /home/thuvienanh/update.sh
chown thuvienanh:thuvienanh /home/thuvienanh/update.sh
print_success "Update script created"

# Get server information
PUBLIC_IP=$(curl -s https://api.ipify.org)
MEMORY=$(free -h | awk '/^Mem:/{print $2}')
CPU_COUNT=$(nproc)

# Create info file
cat > /home/thuvienanh/server-info.txt <<EOF
Server Information
==================
Public IP: $PUBLIC_IP
Memory: $MEMORY
CPU Cores: $CPU_COUNT
OS: $OS $VER
Node.js: $(node --version)
PostgreSQL: $(psql --version | head -n1)
Nginx: $(nginx -v 2>&1)

Application URLs
================
Public: http://$PUBLIC_IP
Local: http://localhost:3000

Management Commands
===================
View logs: sudo -u thuvienanh pm2 logs
Restart app: sudo -u thuvienanh pm2 restart all
Monitor: sudo -u thuvienanh pm2 monit
Update app: sudo -u thuvienanh /home/thuvienanh/update.sh
Backup now: sudo -u thuvienanh /home/thuvienanh/backup.sh
EOF

# Summary
echo ""
echo "================================================"
echo -e "${GREEN}     ✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo "================================================"
echo ""
echo -e "${YELLOW}📊 Server Information:${NC}"
echo "  OS:        $OS $VER"
echo "  CPU:       $CPU_COUNT cores"
echo "  Memory:    $MEMORY"
echo "  Node.js:   $(node --version)"
echo ""
echo -e "${YELLOW}🌐 Access URLs:${NC}"
echo -e "  Public:    ${GREEN}http://${PUBLIC_IP}${NC}"
echo -e "  Local:     ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}📊 Application Status:${NC}"
sudo -u thuvienanh pm2 status
echo ""
echo -e "${YELLOW}🔧 Management Commands:${NC}"
echo "  View logs:        sudo -u thuvienanh pm2 logs"
echo "  Restart app:      sudo -u thuvienanh pm2 restart all"
echo "  Monitor:          sudo -u thuvienanh pm2 monit"
echo "  Update app:       sudo -u thuvienanh /home/thuvienanh/update.sh"
echo "  Backup database:  sudo -u thuvienanh /home/thuvienanh/backup.sh"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Point your domain to: ${PUBLIC_IP}"
echo "2. Setup SSL certificate:"
echo "   certbot --nginx -d your-domain.com"
echo "3. Update environment variables in:"
echo "   /home/thuvienanh/app/.env.production"
echo ""
echo -e "${GREEN}Your application is now running in production!${NC}"
echo -e "${YELLOW}Server info saved to: /home/thuvienanh/server-info.txt${NC}"
echo ""

# Optional: Setup SSL
read -p "Do you have a domain name to configure SSL? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your domain name: " DOMAIN
    read -p "Enter your email: " EMAIL
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL
    echo -e "${GREEN}✅ SSL certificate configured for $DOMAIN${NC}"
fi

echo ""
print_success "Deployment complete! Your app is live at http://$PUBLIC_IP"
