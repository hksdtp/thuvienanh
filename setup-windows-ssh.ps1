# ============================================
# Setup OpenSSH Server on Windows
# ============================================
# Chạy script này trên Windows Server (PowerShell as Administrator)
# ============================================

Write-Host "========================================" -ForegroundColor Blue
Write-Host "🔧 Setup OpenSSH Server on Windows" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Step 1: Check if OpenSSH Server is installed
Write-Host "[1/5] Checking OpenSSH Server..." -ForegroundColor Yellow
$sshServer = Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'

if ($sshServer.State -eq "Installed") {
    Write-Host "✅ OpenSSH Server is already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Installing OpenSSH Server..." -ForegroundColor Yellow
    Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
    Write-Host "✅ OpenSSH Server installed" -ForegroundColor Green
}

Write-Host ""

# Step 2: Start SSH service
Write-Host "[2/5] Starting SSH service..." -ForegroundColor Yellow
Start-Service sshd
Write-Host "✅ SSH service started" -ForegroundColor Green
Write-Host ""

# Step 3: Set SSH service to start automatically
Write-Host "[3/5] Setting SSH service to auto-start..." -ForegroundColor Yellow
Set-Service -Name sshd -StartupType 'Automatic'
Write-Host "✅ SSH service set to auto-start" -ForegroundColor Green
Write-Host ""

# Step 4: Configure firewall
Write-Host "[4/5] Configuring Windows Firewall..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue

if ($firewallRule) {
    Write-Host "✅ Firewall rule already exists" -ForegroundColor Green
} else {
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
    Write-Host "✅ Firewall rule created" -ForegroundColor Green
}

Write-Host ""

# Step 5: Test SSH service
Write-Host "[5/5] Testing SSH service..." -ForegroundColor Yellow
$sshStatus = Get-Service sshd

if ($sshStatus.Status -eq "Running") {
    Write-Host "✅ SSH service is running" -ForegroundColor Green
} else {
    Write-Host "❌ SSH service is not running" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ OpenSSH Server Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Service Status:" -ForegroundColor Cyan
Get-Service sshd | Format-Table -AutoSize
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test SSH from Mac:" -ForegroundColor White
Write-Host "   ssh Administrator@100.112.44.73" -ForegroundColor Gray
Write-Host ""
Write-Host "2. If connection fails, check:" -ForegroundColor White
Write-Host "   - Windows Firewall settings" -ForegroundColor Gray
Write-Host "   - Tailscale is running" -ForegroundColor Gray
Write-Host "   - Administrator password is correct" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test SSH command:" -ForegroundColor White
Write-Host "   ssh Administrator@100.112.44.73 'echo OK'" -ForegroundColor Gray
Write-Host ""

