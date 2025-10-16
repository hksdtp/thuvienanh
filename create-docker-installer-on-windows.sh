#!/bin/bash

# Tạo script cài Docker trực tiếp trên Windows

WINDOWS_IP="100.101.50.87"
WINDOWS_USER="Marketingpc"
WINDOWS_PASS="haininh1"

echo "🐳 Tạo Docker installer script trên Windows..."

# Tạo script PowerShell trên Windows
sshpass -p "$WINDOWS_PASS" ssh -o StrictHostKeyChecking=no $WINDOWS_USER@$WINDOWS_IP "powershell -Command \"
Write-Host '🐳 Docker Installation Script' -ForegroundColor Cyan
Write-Host 'Saving to D:\\Ninh\\install-docker.ps1'

\\\$script = @'
# Docker Desktop Installer for Windows
Write-Host '🐳 Installing Docker Desktop...' -ForegroundColor Cyan

# Download Docker Desktop
\\\$url = 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe'
\\\$output = 'D:\\Ninh\\DockerDesktopInstaller.exe'

Write-Host 'Downloading Docker Desktop...'
Invoke-WebRequest -Uri \\\$url -OutFile \\\$output -UseBasicParsing

Write-Host 'Download complete!'
Write-Host ''
Write-Host 'To install Docker Desktop:'
Write-Host '1. Right-click PowerShell and Run as Administrator'
Write-Host '2. Run: D:\\Ninh\\DockerDesktopInstaller.exe install --quiet --accept-license'
Write-Host '3. Restart your computer'
'@

\\\$script | Out-File -FilePath 'D:\\Ninh\\install-docker.ps1' -Encoding UTF8

Write-Host '✅ Script created at D:\\Ninh\\install-docker.ps1'
Write-Host ''
Write-Host 'To run the script:'
Write-Host '  cd D:\\Ninh'
Write-Host '  .\\install-docker.ps1'
\""

echo ""
echo "✅ Script đã được tạo trên Windows tại: D:\Ninh\install-docker.ps1"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 HƯỚNG DẪN CÀI ĐẶT:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Trên máy Windows, mở PowerShell và chạy:"
echo ""
echo "  cd D:\\Ninh"
echo "  .\\install-docker.ps1"
echo ""
echo "Hoặc SSH vào và chạy:"
echo ""
echo "  ssh-win"
echo "  cd D:\\Ninh"
echo "  powershell -File install-docker.ps1"
echo ""

