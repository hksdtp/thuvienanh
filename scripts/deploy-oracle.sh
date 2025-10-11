#!/bin/bash

# Oracle Cloud Free Tier Deployment Script
# For Ubuntu 22.04 ARM Instance (4 OCPU, 24GB RAM)

set -e

echo "================================================"
echo "   THƯ VIỆN ẢNH - ORACLE CLOUD DEPLOYMENT"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${YELLOW}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Update system
print_status "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y
print_success "System updated"

# Install dependencies
print_status "📦 Installing dependencies..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    postgresql \
    postgresql-contrib \
    ufw \
    certbot \
    python3-certbot-nginx

print_success "Dependencies installed"

# Install Node.js 18 LTS
print_status "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
print_success "Node.js $(node --version) installed"

# Install PM2
print_status "📦 Installing PM2..."
sudo npm install -g pm2
print_success "PM2 installed"

# Install Docker (optional but recommended)
print_status "📦 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
print_success "Docker installed"

# Install Docker Compose
print_status "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
print_success "Docker Compose installed"

# Configure PostgreSQL
print_status "🗄️ Configuring PostgreSQL..."
sudo -u postgres psql <<EOF
CREATE USER thuvienanh WITH PASSWORD 'Demo1234';
CREATE DATABASE thuvienanh_prod OWNER thuvienanh;
GRANT ALL PRIVILEGES ON DATABASE thuvienanh_prod TO thuvienanh;
EOF
print_success "PostgreSQL configured"

# Configure firewall
print_status "🔥 Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable
print_success "Firewall configured"

# Clone application
print_status "📥 Cloning application..."
cd /home/ubuntu
if [ -d "thuvienanh" ]; then
    cd thuvienanh
    git pull origin main
else
    git clone https://github.com/yourusername/thuvienanh.git
    cd thuvienanh
fi
print_success "Application cloned"

# Create .env file
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

# Synology NAS (update with your values)
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
print_success "Environment configured"

# Install dependencies and build
print_status "📦 Installing application dependencies..."
npm install
print_success "Dependencies installed"

print_status "🔨 Building application..."
npm run build
print_success "Application built"

# Setup PM2
print_status "⚙️ Setting up PM2..."
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'thuvienanh',
    script: 'npm',
    args: 'start',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
print_success "PM2 configured"

# Configure Nginx
print_status "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/thuvienanh > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/thuvienanh /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
print_success "Nginx configured"

# Get public IP
PUBLIC_IP=$(curl -s https://api.ipify.org)

# Create update script
print_status "📝 Creating update script..."
cat > update.sh <<'EOF'
#!/bin/bash
cd /home/ubuntu/thuvienanh
git pull origin main
npm install
npm run build
pm2 restart all
echo "Update completed!"
EOF
chmod +x update.sh
print_success "Update script created"

# Summary
echo ""
echo "================================================"
echo -e "${GREEN}     ✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo "================================================"
echo ""
echo -e "${YELLOW}📊 Service Status:${NC}"
pm2 status
echo ""
echo -e "${YELLOW}🌐 Access URLs:${NC}"
echo -e "  Public:    ${GREEN}http://${PUBLIC_IP}${NC}"
echo -e "  Local:     ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}🔧 Management Commands:${NC}"
echo "  View logs:        pm2 logs"
echo "  Restart app:      pm2 restart all"
echo "  Monitor:          pm2 monit"
echo "  Update app:       ./update.sh"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Update DNS records to point to: ${PUBLIC_IP}"
echo "2. Setup SSL certificate:"
echo "   sudo certbot --nginx -d your-domain.com"
echo "3. Configure environment variables in .env.production"
echo ""
echo -e "${GREEN}Your app is now running in production!${NC}"
echo ""

# Optional: Setup SSL if domain is provided
read -p "Do you have a domain name to configure SSL? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your domain name: " DOMAIN
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    echo -e "${GREEN}✅ SSL certificate configured for $DOMAIN${NC}"
fi
