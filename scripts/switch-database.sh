#!/bin/bash

# Script chuyển đổi giữa database remote và Tailscale
# Sử dụng để dễ dàng switch giữa các môi trường

echo "🔄 Database Switcher"
echo "==================="
echo "1. Remote Server (222.252.23.248) - Backup/Production"
echo "2. Tailscale PC Windows (100.101.50.87) - Development"
echo "3. Show current config"
echo ""

read -p "Chọn database (1/2/3): " choice

case $choice in
  1)
    echo "🌐 Switching to Remote Server..."
    cat > .env.temp << 'EOF'
# Database Configuration - Remote Server (PRODUCTION BACKUP)
# ✅ Đã migrate data từ local sang remote
DATABASE_URL=postgresql://postgres:Demo1234@222.252.23.248:5499/Ninh96
POSTGRES_HOST=222.252.23.248
POSTGRES_PORT=5499
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=Ninh96

# Database Configuration - Tailscale Network (DISABLED)
# 🔗 Kết nối đến PC Windows qua Tailscale
# 📍 PC Windows Tailscale IP: 100.101.50.87
# 🏢 Hostname: marketingpc
# DATABASE_URL=postgresql://postgres:Demo1234@100.101.50.87:5499/fabric_library
# POSTGRES_HOST=100.101.50.87
# POSTGRES_PORT=5499
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=Demo1234
# POSTGRES_DB=fabric_library
EOF
    ;;
  2)
    echo "🔗 Switching to Tailscale PC Windows..."
    cat > .env.temp << 'EOF'
# Database Configuration - Tailscale Network (DEVELOPMENT)
# 🔗 Kết nối đến PC Windows qua Tailscale
# 📍 PC Windows Tailscale IP: 100.101.50.87
# 🏢 Hostname: marketingpc
DATABASE_URL=postgresql://postgres:Demo1234@100.101.50.87:5499/fabric_library
POSTGRES_HOST=100.101.50.87
POSTGRES_PORT=5499
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234
POSTGRES_DB=fabric_library

# Database Configuration - Remote Server (DISABLED)
# ✅ Backup server
# DATABASE_URL=postgresql://postgres:Demo1234@222.252.23.248:5499/Ninh96
# POSTGRES_HOST=222.252.23.248
# POSTGRES_PORT=5499
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=Demo1234
# POSTGRES_DB=Ninh96
EOF
    ;;
  3)
    echo "📋 Current database configuration:"
    echo "=================================="
    grep -E "^POSTGRES_HOST|^DATABASE_URL" .env | head -2
    echo ""
    echo "🔗 Tailscale status:"
    tailscale status
    exit 0
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Copy rest of .env (non-database config)
tail -n +20 .env >> .env.temp

# Replace .env
mv .env.temp .env

echo "✅ Database configuration updated!"
echo "📁 Backup saved as .env.backup.$(date +%Y%m%d_%H%M%S)"
echo ""
echo "🔄 Restart your web app to apply changes:"
echo "   npm run dev"
echo ""
echo "🧪 Test connection:"
echo "   ./scripts/test-tailscale-connection.sh"
