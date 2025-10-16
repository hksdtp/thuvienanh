#!/bin/bash

# Install Docker on Windows from Mac via SSH
# Usage: ./install-docker-on-windows.sh

WINDOWS_IP="100.101.50.87"
WINDOWS_USER="Marketingpc"
WINDOWS_PASS="haininh1"

echo "🐳 Installing Docker on Windows..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Copy PowerShell script to Windows
echo "📤 Step 1: Copying installation script to Windows..."
sshpass -p "$WINDOWS_PASS" scp -o StrictHostKeyChecking=no install-docker-windows.ps1 $WINDOWS_USER@$WINDOWS_IP:C:/Users/$WINDOWS_USER/Downloads/

if [ $? -eq 0 ]; then
    echo "✅ Script copied successfully"
else
    echo "❌ Failed to copy script"
    exit 1
fi

# Step 2: Run installation script on Windows
echo ""
echo "📦 Step 2: Running installation on Windows..."
echo "⚠️  This will take 10-15 minutes. Please wait..."
echo ""

sshpass -p "$WINDOWS_PASS" ssh -o StrictHostKeyChecking=no $WINDOWS_USER@$WINDOWS_IP "powershell -Command \"Start-Process powershell -Verb RunAs -ArgumentList '-ExecutionPolicy Bypass -File C:/Users/$WINDOWS_USER/Downloads/install-docker-windows.ps1' -Wait\""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ⚠️  RESTART Windows computer"
echo "2. After restart, Docker Desktop will start automatically"
echo "3. Accept Docker Desktop Service Agreement"
echo "4. Wait for Docker to finish starting"
echo "5. Verify installation:"
echo "   ssh-win \"docker --version\""
echo ""

