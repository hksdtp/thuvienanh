#!/bin/bash

# Setup SSH Config để dễ dàng kết nối

echo "🔧 Tạo SSH config..."

# Tạo SSH config
cat > ~/.ssh/config << 'EOF'
Host windows
    HostName 100.101.50.87
    User Marketingpc
    IdentityFile ~/.ssh/id_ed25519
    PreferredAuthentications publickey,password
    PubkeyAuthentication yes
    PasswordAuthentication yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

Host marketingpc
    HostName 100.101.50.87
    User Marketingpc
    IdentityFile ~/.ssh/id_ed25519
    PreferredAuthentications publickey,password
    PubkeyAuthentication yes
    PasswordAuthentication yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF

chmod 600 ~/.ssh/config

echo "✅ Đã tạo SSH config"
echo ""
echo "Giờ bạn có thể SSH bằng:"
echo "  ssh windows"
echo "  ssh marketingpc"
echo ""
echo "Thay vì:"
echo "  ssh Marketingpc@100.101.50.87"

